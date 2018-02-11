/// <reference path="../../elements.d.ts" />

namespace PaperLibrariesSelectorElement {
	export const paperLibrariesSelectorProperties: {
		usedlibraries: Array<CRM.Library>;
		libraries: Array<LibrarySelectorLibrary>;
		selected: Array<number>;
		installedLibraries: Array<CRM.InstalledLibrary>;
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

	export class PLS {
		static is: string = 'paper-libraries-selector';

		static properties = paperLibrariesSelectorProperties;

		private static _editingInstance: {
			name: string;
			wasFullscreen: boolean;
			library: LibrarySelectorLibrary;
		} = null;

		static ready(this: PaperLibrariesSelector) {
			chrome.storage.local.get('libraries', (keys: CRM.StorageLocal) => {
				if (keys.libraries) {
					this.installedLibraries = keys.libraries;
				} else {
					this.installedLibraries = [];
					chrome.storage.local.set({
						libaries: this.installedLibraries
					});
				}
			});
			chrome.storage.onChanged.addListener((changes, areaName) => {
				if (areaName === 'local' && changes['libraries']) {
					this.installedLibraries = changes['libraries'].newValue;
				}
			});
		};

		static sortByName(first: LibrarySelectorLibrary, second: LibrarySelectorLibrary): number {
			return first.name[0].toLowerCase().charCodeAt(0) - second.name[0].toLowerCase().charCodeAt(0);
		}

		static categorizeLibraries(this: PaperLibrariesSelector) {
			const anonymous: Array<LibrarySelectorLibrary> = [];
			const selectedObj: {
				[key: string]: boolean;
			} = {};
			this.usedlibraries.forEach(function (item) {
				if (item.name ===  null) {
					anonymous.push(item);
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
			let libraries: Array<LibrarySelectorLibrary> = [];
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

		private static _setSelectedLibraries(this: PaperLibrariesSelector, libraries: Array<LibrarySelectorLibrary>) {
			const selected: Array<number> = [];
			libraries.forEach(function(item, index) {
				if (item.selected === 'true') {
					selected.push(index);
				}
			});
			this.selected = selected;
		}
		
		static init(this: PaperLibrariesSelector) {
			if (!this.noroot && this._expanded) {
				this.close();
			}
			if (this.noroot) {
				this.open();
			}
			const {
				anonymous,
				selectedObj
			} = this.categorizeLibraries();
			let libraries = this._getLibraries(selectedObj)
			this._setSelectedLibraries(libraries);
			const anonymousLibraries: Array<LibrarySelectorLibrary> = [];
			anonymous.forEach(function(item) {
				const itemCopy: LibrarySelectorLibrary = {
					isLibrary: true,
					name: `${item.url} (anonymous)`,
					classes: 'library iron-selected anonymous',
					selected: 'true'
				};
				anonymousLibraries.push(itemCopy);
			});
			anonymousLibraries.sort(this.sortByName);

			libraries = libraries.concat(anonymousLibraries);

			libraries.push({
				name: 'Add your own',
				classes: 'library addLibrary',
				selected: 'false',
				isLibrary: false
			} as any);
			this.libraries = libraries;
		};

		private static _resetAfterAddDesision() {
			window.doc.addLibraryConfirmAddition.removeEventListener('click');
			window.doc.addLibraryDenyConfirmation.removeEventListener('click');
			window.doc.addLibraryUrlInput.removeAttribute('invalid');
		}

		static confirmLibraryFile(this: PaperLibrariesSelector, name: string, isTypescript: boolean,
			code: string, url: string) {
				window.doc.addLibraryProcessContainer.style.display = 'none';
				window.doc.addLibraryLoadingDialog.style.display = 'flex';
				setTimeout(() => {
					window.doc.addLibraryConfirmationInput.value = code;
					window.doc.addLibraryConfirmAddition.addEventListener('click', () => {
						window.doc.addLibraryConfirmationInput.value = '';
						this.addLibraryFile(name, isTypescript, code, url);
						this._resetAfterAddDesision();
					});
					window.doc.addLibraryDenyConfirmation.addEventListener('click', () => {
						window.doc.addLibraryConfirmationContainer.style.display = 'none';
						window.doc.addLibraryProcessContainer.style.display = 'block';
						this._resetAfterAddDesision();
						window.doc.addLibraryConfirmationInput.value = '';
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
			this.usedlibraries.push({
				name,
				url
			});
		}
		
		private static _hideElements<T extends keyof typeof window.doc>(...els: Array<T>) {
			for (let i = 0; i < els.length; i++) {
				(window.doc[els[i]] as any).style.display = 'none';
			}
		}

		private static _showElements<T extends keyof typeof window.doc>(...els: Array<T>) {
			for (let i = 0; i < els.length; i++) {
				(window.doc[els[i]] as any).style.display = 'block';
			}
		}

		private static _setLibraries(this: PaperLibrariesSelector, libraries: Array<CRM.InstalledLibrary>) {
			chrome.storage.local.set({
				libraries: libraries
			});
			chrome.runtime.sendMessage({
				type: 'updateStorage',
				data: {
					type: 'libraries',
					libraries: libraries
				}
			});
		}

		static addLibraryFile(this: PaperLibrariesSelector, name: string, isTypescript: boolean, code: string, url: string = null) {
			window.doc.addLibraryConfirmationContainer.style.display = 'none';
			window.doc.addLibraryLoadingDialog.style.display = 'flex';

			setTimeout(() => {
				this._addLibraryToState(name, isTypescript, code, url);
				this._setLibraries(this.installedLibraries);
				this.splice('libraries', this.libraries.length - 1, 0, {
					name: name,
					classes: 'library iron-selected',
					selected: 'true',
					isLibrary: 'true'
				});

				const dropdownContainer = $(this.shadowRoot.querySelectorAll('.content'));
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
							this._showElements('addLibraryLoadingDialog');
						}, 2500);
					}
				});

				const contentEl = this.$$('paper-menu').$$('.content') as HTMLElement;
				contentEl.style.height = (~~contentEl.style.height.split('px')[0] + 48) + 'px';

				this.init();
			}, 250);
		};

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
			$(window.doc.addLibraryDialog)
				.find('#addLibraryButton')
				.on('click', () => {
					const name = window.doc.addedLibraryName.$$('input').value;
					let taken = false;
					for (let i = 0; i < this.installedLibraries.length; i++) {
						if (this.installedLibraries[i].name === name) {
							taken = true;
						}
					}
					if (name !== '' && !taken) {
						window.doc.addedLibraryName.invalid = true;
						if (window.doc.addLibraryRadios.selected === 'url') {
							const libraryInput = window.doc.addLibraryUrlInput;
							let url = libraryInput.$$('input').value;
							if (url[0] === '/' && url[1] === '/') {
								url = 'http:' + url;
							}
							$.ajax({
								url: url,
								dataType: 'html'
							}).done((data) => {
								this.confirmLibraryFile(name, window.doc.addLibraryIsTS.checked, data, url);
							}).fail(function() {
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
							window.doc.addedLibraryName.errorMessage = 'That name is already taken';
						} else {
							window.doc.addedLibraryName.errorMessage = 'Please enter a name';
						}
						window.doc.addedLibraryName.invalid = true;
					}
				});
		}

		private static _handleCheckmarkClick(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
			//Checking or un-checking something
			const lib = (e.target as HTMLElement & {
				dataLib: LibrarySelectorLibrary;
			}).dataLib;
			const changeType: 'addMetaTags' | 'removeMetaTags' =
				(e.target.classList.contains('iron-selected') ? 'removeMetaTags' : 'addMetaTags');
			const libsArr = this.mode === 'main' ?
				window.scriptEdit.newSettings.value.libraries :
				window.scriptEdit.newSettings.value.backgroundLibraries;
			if (changeType === 'addMetaTags') {
				libsArr.push({
					name: lib.name || null,
					url: lib.url
				});
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
			}
			const mainModel = window.scriptEdit.editorManager.getModel('default');
			const backgroundModel = window.scriptEdit.editorManager.getModel('background');
			const TSLibsMod = window.scriptEdit.editorManager.CustomEditorModes.TS_LIBRARIES_META;
			type TSLibsMod = MonacoEditorElement.MonacoEditorTSLibrariesMetaMods;
			if (typeof mainModel.editorType === 'object' && mainModel.editorType.mode === TSLibsMod) {
				(mainModel.handlers[0] as TSLibsMod).updateLibraries();
			}
			if (backgroundModel && typeof backgroundModel.editorType === 'object' && 
				backgroundModel.editorType.mode === TSLibsMod) {
					(backgroundModel.handlers[0] as TSLibsMod).updateLibraries();
				}
		}

		static _click(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
			const container = window.app.util.findElementWithTagname(e.path, 'paper-item');
			if (container.classList.contains('removeLibrary')) {
				return;
			}
			if (container.classList.contains('addLibrary')) {
				this._addNewLibrary();
			} else if (this.mode === 'main') {
				this._handleCheckmarkClick(e);
			}
		};

		private static _getInstalledLibrary(this: PaperLibrariesSelector, library: LibrarySelectorLibrary): Promise<CRM.InstalledLibrary> {
			return new Promise<CRM.InstalledLibrary>((resolve) => {
				chrome.storage.local.get((e: CRM.StorageLocal) => {
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
			
			chrome.storage.local.get((e: CRM.StorageLocal) => {
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

		private static _genOverlayWidget(this: PaperLibrariesSelector) {
			const container = document.createElement('div');
			container.style.backgroundColor = 'white';
			container.style.padding = '10px';
			container.style.display = 'flex';
			const cancelButton = document.createElement('paper-button');
			cancelButton.innerText = 'Cancel';
			const saveButton = document.createElement('paper-button');
			saveButton.innerText = 'Save';
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
				editor.addOverlayWidget({
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

			window.app.$.ribbonScriptName.innerText = 'Editing library ' + library.name;

			await window.scriptEdit.enterFullScreen();
			const installedLibrary = await this._getInstalledLibrary(library);
			const isTs = installedLibrary.ts && installedLibrary.ts.enabled;
			window.scriptEdit.fullscreenEditorManager.switchToModel('libraryEdit', 
				installedLibrary.code, isTs ?
					window.scriptEdit.fullscreenEditorManager.EditorMode.TS :
					window.scriptEdit.fullscreenEditorManager.EditorMode.JS);
			
			window.app.$.fullscreenEditorToggle.style.display = 'none';
			this._genOverlayWidget();
		}

		static _edit(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
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
			chrome.runtime.sendMessage({
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

		static updateLibraries(this: PaperLibrariesSelector, libraries: Array<LibrarySelectorLibrary>, mode: 'main'|'background' = 'main') {
			this.set('usedlibraries', libraries);
			this.mode = mode;
			this.init();
		};

		static _getMenu(this: PaperLibrariesSelector) {
			return this.$.dropdown;
		}

		static behaviors = [Polymer.PaperDropdownBehavior];
	}

	if (window.objectify) {
		window.register(PLS);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(PLS);
		});
	}
}

type PaperLibrariesSelectorBase = Polymer.El<'paper-libraries-selector',
	typeof PaperLibrariesSelectorElement.PLS & typeof PaperLibrariesSelectorElement.paperLibrariesSelectorProperties
>;
type PaperLibrariesSelector = PaperDropdownBehavior<PaperLibrariesSelectorBase>;