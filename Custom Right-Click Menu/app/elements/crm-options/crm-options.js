/// <reference path="../../../scripts/_references.js"/>
/// <reference path="../../../scripts/jquery-2.1.4.min.map" />
/**
 * A shorthand name for chrome.storage.sync
 */
var storage = chrome.storage.sync;
var options = document.getElementsByTagName('crm-options')[0];
var contextMenuItems = {'example': { 'name': 'example' } };

/**
 * 
 * @param elements Array of elements to animate
 * @param callerEl The element from which this is called
 * @param callback The function to call after animating
 * @param toAnimate An array of animations
 * @param duration The duration of the animation
 */
function AnimationIn(elements, callerEl, callback, toAnimate, duration) {
	this.elements = elements;
	this.callback = callback;
	this.startTime = null;
	this.passedHalf = false;
	this.type = 'in';
	this.toAnimate = toAnimate;
	this.callerEl = callerEl;
	this.continue = true;
	this.duration = duration || 300;

	var thisAnimation = this;
	this.animation = function (timestamp) {
		if (thisAnimation.continue) {
			var i;
			if (!thisAnimation.startTime) {
				var firstElement = thisAnimation.elements[0];
				var firstAnimation = thisAnimation.toAnimate[0];
				var style = '';
				for (i = 0; i < firstAnimation.style.length; i++) {
					if (firstAnimation.style[i].match(/[A-Z]/)) {
						style += '-' + firstAnimation.style[i].toLowerCase();
					} else {
						style += firstAnimation.style[i];
					}
				}
				var currentProgress = parseInt($(firstElement).css(style), 10);
				var progressFromStart = currentProgress - firstAnimation.start;
				var percentage = progressFromStart / firstAnimation.progress;
				thisAnimation.startTime = timestamp - (thisAnimation.duration * percentage);
			}
			thisAnimation.diff = timestamp - thisAnimation.startTime;
			if (thisAnimation.diff < thisAnimation.duration) {
				thisAnimation.diffRelative = thisAnimation.diff / thisAnimation.duration;
				if (thisAnimation.passedHalf) {
					thisAnimation.newVal = Math.sqrt(thisAnimation.diffRelative);
				}
				else {
					thisAnimation.square = (thisAnimation.diffRelative * thisAnimation.diffRelative) * 2;
					if (thisAnimation.square >= 0.63) {
						thisAnimation.passedHalf = true;
					}
					thisAnimation.newVal = thisAnimation.square;
				}
				for (i = 0; i < thisAnimation.toAnimate.length; i++) {
					thisAnimation.elements[i].style[thisAnimation.toAnimate[i].style] = (thisAnimation.toAnimate[i].start) + (thisAnimation.toAnimate[i].progress * thisAnimation.newVal);
				}
				window.requestAnimationFrame(thisAnimation.animation);
			}
			else {
				thisAnimation.startTime = null;
				for (i = 0; i < thisAnimation.toAnimate.length; i++) {
					thisAnimation.elements[i].style[thisAnimation.toAnimate[i].style] = (thisAnimation.toAnimate[i].start + thisAnimation.toAnimate[i].progress);
				}
				thisAnimation.passedHalf = false;
				thisAnimation.callback(thisAnimation.callerEl);
			}
		}
	}

	this.start = function () {
		this.continue = true;
		window.requestAnimationFrame(this.animation);
	}

	this.stop = function () {
		this.continue = false;
	}
}

/**
 * 
 * @param elements The elements to animate
 * @param callerEl The element from which this is called
 * @param callback The function to call after animating
 * @param toAnimate An array of animations
 * @param duration The duration of the animation
 */
