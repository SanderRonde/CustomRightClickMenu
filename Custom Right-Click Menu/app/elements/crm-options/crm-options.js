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

function runOrAddAsCallback(toRun, thisElement) {
	if (window.options.settings) {
		toRun.apply(thisElement);
	}
	else {
		window.options.addSettingsReadyCallback(toRun, thisElement);
	}
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
	item.callback = scriptHandler(toAdd.value.value);
	items[iterator] = item;
	return items;
}

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
	options.settings.crm = [
		{
			name: 'example',
			type: 'link',
			value: [
				{
					value: 'http://www.example.com',
					newTab: true
				}
			]
		}
	];
	options.upload();
}

/**
 * 
 * @param {} toCheck 
 * @returns {} 
 */
function checkArray(toCheck) {
	var changes = false;
	var result;
	toCheck.map(function(item, index) {
		if (isNotSet(item)) {
			changes = true;
			item = {};
			item.name = 'name';
			item.type = 'link';
			item.value = [
				{
					value: 'http://www.example.com',
					newTab: true
				}
			];
		}
		if (isNotSet(item.name)) {
			changes = true;
			item.name = 'name';
		}
		if (!(item.type === 'link' || item.type === 'script' || item.type === 'divider' || item.type === 'menu')) {
			changes = true;
			item.type = 'link';
		}
		if (isNotSet(item.value)) {
			changes = true;
			item.value = [
				{
					value: 'http://www.example.com',
					newTab: true
				}
			];
		} else {
			if (item.type === 'link') {
				if (typeof item.value !== 'object') {
					item.value = [
						{
							value: 'http://www.example.com',
							newTab: true
						}
					];
				} else {
					for (var i = 0; i < item.value.length; i++) {
						if (isNotSet(item.value[i])) {
							changes = true;
							item.value[i] = {
								value: 'http://www.example.com',
								newTab: true
							};
						}
						if (isNotSet(item.value[i].value)) {
							changes = true;
							item.value[i].value = 'http:/www.example.com';
						}
						if (isNotSet(item.value[i].newTab)) {
							changes = true;
							item.value[i].newTab = true;
						}
					}
				}
			}
			//TODO check other data types
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
					]
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
			//options.upload();
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
		}
	},

	launchSearchWebsiteTool: function () {
		this.$.paperSearchWebsiteDialog.init();
		this.$.paperSearchWebsiteDialog.show();
	},
	
	launchExternalEditorDialog: function () {
		if (!window.doc.externalEditorDialogTrigger.disabled) {
			window.externalEditor.init();
			window.externalEditor.editingCRMItem = window.scriptEdit.item;
			window.externalEditor.setupExternalEditing();
		}
	},

	addSettingsReadyCallback: function(callback, thisElement) {
		this.onSettingsReadyCallbacks.push({
			callback: callback,
			thisElement: thisElement
		});
	},

	/**
	 * Uploads this object to chrome.storage
	 */
	upload: function(errorCallback) {
		console.log(this.settings);
		window.storage.set(this.settings, function() {
			if (chrome.runtime.lastError) {
				errorCallback(chrome.runtime.lastError);
			}
		});
		buildContextMenu();
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
				$('.keepChangesButton').on('click', function() {
					crmItem.value.value = editingObj.val;
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
					value: crmItem.value.value,
					scrollbarStyle: 'simple',
					lineWrapping: true,
					readOnly: 'nocursor',
					theme: (window.options.settings.editor.theme === 'dark' ? 'dark' : 'default'),
					indentUnit: window.options.settings.editor.tabSize,
					indentWithTabs: window.options.settings.editor.useTabs
				});
				var unsavedEditor = window.CodeMirror(window.doc.restoreChangeUnsaveddCodeCont, {
					lineNumbers: window.options.settings.editor.lineNumbers,
					value: crmItem.value.value,
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
					setTimeout(function() {
						if (editingObj.crmPath.length === 1) {
							//Always visible
							highlightItem();
						} else {
							//HIERZO
							//Test this as well
							var visible = true;
							for (var i = 1; i < editingObj.crmPath.length; i++) {
								if (options.editCRM.crm[i].indent.length !== editingObj.crmPath[i - 1]) {
									visible = false;
									break;
								}
							}
							if (!visible) {
								//Make it visible
								var popped = JSON.parse(JSON.stringify(editingObj.crmPath));
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
				console.log(e);
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

	ready: function () {
		var _this = this;
		this.crm.parent = this;
		window.options = this;
		window.doc = window.options.$;
		function callback(items) {
			//TODO remove this
			//To help intellisense determine what's inside window.options.settings.editor
			_this.settings = items || {
				editor: {
					"libraries": [
						{
							"location": 'jQuery.js',
							"name": 'jQuery'
						}, {
							"location": 'mooTools.js',
							"name": 'mooTools'
						}, {
							"location": 'YUI.js',
							"name": 'YUI'
						}, {
							"location": 'Angular.js',
							"name": 'Angular'
						}
					],
					"lineNumbers": true,
					"showToolsRibbon": true,
					"tabSize": 4,
					"theme": 'dark',
					"useTabs": true
				}
			};
			for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
				_this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement);
			}
			main();
		}

		this.bindListeners();
		chrome.storage.local.get(function(items) {
			if (items.editing) {
				console.log(items.editing);
				setTimeout(function() {
					_this.restoreUnsavedInstances(items.editing);
				}, 2500);
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
		lookup: function(path, returnArray) {
			var obj = options.settings.crm;
			var i;
			for (i = 0; i < path.length - 1; i++) {
				if (options.settings.shadowStart && obj[path[i]].menuVal) {
					obj = obj[path[i]].menuVal;
				} else {
					obj = obj[path[i]].children;
				}
			}
			return (returnArray ? obj : obj[path[i]]);
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