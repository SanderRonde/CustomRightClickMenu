/// <reference path="../elements.d.ts" />
/// <reference path="../../../tools/definitions/tern.d.ts" />

namespace CRMAppElement {
	interface JQContextMenuObj {
		name: string;
		callback(): void;

		type?: 'checkbox';
		selected?: boolean;
		items?: {
			[key: number]: JQContextMenuItem
		};
	}

	type JQContextMenuItem = JQContextMenuObj | string;

	interface JQueryContextMenu extends JQueryStatic {
		contextMenu(settings: {
			selector: string;
			items: Array<JQContextMenuItem>;
		} | 'destroy'): void;
		bez(curve: Array<number>): string;
	}

	type VersionUpdateDialog = HTMLPaperDialogElement & {
		editor: CodeMirrorInstance;
	};

	type ScriptUpdatesToast = HTMLPaperToastElement & {
		index: number;
		scripts: Array<{
			name: string;
			oldVersion: string;
			newVersion: string;
		}>;
	};

	window.runOrAddAsCallback = function (toRun: Function, thisElement: HTMLElement, params: Array<any>): void {
		if (window.app.settings) {
			toRun.apply(thisElement, params);
		} else {
			window.app.addSettingsReadyCallback(toRun, thisElement, params);
		}
	};

	(() => {
		const animateExists = !!document.createElement('div').animate;
		const animatePolyFill = function (this: HTMLElement, properties:  Array<{
			[key: string]: any;
		}>, options: {
			duration?: number;
			easing?: string|'bez';
			fill?: 'forwards'|'backwards'|'both';
		}): Animation {
			if (!properties[1]) {
				return {
					play: function () { },
					reverse: function () { },
					effect: {
						target: this
					}
				};
			}

			const element = this;
			let direction: 'forwards' | 'backwards' = 'forwards';
			const returnVal: Animation = {
				play() {
					$(element).animate(properties[~~(direction === 'forwards')],
						(options && options.duration) || 500, function () {
							if (returnVal.onfinish) {
								returnVal.onfinish.apply({
									effect: {
										target: element
									}
								});
							}
						});
				},
				reverse(this: Animation) {
					direction = 'backwards';
					this.play();
				},
				effect: {
					target: this
				}
			};
			$(this).animate(properties[1], options.duration, function () {
				if (returnVal.onfinish) {
					returnVal.onfinish.apply({
						effect: {
							target: element
						}
					});
				}
			});
			return returnVal;
		};

		const animateImpl = animateExists ? 
			HTMLElement.prototype.animate : animatePolyFill;

		HTMLElement.prototype.animate = function(this: HTMLElement, properties:  Array<{
			[key: string]: any;
		}>, options: {
			duration?: number;
			easing?: string|'bez';
			fill?: 'forwards'|'backwards'|'both';
		}): Animation {
			if (options.easing === 'bez') {
				options.easing = 'cubic-bezier(0.215, 0.610, 0.355, 1.000)';
			}
			return animateImpl.apply(this, [properties, options]);
		}

		if (!animateExists) {
			(HTMLElement.prototype.animate as any).isJqueryFill = true;
		}
	})();

	const crmAppProperties: {
		settings: CRM.SettingsStorage;
		onSettingsReadyCallbacks: Array<{
			callback: Function;
			thisElement: HTMLElement;
			params: Array<any>;
		}>
		crmType: number;
		settingsJsonLength: number;
		globalExcludes: Array<string>;
		versionUpdateTab: number;
	} = {
		settings: {
			type: Object,
			notify: true
		},
		onSettingsReadyCallbacks: {
			type: Array,
			value: []
		},
		crmType: Number,
		settingsJsonLength: {
			type: Number,
			notify: true,
			value: 0
		},
		globalExcludes: {
			type: Array,
			notify: true,
			value: []
		},
		versionUpdateTab: {
			type: Number,
			notify: true,
			value: 0,
			observer: 'versionUpdateChanged'
		}
	} as any;

	interface PersistentData {
		lineSeperators: Array<{
			start: number;
			end: number;
		}>;
		script: string;
		lines: Array<string>;
		siblingExpr?: Tern.Expression;
		isObj?: boolean;
	}

	interface ChromePersistentData {
		persistent: {
			passes: number;
			diagnostic: boolean;
			lineSeperators: Array<{
				start: number;
				end: number;
			}>;
			script: string;
			lines: Array<string>;
		};
		parentExpressions: Array<Tern.Expression>;
		functionCall: Array<string>;
		isReturn: boolean;
		isValidReturn: boolean;
		returnExpr: Tern.Expression;
		returnName: string;
		expression: Tern.Expression;
	}

	type TransferOnErrorError = {
		from: {
			line: number;
		}
		to: {
			line: number;
		}
	};

	type TransferOnError = (position: TransferOnErrorError,
		passes: number) => void;

	type ScriptUpgradeErrorHandler = (oldScriptErrors: Array<CursorPosition>,
		newScriptErrors: Array<CursorPosition>, parseError: boolean) => void;

	interface Extensions<T> extends CRM.Extendable<T> { }

	interface AddedPermissionsTabContainer extends HTMLElement {
		tab: number;
		maxTabs: number;
	}

	interface CodeSettingsDialog extends HTMLPaperDialogElement {
		item?: CRM.ScriptNode | CRM.StylesheetNode;
	}

	class CA {
		static is = 'crm-app';

		static _log: Array<any> = [];

		/**
		 * Whether to show the item-edit-page
		 */
		static show: boolean = false;

		/**
		 * What item to show in the item-edit-page
		 */
		static item: CRM.Node = null;

		/**
		 * The item to show, if it is a script
		 */
		static scriptItem: CRM.ScriptNode;

		/**
		 * The item to show, if it is a stylesheet
		 */
		static stylesheetItem: CRM.StylesheetNode;

		/**
		 * The last-used unique ID
		 */
		private static latestId: number = -1;

		/**
		 * The value of the storage.local
		 */
		static storageLocal: CRM.StorageLocal;

		/**
		 * A copy of the storage.local to compare when calling upload
		 */
		private static storageLocalCopy: CRM.StorageLocal;

		/**
		 * A copy of the settings to compare when calling upload
		 */
		private static settingsCopy: CRM.SettingsStorage;

		/**
		 * The nodes in an object where the key is the ID and the
		 * value is the node
		 */
		private static nodesById: {
			[key: number]: CRM.Node
		} = {};

		/**
		 * The column index of the "shadow" node, if any
		 */
		static shadowStart: number;

		/**
		 * The global variables for the jsLint linter
		 */
		static jsLintGlobals: Array<string> = [];

		/**
		 * The tern server used for key bindings
		 */
		static ternServer: Tern.ServerInstance;

		/**
		 * The monaco theme style element
		 */
		static monacoStyleElement: HTMLStyleElement = null;

		static properties = crmAppProperties;

		static domListener(this: CrmApp, event: Polymer.CustomEvent) {
			const propKey = `data-on-${event.type}`;
			const listeners = this.listeners;

			let fnName: keyof typeof listeners;
			let pathIndex = 0;
			let currentElement = event.path[pathIndex];
			while (!('getAttribute' in currentElement) || !(fnName = (currentElement as Polymer.PolymerElement).getAttribute(propKey) as keyof typeof listeners) && pathIndex < event.path.length) {
				pathIndex++;
				currentElement = event.path[pathIndex];
			}

			if (fnName) {
				if (fnName !== 'prototype' && fnName !== 'parent' && listeners[fnName]) {
					const listener = this.listeners[fnName];
					(listener as (this: typeof listener,
						event: Polymer.CustomEvent,
						eDetail: Polymer.CustomEvent['detail']) => void).bind(listeners)(event, event.detail);
				} else {
					console.warn.apply(console, this._logf(`_createEventHandler`, `listener method ${fnName} not defined`));
				}
			} else {
				console.warn.apply(console, this._logf(`_createEventHandler`, `property ${propKey} not defined`));
			}
		}

		static _getPageTitle(): string {
			return location.href.indexOf('demo') > -1 ?
				'Demo, actual right-click menu does NOT work in demo' :
				'Custom Right-Click Menu';
		}

		static _getString(str: string | null): string {
			return str || '';
		}

		static _isOfType<T extends {
			type: string;
		}>(option: T, type: T['type']): boolean {
			return option.type === type;
		}

		private static _generateCodeOptionsArray<T extends CRM.Options | string>(this: CrmApp, settings: T): Array<{
			key: keyof T;
			value: T[keyof T]
		}> {
			if (typeof settings === 'string') {
				return [];
			}
			return Object.getOwnPropertyNames(settings).map((key: keyof T) => {
				return {
					key: key,
					value: JSON.parse(JSON.stringify(settings[key]))
				};
			});
		}

		static _isOnlyGlobalExclude(this: CrmApp): boolean {
			return this.globalExcludes.length === 1;
		};

		static _isVersionUpdateTabX(this: CrmApp, currentTab: number, desiredTab: number) {
			return currentTab === desiredTab;
		};

		private static _getUpdatedScriptString(this: CrmApp, updatedScript: {
			name: string;
			oldVersion: string;
			newVersion: string;
		}): string {
			if (!updatedScript) {
				return 'Please ignore';
			}
			return [
				'Node ',
				updatedScript.name,
				' was updated from version ',
				updatedScript.oldVersion,
				' to version ',
				updatedScript.newVersion
			].join('');
		};

		static _getPermissionDescription(this: CrmApp): (permission: string) => string {
			return this.templates.getPermissionDescription;
		};

		static _getNodeName(this: CrmApp, nodeId: number) {
			return window.app.nodesById[nodeId].name;
		};

		static _getNodeVersion(this: CrmApp, nodeId: number) {
			return (window.app.nodesById[nodeId].nodeInfo && window.app.nodesById[nodeId].nodeInfo.version) ||
				'1.0';
		};

		static _placeCommas(this: CrmApp, number: number): string {
			const split = this.reverseString(number.toString()).match(/[0-9]{1,3}/g);
			return this.reverseString(split.join(','));
		};

		static _getSettingsJsonLengthColor(this: CrmApp): string {
			let red;
			let green;
			if (this.settingsJsonLength <= 51200) {
				//Green to yellow, increase red
				green = 255;
				red = (this.settingsJsonLength / 51200) * 255;
			} else {
				//Yellow to red, reduce green
				red = 255;
				green = 255 - (((this.settingsJsonLength - 51200) / 51200) * 255);
			}

			//Darken a bit
			red = Math.floor(red * 0.7);
			green = Math.floor(green * 0.7);
			return 'color: rgb(' + red + ', ' + green + ', 0);';
		};

		private static findScriptsInSubtree(this: CrmApp, toFind: CRM.Node, container: Array<CRM.Node>) {
			if (toFind.type === 'script') {
				container.push(toFind);
			} else if (toFind.children) {
				for (let i = 0; i < toFind.children.length; i++) {
					this.findScriptsInSubtree(toFind.children[i], container);
				}
			}
		};

		private static runDialogsForImportedScripts(this: CrmApp, nodesToAdd: Array<CRM.Node>, dialogs: Array<CRM.ScriptNode>) {
			const _this = this;
			if (dialogs[0]) {
				const script = dialogs.splice(0, 1)[0];
				window.scriptEdit.openPermissionsDialog(script, function () {
					_this.runDialogsForImportedScripts(nodesToAdd, dialogs);
				});
			} else {
				this.addImportedNodes(nodesToAdd);
			}
		};

		private static addImportedNodes(this: CrmApp, nodesToAdd: Array<CRM.Node>): boolean {
			if (!nodesToAdd[0]) {
				return false;
			}
			const toAdd = nodesToAdd.splice(0, 1)[0];
			this.util.treeForEach(toAdd, (node) => {
				node.id = this.generateItemId();
				node.nodeInfo.source = 'local';
			});

			this.crm.add(toAdd);
			const scripts: Array<CRM.ScriptNode> = [];
			this.findScriptsInSubtree(toAdd, scripts);
			this.runDialogsForImportedScripts(nodesToAdd, scripts);
			return true;
		};

		private static reverseString(this: CrmApp, string: string): string {
			return string.split('').reverse().join('');
		};

