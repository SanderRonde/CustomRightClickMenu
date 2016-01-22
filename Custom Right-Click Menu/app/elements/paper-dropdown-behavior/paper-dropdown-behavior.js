Polymer.PaperDropdownBehavior = {
	properties: {
		/**
		 * The selected item
		 * 
		 * @attribute selected
		 * @type Number
		 * @default 0
		 */
		selected: {
			type: Number,
			value: 0,
			notify: true,
			reflectToAttribute: true
		}
	},

	/**
	* The start time for the current animation
	* 
	* @attribute _startTime
	* @type Number
	* @default null
	*/
	_startTime: null,

	/**
     * The paper dropdown menu element
     * 
     * @attribute _paperDropdownEl
     * @type Element
     * @default null
     */
	_paperDropdownEl: null,

	/**
     * The paper menu element
     * 
     * @attribute _paperMenu
     * @type Element
     * @default null
     */
	_paperMenu: null,

	/**
     * The dropdown selected container
     * 
     * @attribute _dropdownSelectedCont
     * @type Element
     * @default null
     */
	_dropdownSelectedCont: null,

	/**
	* The listeners for this element
	* 
	* @attribute _listeners
	* @type Array
	* @default []
	*/
	_listeners: [],

	/**
	* Whether the menu is expanded
	* 
	* @attribute _expanded
	* @type Boolean
	* @default false
	*/
	_expanded: false,

	/**
	* Whether the menu should have an indent from the left part of the screen
	* 
	* @attribute indent
	* @type Boolean
	* @default true
	*/
	indent: true,

	/**
	 * The previous state before the current one
	 * 
	 * @attribute _prevState
	 * @type Number
	 * @default null
	 */
	_prevState: null,

	/*
	 * Adds a listener that fires when a new value is selected
	 */
	_addListener: function (listener, thisArg) {
		var found = false;
		for (var i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].listener === listener) {
				found = true;
			}
		}
		if (!found) {
			this._listeners.push({
				listener: listener,
				thisArg: thisArg
			});
		}
	},

	/*
	 * Fires all added listeners, triggers when a new value is selected
	 */
	_fireListeners: function (_this) {
		var prevState = _this.selected;
		if (_this.tagName === 'PAPER-DROPDOWN-MENU') {
			_this.selected = _this._paperMenu.selected;
		}
		_this._listeners.forEach(function (item) {
			item.listener.apply(item.thisArg, [prevState, _this._paperMenu.selected]);
		});
	},

	ready: function() {
		var _this = this;
		this._paperItems = $(this).find('paper-item').on('click', function () {
			setTimeout(function () {
				_this._fireListeners(_this);
				if (_this._dropdownSelectChange) {
					_this._dropdownSelectChange(_this);
				}
			}, 0);
		});
		this._paperDropdownEl = this;
		this._paperMenu = $(this).find('paper-menu')[0];
		setTimeout(function () {
			$(_this.$.dropdownSelectedCont).insertBefore($(_this).find('.content'));
		}, 200);
		this._dropdownSelectedCont = $(this).find('#dropdownSelectedCont')[0];
		if (this.getAttribute('indent') === 'false') {
			this.indent = false;
		}
	},

	/*
	 * Animates the box-shadow in on clicking the main blue text
	 */
	_animateBoxShadowIn: function(timestamp, _this) {
		if (!_this._startTime) {
			_this._startTime = timestamp;
		}
		if (timestamp - 100 < _this._startTime) {
			var scale = ((timestamp - _this._startTime) / 100);
			var doubleScale = scale * 2;
			_this._paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
			}
			window.requestAnimationFrame(function(time) {
				_this._animateBoxShadowIn(time, _this);
			});
		}
		else {
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = '15px';
			}
			_this._startTime = null;
			_this._paperMenu.style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
		}
	},

	/*
	 * Animates the box-shadow out on clicking the main blue text again
	 */
	_animateBoxShadowOut: function(timestamp, _this) {
		if (!_this._startTime) {
			_this._startTime = timestamp;
		}
		if (timestamp - 100 < _this._startTime) {
			var scale = 1 - (((timestamp - _this._startTime) / 100));
			var doubleScale = scale * 2;
			_this._paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
			}
			window.requestAnimationFrame(function (time) {
				_this._animateBoxShadowOut(time, _this);
			});
		}
		else {
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = 0;
			}
			_this._startTime = null;
			_this._paperMenu.style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
			_this._paperDropdownEl.$.dropdownArrow.style.transform = 'rotate(90deg)';
		}
	},

	/*
	 * Open the dropdown menu
	 */
	open: function() {
		var _this = this;
		if (!this._expanded) {
			this._expanded = true;
			window.requestAnimationFrame(function(time) {
				_this._animateBoxShadowIn(time, _this);
			});
			setTimeout(function() {
				var content = $(_this._paperMenu).find('.content');
				content.css('display', 'block').stop().animate({
					height: content[0].scrollHeight
				}, {
					easing: 'easeOutCubic',
					duration: 300,
					complete: function() {
						_this.$.dropdownArrow.style.transform = 'rotate(270deg)';
					}
				});
			}, 100);
		}
	},

	/*
	 * Close the dropdown menu
	 */
	close: function() {
		var _this = this;
		if (this._expanded) {
			this._expanded = false;
			$(this).find('paper-menu').find('.content').stop().animate({
				height: 0
			}, {
				easing: 'easeInCubic',
				duration: 300,
				complete: function() {
					this.style.display = 'none';
					window.requestAnimationFrame(function(time) {
						_this._animateBoxShadowOut(time, _this);
					});
				}
			});
		}
	},

	/*
	 * Toggles the dropdown menu, tirggers on clicking the main blue text
	 */
	_toggleDropdown: function() {
		(this._expanded ? this.close() : this.open());
	},

	/**
	 * Gets the currently selected item(s)
	 * @returns {Array} The currently selected item(s) in array form
	 */
	getSelected: function () {
		if ($(this).find('.iron-selected.addLibrary')[0]) {
			this.selected.pop();
		}
		if (typeof this.selected === 'number') {
			return [this.selected];
		}
		return this.selected;
	}
};