/// <reference path="../../scripts/_references.js"/>
/// <reference path="../../scripts/jquery-2.1.4.min.map" />
(function () {

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
		storage.set(key, value);
		settings._update();
	}

	/**
	 * @fn function createParamsString(params, order)
	 *
	 * @brief Creates the parameters string to be added to the to be executed
	 * 		  function
	 *
	 * @param params The static parameters to be added.
	 * @param order  The order in which every parameter is applied.
	 *
	 * @return The parameters string
	 */
	function createParamsString(params, order) {
		var paramsDefault = "";
		for (var i = 0; i < order.length; i++) {
			if (i !== 0) {
				paramsDefault += ", ";
			}
			if (order[i].type === "array") {
				paramsDefault += "arrays[" + i + "][i]";
			}
			else {
				paramsDefault += "params[" + order[i].index + "]";
			}
		}
		return paramsDefault;
	}

	/**
	 * @fn function execForArray(toExecute, arrays, params, order)
	 *
	 * @brief Executes function toExecute from index 0 to arrays[0].length
	 *		and passes the I'th value for every array and also passes
	 *		some static values passed in params as an array. This then
	 *		passes them in the order specified in order, see param order
	 *		for further info
	 *
	 * @param toExecute The function to execute.
	 * @param arrays    Array of arrays for which to execute the given function
	 * @param params    Static parameters in array of all these parameters
	 * @param order	    The order. Given as an array of objects, with each
	 * 					object having a type, being "array" or "param" and
	 * 					an index, indicating the index in either the arrays
	 * 					or params array.
	 */
	function execForArray(toExecute, arrays, params, order) {
		var paramsDefault = createParamsString(params, order);
		var parameters;
		for (var i = 0; i < arrays[0].length; i++) {
			parameters = paramsDefault;
			eval("toExecute(" + parameters + ")");
		}
	}

	/**
	 * @fn function buildPageCrm()
	 *
	 * @brief Builds this page's crm
	 */
	function buildPageCrm() {

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
				this[key] = additionalParams[key];
			}
		}
		this.type = type;
		this.value = value;
		this.index;
		this.parent;
		this.children;
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
				exportVals[i] = this[i];
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
		/**
		* @fn function this.ifUnsetSet(option, value)
		*
		* @brief If a value is not set, set it with the given value
		*
		* @param option The option that is or is not set.
		* @param value  The value to be given if the option is not set.
		*/
		this._ifUnsetSet = function (option, value, settingsObj) {
			settingsObj = settingsObj || this;
			if (!settingsObj[option]) {
				settingsObj[option] = value;
			}
		};

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
			"crm"
		];
		var _defaultValues = [
			true,
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
		var _order = [
			{
				"type": "array",
				"index": 0
			}, {
				"type": "array",
				"index": 1
			},
			{
				"type": "param",
				"index": 0
			}
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
			execForArray(this._ifUnsetSet, [
				_optionsToSet, _defaultValues
			], [
				this
			], _order);
		};

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
		var link = defaultLinkItem.find(".defaultLinkHref").html().trim();
		var name = defaultLinkItem.find("input").find("input").val();
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
		var items = {};

		$.contextMenu({
			'selector': 'body',
			'callback': function (key) {
				console.log('');
				console.log(key);
				console.log('clicked');
			},
			'items': items
		});
			//var thingy = '$.contextMenu({selector: ' + "'#" + selector + "',callback: function () {	alert(" + '"This menu is for previewing only and won' + "'t do anything on clicking" + '");},items: {' + optionsstring + "}});";
	};

	/**
	 * @fn function main()
	 *
	 * @brief Main function, called when javascript is ready to be executed
	 */
	function main() {
		updateInputs();
		bindEvents();
		buildPageCrm();
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
}());