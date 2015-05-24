///<reference path="polymer.js"/>

(function () {

	/**
	 * @brief The main settings object
	 */
	var settings;
	var storage = chrome.storage.sync;

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
		settings.update();
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
			if (order[i].type == "array") {
				paramsDefault += "arr" + order[i].index;
			}
			else {
				paramsDefault += "params[" + order[i].index + "]";
			}
		}
		return paramsDefault;
	}

	/**
	 * @fn	function fillParamsString(arrays, iterator, paramsString)
	 *
	 * @brief	Fills the parameter string with the actual values
	 *
	 * @param	arrays			The arrays to be looped through.
	 * @param	iterator		The iterator.
	 * @param	paramsString	The parameters string to be filled.
	 *
	 * @return	The filled parameters string.
	 */
	function fillParamsString(arrays, iterator, paramsString) {
		var valToWrite;
		for (var i = 0; i < 100; i++) {
			if (paramsString.indexOf("arr" + i) > -1) {
				valToWrite = arrays[i][iterator];
				if (typeof valToWrite === "string") {
					valToWrite = '"' + valToWrite + '"';
				}
				paramsString = paramsString.replace("arr" + i, valToWrite);
			}
			else {
				break;
			}
		}
		return paramsString;
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
		var parameters = "";
		for (var i = 0; i < arrays[0].length; i++) {
			parameters = fillParamsString(arrays, i, paramsDefault);
			eval("toExecute(" + parameters + ")");
		}
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
			if (settingsObj === undefined) {
				settingsObj = this;
			}
			if (!settingsObj[option]) {
				settingsObj[option] = value;
			}
		}

		for (var key in setValues) {
			this[key] = setValues[key];
		}
		var _optionsToSet = [
			"showOptions",
			"openInCurrentTab"
		];
		var _defaultValues = [
			true,
			false
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
		this._upload = function() {
			var dataObject = {};
			for (var key in this) {
				if (key.indexOf("_") !== 0) {
					dataObject[key] = this[key];
				}
			}
			storage.set(dataObject);
		}

		/**
		* @fn function this._update()
		*
		* @brief Updates this object to the latest values
		*/
		this._update = function() {
			storage.get(function(items) {
				for (var key in items) {
					this[key] = items[key];
				}
			});
		}

		/**
		* @fn function this._checkSettings()
		*
		* @brief Check the settings object for any errors or missing values.
		*/
		this._checkSettings = function() {
			execForArray(this._ifUnsetSet, [
				_optionsToSet, _defaultValues
			], [
				this
			], _order);
		}

		this._checkSettings();

		console.log(this);
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
	}

	/**
	 * @fn function main()
	 *
	 * @brief Main function, called when javascript is ready to be executed
	 */
	function main() {
		updateInputs();
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