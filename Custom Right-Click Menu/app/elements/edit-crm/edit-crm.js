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
 *
 * @return The last menu on the given list.
 */
function getLastMenu(list) {
	var lastMenu = -1;
	var lastFilledMenu = -1;
	//Find last menu to auto-expand
	if (list) {
		list.forEach(function (item, index) {
			if (item.type === 'menu' || (options.settings.shadowStart && item.menuVal)) {
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
 * @param {Object} crm - The CRM to check
 * @param {boolean[]} showContentTypes - Array of which content types to show
 * @returns {Object} An object in which each key is a path of a crm node and the value (true or false) tells whether to show it or not.
 */
function getHiddenNodes(crm, showContentTypes) {
	
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
	var setMenusLength = setMenus.length,
		crmEditObj = [],
		path = [],
		indentTop = 0,
		lastMenu = -2,
		columnNum = 0,
		column;

	var list = options.settings.crm;

	//Hide all nodes that should be hidden
	var hiddenNodes = getHiddenNodes(list, showContentTypes);

	while (lastMenu !== -1) {
		if (setMenusLength > columnNum) {
			lastMenu = setMenus[columnNum];
		}
		else {
			lastMenu = getLastMenu(list);
		}
		column = {};
		column.indent = [];
		column.indent[indentTop - 1] = undefined;
		column.list = list;
		column.index = columnNum;
		if (options.settings.shadowStart && options.settings.shadowStart <= columnNum) {
			column.shadow = true;
		}

		if (lastMenu !== -1) {
			indentTop += lastMenu;
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

		path.push(lastMenu);
		crmEditObj.push(column);
		columnNum++;
	}

	return crmEditObj;
}

window.Polymer({
	is: 'edit-crm',

	properties: {
		crm: {
			type: Array,
			value: [],
			notify: true
		}
	},

	listeners: {
		'crmTypeChanged': '_typeChanged'
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
	build: function (setItems) {
		setItems = setItems || [];
		var obj = buildCRMEditObj(setItems);
		this.crm = obj;
		this.notifyPath('crm', this.crm);
		return obj;
	},

	ready: function() {
		var _this = this;
		options.editCRM = this;
		window.options.addEventListener('crmTypeChanged', this._typeChanged);
		chrome.storage.local.get(function(items) {
			_this._typeChanged({
				type: items.selectedCrmType
			});
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
			path: [newIndex]
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

	//TODO implement select and remove

	_typeChanged: function () {
		runOrAddAsCallback(options.editCRM.build, options.editCRM, [options.crmTypes]);
	}
});