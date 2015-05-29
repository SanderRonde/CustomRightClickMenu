/// <reference path="../../scripts/_references.js"/>
/// <reference path="../../scripts/jquery-2.1.4.min.map" />

	/**
	 * @brief The main settings object
	 */
	var settings;
	var storage = chrome.storage.sync;

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
	 * @fn function setValue(key, value)
	 *
	 * @brief Sets a value to the storage
	 *
	 * @param key   The key.
	 * @param value The value.
	 */
	function setValue(key, value) {
		var options = settings;
		options[key] = value;
		storage.set(options);
		settings._update();
		console.log(settings);
	}

	///**
	// * @fn function createParamsString(params, order)
	// *
	// * @brief Creates the parameters string to be added to the to be executed
	// * 		  function
	// *
	// * @param params The static parameters to be added.
	// * @param order  The order in which every parameter is applied.
	// *
	// * @return The parameters string
	// */
	//function createParamsString(params, order) {
	//	var paramsDefault = "";
	//	for (var i = 0; i < order.length; i++) {
	//		if (i !== 0) {
	//			paramsDefault += ", ";
	//		}
	//		if (order[i].type === "array") {
	//			paramsDefault += "arrays[" + i + "][i]";
	//		}
	//		else {
	//			paramsDefault += "params[" + order[i].index + "]";
	//		}
	//	}
	//	return paramsDefault;
	//}

	///**
	// * @fn function execForArray(toExecute, arrays, params, order)
	// *
	// * @brief Executes function toExecute from index 0 to arrays[0].length
	// *		and passes the I'th value for every array and also passes
	// *		some static values passed in params as an array. This then
	// *		passes them in the order specified in order, see param order
	// *		for further info
	// *
	// * @param toExecute The function to execute.
	// * @param arrays    Array of arrays for which to execute the given function
	// * @param params    Static parameters in array of all these parameters
	// * @param order	    The order. Given as an array of objects, with each
	// * 					object having a type, being "array" or "param" and
	// * 					an index, indicating the index in either the arrays
	// * 					or params array.
	// */
	//function execForArray(toExecute, arrays, params, order) {
	//	var paramsDefault = createParamsString(params, order);
	//	var parameters;
	//	for (var i = 0; i < arrays[0].length; i++) {
	//		parameters = paramsDefault;
	//		console.log(arrays);
	//		console.log(parameters);
	//		eval("toExecute(" + parameters + ")");
	//	}
	//}

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
		item.value = toAdd.value;
		item.callback = function (index) {
			window.open(settings.crm[index].value);
		}
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
		item.value = toAdd.value;
		item.callback = function (index) {
			eval(settings.crm[index].value);
		}
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
		item.name = toAdd.name;
		item.value = "----------";
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
			console.log(settings.crm[i]);
			console.log(settings.crm[i].type);
			switch (settings.crm[i].type) {
			case "link":
				childItems = addLink(childItems, settings.crm[i], i);
				break;
			case "script":
				childItems = addScript(childItems, settings.crm[i], i);
				break;
			case "divider":
				childItems = addDivider(childItems, settings.crm[i], i);
				break;
			case "menu":
				childItems = addMenu(childItems, settings.crm[i], i);
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
	 * @fn function buildPageCrm()
	 *
	 * @brief Builds this page's crm
	 */
	function buildPageCrm() {
		var items = {};
		for (var i = 0; i < settings.crm.length; i++) {
			switch (settings.crm[i].type) {
				case "link":
					items = addLink(items, settings.crm[i], i);
					break;
				case "script":
					items = addScript(items, settings.crm[i], i);
					break;
				case "divider":
					items = addDivider(items, settings.crm[i], i);
					break;
				case "menu":
					items = addMenu(items, settings.crm[i], i);
					break;
			}
		}

		console.log(items);

		$.contextMenu({
			'className': 'contextMenu',
			'selector': 'body',
			'items': items
		});
	}

	/**
	 * Builds one column of the crm settings edit item
	 * 
	 * @param index Value whose children to take.
	 * @param cont The container of the items.
	 * @param parentIndex The index of the parent in its parent.
	 */
	function buildColumn(index, cont, parentIndex) {

		var column = $('<div class="CRMEditColumn"></div>')
			.css('margin-top',(100 * parentIndex) + 'px')
			.appendTo(cont);

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
		console.log(items);
		for (i = 0; i < items.length; i++) {
			if (items[i].type === 'menu') {
				lastMenu = i;
			}
		}

		var className;
		for (i = 0; i < items.length; i++) {
			console.log(settings.crm[items[i]].type);
			switch (settings.crm[items[i]].type) {
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
				buildColumn(items[i], cont, i);
				break;
			}
			$('<div class="' + className + '"></div>')
				.appendTo(column);
		}
	}

	/**
	 * Builds crm settings and places it in the options page
	 */
	function buildCrmSettings() {
		var cont = $('<div class="CRMEditCont"></div>')
			.appendTo($('.customRightClickMenuEdit'));

		buildColumn(-1, cont, 0);
	}

	/**
	 * @fn function CRMItem(type, value)
	 *
	 * @brief An item in the custom right-click menu
	 *
	 * @param type  The type of the item.
	 * @param value The value of the item.
	 * @param name The name of the item.
	 * @param additionalParams Additional parameters in object form
	 */
	// ReSharper disable once InconsistentNaming
	function CRMItem(type, value, name, additionalParams) {
		if (!isEmpty(additionalParams)) {
			for (var key in additionalParams) {
				if (additionalParams.hasOwnProperty(key)) {
					this[key] = additionalParams[key];
				}
			}
		}
		this.type = type || "link";
		this.value = value || "";
		this.name = name || "";
		this.index;
		this.parent;
		this.children;
		if (type === "menu") {
			this.children = value;
		}
	}

	/**
	 * @fn function CustomRightClickMenu(values)
	 *
	 * @brief The custom right-click menu object
	 *
	 * @param values The default values to set it with
	 */
	function CustomRightClickMenu(values) {
		this.length = values.length || 1;
		for (var i = 0; i < values.length; i++) {
			this[i] = values[i];
		}
		this._uploadOnUpdate = true;

		/**
		 * @fn this._export = function ()
		 *
		 * @brief Exports this object
		 *
		 * @return The object with all values in it
		 */
		this._export = function () {
			var exportVals = [];
			for (var i = 0; i < this.length; i++) {
				exportVals[i] = {};
				for (var key in this[i]) {
					if (exportVal.hasOwnProperty(key)) {
						exportVals[i][key] = exportVal[key];
					}
				}
			}
			return exportVals;
		};

		/**
		 * @fn this._upload = function ()
		 *
		 * @brief Uploads this object to chrome.storage
		 */
		this._upload = function () {
			settings._upload();
			buildPageCrm();
			buildCrmSettings();
		}

		/**
		 * @fn function insertInto(value, position)
		 *
		 * @brief Inserts a value into position X 
		 *
		 * @param value    The value to be inserted.
		 * @param position The position the item has to be inserted into.
		 */
		this._insertInto = function (value, position) {
			var temp1;
			var temp2 = value;
			for (var i = position || 0; i < this.length + 1; i++) {
				temp1 = this[i];
				this[i] = temp2;
				temp2 = temp1;
			}
			this.length++;
		};

		/**
		 * @fn function this._add(value)
		 *
		 * @brief Adds value to the custom right-click menu
		 *
		 * @param value The value to add, is of type crmItem
		 * @param position Whether to insert at the beginning, end or a
		 *		specific item
		 */
		this._add = function (value, position) {
			if (position === "first") {
				this._insertInto(value, 0);
			}
			else if (position === "last" || position === undefined) {
				this[this.length] = value;
				this.length++;
			}
			else {
				this._insertInto(value, position);
			}
			if (this._uploadOnUpdate) {
				this._upload();
			}
		};

		/**
		 * @fn function this._remove(position)
		 *
		 * @brief Removes the CRM-item at the given position
		 *
		 * @param position The position to remove
		 */
		this._remove = function (position) {
			for (var i = position; i < this.length; i++) {
				this[i] = this[i + 1];
			}
			this[this.length] = null;
			this.length--;
			if (this._uploadOnUpdate) {
				this._upload();
			}
		};

		console.log(this);
	}

	/**
	 * @fn function settingsObj(setValues)
	 *
	 * @brief The settings object
	 *
	 * @param setValues The settings object to initialize with
	 */
	function settingsObj(setValues) {
		for (var key in setValues) {
			if (setValues.hasOwnProperty(key)) {
				if (key === "crm") {
					this.crm = new CustomRightClickMenu(setValues.crm);
				}
				else {
					this[key] = setValues[key];
				}
			}
		}
		var _optionsToSet = [
			"showOptions",
			"openInCurrentTab",
			"editCRMInRM",
			"crm"
		];
		var _defaultValues = [
			true,
			false,
			false,
			new CustomRightClickMenu(
				[
					{
						"type": "link",
						"value": "http://www.example.com",
						"name": "example",
						"index": 0,
						"parent": null,
						"children": null
					}
				]
			)
		];

		/**
		* @fn function this._upload()
		*
		* @brief Uploads this object to chrome.storage
		*/
		this._upload = function () {
			var dataObject = {};
			for (var key in this) {
				if (this.hasOwnProperty(key)) {
					if (key.indexOf("_") !== 0 && key !== "crm") {
						dataObject[key] = this[key];
					}
				}
			}
			dataObject.crm = settings.crm._export();
			console.log(dataObject);
			storage.set(dataObject);
			storage.get(function(items) {
				console.log(items);
			});
		};

		/**
		* @fn function this._update()
		*
		* @brief Updates this object to the latest values
		*/
		this._update = function () {
			storage.get(function (items) {
				for (var key in items) {
					if (items.hasOwnProperty(key)) {
						if (key === "crm") {
							this.crm = new CustomRightClickMenu(setValues.crm);
						}
						else {
							this[key] = items[key];
						}
					}
				}
			});
		};

		/**
		* @fn function this._checkSettings()
		*
		* @brief Check the settings object for any errors or missing values.
		*/
		this._checkSettings = function () {
			var copy = this;
			for (var i = 0; i < _optionsToSet.length; i++) {
				if (!this[_optionsToSet[i]]) {
					this[_optionsToSet[i]] = _defaultValues[i];
				}
			}
			if (copy !== this) {
				this._update();
			}
		};

		console.log(this);

		this._checkSettings();

		console.log(this);
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
	 * @fn function updateInputs()
	 *
	 * @brief Updates the inputs to the values in the settings object
	 */
	function updateInputs() {
		$(".showOptionsLinkCheckbox").attr("on", settings.showOptions.toString());
		$(".openLinkInCurrentTabCheckbox").attr("on", settings.openInCurrentTab.toString());
		$(".editCRMInRM").attr("on", settings.editCRMInRM.toString());
		bindstuff($(".options"));
		bindstuff($(".defaultLinks"));
	}

	/**
	 * @fn function bindEvents()
	 *
	 * @brief Bind all event listeners to all targets
	 */
	function bindEvents() {
		$(".addDefaultLink").on("click", addDefaultLink);
		$(".showOptionsLinkCheckbox").on("mousedown", function() {
			setValue("showOptions", (settings.showOptions ? false : true));
		});
		$(".openLinkInCurrentTabCheckbox").on("mousedown", function () {
			setValue("openInCurrentTab", (settings.openInCurrentTab ? false : true));
		});
		$(".editCRMInRM").on("mousedown", function () {
			setValue("editCRMInRM", (settings.editCRMInRM ? false : true));
		});
		buildPageCrm();
	};

	/**
	 * @fn function main()
	 *
	 * @brief Main function, called when javascript is ready to be executed
	 */
	function main() {
		updateInputs();
		bindEvents();
		buildCrmSettings();
	}

	/**
	 * @fn function settingsProcessor(items)
	 *
	 * @brief Processes the settings from storage.get and stores them in
	 *		the settings object
	 *
	 * @param items The storage items.
	 */
	function settingsProcessor(items) {
		settings = new settingsObj(items);
		main();
	}

	storage.get(settingsProcessor);