function AnimationOut(elements, callerEl, callback, toAnimate, duration) {
	this.callback = callback;
	this.elements = elements;
	this.startTime = null;
	this.passedHalf = false;
	this.type = 'out';
	this.toAnimate = toAnimate;
	this.callerEl = callerEl;
	this.continue = true;
	this.duration = duration || 300;

	var thisAnimation = this;

	this.animation = function (timestamp) {
		if (thisAnimation.continue) {
			var i;
			if (!thisAnimation.startTime) {
				var firstElement = thisAnimation.elements[0];
				var firstAnimation = thisAnimation.toAnimate[0];
				var style = '';
				for (i = 0; i < firstAnimation.style.length; i++) {
					if (firstAnimation.style[i].match(/[A-Z]/)) {
						style += '-' + firstAnimation.style[i].toLowerCase();
					} else {
						style += firstAnimation.style[i];
					}
				}
				var currentProgress = parseInt($(firstElement).css(style), 10);
				var progressFromStart = currentProgress - firstAnimation.start;
				var percentage = progressFromStart / firstAnimation.progress;
				thisAnimation.startTime = timestamp - (thisAnimation.duration * percentage);
			}
			thisAnimation.diff = timestamp - thisAnimation.startTime;
			if (thisAnimation.diff < thisAnimation.duration) {
				thisAnimation.diffRelative = thisAnimation.diff / thisAnimation.duration;
				if (thisAnimation.passedHalf) {
					thisAnimation.newVal = Math.sqrt(thisAnimation.diffRelative);
				}
				else {
					thisAnimation.square = (thisAnimation.diffRelative * thisAnimation.diffRelative) * 2;
					if (thisAnimation.square >= 0.63) {
						thisAnimation.passedHalf = true;
					}
					thisAnimation.newVal = thisAnimation.square;
				}
				for (i = 0; i < thisAnimation.toAnimate.length; i++) {
					thisAnimation.elements[i].style[thisAnimation.toAnimate[i].style] = (thisAnimation.toAnimate[i].start) + (thisAnimation.toAnimate[i].progress * thisAnimation.newVal);
				}
				window.requestAnimationFrame(thisAnimation.animation);
			}
			else {
				thisAnimation.startTime = null;
				for (i = 0; i < thisAnimation.toAnimate.length; i++) {
					thisAnimation.elements[i].style[thisAnimation.toAnimate[i].style] = (thisAnimation.toAnimate[i].start + thisAnimation.toAnimate[i].progress);
				}
				thisAnimation.passedHalf = false;
				thisAnimation.callback(thisAnimation.callerEl);
			}
		}
	}

	this.start = function () {
		this.continue = true;
		window.requestAnimationFrame(this.animation);
	}

	this.stop = function () {
		this.continue = false;
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
	return function () {
		window.open(toOpen, '_blank');
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
 * @fn function main()
 *
 * @brief Main function, called when javascript is ready to be executed
 */
function main() {
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

	properties: {
		settings: {
			type: Object,
			notify: true,
			observer: 'settingsChanged'
		}
	},

	/**
	 * @fn settingsChanged: function ()
	 *
	 * @brief The settings object has changed, launch al listeners
	 */
	settingsChanged: function() {
		var crmChanged = false;
		if (this.prevCRM !== this.settings.crm) {
			crmChanged = true;
		}
		this.prevCRM = this.settings.crm;
		this.elementListeners.forEach(function(item) {
			if (item.type === 'settings' || crmChanged) {
				item.function();
			}
		});
	},

	/**
	 * @fn addListener: function(callback)
	 *
	 * @brief Adds a listener for the settings or crm object
	 *
	 * @param data Data object.
	 */
	addListener: function(data) {
		this.elementListeners.push(data);
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

		setTimeout(function () {
			el.show = true;
			el.item = {'type': 'dummy'};
		}, 1500);
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
			if (position === 'first') {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm, 0);
			} else if (position === 'last' || position === undefined) {
				this.parent.settings.crm[this.parent.settings.crm.length] = value;
			} else {
				this.parent.settings.crm = insertInto(value, this.parent.settings.crm, position);
			}
			this.parent.upload();
		},

		/**
		 * Moves a value in the CRM from one place to another
		 *
		 * @param toMove    The value to move's location (in path form)
		 * @param target	Where to move the item to (in path form)
		 * @param sameColumn Whether the item has stayed in the same column
		 */
		move: function (toMove, target, sameColumn) {
			var i;
			var toMoveContainer = toMove;
			var toMoveIndex = toMoveContainer.splice(toMove.length - 1, 1);

			var toMoveItem = options.settings.crm;
			for (i = 0; i < toMoveContainer.length; i++) {
				if (options.settings.shadowStart && toMoveItem[toMoveContainer[i]].menuVal) {
					toMoveItem = toMoveItem[toMoveContainer[i]].menuVal;
				}
				else {
					toMoveItem = toMoveItem[toMoveContainer[i]].children;
				}
			}
			toMoveContainer = toMoveItem;
			toMoveItem = toMoveItem[toMoveIndex];

			var newTarget = options.settings.crm;
			var targetContainer = target;
			var targetIndex = targetContainer.splice(target.length - 1, 1);
			for (i = 0; i < targetContainer.length; i++) {
				if (options.settings.shadowStart && newTarget[targetContainer[i]].menuVal) {
					newTarget = newTarget[targetContainer[i]].menuVal;
				} else {
					newTarget = newTarget[targetContainer[i]].children;
				}
			}

			if (sameColumn && toMoveIndex > targetIndex) {
				insertInto(toMoveItem, newTarget, targetIndex);
				toMoveContainer.splice(parseInt(toMoveIndex, 10) + 1, 1);
			}
			else {
				insertInto(toMoveItem, newTarget, targetIndex);
				toMoveContainer.splice(toMoveIndex, 1);
			}
			options.upload();
		}
	}
});