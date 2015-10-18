/// <reference path="../../../scripts/_references.js"/>
/// <reference path="~/app/elements/crm-options/crm-options.js" />
'use strict';
var options;
options.settings = options.settings;

/**
 * @fn function getLastMenu(list)
 *
 * @brief Gets the last menu of the list.
 *
 * @param list The list.
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
			if ((item.type === 'menu' || (options.settings.shadowStart && item.menuVal) && !hidden[item.path])) {
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
	if (node.children) {
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
 * @param setMenus An array of menus that are set to be opened (by user input).
 *
 * @return the CRM edit object
 */
function buildCRMEditObj(setMenus) {
	var showContentTypes = options.crmTypes;
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

	var list = options.settings.crm;
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
			if (options.settings.shadowStart && options.settings.shadowStart <= columnNum) {
				column.shadow = true;
			}

			if (lastMenu !== -1) {
				indentTop += indent;
				list.forEach(function(item) {
					item.expanded = false;
				});
				list[lastMenu].expanded = true;
				if (options.settings.shadowStart && list[lastMenu].menuVal) {
					list = list[lastMenu].menuVal;
				} else {
					list = list[lastMenu].children;
				}
			}

			column.list.map(function(currentVal, index) {
				currentVal.path = [];
				path.forEach(function(item, index) {
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
		}
	},

	listeners: {
		'crmTypeChanged': '_typeChanged'
	},

	_isCrmEmpty: function(crm, crmLoading) {
		return !crmLoading && crm.length === 0;
	},

	getCurrentTypeIndex: function(path) {
		var i;
		var hiddenNodes = {};
		for (i = 0; i < window.options.settings.crm.length; i++) {
			getHiddenNodes(hiddenNodes, window.options.settings.crm[i], window.options.crmTypes);
		}
		console.log(path);
		var items = $($(options.editCRM.$.mainCont).children('.CRMEditColumnCont')[path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children;
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
	 * @param setItems Set choices for menus by the user
	 * 
	 * @return The object to be sent to Polymer
	 */
	build: function(setItems, quick, superquick) {
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
			setTimeout(function() {
				_this.crmLoading = false;
			}, 50);
		}

		if (superquick) {
			func();
		} else {
			this.currentTimeout = window.setTimeout(func, quick ? 150 : 1000);
		}
		return obj;
	},

	ready: function() {
		var _this = this;
		options.editCRM = this;
		window.options.addEventListener('crmTypeChanged', this._typeChanged);
		chrome.storage.local.get(function(items) {
			_this._typeChanged(true);
		});
	},

	addItem: function() {
		var newIndex = options.settings.crm.length;
		var newItem = {
			name: 'name',
			type: 'link',
			value: [
				{
					value: 'http://www.example.com',
					newTab: true
				}
			],
			expanded: false,
			index: newIndex,
			isLocal: true,
			path: [newIndex],
			onContentType: options.crmTypes
		};
		options.crm.add(newItem);

		//Artificially add a new item
		var firstColumnChildren = options.editCRM.$.mainCont.children[0].children[1].children;
		var newElement = $('<edit-crm-item class="wait"></edit-crm-item>').insertBefore(firstColumnChildren[firstColumnChildren.length - 1]);
		newElement = newElement[0];
		newElement.item = newItem;
		newElement.index = newIndex;
		newElement.classList.toggle('wait');
		newElement.classList.add('style-scope');
		newElement.classList.add('edit-crm');
		newElement.ready();
	},

	//TODO implement remove

	_handleDragPosChange: function(event, editCRM, scroll) {
		var dragAreaStyle = editCRM.dragAreaEl.style;
		var eventDetails = event.detail;
		if (eventDetails.ddy !== 0 || scroll) {
			var dragHeight = editCRM.dragAreaPos.scrollChange + eventDetails.dy;
			if (dragHeight > 0) {
				dragAreaStyle.height = (editCRM.dragAreaPos.scrollChange + eventDetails.dy) + 'px';
			} else {
				dragAreaStyle.top = (eventDetails.y + editCRM.dragAreaPos.scrollTop) + 'px';
				dragAreaStyle.height = (dragHeight < 0 ? -dragHeight : editCRM.dragAreaPos.scrollChange) + 'px';
			}
		}
		if (!scroll && eventDetails.ddx !== 0) {
			if (eventDetails.dx > 0) {
				dragAreaStyle.width = eventDetails.dx + 'px';
			} else {
				dragAreaStyle.left = eventDetails.x + 'px';
				dragAreaStyle.width = (eventDetails.dx < 0 ? -eventDetails.dx + 'px' : 0);
			}
		}
	},

	_createScrollHandler: function(event, editCRM) {
		return function () {
			var scrollChange = document.body.scrollTop - editCRM.dragAreaPos.scrollTop;
			editCRM.dragAreaPos.scrollChange += scrollChange;
			editCRM.dragAreaPos.scrollTop = document.body.scrollTop;
			editCRM._handleDragPosChange(event, editCRM, );
		}
	},

	_handleSelect: function (event) {
		//Create a rectangle
		var editCRM = options.editCRM;
		var eventDetails = event.detail;
		console.log('x:' + eventDetails.x);
		console.log('y:' + eventDetails.y);
		if (eventDetails.state === 'start') {
			document.body.style.WebkitUserSelect = 'none';
			var dragEl = document.createElement('div');
			var dragElStyle = dragEl.style;
			dragElStyle.position = 'absolute';
			dragElStyle.backgroundColor = 'rgba(50,50,50,0.3)';
			dragElStyle.left = eventDetails.x + 'px';
			dragElStyle.top = (document.body.scrollTop + eventDetails.y) + 'px';
			dragElStyle.width = dragElStyle.height = '30px';
			document.body.appendChild(dragEl);
			editCRM.dragAreaEl = dragEl;
			editCRM.dragAreaPos = {
				X: eventDetails.x,
				Y: eventDetails.y,
				scrollTop: document.body.scrollTop,
				scrollChange: 0
			};
			var scrollHandler = editCRM._createScrollHandler(event, editCRM);
			editCRM.scrollHandler = scrollHandler;
			document.addEventListener('scroll', scrollHandler);
		}
		else if (eventDetails.state === 'track') {
			editCRM._handleDragPosChange(event, editCRM, false);
		} else {
			editCRM.dragAreaEl.remove();
			document.removeEventListener('scroll', editCRM.scrollHandler);
			editCRM.dragAreaPos = null;
			editCRM.scrollHandler = null;
		}
	},

	_deselectNodes: function () {
		
	},

	_typeChanged: function(quick) {
		runOrAddAsCallback(options.editCRM.build, options.editCRM, (quick ? [null, true] : []));
	}
});