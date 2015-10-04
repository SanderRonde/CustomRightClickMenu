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
	if (window.options.settings) {
		toRun.apply(thisElement, params);
	}
	else {
		window.options.addSettingsReadyCallback(toRun, thisElement, params);
	}
}

function generateItemId(callback) {
	chrome.storage.local.get('latestId', function(items) {
		var id;
		if (items.latestId) {
			id = items.latestId;
		} else {
			id = 1;
			chrome.storage.local.set({ latestId: 1 });
		}
		callback && callback(id);
	});
}

/**
 * A shorthand version of $('settings-element')[0], allows for easy access to
 *	settings object (s.settings instead of something like
 *	$('settings-element')[0].settings
 */
//var s = $('settings-element')[0];

//Indicates this javascript file has loaded and is ready for execution
//s.jsLoaded = true;

/**
 * @fn function isEmpty(value)
 *
 * @brief Returns whether given value is empty
 *
 * @param value The value to be checked
 *
 * @return A boolean; true if the value is empty, false if not
 */
function isEmpty(value) {
	return (value === undefined || value === null);
}

//TODO Implement this function with new CRM-system
///**
// * @fn function addDefaultLink()
// *
// * @brief Adds default link to the CRM
// */
//function addDefaultLink() {
//	var defaultLinkItem = $(this).parent().parent();
//	var link = defaultLinkItem.find('.defaultLinkHref').html().trim();
//	var name = defaultLinkItem.find('input').val();
//	var newItem = new CRMItem('link', link, name);
//	settings.crm._add(newItem);
//}

/**
 * @fn function bindEvents()
 *
 * @brief Bind all event listeners to all targets
 */
function bindEvents() {
	//buildPageCrm();
}

/**
 * Makes an onclick handler for links
 *
 * @param toOpen Link to open.
 *
 * @return the function to execute on click
 */
function linkHandler(toOpen) {
	return function() {
		for (var i = 0; i < toOpen.length; i++) {
			window.open(toOpen[i], '_blank');
		}
	}
}

/**
 * Makes an onclick handler for scripts
 *
 * @param toExecute Script to execute.
 *
 * @return the function to execute on click
 */
function scriptHandler(toExecute) {
	return function () {
		eval(toExecute);
	}
}

/**
 * Adds a link to the CRM
 *
 * @param items    The items in the menu already.
 * @param toAdd    The item to add.
 * @param iterator The iterator's current value
 *
 * @return The items with the new item in it.
 */
function addLink(items, toAdd, iterator) {
	var item = {};
	item.name = toAdd.name;
	item.callback = linkHandler(toAdd.value);
	items[iterator] = item;
	return items;
}

/**
 * Adds a script to the CRM
 *
 * @param items    The items in the menu already.
 * @param toAdd    The item to add.
 * @param iterator The iterator's current value
 *
 * @return The items with the new item in it.
 */
function addScript(items, toAdd, iterator) {
	var item = {};
	item.name = toAdd.name;
	item.callback = scriptHandler(toAdd.value.script);
	items[iterator] = item;
	return items;
}

//TODO addCss

/**
 * Adds a divider to the CRM
 *
 * @param items    The items in the menu already.
 * @param toAdd    The item to add.
 * @param iterator The iterator's current value
 *
 * @return The items with the new item in it.
 */
function addDivider(items, toAdd, iterator) {
	var item = '---------';
	items[iterator] = item;
	return items;
}

/**
 * Adds a menu to the CRM
 *
 * @param items    The items in the menu already.
 * @param toAdd    The item to add.
 * @param iterator The iterator's current value
 *
 * @return The items with the new item in it.
 */
function addMenu(items, toAdd, iterator) {
	var item = {};
	item.name = toAdd.name;
	var childItems = {};
	toAdd.children.forEach(function (item, index) {
		switch (item.type) {
			case 'link':
				childItems = addLink(childItems, item,index);
				break;
			case 'script':
				childItems = addScript(childItems, item,index);
				break;
			case 'divider':
				childItems = addDivider(childItems, item,index);
				break;
			case 'menu':
				childItems = addMenu(childItems, item,index);
				break;
		}
	});
	item.items = childItems;
	items[iterator] = item;
	return items;
}

/**
 * Builds context menu.
 */
function buildContextMenu() {
	var items = {};
	var crm = options.settings.crm;
	crm.forEach(function (item, index) {
		switch (item.type) {
			case 'link':
				items = addLink(items, item, index);
				break;
			case 'script':
				items = addScript(items, item, index);
				break;
			case 'divider':
				items = addDivider(items, item, index);
				break;
			case 'menu':
				items = addMenu(items, item, index);
				break;
		}
	});
	contextMenuItems = items;
}
/**
 * @fn function bindContextMenu()
 *
 * @brief Bind context men to page.
 */
