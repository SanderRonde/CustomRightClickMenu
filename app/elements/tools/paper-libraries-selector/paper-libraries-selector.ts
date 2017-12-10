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

		private static getLibraries(this: PaperLibrariesSelector, selectedObj: {
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

		private static setSelectedLibraries(this: PaperLibrariesSelector, libraries: Array<LibrarySelectorLibrary>) {
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
			let libraries = this.getLibraries(selectedObj)
			this.setSelectedLibraries(libraries);
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

		private static resetAfterAddDesision() {
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
						this.resetAfterAddDesision();
					});
					window.doc.addLibraryDenyConfirmation.addEventListener('click', () => {
						window.doc.addLibraryConfirmationContainer.style.display = 'none';
						window.doc.addLibraryProcessContainer.style.display = 'block';
						this.resetAfterAddDesision();
						window.doc.addLibraryConfirmationInput.value = '';
					});
					window.doc.addLibraryLoadingDialog.style.display = 'none';
					window.doc.addLibraryConfirmationContainer.style.display = 'block';
				}, 250);
			};

		private static addLibraryToState(this: PaperLibrariesSelector, name: string, isTypescript: boolean, code: string, url: string) {
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
		
		private static hideElements<T extends keyof typeof window.doc>(...els: Array<T>) {
			for (let i = 0; i < els.length; i++) {
				(window.doc[els[i]] as any).style.display = 'none';
			}
		}

		private static showElements<T extends keyof typeof window.doc>(...els: Array<T>) {
			for (let i = 0; i < els.length; i++) {
				(window.doc[els[i]] as any).style.display = 'block';
			}
		}

		static addLibraryFile(this: PaperLibrariesSelector, name: string, isTypescript: boolean, code: string, url: string = null) {
			window.doc.addLibraryConfirmationContainer.style.display = 'none';
			window.doc.addLibraryLoadingDialog.style.display = 'flex';

			setTimeout(() => {
				this.addLibraryToState(name, isTypescript, code, url);
				chrome.storage.local.set({
					libraries: this.installedLibraries
				});
				chrome.runtime.sendMessage({
					type: 'updateStorage',
					data: {
						type: 'libraries',
						libraries: this.installedLibraries
					}
				});
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

				this.hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer',
					'addLibraryProcessContainer', 'addLibraryDialogSuccesCheckmark')
				this.showElements('addLibraryDialogSucces');
				$(window.doc.addLibraryDialogSucces).animate({
					backgroundColor: 'rgb(38,153,244)'
				}, {
					duration: 300,
					easing: 'easeOutCubic',
					complete: () => {
						this.showElements('addLibraryDialogSuccesCheckmark');
						window.doc.addLibraryDialogSuccesCheckmark.classList.add('animateIn');
						setTimeout(() => {
							window.doc.addLibraryDialog.toggle();
							this.hideElements('addLibraryDialogSucces');
							this.showElements('addLibraryLoadingDialog');
						}, 2500);
					}
				});

				const contentEl = this.$$('paper-menu').$$('.content') as HTMLElement;
				contentEl.style.height = (~~contentEl.style.height.split('px')[0] + 48) + 'px';

				this.init();
			}, 250);
		};

		private static addNewLibrary(this: PaperLibrariesSelector) {
			//Add new library dialog
			window.doc.addedLibraryName.$$('input').value = '';
			window.doc.addLibraryUrlInput.$$('input').value = '';
			window.doc.addLibraryManualInput.$$('textarea').value = '';
			window.doc.addLibraryIsTS.checked = false;

			this.showElements('addLibraryProcessContainer');
			this.hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer',
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
						this.removeAttribute('invalid');
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
									window.doc.addLibraryManualInput.$$('textarea').value);
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

		private static handleCheckmarkClick(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
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
			if (e.target.tagName.toLowerCase() === 'path' ||
				e.target.tagName.toLowerCase() === 'svg' ||
				e.target.classList.contains('removeLibrary')) {
					return;
				}
			if (e.target.classList.contains('addLibrary')) {
				this.addNewLibrary();
			} else if (this.mode === 'main') {
				this.handleCheckmarkClick(e);
			}
		};

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
		Polymer(window.objectify(PLS));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(PLS));
		});
	}
}

type PaperLibrariesSelectorBase = Polymer.El<'paper-libraries-selector',
	typeof PaperLibrariesSelectorElement.PLS & typeof PaperLibrariesSelectorElement.paperLibrariesSelectorProperties
>;
type PaperLibrariesSelector = PaperDropdownBehavior<PaperLibrariesSelectorBase>;