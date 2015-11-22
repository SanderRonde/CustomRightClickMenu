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
				list.forEach(function (item) {
					item.expanded = false;
				});
				list[lastMenu].expanded = true;
				if (options.settings.shadowStart && list[lastMenu].menuVal) {
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

	/*
	 * The currently selected nodes
	 * 
	 * @attribute selectedNodes
	 * @type Object
	 * @default {}
	 */
	selectedNodes: {},

	get firstCRMColumn() {
		return (this.firstCRMColumnEl || (this.firstCRMColumnEl = options.editCRM.children[1].children[2]));
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
		options.editCRM = this;
		window.options.addEventListener('crmTypeChanged', this._typeChanged);
		chrome.storage.local.get(function (items) {
			_this._typeChanged(true);
		});
	},

	addItem: function () {
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

	_highlightNode: function(mainContChildren, node, highlight) {
		var colChildren = mainContChildren[node.col + 2].children;
		var top = node.row - (colChildren.length - 2);
		try {
			colChildren[colChildren.length - 1].children[0].children[top].children[4].classList[(highlight ? 'add' : 'remove')]('highlighted');
		}
		catch(e) {
			//Node doesn't exist and doesn't need to be highlighted
		}
	},

	_highlightNewNodes: function(editCRM, newNodes) {
		var i;
		console.log(newNodes);
		var mainContChildren = options.editCRM.children[1].children;
		for (i = 0; i < newNodes.highlighted.length; i++) {
			editCRM._highlightNode(mainContChildren, newNodes.highlighted[i], true);
		}
		for (i = 0; i < newNodes.unhighlighted.length; i++) {
			editCRM._highlightNode(mainContChildren, newNodes.unhighlighted[i], false);
		}
	},

	_getSelectedNodes: function(editCRM) {
		var newNodes = [];
		var unhighlightedNodes = [];

		var dragAreaPos = editCRM.dragAreaPos;
		//Set mouse start row
		dragAreaPos.row = dragAreaPos.row || Math.floor(dragAreaPos.scrollLeftStart / 200);
		//Set mouse start col
		dragAreaPos.col = dragAreaPos.col || Math.floor(dragAreaPos.scrollTopStart / 50);

		var row = Math.floor(dragAreaPos.dx / 200);
		var col = Math.floor(dragAreaPos.dy / 50);

		console.log(dragAreaPos);
		console.log('row: ' + row + ', col: ' + col + ', dragRow: ' + dragAreaPos.row + ', dragCol: ' + dragAreaPos.col);

		var forCol;
		var forRow;
		var isHighlighted;
		var colNonRelative = col + dragAreaPos.col;
		var rowNonRelative = row + dragAreaPos.row;
		for (forCol = 0; forCol < options.editCRM.crm.length; forCol++) {
			isHighlighted = (col >= 0 ? (forCol >= dragAreaPos.col && forCol <= colNonRelative) : (forCol <= dragAreaPos.col && forCol >= colNonRelative));
			for (forRow = options.editCRM.crm[forCol].indent.length; forRow < options.editCRM.crm[forCol].indent.length + options.editCRM.crm[forCol].list.length; forRow++) {
				editCRM.selectedNodes[forCol] = editCRM.selectedNodes[forCol] || {};
				if (isHighlighted) {
					if (row >= 0 ? (forRow > dragAreaPos.row && forRow < rowNonRelative) : (forRow < dragAreaPos.row && forRow > rowNonRelative)) {
						console.log('yep');
						if (!editCRM.selectedNodes[forCol][forRow]) {
							editCRM.selectedNodes[forCol][forRow] = true;
							newNodes.push({
								col: forCol,
								row: forRow
							});
						}
						console.log({
								col: forCol,
								row: forRow
							});
					}
					else {
						editCRM.selectedNodes[forCol][forRow] = false;	
					}
				}
				else {
					editCRM.selectedNodes[forCol][forRow] = false;
				}
			}
		}
		return {
			highlighted: newNodes,
			unhighlighted: unhighlightedNodes
		};
	},

	_handleDragPosChange: function (event, editCRM, scroll) {
		var dragAreaStyle = editCRM.dragAreaEl.style;
		var eventDetails = event.detail;
		var dragAreaPos = editCRM.dragAreaPos;
		var dy = (eventDetails.dy + (dragAreaPos.scrollTop - dragAreaPos.scrollTopStart));
		var dx = (eventDetails.dx + (dragAreaPos.scrollLeft - dragAreaPos.scrollLeftStart));
		dragAreaPos.dy = dy;
		dragAreaPos.dx = dx;
		if (eventDetails.ddy !== 0 || scroll === 'y') {
			if (dy > 0) {
				dragAreaStyle.top = ((dragAreaPos.Y + (dragAreaPos.scrollTopStart - dragAreaPos.scrollTop))) + 'px';
				dragAreaStyle.height = (dy) + 'px';
			} else if (dy < 0 || scroll === 'y') {
				dragAreaStyle.top = (eventDetails.y) + 'px';
				dragAreaStyle.height = (-dy) + 'px';
			}
		}
		if (eventDetails.ddx !== 0 || scroll === 'x') {
			if (dx > 0) {
				dragAreaStyle.left = (dragAreaPos.X + (dragAreaPos.scrollLeftStart - dragAreaPos.scrollLeft)) + 'px';
				dragAreaStyle.width = (dx) + 'px';
			} else if (dx < 0 || scroll === 'x') {
				dragAreaStyle.left = (eventDetails.x) + 'px';
				dragAreaStyle.width = (-dx) + 'px';
			}
		}
	},

	_createScrollHandler: function (editCRM) {
		return function () {
			if (document.body.scrollTop !== editCRM.dragAreaPos.scrollTop) {
				editCRM.dragAreaPos.scrollTop = document.body.scrollTop;
				editCRM._handleDragPosChange(editCRM.lastDragEvent, editCRM, 'y');
			}
			else if (editCRM.dragAreaPos.scrollLeft !== -editCRM.firstCRMColumn.getBoundingClientRect().left) {
				editCRM.dragAreaPos.scrollLeft = -editCRM.firstCRMColumn.getBoundingClientRect().left;
				editCRM._handleDragPosChange(editCRM.lastDragEvent, editCRM, 'x');
			}
			editCRM._highlightNewNodes(editCRM, editCRM._getSelectedNodes(editCRM));
		}
	},

	_handleSelect: function (event) {
		//Create a rectangle
		var editCRM = options.editCRM;
		editCRM.lastDragEvent = event;
		var eventDetails = event.detail;
		if (eventDetails.state === 'start') {
			document.body.style.WebkitUserSelect = 'none';
			var dragEl = document.createElement('div');
			var dragElStyle = dragEl.style;
			dragElStyle.position = 'fixed';
			dragElStyle.backgroundColor = 'rgba(50,50,50,0.3)';
			dragElStyle.pointerEvents = 'none';
			dragElStyle.left = eventDetails.x + 'px';
			var top = document.body.scrollTop;
			var left = editCRM.firstCRMColumn.getBoundingClientRect().left;
			dragElStyle.top = (top + eventDetails.y) + 'px';
			dragElStyle.width = dragElStyle.height = '30px';
			document.body.appendChild(dragEl);
			editCRM.dragAreaEl = dragEl;
			console.log(dragEl);
			editCRM.dragAreaPos = {
				X: eventDetails.x,
				Y: eventDetails.y,
				scrollTopStart: top,
				scrollTop: top,
				scrollLeftStart: -left,
				scrollLeft: -left
			};
			console.log(left);
			console.log(editCRM.dragAreaPos);
			var scrollHandler = editCRM._createScrollHandler(editCRM);
			editCRM.scrollHandler = scrollHandler;
			editCRM.children[1].addEventListener('scroll', scrollHandler);
			document.addEventListener('scroll', scrollHandler);
			editCRM._getSelectedNodes(editCRM);
		}
		else if (eventDetails.state === 'track') {
			editCRM._handleDragPosChange(event, editCRM, false);
			editCRM._highlightNewNodes(editCRM, editCRM._getSelectedNodes(editCRM));
		} else {
			editCRM.dragAreaEl.remove();
			editCRM.children[1].removeEventListener('scroll', editCRM.scrollHandler);
			document.removeEventListener('scroll', editCRM.scrollHandler);
			editCRM.dragAreaPos = null;
			editCRM.scrollHandler = null;
			editCRM.selectedNodes = {};
		}
	},

	_deselectNodes: function () {

	},

	_typeChanged: function (quick) {
		runOrAddAsCallback(options.editCRM.build, options.editCRM, (quick ? [null, true] : []));
	}
});