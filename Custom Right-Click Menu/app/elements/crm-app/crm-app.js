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
	  * @default null
	  */
	item: null,

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

	/**
	 * The value of the storage.local
	 * 
	 * @attribute storageLocal
	 * @type Object
	 * @value {}
	 */
	storageLocal: {},

	/**
	 * A copy of the storage.local to compare when calling upload
	 * 
	 * @attribute storageLocalCopy
	 * @type Object
	 * @value {}
	 */
	storageLocalCopy: {},

	/**
	 * A copy of the settings to compare when calling upload
	 * 
	 * @attribute storageLocalCopy
	 * @attribute Object
	 * @value {}
	 */
	settingsCopy: {},

	/*
	 * The nodes in an object where the key is the ID and the 
	 * value is teh node
	 * 
	 * @attribute nodesById
	 * @type Object
	 * @value {}
	 */
	nodesById: {},

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

	compareObj: function(firstObj, secondObj) {
		for (var key in firstObj) {
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
					} else if (!this.compareObj(firstObj[key], secondObj[key])) {
						return false;
					}
				} else if (firstObj[key] !== secondObj[key]) {
					return false;
				}
			}
		}
		return true;
	},

	compareArray: function(firstArray, secondArray) {
		if (!firstArray === !secondArray) {
			return true;
		}
		else if (!firstArray || !secondArray) {
			return false;
		}
		var firstLength = firstArray.length;
		if (firstLength !== secondArray.length) {
			return false;
		}
		var i;
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
				} else if (!this.compareArray(firstArray[i], secondArray[i])) {
					return false;
				}
			} else if (firstArray[i] !== secondArray[i]) {
				return false;
			}
		}
		return true;
	},

	treeForEach: function(node, fn) {
		fn(node);
		if (node.children) {
			for (var i = 0; i < node.children.length; i++) {
				this.treeForEach(node.children[i], fn);
			}
		}
	},

	findScriptsInSubtree: function(subtree, container) {
		if (subtree.type === 'script') {
			container.push(subtree);
		}
		else if (subtree.children) {
			for (var i = 0; i < subtree.children.length; i++) {
				this.findScriptsInSubtree(subtree.children[i], container);
			}
		}
	},

	runDialogsForImportedScripts: function (nodesToAdd, dialogs) {
		var _this = this;
		if (dialogs[0]) {
			var script = dialogs.splice(0, 1);
			window.scriptEdit.openPermissionsDialog(script, function () {
				_this.runDialogsForImportedScripts(nodesToAdd, dialogs);
			});
		} else {
			this.addImportedNodes(nodesToAdd);
		}
	},

	addImportedNodes: function(nodesToAdd) {
		var _this = this;
		if (!nodesToAdd[0]) {
			return false;
		}
		var toAdd = nodesToAdd.splice(0, 1);
		this.treeForEach(toAdd, function(node) {
			node.id = _this.generateItemId();
			node.source = 'import';
		});

		this.crm.add(toAdd);
		var scripts = [];
		this.findScriptsInSubtree(data.crm[i]);
		this.runDialogsForImportedScripts(nodesToAdd, scripts);
		return true;
	},

	importData: function () {
		var data = this.$.importSettingsInput.value;
		try {
			data = JSON.parse(data);
			this.$.importSettingsError.display = 'none';
		} catch (e) {
			this.$.importSettingsError.display = 'block';
			return;
		}

		if (this.$.overWriteImport.checked && (data.local || data.storageLocal)) {
			this.settings = data.nonLocal || this.settings;
			this.storageLocal = data.local || this.storageLocal;
		}
		if (data.crm) {
			if (this.$.overWriteImport.checked) {
				this.settings.crm = data.crm;
			} else {
				this.addImportedNodes(data.crm);
			}
		}
	},

	exportData: function () {
		var _this = this;
		var toExport = {};
		if (this.$.exportCRM.checked) {
			toExport.crm = JSON.parse(JSON.stringify(_this.settings.crm));
			for (var i = 0; i < toExport.crm.length; i++) {
				toExport.crm[i] = this.editCRM.makeNodeSafe(toExport.crm[i]);
			}
		}
		if (this.$.exportSettings.checked) {
			toExport.local = _this.storageLocal;
			toExport.nonLocal = JSON.parse(JSON.stringify(_this.settings));
			delete toExport.nonLocal.crm;
		}
		this.$.exportSettingsOutput.value = JSON.stringify(toExport);
	},

	showManagePermissions: function() {
		this.requestPermissions([]);
	},

	reverseString: function(string) {
		return string.split('').reverse().join('');
	},

	placeCommas: function(number) {
		var split = this.reverseString(number.toString()).match(/[0-9]{1,3}/g);
		return this.reverseString(split.join(','));
	},

	getSettingsJsonLengthColor: function() {
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

	switchToIcons: function(index) {
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

	iconSwitch: function(e) {
		var index = 0;
		var path = e.path[index];
		while (!path.classList.contains('crmType')) {
			index++;
			path = e.path[index];
		}

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
	generateItemId: function() {
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

	launchSearchWebsiteTool: function() {
		this.$.paperSearchWebsiteDialog.init();
		this.$.paperSearchWebsiteDialog.show();
	},

	launchExternalEditorDialog: function() {
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

	cutData: function(data) {
		var obj = {};
		var arrLength;
		var sectionKey;
		var indexes = [];
		var splitJson = data.match(/[\s\S]{1,5000}/g);
		splitJson.forEach(function(section) {
			arrLength = indexes.length;
			sectionKey = 'section' + arrLength;
			obj[sectionKey] = section;
			indexes[arrLength] = sectionKey;
		});
		obj.indexes = indexes;
		return obj;
	},

	//areValuesDifferent: function (changesObject, keyString, val1, val2, changes, localChanges) {
	//	//Array or object
	//	var obj1ValIsArray = Array.isArray(val1);
	//	var obj2ValIsArray = Array.isArray(val2);
	//	var obj1ValIsObjOrArray = typeof val1 === 'object';
	//	var obj2ValIsObjOrArray = typeof val2 !== 'object';

	//	if (obj1ValIsObjOrArray) {
	//		//Array or object
	//		if (!obj2ValIsObjOrArray) {
	//			localChanges.push(changesObject);
	//		} else {
	//			//Both objects or arrays

	//			//1 is an array
	//			if (obj1ValIsArray) {
	//				//2 is not an array
	//				if (!obj2ValIsArray) {
	//					localChanges.push(changesObject);
	//				} else {
	//					//Both are arrays, compare them
	//					if (this.getArrDifferences(keyString, val1, val2, changes)) {
	//						//Changes have been found, also say the container arrays have changed
	//						localChanges.push(changesObject);
	//					}
	//				}
	//			} else {
	//				//1 is not an array, check if 2 is
	//				if (obj2ValIsArray) {
	//					//2 is an array, changes
	//					localChanges.push(changesObject);
	//				} else {
	//					//2 is also not an array, they are both objects
	//					if (this.getObjDifferences(keyString, val1, val2, changes)) {
	//						//Changes have been found, also say the container arrays have changed
	//						localChanges.push(changesObject);
	//					}
	//				}
	//			}
	//		}
	//	} else if (val1 !== val2) {
	//		//They are both normal string/number/bool values, do a normal comparison
	//		localChanges.push(changesObject);
	//	}
	//},

	areValuesDifferent: function(val1, val2) {
		//Array or object
		var obj1ValIsArray = Array.isArray(val1);
		var obj2ValIsArray = Array.isArray(val2);
		var obj1ValIsObjOrArray = typeof val1 === 'object';
		var obj2ValIsObjOrArray = typeof val2 !== 'object';

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
						if (this.compareArray(val1, val2)) {
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
						if (this.compareObj(val1, val2)) {
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
	},

	getArrDifferences: function (arr1, arr2, changes) {
		for (var index = 0; index < arr1.length; index++) {
			if (this.areValuesDifferent(arr1[key], arr2[key])) {
				changes.push({
					oldValue: arr2[index],
					newValue: arr1[index],
					key: key
				});
			}
		}

		return changes.length > 0;
	},

	getObjDifferences: function (obj1, obj2, changes) {
		for (var key in obj1) {
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
	},

	/**
	 * Uploads this object to chrome.storage.sync
	 */
	upload: function () {
		//Send changes to background-page, background-page uploads everything
		//Compare storageLocal objects
		var localChanges = [];
		var storageLocal = this.storageLocal;
		var storageLocalCopy = this.storageLocalCopy;

		var settingsChanges = [];
		var settings = this.settings;
		var settingsCopy = this.settingsCopy;
		var hasLocalChanged = this.getObjDifferences(storageLocal, storageLocalCopy, localChanges);
		var haveSettingsChanged = this.getObjDifferences(settings, settingsCopy, settingsChanges);
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

		var _this = this;
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
						type: 'updateContextMenu',
						crmTree: _this.settings.crm
					});
				}
			});
			chrome.storage.sync.set({
				indexes: null
			});
		} else {
			//Using chrome.storage.sync
			if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
				window.doc.storageExceededToast.show();
				chrome.storage.local.set({
					useStorageSync: false
				}, function() {
					_this.upload();
				});
			} else {
				//Cut up all data into smaller JSON
				var obj = this.cutData(settingsJson);
				chrome.storage.sync.set(obj, function() {
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
							type: 'updateContextMenu',
							crmTree: _this.settings.crm
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
		window.doc.addLibraryUrlOption.addEventListener('change', function() {
			manualInput.style.display = 'none';
			urlInput.style.display = 'block';
		});
		window.doc.addLibraryManualOption.addEventListener('change', function() {
			urlInput.style.display = 'none';
			manualInput.style.display = 'block';
		});
		$('#addLibraryDialog').on('iron-overlay-closed', function() {
			$(this).find('#addLibraryButton, #addLibraryConfirmAddition, #addLibraryDenyConfirmation').off('click');
		});
	},

	restoreUnsavedInstances: function(editingObj, errs) {
		var _this = this;
		errs = errs + 1 || 0;
		if (errs < 5) {
			try {
				var crmItem = this.crm.lookup(editingObj.crmPath);
				var code = (crmItem.type === 'script' ? crmItem.script : crmItem.stylesheet);
				_this.iconSwitch({ path: [$('.crmType.' + editingObj.crmType + 'Type')[0]] });
				$('.keepChangesButton').on('click', function() {
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

				var stopHighlighting = function(element) {
					$(element).find('.item')[0].animate([
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

				var path = _this.nodesById[editingObj.id].path;
				var highlightItem = function() {
					document.body.style.pointerEvents = 'none';
					var crmItem = $($($('#mainCont').children('div')[path.length - 1]).children('.CRMEditColumn')[0]).children('edit-crm-item')[path[path.length - 1]];
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
						if (path.length === 1) {
							//Always visible
							highlightItem();
						} else {
							var visible = true;
							for (var i = 1; i < path.length; i++) {
								if (app.editCRM.crm[i].indent.length !== path[i - 1]) {
									visible = false;
									break;
								}
							}
							if (!visible) {
								//Make it visible
								var popped = JSON.parse(JSON.stringify(path.length));
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
	requestPermissions: function(toRequest) {
		var i;
		var index;
		var _this = this;
		var allPermissions = this.templates.getPermissions();
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
					description: _this.templates.getPermissionDescription([toRequest[i]]),
					toggled: false
				});
			}

			var other = [];
			for (i = 0; i < allPermissions.length; i++) {
				other.push({
					name: allPermissions[i],
					description: _this.templates.getPermissionDescription([allPermissions[i]]),
					toggled: (allowed.permissions.indexOf(allPermissions[i]) > -1)
				});
			}
			var requestPermissionsOther = $('#requestPermissionsOther')[0];

			var overlay;

			function handler() {
				var el, svg;
				overlay.style.maxHeight = 'initial!important';
				overlay.style.top = 'initial!important';
				overlay.removeEventListener('iron-overlay-opened', handler);
				$('.requestPermissionsShowBot').off('click').on('click', function() {
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
				$('#requestPermissionsShowOther').off('click').on('click', function() {
					var showHideSvg = this;
					var otherPermissions = $(this).parent().parent().parent().children('#requestPermissionsOther')[0];
					if (!otherPermissions.style.height || otherPermissions.style.height === '0px') {
						$(otherPermissions).animate({
							height: otherPermissions.scrollHeight + 'px'
						}, 350, function() {
							showHideSvg.children[0].style.display = 'none';
							showHideSvg.children[1].style.display = 'block';
						});
					} else {
						$(otherPermissions).animate({
							height: 0
						}, 350, function() {
							showHideSvg.children[0].style.display = 'block';
							showHideSvg.children[1].style.display = 'none';
						});
					}
				});

				var permission;
				$('.requestPermissionButton').off('click').on('click', function() {
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
								chrome.storage.local.get(function(e) {
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
						}, function(removed) {
							if (!removed) {
								//It didn't get removed
								slider.checked = true;
							}
						});
					}
				});

				$('#requestPermissionsAcceptAll').off('click').on('click', function() {
					console.log(toRequest);
					chrome.permissions.request({
						permissions: toRequest
					}, function(accepted) {
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

			var interval = window.setInterval(function() {
				try {
					if (window.doc.requestPermissionsCenterer.$.content.children[0].open) {
						window.clearInterval(interval);
						overlay = window.doc.requestPermissionsCenterer.$.content.children[0];
						$('#requestedPermissionsTemplate')[0].items = requested;
						$('#requestedPermissionsOtherTemplate')[0].items = other;
						overlay.addEventListener('iron-overlay-opened', handler);
						setTimeout(function() {
							var requestedPermissionsCont = $('#requestedPermissionsCont')[0];
							var requestedPermissionsAcceptAll = $('#requestPermissionsAcceptAll')[0];
							var requestedPermissionsType = $('.requestPermissionsType')[0];
							if (requested.length === 0) {
								requestedPermissionsCont.style.display = 'none';
								requestPermissionsOther.style.height = (31 * other.length) + 'px';
								requestedPermissionsAcceptAll.style.display = 'none';
								requestedPermissionsType.style.display = 'none';
							} else {
								requestedPermissionsCont.style.display = 'block';
								requestPermissionsOther.style.height = 0;
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

	setLocal: function(key, value) {
		var obj = {};
		obj[key] = value;
		var _this = this;
		chrome.storage.local.set(obj);
		chrome.storage.local.get(function(storageLocal) {
			_this.storageLocal = storageLocal;
			if (key === 'editCRMInRM') {
				_this.pageDemo.create();
			}
		});
		this.upload();
	},

	orderNodesById: function(tree) {
		for (var i = 0; i < tree.length; i++) {
			var node = tree[i];
			this.nodesById[node.id] = node;
			node.children && this.orderNodesById(node.children);
		}
	},

	ready: function() {
		var _this = this;
		this.crm.parent = this;
		window.app = this;
		window.doc = window.app.$;

		function callback(items) {
			_this.settings = items;
			_this.settingsCopy = JSON.parse(JSON.stringify(items));
			for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
				_this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
			}
			_this.updateEditorZoom();
			_this.pageDemo.create();
			_this.orderNodesById(items.crm);
		}

		this.bindListeners();
		chrome.storage.local.get(function (storageLocal) {
			delete storageLocal.nodeStorage;
			if (storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0) {
				_this.requestPermissions(storageLocal.requestPermissions);
			}
			if (storageLocal.editing) {
				setTimeout(function() {
					//Check out if the code is actually different
					var node = _this.nodesById[storageLocal.editing.id].value;
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
				_this.jsLintGlobals = ['window','$','jQuery','crmapi'];
				chrome.storage.local.set({
					jsLintGlobals: _this.jsLintGlobals
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
				chrome.storage.sync.get(function(storageSync) {
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
			_this.storageLocal = storageLocal;
			_this.storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
		});
		this.show = false;

		chrome.storage.onChanged.addListener(function (changes, areaName) {
			if (areaName === 'local' && changes.latestId) {
				_this.latestId = changes.latestId.newValue;
			}
		});
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
					if (typeof additions[key] === 'object') {
						this.mergeObjects(mainObject[key], additions[key]);
					} else {
						mainObject[key] = additions[key];
					}
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
				showOnSpecified: false,
				triggers: ['*://*.example.com/*'],
				isLocal: true,
				value: [
					{
						newTab: true,
						url: 'https://www.example.com'
					}
				]
			};

			return this.mergeObjects(defaultNode, options);
		},

		/**
		 * Gets the default script node object with given options applied
		 * 
		 * @param {Object} options - Any pre-set properties
		 * @returns {Object} A script node with specified properties set
		 */
		getDefaultScriptNode: function(options) {
			var defaultNode = {
				name: 'name',
				onContentTypes: [true, true, false, false, false, false],
				type: 'script',
				isLocal: true,
				value: {
					launchMode: 0,
					libraries: [],
					script: '',
					triggers: ['*://*.example.com/*']
				}
			}

			return this.mergeObjects(defaultNode, options);
		},

		/**
		 * Gets all permissions that can be requested by this extension
		 * 
		 * @returns {Array} An array of all permissions that can be requested by this extension
		 */
		getPermissions: function() {
			return [
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
		},

		/**
		 * Gets all permissions that can be requested by this extension including those specific to scripts
		 * 
		 * @returns {Array} An array of all permissions that can be requested by this extension including those specific to scripts
		 */
		getScriptPermissions: function() {
			return [
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
				'webRequestBlocking',

				//Script-specific permissions
				'crmGet',
				'crmWrite',
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
		},

		/**
		 * Gets the description for given permission
		 * 
		 * @param {string} permission - The permission whose description to get
		 * @returns {string} The description of given permission
		 */
		getPermissionDescription: function(permission) {
			var descriptions = {
				alarms: 'Makes it possible to create, view and remove alarms.',
				background: 'Runs the extension in the background even while chrome is closed. (https://developer.chrome.com/extensions/alarms)',
				bookmarks: 'Makes it possible to create, edit, remove and view all your bookmarks.',
				browsingData: 'Makes it possible to remove any saved data on your browser at specified time allowing the user to delete any history, saved passwords, cookies, cache and basically anything that is not saved in incognito mode but is in regular mode. This is editable so it is possible to delete ONLY your history and not the rest for example. (https://developer.chrome.com/extensions/bookmarks)',
				clipboardRead: 'Allows reading of the users\' clipboard',
				clipboardWrite: 'Allows writing data to the users\' clipboard',
				cookies: 'Allows for the setting, getting and listenting for changes of cookies on any website. (https://developer.chrome.com/extensions/cookies)',
				contentSettings: 'Allows changing or reading your browser settings to allow or deny things like javascript, plugins, popups, notifications or other things you can choose to accept or deny on a per-site basis. (https://developer.chrome.com/extensions/contentSettings)',
				declarativeContent: 'Allows for the running of scripts on pages based on their url and CSS contents. (https://developer.chrome.com/extensions/declarativeContent)',
				desktopCapture: 'Makes it possible to capture your screen, current tab or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
				downloads: 'Allows for the creating, pausing, removing, searching and removing of downloads and listening for any downloads happenng. (https://developer.chrome.com/extensions/downloads)',
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
				tts: 'Allows a script to use chrome\'s text so speach engine. (https://developer.chrome.com/extensions/tts)',
				webNavigation: 'Allows a script info about newly created pages and allows it to get info about what website visit at that time.' +
					' (https://developer.chrome.com/extensions/webNavigation)',
				webRequest: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. (https://developer.chrome.com/extensions/webRequest)',
				webRequestBlocking: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. This also allows the script to block certain requests for example for blocking ads or bad sites. (https://developer.chrome.com/extensions/webRequest)',

				//Script-specific descriptions
				crmGet: 'Allows the reading of your Custom Right-Click Menu, including names, contents of all nodes, what they do and some metadata for the nodes',
				crmWrite: 'Allows the writing of data and nodes to your Custom Right-Click Menu. This includes <b>creating</b>, <b>copying</b> and <b>deleting</b> nodes. Be very careful with this permission as it can be used to just copy nodes until your CRM is full and delete any nodes you had. It also allows changing current values in the CRM such as names, actual scripts in script-nodes etc.',
				chrome: 'Allows the use of chrome API\'s. Without this permission only the \'crmGet\' and \'crmWrite\' permissions will work.'
				//TOOD description for GM_APIs
			};

			return descriptions[permission];
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
			 * @param {Object[]} data - The data to open
			 *
			 * @returns {Function} the function to execute on clicking a link
			 */
			link: function(data) {
				return function () {
					for (var i = 0; i < data.length; i++) {
						window.open(data[i].url, '_blank');
					}
				}
			},

			/**
			 * Makes an onclick handler for scripts
			 *
			 * @param {String} data - Script to execute.
			 *
			 * @returns {Function} the function to execute on click a script
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
				 * @param {String} data - Stylesheet to execute.
				 * @param {Boolean} checked - Whether the element is checked
				 *
				 * @returns {Function} the function to execute on click a stylesheet
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
				 * @param {Object} data - Stylesheet to execute.
				 *
				 * @returns {Function} the function to execute on click a stylesheet
				 */
				normal: function(data) {
					return function() {
						var style = document.createElement('style');
						style.appendChild(document.createTextNode(data));
						document.head.appendChild(style);
					}
				}
			},

			/**
			 * Makes an onclick handler to edit the node on clicking it
			 * 
			 * @param {Object} node - The node to edit
			 * 
			 * @returns {Function} A function that launches the edit screen for given node
			 */
			edit: function (node) {
				var _this = this;
				return function () {
					_this.parent.parent.editCRM.getCRMElementFromPath(node.path, true).openEditPage();
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
			 * @param {Object} toAdd - The item to add
			 * 
			 * @returns {Object} The root node of a subtree
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
			 * @param {Object} toAdd - The item to add
			 * 
			 * @returns {Object} The root node of a subtree
			 */
			script: function(toAdd) {
				var item = {};
				item.name = toAdd.name;
				console.log('?');
				item.callback = this.parent.handlers.script(toAdd.value.script);
				return item;
			},

			/**
			 * Adds a stylesheet to the CRM
			 * 
			 * @param {Object} toAdd - The item to add
			 * 
			 * @returns {Object} The root node of a subtree
			 */
			stylesheet: function(toAdd) {
				var item = {};
				item.name = toAdd.name;
				if (toAdd.value.toggle) {
					item.type = 'checkbox';
					item.selected = toAdd.value.defaultOn;
					item.callback = this.parent.handlers.stylesheet.toggle(toAdd.value.stylesheet, toAdd.value.defaultOn);
				} else {
					item.callback = this.parent.handlers.stylesheet.normal(toAdd.value.stylesheet);
				}
				return item;
			},

			/**
			 * An editable node
			 * 
			 * @param {Object} toAdd - The item to add
			 * 
			 * @returns {Object} The root node of a subtree
			 */
			editable: function(toAdd) {
				var item = {};
				item.name = toAdd.name;
				item.callback = this.parent.handlers.edit(toAdd);
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
			 * @param {Object} toAdd - The item to add
			 * @param {Number} crmType - The crmType in use
			 * @param {Object} index - The container of the index, object to preserve it across functions
			 * @param {Number} index.num - The index of the nodes, to be passed along and incremented
			 * 
			 * @returns {Object} The root node of a subtree
			 */
			menu: function(toAdd, crmType, index) {
				var _this = this;
				var item = {};
				item.name = toAdd.name;
				var childItems = {};
				if (_this.parent.parent.storageLocal.editCRMInRM) {
					item.callback = this.parent.handlers.edit(toAdd);
				}
				toAdd.children.forEach(function(node) {
					if (_this.parent.isNodeVisible(node, crmType)) {
						
						if (_this.parent.parent.storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
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
		buildForCrmType: function(crmType) {
			var _this = this;
			var index = {
				num: 0
			};
			var childItems = {};
			var crm = window.app.settings.crm;
			crm.forEach(function(node) {
				if (_this.isNodeVisible(node, crmType)) {
					if (_this.parent.storageLocal.editCRMInRM && node.type !== 'divider' && node.type !== 'menu') {
						childItems[index.num++] = _this.node.editable(node);
					} else {
						switch (node.type) {
							case 'link':
								childItems[index.num] = _this.node.link(node);
								break;
							case 'script':
								childItems[index.num] = _this.node.script(node);
								break;
							case 'stylesheet':
								childItems[index.num] = _this.node.stylesheet(node);
								break;
							case 'divider':
								childItems[index.num] = _this.node.divider();
								break;
							case 'menu':
								childItems[index.num] = _this.node.menu(node, crmType, index);
								break;
						}
					}
				}
			});
			console.log(childItems);
			return childItems;
		},

		getCrmTypeFromNumber: function(crmType) {
			var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
			return types[crmType];
		},

		bindContextMenu: function(crmType) {
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

		removeContextMenus: function() {
			var el;
			this.usedStylesheetIds.forEach(function(id) {
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
		create: function() {
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
			var result = eval(evalPath);
			return (returnArray ? result.children : result);
		},

		_lookupId: function(id, returnArray, node) {
			if (node.id === id) {
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

		lookupId: function(id, returnArray) {
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
		add: function(value, position) {
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