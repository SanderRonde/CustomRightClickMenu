/**
 * A shorthand name for chrome.storage.sync
 */
window.storage = chrome.storage.sync;
var contextMenuItems = {
	example: {
		name: 'example'
	}
};

function isNotSet(value) {
	return value === undefined || value === null;
}

function runOrAddAsCallback(toRun, thisElement, params) {
	if (window.app.settings) {
		toRun.apply(thisElement, params);
	}
	else {
		window.app.addSettingsReadyCallback(toRun, thisElement, params);
	}
}

/**
 * Inserts the value into given array
 *
 * @param toAdd - Value to add.
 * @param target   Array to add into.
 * @param position - The position at which to add.
 *
 * @return Complete array
 */
function insertInto(toAdd, target, position) {
	position = position || null;
	if (position) {
		var temp1, i;
		var temp2 = toAdd;
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
}

var allPermissions = [
			'alarms',
			'background',
			'bookmarks',
			'browsingData',
			'clipboardRead',
			'clipboardWrite',
			'contentSettings',
			'cookies',
			'contentSettings',
			'declarativeContent',
			'desktopCapture',
			'downloads',
			'history',
			'identity',
			'idle',
			'management',
			'notifications',
			'pageCapture',
			'power',
			'privacy',
			'printerProvider',
			'sessions',
			'system.cpu',
			'system.memory',
			'system.storage',
			'topSites',
			'tabCapture',
			'tts',
			'webNavigation',
			'webRequest',
			'webRequestBlocking'
];

var descriptions = {
	alarms: 'Makes it possible to create, view and remove alarms.',
	background: 'Runs the extension in the background even while chrome is closed. (https://developer.chrome.com/extensions/alarms)',
	bookmarks: 'Makes it possible to create, edit, remove and view all your bookmarks.',
	browsingData: 'Makes it possible to remove any saved data on your browser at specified time ' +
		'allowing the user to delete any history, saved passwords, cookies, cache and basically anything that is ' +
		'not saved in incognito mode but is in regular mode. This is editable so it is possible to delete ONLY your ' +
		'history and not the rest for example. (https://developer.chrome.com/extensions/bookmarks)',
	clipboardRead: 'Allows reading of the users\' clipboard',
	clipboardWrite: 'Allows writing data to the users\' clipboard',
	cookies: 'Allows for the setting, getting and listenting for changes of cookies on any website. (https://developer.chrome.com/extensions/cookies)',
	contentSettings: 'Allows changing or reading your browser settings to allow or deny things like javascript, plugins, popups, notifications or ' +
		'other things you can choose to accept or deny on a per-site basis. (https://developer.chrome.com/extensions/contentSettings)',
	declarativeContent: 'Allows for the running of scripts on pages based on their url and CSS contents. (https://developer.chrome.com/extensions/declarativeContent)',
	desktopCapture: 'Makes it possible to capture your screen, current tab or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
	downloads: 'Allows for the creating, pausing, removing, searching and removing of downloads and listening for any downloads happenng. ' +
		'(https://developer.chrome.com/extensions/downloads)',
	history: 'Makes it possible to read your history and remove/add specific urls. This can also be used to search your history and to see howmany ' +
		'times you visited given website. (https://developer.chrome.com/extensions/history)',
	identity: 'Allows for the API to ask you to provide your (google) identity to the script using oauth2, allowing you to pull data from lots of google APIs: ' +
		'calendar, contacts, custom search, drive, gmail, google maps, google+, url shortener (https://developer.chrome.com/extensions/identity)',
	idle: 'Allows a script to detect whether your pc is in a locked, idle or active state. (https://developer.chrome.com/extensions/idle)',
	management: 'Allows for a script to uninstall or get information about an extension you installed, this does not however give permission to install other extensions. ' +
		'(https://developer.chrome.com/extensions/management)',
	notifications: 'Allows for the creating of notifications. (https://developer.chrome.com/extensions/notifications)',
	pageCapture: 'Allows for the saving of any page in MHTML. (https://developer.chrome.com/extensions/pageCapture)',
	power: 'Allows for a script to keep either your screen or your system altogether from sleeping. (https://developer.chrome.com/extensions/power)',
	privacy: 'Allows for a script to query what privacy features are on/off, for exaple autoFill, password saving, the translation feature.' +
		' (https://developer.chrome.com/extensions/privacy)',
	printerProvider: 'Allows for a script to capture your print jobs\' content and the printer used. (https://developer.chrome.com/extensions/printerProvider)',
	sessions: 'Makes it possible for a script to get all recently closed pages and devices connected to sync, also allows it to re-open those closed pages. ' +
		'(https://developer.chrome.com/extensions/sessions)',
	"system.cpu": 'Allows a script to get info about the CPU. (https://developer.chrome.com/extensions/system_cpu)',
	"system.memory": 'Allows a script to get info about the amount of RAM memory on your computer. (https://developer.chrome.com/extensions/system_memory)',
	"system.storage": 'Allows a script to get info about the amount of storage on your computer and be notified when external storage is attached or detached. ' +
		'(https://developer.chrome.com/extensions/system_storage)',
	topSites: 'Allows a script to your top sites, which are the sites on your new tab screen. (https://developer.chrome.com/extensions/topSites)',
	tabCapture: 'Allows the capturing of the CURRENT tab and only the tab. (https://developer.chrome.com/extensions/tabCapture)',
	tts: 'Allows a script to use chrome\'s text so speach engine. (https://developer.chrome.com/extensions/tts)',
	webNavigation: 'Allows a script info about newly created pages and allows it to get info about what website visit at that time.' +
		' (https://developer.chrome.com/extensions/webNavigation)',
	webRequest: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded ' +
		'on the side, and can basically track the entire process of opening a new website. (https://developer.chrome.com/extensions/webRequest)',
	webRequestBlocking: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded ' +
		'on the side, and can basically track the entire process of opening a new website. This also allows the script to block certain requests for example for blocking ' +
		'ads or bad sites. (https://developer.chrome.com/extensions/webRequest)'
};

Polymer({
	is: 'crm-app',

	/**
	 * A collection of all event listeners on the settings and crm object
	 * 
	 * @attribute elementListeners
	 * @type Array
	 * @default []
	 */
	elementListeners: [],

	/**
	 * The previous crm object
	 * 
	 * @attribute prevCRM
	 * @type Object
	 * @default {}
	 */
	prevCRM: {},

	/**
	  * Whether to show the item-edit-page
	  *
	  * @attribute show
	  * @type Boolean
	  * @default false
	  */
	show: false,

	/**
	  * What item to show in the item-edit-page
	  *
	  * @attribute item
	  * @type Object
	  * @default {}
	  */
	item: {},

	/**
	 * The item to show, if it is a script
	 *
	 * @attribute scriptItem
	 * @type Object
	 * @default {}
	 */
	scriptItem: {},

	/**
	 * The item to show, if it is a stylesheet
	 *
	 * @attribute stylesheetItem
	 * @type Object
	 * @default {}
	 */
	stylesheetItem: {},

	/**
	 * The tern server for the codeMirror editor
	 *
	 * @attribute ternServer
	 * @type ternServer
	 * @default null
	 */
	ternServer: null,

	/*
	 * The file that is used to write to when using an exteral editor
	 *
	 * @attribute file
	 * @type fileEntry
	 * @value null
	 */
	file: null,

	/*
	 * The last-used unique ID
	 *
	 * @attribute latestId
	 * @type Number
	 * @value -1
	 */
	latestId: -1,

	properties: {
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
		}
	},

	reverseString: function(string) {
		return string.split('').reverse().join('');
	},

	placeCommas: function(number) {
		var split = this.reverseString(number.toString()).match(/[0-9]{1,3}/g);
		return this.reverseString(split.join(','));
	},

	getSettingsJsonLengthColor: function () {
		var red;
		var green;
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
	},

	switchToIcons: function (index) {
		console.log('switch');
		var i;
		var element;
		var crmTypes = document.querySelectorAll('.crmType');
		for (i = 0; i < 6; i++) {
			if (index === i) {
				element = crmTypes[i];
				element.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
				element.classList.add('toggled');

				if (index === 5) {
					$('<div class="crmTypeShadowMagicElementRight"></div>').appendTo(element);
				} else {
					$('<div class="crmTypeShadowMagicElement"></div>').appendTo(element);
				}
			}
		}
		this.crmType = index;
		console.log(this.crmType);
		this.fire('crmTypeChanged', {});
	},

	iconSwitch: function (e) {
		var index = 0;
		var path = e.path[index];
		while (!path.classList.contains('crmType')) {
			index++;
			path = e.path[index];
		}

		console.log('switch');
		var crmEl;
		var element = path;
		var selectedType = this.crmType;
		var crmTypes = document.querySelectorAll('.crmType');
		for (var i = 0; i < 6; i++) {
			crmEl = crmTypes.item(i);
			if (crmEl === element) {
				crmEl.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
				crmEl.style.backgroundColor = 'rgb(243,243,243)';
				crmEl.classList.add('toggled');

				if (i === 5) {
					$('<div class="crmTypeShadowMagicElementRight"></div>').appendTo(crmEl);
				} else {
					$('<div class="crmTypeShadowMagicElement"></div>').appendTo(crmEl);
				}

				selectedType = i;
			} else {
				//Drop an element for some magic
				crmEl.style.boxShadow = 'none';
				crmEl.style.backgroundColor = 'white';
				crmEl.classList.remove('toggled');

				$(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();
			}
		}
		chrome.storage.local.set({
			selectedCrmType: selectedType
		});
		this.crmType = selectedType;
		console.log(this.crmType);
		this.fire('crmTypeChanged', {});
	},

	/**
	 * Generates an ID for a node
	 * 
	 * @returns {Number} A unique ID
	 */
	generateItemId: function () {
		var _this = this;
		this.latestId++;
		chrome.storage.local.set({
			latestId: _this.latestId
		});
		return this.latestId;
	},

	toggleToolsRibbon: function() {
		if (window.app.settings.hideToolsRibbon) {
			$(window.doc.editorToolsRibbonContainer).animate({
				marginLeft: '-200px'
			}, 250);
			window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
		} else {
			$(window.doc.editorToolsRibbonContainer).animate({
				marginLeft: 0
			}, 250);
			window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
		}
		window.app.settings.hideToolsRibbon = !window.app.settings.hideToolsRibbon;
		chrome.storage.sync.set({
			hideToolsRibbon: window.app.settings.hideToolsRibbon
		});
	},

	toggleShrinkTitleRibbon: function() {
		if (window.app.settings.shrinkTitleRibbon) {
			$(window.doc.editorTitleRibbon).animate({
				fontSize: '100%'
			}, 250);
			$(window.doc.editorCurrentScriptTitle).animate({
				paddingTop: '4px',
				paddingBottom: '4px'
			}, 250);
			window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
		} else {
			$(window.doc.editorTitleRibbon).animate({
				fontSize: '40%'
			}, 250);
			$(window.doc.editorCurrentScriptTitle).animate({
				paddingTop: 0,
				paddingBottom: 0
			}, 250);
			window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
		}
		window.app.settings.shrinkTitleRibbon = !window.app.settings.shrinkTitleRibbon;
		chrome.storage.sync.set({
			shrinkTitleRibbon: window.app.settings.shrinkTitleRibbon
		});
	},

	launchSearchWebsiteTool: function () {
		this.$.paperSearchWebsiteDialog.init();
		this.$.paperSearchWebsiteDialog.show();
	},
	
	launchExternalEditorDialog: function () {
		if (!window.doc.externalEditorDialogTrigger.disabled) {
			window.externalEditor.init();
			window.externalEditor.editingCRMItem = (window.scriptEdit ? window.scriptEdit.item : window.stylesheetEdit.item);
			window.externalEditor.setupExternalEditing();
		}
	},

	runJsLint: function() {
		window.scriptEdit.editor.performLint();
	},

	runCssLint: function() {
		window.stylesheetEdit.editor.performLint();
	},

	showCssTips: function() {
		window.doc.cssEditorInfoDialog.open();
	},

	addSettingsReadyCallback: function(callback, thisElement, params) {
		this.onSettingsReadyCallbacks.push({
			callback: callback,
			thisElement: thisElement,
			params: params
		});
	},

	cutData: function(data, segmentSize) {
		var obj = {};
		var arrLength;
		var sectionKey;
		var indexes = [];
		var splitJson = data.match(/[\s\S]{1,5000}/g);
		splitJson.forEach(function (section) {
			arrLength = indexes.length;
			sectionKey = 'section' + arrLength;
			obj[sectionKey] = section;
			indexes[arrLength] = sectionKey;
		});
		obj.indexes = indexes;
		return obj;
	},

	/**
	 * Uploads this object to chrome.storage.sync
	 */
	upload: function () {
		console.log(this.settings);
		var settingsJson = JSON.stringify(this.settings);
		var stringLength = settingsJson.length;
		this.settingsJsonLength = stringLength;
		if (this.settings.useStorageSync) {
			chrome.storage.local.set({
				settings: this.settings
			}, function() {
				if (chrome.runtime.lastError) {
					console.log('Error on uploading to chrome.storage.local ', chrome.runtime.lastError);
				} else {
					chrome.runtime.sendMessage({
						type: 'updateContextMenu'
					});
				}
			});
			chrome.storage.sync.set({
				indexes: null
			});
		} else {
			//Using chrome.storage.sync
			var _this = this;
			if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
				console.log('this is why it failed', settingsJson.length);
				window.doc.storageExceededToast.show();
				chrome.storage.local.set({
					useStorageSync: false
				}, function () {
					_this.upload();
				});
			} else {
				//Cut up all data into smaller JSON
				var obj = this.cutData(settingsJson);
				chrome.storage.sync.set(obj, function () {
					if (chrome.runtime.lastError) {
						//Switch to local storage
						console.log('Error on uploading to chrome.storage.sync ', chrome.runtime.lastError);
						window.doc.storageExceededToast.show();
						chrome.storage.local.set({
							useStorageSync: false
						}, function() {
							_this.upload();
						});
					} else {
						chrome.runtime.sendMessage({
							type: 'updateContextMenu'
						});
						chrome.storage.local.set({
							settings: null
						});
					}
				});
			}
		}
		this.pageDemo.create();
	},

	bindListeners: function() {
		var urlInput = window.doc.addLibraryUrlInput;
		var manualInput = window.doc.addLibraryManualInput;
		window.doc.addLibraryUrlOption.addEventListener('change', function () {
			manualInput.style.display = 'none';
			urlInput.style.display = 'block';
		});
		window.doc.addLibraryManualOption.addEventListener('change', function () {
			urlInput.style.display = 'none';
			manualInput.style.display = 'block';
		});
		$('#addLibraryDialog').on('iron-overlay-closed', function () {
			$(this).find('#addLibraryButton, #addLibraryConfirmAddition, #addLibraryDenyConfirmation').off('click');
		});
	},

	restoreUnsavedInstances: function (editingObj, errs) {
		var _this = this;
		errs = errs + 1 || 0;
		if (errs < 5) {
			try {
				var crmItem = this.crm.lookup(editingObj.crmPath);
				var code = (crmItem.type === 'script' ? crmItem.script : crmItem.stylesheet);
				$('.keepChangesButton').on('click', function () {
					if (crmItem.type === 'script') {
						crmItem.value.script =
							editingObj.val;
					} else {
						crmItem.value.stylesheet = editingObj.val;
					}
					chrome.storage.local.set({
						editing: null
					});
					chrome.storage.local.get(function(items) {
						console.log(items);
						console.log(items.editing);
					});
				});
				$('.restoreChangesBack').on('click', function() {
					window.doc.restoreChangesOldCode.style.display = 'none';
					window.doc.restoreChangesUnsavedCode.style.display = 'none';
					window.doc.restoreChangesMain.style.display = 'block';
					window.doc.restoreChangesDialog.fit();
				});
				$('.discardButton').click(function() {
					chrome.storage.local.set({
						editing: null
					});
				});
				window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
				window.doc.restoreChangesOldCodeCont.innerHTML = '';
				var oldEditor = window.CodeMirror(window.doc.restoreChangesOldCodeCont, {
					lineNumbers: window.app.settings.editor.lineNumbers,
					value: code,
					scrollbarStyle: 'simple',
					lineWrapping: true,
					readOnly: 'nocursor',
					theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
					indentUnit: window.app.settings.editor.tabSize,
					indentWithTabs: window.app.settings.editor.useTabs
				});
				var unsavedEditor = window.CodeMirror(window.doc.restoreChangeUnsaveddCodeCont, {
					lineNumbers: window.app.settings.editor.lineNumbers,
					value: code,
					scrollbarStyle: 'simple',
					lineWrapping: true,
					readOnly: 'nocursor',
					theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
					indentUnit: window.app.settings.editor.tabSize,
					indentWithTabs: window.app.settings.editor.useTabs
				});
				window.doc.restoreChangesDialog.addEventListener('iron-overlay-closed', function() {
					//Remove the CodeMirror instances for performance
					window.doc.restoreChangesOldCodeCont.innerHTML = '';
					window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
				});
				window.doc.restoreChangesShowOld.addEventListener('click', function() {
					window.doc.restoreChangesMain.style.display = 'none';
					window.doc.restoreChangesUnsavedCode.style.display = 'none';
					window.doc.restoreChangesOldCode.style.display = 'flex';
					window.doc.restoreChangesDialog.fit();
					oldEditor.refresh();
				});
				window.doc.restoreChangesShowUnsaved.addEventListener('click', function() {
					window.doc.restoreChangesMain.style.display = 'none';
					window.doc.restoreChangesOldCode.style.display = 'none';
					window.doc.restoreChangesUnsavedCode.style.display = 'flex';
					window.doc.restoreChangesDialog.fit();
					unsavedEditor.refresh();
				});

				//TODO no cancel on clicking

				//TODO "show/hide", "show/hide on given sites"

				var stopHighlighting = function(crmItem) {
					$(crmItem).find('.item')[0].animate([
						{
							opacity: 1
						}, {
							opacity: 0.6
						}
					], {
						duration: 250,
						easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
					}).onfinish = function() {
						this.effect.target.style.opacity = 0.6;
						window.doc.restoreChangesDialog.open();
						$('.pageCont').animate({
							backgroundColor: 'white'
						}, 200);
						$('edit-crm-item').find('.item').animate({
							opacity: 1
						}, 200, function() {
							document.body.style.pointerEvents = 'all';
						});
					};
				}

				var highlightItem = function() {
					document.body.style.pointerEvents = 'none';
					var crmItem = $($($('#mainCont').children('div')[editingObj.crmPath.length - 1]).children('.CRMEditColumn')[0]).children('edit-crm-item')[editingObj.crmPath[editingObj.crmPath.length - 1]];
					//Just in case the item doesn't exist (anymore)
					if ($(crmItem).find('.item')[0]) {
						$(crmItem).find('.item')[0].animate([
							{
								opacity: 0.6
							}, {
								opacity: 1
							}
						], {
							duration: 250,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}).onfinish = function() {
							this.effect.target.style.opacity = 1;
						};
						setTimeout(function() {
							stopHighlighting(crmItem);
						}, 3250);
					} else {
						window.doc.restoreChangesDialog.open();
						$('.pageCont').animate({
							backgroundColor: 'white'
						}, 200);
						$('edit-crm-item').find('.item').animate({
							opacity: 1
						}, 200, function() {
							document.body.style.pointerEvents = 'all';
						});
					}
				}

				window.doc.highlightChangedScript.addEventListener('click', function() {
					//Find the element first
					//Check if the element is already visible
					window.doc.restoreChangesDialog.close();
					$('.pageCont')[0].style.backgroundColor = 'rgba(0,0,0,0.4)';
					$('edit-crm-item').find('.item').css('opacity', 0.6);

					//Check if it's visible in the current crmType
					//HIERZO

					setTimeout(function() {
						if (editingObj.crmPath.length === 1) {
							//Always visible
							highlightItem();
						} else {
							var visible = true;
							for (var i = 1; i < editingObj.crmPath.length; i++) {
								if (app.editCRM.crm[i].indent.length !== editingObj.crmPath[i - 1]) {
									visible = false;
									break;
								}
							}
							if (!visible) {
								//Make it visible
								var popped = JSON.parse(JSON.stringify(editingObj.crmPath.length));
								popped.pop();
								app.editCRM.build(popped);
								setTimeout(highlightItem, 700);
							} else {
								highlightItem();
							}
						}
					}, 250);
				});
				window.doc.restoreChangesDialog.open();
			} catch (e) {
				//Oh god what am i doing...
				setTimeout(function() {
					try {
						$('.keepChangesButton').off('click');
						$('.restoreChangesBack').off('click');
						window.doc.restoreChangesDialog.close();
						window.doc.restoreChangesDialog.removeEventListener('iron-overlay-closed');
						window.doc.restoreChangesShowUnsaved.removeEventListener('click');
						window.doc.restoreChangesShowOld.removeEventListener('click');
					} catch (e) {
					}

					_this.restoreUnsavedInstances(editingObj, errs);
				}, 400);
			}
		}
	},

	updateEditorZoom: function() {
		var prevStyle = document.getElementById('editorZoomStyle');
		prevStyle && prevStyle.remove();
		$('<style id="editorZoomStyle">' +
			'.CodeMirror, .CodeMirror-focused {' +
			'font-size: ' + (1.25 * window.app.settings.editor.zoom) + '%!important;' +
			'}' +
			'</style>').appendTo('head');
		$('.CodeMirror').each(function() {
			this.CodeMirror.refresh();
		});
	},

	/**
	 * Shows the user a dialog and asks them to allow/deny those permissions
	 * @param {string[]} toRequest - An arry of strings of permissions to request
	 */
	requestPermissions: function (toRequest) {
		var index;
		var i;
		for (i = 0; i < toRequest.length; i++) {
			index = allPermissions.indexOf(toRequest[i]);
			if (index > -1) {
				allPermissions.splice(index, 1);
			}
		}

		chrome.permissions.getAll(function(allowed) {
			var requested = [];
			for (i = 0; i < toRequest.length; i++) {
				requested.push({
					name: toRequest[i],
					description: descriptions[toRequest[i]],
					toggled: false
				});
			}

			var other = [];
			for (i = 0; i < allPermissions.length; i++) {
				other.push({
					name: allPermissions[i],
					description: descriptions[allPermissions[i]],
					toggled: (allowed.permissions.indexOf(allPermissions[i]) > -1)
				});
				if (other[other.length - 1].toggled) {
					console.log('toggled', other[other.length - 1].name);
				}
			}

			var overlay;

			function handler() {
				var el, svg;
				overlay.removeEventListener('iron-overlay-opened', handler);
				$('.requestPermissionsShowBot').click(function () {
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
				$('#requestPermissionsShowOther').click(function () {
					var showHideSvg = this;
					var otherPermissions = $(this).parent().parent().children('#requestPermissionsOther')[0];
					if (!otherPermissions.style.height || otherPermissions.style.height === '0px') {
						$(otherPermissions).animate({
							height: otherPermissions.scrollHeight + 'px'
						}, 350, function () {
							showHideSvg.children[0].style.display = 'none';
							showHideSvg.children[1].style.display = 'block';
						});
					} else {
						$(otherPermissions).animate({
							height: 0
						}, 350, function () {
							showHideSvg.children[0].style.display = 'block';
							showHideSvg.children[1].style.display = 'none';
						});
					}
				});

				var permission;
				$('.requestPermissionButton').click(function () {
					permission = this.previousElementSibling.previousElementSibling.textContent;
					var slider = this;
					if (this.checked) {
						chrome.permissions.request({
							permissions: [permission]
						}, function(accepted) {
							if (!accepted) {
								//The user didn't accept, don't pretend it's active when it's not, turn it off
								slider.checked = false;
							} else {
								//Accepted, remove from to-request permissions
								chrome.storage.local.get(function (e) {
									var permissionsToRequest = e.requestPermissions;
									requestPermissions.splice(requestPermissions.indexOf(permission), 1);
									chrome.storage.local.set({
										requestPermissions: permissionsToRequest
									});
								});
							}
						});
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

				$('#requestPermissionsAcceptAll').click(function () {
					console.log(toRequest);
					chrome.permissions.request({
						permissions: toRequest
					}, function (accepted) {
						console.log(accepted);
						if (accepted) {
							chrome.storage.local.set({
								requestPermissions: []
							});
							$('.requestPermissionButton.required').each(function() {
								this.checked = true;
							});
						}
					});
				});
			}

			var interval = window.setInterval(function () {
				try {
					if (window.doc.requestPermissionsCenterer.$.content.children[0].open) {
						window.clearInterval(interval);
						overlay = window.doc.requestPermissionsCenterer.$.content.children[0];
						$('#requestedPermissionsTemplate')[0].items = requested;
						$('#requestedPermissionsOtherTemplate')[0].items = other;
						overlay.addEventListener('iron-overlay-opened', handler);
						overlay.open();
					}
				} catch (e) {
					//Somehow the element doesn't exist yet
				}
			}, 100);
		});
	},

	/**
	 * Creates a new settings object
	 */
	setupFirstTime: function() {
		this.init = true;
		this.scriptEditingId = 1234;
		this.settings.crm = [
			this.templates.getDefaultLinkNode({
				id: this.generateItemId()
			})
		];
		this.upload();
	},

	/**
	 * Checks whether the given settings object is valid
	 * 
	 * @param settings - The settings object to check
	 */
	checkSettings: function (settings) {
		//TODO implement or not
		if (settings.init) {
			if (!settings.crm) {
				settings.crm = [
					this.templates.getDefaultLinkNode()
				];
				this.settings = settings;
				this.upload();
			}
		} else {
			this.setupFirstTime();
		}
	},

	setLocal: function (key, value) {
		var obj = {};
		obj[key] = value;
		chrome.storage.local.set(obj);
		this.upload();
	},

	ready: function () {
		var _this = this;
		this.crm.parent = this;
		window.app = this;
		window.doc = window.app.$;
		function callback(items) {
			_this.settings = items;
			for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
				_this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
			}			
			_this.updateEditorZoom();
			_this.checkSettings(_this.settings);
			_this.pageDemo.create();
		}

		this.bindListeners();
		chrome.storage.local.get(function (storageLocal) {
			if (storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0) {
				_this.requestPermissions(storageLocal.requestPermissions);
			}
			if (storageLocal.editing) {
				setTimeout(function() {
					//Check out if the code is actually different
					var node = _this.crm.lookup(storageLocal.editing.crmPath).value;
					var nodeCurrentCode = (node.script ? node.script : node.stylesheet);
					if (nodeCurrentCode !== storageLocal.editing.val) {
						_this.restoreUnsavedInstances(storageLocal.editing);
					} else {
						chrome.storage.local.set({
							editing: null
						});
					}
				}, 2500);
			}
			if (storageLocal.selectedCrmType !== undefined) {
				_this.crmType = storageLocal.selectedCrmType;
				_this.switchToIcons(storageLocal.selectedCrmType);
			} else {
				chrome.storage.local.set({
					selectedCrmType: 0
				});
				_this.crmType = 0;
				_this.switchToIcons(0);
			}
			if (storageLocal.jsLintGlobals) {
				_this.jsLintGlobals = storageLocal.jsLintGlobals;
			} else {
				_this.jsLintGlobals = [];
				chrome.storage.local.set({
					jsLintGlobals: []
				});
			}
			if (storageLocal.latestId) {
				_this.latestId = storageLocal.latestId;
			} else {
				chrome.storage.local.set({
					latestId: 0
				});
				_this.latestId = 0;
			}
			if (storageLocal.useStorageSync) {
				//Parse the data before sending it to the callback
				chrome.storage.sync.get(function (storageSync) {
					var indexes = storageSync.indexes;
					if (!indexes) {
						chrome.storage.local.set({
							useStorageSync: false
						});
						callback(storageLocal.settings);
					} else {
						var settingsJsonArray = [];
						indexes.forEach(function(index) {
							settingsJsonArray.push(storageSync[index]);
						});
						var jsonString = settingsJsonArray.join('');
						_this.settingsJsonLength = jsonString.length;
						var settings = JSON.parse(jsonString);
						console.log(settings);
						callback(settings);
					}
				});
			} else {
				//Send the "settings" object on the storage.local to the callback
				_this.settingsJsonLength = JSON.stringify(storageLocal.settings).length;
				if (!storageLocal.settings) {
					chrome.storage.local.set({
						useStorageSync: true
					});
					chrome.storage.sync.get(function(storageSync) {
						var indexes = storageSync.indexes;
						var settingsJsonArray = [];
						indexes.forEach(function(index) {
							settingsJsonArray.push(storageSync[index]);
						});
						var jsonString = settingsJsonArray.join('');
						_this.settingsJsonLength = jsonString.length;
						var settings = JSON.parse(jsonString);
						console.log(settings);
						callback(settings);
					});
				} else {
					callback(storageLocal.settings);
				}
			}
		});
		this.show = false;
	},

	/**
	 * Any templates
	 */
	templates: {
		/**
		 * Merges two objects
		 * 
		 * @param {Object} mainObject - The main object
		 * @param {Object} additions - The additions to the main object, these overwrite the 
		 *		main object's properties
		 * @returns {Object} The merged objects
		 */
		mergeObjects: function(mainObject, additions) {
			for (var key in additions) {
				if (additions.hasOwnProperty(key)) {
					mainObject[key] = additions[key];
				}
			}
			return mainObject;
		},

		/**
		 * Gets the default link node object with given options applied
		 * 
		 * @param {Object} options - Any pre-set properties
		 * @returns {Object} A link node with specified properties set
		 */
		getDefaultLinkNode: function(options) {
			var defaultNode = {
				name: 'name',
				onContentTypes: [true, false, false, false, false, false],
				type: 'link',
				isLocal: true,
				vaue: {
					0: {
						newTab: true,
						url: 'https://www.example.com'
					}
				}
			};

			return this.mergeObjects(defaultNode, options);
		}
	},

	/*
	 * Functions related to the on-page example of your current CRM
	 */
	pageDemo: {
		stylesheetId: 0,
		usedStylesheetIds: [],

		handlers: {
			/**
			 * Makes an onclick handler for links
			 *
			 * @param data - The data to open
			 *
			 * @return the function to execute on clicking a link
			 */
			link: function(data) {
				return function() {
					for (var i = 0; i < data.length; i++) {
						window.open(data[i], '_blank');
					}
				}
			},

			/**
			 * Makes an onclick handler for scripts
			 *
			 * @param data - Script to execute.
			 *
			 * @return the function to execute on click a script
			 */
			script: function(data) {
				return function() {
					eval(data);
				}
			},

			/**
			 * The stylesheet handlers
			 */
			stylesheet: {
				/**
				 * Makes an onclick handler for stylesheets
				 *
				 * @param data - Stylesheet to execute.
				 * @param checked - Whether the element is checked
				 *
				 * @return the function to execute on click a stylesheet
				 */
				toggle: function(data, checked) {
					var id = this.parent.stylesheetId++;
					this.parent.usedStylesheetIds.push(id);

					var style = document.createElement('style');
					style.setAttribute('id', 'stylesheet' + id);
					style.appendChild(document.createTextNode(data));
					style.disabled = !checked;
					document.head.appendChild(style);

					return function() {
						style.disabled = !style.disabled;
					}
				},
				/**
				 * Makes an onclick handler for stylesheets
				 *
				 * @param data - Stylesheet to execute.
				 *
				 * @return the function to execute on click a stylesheet
				 */
				normal: function(data) {
					return function() {
						var style = document.createElement('style');
						style.appendChild(document.createTextNode(data));
						document.head.appendChild(style);
					}
				}
			},

			get parent() {
				return window.app.pageDemo;
			}
		},

		node: {
			/**
			 * Adds a link to the CRM
			 *
			 * @param toAdd - The item to add.
			 *
			 * @return The node
			 */
			link: function(toAdd) {
				var item = {};
				item.name = toAdd.name;
				item.callback = this.parent.handlers.link(toAdd.value);
				return item;
			},

			/**
			 * Adds a script to the CRM
			 *
			 * @param toAdd - The item to add.
			 *
			 * @return The node
			 */
			script: function (toAdd) {
				var item = {};
				item.name = toAdd.name;
				item.callback = this.parent.handlers.script(toAdd.value.script);
				return item;
			},

			/**
			 * Adds a stylesheet to the CRM
			 *
			 * @param toAdd - The item to add.
			 *
			 * @return The node
			 */
			stylesheet: function (toAdd) {
				var item = {};
				item.name = toAdd.name;
				if (toAdd.value.toggle) {
					item.type = 'checkbox';
					item.selected = toAdd.value.defaultOn;
					item.callback = this.parent.handlers.stylesheet.toggle(toAdd.value.stylesheet, toAdd.value.defaultOn);
				} else {
					console.log(this.parent.handlers.stylesheet);
					item.callback = this.parent.handlers.stylesheet.normal(toAdd.value.stylesheet);
				}
				return item;
			},

			/**
			 * Adds a divider to the CRM
			 *
			 * @return The node
			 */
			divider: function() {
				return '---------';
			},

			
			/**
			 * Adds a menu to the CRM
			 *
			 * @param toAdd - The item to add.
			 *
			 * @return The node
			 */
			menu: function (toAdd, crmType) {
				var _this = this;
				var item = {};
				item.name = toAdd.name;
				var index = 0;
				var childItems = {};
				toAdd.children.forEach(function (node) {
					if (_this.parent.isNodeVisible(node, crmType)) {
						switch (node.type) {
							case 'link':
								childItems[index++] = _this.link(node);
								break;
							case 'script':
								childItems[index++] = _this.script(node);
								break;
							case 'stylesheet':
								childItems[index++] = _this.stylesheet(node);
								break;
							case 'divider':
								childItems[index++] = _this.divider();
								break;
							case 'menu':
								childItems[index++] = _this.menu(node, crmType);
								break;
						}
					}
				});
				item.items = childItems;
				return item;
			},

			get parent() {
				return window.app.pageDemo;
			}
		},

		/**
		 * Returns whether the node is visible or not (1 if it's visible)
		 * 
		 * @param {Object} node - The node to check
		 * @param {boolean[]} showContentType - Array of which content types to show
		 * 
		 * @returns {Number} 1 if the node is visible, 0 if it's not
		 */
		isNodeVisible: function(node, showContentType) {
			var i;
			var length;
			if (node.children && node.children.length > 0) {
				length = node.children.length;
				var visible = 0;
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
		},

		/**
		 * Builds the context-menu for given crmType
		 * 
		 * @param {Number} crmType - The type of the content the menu will be shown on
		 */
		buildForCrmType: function (crmType) {
			console.log('callin');
			var _this = this;
			var index = 0;
			var childItems = {};
			var crm = window.app.settings.crm;
			crm.forEach(function (node) {
				if (_this.isNodeVisible(node, crmType)) {
					switch (node.type) {
					case 'link':
						childItems[index++] = _this.node.link(node);
						break;
					case 'script':
						childItems[index++] = _this.node.script(node);
						break;
					case 'stylesheet':
						childItems[index++] = _this.node.stylesheet(node);
						break;
					case 'divider':
						childItems[index++] = _this.node.divider();
						break;
					case 'menu':
						childItems[index++] = _this.node.menu(node, crmType);
						break;
					}
				}
			});
			return childItems;
		},

		getCrmTypeFromNumber: function (crmType) {
			var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
			return types[crmType];
		},

		bindContextMenu: function (crmType) {
			var _this = this;
			if (crmType === 0) {
				$.contextMenu({
					selector: 'body, #editCrm.page, .crmType.pageType',
					items: _this.buildForCrmType(0)
				});
			} else {
				var contentType = _this.getCrmTypeFromNumber(crmType);
				$.contextMenu({
					selector: '#editCrm.' + contentType + ', .crmType.' + contentType + 'Type',
					items: _this.buildForCrmType(crmType)
				});
			}
		},

		contextMenuItems: [],

		removeContextMenus: function () {
			var el;
			this.usedStylesheetIds.forEach(function (id) {
				el = document.getElementById('stylesheet' + id);
				el && el.remove();
			});

			var selector;
			var contentType;
			for (var i = 0; i < 6; i++) {
				contentType = this.getCrmTypeFromNumber(i);
				selector = (i === 0 ? 'body, ' : '') + '#editCrm.' + contentType + ', .crmType.' + contentType + 'Type';
				$.contextMenu('destroy', {
					selector: selector
				});
			}
		},

		loadContextMenus: function() {
			var _this = this;
			var toLoad = 0;
			this.removeContextMenus();
			if ('requestIdleCallback' in window) {
				function loadContextMenus(deadline) {
					while (toLoad < 6 && deadline.timeRemaining() > 0) {
						_this.bindContextMenu(toLoad++);
					}

					if (toLoad !== 5) {
						window.requestIdleCallback(loadContextMenus);
					}
				}

				window.requestIdleCallback(loadContextMenus);
			} else {
				while (toLoad < 6) {
					_this.bindContextMenu(toLoad++);
				}
			}
		},

		/**
		 * Creates the on-page example
		 */
		create: function () {
			//TODO turn this on again
			//this.loadContextMenus();
		},

		get parent() {
			return window.app;
		}
	},

	/**
	 * CRM functions.
	 */
	crm: {
		_getEvalPath: function(path) {
			return 'window.app.settings.crm[' + (path.join('].children[')) + ']';
		},

		lookup: function(path, returnArray) {
			var pathCopy = JSON.parse(JSON.stringify(path));
			console.log(pathCopy);
			if (returnArray) {
				pathCopy.splice(pathCopy.length - 1, 1);
			}
			if (path.length === 0) {
				return window.app.settings.crm;
			}

			if (path.length === 1) {
				return (returnArray ? window.app.settings.crm : window.app.settings.crm[path[0]]);
			}

			var evalPath = this._getEvalPath(pathCopy);
			console.log(evalPath);
			var result = eval(evalPath);
			console.log(returnArray);
			console.log(result);
			return (returnArray ? result.children : result);
		},

		_lookupId: function (id, returnArray, node) {
			console.log(id, node.id);
			if (node.id === id) {
				console.log('found');
				return node;
			}

			var nodeChildren = node.children;

			if (nodeChildren) {
				var el;
				for (var i = 0; i < nodeChildren.length; i++) {
					el = this._lookupId(id, returnArray, nodeChildren[i]);
					if (el !== null) {
						return (returnArray ? nodeChildren : el);
					}
				}
			}
			return null;
		},

		lookupId: function (id, returnArray) {
			var el;
			for (var i = 0; i < window.app.settings.crm.length; i++) {
				el = this._lookupId(id, returnArray, window.app.settings.crm[i]);
				if (el) {
					return el;
				}
			}
			return null;
		},

		setDataInCrm: function(path) {
			var evalPath = this._getEvalPath(path);
			return function(key, data) {
				// ReSharper disable once WrongExpressionStatement
				data;
				eval(evalPath + '[key] = data');
			}
		},

		/**
		 * Adds value to the CRM
		 *
		 * @param value - The value to add
		 * @param position - The position to add it in
		 */
		add: function (value, position) {
			if (position === 'first') {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm, 0);
			} else if (position === 'last' || position === undefined) {
				this.parent.settings.crm[this.parent.settings.crm.length] = value;
			} else {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm);
			}
			options.upload();
		},

		/**
		 * Moves a value in the CRM from one place to another
		 *
		 * @param toMove - The value to move's location (in path form)
		 * @param target - Where to move the item to (in path form)
		 * @param sameColumn - Whether the item has stayed in the same column
		 */
		move: function(toMove, target, sameColumn) {
			var toMoveContainer = this.lookup(toMove, true);
			var toMoveIndex = toMoveContainer.splice(toMove.length - 1, 1);
			var toMoveItem = toMoveContainer[toMoveIndex];

			var newTarget = this.lookup(target, true);
			var targetIndex = target.splice(target.length - 1, 1);

			if (sameColumn && toMoveIndex > targetIndex) {
				insertInto(toMoveItem, newTarget, targetIndex);
				toMoveContainer.splice(parseInt(toMoveIndex, 10) + 1, 1);
			} else {
				insertInto(toMoveItem, newTarget, targetIndex);
				toMoveContainer.splice(toMoveIndex, 1);
			}
			app.upload();
		},

		remove: function(index) {
			this.lookup(index, true).splice(index[index.length - 1], 1);
			app.upload();
		}
	}
});