		/**
		 * Shows the user a dialog and asks them to allow/deny those permissions
		 */
		private static requestPermissions(this: CrmApp, toRequest: Array<CRM.Permission>,
			force: boolean = false) {
			let i;
			let index;
			const _this = this;
			const allPermissions = this.templates.getPermissions();
			for (i = 0; i < toRequest.length; i++) {
				index = allPermissions.indexOf(toRequest[i]);
				if (index === -1) {
					toRequest.splice(index, 1);
					i--;
				} else {
					allPermissions.splice(index, 1);
				}
			}

			chrome.storage.local.set({
				requestPermissions: toRequest
			});

			if (toRequest.length > 0 || force) {
				chrome.permissions.getAll(function (allowed) {
					const requested: Array<{
						name: string;
						description: string;
						toggled: boolean;
					}> = [];
					for (i = 0; i < toRequest.length; i++) {
						requested.push({
							name: toRequest[i],
							description: _this.templates.getPermissionDescription(toRequest[i]),
							toggled: false
						});
					}

					const other: Array<{
						name: string;
						description: string;
						toggled: boolean;
					}> = [];
					for (i = 0; i < allPermissions.length; i++) {
						other.push({
							name: allPermissions[i],
							description: _this.templates.getPermissionDescription(allPermissions[i]),
							toggled: (allowed.permissions.indexOf(allPermissions[i]) > -1)
						});
					}
					const requestPermissionsOther = _this.$$('#requestPermissionsOther');

					let overlay: HTMLPaperDialogElement;

					function handler() {
						let el: HTMLElement & {
							animation?: {
								reverse(): void;
							}
						}, svg;
						overlay.style.maxHeight = 'initial!important';
						overlay.style.top = 'initial!important';
						overlay.removeEventListener('iron-overlay-opened', handler);
						$(window.app.util.querySlot(overlay, '.requestPermissionsShowBot')).off('click').on('click', function (this: HTMLElement) {
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
									easing: 'bez',
									fill: 'both'
								});
							}
						});
						$(_this.$$('#requestPermissionsShowOther')).off('click').on('click', function (this: HTMLElement) {
							const showHideSvg = this;
							const otherPermissions = $(this).parent().parent().parent().children('#requestPermissionsOther')[0];
							if (!otherPermissions.style.height || otherPermissions.style.height === '0px') {
								$(otherPermissions).animate({
									height: otherPermissions.scrollHeight + 'px'
								}, 350, function () {
									(showHideSvg.children[0] as HTMLElement).style.display = 'none';
									(showHideSvg.children[1] as HTMLElement).style.display = 'block';
								});
							} else {
								$(otherPermissions).animate({
									height: 0
								}, 350, function () {
									(showHideSvg.children[0] as HTMLElement).style.display = 'block';
									(showHideSvg.children[1] as HTMLElement).style.display = 'none';
								});
							}
						});

						let permission: string;
						$(_this.$$('.requestPermissionButton')).off('click').on('click', function (this: HTMLPaperCheckboxElement) {
							permission = this.previousElementSibling.previousElementSibling.textContent;
							const slider = this;
							if (this.checked) {
								try {
									chrome.permissions.request({
										permissions: [permission]
									}, function (accepted) {
										if (!accepted) {
											//The user didn't accept, don't pretend it's active when it's not, turn it off
											slider.checked = false;
										} else {
											//Accepted, remove from to-request permissions
											chrome.storage.local.get(function (e: CRM.StorageLocal) {
												const permissionsToRequest = e.requestPermissions;
												permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
												chrome.storage.local.set({
													requestPermissions: permissionsToRequest
												});
											});
										}
									});
								} catch (e) {
									//Accepted, remove from to-request permissions
									chrome.storage.local.get(function (e: CRM.StorageLocal) {
										const permissionsToRequest = e.requestPermissions;
										permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
										chrome.storage.local.set({
											requestPermissions: permissionsToRequest
										});
									});
								}
							} else {
								chrome.permissions.remove({
									permissions: [permission]
								}, function (removed) {
									if (!removed) {
										//It didn't get removed
										slider.checked = true;
									}
								});
							}
						});

						$(_this.$$('#requestPermissionsAcceptAll')).off('click').on('click', function () {
							chrome.permissions.request({
								permissions: toRequest
							}, function (accepted) {
								if (accepted) {
									chrome.storage.local.set({
										requestPermissions: []
									});
									$('.requestPermissionButton.required').each(function (this: HTMLPaperCheckboxElement) {
										this.checked = true;
									});
								}
							});
						});
					}

					const interval = window.setInterval(function () {
						try {
							const centerer = window.doc.requestPermissionsCenterer as CenterElement;
							overlay = window.app.util.querySlot(centerer)[0] as HTMLPaperDialogElement
							if (overlay.open) {
								window.clearInterval(interval);
								const innerOverlay = window.app.util.querySlot(overlay)[0] as HTMLElement;
								(innerOverlay.querySelector('#requestedPermissionsTemplate') as HTMLDomRepeatElement).items = requested;
								(innerOverlay.querySelector('#requestedPermissionsOtherTemplate') as HTMLDomRepeatElement).items = other;
								overlay.addEventListener('iron-overlay-opened', handler);
								setTimeout(function () {
									const requestedPermissionsCont = innerOverlay.querySelector('#requestedPermissionsCont');
									const requestedPermissionsAcceptAll = innerOverlay.querySelector('#requestPermissionsAcceptAll');
									const requestedPermissionsType = innerOverlay.querySelector('.requestPermissionsType');
									if (requested.length === 0) {
										requestedPermissionsCont.style.display = 'none';
										requestPermissionsOther.style.height = (31 * other.length) + 'px';
										requestedPermissionsAcceptAll.style.display = 'none';
										requestedPermissionsType.style.display = 'none';
									} else {
										requestedPermissionsCont.style.display = 'block';
										requestPermissionsOther.style.height = '0';
										requestedPermissionsAcceptAll.style.display = 'block';
										requestedPermissionsType.style.display = 'block';
									}
									overlay.open();
								}, 0);
							}
						} catch (e) {
							//Somehow the element doesn't exist yet
						}
					}, 100);
				});
			}
		};

		private static async transferCRMFromOld(this: CrmApp, openInNewTab: boolean, storageSource: {
			getItem(index: string | number): any;
		} = localStorage, method: SCRIPT_CONVERSION_TYPE = SCRIPT_CONVERSION_TYPE.BOTH): Promise<CRM.Tree> {
			return await this.transferFromOld.transferCRMFromOld(openInNewTab, storageSource, method);
		};

		static initCodeOptions(this: CrmApp, node: CRM.ScriptNode | CRM.StylesheetNode) {
			this.$.codeSettingsDialog.item = node;
			this.$.codeSettingsTitle.innerText = `Changing the options for ${node.name}`;

			this.$.codeSettingsRepeat.items = this._generateCodeOptionsArray(node.value.options);
			this.$.codeSettingsNoItems.if = this.$.codeSettingsRepeat.items.length === 0;
			this.async(() => {
				this.$.codeSettingsDialog.fit();
				Array.prototype.slice.apply(this.$.codeSettingsDialog.querySelectorAll('paper-dropdown-menu'))
					.forEach((el: HTMLPaperDropdownMenuElement) => {
						el.init();
					});
				this.$.codeSettingsDialog.open();
			}, 100);
		}

		static tryEditorLoaded(this: CrmApp, cm: CodeMirrorInstance) {
			cm.display.wrapper.classList.add('try-editor-codemirror');
			cm.refresh();
		};

		static versionUpdateChanged(this: CrmApp) {
			if (this._isVersionUpdateTabX(this.versionUpdateTab, 1)) {
				const versionUpdateDialog = this.$.versionUpdateDialog;
				if (!versionUpdateDialog.editor) {
					versionUpdateDialog.editor = window.CodeMirror(this.$.tryOutEditor, {
						lineNumbers: true,
						value: '//some javascript code\nvar body = document.getElementById(\'body\');\nbody.style.color = \'red\';\n\n',
						scrollbarStyle: 'simple',
						lineWrapping: true,
						mode: 'javascript',
						readOnly: false,
						foldGutter: true,
						theme: 'dark',
						indentUnit: window.app.settings.editor.tabSize,
						indentWithTabs: window.app.settings.editor.useTabs,
						gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
						lint: window.CodeMirror.lint.javascript,
						messageTryEditor: true,
						undoDepth: 500
					});
				}
			}
		};

		/**
		 * Generates an ID for a node
		 */
		static generateItemId(this: CrmApp) {
			this.latestId = this.latestId || 0;
			this.latestId++;

			if (this.settings) {
				this.settings.latestId = this.latestId;
				window.app.upload();
			}

			return this.latestId;
		};

		static toggleShrinkTitleRibbon(this: CrmApp) {
			const viewportHeight = window.innerHeight;
			const $settingsCont = $(this.$$('#settingsContainer'));
			if (window.app.storageLocal.shrinkTitleRibbon) {
				$(window.doc.editorTitleRibbon).animate({
					fontSize: '100%'
				}, 250);
				$(window.doc.editorCurrentScriptTitle).animate({
					paddingTop: '4px',
					paddingBottom: '4px'
				}, 250);
				$settingsCont.animate({
					height: viewportHeight - 50
				}, 250, function () {
					$settingsCont[0].style.height = 'calc(100vh - 66px)';
				});
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';

				window.doc.showHideToolsRibbonButton.classList.add('hidden');
			} else {
				$(window.doc.editorTitleRibbon).animate({
					fontSize: '40%'
				}, 250);
				$(window.doc.editorCurrentScriptTitle).animate({
					paddingTop: 0,
					paddingBottom: 0
				}, 250);
				$settingsCont.animate({
					height: viewportHeight - 18
				}, 250, function () {
					$settingsCont[0].style.height = 'calc(100vh - 29px)';
				});
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';

				window.doc.showHideToolsRibbonButton.classList.remove('hidden');
			}
			window.app.storageLocal.shrinkTitleRibbon = !window.app.storageLocal.shrinkTitleRibbon;
			chrome.storage.local.set({
				shrinkTitleRibbon: window.app.storageLocal.shrinkTitleRibbon
			});
		};

		static addSettingsReadyCallback(this: CrmApp, callback: Function, thisElement: HTMLElement, params: Array<any>) {
			this.onSettingsReadyCallbacks.push({
				callback: callback,
				thisElement: thisElement,
				params: params
			});
		};

		/**
		 * Uploads the settings to chrome.storage
		 */
		static upload(this: CrmApp, force: boolean = false) {
			this.uploading.upload(force);
		}

		static updateEditorZoom(this: CrmApp) {
			const prevStyle = document.getElementById('editorZoomStyle');
			prevStyle && prevStyle.remove();
			const styleEl = document.createElement('style');
			styleEl.id = 'editorZoomStyle';
			styleEl.innerText = `.CodeMirror, .CodeMirror-focused {
				font-size: ${1.25 * ~~window.app.settings.editor.zoom}%!important;
			}`;
			document.head.appendChild(styleEl);

			let editorManger = ((window.scriptEdit && window.scriptEdit.active) ?
				window.scriptEdit.editorManager :
				((window.stylesheetEdit && window.stylesheetEdit.active) ?
					window.stylesheetEdit.editorManager :
					null));
			if (!editorManger) {
				return;
			}
			window.colorFunction && window.colorFunction.func({
				from: {
					line: 0
				},
				to: {
					line: editorManger.lineCount()
				}
			}, editorManger);
		};

		static setLocal<T>(this: CrmApp, key: string, value: T) {
			const obj = {
				[key]: value
			};
			const _this = this;
			chrome.storage.local.set(obj);
			chrome.storage.local.get(function (storageLocal: CRM.StorageLocal) {
				_this.storageLocal = storageLocal;
				if (key === 'CRMonPage') {
					(window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue &&
						(window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue(!storageLocal.CRMOnPage);
				}
				_this.upload();
			});
		};

		static refreshPage(this: CrmApp) {
			//Reset dialog
			if (window.app.item) {
				const dialog = window[window.app.item.type + 'Edit' as
					'scriptEdit' | 'stylesheetEdit' | 'linkEdit' | 'dividerEdit' | 'menuEdit'];
				dialog && dialog.cancel();
			}
			window.app.item = null;

			window.app.settings = window.app.storageLocal = null;

			//Reset storages

			//On a demo or test page right now, use background page to init settings
			window.Storages.loadStorages(() => {
				this.setup.setupStorages.apply(this.setup);

				//Reset checkboxes
				this.setup.initCheckboxes.apply(this, [window.app.storageLocal]);
				
				//Reset default links and searchengines
				Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('default-link')).forEach(function (link: DefaultLink) {
					link.reset();
				});

				//Reset regedit part
				window.doc.URISchemeFilePath.value = 'C:\\files\\my_file.exe';
				window.doc.URISchemeFilePath.shadowRoot.querySelector('input').value = 'C:\\files\\my_file.exe';
				window.doc.URISchemeSchemeName.value = 'myscheme';
				window.doc.URISchemeSchemeName.shadowRoot.querySelector('input').value = 'myscheme';

				//Hide all open dialogs
				Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('paper-dialog')).forEach((dialog: HTMLPaperDialogElement) => {
					dialog.opened && dialog.close();
				});

				this.upload(true);
			});
		};

		static ready(this: CrmApp) {
			window.app = this;
			window.doc = window.app.$;

			chrome.runtime.onInstalled.addListener((details) => {
				if (details.reason === 'update') {
					//Show a little message
					this.$.messageToast.text = `Extension has been updated to version ${
						chrome.runtime.getManifest().version
						}`;
					this.$.messageToast.show();
				}
			});

			if (typeof localStorage === 'undefined') {
				//Running a test
				chrome.runtime.onMessage.addListener((message) => {
					if (message.type === 'idUpdate') {
						this.latestId = message.latestId;
					}
				});
			}

			let controlPresses = 0;
			document.body.addEventListener('keyup', (event) => {
				if (event.key === 'Control') {
					controlPresses++;
					window.setTimeout(() => {
						if (controlPresses >= 3) {
							this.listeners._toggleBugReportingTool();
							controlPresses = 0;
						} else {
							if (controlPresses > 0) {
								controlPresses--;
							}
						}
					}, 800);
				}
			});

			this.setup.setupLoadingBar().then(() => {
				this.setup.setupStorages.apply(this.setup);
			});

			this.show = false;
		};

		/**
		 * Functions related to transferring from version 1.0
		 */
		private static transferFromOld = class CRMAppTransferFromOld {
			private static backupLocalStorage() {
				if (typeof localStorage === 'undefined' ||
					(typeof window.indexedDB === 'undefined' && typeof (window as any).webkitIndexedDB === 'undefined')) {
					return;
				}
				const data = JSON.stringify(localStorage);
				const idb: IDBFactory = window.indexedDB || (window as any).webkitIndexedDB;
				const req = idb.open('localStorageBackup', 1);
				req.onerror = () => { console.log('Error backing up localStorage data'); };			
				req.onupgradeneeded = (event) => {
					const db: IDBDatabase = (event.target as any).result;
					const objectStore = db.createObjectStore('data', {
						keyPath: 'id'
					});
					objectStore.add({
						id: 0,
						data: data
					});
				}
			}

			private static parseOldCRMNode(string: string, openInNewTab: boolean,
				method: SCRIPT_CONVERSION_TYPE): CRM.Node {
				let node: CRM.Node = {} as any;
				const oldNodeSplit = string.split('%123');
				const name = oldNodeSplit[0];
				const type = oldNodeSplit[1].toLowerCase();

				const nodeData = oldNodeSplit[2];

				switch (type) {
					//Stylesheets don't exist yet so don't implement those
					case 'link':
						let split;
						if (nodeData.indexOf(', ') > -1) {
							split = nodeData.split(', ');
						} else {
							split = nodeData.split(',');
						}
						node = this.parent().templates.getDefaultLinkNode({
							name: name,
							id: this.parent().generateItemId(),
							value: split.map(function (url) {
								return {
									newTab: openInNewTab,
									url: url
								};
							})
						});
						break;
					case 'divider':
						node = this.parent().templates.getDefaultDividerNode({
							name: name,
							id: this.parent().generateItemId()
						});
						break;
					case 'menu':
						node = this.parent().templates.getDefaultMenuNode({
							name: name,
							id: this.parent().generateItemId(),
							children: nodeData as any
						});
						break;
					case 'script':
						const scriptSplit = nodeData.split('%124');
						let scriptLaunchMode = scriptSplit[0];
						const scriptData = scriptSplit[1];
						let triggers;
						const launchModeString = scriptLaunchMode + '';
						if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
							triggers = launchModeString.split('1,')[1].split(',');
							triggers = triggers.map(function (item) {
								return {
									not: false,
									url: item.trim()
								};
							}).filter(function (item) {
								return item.url !== '';
							});
							scriptLaunchMode = '2';
						}
						const id = this.parent().generateItemId();
						node = this.parent().templates.getDefaultScriptNode({
							name: name,
							id: id,
							triggers: triggers || [],
							value: {
								launchMode: parseInt(scriptLaunchMode, 10),
								updateNotice: true,
								oldScript: scriptData,
								script: this.parent().legacyScriptReplace.convertScriptFromLegacy(scriptData, id, method)
							} as CRM.ScriptVal
						});
						break;
				}

				return node;
			};

			private static assignParents(parent: CRM.Tree, nodes: Array<CRM.Node>,
				index: {
					index: number;
				}, amount: number) {
				for (; amount !== 0 && nodes[index.index]; index.index++ , amount--) {
					const currentNode = nodes[index.index];
					if (currentNode.type === 'menu') {
						const childrenAmount = ~~currentNode.children;
						currentNode.children = [];
						index.index++;
						this.assignParents(currentNode.children, nodes, index, childrenAmount);
						index.index--;
					}
					parent.push(currentNode);
				}
			};

			private static _chainPromise<T>(promiseInitializers: Array<() =>Promise<T>>, index: number = 0): Promise<T> {
				return new Promise<T>((resolve, reject) => {
					promiseInitializers[index]().then((value) => {
						if (index + 1 >= promiseInitializers.length) {
							resolve(value);
						} else {
							this._chainPromise(promiseInitializers, index + 1).then((value) => {
								resolve(value);
							}, (err) => {
								reject(err);
							});
						}
					}, (err) => {
						reject(err);	
					});
				});
			}
			private static _loadFile(path: string): Promise<string> {
				return new Promise<string>((resolve, reject) => {
					const xhr = new window.XMLHttpRequest();
					xhr.open('GET', chrome.runtime.getURL(path));
					xhr.onreadystatechange = () => {
						if (xhr.readyState === XMLHttpRequest.DONE) {
							if (xhr.status === 200) {
								resolve(xhr.responseText);
							} else {
								reject(null);
							}
						}
					}
				});
			}
			private static async _execFile(path: string): Promise<void> {
				const fileContent = await this._loadFile(path);
				eval(fileContent);
			}
			private static loadTernFiles(): Promise<void> {
				return new Promise((resolve, reject) => {
					const files: Array<string> = [
						'/js/libraries/tern/walk.js',
						'/js/libraries/tern/signal.js',
						'/js/libraries/tern/acorn.js',
						'/js/libraries/tern/tern.js',
						'/js/libraries/tern/def.js',
						'/js/libraries/tern/comment.js',
						'/js/libraries/tern/infer.js'
					];
					this._chainPromise(files.map((file) => {
						return () => {
							return this._execFile(file)
						}
					})).then(() => {
						resolve(null);
					}, (err) => {
						reject(err);
					});
				});
			}

			static async transferCRMFromOld(openInNewTab: boolean, storageSource: {
				getItem(index: string | number): any;
			}, method: SCRIPT_CONVERSION_TYPE): Promise<CRM.Tree> {
				this.backupLocalStorage();
				await this.loadTernFiles();

				let i;
				const amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;

				const nodes = [];
				for (i = 1; i < amount; i++) {
					nodes.push(this.parseOldCRMNode(storageSource.getItem(i), openInNewTab, method));
				}

				//Structure nodes with children etc
				const crm: CRM.Tree = [];
				this.assignParents(crm, nodes, {
					index: 0
				}, nodes.length);
				return crm;
			};

			static parent() {
				return window.app;
			}
		}

		/**
		 * Functions related to setting up the page on launch
		 */
		private static setup = class CRMAppSetup {
			private static restoreUnsavedInstances(editingObj: {
				id: number;
				mode: string;
				val: string;
				crmType: number;
			}, errs: number = 0) {
				const _this = this;
				errs = errs + 1 || 0;
				if (errs < 5) {
					if (!window.CodeMirror) {
						setTimeout(function () {
							_this.restoreUnsavedInstances(editingObj, errs);
						}, 500);
					}
					else {
						const crmItem = _this.parent().nodesById[editingObj.id] as CRM.ScriptNode | CRM.StylesheetNode;
						const code = (crmItem.type === 'script' ? (editingObj.mode === 'main' ?
							crmItem.value.script : crmItem.value.backgroundScript) :
							(crmItem.value.stylesheet));
						_this.parent().listeners.iconSwitch(null, editingObj.crmType);
						_this.parent().$$('.keepChangesButton').addEventListener('click', function () {
							if (crmItem.type === 'script') {
								crmItem.value[(editingObj.mode === 'main' ?
									'script' :
									'backgroundScript')] = editingObj.val;
							} else {
								crmItem.value.stylesheet = editingObj.val;
							}
							window.app.upload();
							chrome.storage.local.set({
								editing: null
							});
							window.setTimeout(function () {
								//Remove the CodeMirror instances for performance
								window.doc.restoreChangesOldCodeCont.innerHTML = '';
								window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
							}, 500);
						});
						_this.parent().$$('.restoreChangesBack').addEventListener('click', function () {
							window.doc.restoreChangesOldCode.style.display = 'none';
							window.doc.restoreChangesUnsavedCode.style.display = 'none';
							window.doc.restoreChangesMain.style.display = 'block';
							window.doc.restoreChangesDialog.fit();
						});
						_this.parent().$$('.discardButton').addEventListener('click', function () {
							chrome.storage.local.set({
								editing: null
							});
							window.setTimeout(function () {
								//Remove the CodeMirror instances for performance
								window.doc.restoreChangesOldCodeCont.innerHTML = '';
								window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
							}, 500);
						});
						window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
						window.doc.restoreChangesOldCodeCont.innerHTML = '';
						const oldEditor = window.CodeMirror(window.doc.restoreChangesOldCodeCont, {
							lineNumbers: true,
							value: code,
							scrollbarStyle: 'simple',
							lineWrapping: true,
							readOnly: 'nocursor',
							theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
							indentUnit: window.app.settings.editor.tabSize,
							indentWithTabs: window.app.settings.editor.useTabs
						});
						const unsavedEditor = window.CodeMirror(window.doc.restoreChangeUnsaveddCodeCont, {
							lineNumbers: true,
							value: editingObj.val,
							scrollbarStyle: 'simple',
							lineWrapping: true,
							readOnly: 'nocursor',
							theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
							indentUnit: window.app.settings.editor.tabSize,
							indentWithTabs: window.app.settings.editor.useTabs
						});
						window.doc.restoreChangesShowOld.addEventListener('click', function () {
							window.doc.restoreChangesMain.style.display = 'none';
							window.doc.restoreChangesUnsavedCode.style.display = 'none';
							window.doc.restoreChangesOldCode.style.display = 'flex';
							window.doc.restoreChangesDialog.fit();
							oldEditor.refresh();
						});
						window.doc.restoreChangesShowUnsaved.addEventListener('click', function () {
							window.doc.restoreChangesMain.style.display = 'none';
							window.doc.restoreChangesOldCode.style.display = 'none';
							window.doc.restoreChangesUnsavedCode.style.display = 'flex';
							window.doc.restoreChangesDialog.fit();
							unsavedEditor.refresh();
						});

						const stopHighlighting = function (element: HTMLElement) {
							const item = $(element).find('.item')[0];
							item.animate([
								{
									opacity: 1
								}, {
									opacity: 0.6
								}
							], {
								duration: 250,
								easing: 'bez'
							}).onfinish = function (this: Animation) {
								item.style.opacity = '0.6';
								window.doc.restoreChangesDialog.open();
								$('.pageCont').animate({
									backgroundColor: 'white'
								}, 200);
								$('.crmType').each(function (this: HTMLElement) {
									this.classList.remove('dim');
								});
								$(window.app.editCRM.$$('edit-crm-item .item')).animate({
									opacity: 1
								}, 200, function () {
									document.body.style.pointerEvents = 'all';
								});
							};
						};

						const path = _this.parent().nodesById[editingObj.id].path;
						const highlightItem = function () {
							document.body.style.pointerEvents = 'none';
							const columnConts = _this.parent().shadowRoot.querySelectorAll('#mainCont > div');
							const $columnCont = $(columnConts[(path.length - 1) + 2]);
							const $paperMaterial = $($columnCont.children('paper-material')[0]);
							const $crmEditColumn = $paperMaterial.children('.CRMEditColumn')[0];
							const editCRMItems = $($crmEditColumn).children('edit-crm-item');
							const crmElement = editCRMItems[path[path.length - 1]];
							//Just in case the item doesn't exist (anymore)
							if (crmElement.querySelector('.item')) {
								crmElement.querySelector('.item').animate([{
									opacity: 0.6
								}, {
									opacity: 1
								}], {
									duration: 250,
									easing: 'bez'
								}).onfinish = function (this: Animation) {
									crmElement.querySelector('.item').style.opacity = '1';
								};
								setTimeout(function () {
									stopHighlighting(crmElement);
								}, 2000);
							} else {
								window.doc.restoreChangesDialog.open();
								$(_this.parent().$$('.pageCont')).animate({
									backgroundColor: 'white'
								}, 200);
								$(_this.parent().$$('.crmType')).each(function (this: HTMLElement) {
									this.classList.remove('dim');
								});
								$(window.app.editCRM.$$('edit-crm-item .item')).animate({
									opacity: 1
								}, 200, function () {
									document.body.style.pointerEvents = 'all';
								});
							}
						};

						window.doc.highlightChangedScript.addEventListener('click', function () {
							//Find the element first
							//Check if the element is already visible
							window.doc.restoreChangesDialog.close();
							_this.parent().$$('.pageCont').style.backgroundColor = 'rgba(0,0,0,0.4)';
							_this.parent().$$('edit-crm-item .item').style.opacity = '0.6';
							Array.prototype.slice.apply(_this.parent().$$('.crmType')).forEach((crmType: HTMLElement) => {
								crmType.classList.add('dim');
							});

							setTimeout(function () {
								if (path.length === 1) {
									//Always visible
									highlightItem();
								} else {
									let visible = true;
									for (let i = 1; i < path.length; i++) {
										if (window.app.editCRM.crm[i].indent.length !== path[i - 1]) {
											visible = false;
											break;
										}
									}
									if (!visible) {
										//Make it visible
										const popped = JSON.parse(JSON.stringify(path.length));
										popped.pop();
										window.app.editCRM.build(popped);
										setTimeout(highlightItem, 700);
									} else {
										highlightItem();
									}
								}
							}, 500);
						});
						try {
							window.doc.restoreChangesDialog.open();
						} catch (e) {
							_this.restoreUnsavedInstances(editingObj, errs + 1);
						}
					}
				}
			};

			private static bindListeners() {
				const urlInput = window.doc.addLibraryUrlInput;
				const manualInput = window.doc.addLibraryManualInput;
				window.doc.addLibraryUrlOption.addEventListener('change', function () {
					manualInput.style.display = 'none';
					urlInput.style.display = 'block';
				});
				window.doc.addLibraryManualOption.addEventListener('change', function () {
					urlInput.style.display = 'none';
					manualInput.style.display = 'block';
				});
				$('#addLibraryDialog').on('iron-overlay-closed', function (this: HTMLElement) {
					$(this).find('#addLibraryButton, #addLibraryConfirmAddition, #addLibraryDenyConfirmation').off('click');
				});
			};

			static setupStorages() {
				const _this = this.parent();
				chrome.storage.local.get((storageLocal: CRM.StorageLocal & {
					nodeStorage: any;
					settings?: CRM.SettingsStorage;
				}) => {
					function callback(items: CRM.SettingsStorage) {
						_this.settings = items;
						_this.settingsCopy = JSON.parse(JSON.stringify(items));
						window.app.editCRM.$.rootCRMItem.updateName(items.rootName);
						for (let i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
							_this.onSettingsReadyCallbacks[i].callback.apply(
								_this.onSettingsReadyCallbacks[i].thisElement,
								_this.onSettingsReadyCallbacks[i].params);
						}
						_this.updateEditorZoom();
						_this.setup.orderNodesById(items.crm);
						_this.pageDemo.create();
						_this.setup.buildNodePaths(items.crm, []);
						if (_this.settings.latestId) {
							_this.latestId = items.latestId;
						} else {
							_this.latestId = 0;
						}

						if (~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] <= 34) {
							(window.doc.CRMOnPage as PaperToggleOption).setCheckboxDisabledValue(true);
						}
						(window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue(!storageLocal
							.CRMOnPage);
					}

					Array.prototype.slice.apply(_this.shadowRoot.querySelectorAll('paper-toggle-option')).forEach(function (setting: PaperToggleOption) {
						setting.init(storageLocal);
					});

					_this.setup.bindListeners();
					delete storageLocal.nodeStorage;
					if (storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0) {
						_this.requestPermissions(storageLocal.requestPermissions as Array<CRM.Permission>);
					}
					if (storageLocal.editing) {
						const editing = storageLocal.editing;
						setTimeout(function () {
							//Check out if the code is actually different
							const node = _this.nodesById[editing.id] as CRM.ScriptNode | CRM.StylesheetNode;
							const nodeCurrentCode = (node.type === 'script' ? node.value.script :
								node.value.stylesheet);
							if (nodeCurrentCode.trim() !== editing.val.trim()) {
								_this.setup.restoreUnsavedInstances(editing);
							} else {
								chrome.storage.local.set({
									editing: null
								});
							}
						}, 2500);
					}
					if (storageLocal.selectedCrmType !== undefined) {
						_this.crmType = storageLocal.selectedCrmType;
						_this.setup.switchToIcons(storageLocal.selectedCrmType);
					} else {
						chrome.storage.local.set({
							selectedCrmType: 0
						});
						_this.crmType = 0;
						_this.setup.switchToIcons(0);
					}
					if (storageLocal.jsLintGlobals) {
						_this.jsLintGlobals = storageLocal.jsLintGlobals;
					} else {
						_this.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
						chrome.storage.local.set({
							jsLintGlobals: _this.jsLintGlobals
						});
					}
					if (storageLocal.globalExcludes && storageLocal.globalExcludes.length >
						1) {
						_this.globalExcludes = storageLocal.globalExcludes;
					} else {
						_this.globalExcludes = [''];
						chrome.storage.local.set({
							globalExcludes: _this.globalExcludes
						});
					}
					if (storageLocal.addedPermissions && storageLocal.addedPermissions.length > 0) {
						window.setTimeout(function () {
							(window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer).tab = 0;
							(window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer).maxTabs =
								storageLocal.addedPermissions.length;
							window.doc.addedPermissionsTabRepeater.items =
								storageLocal.addedPermissions;

							if (storageLocal.addedPermissions.length === 1) {
								(window.doc.addedPermissionNextButton.querySelector('.next') as HTMLElement)
									.style.display = 'none';
							} else {
								(window.doc.addedPermissionNextButton.querySelector('.close') as HTMLElement)
									.style.display = 'none';
							}
							window.doc.addedPermissionPrevButton.style.display = 'none';
							window.doc.addedPermissionsTabRepeater.render();
							window.doc.addedPermissionsDialog.open();
							chrome.storage.local.set({
								addedPermissions: null
							});
						}, 2500);
					}
					if (storageLocal.updatedScripts && storageLocal.updatedScripts.length > 0) {
						_this.$.scriptUpdatesToast.text = _this._getUpdatedScriptString(
							storageLocal.updatedScripts[0]);
						_this.$.scriptUpdatesToast.scripts = storageLocal.updatedScripts;
						_this.$.scriptUpdatesToast.index = 0;
						_this.$.scriptUpdatesToast.show();

						if (storageLocal.updatedScripts.length > 1) {
							_this.$.nextScriptUpdateButton.style.display = 'inline';
						} else {
							_this.$.nextScriptUpdateButton.style.display = 'none';
						}
						chrome.storage.local.set({
							updatedScripts: []
						});
						storageLocal.updatedScripts = [];
					}
					if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.wasUpdated) {
						const versionData = storageLocal.settingsVersionData;
						versionData.wasUpdated = false;
						chrome.storage.local.set({
							settingsVersionData: versionData
						});

						const toast = window.doc.updatedSettingsToast;
						toast.text = 'Settings were updated to those on ' + new Date(
							versionData.latest.date
						).toLocaleDateString();
						toast.show();
					}

					if (storageLocal.isTransfer) {
						chrome.storage.local.set({
							isTransfer: false
						});
						window.doc.versionUpdateDialog.open();
					}

					_this.storageLocal = storageLocal;
					_this.storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
					if (storageLocal.useStorageSync) {
						//Parse the data before sending it to the callback
						chrome.storage.sync.get(function (storageSync: {
							[key: string]: string
						} & {
								indexes: Array<string>;
							}) {
							let indexes = storageSync.indexes;
							if (!indexes) {
								chrome.storage.local.set({
									useStorageSync: false
								});
								callback(storageLocal.settings);
							} else {
								const settingsJsonArray: Array<string> = [];
								indexes.forEach(function (index) {
									settingsJsonArray.push(storageSync[index]);
								});
								const jsonString = settingsJsonArray.join('');
								_this.settingsJsonLength = jsonString.length;
								const settings = JSON.parse(jsonString);
								callback(settings);
							}
						});
					} else {
						//Send the "settings" object on the storage.local to the callback
						_this.settingsJsonLength = JSON.stringify(storageLocal.settings || {}).length;
						if (!storageLocal.settings) {
							chrome.storage.local.set({
								useStorageSync: true
							});
							chrome.storage.sync.get(function (storageSync: {
								[key: string]: string
							} & {
									indexes: Array<string>;
								}) {
								const indexes = storageSync.indexes;
								const settingsJsonArray: Array<string> = [];
								indexes.forEach(function (index) {
									settingsJsonArray.push(storageSync[index]);
								});
								const jsonString = settingsJsonArray.join('');
								_this.settingsJsonLength = jsonString.length;
								const settings = JSON.parse(jsonString);
								callback(settings);
							});
						} else {
							callback(storageLocal.settings);
						}
					}
				});
			};

			private static animateLoadingBar(settings: {
				lastReachedProgress: number;
				max: number;
				toReach: number;
				progressBar: HTMLElement;
				isAnimating: boolean;
				shouldAnimate: boolean;
			}, progress: number) {
				const _this = this;
				const scaleBefore = 'scaleX(' + settings.lastReachedProgress + ')';
				const scaleAfter = 'scaleX(' + progress + ')';
				if (settings.max === settings.lastReachedProgress ||
					settings.toReach >= 1) {
					settings.progressBar.animate([{
						transform: scaleBefore,
						WebkitTransform: scaleBefore
					}, {
						transform: scaleAfter,
						WebkitTransform: scaleAfter
					}], {
							duration: 200,
							easing: 'linear'
						}).onfinish = function () {
							settings.lastReachedProgress = progress;
							settings.isAnimating = false;
							settings.progressBar.style.transform = scaleAfter;
							settings.progressBar.style.WebkitTransform = scaleAfter;
						};
					return;
				}
				if ((settings.progressBar.animate as any).isJqueryFill) {
					settings.progressBar.style.transform = scaleAfter;
					settings.progressBar.style.WebkitTransform = scaleAfter;
				} else {
					if (settings.isAnimating) {
						settings.toReach = progress;
						settings.shouldAnimate = true;
					} else {
						settings.isAnimating = true;
						settings.progressBar.animate([{
							transform: scaleBefore,
							WebkitTransform: scaleBefore
						}, {
							transform: scaleAfter,
							WebkitTransform: scaleAfter
						}], {
								duration: 200,
								easing: 'linear'
							}).onfinish = function () {
								settings.lastReachedProgress = progress;
								settings.isAnimating = false;
								settings.progressBar.style.transform = scaleAfter;
								settings.progressBar.style.WebkitTransform = scaleAfter;
								_this.animateLoadingBar(settings, settings.toReach);
							};
					}
				}
			};

			static setupLoadingBar(): Promise<void> {
				return new Promise<void>((resolve) => {
					const importsAmount = 42;
					const loadingBarSettings = {
						lastReachedProgress: 0,
						progressBar: document.getElementById('splashScreenProgressBarLoader'),
						toReach: 0,
						isAnimating: false,
						shouldAnimate: false,
						max: importsAmount
					};

					let registeredElements = Polymer.telemetry.registrations.length;
					let loaded: boolean = false;
					const registrationArray = Array.prototype.slice.apply(Polymer.telemetry.registrations);
					registrationArray.push = (element: HTMLElement) => {
						Array.prototype.push.call(registrationArray, element);
						registeredElements++;
						const progress = Math.round((registeredElements / importsAmount) * 100) / 100;
						this.animateLoadingBar(loadingBarSettings, progress);
						if (registeredElements > importsAmount) {
							if (loaded) {
								return;
							}
							loaded = true;
							//Wait until the element is actually registered to the DOM
							window.setTimeout(() => {
								resolve(null);
								//All elements have been loaded, unhide them all
								window.setTimeout(function () {
									document.documentElement.classList.remove('elementsLoading');

									//Clear the annoying CSS mime type messages and the /deep/ warning
									if (!window.lastError && location.hash.indexOf('noClear') === -1) {
										console.clear();
									}

									window.setTimeout(function () {
										//Wait for the fade to pass
										window.polymerElementsLoaded = true;
										document.getElementById('splashScreen').style.display = 'none';
									}, 500);

									console.log('%cHey there, if you\'re interested in how this extension works check out the github repository over at https://github.com/SanderRonde/CustomRightClickMenu',
										'font-size:120%;font-weight:bold;');
								}, 200);

								window.CRMLoaded = window.CRMLoaded || {
									listener: null,
									register(fn) {
										fn();
									}
								}
								window.CRMLoaded.listener && window.CRMLoaded.listener();
							}, 25);
						}
					};
					Polymer.telemetry.registrations = registrationArray;
				});
			};

			static initCheckboxes(defaultLocalStorage: CRM.StorageLocal) {
				const _this = this;
				if ((window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue) {
					(window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue &&
						(window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue(false);
					Array.prototype.slice.apply(_this.parent().shadowRoot.querySelectorAll('paper-toggle-option')).forEach(function (setting: PaperToggleOption) {
						setting.init && setting.init(defaultLocalStorage);
					});
				} else {
					window.setTimeout(function () {
						_this.initCheckboxes.apply(_this, [defaultLocalStorage]);
					}, 1000);
				}
			};

			static buildNodePaths(tree: CRM.Tree, currentPath: Array<number>) {
				for (let i = 0; i < tree.length; i++) {
					const childPath = currentPath.concat([i]);
					const node = tree[i];
					node.path = childPath;
					if (node.children) {
						this.buildNodePaths(node.children, childPath);
					}
				}
			};

			static orderNodesById(tree: CRM.Tree) {
				for (let i = 0; i < tree.length; i++) {
					const node = tree[i];
					this.parent().nodesById[node.id] = node;
					node.children && this.orderNodesById(node.children);
				}
			};

			static switchToIcons(index: number) {
				let i;
				let element;
				const crmTypes = this.parent().shadowRoot.querySelectorAll('.crmType');
				for (i = 0; i < 6; i++) {
					if (index === i) {
						element = crmTypes[i] as HTMLElement;
						element.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
						element.classList.add('toggled');

						const child = document.createElement('div');
						if (index === 5) {
							child.classList.add('crmTypeShadowMagicElementRight');
						} else {
							child.classList.add('crmTypeShadowMagicElement');
						}
						element.appendChild(child);
					}
				}
				this.parent().crmType = index;
				this.parent().fire('crmTypeChanged', {});
			};

			static parent() {
				return window.app;
			}
		}

		/**
		 * Functions related to uploading the data to the backgroundpage
		 */
		private static uploading = class CRMAppUploading {
			private static areValuesDifferent(val1: Array<any> | Object, val2: Array<any> | Object): boolean {
				//Array or object
				const obj1ValIsArray = Array.isArray(val1);
				let obj2ValIsArray = Array.isArray(val2);
				const obj1ValIsObjOrArray = typeof val1 === 'object';
				let obj2ValIsObjOrArray = typeof val2 === 'object';

				if (obj1ValIsObjOrArray) {
					//Array or object
					if (!obj2ValIsObjOrArray) {
						return true;
					} else {
						//Both objects or arrays

						//1 is an array
						if (obj1ValIsArray) {
							//2 is not an array
							if (!obj2ValIsArray) {
								return true;
							} else {
								//Both are arrays, compare them
								if (!this.parent().util.compareArray(val1 as Array<any>, val2 as Array<any>)) {
									//Changes have been found, also say the container arrays have changed
									return true;
								}
							}
						} else {
							//1 is not an array, check if 2 is
							if (obj2ValIsArray) {
								//2 is an array, changes
								return true;
							} else {
								//2 is also not an array, they are both objects
								if (!this.parent().util.compareObj(val1, val2)) {
									//Changes have been found, also say the container arrays have changed
									return true;
								}
							}
						}
					}
				} else if (val1 !== val2) {
					//They are both normal string/number/bool values, do a normal comparison
					return true;
				}
				return false;
			};

			private static getObjDifferences<T, S>(obj1: {
				[key: string]: T
				[key: number]: T
			}, obj2: {
				[key: string]: S
				[key: number]: S
			}, changes: Array<{
				oldValue: S;
				newValue: T;
				key: any;
			}>): boolean {
				for (let key in obj1) {
					if (obj1.hasOwnProperty(key)) {
						if (this.areValuesDifferent(obj1[key], obj2[key])) {
							changes.push({
								oldValue: obj2[key],
								newValue: obj1[key],
								key: key
							});
						}
					}
				}
				return changes.length > 0;
			};

			static upload(force: boolean) {
				//Send changes to background-page, background-page uploads everything
				//Compare storageLocal objects
				const localChanges: Array<{
					oldValue: any;
					newValue: any;
					key: any;
				}> = [];
				const storageLocal = this.parent().storageLocal;
				const storageLocalCopy = force ? {} : this.parent().storageLocalCopy;

				const settingsChanges: Array<{
					oldValue: any;
					newValue: any;
					key: any;
				}> = [];
				const settings = this.parent().settings;
				const settingsCopy = force ? {} : this.parent().settingsCopy;
				const hasLocalChanged = this.getObjDifferences(storageLocal, storageLocalCopy, localChanges);
				const haveSettingsChanged = this.getObjDifferences(settings, settingsCopy, settingsChanges);

				if (hasLocalChanged || haveSettingsChanged) {
					//Changes occured
					chrome.runtime.sendMessage({
						type: 'updateStorage',
						data: {
							type: 'optionsPage',
							localChanges: hasLocalChanged && localChanges,
							settingsChanges: haveSettingsChanged && settingsChanges
						}
					});
				}

				this.parent().pageDemo.create();
			};

			private static parent() {
				return window.app;
			}
		}

		/**
		 * Functions for transferring an old version of a script to a new version
		 */
		static legacyScriptReplace = class LegacyScriptReplace {
			static localStorageReplace = class LogalStorageReplace {
				static findExpression(expression: Tern.Expression, data: PersistentData,
					strToFind: string, onFind: (data: PersistentData, expression: Tern.Expression) => void): boolean {
					if (!expression) {
						return false;
					}
					switch (expression.type) {
						case 'Identifier':
							if (expression.name === strToFind) {
								onFind(data, expression);
								return true;
							}
							break;
						case 'VariableDeclaration':
							for (let i = 0; i < expression.declarations.length; i++) {
								//Check if it's an actual chrome assignment
								const declaration = expression.declarations[i];
								if (declaration.init) {
									if (this.findExpression(declaration.init, data, strToFind, onFind)) {
										return true;
									}
								}
							}
							break;
						case 'MemberExpression':
							data.isObj = true;
							if (this.findExpression(expression.object, data, strToFind, onFind)) {
								return true;
							}
							data.siblingExpr = expression.object;
							data.isObj = false;
							return this.findExpression(expression.property as Tern.Identifier, data, strToFind, onFind);
						case 'CallExpression':
							if (expression.arguments && expression.arguments.length > 0) {
								for (let i = 0; i < expression.arguments.length; i++) {
									if (this.findExpression(expression.arguments[i], data, strToFind, onFind)) {
										return true;
									}
								}
							}
							if (expression.callee) {
								return this.findExpression(expression.callee, data, strToFind, onFind);
							}
							break;
						case 'AssignmentExpression':
							return this.findExpression(expression.right, data, strToFind, onFind);
						case 'FunctionExpression':
						case 'FunctionDeclaration':
							for (let i = 0; i < expression.body.body.length; i++) {
								if (this.findExpression(expression.body.body[i], data, strToFind, onFind)) {
									return true;
								}
							}
							break;
						case 'ExpressionStatement':
							return this.findExpression(expression.expression, data, strToFind, onFind);
						case 'SequenceExpression':
							for (let i = 0; i < expression.expressions.length; i++) {
								if (this.findExpression(expression.expressions[i], data, strToFind, onFind)) {
									return true;
								}
							}
							break;
						case 'UnaryExpression':
						case 'ConditionalExpression':
							if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
								return true;
							}
							return this.findExpression(expression.alternate, data, strToFind, onFind);
						case 'IfStatement': ;
							if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
								return true;
							}
							if (expression.alternate) {
								return this.findExpression(expression.alternate, data, strToFind, onFind);
							}
							break;
						case 'LogicalExpression':
						case 'BinaryExpression':
							if (this.findExpression(expression.left, data, strToFind, onFind)) {
								return true;
							}
							return this.findExpression(expression.right, data, strToFind, onFind);
						case 'BlockStatement':
							for (let i = 0; i < expression.body.length; i++) {
								if (this.findExpression(expression.body[i], data, strToFind, onFind)) {
									return true;
								}
							}
							break;
						case 'ReturnStatement':
							return this.findExpression(expression.argument, data, strToFind, onFind);
						case 'ObjectExpressions':
							for (let i = 0; i < expression.properties.length; i++) {
								if (this.findExpression(expression.properties[i].value, data, strToFind, onFind)) {
									return true;
								}
							}
							break;
					}
					return false;
				}
				static getLineSeperators(lines: Array<string>): Array<{
					start: number;
					end: number;
				}> {
					let index = 0;
					const lineSeperators = [];
					for (let i = 0; i < lines.length; i++) {
						lineSeperators.push({
							start: index,
							end: index += lines[i].length + 1
						});
					}
					return lineSeperators;
				}
				static replaceCalls(lines: Array<string>): string {
					//Analyze the file
					const file = new window.TernFile('[doc]');
					file.text = lines.join('\n');
					const srv = new window.CodeMirror.TernServer({
						defs: [window.ecma5, window.ecma6, window.browserDefs]
					});
					window.tern.withContext(srv.cx, () => {
						file.ast = window.tern.parse(file.text, srv.passes, {
							directSourceFile: file,
							allowReturnOutsideFunction: true,
							allowImportExportEverywhere: true,
							ecmaVersion: srv.ecmaVersion
						});
					});

					const scriptExpressions = file.ast.body;

					let script = file.text;

					//Check all expressions for chrome calls
					const persistentData: PersistentData = {
						lines: lines,
						lineSeperators: this.getLineSeperators(lines),
						script: script
					};

					for (let i = 0; i < scriptExpressions.length; i++) {
						const expression = scriptExpressions[i];
						if (this.findExpression(expression, persistentData, 'localStorage', (data, expression) => {
							data.script =
								data.script.slice(0, expression.start) +
								'localStorageProxy' +
								data.script.slice(expression.end);
							data.lines = data.script.split('\n');
						})) {
							//Margins may have changed, redo tern stuff
							return this.replaceCalls(persistentData.lines);
						}
					}

					return persistentData.script;
				}
			}
			static chromeCallsReplace = class ChromeCallsReplace {
				private static isProperty(toCheck: string, prop: string): boolean {
					if (toCheck === prop) {
						return true;
					}
					return toCheck.replace(/['|"|`]/g, '') === prop;
				}
				private static getCallLines(lineSeperators: Array<{
					start: number;
					end: number;
				}>, start: number, end: number): {
						from: {
							index: number;
							line: number;
						};
						to: {
							index: number;
							line: number;
						}
					} {
					const line: {
						from: {
							index: number,
							line: number;
						},
						to: {
							index: number,
							line: number;
						};
					} = {} as any;
					for (let i = 0; i < lineSeperators.length; i++) {
						const sep = lineSeperators[i];
						if (sep.start <= start) {
							line.from = {
								index: sep.start,
								line: i
							};
						}
						if (sep.end >= end) {
							line.to = {
								index: sep.end,
								line: i
							};
							break;
						}
					}

					return line;
				}
				private static getFunctionCallExpressions(data: ChromePersistentData): Tern.Expression {
					//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
					let index = data.parentExpressions.length - 1;
					let expr = data.parentExpressions[index];
					while (expr && expr.type !== 'CallExpression') {
						expr = data.parentExpressions[--index];
					}
					return data.parentExpressions[index];
				}
				private static getChromeAPI(expr: Tern.Expression, data: ChromePersistentData): {
					call: string;
					args: string;
				} {
					data.functionCall = data.functionCall.map((prop) => {
						return prop.replace(/['|"|`]/g, '');
					});
					let functionCall = data.functionCall;
					functionCall = functionCall.reverse();
					if (functionCall[0] === 'chrome') {
						functionCall.splice(0, 1);
					}

					const argsStart = expr.callee.end;
					const argsEnd = expr.end;
					const args = data.persistent.script.slice(argsStart, argsEnd);

					return {
						call: functionCall.join('.'),
						args: args
					};
				}
				private static getLineIndexFromTotalIndex(lines: Array<string>, line: number, index:
					number): number {
					for (let i = 0; i < line; i++) {
						index -= lines[i].length + 1;
					}
					return index;
				}
				private static replaceChromeFunction(data: ChromePersistentData, expr: Tern.Expression, callLine:
					{
						from: {
							line: number;
						}
						to: {
							line: number;
						}
					}) {
					if (data.isReturn && !data.isValidReturn) {
						return;
					}

					var lines = data.persistent.lines;

					//Get chrome API
					let i;
					var chromeAPI = this.getChromeAPI(expr, data);
					var firstLine = data.persistent.lines[callLine.from.line];
					var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines,
						callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
							expr.callee.start));
					var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines,
						callLine.from.line, expr.callee.end);

					var newLine = firstLine.slice(0, lineExprStart) +
						`window.crmAPI.chrome('${chromeAPI.call}')`;

					var lastChar = null;
					while (newLine[(lastChar = newLine.length - 1)] === ' ') {
						newLine = newLine.slice(0, lastChar);
					}
					if (newLine[(lastChar = newLine.length - 1)] === ';') {
						newLine = newLine.slice(0, lastChar);
					}

					if (chromeAPI.args !== '()') {
						var argsLines = chromeAPI.args.split('\n');
						newLine += argsLines[0];
						for (i = 1; i < argsLines.length; i++) {
							lines[callLine.from.line + i] = argsLines[i];
						}
					}

					if (data.isReturn) {
						var lineRest = firstLine.slice(lineExprEnd + chromeAPI.args.split('\n')[0].length);
						while (lineRest.indexOf(';') === 0) {
							lineRest = lineRest.slice(1);
						}
						newLine += `.return(function(${data.returnName}) {` + lineRest;
						var usesTabs = true;
						var spacesAmount = 0;
						//Find out if the writer uses tabs or spaces
						for (let i = 0; i < data.persistent.lines.length; i++) {
							if (data.persistent.lines[i].indexOf('	') === 0) {
								usesTabs = true;
								break;
							} else if (data.persistent.lines[i].indexOf('  ') === 0) {
								var split = data.persistent.lines[i].split(' ');
								for (var j = 0; j < split.length; j++) {
									if (split[j] === ' ') {
										spacesAmount++;
									} else {
										break;
									}
								}
								usesTabs = false;
								break;
							}
						}

						var indent;
						if (usesTabs) {
							indent = '	';
						} else {
							indent = [];
							indent[spacesAmount] = ' ';
							indent = indent.join(' ');
						}

						//Only do this for the current scope
						var scopeLength = null;
						var idx = null;
						for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
							if (data.parentExpressions[i].type === 'BlockStatement' ||
								(data.parentExpressions[i].type === 'FunctionExpression' &&
									(data.parentExpressions[i].body as Tern.BlockStatement).type === 'BlockStatement')) {
								scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
								idx = 0;

								//Get the lowest possible scopeLength as to stay on the last line of the scope
								while (scopeLength > 0) {
									scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (++idx), data.parentExpressions[i].end);
								}
								scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (idx - 1), data.parentExpressions[i].end);
							}
						}
						if (idx === null) {
							idx = (lines.length - callLine.from.line) + 1;
						}

						var indents = 0;
						var newLineData = lines[callLine.from.line];
						while (newLineData.indexOf(indent) === 0) {
							newLineData = newLineData.replace(indent, '');
							indents++;
						}

						//Push in one extra line at the end of the expression
						var prevLine;
						var indentArr = [];
						indentArr[indents] = '';
						var prevLine2 = indentArr.join(indent) + '}).send();';
						var max = data.persistent.lines.length + 1;
						for (i = callLine.from.line; i < callLine.from.line + (idx - 1); i++) {
							lines[i] = indent + lines[i];
						}

						//If it's going to add a new line, indent the last line as well
						// if (idx === (lines.length - callLines.from.line) + 1) {
						// 	lines[i] = indent + lines[i];
						// }
						for (i = callLine.from.line + (idx - 1); i < max; i++) {
							prevLine = lines[i];
							lines[i] = prevLine2;
							prevLine2 = prevLine;
						}

					} else {
						lines[callLine.from.line + (i - 1)] = lines[callLine.from.line + (i - 1)] + '.send();';
						if (i === 1) {
							newLine += '.send();';
						}
					}
					lines[callLine.from.line] = newLine;
					return;
				}
				private static callsChromeFunction(callee: Tern.FunctionCallExpression, data: ChromePersistentData, onError:
					TransferOnError): boolean {
					data.parentExpressions.push(callee);

					//Check if the function has any arguments and check those first
					if (callee.arguments && callee.arguments.length > 0) {
						for (let i = 0; i < callee.arguments.length; i++) {
							if (this.findChromeExpression(callee.arguments[i], this
								.removeObjLink(data), onError)) {
								return true;
							}
						}
					}

					if (callee.type !== 'MemberExpression') {
						//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
						return this.findChromeExpression(callee, this.removeObjLink(data),
							onError);
					}

					//Continue checking the call itself
					if (callee.property) {
						data.functionCall = data.functionCall || [];
						data.functionCall.push(callee.property.name || (callee.property as any).raw);
					}
					if (callee.object && callee.object.name) {
						//First object
						const isWindowCall = (this.isProperty(callee.object.name, 'window') &&
							this.isProperty(callee.property.name || (callee.property as any).raw, 'chrome'));
						if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
							data.expression = callee;
							const expr = this.getFunctionCallExpressions(data);
							const callLines = this.getCallLines(data
								.persistent
								.lineSeperators, expr.start, expr.end);
							if (data.isReturn && !data.isValidReturn) {
								callLines.from.index = this.getLineIndexFromTotalIndex(data.persistent
									.lines, callLines.from.line, callLines.from.index);
								callLines.to.index = this.getLineIndexFromTotalIndex(data.persistent
									.lines, callLines.to.line, callLines.to.index);
								onError(callLines, data.persistent.passes);
								return false;
							}
							if (!data.persistent.diagnostic) {
								this.replaceChromeFunction(data, expr, callLines);
							}
							return true;
						}
					} else if (callee.object) {
						return this.callsChromeFunction(callee.object as any, data, onError);
					}
					return false;
				}
				private static removeObjLink(data: ChromePersistentData): ChromePersistentData {
					const parentExpressions = data.parentExpressions || [];
					const newObj: ChromePersistentData = {} as any;
					for (let key in data) {
						if (data.hasOwnProperty(key) &&
							key !== 'parentExpressions' &&
							key !== 'persistent') {
							(newObj as any)[key] = (data as any)[key];
						}
					}

					const newParentExpressions = [];
					for (let i = 0; i < parentExpressions.length; i++) {
						newParentExpressions.push(parentExpressions[i]);
					}
					newObj.persistent = data.persistent;
					newObj.parentExpressions = newParentExpressions;
					return newObj;
				}
				private static findChromeExpression(expression: Tern.Expression, data: ChromePersistentData,
					onError: TransferOnError): boolean {
					data.parentExpressions = data.parentExpressions || [];
					data.parentExpressions.push(expression);

					switch (expression.type) {
						case 'VariableDeclaration':
							data.isValidReturn = expression.declarations.length === 1;
							for (let i = 0; i < expression.declarations.length; i++) {
								//Check if it's an actual chrome assignment
								var declaration = expression.declarations[i];
								if (declaration.init) {
									var decData = this.removeObjLink(data);

									var returnName = declaration.id.name;
									decData.isReturn = true;
									decData.returnExpr = expression;
									decData.returnName = returnName;

									if (this.findChromeExpression(declaration.init, decData, onError)) {
										return true;
									}
								}
							}
							break;
						case 'CallExpression':
						case 'MemberExpression':
							const argsTocheck: Array<Tern.Expression> = [];
							if (expression.arguments && expression.arguments.length > 0) {
								for (let i = 0; i < expression.arguments.length; i++) {
									if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
										//It's not a direct call to chrome, just handle this later after the function has been checked
										argsTocheck.push(expression.arguments[i]);
									} else {
										if (this.findChromeExpression(expression.arguments[i], this.removeObjLink(data), onError)) {
											return true;
										}
									}
								}
							}
							data.functionCall = [];
							if (expression.callee) {
								if (this.callsChromeFunction(expression.callee, data, onError)) {
									return true;
								}
							}
							for (let i = 0; i < argsTocheck.length; i++) {
								if (this.findChromeExpression(argsTocheck[i], this.removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'AssignmentExpression':
							data.isReturn = true;
							data.returnExpr = expression;
							data.returnName = expression.left.name;

							return this.findChromeExpression(expression.right, data, onError);
						case 'FunctionExpression':
						case 'FunctionDeclaration':
							data.isReturn = false;
							for (let i = 0; i < expression.body.body.length; i++) {
								if (this.findChromeExpression(expression.body.body[i], this
									.removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'ExpressionStatement':
							return this.findChromeExpression(expression.expression, data, onError);
						case 'SequenceExpression':
							data.isReturn = false;
							var lastExpression = expression.expressions.length - 1;
							for (let i = 0; i < expression.expressions.length; i++) {
								if (i === lastExpression) {
									data.isReturn = true;
								}
								if (this.findChromeExpression(expression.expressions[i], this
									.removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'UnaryExpression':
						case 'ConditionalExpression':
							data.isValidReturn = false;
							data.isReturn = true;
							if (this.findChromeExpression(expression.consequent, this
								.removeObjLink(data), onError)) {
								return true;
							}
							if (this.findChromeExpression(expression.alternate, this
								.removeObjLink(data), onError)) {
								return true;
							}
							break;
						case 'IfStatement':
							data.isReturn = false;
							if (this.findChromeExpression(expression.consequent, this
								.removeObjLink(data), onError)) {
								return true;
							}
							if (expression.alternate &&
								this.findChromeExpression(expression.alternate, this
									.removeObjLink(data),
									onError)) {
								return true;
							}
							break;
						case 'LogicalExpression':
						case 'BinaryExpression':
							data.isReturn = true;
							data.isValidReturn = false;
							if (this.findChromeExpression(expression.left, this.removeObjLink(data),
								onError)) {
								return true;
							}
							if (this.findChromeExpression(expression.right, this
								.removeObjLink(data),
								onError)) {
								return true;
							}
							break;
						case 'BlockStatement':
							data.isReturn = false;
							for (let i = 0; i < expression.body.length; i++) {
								if (this.findChromeExpression(expression.body[i], this
									.removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'ReturnStatement':
							data.isReturn = true;
							data.returnExpr = expression;
							data.isValidReturn = false;
							return this.findChromeExpression(expression.argument, data, onError);
						case 'ObjectExpressions':
							data.isReturn = true;
							data.isValidReturn = false;
							for (let i = 0; i < expression.properties.length; i++) {
								if (this.findChromeExpression(expression.properties[i].value, this
									.removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
					}
					return false;
				}
				private static generateOnError(container: Array<Array<TransferOnErrorError>>): (
					position: TransferOnErrorError, passes: number
				) => void {
					return (position: TransferOnErrorError, passes: number) => {
						if (!container[passes]) {
							container[passes] = [position];
						} else {
							container[passes].push(position);
						}
					};
				}
				private static replaceChromeCalls(lines: Array<string>, passes: number,
					onError: TransferOnError): string {
					//Analyze the file
					var file = new window.TernFile('[doc]');
					file.text = lines.join('\n');
					var srv = new window.CodeMirror.TernServer({
						defs: [window.ecma5, window.ecma6, window.browserDefs]
					});
					window.tern.withContext(srv.cx, () => {
						file.ast = window.tern.parse(file.text, srv.passes, {
							directSourceFile: file,
							allowReturnOutsideFunction: true,
							allowImportExportEverywhere: true,
							ecmaVersion: srv.ecmaVersion
						});
					});

					const scriptExpressions = file.ast.body;

					let index = 0;
					const lineSeperators = [];
					for (let i = 0; i < lines.length; i++) {
						lineSeperators.push({
							start: index,
							end: index += lines[i].length + 1
						});
					}

					let script = file.text;

					//Check all expressions for chrome calls
					const persistentData: {
						lines: Array<any>,
						lineSeperators: Array<any>,
						script: string,
						passes: number,
						diagnostic?: boolean;
					} = {
							lines: lines,
							lineSeperators: lineSeperators,
							script: script,
							passes: passes
						};

					let expression;
					if (passes === 0) {
						//Do one check, not replacing anything, to find any possible errors already
						persistentData.diagnostic = true;
						for (let i = 0; i < scriptExpressions.length; i++) {
							expression = scriptExpressions[i];
							this.findChromeExpression(expression, {
								persistent: persistentData
							} as ChromePersistentData, onError);
						}
						persistentData.diagnostic = false;
					}

					for (let i = 0; i < scriptExpressions.length; i++) {
						expression = scriptExpressions[i];
						if (this.findChromeExpression(expression, {
							persistent: persistentData
						} as ChromePersistentData, onError)) {
							script = this.replaceChromeCalls(persistentData.lines.join('\n')
								.split('\n'), passes + 1, onError);
							break;
						}
					}

					return script;
				}
				private static removePositionDuplicates(arr: Array<TransferOnErrorError>):
					Array<TransferOnErrorError> {
					var jsonArr: Array<string> = [];
					arr.forEach((item, index) => {
						jsonArr[index] = JSON.stringify(item);
					});
					jsonArr = jsonArr.filter((item, pos) => {
						return jsonArr.indexOf(item) === pos;
					});
					return jsonArr.map((item) => {
						return JSON.parse(item);
					});
				}
				static replace(script: string, onError: (
					oldScriptErrors: Array<TransferOnErrorError>,
					newScriptErrors: Array<TransferOnErrorError>,
					parseError?: boolean
				) => void): string {
					//Remove execute locally
					const lineIndex = script.indexOf('/*execute locally*/');
					if (lineIndex !== -1) {
						script = script.replace('/*execute locally*/\n', '');
						if (lineIndex === script.indexOf('/*execute locally*/')) {
							script = script.replace('/*execute locally*/', '');
						}
					}

					const errors: Array<Array<TransferOnErrorError>> = [];
					try {
						script = this.replaceChromeCalls(script.split('\n'), 0,
							this.generateOnError(errors));
					} catch (e) {
						onError(null, null, true);
						return script;
					}

					const firstPassErrors = errors[0];
					const finalPassErrors = errors[errors.length - 1];
					if (finalPassErrors) {
						onError(this.removePositionDuplicates(firstPassErrors),
							this.removePositionDuplicates(finalPassErrors));
					}

					return script;
				}
			}
			static generateScriptUpgradeErrorHandler(id: number): ScriptUpgradeErrorHandler {
				return function (oldScriptErrors, newScriptErrors, parseError) {
					chrome.storage.local.get(function (keys: CRM.StorageLocal) {
						if (!keys.upgradeErrors) {
							var val: {
								[key: number]: {
									oldScript: Array<CursorPosition>;
									newScript: Array<CursorPosition>;
									generalError: boolean;
								}
							} = {};
							val[id] = {
								oldScript: oldScriptErrors,
								newScript: newScriptErrors,
								generalError: parseError
							};

							keys.upgradeErrors = val;
							window.app.storageLocal.upgradeErrors = val;
						}
						keys.upgradeErrors[id] = window.app.storageLocal.upgradeErrors[id] = {
							oldScript: oldScriptErrors,
							newScript: newScriptErrors,
							generalError: parseError
						};
						chrome.storage.local.set({ upgradeErrors: keys.upgradeErrors });
					});
				};
			};
			static convertScriptFromLegacy(script: string, id: number, method: SCRIPT_CONVERSION_TYPE): string {
				//Remove execute locally
				let usedExecuteLocally = false;
				const lineIndex = script.indexOf('/*execute locally*/');
				if (lineIndex !== -1) {
					script = script.replace('/*execute locally*/\n', '');
					if (lineIndex === script.indexOf('/*execute locally*/')) {
						script = script.replace('/*execute locally*/', '');
					}
					usedExecuteLocally = true;
				}

				try {
					switch (method) {
						case SCRIPT_CONVERSION_TYPE.CHROME:
							script = this.chromeCallsReplace.replace(script,
								this.generateScriptUpgradeErrorHandler(id));
							break;
						case SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE:
							script = usedExecuteLocally ?
								this.localStorageReplace.replaceCalls(script.split('\n')) : script;
							break;
						case SCRIPT_CONVERSION_TYPE.BOTH:
							const localStorageConverted = usedExecuteLocally ?
								this.localStorageReplace.replaceCalls(script.split('\n')) : script;
							script = this.chromeCallsReplace.replace(localStorageConverted,
								this.generateScriptUpgradeErrorHandler(id)
							);
							break;
					}
				} catch (e) {
					return script;
				}

				return script;
			}
		};

		/**
		 * Dom listeners for this node
		 */
		static listeners = class CRMAppListeners {
			static _toggleBugReportingTool() {
				window.errorReportingTool.toggleVisibility();
			};

			static toggleToolsRibbon() {
				const horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
				const bcr = horizontalCenterer.getBoundingClientRect();
				const viewportWidth = bcr.width + 20;

				$(window.doc.editorToolsRibbonContainer).animate({
					marginLeft: window.app.storageLocal.hideToolsRibbon ? '0' : 
						'-200px'
				}, {
					duration: 250,
					easing: ($ as JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.doc.fullscreenEditorEditor.style.width = 
							`${viewportWidth - 200 - now}px`;
						window.doc.fullscreenEditorEditor.style.marginLeft = 
							`${now + 200}px`;
						(window.scriptEdit || window.scriptEdit).getCmInstance().editor.layout();
					}
				});
				window.app.storageLocal.hideToolsRibbon = !window.app.storageLocal.hideToolsRibbon;
				window.app.upload();
			};

			static launchSearchWebsiteTool() {
				if (this.parent().item && this.parent().item.type === 'script' && window.scriptEdit) {
					const paperSearchWebsiteDialog = this.parent().$.paperSearchWebsiteDialog;
					paperSearchWebsiteDialog.init();
					paperSearchWebsiteDialog.show();
				}
			};

			static launchExternalEditorDialog() {
				if (!(window.doc.externalEditorDialogTrigger as HTMLElement & {
					disabled: boolean;
				}).disabled) {
					window.externalEditor.init();
					window.externalEditor.editingCRMItem =
						((window.scriptEdit && window.scriptEdit.active) ?
							window.scriptEdit.item : window.stylesheetEdit.item) as any;
					window.externalEditor.setupExternalEditing();
				}
			};

			static runJsLint() {
				window.scriptEdit.editorManager.performLint();
			};

			static runCssLint() {
				window.stylesheetEdit.editorManager.performLint();
			};

			static showCssTips() {
				window.doc.cssEditorInfoDialog.open();
			};

			static showManagePermissions() {
				this.parent().requestPermissions([], true);
			};

			static iconSwitch(e: Polymer.ClickEvent, type: {
				x?: any;
			} | number) {
				let i;
				let crmEl;
				let selectedType = this.parent().crmType;
				if (typeof type === 'number') {
					for (i = 0; i < 6; i++) {
						crmEl = this.parent().shadowRoot.querySelectorAll('.crmType').item(i) as HTMLElement;
						if (i === type) {
							crmEl.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
							crmEl.style.backgroundColor = 'rgb(243,243,243)';
							crmEl.classList.add('toggled');

							const child = document.createElement('div');
							if (i === 5) {
								child.classList.add('crmTypeShadowMagicElementRight');
							} else {
								child.classList.add('crmTypeShadowMagicElement');
							}
							crmEl.appendChild(child);

							selectedType = i;
						} else {
							//Drop an element for some magic
							crmEl.style.boxShadow = 'none';
							crmEl.style.backgroundColor = 'white';
							crmEl.classList.remove('toggled');

							$(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();
						}
					}
				} else {
					const element = this.parent().util.findElementWithClassName(e.path, 'crmType');
					const crmTypes = this.parent().shadowRoot.querySelectorAll('.crmType');
					for (i = 0; i < 6; i++) {
						crmEl = crmTypes.item(i) as HTMLElement;
						if (crmEl === element) {
							crmEl.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
							crmEl.style.backgroundColor = 'rgb(243,243,243)';
							crmEl.classList.add('toggled');

							const child = document.createElement('div');
							if (i === 5) {
								child.classList.add('crmTypeShadowMagicElementRight');
							} else {
								child.classList.add('crmTypeShadowMagicElement');
							}
							crmEl.appendChild(child);

							selectedType = i;
						} else {
							//Drop an element for some magic
							crmEl.style.boxShadow = 'none';
							crmEl.style.backgroundColor = 'white';
							crmEl.classList.remove('toggled');

							$(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();
						}
					}
				}
				chrome.storage.local.set({
					selectedCrmType: selectedType
				});
				if (this.parent().crmType !== selectedType) {
					this.parent().crmType = selectedType;
					this.parent().fire('crmTypeChanged', {});
				}
			};

			static _generateRegexFile() {
				const filePath = this.parent().$.URISchemeFilePath.$$('input').value.replace(/\\/g, '\\\\');
				const schemeName = this.parent().$.URISchemeSchemeName.$$('input').value;

				const regFile = [
					'Windows Registry Editor Version 5.00',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + ']',
					'@="URL:' + schemeName + ' Protocol"',
					'"URL Protocol"=""',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
					'@="\\"' + filePath + '\\""'
				].join('\n');
				chrome.permissions.contains({
					permissions: ['downloads']
				}, function (hasPermission) {
					if (hasPermission) {
						chrome.downloads.download({
							url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
							filename: schemeName + '.reg'
						});
					} else {
						chrome.permissions.request({
							permissions: ['downloads']
						}, function () {
							chrome.downloads.download({
								url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
								filename: schemeName + '.reg'
							});
						});
					}
				});
			};

			static globalExcludeChange(e: Polymer.ClickEvent) {
				const input = this.parent().util.findElementWithTagname(e.path, 'paper-input');

				let excludeIndex = null;
				const allExcludes = document.getElementsByClassName('globalExcludeContainer');
				for (let i = 0; i < allExcludes.length; i++) {
					if (allExcludes[i] === input.parentNode) {
						excludeIndex = i;
						break;
					}
				}
				if (excludeIndex === null) {
					return;
				}

				const value = input.value;
				this.parent().globalExcludes[excludeIndex] = value;
				this.parent().set('globalExcludes', this.parent().globalExcludes);
				chrome.storage.local.set({
					globalExcludes: this.parent().globalExcludes
				});
			};


			static removeGlobalExclude(e: Polymer.ClickEvent) {
				const node = this.parent().util.findElementWithTagname(e.path, 'paper-icon-button');

				let excludeIndex = null;
				const allExcludes = document.getElementsByClassName('globalExcludeContainer');
				for (let i = 0; i < allExcludes.length; i++) {
					if (allExcludes[i] === node.parentNode) {
						excludeIndex = i;
						break;
					}
				}
				if (excludeIndex === null) {
					return;
				}

				this.parent().splice('globalExcludes', excludeIndex, 1);
			};

			static async importData() {
				const dataString = this.parent().$.importSettingsInput.value;
				if (!this.parent().$.oldCRMImport.checked) {
					let data: {
						crm?: CRM.Tree;
						local?: CRM.StorageLocal;
						nonLocal?: CRM.SettingsStorage;
						storageLocal?: CRM.StorageLocal;
					};
					try {
						data = JSON.parse(dataString) as {
							local?: CRM.StorageLocal;
							storageLocal?: CRM.StorageLocal;
							settings: CRM.SettingsStorage;
						};
						this.parent().$.importSettingsError.style.display = 'none';
					} catch (e) {
						this.parent().$.importSettingsError.style.display = 'block';
						return;
					}

					const overWriteImport = this.parent().$.overWriteImport;
					if (overWriteImport.checked && (data.local || data.storageLocal)) {
						this.parent().settings = data.nonLocal || this.parent().settings;
						this.parent().storageLocal = data.local || this.parent().storageLocal;
					}
					if (data.crm) {
						if (overWriteImport.checked) {
							this.parent().settings.crm = this.parent().util.crmForEach(data.crm, (node) => {
								node.id = this.parent().generateItemId();
							});
						} else {
							this.parent().addImportedNodes(data.crm);
						}
						this.parent().editCRM.build({
							superquick: true
						});
					}
					this.parent().upload();
				} else {
					try {
						const settingsArr: Array<any> = dataString.split('%146%');
						if (settingsArr[0] === 'all') {
							this.parent().storageLocal.showOptions = settingsArr[2];

							const rows = settingsArr.slice(6);
							class LocalStorageWrapper {
								getItem(index: 'numberofrows' | number): string {
									if (index === 'numberofrows') {
										return '' + (rows.length - 1);
									}
									return rows[index];
								}
							}

							const crm = await this.parent().transferCRMFromOld(settingsArr[4], new LocalStorageWrapper());
							this.parent().settings.crm = crm;
							this.parent().editCRM.build({
								superquick: true
							});
							this.parent().upload();
						} else {
							alert('This method of importing no longer works, please export all your settings instead');
						}
					} catch (e) {
						this.parent().$.importSettingsError.style.display = 'block';
						return;
					}
				}
			};

			static exportData() {
				const toExport: {
					crm?: CRM.SafeTree;
					local?: CRM.StorageLocal;
					nonLocal?: CRM.SettingsStorage;
				} = {} as any;
				if (this.parent().$.exportCRM.checked) {
					toExport.crm = JSON.parse(JSON.stringify(this.parent().settings.crm));
					for (let i = 0; i < toExport.crm.length; i++) {
						toExport.crm[i] = this.parent().editCRM.makeNodeSafe(toExport.crm[i] as CRM.Node);
					}
				}
				if (this.parent().$.exportSettings.checked) {
					toExport.local = this.parent().storageLocal;
					toExport.nonLocal = JSON.parse(JSON.stringify(this.parent().settings));
					delete toExport.nonLocal.crm;
				}
				window.doc.exportSettingsSpinner.hide = false;
				window.setTimeout(() => {
					this.parent().$.exportSettingsOutput.value = JSON.stringify(toExport);
					window.requestAnimationFrame(() => {
						window.doc.exportSettingsSpinner.hide = true;
					});
				}, 100);
			};


			static addGlobalExcludeField() {
				this.parent().push('globalExcludes', '');
			};


			static _openLogging() {
				window.open(chrome.runtime.getURL('html/logging.html'), '_blank');
			};

			static hideGenericToast() {
				this.parent().$.messageToast.hide();
			};

			static nextUpdatedScript() {
				let index = this.parent().$.scriptUpdatesToast.index;
				this.parent().$.scriptUpdatesToast.text = this.parent()._getUpdatedScriptString(
					this.parent().$.scriptUpdatesToast.scripts[++index]);
				this.parent().$.scriptUpdatesToast.index = index;

				if (this.parent().$.scriptUpdatesToast.scripts.length - index > 1) {
					this.parent().$.nextScriptUpdateButton.style.display = 'inline';
				} else {
					this.parent().$.nextScriptUpdateButton.style.display = 'none';
				}
			};

			static hideScriptUpdatesToast() {
				this.parent().$.scriptUpdatesToast.hide();
			};

			private static copyFromElement(target: HTMLTextAreaElement, button: HTMLPaperIconButtonElement) {
				const snipRange = document.createRange();
				snipRange.selectNode(target);
				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(snipRange);

				try {
					document.execCommand('copy');
					button.icon = 'done';
				} catch (err) {
					// Copy command is not available
					console.error(err);
					button.icon = 'error';
				}
				// Return to the copy button after a second.
				this.parent().async(function () {
					button.icon = 'content-copy';
				}, 1000);
				selection.removeAllRanges();
			}

			static copyExportDialogToClipboard() {
				this.copyFromElement(this.parent().$.exportJSONData,
					this.parent().$.dialogCopyButton);
			};

			static copyExportToClipboard() {
				this.copyFromElement(this.parent().$.exportSettingsOutput,
					this.parent().$.exportCopyButton);
			}

			static goNextVersionUpdateTab() {
				if (this.parent().versionUpdateTab === 4) {
					this.parent().$.versionUpdateDialog.close();
				} else {
					const nextTabIndex = this.parent().versionUpdateTab + 1;
					const tabs = (document.getElementsByClassName('versionUpdateTab') as any) as Array<HTMLElement>;
					const selector = tabs[nextTabIndex];
					selector.style.height = 'auto';

					let i;
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'none';
					}
					const newHeight = $(selector).innerHeight();
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'block';
					}
					selector.style.height = '0';

					const _this = this;
					const newHeightPx = newHeight + 'px';
					const tabCont = this.parent().$.versionUpdateTabSlider;

					const currentHeight = tabCont.getBoundingClientRect().height;
					if (newHeight > currentHeight) {
						tabCont.animate([
							{
								height: currentHeight + 'px'
							}, {
								height: newHeightPx
							}
						], {
								duration: 500,
								easing: 'bez'
							}).onfinish = function () {
								tabCont.style.height = newHeightPx;
								selector.style.height = 'auto';
								_this.parent().versionUpdateTab = nextTabIndex;
							};
					} else {
						selector.style.height = 'auto';
						_this.parent().versionUpdateTab = nextTabIndex;
						setTimeout(function () {
							tabCont.animate([
								{
									height: currentHeight + 'px'
								}, {
									height: newHeightPx
								}
							], {
								duration: 500,
								easing: 'bez'
							}).onfinish = function () {
								tabCont.style.height = newHeightPx;
							};
						}, 500);
					}
				}
			}

			static goPrevVersionUpdateTab() {
				if (this.parent().versionUpdateTab !== 0) {
					const prevTabIndex = this.parent().versionUpdateTab - 1;
					const tabs = (document.getElementsByClassName('versionUpdateTab') as any) as Array<HTMLElement>;
					const selector = tabs[prevTabIndex];
					selector.style.height = 'auto';

					let i;
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'none';
					}
					const newHeight = $(selector).innerHeight();
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'block';
					}
					selector.style.height = '0';

					const _this = this;
					const newHeightPx = newHeight + 'px';
					const tabCont = this.parent().$.versionUpdateTabSlider;

					const currentHeight = tabCont.getBoundingClientRect().height;
					if (newHeight > currentHeight) {
						tabCont.animate([
							{
								height: currentHeight + 'px'
							}, {
								height: newHeightPx
							}
						], {
								duration: 500,
								easing: 'bez'
							}).onfinish = function () {
								tabCont.style.height = newHeightPx;
								selector.style.height = 'auto';
								_this.parent().versionUpdateTab = prevTabIndex;
							};
					} else {
						selector.style.height = 'auto';
						_this.parent().versionUpdateTab = prevTabIndex;
						setTimeout(function () {
							tabCont.animate([
								{
									height: currentHeight + 'px'
								}, {
									height: newHeightPx
								}
							], {
									duration: 500,
									easing: 'bez'
								}).onfinish = function () {
									tabCont.style.height = newHeightPx;
								};
						}, 500);
					}
				}
			};

			private static _applyAddedPermissions() {
				const _this = this;
				const panels = Array.prototype.slice.apply(
					window.doc.addedPermissionsTabContainer
						.querySelectorAll('.nodeAddedPermissionsCont'));
				panels.forEach(function (panel: HTMLElement) {
					const node = _this.parent().nodesById[(panel.getAttribute('data-id') as any) as number] as CRM.ScriptNode;
					const permissions = Array.prototype.slice.apply(panel.querySelectorAll('paper-checkbox'))
						.map(function (checkbox: HTMLPaperCheckboxElement) {
							if (checkbox.checked) {
								return checkbox.getAttribute('data-permission');
							}
							return null;
						}).filter(function (permission: string) {
							return !!permission;
						});
					if (!Array.isArray(node.permissions)) {
						node.permissions = [];
					}
					permissions.forEach(function (addedPermission: CRM.Permission) {
						if (node.permissions.indexOf(addedPermission) === -1) {
							node.permissions.push(addedPermission);
						}
					});
				});
				this.parent().upload();
			};

			static addedPermissionNext() {
				const cont = window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer;
				if (cont.tab === cont.maxTabs - 1) {
					window.doc.addedPermissionsDialog.close();
					this._applyAddedPermissions();
					return;
				}

				if (cont.tab + 2 !== cont.maxTabs) {
					(window.doc.addedPermissionNextButton.querySelector('.close') as HTMLElement).style.display = 'none';
					(window.doc.addedPermissionNextButton.querySelector('.next') as HTMLElement).style.display = 'block';
				} else {
					(window.doc.addedPermissionNextButton.querySelector('.close') as HTMLElement).style.display = 'block';
					(window.doc.addedPermissionNextButton.querySelector('.next') as HTMLElement).style.display = 'none';
				}
				cont.style.marginLeft = (++cont.tab * -800) + 'px';
				window.doc.addedPermissionPrevButton.style.display = 'block';
			};

			static addedPermissionPrev() {
				const cont = window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer;
				cont.style.marginLeft = (--cont.tab * -800) + 'px';

				window.doc.addedPermissionPrevButton.style.display = (cont.tab === 0 ? 'none' : 'block');
			};

			private static _getCodeSettingsFromDialog(): CRM.Options {
				const obj: CRM.Options = {};
				Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('.codeSettingSetting'))
					.forEach((element: HTMLElement) => {
						let value: CRM.OptionsValue;
						const key = element.getAttribute('data-key');
						const type = element.getAttribute('data-type') as CRM.OptionsValue['type'];
						const currentVal = (this.parent().$.codeSettingsDialog.item.value.options as CRM.Options)[key];
						switch (type) {
							case 'number':
								value = this.parent().templates.mergeObjects(currentVal, {
									value: ~~element.querySelector('paper-input').value
								});
								break;
							case 'string':
								value = this.parent().templates.mergeObjects(currentVal, {
									value: element.querySelector('paper-input').value
								});
								break;
							case 'boolean':
								value = this.parent().templates.mergeObjects(currentVal, {
									value: element.querySelector('paper-checkbox').checked
								});
								break;
							case 'choice':
								value = this.parent().templates.mergeObjects(currentVal, {
									selected: element.querySelector('paper-dropdown-menu').selected
								});
								break;
							case 'array':
								const arrayInput = element.querySelector('paper-array-input');
								arrayInput.saveSettings();
								let values = arrayInput.values;
								if ((currentVal as CRM.OptionArray).items === 'string') {
									//Strings
									values = values.map(value => value + '');
								} else {
									//Numbers
									values = values.map(value => ~~value);
								}
								value = this.parent().templates.mergeObjects(currentVal, {
									value: values
								});
								break;
						}
						obj[key] = value;
					});
				return obj;
			}

			static confirmCodeSettings() {
				this.parent().$.codeSettingsDialog.item.value.options = this._getCodeSettingsFromDialog();

				this.parent().upload();
			}

			private static _getLocalStorageKey(key: string): any {
				const data = localStorage.getItem(key);
				if (data === undefined || data === null) {
					return false;
				}
				return data;
			};


			static exportToLegacy() {
				let data = ["all", this._getLocalStorageKey('firsttime'),
					this._getLocalStorageKey('options'),
					this._getLocalStorageKey('firsttime'),
					this._getLocalStorageKey('firsttime'),
					this._getLocalStorageKey('firsttime'),
					localStorage.getItem('optionson'),
					localStorage.getItem('waitforsearch'),
					localStorage.getItem('whatpage'),
					localStorage.getItem('numberofrows')].join('%146%');

				const rows = localStorage.getItem('numberofrows') || 0;
				for (let i = 1; i <= rows; i++) {
					data += "%146%" + localStorage.getItem(i + '');
				}

				window.doc.exportToLegacyOutput.value = data;
			};

			static exitFullscreen() {
				const dialog = this.parent().item.type === 'script' ?
					window.scriptEdit : window.stylesheetEdit;
				dialog.exitFullScreen();
			}

			static toggleFullscreenOptions() {
				const dialog = this.parent().item.type === 'script' ?
					window.scriptEdit : window.stylesheetEdit;
				dialog.toggleOptions();
			}

			static parent() {
				return window.app;
			}
		}

		/**
		 * Any templates
		 */
		static templates = class CRMAppTemplates {
			/**
			 * Merges two arrays
			 */
			static mergeArrays<T extends Array<T> | Array<U>, U>(mainArray: T, additionArray: T): T {
				for (let i = 0; i < additionArray.length; i++) {
					if (mainArray[i] && typeof additionArray[i] === 'object' &&
						mainArray[i] !== undefined && mainArray[i] !== null) {
						if (Array.isArray(additionArray[i])) {
							mainArray[i] = this.mergeArrays<T, U>(mainArray[i] as T,
								additionArray[i] as T);
						} else {
							mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
						}
					} else {
						mainArray[i] = additionArray[i];
					}
				}
				return mainArray;
			};

			/**
			 * Merges two objects
			 */
			static mergeObjects<T extends {
				[key: string]: any;
				[key: number]: any;
			}, Y extends Partial<T>>(mainObject: T, additions: Y): T & Y {
				for (let key in additions) {
					if (additions.hasOwnProperty(key)) {
						if (typeof additions[key] === 'object' &&
							typeof mainObject[key] === 'object' &&
							mainObject[key] !== undefined &&
							mainObject[key] !== null) {
							if (Array.isArray(additions[key])) {
								mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
							} else {
								mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
							}
						} else {
							mainObject[key] = (additions[key] as any) as T[keyof T];
						}
					}
				}
				return mainObject as T & Y;
			};

			static mergeObjectsWithoutAssignment<T extends {
				[key: string]: any;
				[key: number]: any;
			}, Y extends Partial<T>>(mainObject: T, additions: Y) {
				for (let key in additions) {
					if (additions.hasOwnProperty(key)) {
						if (typeof additions[key] === 'object' &&
							mainObject[key] !== undefined &&
							mainObject[key] !== null) {
							if (Array.isArray(additions[key])) {
								this.mergeArrays(mainObject[key], additions[key]);
							} else {
								this.mergeObjects(mainObject[key], additions[key]);
							}
						} else {
							mainObject[key] = additions[key];
						}
					}
				}
			}

			static getDefaultNodeInfo(options: Partial<CRM.NodeInfo> = {}): CRM.NodeInfo {
				const defaultNodeInfo: Partial<CRM.NodeInfo> = {
					permissions: [],
					installDate: new Date().toLocaleDateString(),
					lastUpdatedAt: Date.now(),
					version: '1.0',
					isRoot: false,
					source: 'local'
				};

				return this.mergeObjects(defaultNodeInfo, options) as CRM.NodeInfo;
			};

			/**
			 * Gets the default link node object with given options applied
			 */
			static getDefaultLinkNode(options: Partial<CRM.LinkNode> = {}): CRM.LinkNode {
				const defaultNode: Partial<CRM.LinkNode> = {
					name: 'name',
					onContentTypes: [true, true, true, false, false, false],
					type: 'link',
					showOnSpecified: false,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [{
						url: '*://*.example.com/*',
						not: false
					}],
					isLocal: true,
					value: [
						{
							newTab: true,
							url: 'https://www.example.com'
						}
					]
				};

				return this.mergeObjects(defaultNode, options) as CRM.LinkNode;
			};

			/**
			 * Gets the default stylesheet value object with given options applied
			 */
			static getDefaultStylesheetValue(options: Partial<CRM.StylesheetVal> = {}): CRM.StylesheetVal {
				const value: CRM.StylesheetVal = {
					stylesheet: [].join('\n'),
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					toggle: false,
					defaultOn: false,
					options: {},
					convertedStylesheet: null
				};

				return this.mergeObjects(value, options) as CRM.StylesheetVal;
			};

			/**
			 * Gets the default script value object with given options applied
			 */
			static getDefaultScriptValue(options: Partial<CRM.ScriptVal> = {}): CRM.ScriptVal {
				const value: CRM.ScriptVal = {
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					backgroundLibraries: [],
					libraries: [],
					script: [].join('\n'),
					backgroundScript: '',
					metaTags: {},
					options: {}
				};

				return this.mergeObjects(value, options) as CRM.ScriptVal;
			};

			/**
			 * Gets the default script node object with given options applied
			 */
			static getDefaultScriptNode(options: CRM.PartialScriptNode = {}): CRM.ScriptNode {
				const defaultNode: CRM.PartialScriptNode = {
					name: 'name',
					onContentTypes: [true, true, true, false, false, false],
					type: 'script',
					isLocal: true,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [
						{
							url: '*://*.example.com/*',
							not: false
						}
					],
					value: this.getDefaultScriptValue(options.value)
				};

				return this.mergeObjects(defaultNode, options) as CRM.ScriptNode;
			};

			/**
			 * Gets the default stylesheet node object with given options applied
			 */
			static getDefaultStylesheetNode(options: CRM.PartialStylesheetNode = {}): CRM.StylesheetNode {
				const defaultNode: CRM.PartialStylesheetNode = {
					name: 'name',
					onContentTypes: [true, true, true, false, false, false],
					type: 'stylesheet',
					isLocal: true,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [
						{
							url: '*://*.example.com/*',
							not: false
						}
					],
					value: this.getDefaultStylesheetValue(options.value)
				};

				return this.mergeObjects(defaultNode, options) as CRM.StylesheetNode;
			};

			/**
			 * Gets the default divider or menu node object with given options applied
			 */
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'divider' | 'menu'):
				CRM.DividerNode | CRM.MenuNode;
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'divider'): CRM.DividerNode;
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'menu'): CRM.MenuNode;
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode> = {}, type: 'divider' | 'menu'):
				CRM.DividerNode | CRM.MenuNode {
				const defaultNode: Partial<CRM.PassiveNode> = {
					name: 'name',
					type: type,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					onContentTypes: [true, true, true, false, false, false],
					isLocal: true,
					value: null
				};

				return this.mergeObjects(defaultNode, options) as CRM.DividerNode | CRM.MenuNode;
			};

			/**
			 * Gets the default divider node object with given options applied
			 */
			static getDefaultDividerNode(options: Partial<CRM.DividerNode> = {}): CRM.DividerNode {
				return this.getDefaultDividerOrMenuNode(options, 'divider');
			};

			/**
			 * Gets the default menu node object with given options applied
			 */
			static getDefaultMenuNode(options: Partial<CRM.MenuNode> = {}): CRM.MenuNode {
				return this.getDefaultDividerOrMenuNode(options, 'menu');
			};

			/**
			 * Gets all permissions that can be requested by this extension
			 */
			static getPermissions(): Array<CRM.Permission> {
				return [
					'alarms',
					'activeTab',
					'background',
					'bookmarks',
					'browsingData',
					'clipboardRead',
					'clipboardWrite',
					'contentSettings',
					'cookies',
					'contentSettings',
					'contextMenus',
					'declarativeContent',
					'desktopCapture',
					'downloads',
					'history',
					'identity',
					'idle',
					'management',
					'pageCapture',
					'power',
					'privacy',
					'printerProvider',
					'sessions',
					'system.cpu',
					'system.memory',
					'system.storage',
					'topSites',
					'tabs',
					'tabCapture',
					'tts',
					'webNavigation',
					'webRequest',
					'webRequestBlocking'
				];
			};

			/**
			 * Gets all permissions that can be requested by this extension including those specific to scripts
			 */
			static getScriptPermissions(): Array<CRM.Permission> {
				return [
					'alarms',
					'activeTab',
					'background',
					'bookmarks',
					'browsingData',
					'clipboardRead',
					'clipboardWrite',
					'contentSettings',
					'cookies',
					'contentSettings',
					'contextMenus',
					'declarativeContent',
					'desktopCapture',
					'downloads',
					'history',
					'identity',
					'idle',
					'management',
					'pageCapture',
					'power',
					'privacy',
					'printerProvider',
					'sessions',
					'system.cpu',
					'system.memory',
					'system.storage',
					'topSites',
					'tabs',
					'tabCapture',
					'tts',
					'webNavigation',
					'webRequest',
					'webRequestBlocking',

					//Script-specific permissions
					'crmGet',
					'crmWrite',
					'crmRun',
					'chrome',

					//GM_Permissions
					'GM_info',
					'GM_deleteValue',
					'GM_getValue',
					'GM_listValues',
					'GM_setValue',
					'GM_getResourceText',
					'GM_getResourceURL',
					'GM_addStyle',
					'GM_log',
					'GM_openInTab',
					'GM_registerMenuCommand',
					'GM_setClipboard',
					'GM_xmlhttpRequest',
					'unsafeWindow'
				];
			};

			/**
			 * Gets the description for given permission
			 */
			static getPermissionDescription(permission: CRM.Permission): string {
				const descriptions = {
					alarms: 'Makes it possible to create, view and remove alarms.',
					activeTab: 'Gives temporary access to the tab on which browserActions or contextmenu items are clicked',
					background: 'Runs the extension in the background even while chrome is closed. (https://developer.chrome.com/extensions/alarms)',
					bookmarks: 'Makes it possible to create, edit, remove and view all your bookmarks.',
					browsingData: 'Makes it possible to remove any saved data on your browser at specified time allowing the user to delete any history, saved passwords, cookies, cache and basically anything that is not saved in incognito mode but is in regular mode. This is editable so it is possible to delete ONLY your history and not the rest for example. (https://developer.chrome.com/extensions/bookmarks)',
					clipboardRead: 'Allows reading of the users\' clipboard',
					clipboardWrite: 'Allows writing data to the users\' clipboard',
					cookies: 'Allows for the setting, getting and listenting for changes of cookies on any website. (https://developer.chrome.com/extensions/cookies)',
					contentSettings: 'Allows changing or reading your browser settings to allow or deny things like javascript, plugins, popups, notifications or other things you can choose to accept or deny on a per-site basis. (https://developer.chrome.com/extensions/contentSettings)',
					contextMenus: 'Allows for the changing of the chrome contextmenu',
					declarativeContent: 'Allows for the running of scripts on pages based on their url and CSS contents. (https://developer.chrome.com/extensions/declarativeContent)',
					desktopCapture: 'Makes it possible to capture your screen, current tab or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
					downloads: 'Allows for the creating, pausing, searching and removing of downloads and listening for any downloads happenng. (https://developer.chrome.com/extensions/downloads)',
					history: 'Makes it possible to read your history and remove/add specific urls. This can also be used to search your history and to see howmany times you visited given website. (https://developer.chrome.com/extensions/history)',
					identity: 'Allows for the API to ask you to provide your (google) identity to the script using oauth2, allowing you to pull data from lots of google APIs: calendar, contacts, custom search, drive, gmail, google maps, google+, url shortener (https://developer.chrome.com/extensions/identity)',
					idle: 'Allows a script to detect whether your pc is in a locked, idle or active state. (https://developer.chrome.com/extensions/idle)',
					management: 'Allows for a script to uninstall or get information about an extension you installed, this does not however give permission to install other extensions. (https://developer.chrome.com/extensions/management)',
					notifications: 'Allows for the creating of notifications. (https://developer.chrome.com/extensions/notifications)',
					pageCapture: 'Allows for the saving of any page in MHTML. (https://developer.chrome.com/extensions/pageCapture)',
					power: 'Allows for a script to keep either your screen or your system altogether from sleeping. (https://developer.chrome.com/extensions/power)',
					privacy: 'Allows for a script to query what privacy features are on/off, for exaple autoFill, password saving, the translation feature. (https://developer.chrome.com/extensions/privacy)',
					printerProvider: 'Allows for a script to capture your print jobs\' content and the printer used. (https://developer.chrome.com/extensions/printerProvider)',
					sessions: 'Makes it possible for a script to get all recently closed pages and devices connected to sync, also allows it to re-open those closed pages. (https://developer.chrome.com/extensions/sessions)',
					"system.cpu": 'Allows a script to get info about the CPU. (https://developer.chrome.com/extensions/system_cpu)',
					"system.memory": 'Allows a script to get info about the amount of RAM memory on your computer. (https://developer.chrome.com/extensions/system_memory)',
					"system.storage": 'Allows a script to get info about the amount of storage on your computer and be notified when external storage is attached or detached. (https://developer.chrome.com/extensions/system_storage)',
					topSites: 'Allows a script to your top sites, which are the sites on your new tab screen. (https://developer.chrome.com/extensions/topSites)',
					tabCapture: 'Allows the capturing of the CURRENT tab and only the tab. (https://developer.chrome.com/extensions/tabCapture)',
					tabs: 'Allows for the opening, closing and getting of tabs',
					tts: 'Allows a script to use chrome\'s text so speach engine. (https://developer.chrome.com/extensions/tts)',
					webNavigation: 'Allows a script info about newly created pages and allows it to get info about what website visit at that time.' +
					' (https://developer.chrome.com/extensions/webNavigation)',
					webRequest: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. (https://developer.chrome.com/extensions/webRequest)',
					webRequestBlocking: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. This also allows the script to block certain requests for example for blocking ads or bad sites. (https://developer.chrome.com/extensions/webRequest)',

					//Script-specific descriptions
					crmGet: 'Allows the reading of your Custom Right-Click Menu, including names, contents of all nodes, what they do and some metadata for the nodes',
					crmWrite: 'Allows the writing of data and nodes to your Custom Right-Click Menu. This includes <b>creating</b>, <b>copying</b> and <b>deleting</b> nodes. Be very careful with this permission as it can be used to just copy nodes until your CRM is full and delete any nodes you had. It also allows changing current values in the CRM such as names, actual scripts in script-nodes etc.',
					crmRun: 'Allows the running of arbitrary scripts from the background-page',
					chrome: 'Allows the use of chrome API\'s',

					//Tampermonkey APIs
					GM_addStyle: 'Allows the adding of certain styles to the document through this API',
					GM_deleteValue: 'Allows the deletion of storage items',
					GM_listValues: 'Allows the listing of all storage data',
					GM_addValueChangeListener: 'Allows for the listening of changes to the storage area',
					GM_removeValueChangeListener: 'Allows for the removing of listeners',
					GM_setValue: 'Allows for the setting of storage data values',
					GM_getValue: 'Allows the reading of values from the storage',
					GM_log: 'Allows for the logging of values to the console (same as normal console.log)',
					GM_getResourceText: 'Allows the reading of the content of resources defined in the header',
					GM_getResourceURL: 'Allows the reading of the URL of the predeclared resource',
					GM_registerMenuCommand: 'Allows the adding of a button to the extension menu - not implemented',
					GM_unregisterMenuCommand: 'Allows the removing of an added button - not implemented',
					GM_openInTab: 'Allows the opening of a tab with given URL',
					GM_xmlhttpRequest: 'Allows you to make an XHR to any site you want',
					GM_download: 'Allows the downloading of data to the hard disk',
					GM_getTab: 'Allows the reading of an object that\'s persistent while the tab is open - not implemented',
					GM_saveTab: 'Allows the saving of the tab object to reopen after a page unload - not implemented',
					GM_getTabs: 'Allows the reading of all tab object - not implemented',
					GM_notification: 'Allows sending desktop notifications',
					GM_setClipboard: 'Allows copying data to the clipboard - not implemented',
					GM_info: 'Allows the reading of some script info',
					unsafeWindow: 'Allows the running on an unsafe window object - available by default'
				};

				return descriptions[permission];
			};

			static parent(): CrmApp {
				return window.app;
			}
		};

		/**
		 * Functions related to the on-page example of your current CRM
		 */
		static pageDemo = class CRMAppPageDemo {
			private static usedStylesheetIds: Array<number> = [];

			private static handlers = class CRMAppPageDemoHandlers {
				/**
				 * Makes an onclick handler for links
				 */
				static link(data: Array<CRM.LinkNodeLink>): () => void {
					return function () {
						for (let i = 0; i < data.length; i++) {
							window.open(data[i].url, '_blank');
						}
					};
				};

				/**
				 * Makes an onclick handler for scripts
				 */
				static script(script: string): () => void {
					return function () {
						alert(`This would run the script ${script}`);
					};
				};

				/**
				 * The stylesheet handlers
				 */
				static stylesheet = class CRMAppPageDemoHandlersStylesheet {
					/**
					 * Makes an onclick handler for stylesheets
					 */
					static toggle(data: string, checked: boolean): () => void {
						const state = checked;

						return function () {
							alert(`This would toggle the stylesheet ${data} ${(state ? 'on' : 'off')}`);
						};
					};
					/**
					 * Makes an onclick handler for stylesheets
					 */
					static normal(stylesheet: string): () => void {
						return function () {
							alert(`This would run the stylesheet ${stylesheet}`);
						};
					};
				};

				/**
				 * Makes an onclick handler to edit the node on clicking it
				 */
				static edit(node: CRM.Node): () => void {
					const _this = this;
					return function () {
						_this.parent().parent().editCRM.getCRMElementFromPath(node.path, true).openEditPage();
					};
				};

				private static parent(): typeof CRMAppPageDemo {
					return window.app.pageDemo;
				}
			};

			private static node = class CRMAppPageDemoNode {
				/**
				 * Adds a link to the CRM
				 */
				static link(toAdd: CRM.LinkNode): JQContextMenuObj {
					return {
						name: toAdd.name,
						callback: this.parent().handlers.link(toAdd.value)
					};
				};

				/**
				 * Adds a script to the CRM
				 */
				static script(toAdd: CRM.ScriptNode): JQContextMenuObj {
					return {
						name: toAdd.name,
						callback: this.parent().handlers.script(toAdd.value.script)
					};
				};

				/**
				 * Adds a stylesheet to the CRM
				 */
				static stylesheet(toAdd: CRM.StylesheetNode): JQContextMenuObj {
					const item: JQContextMenuObj = {
						name: toAdd.name
					} as any;
					if (toAdd.value.toggle) {
						item.type = 'checkbox';
						item.selected = toAdd.value.defaultOn;
						item.callback = this.parent().handlers.stylesheet.toggle(toAdd.value.stylesheet, toAdd.value.defaultOn);
					} else {
						item.callback = this.parent().handlers.stylesheet.normal(toAdd.value.stylesheet);
					}
					return item;
				};

				/**
				 * An editable node
				 */
				static editable(toAdd: CRM.Node): JQContextMenuObj {
					return {
						name: toAdd.name,
						callback: this.parent().handlers.edit(toAdd)
					};
				};

				/**
				 * Adds a divider to the CRM
				 */
				static divider(): string {
					return '---------';
				};


				/**
				 * Adds a menu to the CRM
				 */
				static menu(toAdd: CRM.MenuNode, crmType: number, index: {
					num: number;
				}): JQContextMenuItem {
					const _this = this;
					const item: JQContextMenuObj = {
						name: toAdd.name
					} as any;
					const childItems: {
						[key: number]: JQContextMenuItem
					} = {};
					if (_this.parent().parent().storageLocal.editCRMInRM) {
						item.callback = this.parent().handlers.edit(toAdd);
					}
					toAdd.children.forEach(function (node) {
						if (_this.parent().isNodeVisible(node, crmType)) {

							if (_this.parent().parent().storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
								childItems[index.num++] = _this.editable(node);
							} else {
								switch (node.type) {
									case 'link':
										childItems[index.num++] = _this.link(node);
										break;
									case 'script':
										childItems[index.num++] = _this.script(node);
										break;
									case 'stylesheet':
										childItems[index.num++] = _this.stylesheet(node);
										break;
									case 'divider':
										childItems[index.num++] = _this.divider();
										break;
									case 'menu':
										childItems[index.num++] = _this.menu(node, crmType, index);
										break;
								}
							}
						}
					});
					item.items = childItems;
					return item;
				};

				private static parent(): typeof CRMAppPageDemo {
					return window.app.pageDemo;
				}
			};

			/**
			 * Returns whether the node is visible or not (1 if it's visible)
			 */
			private static isNodeVisible(node: CRM.Node, showContentType: number): number {
				let i;
				let length;
				if (node.children && node.children.length > 0) {
					length = node.children.length;
					let visible = 0;
					for (i = 0; i < length; i++) {
						visible += this.isNodeVisible(node.children[i], showContentType);
					}
					if (!visible) {
						return 0;
					}
				} else {
					for (i = 0; i < 6; i++) {
						if (showContentType === i && !node.onContentTypes[i]) {
							return 0;
						}
					}
				}
				return 1;
			};

			/**
			 * Builds the context-menu for given crmType
			 *
			 * @param {Number} crmType - The type of the content the menu will be shown on
			 */
			private static buildForCrmType(crmType: number): {
				[key: number]: JQContextMenuItem
			} {
				const _this = this;
				const index = {
					num: 0
				};
				const childItems: {
					[key: number]: JQContextMenuItem
				} = {};
				const crm = window.app.settings.crm;
				crm.forEach(function (node: CRM.Node) {
					if (_this.isNodeVisible(node, crmType)) {
						if (_this.parent().storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
							childItems[index.num++] = _this.node.editable(node);
						} else {
							switch (node.type) {
								case 'link':
									childItems[index.num++] = _this.node.link(node);
									break;
								case 'script':
									childItems[index.num++] = _this.node.script(node);
									break;
								case 'stylesheet':
									childItems[index.num++] = _this.node.stylesheet(node);
									break;
								case 'divider':
									childItems[index.num++] = _this.node.divider();
									break;
								case 'menu':
									childItems[index.num++] = _this.node.menu(node, crmType, index);
									break;
							}
						}
					}
				});
				return childItems;
			};

			static getCrmTypeFromNumber(crmType: number): string {
				const types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
				return types[crmType];
			};

			private static getChildrenAmount(object: Object): number {
				let children = 0;
				for (let key in object) {
					if (object.hasOwnProperty(key)) {
						children++;
					}
				}
				return children;
			};

			private static bindContextMenu(crmType: number) {
				let items;
				const _this = this;
				if (crmType === 0) {
					items = _this.buildForCrmType(0);
					if (_this.getChildrenAmount(items) > 0) {
						($ as JQueryContextMenu).contextMenu({
							selector: '.container, #editCrm.page, .crmType.pageType',
							items: items
						} as any);
					}
				} else {
					const contentType = _this.getCrmTypeFromNumber(crmType);
					items = _this.buildForCrmType(crmType);
					if (_this.getChildrenAmount(items) > 0) {
						($ as JQueryContextMenu).contextMenu({
							selector: '#editCrm.' + contentType + ', .crmType.' + contentType + 'Type',
							items: items
						} as any);
					}
				}
			};

			private static removeContextMenus() {
				let el;
				this.usedStylesheetIds.forEach(function (id) {
					el = document.getElementById('stylesheet' + id);
					el && el.remove();
				});

				($ as JQueryContextMenu).contextMenu('destroy');
			};

			private static loadContextMenus() {
				const _this = this;
				let toLoad = 0;
				this.removeContextMenus();

				function loadContextMenus(deadline: {
					timeRemaining(): number;
				}) {
					while (toLoad < 6 && deadline.timeRemaining() > 0) {
						_this.bindContextMenu(toLoad++);

						window.requestIdleCallback(loadContextMenus);
					}
				}

				if ('requestIdleCallback' in window) {
					window.requestIdleCallback(loadContextMenus);
				} else {
					while (toLoad < 6) {
						_this.bindContextMenu(toLoad++);
					}
				}
			};

			/**
			 * Creates the on-page example
			 */
			static create() {
				if (!($ as JQueryContextMenu).contextMenu) {
					window.setTimeout(this.create.bind(this), 500);
					return;
				}

				if (this.parent().storageLocal.CRMOnPage &&
					~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] > 34) {
					this.loadContextMenus();
				} else {
					this.removeContextMenus();
				}
			};

			private static parent(): CrmApp {
				return window.app;
			}
		};

		/**
		 * CRM functions.
		 */
		static crm = class CRMAppCRMFunctions {
			private static _getEvalPath(path: Array<number>): string {
				return 'window.app.settings.crm[' + (path.join('].children[')) + ']';
			};

			static lookup(path: Array<number>, returnArray?: boolean): CRM.Node | Array<CRM.Node>;
			static lookup(path: Array<number>, returnArray: false): CRM.Node;
			static lookup(path: Array<number>, returnArray: true): Array<CRM.Node>;
			static lookup(path: Array<number>): CRM.Node;
			static lookup(path: Array<number>, returnArray: boolean = false): CRM.Node | Array<CRM.Node> {
				const pathCopy = JSON.parse(JSON.stringify(path));
				if (returnArray) {
					pathCopy.splice(pathCopy.length - 1, 1);
				}
				if (path.length === 0) {
					return window.app.settings.crm;
				}

				if (path.length === 1) {
					return (returnArray ? window.app.settings.crm : window.app.settings.crm[path[0]]);
				}

				const evalPath = this._getEvalPath(pathCopy);
				const result = eval(evalPath);
				return (returnArray ? result.children : result);
			};

			private static _lookupId(id: number, returnArray: boolean, node: CRM.Node): Array<CRM.Node> | CRM.Node | void;
			private static _lookupId(id: number, returnArray: false, node: CRM.Node): CRM.Node;
			private static _lookupId(id: number, returnArray: true, node: CRM.Node): Array<CRM.Node>;
			private static _lookupId(id: number, returnArray: boolean, node: CRM.Node): Array<CRM.Node> | CRM.Node | void {
				const nodeChildren = node.children;
				if (nodeChildren) {
					let el;
					for (let i = 0; i < nodeChildren.length; i++) {
						if (nodeChildren[i].id === id) {
							return (returnArray ? nodeChildren : node);
						}
						el = this._lookupId(id, returnArray, nodeChildren[i]);
						if (el) {
							return el;
						}
					}
				}
				return null;
			};

			static lookupId(id: number, returnArray: boolean): Array<CRM.Node> | CRM.Node;
			static lookupId(id: number, returnArray: true): Array<CRM.Node>;
			static lookupId(id: number, returnArray: false): CRM.Node;
			static lookupId(id: number, returnArray: boolean): Array<CRM.Node> | CRM.Node {
				if (!returnArray) {
					return window.app.nodesById[id];
				}

				let el;
				for (let i = 0; i < window.app.settings.crm.length; i++) {
					if (window.app.settings.crm[i].id === id) {
						return window.app.settings.crm;
					}
					el = this._lookupId(id, returnArray, window.app.settings.crm[i]);
					if (el) {
						return el;
					}
				}
				return null;
			};

			/**
			 * Adds value to the CRM
			 */
			static add<T extends CRM.Node>(value: T, position: string = 'last') {
				if (position === 'first') {
					this.parent().settings.crm = this.parent().util.insertInto(value, this.parent().settings.crm, 0);
				} else if (position === 'last' || position === undefined) {
					this.parent().settings.crm[this.parent().settings.crm.length] = value;
				} else {
					this.parent().settings.crm = this.parent().util.insertInto(value, this.parent().settings.crm);
				}
				window.app.upload();
				window.app.editCRM.build({
					setItems: window.app.editCRM.setMenus,
					superquick: true
				});
			};

			/**
			 * Moves a value in the CRM from one place to another
			 */
			static move(toMove: Array<number>, target: Array<number>, sameColumn: boolean) {
				const toMoveContainer = this.lookup(toMove, true);
				let toMoveIndex = toMove[toMove.length - 1];
				const toMoveItem = toMoveContainer[toMoveIndex];

				const newTarget = this.lookup(target, true);
				const targetIndex = target[target.length - 1];

				if (sameColumn && toMoveIndex > targetIndex) {
					this.parent().util.insertInto(toMoveItem, newTarget, targetIndex);
					toMoveContainer.splice((~~toMoveIndex) + 1, 1);
				} else {
					this.parent().util.insertInto(toMoveItem, newTarget, targetIndex);
					toMoveContainer.splice(toMoveIndex, 1);
				}
				window.app.upload();
				window.app.editCRM.build({
					setItems: window.app.editCRM.setMenus,
					quick: true
				});
			};

			private static parent(): CrmApp {
				return window.app;
			}
		};

		/**
		 * Various util functions
		 */
		static util = class CRMAppUtil {
			static createElement(tagName: keyof ElementTagNameMaps, options: {
				id?: string;
				classes?: Array<string>;
				props?: {
					[key: string]: string;
				}
			}, children: Array<Polymer.PolymerElement | string> = []): Polymer.PolymerElement {
				const el = document.createElement(tagName);
				if (options.id) {
					el.id = options.id;
				}
				if (options.classes) {
					el.classList.add.apply(el.classList, options.classes);
				}
				if (options.props) {
					for (let key in options.props) {
						el.setAttribute(key, options.props[key]);
					}
				}
				for (let i = 0; i < children.length; i++) {
					const child = children[i];
					if (typeof child === 'string') {
						el.innerText = child;
					} else {
						el.appendChild(child);
					}
				}
				return el;
			}

			static findElementWithTagname<T extends keyof ElementTagNameMaps>(path: Polymer.EventPath, tagName: T): ElementTagNameMaps[T] {
				let index = 0;
				let node = path[0];
				while (!('tagName' in node) || (node as Polymer.PolymerElement).tagName.toLowerCase() !== tagName) {
					node = path[++index];

					if (index > path.length) {
						return null;
					}
				}
				return node as ElementTagNameMaps[T]
			}

			static findElementWithClassName(path: Polymer.EventPath, className: string): Polymer.PolymerElement {
				let index = 0;
				let node = path[0];
				while (!('classList' in node) || !(node as Polymer.PolymerElement).classList.contains(className)) {
					node = path[++index];

					if (index > path.length) {
						return null;
					}
				}
				return node as Polymer.PolymerElement;
			}

			/**
			 * Inserts the value into given array
			 */
			static insertInto<T>(toAdd: T, target: Array<T>, position: number = null): Array<T> {
				if (position) {
					let temp1, i;
					let temp2 = toAdd;
					for (i = position; i < target.length; i++) {
						temp1 = target[i];
						target[i] = temp2;
						temp2 = temp1;
					}
					target[i] = temp2;
				} else {
					target.push(toAdd);
				}
				return target;
			};

			static compareObj(firstObj: {
				[key: string]: any;
			}, secondObj: {
				[key: string]: any;
			}): boolean {
				if (!secondObj) {
					return !firstObj;

				}
				if (!firstObj) {
					return false;
				}

				for (let key in firstObj) {
					if (firstObj.hasOwnProperty(key)) {
						if (typeof firstObj[key] === 'object') {
							if (typeof secondObj[key] !== 'object') {
								return false;
							}
							if (Array.isArray(firstObj[key])) {
								if (!Array.isArray(secondObj[key])) {
									return false;
								}
								// ReSharper disable once FunctionsUsedBeforeDeclared
								if (!this.compareArray(firstObj[key], secondObj[key])) {
									return false;
								}
							} else if (Array.isArray(secondObj[key])) {
								return false;
							} else {
								if (!this.compareObj(firstObj[key], secondObj[key])) {
									return false;
								}
							}
						} else if (firstObj[key] !== secondObj[key]) {
							return false;
						}
					}
				}
				return true;
			};

			static compareArray(firstArray: Array<any>, secondArray: Array<any>): boolean {
				if (!firstArray !== !secondArray) {
					return false;
				} else if (!firstArray || !secondArray) {
					return false;
				}
				const firstLength = firstArray.length;
				if (firstLength !== secondArray.length) {
					return false;
				}
				let i;
				for (i = 0; i < firstLength; i++) {
					if (typeof firstArray[i] === 'object') {
						if (typeof secondArray[i] !== 'object') {
							return false;
						}
						if (Array.isArray(firstArray[i])) {
							if (!Array.isArray(secondArray[i])) {
								return false;
							}
							if (!this.compareArray(firstArray[i], secondArray[i])) {
								return false;
							}
						} else if (Array.isArray(secondArray[i])) {
							return false;
						} else {
							if (!this.compareObj(firstArray[i], secondArray[i])) {
								return false;
							}
						}
					} else if (firstArray[i] !== secondArray[i]) {
						return false;
					}
				}
				return true;
			}

			static treeForEach(node: CRM.Node, fn: (node: CRM.Node) => any) {
				fn(node);
				if (node.children) {
					for (let i = 0; i < node.children.length; i++) {
						this.treeForEach(node.children[i], fn);
					}
				}
			}

			static crmForEach(tree: Array<CRM.Node>, fn: (node: CRM.Node) => void): CRM.Tree {
				for (let i = 0; i < tree.length; i++) {
					const node = tree[i];
					if (node.type === 'menu' && node.children) {
						this.crmForEach(node.children, fn);
					}

					fn(node);
				}
				return tree;
			};

			static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
				selector?: string, slotSelector?: string): Array<HTMLElement|Polymer.PolymerElement> | null
			static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
				selector?: K, slotSelector?: string): Array<Polymer.ElementTagNameMap[K]> | null
			static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
				selector?: string, slotSelector?: string): Array<HTMLElement> | null
			static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
				selector: K|string = null, slotSelector: string = 'slot'): Array<Polymer.ElementTagNameMap[K]|HTMLElement> | null {
					const selectFn = '$$' in parent ? (parent as any).$$ : parent.querySelector;
					const slotChildren = (selectFn.bind(parent)(slotSelector) as HTMLSlotElement).assignedNodes().filter((node) => {
						return node.nodeType !== node.TEXT_NODE;
					}) as Array<HTMLElement>;
					if (!selector) {
						return slotChildren;
					}
					const result = (slotChildren.map((node: HTMLElement) => {
						return node.querySelectorAll(selector)
					}).reduce((prev, current) => {
						let arr: Array<HTMLElement|Polymer.ElementTagNameMap[K]> = [];
						if (prev) {
							arr = arr.concat(Array.prototype.slice.apply(prev));
						}
						if (current) {
							arr = arr.concat(Array.prototype.slice.apply(current));
						}
						return arr as any;
					}) as any) as Array<Polymer.ElementTagNameMap[K]|HTMLElement>;
					if (!Array.isArray(result)) {
						return Array.prototype.slice.apply(result);
					}
					return result;
				}

			static parent(): CrmApp {
				return window.app;
			}
		}
	};

	export type CrmApp = Polymer.El<'crm-app', typeof CA & typeof crmAppProperties & {
		editCRM: EditCrm;
	}>;

	if (window.objectify) {
		Polymer(window.objectify(CA));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(CA));
		});
	}
}

type CrmApp = CRMAppElement.CrmApp;