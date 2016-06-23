Polymer.NodeEditBehavior = {

	properties: {
		/**
		* The new settings object, to be written on save
		* 
		* @attribute newSettings
		* @type Object
		* @default {}
		*/
		newSettings: {
			type: Object,
			notify: true,
			value: {}
		},
		/**
		* Whether the indicator for content type "page" should be selected
		* 
		* @attribute pageContentSelected
		* @type Boolean
		* @default false
		*/
		pageContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "link" should be selected
		* 
		* @attribute linkContentSelected
		* @type Boolean
		* @default false
		*/
		linkContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "selection" should be selected
		* 
		* @attribute selectionContentSelected
		* @type Boolean
		* @default false
		*/
		selectionContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "image" should be selected
		* 
		* @attribute imageContentSelected
		* @type Boolean
		* @default false
		*/
		imageContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "video" should be selected
		* 
		* @attribute videoContentSelected
		* @type Boolean
		* @default false
		*/
		videoContentSelected: {
			type: Object,
			notify: true
		},
		/**
		* Whether the indicator for content type "audio" should be selected
		* 
		* @attribute audioContentSelected
		* @type Boolean
		* @default false
		*/
		audioContentSelected: {
			type: Object,
			notify: true
		}
	},

	getContentTypeLaunchers: function (resultStorage) {
		var i;
		var result = [];
		var arr = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (i = 0; i < 6; i++) {
			result[i] = this[arr[i] + 'ContentSelected'];
		}
		resultStorage.onContentTypes = result;
	},

	getTriggers: function (resultStorage) {
		var inputs = $(this).find('.executionTrigger').find('paper-input');
		var triggers = [];
		for (var i = 0; i < inputs.length; i++) {
			triggers[i] = {
				url: inputs[i].value,
				not: inputs[i].parentNode.children[0].checked
			}
		}
		resultStorage.triggers = triggers;
	},

	cancel: function () {
		this.cancelChanges && this.cancelChanges();
		window.crmEditPage.animateOut();
	},

	save: function (resultStorage) {
		if (resultStorage && Object.prototype.toString.apply(resultStorage).indexOf('CustomEvent') > -1) {
			resultStorage = null;
		}
		var usesDefaultStorage = !resultStorage;
		if (usesDefaultStorage) {
			resultStorage = this.item;
		}

		this.saveChanges && this.saveChanges(resultStorage);

		this.getContentTypeLaunchers(resultStorage);
		this.getTriggers(resultStorage);
		window.crmEditPage.animateOut();

		var itemInEditPage = window.app.editCRM.getCRMElementFromPath(this.item.path, false);
		var newSettings = this.newSettings;
		itemInEditPage.name = newSettings.name;

		if (!newSettings.onContentTypes[window.app.crmType]) {
			window.app.editCRM.build(window.app.editCRM.setMenus);
		}

		if (newSettings.value) {
			if (newSettings.value.launchMode !== undefined &&
				newSettings.value.launchMode !== 0) {
				newSettings.onContentTypes = [true, true, true, true, true, true];
			} else {
				if (!newSettings.onContentTypes[window.app.crmType]) {
					window.app.editCRM.build(window.app.editCRM.setMenus);
				}
			}
		}

		for (var key in newSettings) {
			if (newSettings.hasOwnProperty(key)) {
				resultStorage[key] = newSettings[key];
			}
		}

		if (usesDefaultStorage) {
			app.upload();
		}
	},

	inputKeyPress: function (e) {
		e.keyCode === 27 && this.cancel();
		e.keyCode === 13 && this.save();
	},

	assignContentTypeSelectedValues: function () {
		var i;
		var arr = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (i = 0; i < 6; i++) {
			this[arr[i] + 'ContentSelected'] = this.item.onContentTypes[i];
		}
	},

	checkToggledIconAmount: function (e) {
		var i;
		var toggledAmount = 0;
		var arr = ['page', 'link', 'selection', 'image', 'video', 'audio'];
		for (i = 0; i < 6; i++) {
			if (this[arr[i] + 'ContentSelected']) {
				if (toggledAmount === 1) {
					return true;
				}
				toggledAmount++;
			}
		}
		if (!toggledAmount) {
			var index = 0;
			var element = e.path[0];
			while (element.tagName !== 'PAPER-CHECKBOX') {
				index++;
				element = e.path[index];
			}
			element.checked = true;
			this[element.parentNode.classList[1].split('Type')[0] + 'ContentSelected'] = true;
			window.doc.contentTypeToast.show();
		}
		return false;
	},

	toggleIcon: function (e) {
		if (this.mode && this.mode === 'background') {
			return;
		}
		var index = 0;
		var element = e.path[0];
		while (!element.classList.contains('showOnContentItemCont')) {
			index++;
			element = e.path[index];
		}
		var checkbox = $(element).find('paper-checkbox')[0];
		checkbox.checked = !checkbox.checked;
		if (!checkbox.checked) {
			this.checkToggledIconAmount({
				path: [checkbox]
			});
		}

		if (this.contentCheckboxChanged) {
			this.contentCheckboxChanged({
				path: [checkbox]
			});
		}
	},


	/*
	 * Clears the trigger that is currently clicked on
	 * 
	 * @param {event} event - The event that triggers this (click event)
	 */
	clearTrigger: function (event) {
		var target = event.target;
		if (target.tagName === 'PAPER-ICON-BUTTON') {
			target = target.children[0];
		}
		$(target.parentNode.parentNode).remove();
		var executionTriggers = $(this.$.executionTriggersContainer).find('paper-icon-button').toArray();
		if (executionTriggers.length === 1) {
			executionTriggers[0].style.display = 'none';
		} else {
			executionTriggers.forEach(function (item) {
				item.style.display = 'block';
			});
		}
	},

	/*
	 * Adds a trigger to the list of triggers for the node
	 */
	addTrigger: function () {
		var _this = this;
		var newEl = $('<div class="executionTrigger"><paper-checkbox class="executionTriggerNot" color="red">NOT</paper-checkbox><paper-input pattern="(file:///.*|(\*|http|https|file|ftp)://(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(/(.*))?|(<all_urls>))" auto-validate="true" label="URL match pattern" error-message="This is not a valid URL pattern!" class="triggerInput" value="*://*.example.com/*"></paper-input><paper-icon-button on-tap="clearTrigger" icon="clear"><paper-icon-button on-tap="clearTrigger" icon="clear"></paper-icon-button></div>').insertBefore(this.$.addTrigger);
		newEl.find('paper-icon-button').click(function (e) {
			_this.clearTrigger.apply(_this, [e]);
		});
		var executionTriggers = $(this.$.executionTriggersContainer).find('paper-icon-button').toArray();
		if (executionTriggers.length === 2) {
			executionTriggers[0].style.display = 'block';
		}
		return newEl;
	},

	/*
	 * Is triggered when the option in the dropdown menu changes animates in what's needed
	 */
	selectorStateChange: function (prevState, state) {
		var _this = this;
		var newStates = {
			showContentTypeChooser: (state === 0 || state === 3),
			showTriggers: (state > 1)
		};
		var oldStates = {
			showContentTypeChooser: (prevState === 0 || prevState === 3),
			showTriggers: (prevState > 1)
		};

		var triggersElement = this.$.executionTriggersContainer;
		var $triggersElement = $(triggersElement);
		var contentTypeChooserElement = this.$.showOnContentContainer;
		var $contentTypeChooserElement = $(contentTypeChooserElement);

		function animateTriggers(callback) {
			triggersElement.style.height = 'auto';
			if (newStates.showTriggers) {
				triggersElement.style.display = 'block';
				triggersElement.style.marginLeft = '-110%';
				triggersElement.style.height = 0;
				$triggersElement.animate({
					height: $triggersElement[0].scrollHeight
				}, 300, function () {
					$(this).animate({
						marginLeft: 0
					}, 200, function() {
						this.style.height = 'auto';
						callback && callback();
					});
				});
			} else {
				triggersElement.style.marginLeft = 0;
				triggersElement.style.height = $triggersElement[0].scrollHeight;
				$triggersElement.animate({
					marginLeft: '-110%'
				}, 200, function () {
					$(this).animate({
						height: 0
					}, 300, function () {
						triggersElement.style.display = 'none';
						callback && callback();
					});
				});
			}
			_this.showTriggers = newStates.showTriggers;
		}

		function animateContentTypeChooser(callback) {
			contentTypeChooserElement.style.height = 'auto';
			if (newStates.showContentTypeChooser) {
				contentTypeChooserElement.style.height = 0;
				contentTypeChooserElement.style.display = 'block';
				contentTypeChooserElement.style.marginLeft = '-110%';
				$contentTypeChooserElement.animate({
					height: $contentTypeChooserElement[0].scrollHeight
				}, 300, function () {
					$(this).animate({
						marginLeft: 0
					}, 200, function () {
						this.style.height = 'auto';
						callback && callback();
					});
				});
			} else {
				contentTypeChooserElement.style.marginLeft = 0;
				contentTypeChooserElement.style.height = $contentTypeChooserElement[0].scrollHeight;
				$contentTypeChooserElement.animate({
					marginLeft: '-110%'
				}, 200, function () {
					$(this).animate({
						height: 0
					}, 300, function () {
						contentTypeChooserElement.style.display = 'none';
						callback && callback();
					});
				});
			}
			_this.showContentTypeChooser = newStates.showContentTypeChooser;
		}

		if (oldStates.showTriggers && !newStates.showTriggers) {
			if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
				animateTriggers(animateContentTypeChooser);
			} else {
				animateTriggers();
			}
		}
		else if (!oldStates.showTriggers && newStates.showTriggers) {
			if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
				animateContentTypeChooser(animateTriggers);
			} else {
				animateTriggers();
			}
		}
		else if (oldStates.showContentTypeChooser !== newStates.showContentTypeChooser) {
			animateContentTypeChooser();
		}
	},

	initDropdown: function () {
		this.showTriggers = (this.item.value.launchMode > 1);
		this.showContentTypeChooser = (this.item.value.launchMode === 0 || 3);
		if (this.showTriggers) {
			this.$.executionTriggersContainer.style.display = 'block';
			this.$.executionTriggersContainer.style.marginLeft = 0;
			this.$.executionTriggersContainer.style.height = 'auto';
		} else {
			this.$.executionTriggersContainer.style.display = 'none';
			this.$.executionTriggersContainer.style.marginLeft = '-110%';
			this.$.executionTriggersContainer.style.height = 0;
		}
		if (this.showContentTypeChooser) {
			this.$.showOnContentContainer.style.display = 'block';
			this.$.showOnContentContainer.style.marginLeft = 0;
			this.$.showOnContentContainer.style.height = 'auto';
		} else {
			this.$.showOnContentContainer.style.display = 'none';
			this.$.showOnContentContainer.style.marginLeft = '-110%';
			this.$.showOnContentContainer.style.height = 0;
		}
		this.$.dropdownMenu._addListener(this.selectorStateChange, 'dropdownMenu', this);
		if (this.editor) {
			this.editor.display.wrapper.remove();
			this.editor = null;
		}
	},

	_init: function () {
		var _this = this;
		this.newSettings = JSON.parse(JSON.stringify(this.item));
		window.crmEditPage.nodeInfo = this.newSettings.nodeInfo;
		this.assignContentTypeSelectedValues();
		setTimeout(function () {
			_this.$.nameInput.focus();
		}, 350);
	}
};