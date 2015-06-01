/// <reference path="../../../scripts/_references.js"/>
/// <reference path="../../../scripts/jquery-2.1.4.min.map" />
/**
 * A shorthand name for chrome.storage.sync
 */
var storage = chrome.storage.sync;
var options = document.getElementsByTagName("crm-options")[0];
var contextMenuItems = {'example': { 'name': 'example' } };

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

/**
 * Builds one column of the crm settings edit item
 * 
 * @param index Value whose children to take.
 * @param cont The container of the items.
 * @param parentIndex The index of the parent in its parent.
 * @param isMenu Whether the column to build is a menu or the first column
 */
function buildColumn(index, cont, parentIndex, isMenu) {

	var column = $('<div class="CRMEditColumn"></div>')
		.css('margin-top', (50 * parentIndex) + 'px')
		.appendTo(cont);

	$('<paper-shadow>' +
			'<div class="shadow-top"></div>' +
			'</paper-shadow>')
		.appendTo(column);

	//Find last menu if it exists
	var lastMenu = -1;
	var i;
	var items = [];
	if (index === -1) {
		for (i = 0; i < settings.crm.length; i++) {
			items[i] = i;
		}
	} else {
		items = settings.crm[index].children;
	}
	for (i = 0; i < items.length; i++) {
		if ((isMenu ? items[i].type : settings.crm[items[i]].type) === 'menu') {
			lastMenu = i;
		}
	}

	var value;
	var className;
	for (i = 0; i < items.length; i++) {
		value = (isMenu ? items[i] : settings.crm[items[i]]);
		switch (value.type) {
			case 'link':
				className = 'CRMEditLink';
				break;
			case 'script':
				className = 'CRMEditScript';
				break;
			case 'divider':
				className = 'CRMEditDivider';
				break;
			default:
				className = 'CRMEditMenu';
				console.log(lastMenu);
				if (i === lastMenu) {
					buildColumn((isMenu ? i : items[i]), cont, i, true);
				}
				break;
		}
		$('<div class="' + className + '"><div class="dragger"></div>' +
				'<div class="editContent">' +
				'<paper-ripple>' +
				'<div class="bg"></div>' +
				'<div class="waves"></div>' +
				'<div class="button-content">' +
				value.name +
				'</div>' +
				'</paper-ripple></div>' +
				(value.type === "menu" ?
					'<div class="menuArrow"><div class="menuArrowArrow"></div></div>'
					: '') + '</div>')
			.appendTo(column)
			.mousedown(function (e) {
				ripplestuff($(this).find("paper-ripple")[0], e, false);
			});
	}
}

/**
 * Builds crm settings and places it in the options page
 */
function buildCrmSettings() {
	$(".CRMEditCont").remove();
	var cont = $('<div class="CRMEditCont"></div>')
		.appendTo($('.customRightClickMenuEdit'));

	buildColumn(-1, cont, 0, false);
}

/**
 * @fn function addDefaultLink()
 *
 * @brief Adds default link to the CRM
 */
function addDefaultLink() {
	var defaultLinkItem = $(this).parent().parent();
	console.log(defaultLinkItem);
	var link = defaultLinkItem.find(".defaultLinkHref").html().trim();
	var name = defaultLinkItem.find("input").val();
	var newItem = new CRMItem("link", link, name);
	settings.crm._add(newItem);
}

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
	return function () {
		window.open(toOpen, "_blank");
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
	item.callback = scriptHandler(toAdd.value);
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
	var item = {};
	item = "---------";
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
	console.log("menu", iterator);
	var item = {};
	item.name = toAdd.name;
	var childItems = {};
	console.log(toAdd);
	console.log(toAdd.children);
	for (var i = 0; i < toAdd.children.length; i++) {
		switch (toAdd.children[i].type) {
			case "link":
				childItems = addLink(childItems, toAdd.children[i], i);
				break;
			case "script":
				childItems = addScript(childItems, toAdd.children[i], i);
				break;
			case "divider":
				childItems = addDivider(childItems, toAdd.children[i], i);
				break;
			case "menu":
				childItems = addMenu(childItems, toAdd.children[i], i);
				break;
		}
	}
	console.log(item);
	console.log(childItems);
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
	for (var i = 0; i < crm.length; i++) {
		switch (crm[i].type) {
		case "link":
			items = addLink(items, crm[i], i);
			break;
		case "script":
			items = addScript(items, crm[i], i);
			break;
		case "divider":
			items = addDivider(items, crm[i], i);
			break;
		case "menu":
			items = addMenu(items, crm[i], i);
			break;
		}
	}

	contextMenuItems = items;
}

/**
 * @fn function main()
 *
 * @brief Main function, called when javascript is ready to be executed
 */
function main() {
	console.log("main");
	buildContextMenu();
	$.contextMenu({
		selector: 'body',
		build: function () {
			return {
				items: contextMenuItems
			};
		}
	});
	//bindEvents();
	//buildCrmSettings();
}

/**
 * Inserts an the value into given array
 *
 * @param toAdd    Value to add.
 * @param target   Array to add into.
 * @param position The positionat which to add.
 *
 * @return Complete array
 */
function insertInto(toAdd, target, position) {
	console.log(toAdd);
	console.log(target);
	console.log(position);
	var temp1;
	var temp2 = toAdd;
	for (var i = position; i < target.length; i++) {
		temp1 = target[i];
		target[i] = temp2;
		temp2 = temp1;
	}
	return target;
}

Polymer({
	is: "crm-options",

	properties: {
		settings: {
			type: Object,
			notify: true
		}
	},

	/**
	 * Uploads this object to chrome.storage
	 */
	upload: function() {
		chrome.storage.sync.set(this.settings);
		buildContextMenu();
	},

	ready: function() {
		var el = this;
		this.crm.parent = this;

		function callback(items) {
			el.settings = items;
			main();
		}

		chrome.storage.sync.get(callback);
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
		/**
		 * Adds value to the CRM
		 *
		 * @param value    The value to add
		 * @param position The position to add it in
		 */
		add: function(value, position) {
			if (position === "first") {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm, 0);
			} else if (position === "last" || position === undefined) {
				this.parent.settings.crm[this.parent.settings.crm.length] = value;
			} else {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm, position);
			}
			this.parent.upload();
		}
	}
});