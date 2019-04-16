/// <reference path="../../../../../elements.d.ts" />

import { MonacoEditorTSLibrariesMetaMods } from '../../../monaco-editor/monaco-editor';
import { Polymer } from '../../../../../../../tools/definitions/polymer';
import { PaperDropdownBehavior } from '../../../../inputs/paper-dropdown-behavior/paper-dropdown-behavior';
import { I18NKeys } from '../../../../../../_locales/i18n-keys';
import { I18NClass } from '../../../../../../js/shared';

declare const browserAPI: browserAPI;

namespace PaperLibrariesSelectorElement {
	export const paperLibrariesSelectorProperties: {
		usedlibraries: CRM.Library[];
		libraries: LibrarySelectorLibrary[];
		selected: number[];
		installedLibraries: CRM.InstalledLibrary[];
		mode: 'main'|'background';
		noroot: boolean;
	} = {
		/**
		 * The libraries currently in use by the script
		 */
		usedlibraries: {
			type: Array,
			notify: true
		},
		/**
		 * The libraries for use in the HTML, already marked up
		 */
		libraries: {
			type: Array,
			notify: true
		},
		/**
		 * The currently selected (used) libraries' indexes
		 */
		selected: {
			type: Array,
			notify: true
		},
		/**
		 * The libraries installed in the extension
		 */
		installedLibraries: {
			type: Array
		},
		/**
		 * The type of script that's currenly being edited (main or background)
		 */
		mode: {
			type: String,
			value: 'main'
		},
		/**
		 * Don't have the "libraries" root item
		 */
		noroot: {
			type: Boolean,
			value: false
		}
	} as any;

	interface LibrarySelectorLibrary {
		name?: string;
		isLibrary?: boolean;
		url?: string;
		code?: string;
		classes?: string;
		selected?: 'true'|'false';
	}

	export class PLS implements I18NClass {
		static is: string = 'paper-libraries-selector';

		static properties = paperLibrariesSelectorProperties;

		private static _editingInstance: {
			name: string;
			wasFullscreen: boolean;
			library: LibrarySelectorLibrary;
		} = null;

		private static _eventListeners: {
			target: HTMLElement;
			event: string;
			listener: Function;
		}[] = [];

		private static _srcNode: CRM.ScriptNode = null;

		private static _viewLibs: {
			anonymous: LibrarySelectorLibrary[];
			libraries: LibrarySelectorLibrary[];
		} = null;

		static ready(this: PaperLibrariesSelector) {
			browserAPI.storage.local.get<CRM.StorageLocal>().then((keys) => {
				if (keys.libraries) {
					this.installedLibraries = keys.libraries;
				} else {
					this.installedLibraries = [];
					browserAPI.storage.local.set({
						libaries: this.installedLibraries
					} as any);
				}
			});
			browserAPI.storage.onChanged.addListener((changes, areaName) => {
				if (areaName === 'local' && changes['libraries']) {
					this.installedLibraries = changes['libraries'].newValue;
				}
			});
		};

		static sortByName(first: LibrarySelectorLibrary, second: LibrarySelectorLibrary): number {
			return first.name[0].toLowerCase().charCodeAt(0) - second.name[0].toLowerCase().charCodeAt(0);
		}

		static categorizeLibraries(this: PaperLibrariesSelector) {
			const anonymous: LibrarySelectorLibrary[] = [];
			const selectedObj: {
				[key: string]: boolean;
			} = {};
			this.usedlibraries.forEach(function (item) {
				if (!item.name) {
					anonymous.push(item as any);
				} else {
					selectedObj[item.name.toLowerCase()] = true;
				}
			});

			return {
				anonymous,
				selectedObj
			}
		}

