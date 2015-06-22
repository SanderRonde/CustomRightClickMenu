///<reference path="../../../scripts/_references.js"/>
'use strict';
var options;
options.settings = options.settings;
options.settings.crm = options.settings.crm;

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
	//Find last menu to auto-expand
	list.forEach(function (item, index) {
		if (item.type === 'menu') {
			lastMenu = index;
		}
	});
	return lastMenu;
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
	var setMenusLength = setMenus.length,
		crmEditObj = [],
		path = [],
		indentTop = 0,
		lastMenu = -2,
		columnNum = 0,
		column;

	var list = options.settings.crm;

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

		if (lastMenu !== -1) {
			indentTop += lastMenu;
			list.forEach(function(item) {
				item.expanded = false;
			});
			list[lastMenu].expanded = true;
			list = list[lastMenu].children;
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

Polymer({
	is: 'edit-crm',

	properties: {
		crm: {
			type: Array,
			value: [],
			notify: true
		}
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
		var el = this;
		options.addListener({'type': 'crm', 'function': el.build});
		this.build();
		this.show = false;
		options.editCRM = this;
	}

});