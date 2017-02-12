/// <reference path="../../elements.d.ts" />

const paperLibrariesSelectorProperties: {
	usedlibraries: Array<LibrarySelectorLibrary>;
	libraries: Array<LibrarySelectorLibrary>;
	selected: Array<number>;
	installedLibraries: Array<ShippedLibrary>;
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

interface ShippedLibrary {
	name: string;
	url?: string;
	code?: string;
	location?: string
}

interface AnonymousLibrary {
	isLibrary: boolean;
	url: string;
}

interface LibrarySelectorLibrary {
	name?: string;
	isLibrary: boolean;
	url?: string;
	classes: string;
	selected: 'true'|'false';
}

type PaperLibrariesSelectorBase = PolymerElement<
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
				_this.installedLibraries = [
					{
						name: 'jQuery 2.1.4',
						location: 'jquery.js'
					}, {
						name: 'angular 1.4.7',
						location: 'angular.js'
					}, {
						name: 'mooTools 1.5.2',
						location: 'mooTools.js'
					}, {
						name: 'yui 3.18.1',
						location: 'yui.js'
					}, {
						name: 'jqlite 0.2.37',
						location: 'jqlite.js'
					}
				];
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
			}
			else {
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
			const itemCopy: LibrarySelectorLibrary = {} as any;
			itemCopy.isLibrary = true;
			itemCopy.name = item.url + ' (anonymous)';
			itemCopy.classes = 'library iron-selected anonymous';
			itemCopy.selected = 'true';
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
		});
		_this.libraries = libraries;
	};

	static confirmLibraryFile(_this: PaperLibrariesSelector, name: string, code: string, url: string) {
		window.doc['addLibraryProcessContainer'].style.display = 'none';
		window.doc['addLibraryLoadingDialog'].style.display = 'flex';
		setTimeout(function() {
			(window.doc['addLibraryConfirmationInput'] as PaperInput).value = code;
			window.doc['addLibraryConfirmAddition'].addEventListener('click', function () {
				(window.doc['addLibraryConfirmationInput'] as PaperInput).value = '';
				_this.addLibraryFile(_this, name, code, url);
			});
			window.doc['addLibraryDenyConfirmation'].addEventListener('click', function() {
				window.doc['addLibraryConfirmationContainer'].style.display = 'none';
				window.doc['addLibraryProcessContainer'].style.display = 'block';
				window.doc['addLibraryConfirmAddition'].removeEventListener('click');
				window.doc['addLibraryDenyConfirmation'].removeEventListener('click');
				window.doc['addLibraryUrlInput'].removeAttribute('invalid');
				(window.doc['addLibraryConfirmationInput'] as PaperInput).value = '';
			});
			window.doc['addLibraryLoadingDialog'].style.display = 'none';
			window.doc['addLibraryConfirmationContainer'].style.display = 'block';
		}, 250);
	};

	static addLibraryFile(_this: PaperLibrariesSelector, name: string, code: string, url?: string) {
		window.doc['addLibraryConfirmationContainer'].style.display = 'none';
		window.doc['addLibraryLoadingDialog'].style.display = 'flex';
		setTimeout(function() {
			_this.installedLibraries.push({
				name: name,
				code: code,
				url: url
			});
			if (_this.mode === 'main') {
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

			window.doc['addLibraryLoadingDialog'].style.display = 'none';
			window.doc['addLibraryConfirmationContainer'].style.display = 'none';
			window.doc['addLibraryProcessContainer'].style.display = 'none';
			window.doc['addLibraryDialogSucces'].style.display = 'block';
			window.doc['addLibraryDialogSuccesCheckmark'].style.display = 'none';
			$(window.doc['addLibraryDialogSucces']).animate({
				backgroundColor: 'rgb(38,153,244)'
			}, {
				duration: 300,
				easing: 'easeOutCubic',
				complete: function () {
					window.doc['addLibraryDialogSuccesCheckmark'].style.display = 'block';
					window.doc['addLibraryDialogSuccesCheckmark'].classList.add('animateIn');
					setTimeout(function() {
						(window.doc['addLibraryDialog'] as PaperDialog).toggle();
						window.doc['addLibraryDialogSucces'].style.display = 'none';
						window.doc['addLibraryLoadingDialog'].style.display = 'block';
					}, 2500);
				}
			});
		}, 250);
	};

	static click(this: PaperLibrariesSelector, e: PolymerClickEvent) {
		var _this = this;
		if (e.target.classList.contains('addLibrary')) {
			//Add new library dialog
			(window.doc['addedLibraryName'] as PaperInput).value = '';
			(window.doc['addLibraryUrlInput'] as PaperInput).value = '';
			(window.doc['addLibraryManualInput'] as PaperInput).value = '';
			(window.doc['addLibraryDialog'] as PaperDialog).toggle();
			$(window.doc['addLibraryDialog'])
				.find('#addLibraryButton')
				.on('click', function(this: HTMLElement) {
					var name = (window.doc['addedLibraryName'] as PaperInput).value;
					var taken = false;
					for (var i = 0; i < _this.installedLibraries.length; i++) {
						if (_this.installedLibraries[i].name === name) {
							taken = true;
						}
					}
					if (name !== '' && !taken) {
						this.removeAttribute('invalid');
						if ((window.doc['addLibraryRadios'] as PaperRadioGroup).selected === 'url') {
							var libraryInput = window.doc['addLibraryUrlInput'] as PaperInput;
							var url = libraryInput.value;
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
							_this.addLibraryFile(_this, name, (window.doc['addLibraryManualInput'] as PaperInput).value);
						}
					} else {
						if (taken) {
							(window.doc['addedLibraryName'] as PaperInput).errorMessage = 'That name is already taken';
						} else {
							(window.doc['addedLibraryName'] as PaperInput).errorMessage = 'Please enter a name';
						}
						(window.doc['addedLibraryName'] as PaperInput).invalid = true;
					}
				});
		}
		else if (e.target.classList.contains('anonymous')) {
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
			var lib = e.target.getAttribute('data-url');
			var changeType: 'addMetaTags'|'removeMetaTags' = (e.target.classList.contains('iron-selected') ? 'addMetaTags' : 'removeMetaTags');
			window.scriptEdit.editor[changeType](window.scriptEdit.editor, 'require', lib);
		}
	};

	static updateLibraries(this: PaperLibrariesSelector, libraries: Array<LibrarySelectorLibrary>, mode: 'main'|'background') {
		this.set('libraries', libraries);
		this.mode = mode || 'main';
		this.init();
	};

	static behaviors = [Polymer.PaperDropdownBehavior]
}

Polymer(PLS);