		private static _getLibraries(this: PaperLibrariesSelector, selectedObj: {
			[key: string]: boolean;
		}) {
			let libraries: LibrarySelectorLibrary[] = [];
			this.installedLibraries.forEach(function(item) {
				const itemCopy: LibrarySelectorLibrary = {} as any;
				itemCopy.name = item.name;
				itemCopy.isLibrary = true;
				itemCopy.url = item.url;
				if (selectedObj[item.name.toLowerCase()]) {
					itemCopy.classes = 'library iron-selected';
					itemCopy.selected = 'true';
				} else {
					itemCopy.classes = 'library';
					itemCopy.selected = 'false';
				}
				libraries.push(itemCopy);
			});
			libraries.sort(this.sortByName);
			return libraries;
		}

		private static _setSelectedLibraries(this: PaperLibrariesSelector, libraries: LibrarySelectorLibrary[]) {
			const selected: number[] = [];
			libraries.forEach(function(item, index) {
				if (item.selected === 'true') {
					selected.push(index);
				}
			});
			this.selected = selected;
		}

		private static _displayLibraries(this: PaperLibrariesSelector,
			anonymous: LibrarySelectorLibrary[], libraries: LibrarySelectorLibrary[]) {
				const anonymousLibraries: LibrarySelectorLibrary[] = [];
				anonymous.forEach((item) => {
					const itemCopy: LibrarySelectorLibrary = {
						isLibrary: true,
						name: `${item.url} (${
							this.___(I18NKeys.options.tools.paperLibrariesSelector.anonymous)
						})`,
						classes: 'library iron-selected anonymous',
						selected: 'true'
					};
					anonymousLibraries.push(itemCopy);
				});
				anonymousLibraries.sort(this.sortByName);

				libraries = libraries.concat(anonymousLibraries);

				libraries.push({
					name: this.___(I18NKeys.options.tools.paperLibrariesSelector.addOwn),
					classes: 'library addLibrary',
					selected: 'false',
					isLibrary: false
				} as any);
				this.libraries = libraries;
			}

		static onLangChanged(this: PaperLibrariesSelector) {
			// Not loaded yet, this means that it will be loaded by the element eventually
			if (!this._viewLibs) return;

			this._displayLibraries(this._viewLibs.anonymous, 
				this._viewLibs.libraries);
		}
		
		static async init(this: PaperLibrariesSelector, cancelOpen: boolean = false) {
			if (!this.noroot && this._expanded && !cancelOpen) {
				this.close();
			}
			if (this.noroot) {
				this.open();
			}
			if (cancelOpen) {
				await this.close();
				this.open();
			}
			const {
				anonymous,
				selectedObj
			} = this.categorizeLibraries();
			let libraries = this._getLibraries(selectedObj)
			this._setSelectedLibraries(libraries);
			this._viewLibs = {
				anonymous, libraries
			}
			this._displayLibraries(anonymous, libraries);
		};

		private static _resetAfterAddDecision(this: PaperLibrariesSelector) {
			for (const { event, listener, target } of this._eventListeners) {
				target.removeEventListener(event, listener as any);
			}
			window.doc.addLibraryUrlInput.invalid = false;
		}

		static confirmLibraryFile(this: PaperLibrariesSelector, name: string, isTypescript: boolean,
			code: string, url: string) {
				window.doc.addLibraryProcessContainer.style.display = 'none';
				window.setDisplayFlex(window.doc.addLibraryLoadingDialog);
				setTimeout(() => {
					window.doc.addLibraryConfirmationInput.value = code;
					const confirmAdditionListener = () => {
						window.doc.addLibraryConfirmationInput.value = '';
						this.addLibraryFile(name, isTypescript, code, url);
						this._resetAfterAddDecision();
					};
					const denyAdditionListener = () => {
						window.doc.addLibraryConfirmationContainer.style.display = 'none';
						window.doc.addLibraryProcessContainer.style.display = 'block';
						this._resetAfterAddDecision();
						window.doc.addLibraryConfirmationInput.value = '';
					};
					window.doc.addLibraryConfirmAddition.addEventListener('click', confirmAdditionListener);
					window.doc.addLibraryDenyConfirmation.addEventListener('click', denyAdditionListener);
					this._eventListeners.push({
						target: window.doc.addLibraryConfirmAddition,
						event: 'click',
						listener: confirmAdditionListener
					}, {
						target: window.doc.addLibraryDenyConfirmation,
						event: 'click',
						listener: denyAdditionListener
					});
					window.doc.addLibraryLoadingDialog.style.display = 'none';
					window.doc.addLibraryConfirmationContainer.style.display = 'block';
				}, 250);
			};

