/// <reference path="../../../scripts/_references.js"/>
/// <reference path="~/app/elements/crm-app/crm-app.js" />
'use strict';

window.Polymer({
	is: 'edit-crm',

	/*
	 * The currently used timeout for settings the crm
	 * 
	 * @attribute currentTimeout
	 * @type Number
	 * @default null
	 */
	currentTimeout: null,

	/*
	 * The currently used set menus
	 * 
	 * @attribute setMenus
	 * @type Array
	 * @default []
	 */
	setMenus: [],

	/*
	 * The element used to display drag area
	 * 
	 * @attribute dragAreaEl
	 * @type Element
	 * @default null
	 */
	dragAreaEl: null,

	/*
	 * The coordinates of the location the user started dragging
	 * 
	 * @attribute dragAreaPos
	 * @type Object
	 * @default null
	 */
	dragAreaPos: null,

	/*
	 * The handler for scrolling the body
	 * 
	 * @attribute scrollHandler
	 * @type Function
	 * @default null
	 */
	scrollHandler: null,

	/*
	 * The last drag event
	 * 
	 * @attribute lastDragEvent
	 * @type Object
	 * @default {}
	 */
	lastDragEvent: {},

	/*
	 * The leftmost CRM column for getting scroll from the left
	 * 
	 * @attribute firstCRMColumnEl
	 * @type Element
	 * @default null
	 */
	firstCRMColumnEl: null,

	get firstCRMColumn() {
		return (this.firstCRMColumnEl || (this.firstCRMColumnEl = window.app.editCRM.children[1].children[2]));
	},

	properties: {
		crm: {
			type: Array,
			value: [],
			notify: true
		},
		crmLoading: {
			type: Boolean,
			value: false,
			notify: true
		},
		crmEmpty: {
			type: Boolean,
			value: true,
			notify: true,
			computed: '_isCrmEmpty(crm, crmLoading)'
		},
		/*
		 * Whether the user is currently selecting nodes to remove
		 * 
		 * @attribute isSelecting
		 * @type Boolean
		 * @default false
		 */
		isSelecting: {
			type: Boolean,
			value: false,
			notify: true
		}
	},

	listeners: {
		'crmTypeChanged': '_typeChanged'
	},

	_isCrmEmpty: function (crm, crmLoading) {
		return !crmLoading && crm.length === 0;
	},

	getCurrentTypeIndex: function (path) {
		var i;
		var hiddenNodes = {};
		for (i = 0; i < window.app.settings.crm.length; i++) {
			this.isNodeVisible(hiddenNodes, window.app.settings.crm[i], window.app.crmType);
		}
		console.log(path);
		var items = $($(window.app.editCRM.$.mainCont).children('.CRMEditColumnCont')[path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children;
		var index = path[path.length - 1];
		for (i = 0; i < items.length; i++) {
			if (hiddenNodes[items[i]]) {
				index--;
			}
		}
		return index;
	},

	/**
	 * Gets the last menu of the list.
	 *
	 * @param list - The list.
	 * @param hidden - The hidden nodes
	 *
	 * @return The last menu on the given list.
	 */
	getLastMenu: function (list, hidden) {
		var lastMenu = -1;
		var lastFilledMenu = -1;
		//Find last menu to auto-expand
		if (list) {
			list.forEach(function (item, index) {
				if ((item.type === 'menu' || window.app.settings.shadowStart && item.menuVal) && !hidden[item.id]) {
					lastMenu = index;
					if (item.children.length > 0) {
						lastFilledMenu = index;
					}
				}
			});
			if (lastFilledMenu !== -1) {
				return lastFilledMenu;
			}
		}
		return lastMenu;
	},

	/**
	 * Returns whether the node is visible or not (1 if it's visible)
	 * 
	 * @param {Object} result - The result object in which to store all paths
	 * @param {Object} node - The node to check
	 * @param {Number} showContentType - The content type to show
	 * @returns {Number} 1 if the node is visible, 0 if it's not
	 */
	isNodeVisible: function (result, node, showContentType) {
		var i;
		var length;
		if (node.children && node.children.length > 0) {
			length = node.children.length;
			for (i = 0; i < length; i++) {
				this.isNodeVisible(result, node.children[i], showContentType);
			}
		}
		if (!node.onContentTypes[showContentType]) {
			result[node.id] = true;
			return 0;
		}
		return 1;
	},

	getIndent: function (data, lastMenu, hiddenNodes) {
		var i;
		var length = data.length - 1;
		var visibleIndent = lastMenu;
		for (i = 0; i < length; i++) {
			if (hiddenNodes[data[i].id]) {
				visibleIndent--;
			}
		}
		return visibleIndent;
	},

	/**
	 * Builds crm edit object.
	 * 		  
	 * @param setMenus - An array of menus that are set to be opened (by user input).
	 *
	 * @return the CRM edit object
	 */
	buildCRMEditObj: function (setMenus) {
		var i;
		var length;
		var column;
		var indent;
		var path = [];
		var columnCopy;
		var columnNum = 0;
		var lastMenu = -2;
		var indentTop = 0;
		var crmEditObj = [];
		var newSetMenus = [];
		var list = window.app.settings.crm;
		var setMenusLength = setMenus.length;
		var showContentTypes = window.app.crmType;

		//Hide all nodes that should be hidden
		var hiddenNodes = {};
		var shown = 0;
		for (i = 0; i < list.length; i++) {
			shown += this.isNodeVisible(hiddenNodes, list[i], showContentTypes);
		}

		if (shown) {
			while (lastMenu !== -1) {
				if (setMenusLength > columnNum && !hiddenNodes[list[setMenus[columnNum]]]) {
					lastMenu = setMenus[columnNum];
				} else {
					lastMenu = this.getLastMenu(list, hiddenNodes);
				}
				newSetMenus[columnNum] = lastMenu;
				indent = this.getIndent(list, lastMenu, hiddenNodes);
				column = {};
				column.indent = [];
				column.indent[indentTop - 1] = undefined;
				column.list = list;
				column.index = columnNum;
				if (window.app.settings.shadowStart && window.app.settings.shadowStart <= columnNum) {
					column.shadow = true;
				}

				if (lastMenu !== -1) {
					indentTop += indent;
					list.forEach(function (item) {
						item.expanded = false;
					});
					list[lastMenu].expanded = true;
					if (window.app.settings.shadowStart && list[lastMenu].menuVal) {
						list = list[lastMenu].menuVal;
					} else {
						list = list[lastMenu].children;
					}
				}

				column.list.map(function (currentVal, index) {
					currentVal.path = [];
					path.forEach(function (item, pathIndex) {
						currentVal.path[pathIndex] = item;
					});
					currentVal.index = index;
					currentVal.path.push(index);
					return currentVal;
				});
				length = column.list.length;
				columnCopy = [];
				for (i = 0; i < length; i++) {
					if (!hiddenNodes[column.list[i].id]) {
						columnCopy.push(column.list[i]);
					}
				}
				column.list = columnCopy;
				path.push(lastMenu);
				crmEditObj.push(column);
				columnNum++;
			}
		}

		return {
			crm: crmEditObj,
			setMenus: newSetMenus
		};
	},

	/**
	 * @fn build: function ()
	 *
	 * @brief Builds the crm object
	 * 		  
	 * @param setItems - Set choices for menus by the user
	 * @param quick - Do it quicker than normal
	 * @param superquick - Don't show a loading image and do it immediately
	 * 
	 * @return The object to be sent to Polymer
	 */
	build: function (setItems, quick, superquick) {
		var _this = this;
		setItems = setItems || [];
		var obj = this.buildCRMEditObj(setItems);
		this.setMenus = obj.setMenus;
		obj = obj.crm;
		this.crm = [];
		if (this.currentTimeout !== null) {
			window.clearTimeout(this.currentTimeout);
		}
		this.crmLoading = true;

		function func() {
			_this.crm = obj;
			_this.notifyPath('crm', _this.crm);
			_this.currentTimeout = null;
			setTimeout(function () {
				_this.crmLoading = false;
				var els = document.getElementsByTagName('edit-crm-item');
				for (var i = 0; i < els.length; i++) {
					els[i].update();
				}
				setTimeout(function() {
					window.app.pageDemo.create();
				}, 0);
			}, 50);
		}

		if (superquick) {
			func();
		} else {
			this.currentTimeout = window.setTimeout(func, quick ? 150 : 1000);
		}
		return obj;
	},

	ready: function () {
		var _this = this;
		window.app.editCRM = this;
		window.app.addEventListener('crmTypeChanged', this._typeChanged);
		_this._typeChanged(true);
	},

	addItem: function () {
		var newItem = window.app.templates.getDefaultLinkNode({
			id: window.app.generateItemId()
		});
		window.app.crm.add(newItem);
		window.app.editCRM.build(window.app.editCRM.setMenus, false, true);
	},

	getSelected: function() {
		var selected = [];
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		var i;
		for (i = 0; i < editCrmItems.length; i++) {
			if (editCrmItems[i].classList.contains('highlighted')) {
				selected.push(editCrmItems[i].item.id);
			}
		}
		return selected;
	},

	makeNodeSafe: function(node) {
		var newNode = {};
		node.type && (newNode.type = node.type);
		node.name && (newNode.name = node.name);
		node.value && (newNode.value = node.value);
		node.linkVal && (newNode.linkVal = node.linkVal);
		node.menuVal && (newNode.menuVal = node.menuVal);
		if (node.children) {
			newNode.children = [];
			for (var i = 0; i < node.children.length; i++) {
				newNode.children[i] = this.makeNodeSafe(node.children[i]);
			}
		}
		node.nodeInfo && (newNode.nodeInfo = node.nodeInfo);
		node.triggers && (newNode.triggers = node.triggers);
		node.scriptVal && (newNode.scriptVal = node.scriptVal);
		node.stylesheetVal && (newNode.stylesheetVal = node.stylesheetVal);
		node.onContentTypes && (newNode.onContentTypes = node.onContentTypes);
		node.showOnSpecified && (newNode.showOnSpecified = node.showOnSpecified);
		return newNode;
	},

	extractUniqueChildren: function(node, toExportIds, results) {
		if (toExportIds.indexOf(node.id) > -1) {
			results.push(node);
		} else {
			for (var i = 0; node.children && i < node.children.length; i++) {
				this.extractUniqueChildren(node.children[i], toExportIds, results);
			}
		}
	},

	changeAuthor: function(node, authorName) {
		node.nodeInfo.author = authorName;
		for (var i = 0; node.children && i < node.children.length; i++) {
			this.changeAuthor(node.children[i], authorName);
		}
	},

	exportSelected: function() {
		var toExport = this.getSelected();
		console.log(toExport);
		var exports = [];
		var i;
		for (i = 0; i < app.settings.crm.length; i++) {
			this.extractUniqueChildren(app.settings.crm[i], toExport, exports);
		}
		console.log(exports);

		var safeExports = [];
		for (i = 0; i < exports.length; i++) {
			safeExports[i] = this.makeNodeSafe(exports[i]);
		}
		console.log(safeExports);
		var dataJson = {
			crm: safeExports
		};

		var textarea = $('#exportJSONData')[0];

		function authorNameChange(event) {
			console.log(event);
			var author = event.target.value;
			chrome.storage.local.set({
				authorName: author
			});
			for (var j = 0; j < safeExports.length; j++) {
				this.changeAuthor(safeExports[j], author);
			}
			dataJson = JSON.stringify({
				crm: safeExports
			});
			textarea.value = dataJson;
		}

		$('#exportAuthorName').on('change', authorNameChange);
		textarea.value = JSON.stringify(dataJson);
		$('#exportDialog')[0].open();
		setTimeout(function() {
			textarea.focus();
			textarea.select();
		}, 150);

		if (storageLocal.authorName) {
			authorNameChange(storageLocal.authorName);
		}
	},

	cancelSelecting: function() {
		var _this = this;
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		//Select items
		for (var i = 0; i < editCrmItems.length; i++) {
			editCrmItems[i].classList.remove('selecting');
		}
		setTimeout(function () {
			_this.isSelecting = false;
		}, 150);
	},

	removeSelected: function() {
		var j;
		var arr;
		var toRemove = this.getSelected();
		for (var i = 0; i < toRemove.length; i++) {
			try {
				arr = window.app.crm.lookupId(toRemove[i], true);
				for (j = 0; j < arr.length; j++) {
					if (arr[j].id === toRemove[i]) {
						arr.splice(arr[j], 1);
					}
				}
			} catch (e) {
				//Item has already been removed
				console.log(e);
				console.log('didnt work', toRemove[i]);
			}
		}
		this.build(null, true, false);

		this.isSelecting = false;
	},

	selectItems: function() {
		var _this = this;
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		//Select items
		for (var i = 0; i < editCrmItems.length; i++) {
			editCrmItems[i].classList.add('selecting');
		}
		setTimeout(function() {
			_this.isSelecting = true;
		}, 150);
	},

	getCRMElementFromPath: function (path, showPath) {
		var i;
		for (i = 0; i < path.length - 1; i++) {
			if (this.setMenus[i] !== path[i]) {
				if (showPath) {
					this.build(path, false, true);
					break;
				} else {
					return null;
				}
			}
		}

		var cols = this.$.mainCont.children;
		var row = cols[path.length + 1].children;
		for (i = 0; i < row.length; i++) {
			if (row[i].tagName === 'PAPER-MATERIAL') {
				row = row[i].children[0].children;
				break;
			}
		}

		for (i = 0; i < row.length; i++) {
			if (window.app.compareArray(row[i].item.path, path)) {
				return row[i];
			}
		}
		return null;
	},

	_typeChanged: function (quick) {
		for (var i = 0; i < 6; i++) {
			window.app.editCRM.classList[(i === window.app.crmType ? 'add' : 'remove')](window.app.pageDemo.getCrmTypeFromNumber(i));
		}
		runOrAddAsCallback(window.app.editCRM.build, window.app.editCRM, (quick ? [null, true] : []));
	}
});