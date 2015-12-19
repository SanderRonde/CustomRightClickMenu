/// <reference path="../../../scripts/_references.js"/>
/// <reference path="~/app/elements/crm-options/crm-app.js" />
'use strict';
var app;
app.settings = app.settings;

/**
 * @fn function getLastMenu(list)
 *
 * @brief Gets the last menu of the list.
 *
 * @param list - The list.
 * @param hidden - The hidden nodes
 *
 * @return The last menu on the given list.
 */
function getLastMenu(list, hidden) {
	var lastMenu = -1;
	var lastFilledMenu = -1;
	//Find last menu to auto-expand
	if (list) {
		list.forEach(function (item, index) {
			if ((item.type === 'menu' || (app.settings.shadowStart && item.menuVal) && !hidden[item.path])) {
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
}

/**
 * Shows only the nodes that should be shown with current showContentTypes settings
 * 
 * @param {Object} result - The result object in which to store all paths
 * @param {Object} node - The node to check
 * @param {boolean[]} showContentTypes - Array of which content types to show
 * @returns {Object} An object in which each key is a path of a crm node and the value (true or false) tells whether to show it or not.
 */
function getHiddenNodes(result, node, showContentTypes) {
	var i;
	var length;
	if (node.children && node.children.length > 0) {
		length = node.children.length;
		var visible = 0;
		for (i = 0; i < length; i++) {
			visible += getHiddenNodes(result, node.children[i], showContentTypes);
		}
		if (!visible) {
			result[node.id] = true;
			return 0;
		}
	} else {
		for (i = 0; i < 6; i++) {
			if (showContentTypes[i] && !node.onContentTypes[i]) {
				result[node.id] = true;
				return 0;
			}
		}
	}
	return 1;
}

function getIndent(data, lastMenu, hiddenNodes) {
	var i;
	var length = data.length - 1;
	var visibleIndent = lastMenu;
	for (i = 0; i < length; i++) {
		if (hiddenNodes[data[i].id]) {
			visibleIndent--;
		}
	}
	return visibleIndent;
}

/**
 * @fn function buildCRMEditObj()
 *
 * @brief Builds crm edit object.
 * 		  
 * @param setMenus - An array of menus that are set to be opened (by user input).
 *
 * @return the CRM edit object
 */
function buildCRMEditObj(setMenus) {
	var showContentTypes = app.crmTypes;
	var setMenusLength = setMenus.length;
	var newSetMenus = [];
	var crmEditObj = [];
	var indentTop = 0;
	var lastMenu = -2;
	var columnNum = 0;
	var columnCopy;
	var path = [];
	var column;
	var indent;
	var length;

	var list = app.settings.crm;
	//Hide all nodes that should be hidden
	var hiddenNodes = {};
	var i;
	var shown = 0;
	for (i = 0; i < list.length; i++) {
		shown += getHiddenNodes(hiddenNodes, list[i], showContentTypes);
	}
	console.log(hiddenNodes);

	if (shown) {
		while (lastMenu !== -1) {
			if (setMenusLength > columnNum) {
				lastMenu = setMenus[columnNum];
			} else {
				lastMenu = getLastMenu(list, hiddenNodes);
			}
			newSetMenus[columnNum] = lastMenu;
			indent = getIndent(list, lastMenu, hiddenNodes);
			column = {};
			column.indent = [];
			column.indent[indentTop - 1] = undefined;
			column.list = list;
			column.index = columnNum;
			if (app.settings.shadowStart && app.settings.shadowStart <= columnNum) {
				column.shadow = true;
			}

			if (lastMenu !== -1) {
				indentTop += indent;
				list.forEach(function (item) {
					item.expanded = false;
				});
				list[lastMenu].expanded = true;
				if (app.settings.shadowStart && list[lastMenu].menuVal) {
					list = list[lastMenu].menuVal;
				} else {
					list = list[lastMenu].children;
				}
			}

			column.list.map(function (currentVal, index) {
				currentVal.path = [];
				path.forEach(function (item, index) {
					currentVal.path[index] = item;
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
}

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

	/**
	 * The selected items in this CRM element
	 * 
	 * @attribute selectedElementPaths
	 * @type Array
	 * @default []
	 */
	selectedElements: [],

	get firstCRMColumn() {
		return (this.firstCRMColumnEl || (this.firstCRMColumnEl = app.editCRM.children[1].children[2]));
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
			getHiddenNodes(hiddenNodes, window.app.settings.crm[i], window.app.crmTypes);
		}
		console.log(path);
		var items = $($(app.editCRM.$.mainCont).children('.CRMEditColumnCont')[path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children;
		var index = path[path.length - 1];
		for (i = 0; i < items.length; i++) {
			if (hiddenNodes[items[i]]) {
				index--;
			}
		}
		return index;
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
		var obj = buildCRMEditObj(setItems);
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
		app.editCRM = this;
		window.app.addEventListener('crmTypeChanged', this._typeChanged);
		_this._typeChanged(true);
	},

	addItem: function () {
		generateItemId(function(itemId) {
			var newIndex = app.settings.crm.length;
			var newItem = {
				name: 'name',
				type: 'link',
				value: [
					{
						value: 'http://www.example.com',
						newTab: true
					}
				],
				id: itemId,
				expanded: false,
				index: newIndex,
				isLocal: true,
				path: [newIndex],
				onContentType: app.crmTypes
			};
			app.crm.add(newItem);

			window.app.editCRM.build(window.app.editCRM.setMenus, false, true);
		});
	},

	selectItems: function() {
		var i;
		var _this = this;
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		if (!this.isSelecting) {
			//Select items
			for (i = 0; i < editCrmItems.length; i++) {
				editCrmItems[i].classList.add('selecting');
			}
			this.selectedElements = [];
			setTimeout(function() {
				_this.isSelecting = true;
			}, 150);
		} else {
			//Remove selected items
			var toRemove = [];
			for (i = 0; i < editCrmItems.length; i++) {
				if (editCrmItems[i].classList.contains('highlighted')) {
					toRemove.push(editCrmItems[i].item.id);
				}
			}

			var j;
			var arr;
			for (i = 0; i < toRemove.length; i++) {
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
			this.selectedElements = [];
			this.build(null, true, false);

			this.isSelecting = false;
		}
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

		var element = row[path[path.length - 1]];
		return element;
	},

	_typeChanged: function (quick) {
		runOrAddAsCallback(app.editCRM.build, app.editCRM, (quick ? [null, true] : []));
	}
});