		private static _addLibraryToState(this: PaperLibrariesSelector, name: string, isTypescript: boolean, code: string, url: string) {
			this.installedLibraries.push({
				name,
				code,
				url,
				ts: {
					enabled: isTypescript,
					code: {}
				}
			});
			const srcLibraries = 
				this.mode === 'main' ?
					this._srcNode.value.libraries :
					this._srcNode.value.backgroundLibraries;
			if (!srcLibraries) {
				if (this.mode === 'main') {
					this._srcNode.value.libraries = [];
				} else {
					this._srcNode.value.backgroundLibraries = [];
				}
			}
			srcLibraries.push({
				name,
				url
			});
		}
		
		private static _hideElements<T extends keyof typeof window.doc>(...els: T[]) {
			for (let i = 0; i < els.length; i++) {
				(window.doc[els[i]] as any).style.display = 'none';
			}
		}

		private static _showElements<T extends keyof typeof window.doc>(...els: T[]) {
			for (let i = 0; i < els.length; i++) {
				(window.doc[els[i]] as any).style.display = 'block';
			}
		}

		private static _showElementsFlex<T extends keyof typeof window.doc>(...els: T[]) {
			for (let i = 0; i < els.length; i++) {
				window.setDisplayFlex(window.doc[els[i]] as any);
			}
		}

		private static _setLibraries(this: PaperLibrariesSelector, libraries: CRM.InstalledLibrary[]) {
			browserAPI.storage.local.set({
				libraries: libraries
			} as any);
			browserAPI.runtime.sendMessage({
				type: 'updateStorage',
				data: {
					type: 'libraries',
					libraries: libraries
				}
			});
		}

		static async addLibraryFile(this: PaperLibrariesSelector, name: string, isTypescript: boolean, code: string, url: string = null) {
			window.doc.addLibraryConfirmationContainer.style.display = 'none';
			window.setDisplayFlex(window.doc.addLibraryLoadingDialog);

			if (url) {
				await new Promise((resolve) => {
					window.setTimeout(() => {
						resolve(null);
					}, 250);
				});
			}
			this._addLibraryToState(name, isTypescript, code, url);
			this._setLibraries(this.installedLibraries);
			this.splice('libraries', this.libraries.length - 1, 0, {
				name: name,
				classes: 'library iron-selected',
				selected: 'true',
				isLibrary: 'true'
			});

			const dropdownContainer = $(this.$.slotContent);
			dropdownContainer.animate({
				height: dropdownContainer[0].scrollHeight
			}, {
				duration: 250,
				easing: 'swing'
			});

			this._hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer',
				'addLibraryProcessContainer', 'addLibraryDialogSuccesCheckmark')
			this._showElements('addLibraryDialogSucces');
			$(window.doc.addLibraryDialogSucces).animate({
				backgroundColor: 'rgb(38,153,244)'
			}, {
				duration: 300,
				easing: 'easeOutCubic',
				complete: () => {
					this._showElements('addLibraryDialogSuccesCheckmark');
					window.doc.addLibraryDialogSuccesCheckmark.classList.add('animateIn');
					setTimeout(() => {
						window.doc.addLibraryDialog.toggle();
						this._hideElements('addLibraryDialogSucces');
						this._showElementsFlex('addLibraryLoadingDialog');
					}, 2500);
				}
			});

			const contentEl = this.$.slotContent;
			contentEl.style.height = (~~contentEl.style.height.split('px')[0] + 48) + 'px';

			this.init(true);
		};