function bindContextMenu() {
	$.contextMenu({
		selector: 'body',
		build: function () {
			return {
				items: contextMenuItems
			};
		}
	});
}

/**
 * Creates a new settings object
 */
function setupFirstTime() {
	options.init = true;
	options.scriptEditingId = 1234;
	generateItemId(function(id) {
		options.settings.crm = [
			{
				name: 'example',
				type: 'link',
				id: id,
				value: [
					{
						value: 'http://www.example.com',
						newTab: true
					}
				]
			}
		];
		options.upload();
	});
}

/**
 * 
 * @param {} toCheck 
 * @returns {} 
 */
function checkArray(toCheck) {
	var i;
	var changes = false;
	var result;
	toCheck.map(function (item, index) {
		if (isNotSet(item)) {
			changes = true;
			item = {
				name: 'name',
				type: 'link',
				value: [
					{
						url: 'http://www.example.com',
						newTab: true
					}
				]
			};
		}
		if (isNotSet(item.id)) {
			generateItemId(function(id) {
				changes = true;
				item.id = id;
			});
		}
		if (isNotSet(item.name)) {
			changes = true;
			item.name = 'name';
		}
		if (!(item.type === 'link' || item.type === 'script' || item.type === 'divider' || item.type === 'menu' || item.type === 'stylesheet')) {
			changes = true;
			item.type = 'link';
		}
		if (isNotSet(item.value)) {
			changes = true;
			item.value = [
				{
					url: 'http://www.example.com',
					newTab: true
				}
			];
		} else {
			if (item.type === 'link') {
				if (typeof item.value !== 'object') {
					item.value = [
						{
							url: 'http://www.example.com',
							newTab: true
						}
					];
				} else {
					for (i = 0; i < item.value.length; i++) {
						if (isNotSet(item.value[i])) {
							changes = true;
							item.value[i] = {
								url: 'http://www.example.com',
								newTab: true
							};
						}
						if (isNotSet(item.value[i].value)) {
							changes = true;
							item.value[i].url = 'http:/www.example.com';
						}
						if (isNotSet(item.value[i].newTab)) {
							changes = true;
							item.value[i].newTab = true;
						}
					}
				}
			}
			//TODO check other data types
			/*For script:
			 * 
			 * script itself, libraries, launchMode, contentTypes
			 */
		}
		if (isNotSet(item.index)) {
			changes = true;
			item.index = index;
		}
		if (item.children && item.children.length > 0) {
			result = checkArray(item.children);
			if (result !== false) {
				item.children = result;
				changes = true;
			}
		}
		toCheck[index] = item;
	});
	if (changes) {
		return toCheck;
	}
	return false;
}

/**
 * Checks whether the given settings object is valid
 * 
 * @param settings The settings object to check
 */
function checkSettings(settings) {
	var changes = false;
	if (settings.init) {
		if (!settings.crm) {
			changes = true;
			settings.crm = [
				{
					name: 'example',
					type: 'link',
					value: [
						{
							value: 'http://www.example.com',
							newTab: true
						}
					],
					onContentTypes: [true, false, false, false, false, false]
				}
			];
		} else {
			var result = checkArray(settings.crm);
			if (result !== false) {
				changes = true;
				settings.crm = result;
			}
		}

		if (changes) {
			options.settings = settings;
			options.upload();
		}
	} else {
		setupFirstTime();
	}
}

/**
 * @fn function main()
 *
 * @brief Main function, called when javascript is ready to be executed
 */
function main() {
	checkSettings(options.settings);
	buildContextMenu();
	//bindContextMenu();
	//bindEvents();
	//buildCrmSettings();
}

/**
 * Inserts the value into given array
 *
 * @param toAdd    Value to add.
 * @param target   Array to add into.
 * @param position The position at which to add.
 *
 * @return Complete array
 */
function insertInto(toAdd, target, position) {
	var temp1, i;
	var temp2 = toAdd;
	for (i = position; i < target.length; i++) {
		temp1 = target[i];
		target[i] = temp2;
		temp2 = temp1;
	}
	target[i] = temp2;
	return target;
}

