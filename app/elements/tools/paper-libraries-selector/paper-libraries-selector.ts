/// <reference path="../../elements.d.ts" />

const paperLibrariesSelectorProperties: {
	usedlibraries: Array<CRMLibrary>;
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

type PaperLibrariesSelectorBase = Polymer.El<'paper-libraries-selector',
	typeof PLS & typeof paperLibrariesSelectorProperties
>;

class PLS {
	static is: string = 'paper-libraries-selector';

	static properties = paperLibrariesSelectorProperties;

	static ready(this: PaperLibrariesSelector) {
		var _this = this;
		window.paperLibrariesSelector = this;
		chrome.storage.local.get('libraries', function (keys: StorageLocal) {
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
	
	static init(this: PaperLibrariesSelector) {
		var _this = this;
		if (this._expanded) {
			this.close();
		}

		var anonymous: Array<LibrarySelectorLibrary> = [];
		var selectedObj: {
			[key: string]: boolean;
		} = {};
		this.usedlibraries.forEach(function (item) {
			if (item.name ===  null) {
				anonymous.push(item);
			} else {
				selectedObj[item.name.toLowerCase()] = true;
			}
		});
		var libraries: Array<LibrarySelectorLibrary> = [];
		var selected: Array<number> = [];
		_this.installedLibraries.forEach(function(item) {
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
		libraries.sort(function(first, second) {
			return first.name[0].toLowerCase().charCodeAt(0) - second.name[0].toLowerCase().charCodeAt(0);
		});

		var anonymousLibraries: Array<LibrarySelectorLibrary> = [];
		anonymous.forEach(function(item) {
			const itemCopy: LibrarySelectorLibrary = {
				isLibrary: true,
				name: `${item.url} (anonymous)`,
				classes: 'library iron-selected anonymous',
				selected: 'true'
			};
			anonymousLibraries.push(itemCopy);
		});
		anonymousLibraries.sort(function (first, second) {
			return first.name[0].toLowerCase().charCodeAt(0) - second.name[0].toLowerCase().charCodeAt(0);
		});

		libraries = libraries.concat(anonymousLibraries);

		libraries.forEach(function(item, index) {
			if (item.selected === 'true') {
				selected.push(index);
			}
		});
		_this.selected = selected;
		libraries.push({
			name: 'Add your own',
			classes: 'library addLibrary',
			selected: 'false',
			isLibrary: false
		} as any);
		_this.libraries = libraries;
	};

	static confirmLibraryFile(_this: PaperLibrariesSelector, name: string, code: string, url: string) {
		window.doc.addLibraryProcessContainer.style.display = 'none';
		window.doc.addLibraryLoadingDialog.style.display = 'flex';
		setTimeout(function() {
			window.doc.addLibraryConfirmationInput.value = code;
			window.doc.addLibraryConfirmAddition.addEventListener('click', function () {
				window.doc.addLibraryConfirmationInput.value = '';
				_this.addLibraryFile(_this, name, code, url);
				window.doc.addLibraryConfirmAddition.removeEventListener('click');
				window.doc.addLibraryDenyConfirmation.removeEventListener('click');
				window.doc.addLibraryUrlInput.removeAttribute('invalid');
			});
			window.doc.addLibraryDenyConfirmation.addEventListener('click', function() {
				window.doc.addLibraryConfirmationContainer.style.display = 'none';
				window.doc.addLibraryProcessContainer.style.display = 'block';
				window.doc.addLibraryConfirmAddition.removeEventListener('click');
				window.doc.addLibraryDenyConfirmation.removeEventListener('click');
				window.doc.addLibraryUrlInput.removeAttribute('invalid');
				window.doc.addLibraryConfirmationInput.value = '';
			});
			window.doc.addLibraryLoadingDialog.style.display = 'none';
			window.doc.addLibraryConfirmationContainer.style.display = 'block';
		}, 250);
	};

	static addLibraryFile(_this: PaperLibrariesSelector, name: string, code: string, url: string = null) {
		window.doc.addLibraryConfirmationContainer.style.display = 'none';
		window.doc.addLibraryLoadingDialog.style.display = 'flex';

		setTimeout(function() {
			_this.installedLibraries.push({
				name: name,
				code: code,
				url: url
			});
			_this.usedlibraries.push({
				name: name,
				url: url
			});
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

			var dropdownContainer = $(_this).find('.content');
			dropdownContainer.animate({
				height: dropdownContainer[0].scrollHeight
			}, {
				duration: 250,
				easing: 'easeInCubic'
			});

			window.doc.addLibraryLoadingDialog.style.display = 'none';
			window.doc.addLibraryConfirmationContainer.style.display = 'none';
			window.doc.addLibraryProcessContainer.style.display = 'none';
			window.doc.addLibraryDialogSucces.style.display = 'block';
			window.doc.addLibraryDialogSuccesCheckmark.style.display = 'none';
			$(window.doc.addLibraryDialogSucces).animate({
				backgroundColor: 'rgb(38,153,244)'
			}, {
				duration: 300,
				easing: 'easeOutCubic',
				complete: function () {
					window.doc.addLibraryDialogSuccesCheckmark.style.display = 'block';
					window.doc.addLibraryDialogSuccesCheckmark.classList.add('animateIn');
					setTimeout(function() {
						window.doc.addLibraryDialog.toggle();
						window.doc.addLibraryDialogSucces.style.display = 'none';
						window.doc.addLibraryLoadingDialog.style.display = 'block';
					}, 2500);
				}
			});

			const contentEl = _this.$$('paper-menu').querySelector('.content') as HTMLElement;
			contentEl.style.height += 
				(~~contentEl.style.height.split('px')[0] + 48) + 'px';

			_this.init();
		}, 250);
	};

	static _click(this: PaperLibrariesSelector, e: Polymer.ClickEvent) {
		var _this = this;
		if (e.target.classList.contains('addLibrary')) {
			//Add new library dialog
			window.doc.addedLibraryName.querySelector('input').value = '';
			window.doc.addLibraryUrlInput.querySelector('input').value = '';
			window.doc.addLibraryManualInput.querySelector('textarea').value = '';

			window.doc.addLibraryProcessContainer.style.display = 'block';
			window.doc.addLibraryLoadingDialog.style.display = 'none';
			window.doc.addLibraryConfirmationContainer.style.display = 'none';
			window.doc.addLibraryDialogSucces.style.display = 'none';

			window.doc.addedLibraryName.invalid = false;

			window.doc.addLibraryDialog.open();
			$(window.doc.addLibraryDialog)
				.find('#addLibraryButton')
				.on('click', function(this: HTMLElement) {
					var name = window.doc.addedLibraryName.querySelector('input').value;
					var taken = false;
					for (var i = 0; i < _this.installedLibraries.length; i++) {
						if (_this.installedLibraries[i].name === name) {
							taken = true;
						}
					}
					if (name !== '' && !taken) {
						this.removeAttribute('invalid');
						if (window.doc.addLibraryRadios.selected === 'url') {
							var libraryInput = window.doc.addLibraryUrlInput;
							var url = libraryInput.querySelector('input').value;
							if (url[0] === '/' && url[1] === '/') {
								url = 'http:' + url;
							}
							$.ajax({
								url: url,
								dataType: 'html'
							}).done(function(data) {
								_this.confirmLibraryFile(_this, name, data, url);
							}).fail(function() {
								libraryInput.setAttribute('invalid', 'true');
							});
						} else {
							_this.addLibraryFile(_this, name, window.doc.addLibraryManualInput.querySelector('textarea').value);
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
		} else if (e.target.classList.contains('anonymous')) {
			var url = e.target.getAttribute('data-url');
			if (_this.mode === 'main') {
				window.scriptEdit.editor.removeMetaTags(window.scriptEdit.editor,
					'require', url);
			}

			chrome.runtime.sendMessage({
				type: 'anonymousLibrary',
				data: {
					type: 'remove',
					name: url,
					url: url,
					scriptId: window.app.scriptItem.id
				}
			});
		} else if (_this.mode === 'main') {
			//Checking or un-checking something
			var lib = (e.target as HTMLElement & {
				dataLib: LibrarySelectorLibrary;
			}).dataLib;
			var changeType: 'addMetaTags'|'removeMetaTags' = 
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
	};

	static updateLibraries(this: PaperLibrariesSelector, libraries: Array<LibrarySelectorLibrary>, mode: 'main'|'background' = 'main') {
		this.set('usedlibraries', libraries);
		this.mode = mode;
		this.init();
	};

	static behaviors = [Polymer.PaperDropdownBehavior];
}

Polymer(PLS);