		private static _getStatusCodeDescr(this: PaperLibrariesSelector, code: number) {
			switch ((code + '')[0]) {
				case '2':
					return 'Success';
				case '3':
					return 'Redirect';
				case '4':
					switch (code) {
						case 400:
							return 'Bad request';
						case 401: 
							return 'Unauthorized';
						case 403:
							return 'Forbidden';
						case 404:
							return 'Not ound';
						case 408:
							return 'Timeout';
						default:
							return null;
					}
				case '5':
					return 'Server error';
				case '0':
				case '1':
				default:
					return null;
			}
		}

		private static async _addLibraryHandler(this: PaperLibrariesSelector) {
			const input = window.doc.addedLibraryName;
			const name = input.$$('input').value;
			let taken = false;
			for (let i = 0; i < this.installedLibraries.length; i++) {
				if (this.installedLibraries[i].name === name) {
					taken = true;
				}
			}
			if (name !== '' && !taken) {
				input.invalid = false;
				if (window.doc.addLibraryRadios.selected === 'url') {
					const libraryInput = window.doc.addLibraryUrlInput;
					let url = libraryInput.$$('input').value;
					if (url[0] === '/' && url[1] === '/') {
						url = 'http:' + url;
					}
					window.app.util.xhr(url, false).then((data) => {
						this.confirmLibraryFile(name, window.doc.addLibraryIsTS.checked, 
							data, url);
					}).catch(async (statusCode) => {
						const statusMsg = this._getStatusCodeDescr(statusCode);
						const msg = statusMsg ? 
							await this.__async(
								I18NKeys.options.tools.paperLibrariesSelector.xhrFailedMsg,
									statusCode, statusMsg) :
							await this.__async(
								I18NKeys.options.tools.paperLibrariesSelector.xhrFailed,
									statusCode);
						window.app.util.showToast(msg);
						libraryInput.setAttribute('invalid', 'true');
					});
				} else {
					this.addLibraryFile(name, window.doc.addLibraryIsTS.checked,
						(window.doc.addLibraryManualInput
							.$$('iron-autogrow-textarea') as Polymer.RootElement)
							.$$('textarea').value);
				}
			} else {
				if (taken) {
					input.errorMessage = await this.__async(
						I18NKeys.options.tools.paperLibrariesSelector.nameTaken);
				} else {
					input.errorMessage = await this.__async(
						I18NKeys.options.tools.paperLibrariesSelector.nameMissing);
				}
				input.invalid = true;
			}
		}

		private static _addNewLibrary(this: PaperLibrariesSelector) {
			//Add new library dialog
			window.doc.addedLibraryName.$$('input').value = '';
			window.doc.addLibraryUrlInput.$$('input').value = '';
			(window.doc.addLibraryManualInput
				.$$('iron-autogrow-textarea') as Polymer.RootElement)
				.$$('textarea').value = '';
			window.doc.addLibraryIsTS.checked = false;

			this._showElements('addLibraryProcessContainer');
			this._hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer',
				'addLibraryDialogSucces');

			window.doc.addedLibraryName.invalid = false;

