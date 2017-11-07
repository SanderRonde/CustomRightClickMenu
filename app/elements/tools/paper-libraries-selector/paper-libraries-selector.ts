/// <reference path="../../elements.d.ts" />

const paperLibrariesSelectorProperties: {
	usedlibraries: Array<CRM.Library>;
	libraries: Array<LibrarySelectorLibrary>;
	selected: Array<number>;
	installedLibraries: Array<{
		name?: string;
		url?: string;
		code: string;
	}>;
	mode: 'main'|'background';

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
	}
} as any;

interface AnonymousLibrary {
	isLibrary: boolean;
	url: string;
}

interface LibrarySelectorLibrary {
	name?: string;
	isLibrary?: boolean;
	url?: string;
	code?: string;
	classes?: string;
	selected?: 'true'|'false';
}

class PLS {
	static is: string = 'paper-libraries-selector';

	static properties = paperLibrariesSelectorProperties;

	static ready(this: PaperLibrariesSelector) {
		const _this = this;
		window.paperLibrariesSelector = this;
		chrome.storage.local.get('libraries', function (keys: CRM.StorageLocal) {
			if (keys.libraries) {
				_this.installedLibraries = keys.libraries;
			} else {
				_this.installedLibraries = [];
				chrome.storage.local.set({
					libaries: _this.installedLibraries
				});
			}
		});
		chrome.storage.onChanged.addListener(function(changes, areaName) {
			if (areaName === 'local' && changes['libraries']) {
				_this.installedLibraries = changes['libraries'].newValue;
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
		const _this = this;
		if (this._expanded) {
			this.close();
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
		_this.libraries = libraries;
	};

	private static resetAfterAddDesision() {
		window.doc.addLibraryConfirmAddition.removeEventListener('click');
		window.doc.addLibraryDenyConfirmation.removeEventListener('click');
		window.doc.addLibraryUrlInput.removeAttribute('invalid');
	}

	static confirmLibraryFile(_this: PaperLibrariesSelector, name: string, code: string, url: string) {
		window.doc.addLibraryProcessContainer.style.display = 'none';
		window.doc.addLibraryLoadingDialog.style.display = 'flex';
		setTimeout(function() {
			window.doc.addLibraryConfirmationInput.value = code;
			window.doc.addLibraryConfirmAddition.addEventListener('click', () => {
				window.doc.addLibraryConfirmationInput.value = '';
				_this.addLibraryFile(_this, name, code, url);
				_this.resetAfterAddDesision();
			});
			window.doc.addLibraryDenyConfirmation.addEventListener('click', () => {
				window.doc.addLibraryConfirmationContainer.style.display = 'none';
				window.doc.addLibraryProcessContainer.style.display = 'block';
				_this.resetAfterAddDesision();
				window.doc.addLibraryConfirmationInput.value = '';
			});
			window.doc.addLibraryLoadingDialog.style.display = 'none';
			window.doc.addLibraryConfirmationContainer.style.display = 'block';
		}, 250);
	};

	private static addLibraryToState(_this: PaperLibrariesSelector, name: string, code: string, url: string) {
		_this.installedLibraries.push({
			name: name,
			code: code,
			url: url
		});
		_this.usedlibraries.push({
			name: name,
			url: url
		});
	}
	
	private static hideElements<T extends keyof typeof window.doc>(...els: Array<T>) {
		for (let i = 0; i < els.length; i++) {
			window.doc[els[i]].style.display = 'none';
		}
	}

	private static showElements<T extends keyof typeof window.doc>(...els: Array<T>) {
		for (let i = 0; i < els.length; i++) {
			window.doc[els[i]].style.display = 'block';
		}
	}

	static addLibraryFile(_this: PaperLibrariesSelector, name: string, code: string, url: string = null) {
		window.doc.addLibraryConfirmationContainer.style.display = 'none';
		window.doc.addLibraryLoadingDialog.style.display = 'flex';

		setTimeout(function() {
			_this.addLibraryToState(_this, name, code, url);
			chrome.storage.local.set({
				libraries: _this.installedLibraries
			});
			if (_this.mode === 'main' && url !== null) {
				window.scriptEdit.editor.addMetaTags(window.scriptEdit.editor,
					'require', url);
			}
			chrome.runtime.sendMessage({
				type: 'updateStorage',
				data: {
					type: 'libraries',
					libraries: _this.installedLibraries
				}
			});
			_this.splice('libraries', _this.libraries.length - 1, 0, {
				name: name,
				classes: 'library iron-selected',
				selected: 'true',
				isLibrary: 'true'
			});

			const dropdownContainer = $(_this.$$('.content'));
			dropdownContainer.animate({
				height: dropdownContainer[0].scrollHeight
			}, {
				duration: 250,
				easing: 'easeInCubic'
			});

			_this.hideElements('addLibraryLoadingDialog', 'addLibraryConfirmationContainer',
				'addLibraryProcessContainer', 'addLibraryDialogSuccesCheckmark')
			_this.showElements('addLibraryDialogSucces');
			$(window.doc.addLibraryDialogSucces).animate({
				backgroundColor: 'rgb(38,153,244)'
			}, {
				duration: 300,
				easing: 'easeOutCubic',
				complete: function () {
					_this.showElements('addLibraryDialogSuccesCheckmark');
					window.doc.addLibraryDialogSuccesCheckmark.classList.add('animateIn');
					setTimeout(function() {
						window.doc.addLibraryDialog.toggle();
						_this.hideElements('addLibraryDialogSucces');
						_this.showElements('addLibraryLoadingDialog');
					}, 2500);
				}
			});

			const contentEl = _this.$$('paper-menu .content') as HTMLElement;
			contentEl.style.height = (~~contentEl.style.height.split('px')[0] + 48) + 'px';

			_this.init();
		}, 250);
	};

	private static addNewLibrary(this: PaperLibrariesSelector) {
		//Add new library dialog
		window.doc.addedLibraryName.$$('input').value = '';
		window.doc.addLibraryUrlInput.$$('input').value = '';
		window.doc.addLibraryManualInput.$$('textarea').value = '';

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
							this.confirmLibraryFile(this, name, data, url);
						}).fail(function() {
							libraryInput.setAttribute('invalid', 'true');
						});
					} else {
						this.addLibraryFile(this, name, window.doc.addLibraryManualInput.$$('textarea').value);
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

	private static handleCheckmarkClick(e: Polymer.ClickEvent) {
		//Checking or un-checking something
		const lib = (e.target as HTMLElement & {
			dataLib: LibrarySelectorLibrary;
		}).dataLib;
		const changeType: 'addMetaTags' | 'removeMetaTags' =
			(e.target.classList.contains('iron-selected') ? 'removeMetaTags' : 'addMetaTags');
		if (lib.url) {
			window.scriptEdit.editor[changeType](window.scriptEdit.editor, 'require', lib.url);
		}
		if (changeType === 'addMetaTags') {
			window.scriptEdit.newSettings.value.libraries.push({
				name: lib.name || null,
				url: lib.url
			});
		} else {
			let index = -1;
			for (let i = 0; i < window.scriptEdit.newSettings.value.libraries.length; i++) {
				if (window.scriptEdit.newSettings.value.libraries[i].url === lib.url && 
					window.scriptEdit.newSettings.value.libraries[i].name === lib.name) {
					index = i;
					break;
				}
			}
			window.scriptEdit.newSettings.value.libraries.splice(index, 1);
		}
	}

	static _click(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
		console.log(e.target);
		const _this = this;
		if (e.target.tagName.toLowerCase() === 'path' ||
			e.target.tagName.toLowerCase() === 'svg' ||
			e.target.classList.contains('removeLibrary')) {
				return;
			}
		if (e.target.classList.contains('addLibrary')) {
			this.addNewLibrary();
		} else if (_this.mode === 'main') {
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

type PaperLibrariesSelectorBase = Polymer.El<'paper-libraries-selector',
	typeof PLS & typeof paperLibrariesSelectorProperties
>;
type PaperLibrariesSelector = PaperDropdownBehavior<PaperLibrariesSelectorBase>;

if (window.objectify) {
	Polymer(window.objectify(PLS));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(PLS));
	});
}