Polymer({
	is: 'crm-options',

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

	properties: {
		settings: {
			type: Object,
			notify: true
		},
		onSettingsReadyCallbacks: {
			type: Array,
			value: []
		},
		requestedPermissions: {
			type: Array,
			value: [],
			notify: true
		},
		otherPermissions: {
			type: Array,
			value: [],
			notify: true
		},
		crmTypes: Array
	},

	switchToIcons: function (indexes) {
		var i;
		var element;
		var crmTypes = document.querySelectorAll('.crmType');
		for (i = 0; i < 6; i++) {
			if (indexes[i]) {
				element = crmTypes[i];
				element.style.boxShadow = 'inset 0 5px 10px rgba(0,0,0,0.4)';
				element.classList.add('toggled');

				if (indexes[i] === 5) {
					$('<div class="crmTypeShadowMagicElementRight"></div>').appendTo(element);
				} else {
					$('<div class="crmTypeShadowMagicElement"></div>').appendTo(element);
				}
			}
		}
		this.crmTypes = indexes;
		this.fire('crmTypeChanged', {});
	},

	iconSwitch: function (e) {
		var index = 0;
		var path = e.path[index];
		while (!path.classList.contains('crmType')) {
			index++;
			path = e.path[index];
		}

		var crmEl;
		var element = path;
		var selectedTypes = options.crmTypes;
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

				selectedTypes[i] = true;
			} else {
				//Drop an element for some magic
				crmEl.style.boxShadow = 'none';
				crmEl.style.backgroundColor = 'white';
				crmEl.classList.remove('toggled');

				$(crmEl).find('.crmTypeShadowMagicElement, .crmTypeShadowMagicElementRight').remove();

				selectedTypes[i] = false;
			}
		}
		chrome.storage.local.set({
			selectedCrmTypes: selectedTypes
		});
		this.crmTypes = selectedTypes;
		this.fire('crmTypeChanged', {});
	},

	toggleToolsRibbon: function() {
		if (window.options.settings.hideToolsRibbon) {
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
		window.options.settings.hideToolsRibbon = !window.options.settings.hideToolsRibbon;
		chrome.storage.sync.set({
			hideToolsRibbon: window.options.settings.hideToolsRibbon
		});
	},

	toggleShrinkTitleRibbon: function() {
		if (window.options.settings.shrinkTitleRibbon) {
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
		window.options.settings.shrinkTitleRibbon = !window.options.settings.shrinkTitleRibbon;
		chrome.storage.sync.set({
			shrinkTitleRibbon: window.options.settings.shrinkTitleRibbon
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

	/**
	 * Uploads this object to chrome.storage
	 */
	upload: function (errorCallback) {
		window.storage.set(this.settings, function() {
			if (chrome.runtime.lastError) {
				errorCallback && errorCallback(chrome.runtime.lastError);
			} else {
				chrome.runtime.sendMessage({
					type: 'updateContextMenu'
				});
			}
		});
		//buildContextMenu();
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
					lineNumbers: window.options.settings.editor.lineNumbers,
					value: code,
					scrollbarStyle: 'simple',
					lineWrapping: true,
					readOnly: 'nocursor',
					theme: (window.options.settings.editor.theme === 'dark' ? 'dark' : 'default'),
					indentUnit: window.options.settings.editor.tabSize,
					indentWithTabs: window.options.settings.editor.useTabs
				});
				var unsavedEditor = window.CodeMirror(window.doc.restoreChangeUnsaveddCodeCont, {
					lineNumbers: window.options.settings.editor.lineNumbers,
					value: code,
					scrollbarStyle: 'simple',
					lineWrapping: true,
					readOnly: 'nocursor',
					theme: (window.options.settings.editor.theme === 'dark' ? 'dark' : 'default'),
					indentUnit: window.options.settings.editor.tabSize,
					indentWithTabs: window.options.settings.editor.useTabs
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
								if (options.editCRM.crm[i].indent.length !== editingObj.crmPath[i - 1]) {
									visible = false;
									break;
								}
							}
							if (!visible) {
								//Make it visible
								var popped = JSON.parse(JSON.stringify(editingObj.crmPath.length));
								popped.pop();
								options.editCRM.build(popped);
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
			'font-size: ' + (1.25 * window.options.settings.editor.zoom) + '%!important;' +
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
		var _this = this;
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
		var i;
		for (i = 0; i < toRequest.length; i++) {
			index = allPermissions.indexOf(toRequest[i]);
			if (index > -1) {
				allPermissions.splice(index, 1);
			}
		}

		chrome.permissions.getAll(function(allowed) {
			var requested = [];
			_this.requestedPermissions = [];
			for (i = 0; i < toRequest.length; i++) {
				requested.push({
					name: toRequest[i],
					description: descriptions[toRequest[i]],
					toggled: false
				});
			}

			var other = [];
			_this.otherPermissions = [];
			for (i = 0; i < allPermissions.length; i++) {
				other.push({
					name: allPermissions[i],
					description: descriptions[allPermissions[i]],
					toggled: (allowed.permissions.indexOf(allPermissions[i]) > -1 ? true : false)
				});
			}

			console.log(requested, other);
			_this.requestedPermissions = requested;
			_this.otherPermissions = other;

			window.doc.requestPermissionsDialog.open();

			function handler() {
				var el;
				var svg;
				window.doc.requestPermissionsDialog.fit();
				window.doc.requestPermissionsDialog.removeEventListener('iron-overlay-opened', handler);
				$('.requestPermissionsShowBot').click(function() {
					el = $(this).parent().parent().children('.requestPermissionsPermissionBotCont')[0];
					console.log(this.style.transform);
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
					//TODO this
					var other = $(this).parent().parent().children('#requestPermissionsOther');
					if (other[0].style.height === 0) {
						other.animate({
							height: other.scrollHeight + 'px'
						}, 350);
					} else {
						other.animate({
							height: 0
						}, 350);
					}
					//if (other.animation) {
					//	other.animation.reverse();
					//} else { 
					//	var newHeight = other.scrollHeight + 'px';
					//	console.log(newHeight);
					//	other.animation = other.animate([
					//		{
					//			height: 0
					//		}, {
					//			heigt: newHeight
					//		}
					//	], {
					//		duration: 350,
					//		easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
					//		fill: 'both'
					//	});
					//}
				});
			}

			window.doc.requestPermissionsDialog.addEventListener('iron-overlay-opened', handler);
		});
	},

	ready: function () {
		var _this = this;
		this.crm.parent = this;
		window.options = this;
		window.doc = window.options.$;
		function callback(items) {
			_this.settings = items;
			for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
				_this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
			}
			if (items.requestPermissions && items.requestPermissions.length > 0) {
				_this.requestPermissions(items.requestPermissions);
			}
			_this.updateEditorZoom();
			main();
		}

		this.bindListeners();
		chrome.storage.local.get(function(items) {
			if (items.editing) {
				setTimeout(function() {
					//Check out if the code is actually different
					var node = _this.crm.lookup(items.editing.crmPath).value;
					var nodeCurrentCode = (node.script ? node.script : node.stylesheet);
					if (nodeCurrentCode !== items.editing.val) {
						_this.restoreUnsavedInstances(items.editing);
					} else {
						chrome.storage.local.set({
							editing: null
						});
					}
				}, 2500);
			}
			if (items.selectedCrmTypes !== undefined) {
				options.crmTypes = items.selectedCrmTypes;
				_this.switchToIcons(items.selectedCrmTypes);
			} else {
				chrome.storage.local.set({
					selectedCrmTypes: [true, false, false, false, false, false]
				});
				options.crmTypes = [true, false, false, false, false, false];
				_this.switchToIcons([true, false, false, false, false, false]);
			}
			if (items.jsLintGlobals) {
				window.options.jsLintGlobals = items.jsLintGlobals;
			} else {
				window.options.jsLintGlobals = [];
				chrome.storage.local.set({
					jsLintGlobals: []
				});
			}
		});
		this.show = false;
		window.storage.get(callback);
	},

	/**
	 * Sets setting with key 'key' to value
	 *
	 * @param key   The key.
	 * @param value The value.
	 */
	set: function(key, value) {
		this.settings[key] = value;
		this.upload();
	},


	/**
	 * CRM functions.
	 */
	crm: {
		_getEvalPath: function (path) {
			return 'window.options.settings.crm[' + (path.join('].children[')) + ']';
		},

		lookup: function (path, returnArray) {
			var pathCopy = JSON.parse(JSON.stringify(path));
			if (returnArray) {
				pathCopy.splice(pathCopy.length - 1, 1);
			}
			var evalPath = this._getEvalPath(pathCopy);
			var result = eval(evalPath);
			return (returnArray ? result.children : result);
		},

		setDataInCrm: function (path) {
			var evalPath = this._getEvalPath(path);
			return function (key, data) {
				eval(evalPath + '[key] = data');
			}
		},

		/**
		 * Adds value to the CRM
		 *
		 * @param value    The value to add
		 * @param position The position to add it in
		 */
		add: function(value, position) {
			if (position === 'first') {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm, 0);
			} else if (position === 'last' || position === undefined) {
				this.parent.settings.crm[this.parent.settings.crm.length] = value;
			} else {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm, position);
			}
			options.upload();
		},

		/**
		 * Moves a value in the CRM from one place to another
		 *
		 * @param toMove    The value to move's location (in path form)
		 * @param target	Where to move the item to (in path form)
		 * @param sameColumn Whether the item has stayed in the same column
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
			options.upload();
		},

		remove: function(index) {
			this.lookup(index, true).splice(index[index.length - 1], 1);
			options.upload();
		}
	}
});