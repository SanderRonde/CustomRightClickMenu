(function() {
	window.runOrAddAsCallback = function(toRun, thisElement, params) {
		if (window.app.settings) {
			toRun.apply(thisElement, params);
		} else {
			window.app.addSettingsReadyCallback(toRun, thisElement, params);
		}
	};

	if (!document.createElement('div').animate) {
		HTMLElement.prototype.animate = function(properties, options) {
			if (!properties[1]) {
				return {
					play: function() {},
					reverse: this.play
				};
			}

			var element = this;
			var direction = 'forwards';
			var returnVal = {
				play: function() {
					$(element).animate(properties[~~(direction === 'forwards')],
						(options && options.duration) || 500, function() {
						if (returnVal.onfinish) {
							returnVal.onfinish.apply({
								effect: {
									target: element
								}
							});
						}
					});
				},
				reverse: function() {
					direction = 'backwards';
					this.play();
				}
			};
			$(this).animate(properties[1], options.duration, function() {
				if (returnVal.onfinish) {
					returnVal.onfinish.apply({
						effect: {
							target: element
						}
					});
				}
			});
			return returnVal;
		};
		HTMLElement.prototype.animate.isJqueryFill = true;
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
		 * value is the node
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
			},
			globalExcludes: {
				type: Array,
				notify: true,
				value: []
			},
			versionUpdateTab: {
				type: Number,
				notify: true,
				value: 0,
				observer: 'versionUpdateChanged'
			}
		},

		compareObj: function(firstObj, secondObj) {
			if (!secondObj) {
				if (!firstObj) {
					return true;
				}
				return false;
			}
			if (!firstObj) {
				return false;
			}

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
						} else if (Array.isArray(secondObj[key])) {
							return false;
						} else {
							if (!this.compareObj(firstObj[key], secondObj[key])) {
								return false;
							}
						}
					} else if (firstObj[key] !== secondObj[key]) {
						return false;
					}
				}
			}
			return true;
		},

		compareArray: function(firstArray, secondArray) {
			if (!firstArray !== !secondArray) {
				return false;
			} else if (!firstArray || !secondArray) {
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
					} else if (Array.isArray(secondArray[i])) {
						return false;
					} else {
						if (!this.compareObj(firstArray[i], secondArray[i])) {
							return false;
						}
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

		isOnlyGlobalExclude: function () {
			return this.globalExcludes.length === 1;
		},

		copyExporedToClipboard: function() {
			var snipRange = document.createRange();
			snipRange.selectNode(this.$.exportJSONData);
			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(snipRange);
			try {
				document.execCommand('copy');
				this.$.exportCopyButton.icon = 'done';
			} catch (err) {
				// Copy command is not available
				console.error(err);
				this.$.exportCopyButton.icon = 'error';
			}
			// Return to the copy button after a second.
			this.async(function() {
				this.$.exportCopyButton.icon = 'content-copy';
			}, 1000);
			selection.removeAllRanges();
		},

		isVersionUpdateTabX: function(currentTab, desiredTab) {
			return currentTab === desiredTab;
		},

		_toggleBugReportingTool: function() {
			window.errorReportingTool.toggleVisibility();
		},

		_openLogging: function() {
			window.open(chrome.runtime.getURL('html/logging.html'), '_blank');
		},

		_generateRegexFile: function() {
			var filePath = this.$.URISchemeFilePath.querySelector('input').value.replace(/\\/g, '\\\\');
			var schemeName = this.$.URISchemeSchemeName.querySelector('input').value;

			var regFile = [
				'Windows Registry Editor Version 5.00',
				'',
				'[HKEY_CLASSES_ROOT\\' + schemeName + ']',
				'@="URL:' + schemeName +' Protocol"',
				'"URL Protocol"=""',
				'',
				'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
				'',
				'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
				'',
				'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
				'@="\\"' + filePath + '\\""'
			].join('\n');
			chrome.permissions.contains({
				permissions: ['downloads']
			}, function(hasPermission) {
				if (hasPermission) {
					chrome.downloads.download({
						url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
						filename: schemeName + '.reg'
					});
				} else {
					chrome.permissions.request({
						permissions: ['downloads']
					}, function(granted) {
						chrome.downloads.download({
							url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
							filename: schemeName + '.reg'
						});
					});
				}
			});
		},

		goNextVersionUpdateTab: function () {
			if (this.versionUpdateTab === 4) {
				this.$.versionUpdateDialog.close();
			} else {
				var nextTabIndex = this.versionUpdateTab + 1;
				var tabs = document.getElementsByClassName('versionUpdateTab');
				var selector = tabs[nextTabIndex];
				selector.style.height = 'auto';

				var i;
				for (i = 0; i < tabs.length; i++) {
					tabs[i].style.display = 'none';
				}
				var newHeight = $(selector).innerHeight();
				for (i = 0; i < tabs.length; i++) {
					tabs[i].style.display = 'block';
				}
				selector.style.height = '0';

				var _this = this;
				var newHeightPx = newHeight + 'px';
				var tabCont = this.$.versionUpdateTabSlider;

				var currentHeight = tabCont.getBoundingClientRect().height;
				if (newHeight > currentHeight) {
					tabCont.animate([
						{
							height: currentHeight + 'px'
						}, {
							height: newHeightPx
						}
					], {
						duration: 500,
						easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
					}).onfinish = function() {
						tabCont.style.height = newHeightPx;
						selector.style.height = 'auto';
						_this.versionUpdateTab = nextTabIndex;
					};
				} else {
					selector.style.height = 'auto';
					_this.versionUpdateTab = nextTabIndex;
					setTimeout(function() {
						tabCont.animate([
							{
								height: currentHeight + 'px'
							}, {
								height: newHeightPx
							}
						], {
							duration: 500,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}).onfinish = function() {
							tabCont.style.height = newHeightPx;
						};
					}, 500);
				}
			}
		},

		goPrevVersionUpdateTab: function () {
			if (this.versionUpdateTab !== 0) {
				var prevTabIndex = this.versionUpdateTab - 1;
				var tabs = document.getElementsByClassName('versionUpdateTab');
				var selector = tabs[prevTabIndex];
				selector.style.height = 'auto';

				var i;
				for (i = 0; i < tabs.length; i++) {
					tabs[i].style.display = 'none';
				}
				var newHeight = $(selector).innerHeight();
				for (i = 0; i < tabs.length; i++) {
					tabs[i].style.display = 'block';
				}
				selector.style.height = '0';

				var _this = this;
				var newHeightPx = newHeight + 'px';
				var tabCont = this.$.versionUpdateTabSlider;

				var currentHeight = tabCont.getBoundingClientRect().height;
				if (newHeight > currentHeight) {
					tabCont.animate([
						{
							height: currentHeight + 'px'
						}, {
							height: newHeightPx
						}
					], {
						duration: 500,
						easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
					}).onfinish = function () {
						tabCont.style.height = newHeightPx;
						selector.style.height = 'auto';
						_this.versionUpdateTab = prevTabIndex;
					};
				} else {
					selector.style.height = 'auto';
					_this.versionUpdateTab = prevTabIndex;
					setTimeout(function () {
						tabCont.animate([
							{
								height: currentHeight + 'px'
							}, {
								height: newHeightPx
							}
						], {
							duration: 500,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}).onfinish = function () {
							tabCont.style.height = newHeightPx;
						};
					}, 500);
				}
			}
		},

		tryEditorLoaded: function(cm) {
			cm.display.wrapper.classList.add('try-editor-codemirror');
			cm.refresh();
		},

		versionUpdateChanged: function() {
			if (this.isVersionUpdateTabX(this.versionUpdateTab, 1)) {
				if (!this.$.versionUpdateDialog.editor) {
					this.$.versionUpdateDialog.editor = new window.CodeMirror(this.$.tryOutEditor, {
						lineNumbers: true,
						value: '//some javascript code\nvar body = document.getElementById(\'body\');\nbody.style.color = \'red\';\n\n',
						scrollbarStyle: 'simple',
						lineWrapping: true,
						mode: 'javascript',
						readOnly: false,
						foldGutter: true,
						theme: 'dark',
						indentUnit: window.app.settings.editor.tabSize,
						indentWithTabs: window.app.settings.editor.useTabs,
						gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
						lint: window.CodeMirror.lint.javascript,
						messageTryEditor: true,
						undoDepth: 500
					});
				}
			}
		},

		findScriptsInSubtree: function(subtree, container) {
			if (subtree.type === 'script') {
				container.push(subtree);
			} else if (subtree.children) {
				for (var i = 0; i < subtree.children.length; i++) {
					this.findScriptsInSubtree(subtree.children[i], container);
				}
			}
		},

		runDialogsForImportedScripts: function(nodesToAdd, dialogs) {
			var _this = this;
			if (dialogs[0]) {
				var script = dialogs.splice(0, 1);
				window.scriptEdit.openPermissionsDialog(script, function() {
					_this.runDialogsForImportedScripts(nodesToAdd, dialogs);
				});
			} else {
				this.addImportedNodes(nodesToAdd);
			}
		},

		removeGlobalExclude: function(e) {
			var index = 0;
			var node = e.path[0];
			while (node.tagName.toLowerCase() !== 'paper-icon-button') {
				node = e.path[++index];
			}

			var excludeIndex = null;
			var allExcludes = document.getElementsByClassName('globalExcludeContainer');
			for (var i = 0; i < allExcludes.length; i++) {
				if (allExcludes[i] === node.parentNode) {
					excludeIndex = i;
					break;
				}
			}
			if (excludeIndex === null) {
				return;
			}

			this.splice('globalExcludes', excludeIndex, 1);
		},

		addGlobalExcludeField: function() {
			this.push('globalExcludes', '');
		},

		globalExcludeChange: function(e) {
			var index = 0;
			var node = e.path[0];
			while (node.tagName.toLowerCase() !== 'paper-input') {
				node = e.path[++index];
			}
			var excludeIndex = null;
			var allExcludes = document.getElementsByClassName('globalExcludeContainer');
			for (var i = 0; i < allExcludes.length; i++) {
				if (allExcludes[i] === node.parentNode) {
					excludeIndex = i;
					break;
				}
			}
			if (excludeIndex === null) {
				return;
			}

			var value = node.value;
			this.globalExcludes[excludeIndex] = value;
			this.set('globalExcludes', this.globalExcludes);
			chrome.storage.local.set({
				globalExcludes: this.globalExcludes
			});
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

		importData: function() {
			var data = this.$.importSettingsInput.value;
			if (!this.$.oldCRMImport.checked) {
				try {
					data = JSON.parse(data);
					this.$.importSettingsError.style.display = 'none';
				} catch (e) {
					console.log(e);
					this.$.importSettingsError.style.display = 'block';
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
			} else {
				try {
					var settingsArr = data.split('%146%');
					if (settingsArr[0] === 'all') {
						this.storageLocal.showOptions = settingsArr[2];

						var rows = settingsArr.slice(6);
						var localStorageWrapper = function() {
							this.getItem = function(index) {
								if (index === 'numberofrows') {
									return rows.length - 1;
								}
								return rows[index];
							};
						};

						var crm = this.transferCRMFromOld(settingsArr[4], new localStorageWrapper());
						this.settings.crm = crm;
						window.app.editCRM.build(null, null, true);
					} else {
						alert('This method of importing no longer works, please export all your settings instead');
					}
				} catch(e) {
					console.log(e);
					this.$.importSettingsError.style.display = 'block';
					return;
				} 
			}
		},

		exportData: function() {
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

		showManagePermissions: function () {
			this.requestPermissions([], true);
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
			this.fire('crmTypeChanged', {});
		},

		iconSwitch: function (e, type) {
			var i;
			var crmEl;
			var selectedType = this.crmType;
			if (!type.x) {
				for (i = 0; i < 6; i++) {
					crmEl = document.querySelectorAll('.crmType').item(i);
					if (i === type) {
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
			} else {
				var index = 0;
				var path = e.path[index];
				while (!path.classList.contains('crmType')) {
					index++;
					path = e.path[index];
				}
				var element = path;
				var crmTypes = document.querySelectorAll('.crmType');
				for (i = 0; i < 6; i++) {
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
			}
			chrome.storage.local.set({
				selectedCrmType: selectedType
			});
			if (this.crmType !== selectedType) {
				this.crmType = selectedType;
				this.fire('crmTypeChanged', {});
			}
		},

		/**
		 * Generates an ID for a node
		 *
		 * @returns {Number} A unique ID
		 */
		generateItemId: function() {
			var _this = this;
			this.latestId = this.latestId || 0;
			this.latestId++;
			chrome.storage.local.set({
				latestId: _this.latestId
			});
			return this.latestId;
		},

		toggleToolsRibbon: function() {
			if (window.app.storageLocal.hideToolsRibbon) {
				$(window.doc.editorToolsRibbonContainer).animate({
					marginLeft: 0
				}, 250);
				window.doc.showHideToolsRibbonButton.style.transform = 'rotate(180deg)';
			} else {
				$(window.doc.editorToolsRibbonContainer).animate({
					marginLeft: '-200px'
				}, 250);
				window.doc.showHideToolsRibbonButton.style.transform = 'rotate(0deg)';
			}
			window.app.storageLocal.hideToolsRibbon = !window.app.storageLocal.hideToolsRibbon;
			window.app.upload();
		},

		toggleShrinkTitleRibbon: function () {
			var viewportHeight = window.innerHeight;
			var $settingsCont = $('#settingsContainer');
			if (window.app.storageLocal.shrinkTitleRibbon) {
				$(window.doc.editorTitleRibbon).animate({
					fontSize: '100%'
				}, 250);
				$(window.doc.editorCurrentScriptTitle).animate({
					paddingTop: '4px',
					paddingBottom: '4px'
				}, 250);
				$settingsCont.animate({
					height: viewportHeight - 50
				}, 250, function() {
					$settingsCont[0].style.height = 'calc(100vh - 66px)';
				});
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(270deg)';
			} else {
				$(window.doc.editorTitleRibbon).animate({
					fontSize: '40%'
				}, 250);
				$(window.doc.editorCurrentScriptTitle).animate({
					paddingTop: 0,
					paddingBottom: 0
				}, 250);
				$settingsCont.animate({
					height: viewportHeight - 18
				}, 250, function() {
					$settingsCont[0].style.height = 'calc(100vh - 29px)';
				});
				window.doc.shrinkTitleRibbonButton.style.transform = 'rotate(90deg)';
			}
			window.app.storageLocal.shrinkTitleRibbon = !window.app.storageLocal.shrinkTitleRibbon;
			chrome.storage.local.set({
				shrinkTitleRibbon: window.app.storageLocal.shrinkTitleRibbon
			});
		},

		launchSearchWebsiteTool: function () {
			if (this.item && this.item.type === 'script' && window.scriptEdit) {
				this.$.paperSearchWebsiteDialog.init();
				this.$.paperSearchWebsiteDialog.show();
			}
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

		areValuesDifferent: function(val1, val2) {
			//Array or object
			var obj1ValIsArray = Array.isArray(val1);
			var obj2ValIsArray = Array.isArray(val2);
			var obj1ValIsObjOrArray = typeof val1 === 'object';
			var obj2ValIsObjOrArray = typeof val2 === 'object';

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
							if (!this.compareArray(val1, val2)) {
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
							if (!this.compareObj(val1, val2)) {
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

		getArrDifferences: function(arr1, arr2, changes) {
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

		getObjDifferences: function(obj1, obj2, changes) {
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
		 * Uploads the settings to chrome.storage
		 */
		upload: function() {
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
				if (!window.CodeMirror) {
					setTimeout(function() {
						_this.restoreUnsavedInstances(editingObj, errs);
					}, 500);
				}
				else {
				var crmItem = _this.nodesById[editingObj.id];
				var code = (crmItem.type === 'script' ? (editingObj.mode === 'main' ?
							crmItem.value.script : crmItem.value.backgroundScript) :
							crmItem.value.stylesheet);
					_this.iconSwitch(null, editingObj.crmType);
					$('.keepChangesButton').on('click', function() {
						if (crmItem.type === 'script') {
							crmItem.value[(editingObj.mode === 'main' ?
								'script' :
								'backgroundScript')] = editingObj.val;
						} else {
							crmItem.value.stylesheet = editingObj.val;
						}
						window.app.upload();
						chrome.storage.local.set({
							editing: null
						});
						window.setTimeout(function() {
							//Remove the CodeMirror instances for performance
							window.doc.restoreChangesOldCodeCont.innerHTML = '';
							window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
						}, 500);
					});
					$('.restoreChangesBack').on('click', function() {
						window.doc.restoreChangesOldCode.style.display = 'none';
						window.doc.restoreChangesUnsavedCode.style.display = 'none';
						window.doc.restoreChangesMain.style.display = 'block';
						window.doc.restoreChangesDialog.fit();
					});
					$('.discardButton').on('click', function() {
						chrome.storage.local.set({
							editing: null
						});
						window.setTimeout(function () {
							//Remove the CodeMirror instances for performance
							window.doc.restoreChangesOldCodeCont.innerHTML = '';
							window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
						}, 500);
					});
					window.doc.restoreChangeUnsaveddCodeCont.innerHTML = '';
					window.doc.restoreChangesOldCodeCont.innerHTML = '';
					var oldEditor = window.CodeMirror(window.doc.restoreChangesOldCodeCont, {
						lineNumbers: true,
						value: code,
						scrollbarStyle: 'simple',
						lineWrapping: true,
						readOnly: 'nocursor',
						theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
						indentUnit: window.app.settings.editor.tabSize,
						indentWithTabs: window.app.settings.editor.useTabs
					});
					var unsavedEditor = window.CodeMirror(window.doc.restoreChangeUnsaveddCodeCont, {
						lineNumbers: true,
						value: editingObj.val,
						scrollbarStyle: 'simple',
						lineWrapping: true,
						readOnly: 'nocursor',
						theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
						indentUnit: window.app.settings.editor.tabSize,
						indentWithTabs: window.app.settings.editor.useTabs
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
							$('.crmType').each(function () {
								this.classList.remove('dim');
							});
							$('edit-crm-item').find('.item').animate({
								opacity: 1
							}, 200, function() {
								document.body.style.pointerEvents = 'all';
							});
						};
					};

					var path = _this.nodesById[editingObj.id].path;
					var highlightItem = function() {
						document.body.style.pointerEvents = 'none';
						var columnConts = $('#mainCont').children('div');
						var $columnCont = $(columnConts[(path.length - 1) + 2]);
						var $paperMaterial = $($columnCont.children('paper-material')[0]);
						var $crmEditColumn = $paperMaterial.children('.CRMEditColumn')[0];
						var editCRMItems = $($crmEditColumn).children('edit-crm-item');
						var crmElement = editCRMItems[path[path.length - 1]];
						//Just in case the item doesn't exist (anymore)
						if ($(crmElement).find('.item')[0]) {
							$(crmElement).find('.item')[0].animate([
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
								stopHighlighting(crmElement);
							}, 2000);
						} else {
							window.doc.restoreChangesDialog.open();
							$('.pageCont').animate({
								backgroundColor: 'white'
							}, 200);
							$('.crmType').each(function () {
								this.classList.remove('dim');
							});
							$('edit-crm-item').find('.item').animate({
								opacity: 1
							}, 200, function() {
								document.body.style.pointerEvents = 'all';
							});
						}
					};

					window.doc.highlightChangedScript.addEventListener('click', function() {
						//Find the element first
						//Check if the element is already visible
						window.doc.restoreChangesDialog.close();
						$('.pageCont')[0].style.backgroundColor = 'rgba(0,0,0,0.4)';
						$('edit-crm-item').find('.item').css('opacity', 0.6);
						$('.crmType').each(function () {
							this.classList.add('dim');
						});

						setTimeout(function () {
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
						}, 500);
					});
					try {
						window.doc.restoreChangesDialog.open();
					} catch (e) {
						_this.restoreUnsavedInstances(editingObj, errs + 1);
					}
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
			var editor = ((window.scriptEdit && window.scriptEdit.active) ? 
				window.scriptEdit.editor :
				((window.stylesheetEdit && window.stylesheetEdit.active) ? 
					window.stylesheetEdit.editor :
					null));
			if (!editor) {
				return;
			}
			window.colorFunction && window.colorFunction.func({
				from: {
					line: 0
				},
				to: {
					line: editor.lineCount()
				}
			}, editor);
		},

		/**
		 * Shows the user a dialog and asks them to allow/deny those permissions
		 *
		 * @param {string[]} toRequest - An arry of strings of permissions to request
		 * @param {boolean} force - Force the dialog, show it even if there is nothing to request
		 */
		requestPermissions: function(toRequest, force) {
			var i;
			var index;
			var _this = this;
			var allPermissions = this.templates.getPermissions();
			for (i = 0; i < toRequest.length; i++) {
				index = allPermissions.indexOf(toRequest[i]);
				if (index === -1) {
					toRequest.splice(index, 1);
					i--;
				} else {
					allPermissions.splice(index, 1);
				}
			}

			chrome.storage.local.set({
				requestPermissions: toRequest
			});

			if (toRequest.length > 0 || force) {
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
								try {
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
								} catch (e) {
									//Accepted, remove from to-request permissions
									chrome.storage.local.get(function(e) {
										var permissionsToRequest = e.requestPermissions;
										requestPermissions.splice(requestPermissions.indexOf(permission), 1);
										chrome.storage.local.set({
											requestPermissions: permissionsToRequest
										});
									});
								}
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
							chrome.permissions.request({
								permissions: toRequest
							}, function(accepted) {
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
			}
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
			chrome.storage.local.get(function (storageLocal) {
				_this.storageLocal = storageLocal;
				if (key === 'CRMOnPage') {
					window.doc.editCRMInRM.setCheckboxDisabledValue &&
					window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal.CRMOnPage);
				}
				_this.upload();
			});
		},

		orderNodesById: function(tree) {
			for (var i = 0; i < tree.length; i++) {
				var node = tree[i];
				this.nodesById[node.id] = node;
				node.children && this.orderNodesById(node.children);
			}
		},

		//#region First-Time Data
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

		uploadStorageSyncData: function(data, _this) {
			var settingsJson = JSON.stringify(data);

			//Using chrome.storage.sync
			if (settingsJson.length >= 101400) { //Keep a margin of 1K for the index
				chrome.storage.local.set({
					useStorageSync: false
				}, function() {
					_this.uploadStorageSyncData(data, _this);
				});
			} else {
				//Cut up all data into smaller JSON
				var obj = _this.cutData(settingsJson);
				chrome.storage.sync.set(obj, function() {
					if (chrome.runtime.lastError) {
						//Switch to local storage
						console.log('Error on uploading to chrome.storage.sync ', chrome.runtime.lastError);
						chrome.storage.local.set({
							useStorageSync: false
						}, function() {
							_this.uploadStorageSyncData(data);
						});
					} else {
						chrome.storage.local.set({
							settings: null
						});
					}
				});
			}
		},

		legacyScriptReplace: {
			/**
			 * Checks if given value is the property passed, disregarding quotes
			 *
			 * @param {string} toCheck - The string to compare it to
			 * @param {string} prop - The value to be compared
			 * @returns {boolean} Returns true if they are equal
			 */
			isProperty: function(toCheck, prop) {
				if (toCheck === prop) {
					return true;
				}
				return toCheck.replace(/['|"|`]/g, '') === prop;
			},

			/**
			 * Gets the lines where an expression begins and ends
			 *
			 * @param {Object[]} lines - All lines of the script
			 * @param {Object[]} lineSeperators - An object for every line signaling the start and end
			 * @param {Number} lineSeperators.start - The index of that line's first character in the
			 *		entire script if all new lines were removed
			 * @param {Number} lineSeperators.end - The index of that line's last character in the
			 *		entire script if all new lines were removed
			 * @param {Number} start - The first character's index of the function call whose line to find
			 * @param {Number} end  - The last character's index of the function call whose line to find
			 * @returns {Object} The line(s) on which the function was called, containing a "from" and
			 *		"to" property that indicate the start and end of the line(s). Each "from" or "to"
			 *		consists of an "index" and a "line" property signaling the char index and the line num
			 */
			getCallLines: function(lines, lineSeperators, start, end) {
				var sep;
				var line = {};
				for (var i = 0; i < lineSeperators.length; i++) {
					sep = lineSeperators[i];
					if (sep.start <= start) {
						line.from = {
							index: sep.start,
							line: i
						};
					}
					if (sep.end >= end) {
						line.to = {
							index: sep.end,
							line: i
						};
						break;
					}
				}

				return line;
			},

			/**
			 * Finds the function call expression around the expression whose data was passed
			 *
			 * @param {Object} data - The data associated with a chrome call
			 * @returns {Object} The expression around the expression whose data was passed
			 */
			getFunctionCallExpressions: function(data) {
				//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
				var index = data.parentExpressions.length - 1;
				var expr = data.parentExpressions[index];
				while (expr && expr.type !== 'CallExpression') {
					expr = data.parentExpressions[--index];
				}
				return data.parentExpressions[index];
			},

			/**
			 * Gets the chrome API in use by given function call expression
			 *
			 * @param {Object} expr - The expression whose function call to find
			 * @param {Object} data - The data about that call
			 * @returns {Object} An object containing the call on the "call"
			 *		property and the arguments on the "args" property
			 */
			getChromeAPI: function(expr, data) {
				data.functionCall = data.functionCall.map(function(prop) {
					return prop.replace(/['|"|`]/g, '');
				});
				var functionCall = data.functionCall;
				functionCall = functionCall.reverse();
				if (functionCall[0] === 'chrome') {
					functionCall.splice(0, 1);
				}

				var argsStart = expr.callee.end;
				var argsEnd = expr.end;
				var args = data.persistent.script.slice(argsStart, argsEnd);

				return {
					call: functionCall.join('.'),
					args: args
				};
			},

			/**
			 * Gets the position of an index relative to the line instead of relative
			 * to the entire script
			 *
			 * @param {Object[]} lines - All lines of the script
			 * @param {Number} line - The line the index is on
			 * @param {Number} index - The index relative to the entire script
			 * @returns {Number} The index of the char relative to given line
			 */
			getLineIndexFromTotalIndex: function(lines, line, index) {
				for (var i = 0; i < line; i++) {
					index -= lines[i].length + 1;
				}
				return index;
			},

			replaceChromeFunction: function(data, expr, callLines) {
				if (data.isReturn && !data.isValidReturn) {
					return;
				}

				var lines = data.persistent.lines;

				//Get chrome API
				var i;
				var chromeAPI = this.getChromeAPI(expr, data);
				var firstLine = data.persistent.lines[callLines.from.line];
				var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, ((data.returnExpr && data.returnExpr.start) || expr.callee.start));
				var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, expr.callee.end);

				var newLine = firstLine.slice(0, lineExprStart) +
					'window.crmAPI.chrome(\'' + chromeAPI.call + '\')';

				var lastChar = null;
				while (newLine[(lastChar = newLine.length - 1)] === ' ') {
					newLine = newLine.slice(0, lastChar);
				}
				if (newLine[(lastChar = newLine.length - 1)] === ';') {
					newLine = newLine.slice(0, lastChar);
				}

				if (chromeAPI.args !== '()') {
					var argsLines = chromeAPI.args.split('\n');
					newLine += argsLines[0];
					for (i = 1; i < argsLines.length; i++) {
						lines[callLines.from.line + i] = argsLines[i]; 
					}
				}
				if (!data.isReturn) {
					lines[callLines.from.line + (i - 1)] = lines[callLines.from.line + (i - 1)] + '.send();';
					if (i === 1) {
						newLine += '.send();';
					}
				} else {
					var lineRest = firstLine.slice(lineExprEnd + chromeAPI.args.split('\n')[0].length);
					while (lineRest.indexOf(';') === 0) {
						lineRest = lineRest.slice(1);
					}
					newLine += '.return(function(' + data.returnName + ') {' + lineRest;
					var usesTabs = true;
					var spacesAmount = 0;
					//Find out if the writer uses tabs or spaces
					for (i = 0; i < data.persistent.lines.length; i++) {
						if (data.persistent.lines[i].indexOf('	') === 0) {
							usesTabs = true;
							break;
						} else if (data.persistent.lines[i].indexOf('  ') === 0) {
							var split = data.persistent.lines[i].split(' ');
							for (var j = 0; j < split.length; j++) {
								if (split[j] === ' ') {
									spacesAmount++;
								} else {
									break;
								}
							}
							usesTabs = false;
							break;
						}
					}

					var indent;
					if (usesTabs) {
						indent = '	';
					} else {
						indent = [];
						indent[spacesAmount] = ' ';
						indent = indent.join(' ');
					}
					
					//Only do this for the current scope
					var scopeLength = null;
					var idx = null;
					for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
						if (data.parentExpressions[i].type === 'BlockStatement' || 
								(data.parentExpressions[i].type === 'FunctionExpression' && 
									data.parentExpressions[i].body.type === 'BlockStatement')) {
							scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, data.parentExpressions[i].end);
							idx = 0;

							//Get the lowest possible scopeLength as to stay on the last line of the scope
							while (scopeLength > 0) {
								scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line + (++idx), data.parentExpressions[i].end);
							}
							scopeLength = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line + (idx - 1), data.parentExpressions[i].end);
						}
					}
					if (idx === null) {
						idx = (lines.length - callLines.from.line) + 1;
					} 

					var indents = 0;
					var newLineData = lines[callLines.from.line];
					while (newLineData.indexOf(indent) === 0) {
						newLineData = newLineData.replace(indent, '');
						indents++;
					}

					//Push in one extra line at the end of the expression
					var prevLine;
					var indentArr= [];
					indentArr[indents] = '';
					var prevLine2 = indentArr.join(indent) + '}).send();';
					var max = data.persistent.lines.length + 1;
					for (i = callLines.from.line; i < callLines.from.line + (idx - 1); i++) {
						lines[i] = indent + lines[i];
					}

					//If it's going to add a new line, indent the last line as well
					// if (idx === (lines.length - callLines.from.line) + 1) {
					// 	lines[i] = indent + lines[i];
					// }
					for (i = callLines.from.line + (idx - 1); i < max; i++) {
						prevLine = lines[i];
						lines[i] = prevLine2; 
						prevLine2 = prevLine;
					}
				}
				lines[callLines.from.line] = newLine;
				return;
			},

			callsChromeFunction: function(callee, data, onError) {
				data.parentExpressions.push(callee);

				//Check if the function has any arguments and check those first
				if (callee.arguments && callee.arguments.length > 0) {
					for (var i = 0; i < callee.arguments.length; i++) {
						if (this.findChromeExpression(callee.arguments[i], this.removeObjLink(data), onError)) {
							return true;
						}
					}
				}

				if (callee.type !== 'MemberExpression') {
					//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
					return this.findChromeExpression(callee, this.removeObjLink(data), onError);
				}

				//Continue checking the call itself
				if (callee.property) {
					data.functionCall = data.functionCall || [];
					data.functionCall.push(callee.property.name || callee.property.raw);
				}
				if (callee.object && callee.object.name) {
					//First object
					var isWindowCall = (this.isProperty(callee.object.name, 'window') && this.isProperty(callee.property.name || callee.property.raw, 'chrome'));
					if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
						data.expression = callee;
						var expr = this.getFunctionCallExpressions(data);
						var callLines = this.getCallLines(data.persistent.lines, data.persistent.lineSeperators, expr.start, expr.end);
						if (data.isReturn && !data.isValidReturn) {
							callLines.from.index = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, callLines.from.index);
							callLines.to.index = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.to.line, callLines.to.index);
							onError(callLines, data.persistent.passes);
							return false;
						}
						if (!data.persistent.diagnostic) {
							this.replaceChromeFunction(data, expr, callLines);
						}
						return true;
					}
				} else if (callee.object) {
					return this.callsChromeFunction(callee.object, data, onError);
				}
				return false;
			},

			removeObjLink: function(data) {
				var parentExpressions = data.parentExpressions || [];
				var newObj = {};
				for (var key in data) {
					if (data.hasOwnProperty(key) && key !== 'parentExpressions' && key !== 'persistent') {
						newObj[key] = data[key];
					}
				}

				var newParentExpressions = [];
				for (var i = 0; i < parentExpressions.length; i++) {
					newParentExpressions.push(parentExpressions[i]);
				}
				newObj.persistent = data.persistent;
				newObj.parentExpressions = newParentExpressions;
				return newObj;
			},

			findChromeExpression: function(expression, data, onError) {
				data.parentExpressions = data.parentExpressions || [];
				data.parentExpressions.push(expression);

				var i;
				switch (expression.type) {
					case 'VariableDeclaration':
						data.isValidReturn = expression.declarations.length === 1;
						for (i = 0; i < expression.declarations.length; i++) {
							//Check if it's an actual chrome assignment
							var declaration = expression.declarations[i];
							if (declaration.init) {
								var decData = this.removeObjLink(data);

								var returnName = declaration.id.name;
								decData.isReturn = true;
								decData.returnExpr = expression;
								decData.returnName = returnName;

								if (this.findChromeExpression(declaration.init, decData, onError)) {
									return true;
								}
							}
						}
						break;
					case 'CallExpression':
					case 'MemberExpression':
						var argsTocheck = [];
						if (expression.arguments && expression.arguments.length > 0) {
							for (i = 0; i < expression.arguments.length; i++) {
								if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
									//It's not a direct call to chrome, just handle this later after the function has been checked
									argsTocheck.push(expression.arguments[i]);
								} else {
									if (this.findChromeExpression(expression.arguments[i], this.removeObjLink(data), onError)) {
										return true;
									}
								}
							}
						}
						data.functionCall = [];
						if (expression.callee) {
							if (this.callsChromeFunction(expression.callee, data, onError)) {
								return true;
							}
						}
						for (i = 0; i < argsTocheck.length; i++) {
							if (this.findChromeExpression(argsTocheck[i], this.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
					case 'AssignmentExpression':
						data.isReturn = true;
						data.returnExpr = expression;
						data.returnName = expression.left.name;

						return this.findChromeExpression(expression.right, data, onError);
					case 'FunctionExpression':
					case 'FunctionDeclaration':
						data.isReturn = false;
						for (i = 0; i < expression.body.body.length; i++) {
							if (this.findChromeExpression(expression.body.body[i], this.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
					case 'ExpressionStatement':
						return this.findChromeExpression(expression.expression, data, onError);
					case 'SequenceExpression':
						data.isReturn = false;
						var lastExpression = expression.expressions.length - 1;
						for (i = 0; i < expression.expressions.length; i++) {
							if (i === lastExpression) {
								data.isReturn = true;
							}
							if (this.findChromeExpression(expression.expressions[i], this.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
					case 'UnaryExpression':
					case 'ConditionalExpression':
						data.isValidReturn = false;
						data.isReturn = true;
						if (this.findChromeExpression(expression.consequent, this.removeObjLink(data), onError)) {
							return true;
						}
						if (this.findChromeExpression(expression.alternate, this.removeObjLink(data), onError)) {
							return true;
						}
						break;
					case 'IfStatement':
						data.isReturn = false;
						if (this.findChromeExpression(expression.consequent, this.removeObjLink(data), onError)) {
							return true;
						}
						if (expression.alternate && this.findChromeExpression(expression.alternate, this.removeObjLink(data), onError)) {
							return true;
						}
						break;
					case 'LogicalExpression':
					case 'BinaryExpression':
						data.isReturn = true;
						data.isValidReturn = false;
						if (this.findChromeExpression(expression.left, this.removeObjLink(data), onError)) {
							return true;
						}
						if (this.findChromeExpression(expression.right, this.removeObjLink(data), onError)) {
							return true;
						}
						break;
					case 'BlockStatement':
						data.isReturn = false;
						for (i = 0; i < expression.body.length; i++) {
							if (this.findChromeExpression(expression.body[i], this.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
					case 'ReturnStatement':
						data.isReturn = true;
						data.returnExpr = expression;
						data.isValidReturn = false;
						return this.findChromeExpression(expression.argument, data, onError);
					case 'ObjectExpressions':
						data.isReturn = true;
						data.isValidReturn = false;
						for (i = 0; i < expression.properties.length; i++) {
							if (this.findChromeExpression(expression.properties[i].value, this
								.removeObjLink(data), onError)) {
								return true;
							}
						}
						break;
				}
				return false;
			},

			/**
			 * Generates an onError function that passes any errors into given container
			 *
			 * @param {Object[][]} container - A container array that contains arrays of errors for every pass
			 *		of the script
			 * @returns {function} A function that can be called with the "position" argument signaling the
			 *		position of the error in the script and the "passes" argument which signals the amount
			 *		of passes the script went through
			 */
			generateOnError: function(container) {
				return function(position, passes) {
					if (!container[passes]) {
						container[passes] = [position];
					} else {
						container[passes].push(position);
					}
				};
			},

			replaceChromeCalls: function(lines, passes, onError) {
				//Analyze the file
				var file = new window.TernFile('[doc]');
				file.text = lines.join('\n');
				var srv = new window.CodeMirror.TernServer({
					defs: [window.ecma5, window.ecma6, window.jqueryDefs, window.browserDefs].concat(window.crmAPIDefs ? [window.crmAPIDefs] : [])
				});
				window.tern.withContext(srv.cx, function() {
					file.ast = window.tern.parse(file.text, srv.passes, {
						directSourceFile: file,
						allowReturnOutsideFunction: true,
						allowImportExportEverywhere: true,
						ecmaVersion: srv.ecmaVersion
					});
				});

				var scriptExpressions = file.ast.body;

				var i;
				var index = 0;
				var lineSeperators = [];
				for (i = 0; i < lines.length; i++) {
					lineSeperators.push({
						start: index,
						end: index += lines[i].length + 1
					});
				}

				var script = file.text;

				//Check all expressions for chrome calls
				var persistentData = {
					lines: lines,
					lineSeperators: lineSeperators,
					script: script,
					passes: passes
				};

				var expression;
				if (passes === 0) {
					//Do one check, not replacing anything, to find any possible errors already
					persistentData.diagnostic = true;
					for (i = 0; i < scriptExpressions.length; i++) {
						expression = scriptExpressions[i];
						this.findChromeExpression(expression, { persistent: persistentData }, onError);
					}
					persistentData.diagnostic = false;
				}

				for (i = 0; i < scriptExpressions.length; i++) {
					expression = scriptExpressions[i];
					if (this.findChromeExpression(expression, { persistent: persistentData }, onError)) {
						script = this.replaceChromeCalls(persistentData.lines.join('\n').split('\n'), passes + 1, onError);
						break;
					}
				}

				return script;
			},

			/**
			 * Removes any duplicate position entries from given array
			 *
			 * @param {Object[]} arr - An array containing position objects
			 * @returns {Object[]} The same array with all duplicates removed
			 */
			removePositionDuplicates: function(arr) {
				var jsonArr = [];
				arr.forEach(function(item, index) {
					jsonArr[index] = JSON.stringify(item);
				});
				arr = jsonArr.filter(function(item, pos) {
					return jsonArr.indexOf(item) === pos;
				});
				return arr.map(function(item) {
					return JSON.parse(item);
				});
			},

			convertScriptFromLegacy: function(script, onError) {
				//Remove execute locally
				var lineIndex = script.indexOf('/*execute locally*/');
				if (lineIndex !== -1) {
					script = script.replace('/*execute locally*/\n', '');
					if (lineIndex === script.indexOf('/*execute locally*/')) {
						script = script.replace('/*execute locally*/', '');
					}
				}

				var errors = [];
				try {
					script = this.replaceChromeCalls(script.split('\n'), 0, this.generateOnError(errors));
				} catch (e) {
					onError(null, null, true, e);
					return script;
				}

				var firstPassErrors = errors[0];
				var finalPassErrors = errors[errors.length - 1];
				if (finalPassErrors) {
					onError(this.removePositionDuplicates(firstPassErrors), this.removePositionDuplicates(finalPassErrors), false, errors);
				}

				return script;
			}
		},

		generateScriptUpgradeErrorHandler: function(id) {
			return function(oldScriptErrors, newScriptErrors, parseError) {
				chrome.storage.local.get(function (keys) {
					if (!keys.upgradeErrors) {
						var val = {};
						val[id] = {
							oldScript: oldScriptErrors,
							newScript: newScriptErrors,
							generalError: parseError
						};

						keys.upgradeErrors = val;
						window.app.storageLocal.upgradeErrors = val;
					}
					keys.upgradeErrors[id] = window.app.storageLocal.upgradeErrors[id] = {
						oldScript: oldScriptErrors,
						newScript: newScriptErrors,
						generalError: parseError
					};
					chrome.storage.local.set({ upgradeErrors: keys.upgradeErrors });
				});
			};
		},

		parseOldCRMNode: function (string, openInNewTab) {
			var node = {};
			var oldNodeSplit = string.split('%123');
			var name = oldNodeSplit[0];
			var type = oldNodeSplit[1].toLowerCase();

			var nodeData = oldNodeSplit[2];

			switch (type) {
				//Stylesheets don't exist yet so don't implement those
				case 'link':
					var split;
					if (nodeData.indexOf(', ') > -1) {
						split = nodeData.split(', ');
					} else {
						split = nodeData.split(',');
					}
					node = this.templates.getDefaultLinkNode({
						name: name,
						id: this.generateItemId(),
						value: split.map(function(url) {
							return {
								newTab: openInNewTab,
								url: url
							};
						})
					});
					break;
				case 'divider':
					node = this.templates.getDefaultDividerNode({
						name: name,
						id: this.generateItemId()
					});
					break;
				case 'menu':
					node = this.templates.getDefaultMenuNode({
						name: name,
						id: this.generateItemId(),
						children: nodeData
					});
					break;
				case 'script':
					var scriptSplit = nodeData.split('%124');
					var scriptLaunchMode = scriptSplit[0];
					var scriptData = scriptSplit[1];
					var triggers;
					var launchModeString = scriptLaunchMode + '';
					if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
						triggers = launchModeString.split('1,')[1].split(',');
						triggers = triggers.map(function(item) {
							return {
								not: false,
								url: item.trim()
							};
						}).filter(function(item) {
							return item.url !== '';
						});
						scriptLaunchMode = 2;
					}
					var id = this.generateItemId();
					node = this.templates.getDefaultScriptNode({
						name: name,
						id: id,
						triggers: triggers || [],
						value: {
							launchMode: parseInt(scriptLaunchMode, 10),
							updateNotice: true,
							oldScript: scriptData,
							script: this.legacyScriptReplace.convertScriptFromLegacy(scriptData, this.generateScriptUpgradeErrorHandler(id))
						}
					});
					break;
			}

			return node;
		},

		assignParents: function(parent, nodes, index, amount) {
			for (; amount !== 0 && nodes[index.index]; index.index++, amount--) {
				var currentIndex = index.index;
				if (nodes[currentIndex].type === 'menu') {
					var childrenAmount = ~~nodes[currentIndex].children;
					nodes[currentIndex].children = [];
					index.index++;
					this.assignParents(nodes[currentIndex].children, nodes, index, childrenAmount);
					index.index--;
				}
				parent.push(nodes[currentIndex]);
			}
		},

		transferCRMFromOld: function(openInNewTab, storageSource) {
			var i;
			storageSource = storageSource || localStorage;
			var amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;

			var nodes = [];
			for (i = 1; i < amount; i++) {
				nodes.push(this.parseOldCRMNode(storageSource.getItem(i), openInNewTab));
			}

			//Structure nodes with children etc
			var crm = [];
			this.assignParents(crm, nodes, {
				index: 0
			}, nodes.length);
			return crm;
		},

		initCheckboxes: function(defaultLocalStorage) {
			var _this = this;
			if (window.doc.editCRMInRM.setCheckboxDisabledValue) {
				window.doc.editCRMInRM.setCheckboxDisabledValue && 
				window.doc.editCRMInRM.setCheckboxDisabledValue(false);
				Array.prototype.slice.apply(document.querySelectorAll('paper-toggle-option')).forEach(function(setting) {
					setting.init && setting.init(defaultLocalStorage);
				});
			} else {
				window.setTimeout(function() {
					_this.initCheckboxes.apply(_this, [defaultLocalStorage]);
				}, 1000);
			}
		},

		handleDataTransfer: function(_this) {
			localStorage.setItem('transferred', true);

			if (!window.CodeMirror.TernServer) {
				//Wait until TernServer is loaded
				window.setTimeout(function() {
					_this.handleDataTransfer(_this);
				}, 200);
				return;
			}

			var defaultLocalStorage = {
				requestPermissions: [],
				editing: null,
				selectedCrmType: 0,
				jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
				globalExcludes: [''],
				latestId: 0,
				useStorageSync: true,
				notFirstTime: true,
				lastUpdatedAt: chrome.runtime.getManifest().version,
				authorName: 'anonymous',
				showOptions: (localStorage.getItem('optionson') !== 'false'),
				recoverUnsavedData: false,
				CRMOnPage: ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]
					.split('.')[0] > 34,
				editCRMInRM: false,
				hideToolsRibbon: false,
				shrinkTitleRibbon: false,
				libraries: [
					{ "location": 'jQuery.js', "name": 'jQuery' },
					{ "location": 'mooTools.js', "name": 'mooTools' },
					{ "location": 'YUI.js', "name": 'YUI' },
					{ "location": 'Angular.js', "name": 'Angular' },
					{ "location": "jqlite.js", "name": 'jqlite' }
				]
			};

			//Save local storage
			chrome.storage.local.set(defaultLocalStorage);
			_this.storageLocal = defaultLocalStorage;
			_this.storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));


			//Sync storage
			var defaultSyncStorage = {
				editor: {
					keyBindings: {
						autocomplete: 'Ctrl-Space',
						showType: 'Ctrl-I',
						showDocs: 'Ctrl-O',
						goToDef: 'Alt-.',
						rename: 'Ctrl-Q',
						selectName: 'Ctrl-.'
					},
					tabSize: '4',
					theme: 'dark',
					useTabs: true,
					zoom: 100
				},
				crm: _this.transferCRMFromOld(localStorage.getItem('whatpage'))
			};

			window.app.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];

			//Save sync storage
			_this.uploadStorageSyncData(defaultSyncStorage, _this);
			_this.settings = defaultSyncStorage;
			var settingsJsonString = JSON.stringify(defaultSyncStorage);
			_this.settingsCopy = JSON.parse(settingsJsonString);

			//Go on with page execution
			//Storage-local functions
			_this.crmType = 0;
			_this.switchToIcons(0);
			_this.settingsJsonLength = settingsJsonString.length;

			//Storage-sync functions
			for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
				_this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
			}
			_this.updateEditorZoom();
			_this.orderNodesById(defaultSyncStorage.crm);
			_this.pageDemo.create();
			_this.buildNodePaths(_this.settings.crm, []);

			window.setTimeout(function() {
				_this.initCheckboxes.apply(_this, [defaultLocalStorage]);
			}, 2500);
		},

		handleFirstTime: function(_this) {
			//Local storage
			var defaultLocalStorage = {
				requestPermissions: [],
				editing: null,
				selectedCrmType: 0,
				jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
				globalExcludes: [''],
				latestId: 0,
				useStorageSync: true,
				notFirstTime: true,
				lastUpdatedAt: chrome.runtime.getManifest().version,
				authorName: 'anonymous',
				showOptions: (localStorage.getItem('optionson') !== 'false'),
				recoverUnsavedData: false,
				CRMOnPage: ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]
					.split('.')[0] > 34,
				editCRMInRM: false,
				hideToolsRibbon: false,
				shrinkTitleRibbon: false,
				libraries: [
					{ "location": 'jQuery.js', "name": 'jQuery' },
					{ "location": 'mooTools.js', "name": 'mooTools' },
					{ "location": 'YUI.js', "name": 'YUI' },
					{ "location": 'Angular.js', "name": 'Angular' },
					{ "location": "jqlite.js", "name": 'jqlite' }
				]
			};

			window.app.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];

			//Save local storage
			chrome.storage.local.set(defaultLocalStorage);
			_this.storageLocal = defaultLocalStorage;
			_this.storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));


			//Sync storage
			var defaultSyncStorage = {
				editor: {
					keyBindings: {
						autocomplete: 'Ctrl-Space',
						showType: 'Ctrl-I',
						showDocs: 'Ctrl-O',
						goToDef: 'Alt-.',
						rename: 'Ctrl-Q',
						selectName: 'Ctrl-.'
					},
					tabSize: '4',
					theme: 'dark',
					useTabs: true,
					zoom: 100
				},
				crm: [
					_this.templates.getDefaultLinkNode({
						id: this.generateItemId()
					})
				]
			};

			//Save sync storage
			_this.uploadStorageSyncData(defaultSyncStorage, _this);
			_this.settings = defaultSyncStorage;
			var settingsJsonString = JSON.stringify(defaultSyncStorage);
			_this.settingsCopy = JSON.parse(settingsJsonString);

			//Go on with page execution
			//Storage-local functions
			_this.crmType = 0;
			_this.switchToIcons(0);
			_this.settingsJsonLength = settingsJsonString.length;

			//Storage-sync functions
			for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
				_this.onSettingsReadyCallbacks[i].callback.apply(_this.onSettingsReadyCallbacks[i].thisElement, _this.onSettingsReadyCallbacks[i].params);
			}
			_this.updateEditorZoom();
			_this.orderNodesById(defaultSyncStorage.crm);
			_this.pageDemo.create();
			_this.buildNodePaths(_this.settings.crm, []);

			window.setTimeout(function() {
				_this.initCheckboxes.apply(_this, [defaultLocalStorage]);
			}, 2500);

			localStorage.setItem('transferred', true);
		},

		upgradeVersion: function(oldVersion, newVersion) {
			//No changes yet
		},

		checkFirstTime: function(storageLocal) {
			var _this = this;
			var currentVersion = chrome.runtime.getManifest().version;
			if (storageLocal.lastUpdatedAt === currentVersion) {
				return true;
			} else {
				if (storageLocal.lastUpdatedAt) {		
					this.upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
					return true;
				}
				try {
					//Determine if it's a transfer from CRM version 1.*
					if (!localStorage.getItem('transferred') && window.localStorage.getItem('numberofrows') !== null) {
						_this.handleDataTransfer(_this);
						_this.async(function() {
							window.doc.versionUpdateDialog.open();
						}, 2000);
					} else {
						_this.handleFirstTime(_this);
					}
				} catch (e) {
					setTimeout(function() {
						throw e;
					}, 2500);
					//Just clear the loading screen immediately
					document.documentElement.classList.remove('elementsLoading');
					return true;
				}
				return false;
			}
		},
		//#endregion

		buildNodePaths: function(tree, currentPath) {
			for (var i = 0; i < tree.length; i++) {
				var childPath = currentPath.concat([i]);
				tree[i].path = childPath;
				if (tree[i].children) {
					this.buildNodePaths(tree[i].children, childPath);
				}
			}
		},

		animateLoadingBar: function(settings, progress) {
			var _this = this;
			var scaleBefore = 'scaleX(' + settings.lastReachedProgress + ')';
			var scaleAfter = 'scaleX(' + progress + ')';
			if (settings.max === settings.lastReachedProgress ||
				settings.toReach > 1) {
					settings.progressBar.style.transform = 'scaleX(1)';
					settings.progressBar.style.WebkitTransform = 'scaleX(1)';
					return;
				}
			if (settings.progressBar.animate.isJqueryFill) {
				settings.progressBar.style.transform = scaleAfter;
				settings.progressBar.style.WebkitTransform = scaleAfter;
			} else {
				if (settings.isAnimating) {
					settings.toReach = progress;
					settings.shouldAnimate = true;
				} else {
					settings.isAnimating = true;
					settings.progressBar.animate([{
						transform: scaleBefore,
						WebkitTransform: scaleBefore
					}, {
						transform: scaleAfter,
						WebkitTransform: scaleAfter
					}], {
						duration: 200,
						easing: 'linear'
					}).onfinish = function() {
						settings.lastReachedProgress = progress;
						settings.isAnimating = false;
						settings.progressBar.style.transform = progress;
						settings.progressBar.style.WebkitTransform = progress;
						_this.animateLoadingBar(settings, settings.toReach);
					};
				}
			}
		},

		setupLoadingBar: function (fn) {
			var callback = null;
			fn(function(cb) {
				callback = cb;	
			});

			var _this = this;
			var importsAmount = 59;
			var loadingBarSettings = {
				lastReachedProgress: 0,
				progressBar: document.getElementById('splashScreenProgressBarLoader'),
				toReach: 0,
				isAnimating: false,
				shouldAnimate: false,
				max: importsAmount
			};

			var registeredElements = Polymer.telemetry.registrations.length;
			var registrationArray = Array.prototype.slice.apply(Polymer.telemetry.registrations);
			registrationArray.push = function (element) {
				Array.prototype.push.call(registrationArray, element);
				registeredElements++;
				var progress = Math.round((registeredElements / importsAmount) * 100) / 100;
				_this.animateLoadingBar(loadingBarSettings, progress);
				if (registeredElements === importsAmount) {
					callback && callback();
					//All elements have been loaded, unhide them all
					window.setTimeout(function() {
						document.documentElement.classList.remove('elementsLoading');

						//Clear the annoying CSS mime type messages and the /deep/ warning
						if (!window.lastError && location.hash.indexOf('noClear') === -1) {
							console.clear();
						}

						window.setTimeout(function() {
							//Wait for the fade to pass
							window.polymerElementsLoaded = true;
							document.getElementById('splashScreen').style.display = 'none';
						}, 500);

						console.log('%cHey there, if you\'re interested in how this extension works check out the github repository over at https://github.com/SanderRonde/CustomRightClickMenu',
							'font-size:120%;font-weight:bold;');
					}, 200);

					var event = document.createEvent("HTMLEvents");
					event.initEvent("CRMLoaded", true, true);
					event.eventName = "CRMLoaded";
					document.body.dispatchEvent(event);
				}
			};
			Polymer.telemetry.registrations = registrationArray;
		},

		hideGenericToast: function() {
			this.$.messageToast.hide();
		},

		nextUpdatedScript: function() {
			var index = this.$.scriptUpdatesToast.index;
			this.$.scriptUpdatesToast.text = this.getUpdatedScriptString(
				this.$.scriptUpdatesToast.scripts[++index]);
			this.$.scriptUpdatesToast.index = index;

			if (this.$.scriptUpdatesToast.scripts.length - index > 1) {
				this.$.nextScriptUpdateButton.style.display = 'inline';
			} else {
				this.$.nextScriptUpdateButton.style.display = 'none';
			}
		},

		hideScriptUpdatesToast: function() {
			this.$.scriptUpdatesToast.hide();
		},

		getUpdatedScriptString: function(updatedScript) {
			if (!updatedScript) {
				return 'Please ignore';
			}
			return [
				'Node ',
				updatedScript.name,
				' was updated from version ',
				updatedScript.oldVersion,
				' to version ',
				updatedScript.newVersion
			].join('');
		},

		get getPermissionDescription() {
			return this.templates.getPermissionDescription;
		},

		applyAddedPermissions: function() {
			var _this = this;
			var panels = Array.prototype.slice.apply(window.doc
				.addedPermissionsTabContainer
				.querySelectorAll('.nodeAddedPermissionsCont'));
			panels.forEach(function(panel) {
				var node = _this.nodesById[panel.getAttribute('data-id')];
				var permissions = Array.prototype.slice.apply(panel.querySelectorAll('paper-checkbox'))
					.map(function(checkbox) {
						if (checkbox.checked) {
							return checkbox.getAttribute('data-permission');
						}
						return null;
					}).filter(function(permission) {
						return !!permission;
					});
				if (!Array.isArray(node.permissions)) {
					node.permissions = [];
				}
				permissions.forEach(function(addedPermission) {
					if (node.permissions.indexOf(addedPermission) === -1) {
						node.permissions.push(addedPermission);
					}
				});
				if (permissions.length > 0) {
					//Updated meta tags
					var scriptSplit = node.value.script.split('\n');
					var metaEnd = null;
					var grantNoneIndex = null;
					for (var i = 0; i < scriptSplit.length; i++) {
						if (/\/\/(\s+)@grant(\s+)none/.test(scriptSplit[i])) {
							grantNoneIndex = i;
						}
						if (scriptSplit[i].indexOf('==/UserScript==') > -1) {
							metaEnd = i;
							break;
						}
					}
					if (metaEnd !== null) {
						var scriptEnd = scriptSplit.splice(metaEnd);
						scriptSplit.splice(grantNoneIndex, 1);

						permissions.forEach(function(addedPermission) {
							scriptSplit.push('// @grant	' + addedPermission);
						});
						scriptSplit = scriptSplit.concat(scriptEnd);
						node.value.script = scriptSplit.join('\n');
					}
				}
			});
			this.upload();
		},

		addedPermissionNext: function() {
			var cont = window.doc.addedPermissionsTabContainer;
			if (cont.tab === cont.maxTabs - 1) {
				window.doc.addedPermissionsDialog.close();
				this.applyAddedPermissions();
				return;
			}

			if (cont.tab + 2 !== cont.maxTabs) {
				window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'none';
				window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'block';
			} else {
				window.doc.addedPermissionNextButton.querySelector('.close').style.display = 'block';
				window.doc.addedPermissionNextButton.querySelector('.next').style.display = 'none';
			}
			cont.style.marginLeft = (++cont.tab * -800) + 'px';
			window.doc.addedPermissionPrevButton.style.display = 'block';
		},

		addedPermissionPrev: function() {
			var cont = window.doc.addedPermissionsTabContainer;
			cont.style.marginLeft = (--cont.tab * -800) + 'px';

			window.doc.addedPermissionPrevButton.style.display = (cont.tab === 0 ? 'none' : 'block');
		},

		getNodeName: function(nodeId) {
			return window.app.nodesById[nodeId].name;
		},

		getNodeVersion: function(nodeId) {
			return (window.app.nodesById[nodeId].nodeInfo && window.app.nodesById[nodeId].nodeInfo.version) ||
				'1.0';
		},

		setupStorages: function(resolve) {
			var _this = this;
			chrome.storage.local.get(function(storageLocal) {
				if (_this.checkFirstTime(storageLocal)) {
					resolve(function() {
						function callback(items) {
							_this.settings = items;
							_this.settingsCopy = JSON.parse(JSON.stringify(items));
							for (var i = 0; i < _this.onSettingsReadyCallbacks.length; i++) {
								_this.onSettingsReadyCallbacks[i].callback.apply(_this
									.onSettingsReadyCallbacks[i].thisElement, _this
									.onSettingsReadyCallbacks[i].params);
							}
							_this.updateEditorZoom();
							_this.orderNodesById(items.crm);
							_this.pageDemo.create();
							_this.buildNodePaths(items.crm, []);

							if (~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] <= 34) {
								window.doc.CRMOnPage.setCheckboxDisabledValue(true);
							}
							window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal
								.CRMOnPage);
						}

						Array.prototype.slice.apply(document.querySelectorAll('paper-toggle-option')).forEach(function(setting) {
							setting.init(storageLocal);
						});

						_this.bindListeners();
						delete storageLocal.nodeStorage;
						if (storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0) {
							_this.requestPermissions(storageLocal.requestPermissions);
						}
						if (storageLocal.editing) {
							setTimeout(function() {
								//Check out if the code is actually different
								var node = _this.nodesById[storageLocal.editing.id];
								var nodeCurrentCode = (node.type === 'script' ? node.value.script :
									node.value.stylesheet);
								if (nodeCurrentCode.trim() !== storageLocal.editing.val.trim()) {
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
							_this.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
							chrome.storage.local.set({
								jsLintGlobals: _this.jsLintGlobals
							});
						}
						if (storageLocal.globalExcludes && storageLocal.globalExcludes.length >
							1) {
							_this.globalExcludes = storageLocal.globalExcludes;
						} else {
							_this.globalExcludes = [''];
							chrome.storage.local.set({
								globalExcludes: _this.globalExcludes
							});
						}
						if (storageLocal.latestId) {
							_this.latestId = storageLocal.latestId;
						} else {
							_this.latestId = 0;
						}
						if (storageLocal.addedPermissions && storageLocal.addedPermissions.length > 0) {
							window.setTimeout(function() {
								window.doc.addedPermissionsTabContainer.tab = 0;
								window.doc.addedPermissionsTabContainer.maxTabs =
									storageLocal.addedPermissions.length;
								window.doc.addedPermissionsTabRepeater.items =
									storageLocal.addedPermissions;

								if (storageLocal.addedPermissions.length === 1) {
									window.doc.addedPermissionNextButton.querySelector('.next')
										.style.display = 'none';	
								} else {
									window.doc.addedPermissionNextButton.querySelector('.close')
										.style.display = 'none';
								}
								window.doc.addedPermissionPrevButton.style.display = 'none';
								window.doc.addedPermissionsTabRepeater.render();
								window.doc.addedPermissionsDialog.open();
								chrome.storage.local.set({
									addedPermissions: null
								});
							}, 2500);
						}
						if (storageLocal.updatedScripts && storageLocal.updatedScripts.length > 0) {
							_this.$.scriptUpdatesToast.text = _this.getUpdatedScriptString(
								storageLocal.updatedScripts[0]);
							_this.$.scriptUpdatesToast.scripts = storageLocal.updatedScripts;
							_this.$.scriptUpdatesToast.index = 0;
							_this.$.scriptUpdatesToast.show();

							if (storageLocal.updatedScripts.length > 1) {
								_this.$.nextScriptUpdateButton.style.display = 'inline';
							} else {
								_this.$.nextScriptUpdateButton.style.display = 'none';
							}
							chrome.storage.local.set({
								updatedScripts: []
							});
							storageLocal.updatedScript = [];
						}

						if (storageLocal.isTransfer) {
							chrome.storage.local.set({
								isTransfer: false
							});
							window.doc.versionUpdateDialog.open();
						}

						_this.storageLocal = storageLocal;
						_this.storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
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
									callback(settings);
								}
							});
						} else {
							//Send the "settings" object on the storage.local to the callback
							_this.settingsJsonLength = JSON.stringify(storageLocal.settings || {}).length;
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
									callback(settings);
								});
							} else {
								callback(storageLocal.settings);
							}
						}
					});
				}
			});
		},

		refreshPage: function() {
			function onDone(fn) {
				fn();
			}

			//Reset storages
			this.setupStorages(onDone);

			//Reset dialog
			if (window.app.item) {
				window[window.app.item.type + 'Edit'] && window[window.app.item.type + 'Edit'].cancel();
			}
			window.app.item = null;

			//Reset checkboxes
			this.initCheckboxes.apply(this, [window.app.storageLocal]);

			//Reset default links and searchengines
			Array.prototype.slice.apply(document.querySelectorAll('default-link')).forEach(function(link) {
				link.reset();
			});

			//Reset regedit part
			document.querySelector('#URISchemeFilePath').value = 'C:\\files\\my_file.exe';
			document.querySelector('#URISchemeFilePath').querySelector('input').value = 'C:\\files\\my_file.exe';
			document.querySelector('#URISchemeSchemeName').value = 'myscheme';
			document.querySelector('#URISchemeSchemeName').querySelector('input').value = 'myscheme';
		},

		getLocalStorageKey: function(key) {
			var data = localStorage.getItem(key);
			if (data === undefined || data === null) {
				return false;
			}
			return data;
		},

		exportToLegacy: function() {
			var data = ["all", this.getLocalStorageKey('firsttime'),
				this.getLocalStorageKey('options'),
				this.getLocalStorageKey('firsttime'),
				this.getLocalStorageKey('firsttime'),
				this.getLocalStorageKey('firsttime'),
				localStorage.optionson,
				localStorage.waitforsearch, localStorage.whatpage,
				localStorage.numberofrows].join('%146%');
			
			var rows = localStorage.getItem('numberofrows') || 0;
			for (var i = 1; i <= rows; i++) {
				data += "%146%" + localStorage.getItem(i);
			}

			window.doc.exportToLegacyOutput.value = data;
		},

		ready: function () {
			var _this = this;
			this.crm.parent = this;
			window.app = this;
			window.doc = window.app.$;

			var controlPresses = 0;
			document.body.addEventListener('keydown', function(event) {
				if (event.key === 'Control') {
					controlPresses++;
					window.setTimeout(function() {
						if (controlPresses >= 3) {
							_this._toggleBugReportingTool();
							controlPresses = 0;
						} else {
							if (controlPresses > 0) {
								controlPresses--;
							}
						}
					}, 800);
				}
			});

			this.setupLoadingBar(function(resolve) {
				_this.setupStorages.apply(_this, [resolve]);
			});

			this.show = false;

			chrome.storage.onChanged.addListener(function(changes, areaName) {
				if (areaName === 'local' && changes.latestId) {
					var highest = changes.latestId.newValue > changes.latestId.oldValue ? changes.latestId.newValue : changes.latestId.oldvalue;
					_this.latestId = highest;
				}
			});
		},

		/**
		 * Any templates
		 */
		templates: {
			/**
			 * Merges two arrays
			 *
			 * @param {any[]} mainArray - The main array
			 * @param {any[]} additions - The additions array
			 * @returns {any[]} The merged arrays
			 */
			mergeArrays: function(mainArray, additionArray) {
				for (var i = 0; i < additionArray.length; i++) {
					if (mainArray[i] && typeof additionArray[i] === 'object' && 
						mainArray[i] !== undefined && mainArray[i] !== null) {
						if (Array.isArray(additionArray[i])) {
							mainArray[i] = this.mergeArrays(mainArray[i], additionArray[i]);
						} else {
							mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
						}
					} else {
						mainArray[i] = additionArray[i];
					}
				}
				return mainArray;
			},

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
						if (typeof additions[key] === 'object' &&
							mainObject[key] !== undefined &&
							mainObject[key] !== null) {
							if (Array.isArray(additions[key])) {
								mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
							} else {
								mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
							}
						} else {
							mainObject[key] = additions[key];
						}
					}
				}
				return mainObject;
			},

			getDefaultNodeInfo: function(options) {
				const defaultNodeInfo = {
					permissions: [],
					source: {
						author: (this.parent && this.parent.storageLocal.authorName) || 'anonymous'
					 }
				};

				return this.mergeObjects(defaultNodeInfo, options);
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
					onContentTypes: [true, true, true, false, false, false],
					type: 'link',
					showOnSpecified: false,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [{
						url: '*://*.example.com/*',
						not: false
					}],
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
			 * Gets the default stylesheet value object with given options applied
			 *
			 * @param {Object} options - Any pre-set properties
			 * @returns {Object} A stylesheet node value with specified properties set
			 */
			getDefaultStylesheetValue: function(options) {
				var value = {
					stylesheet: [
						'/* ==UserScript==',
						'// @name	name',
						'// @CRM_contentTypes	[true, true, true, false, false, false]',
						'// @CRM_launchMode	0',
						'// @CRM_stylesheet	true',
						'// @grant	none',
						'// @match	*://*.example.com/*',
						'// ==/UserScript== */'].join('\n'),
					launchMode: 0
				};

				return this.mergeObjects(value, options);
			},

			/**
			 * Gets the default script value object with given options applied
			 *
			 * @param {Object} options - Any pre-set properties
			 * @returns {Object} A script node value with specified properties set
			 */
			getDefaultScriptValue: function(options) {
				var value = {
					launchMode: 0,
					backgroundLibraries: [],
					libraries: [],
					script: [
						'// ==UserScript==',
						'// @name	name',
						'// @CRM_contentTypes	[true, true, true, false, false, false]',
						'// @CRM_launchMode	0',
						'// @grant	none',
						'// @match	*://*.example.com/*',
						'// ==/UserScript=='].join('\n'),
					backgroundScript: ''
				};

				return this.mergeObjects(value, options);
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
					onContentTypes: [true, true, true, false, false, false],
					type: 'script',
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [{
						url: '*://*.example.com/*',
						not: false
					}],
					isLocal: true,
					value: this.getDefaultScriptValue(options.value)
				};

				return this.mergeObjects(defaultNode, options);
			},

			/**
			 * Gets the default stylesheet node object with given options applied
			 *
			 * @param {Object} options - Any pre-set properties
			 * @returns {Object} A stylesheet node with specified properties set
			 */
			getDefaultStylesheetNode: function(options) {
				var defaultNode = {
					name: 'name',
					onContentTypes: [true, true, true, false, false, false],
					type: 'stylesheet',
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					isLocal: true,
					triggers: [{
						url: '*://*.example.com/*',
						not: false
					}],
					value: this.getDefaultStylesheetValue(options.value)
				};

				return this.mergeObjects(defaultNode, options);
			},

			/**
			 * Gets the default divider or menu node object with given options applied
			 *
			 * @param {String} type - The type of node
			 * @param {Object} options - Any pre-set properties
			 * @returns {Object} A divider or menu node with specified properties set
			 */
			getDefaultDividerOrMenuNode: function(options, type) {
				var defaultNode = {
					name: 'name',
					type: type,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					onContentTypes: [true, true, true, false, false, false],
					isLocal: true,
					value: {}
				};

				return this.mergeObjects(defaultNode, options);
			},

			/**
			 * Gets the default divider node object with given options applied
			 *
			 * @param {Object} options - Any pre-set properties
			 * @returns {Object} A divider node with specified properties set
			 */
			getDefaultDividerNode: function(options) {
				return this.getDefaultDividerOrMenuNode(options, 'divider');
			},

			/**
			 * Gets the default menu node object with given options applied
			 *
			 * @param {Object} options - Any pre-set properties
			 * @returns {Object} A menu node with specified properties set
			 */
			getDefaultMenuNode: function(options) {
				return this.getDefaultDividerOrMenuNode(options, 'menu');
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
					downloads: 'Allows for the creating, pausing, searching and removing of downloads and listening for any downloads happenng. (https://developer.chrome.com/extensions/downloads)',
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
					chrome: 'Allows the use of chrome API\'s. Without this permission only the \'crmGet\' and \'crmWrite\' permissions will work.',

					//Tampermonkey APIs
					GM_addStyle: 'Allows the adding of certain styles to the document through this API',
					GM_deleteValue: 'Allows the deletion of storage items',
					GM_listValues: 'Allows the listing of all storage data',
					GM_addValueChangeListener: 'Allows for the listening of changes to the storage area',
					GM_removeValueChangeListener: 'Allows for the removing of listeners',
					GM_setValue: 'Allows for the setting of storage data values',
					GM_getValue: 'Allows the reading of values from the storage',
					GM_log: 'Allows for the logging of values to the console (same as normal console.log)',
					GM_getResourceText: 'Allows the reading of the content of resources defined in the header',
					GM_getResourceURL: 'Allows the reading of the URL of the predeclared resource',
					GM_registerMenuCommand: 'Allows the adding of a button to the extension menu - not implemented',
					GM_unregisterMenuCommand: 'Allows the removing of an added button - not implemented',
					GM_openInTab: 'Allows the opening of a tab with given URL',
					GM_xmlhttpRequest: 'Allows you to make an XHR to any site you want',
					GM_download: 'Allows the downloading of data to the hard disk',
					GM_getTab: 'Allows the reading of an object that\'s persistent while the tab is open - not implemented',
					GM_saveTab: 'Allows the saving of the tab object to reopen after a page unload - not implemented',
					GM_getTabs: 'Allows the readin gof all tab object - not implemented',
					GM_notification: 'Allows sending desktop notifications',
					GM_setClipboard: 'Allows copying data to the clipboard - not implemented',
					GM_info: 'Allows the reading of some script info'
				};

				return descriptions[permission];
			},

			get parent() {
				return window.app;
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
					return function() {
						for (var i = 0; i < data.length; i++) {
							window.open(data[i].url, '_blank');
						}
					};
				},

				/**
				 * Makes an onclick handler for scripts
				 *
				 * @param {String} data - Script to execute.
				 *
				 * @returns {Function} the function to execute on click a script
				 */
				script: function() {
					return function() {
						alert('This would run a script');
					};
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
						var state = checked;

						return function() {
							alert('This would toggle a stylesheet ' + (state ? 'on' : 'off'));
						};
					},
					/**
					 * Makes an onclick handler for stylesheets
					 *
					 * @param {Object} data - Stylesheet to execute.
					 *
					 * @returns {Function} the function to execute on click a stylesheet
					 */
					normal: function() {
						return function() {
							alert('This would apply a stylesheet');
						}
					},

					get parent() {
						return window.app.pageDemo.handlers;
					}
				},

				/**
				 * Makes an onclick handler to edit the node on clicking it
				 *
				 * @param {Object} node - The node to edit
				 *
				 * @returns {Function} A function that launches the edit screen for given node
				 */
				edit: function(node) {
					var _this = this;
					return function() {
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
				return childItems;
			},

			getCrmTypeFromNumber: function(crmType) {
				var types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
				return types[crmType];
			},

			getChildrenAmount: function(object) {
				var children = 0;
				for (var key in object) {
					if (object.hasOwnProperty(key)) {
						children++;
					}
				}
				return children;
			},

			bindContextMenu: function (crmType) {
				var items;
				var _this = this;
				if (crmType === 0) {
					items = _this.buildForCrmType(0);
					if (_this.getChildrenAmount(items) > 0) {
						$.contextMenu({
							selector: '.container, #editCrm.page, .crmType.pageType',
							items: items
						});
					}
				} else {
					var contentType = _this.getCrmTypeFromNumber(crmType);
					items = _this.buildForCrmType(crmType);
					if (_this.getChildrenAmount(items) > 0) {
						$.contextMenu({
							selector: '#editCrm.' + contentType + ', .crmType.' + contentType + 'Type',
							items: items
						});
					}
				}
			},

			contextMenuItems: [],

			removeContextMenus: function() {
				var el;
				this.usedStylesheetIds.forEach(function(id) {
					el = document.getElementById('stylesheet' + id);
					el && el.remove();
				});

				$.contextMenu('destroy');
			},

			loadContextMenus: function() {
				var _this = this;
				var toLoad = 0;
				this.removeContextMenus();
				var callbackId;

				function loadContextMenus(deadline) {
					while (toLoad < 6 && deadline.timeRemaining() > 0) {
						_this.bindContextMenu(toLoad++);
					}

					if (toLoad >= 6) {
						window.cancelIdleCallback(callbackId);
					}
				}

				if ('requestIdleCallback' in window) {
					callbackId = window.requestIdleCallback(loadContextMenus);
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
				if (!$.contextMenu) {
					window.setTimeout(this.create.bind(this), 500);
					return;
				}
				
				if (this.parent.storageLocal.CRMOnPage && 
					~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] > 34) {
						this.loadContextMenus();
					} else {
						this.removeContextMenus();
					}
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
				var nodeChildren = node.children;
				if (nodeChildren) {
					var el;
					for (var i = 0; i < nodeChildren.length; i++) {
                        if (nodeChildren[i].id === id) {
                            return (returnArray ? nodeChildren : node);
                        }
						el = this._lookupId(id, returnArray, nodeChildren[i]);
						if (el) {
							return el;
						}
					}
				}
				return null;
			},

			lookupId: function(id, returnArray) {
                if (!returnArray) {
                    return window.app.nodesById[id];
                }

				var el;
				for (var i = 0; i < window.app.settings.crm.length; i++) {
                    if (window.app.settings.crm[i].id === id) {
                        return window.app.settings.crm;
                    }
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
				};
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
				window.app.upload();
				window.app.editCRM.build(window.app.editCRM.setMenus, null, true);
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
				var toMoveIndex = toMove[toMove.length - 1];
				var toMoveItem = toMoveContainer[toMoveIndex];

				var newTarget = this.lookup(target, true);
				var targetIndex = target[target.length - 1];

				if (sameColumn && toMoveIndex > targetIndex) {
					insertInto(toMoveItem, newTarget, targetIndex);
					toMoveContainer.splice(parseInt(toMoveIndex, 10) + 1, 1);
				} else {
					insertInto(toMoveItem, newTarget, targetIndex);
					toMoveContainer.splice(toMoveIndex, 1);
				}
				window.app.upload();
				window.app.editCRM.build(window.app.editCRM.setMenus, null, true);
			},

			remove: function(index) {
				this.lookup(index, true).splice(index[index.length - 1], 1);
				window.app.upload();
				window.app.editCRM.build(window.app.editCRM.setMenus, null, true);
			}
		}
	});
}());