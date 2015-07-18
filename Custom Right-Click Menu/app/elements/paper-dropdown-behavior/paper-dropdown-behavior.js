Polymer.PaperDropdownBehavior = {
	properties: {
		selected: {
			type: Number,
			value: 0,
			notify: true
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
	* @attribute listeners
	* @type Array
	* @default []
	*/
	_listeners: [],

	/**
	* Whether the menu is expanded
	* 
	* @attribute expanded
	* @type Boolean
	* @default false
	*/
	_expanded: false,

	_addListener: function(listener, thisArg) {
		this._listeners.push({
			listener,
			thisArg
		});
	},

	_fireListeners: function(_this) {
		_this._listeners.forEach(function (item) {
			item.listener.apply(item.thisArg, [_this._paperMenu.selected]);
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
		console.log('created', this);
		console.log(this._dropdownSelectedCont);
	},

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
			_this._dropdownSelectedCont.style.marginLeft = scale * 15;
			window.requestAnimationFrame(function(time) {
				_this._animateBoxShadowIn(time, _this);
			});
		}
		else {
			_this._startTime = null;
			_this._paperMenu.style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
		}
	},

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
			_this._dropdownSelectedCont.style.marginLeft = scale * 15;
			window.requestAnimationFrame(function (time) {
				_this._animateBoxShadowOut(time, _this);
			});
		}
		else {
			_this._startTime = null;
			_this._paperMenu.style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
			_this._paperDropdownEl.$.dropdownArrow.style.transform = 'rotate(90deg)';
		}
	},

	_toggleDropdown: function() {
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
					window.requestAnimationFrame(function (time) {
						_this._animateBoxShadowOut(time, _this);
					});
				}
			});
		}
		else {
			this._expanded = true;
			window.requestAnimationFrame(function (time) {
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
	}
};