			window.doc.addLibraryDialog.open();
			const handler = this._addLibraryHandler.bind(this);
			window.app.$.addLibraryButton.addEventListener('click', handler);
			this._eventListeners.push({
				target: window.app.$.addLibraryButton,
				listener: handler,
				event: 'click'
			});
		}

		private static _handleCheckmarkClick(this: PaperLibrariesSelector, container: HTMLElement & {
			dataLib: LibrarySelectorLibrary;
		}) {
			//Checking or un-checking something
			const lib = container.dataLib;
			const changeType: 'addMetaTags' | 'removeMetaTags' =
				(container.classList.contains('iron-selected') ? 'removeMetaTags' : 'addMetaTags');
			const libsArr = this.mode === 'main' ?
				window.scriptEdit.newSettings.value.libraries :
				window.scriptEdit.newSettings.value.backgroundLibraries;
			if (changeType === 'addMetaTags') {
				libsArr.push({
					name: lib.name || null,
					url: lib.url
				});
				container.classList.add('iron-selected');
				container.setAttribute('aria-selected', 'true');
				container.querySelector('.menuSelectedCheckmark').style.opacity = '1';
			} else {
				let index = -1;
				for (let i = 0; i < libsArr.length; i++) {
					if (libsArr[i].url === lib.url && 
						libsArr[i].name === lib.name) {
							index = i;
							break;
						}
				}
				libsArr.splice(index, 1);
				container.classList.remove('iron-selected');
				container.removeAttribute('aria-selected');
				container.querySelector('.menuSelectedCheckmark').style.opacity = '0';
			}
			const mainModel = window.scriptEdit.editorManager.getModel('default');
			const backgroundModel = window.scriptEdit.editorManager.getModel('background');
			const TSLibsMod = window.scriptEdit.editorManager.CustomEditorModes.TS_LIBRARIES_META;
			type TSLibsMod = MonacoEditorTSLibrariesMetaMods;
			if (typeof mainModel.editorType === 'object' && mainModel.editorType.mode === TSLibsMod) {
				(mainModel.handlers[0] as TSLibsMod).updateLibraries();
			}
			if (backgroundModel && typeof backgroundModel.editorType === 'object' && 
				backgroundModel.editorType.mode === TSLibsMod) {
					(backgroundModel.handlers[0] as TSLibsMod).updateLibraries();
				}
		}

		static _click(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
			const container = window.app.util.findElementWithTagname(e, 'paper-item');
			if (container.classList.contains('removeLibrary')) {
				return;
			}
			if (container.classList.contains('addLibrary')) {
				this._addNewLibrary();
			} else if (this.mode === 'main') {
				this._handleCheckmarkClick(container as any);
			}
		};

		private static _getInstalledLibrary(this: PaperLibrariesSelector, library: LibrarySelectorLibrary): Promise<CRM.InstalledLibrary> {
			return new Promise<CRM.InstalledLibrary>((resolve) => {
				browserAPI.storage.local.get<CRM.StorageLocal>().then((e) => {
					const libs = e.libraries;
					for (const lib of libs) {
						if (lib.name === library.name) {
							resolve(lib);
						}
					}
					resolve(null);
				});
			});
		}

		private static _revertToNormalEditor(this: PaperLibrariesSelector) {
			window.app.$.ribbonScriptName.innerText = this._editingInstance.name;
			window.app.$.fullscreenEditorToggle.style.display = 'block';

			if (!this._editingInstance.wasFullscreen) {
				window.scriptEdit.exitFullScreen();
			}
		}

		private static _discardLibEditChanges(this: PaperLibrariesSelector) {
			this._revertToNormalEditor();
		}

		private static async _saveLibEditChanges(this: PaperLibrariesSelector) {
			const newVal = window.scriptEdit.fullscreenEditorManager.editor.getValue();
			const lib = this._editingInstance.library;
			
			browserAPI.storage.local.get<CRM.StorageLocal>().then((e) => {
				const installedLibs = e.libraries;
				for (const installedLib of installedLibs) {
					if (installedLib.name === lib.name) {
						installedLib.code = newVal;
					}
				}
				this._setLibraries(installedLibs);
			});
			this._revertToNormalEditor();
		}

		private static async _genOverlayWidget(this: PaperLibrariesSelector) {
			const container = document.createElement('div');
			container.style.backgroundColor = 'white';
			container.style.padding = '10px';
			window.setDisplayFlex(container);
			const cancelButton = document.createElement('paper-button');
			cancelButton.innerText = await this.___(I18NKeys.generic.cancel);
			const saveButton = document.createElement('paper-button');
			saveButton.innerText = await this.___(I18NKeys.generic.save);
			saveButton.style.marginLeft = '15px';

			cancelButton.addEventListener('click', () => {
				this._discardLibEditChanges();
			});
			saveButton.addEventListener('click', () => {
				this._saveLibEditChanges();
			});

			container.appendChild(cancelButton);
			container.appendChild(saveButton);

			const editor = window.scriptEdit.fullscreenEditorManager.editor;
			if (!window.scriptEdit.fullscreenEditorManager.isDiff(editor)) {
				(editor as monaco.editor.IStandaloneCodeEditor).addOverlayWidget({
					getId() {
						return 'library.exit.buttons'
					},
					getDomNode() {
						return container;
					},
					getPosition() {
						return {
							preference: monaco.editor.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
						}
					}
				});
			}
		}

		private static async _openLibraryEditor(this: PaperLibrariesSelector, library: LibrarySelectorLibrary) {
			const wasFullscreen = window.scriptEdit.fullscreen;
			const name = window.app.$.ribbonScriptName.innerText;
			this._editingInstance = {
				wasFullscreen,
				name,
				library
			}

			window.app.$.ribbonScriptName.innerText = await this.___(
				I18NKeys.options.tools.paperLibrariesSelector.editing,
					library.name);

			await window.scriptEdit.enterFullScreen();
			const installedLibrary = await this._getInstalledLibrary(library);
			const isTs = installedLibrary.ts && installedLibrary.ts.enabled;
			window.scriptEdit.fullscreenEditorManager.switchToModel('libraryEdit', 
				installedLibrary.code, isTs ?
					window.scriptEdit.fullscreenEditorManager.EditorMode.TS :
					window.scriptEdit.fullscreenEditorManager.EditorMode.JS);
			
			window.app.$.fullscreenEditorToggle.style.display = 'none';
			await this._genOverlayWidget();
		}

		static async _edit(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
			const manager = window.codeEditBehavior.getEditor();
			if (manager.isTextarea(manager.getEditorAsMonaco())) {
				window.app.util.showToast(
					this.___(I18NKeys.options.tools.paperLibrariesSelector.pleaseUpdate));
				return;
			}

			type LibraryElement = HTMLElement & {
				dataLib: LibrarySelectorLibrary
			}
			let parentNode: LibraryElement = null;
			if (e.target.tagName.toLowerCase() === 'path') {
				parentNode = e.target.parentElement.parentElement.parentElement as LibraryElement;
			} else if (e.target.tagName.toLowerCase() === 'svg') {
				parentNode = e.target.parentElement.parentElement as LibraryElement;
			} else {
				parentNode = e.target.parentElement as LibraryElement;
			}
			const library = parentNode.dataLib;
			this._openLibraryEditor(library);
		}

		static _remove(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
			type LibraryElement = HTMLElement & {
				dataLib: LibrarySelectorLibrary
			}
			let parentNode: LibraryElement = null;
			if (e.target.tagName.toLowerCase() === 'path') {
				parentNode = e.target.parentElement.parentElement.parentElement as LibraryElement;
			} else if (e.target.tagName.toLowerCase() === 'svg') {
				parentNode = e.target.parentElement.parentElement as LibraryElement;
			} else {
				parentNode = e.target.parentElement as LibraryElement;
			}
			const library = parentNode.dataLib;
			browserAPI.runtime.sendMessage({
				type: 'resource',
				data: {
					type: 'remove',
					name: library.name,
					url: library.url,
					scriptId: window.app.scriptItem.id
				}
			});

			//Remove it from view as well
			this.splice('libraries', this.libraries.indexOf(library), 1);

			const contentEl = this.$.dropdown;
			contentEl.style.height = (~~contentEl.style.height.split('px')[0] - 48) + 'px';
		}

		static updateLibraries(this: PaperLibrariesSelector, libraries: LibrarySelectorLibrary[],
			srcNode: CRM.ScriptNode, mode: 'main'|'background' = 'main') {
				this.set('usedlibraries', libraries);
				this._srcNode = srcNode
				this.mode = mode;
				this.init();
			};

		static _getMenu(this: PaperLibrariesSelector) {
			return this.$.dropdown;
		}

		static behaviors = [window.Polymer.PaperDropdownBehavior];
	}

	if (window.objectify) {
		window.register(PLS);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(PLS);
		});
	}
}

export type PaperLibrariesSelectorBase = Polymer.El<'paper-libraries-selector',
	typeof PaperLibrariesSelectorElement.PLS & typeof PaperLibrariesSelectorElement.paperLibrariesSelectorProperties
>;
export type PaperLibrariesSelector = PaperDropdownBehavior<PaperLibrariesSelectorBase>;