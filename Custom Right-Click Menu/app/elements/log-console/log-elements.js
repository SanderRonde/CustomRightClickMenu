'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

window.logElements = function () {
	function getTag(item, parent, additionalProps) {
		additionalProps = additionalProps || {};

		if (additionalProps.isEval) {
			return React.createElement(EvalElement, _extends({}, additionalProps, { parent: parent, value: item }));
		}

		if (item === null || item === undefined) {
			return React.createElement(StringElement, _extends({}, additionalProps, { parent: parent, value: item }));
		}

		switch (typeof item === 'undefined' ? 'undefined' : _typeof(item)) {
			case 'function':
				return React.createElement(FunctionElement, _extends({}, additionalProps, { parent: parent, value: item }));
			case 'object':
				return React.createElement(ObjectElement, _extends({}, additionalProps, { parent: parent, value: item }));
			case 'string':
			default:
				return React.createElement(StringElement, _extends({}, additionalProps, { parent: parent, value: item }));
		}
	}

	var LogElement = function (_React$Component) {
		_inherits(LogElement, _React$Component);

		function LogElement(props) {
			_classCallCheck(this, LogElement);

			return _possibleConstructorReturn(this, (LogElement.__proto__ || Object.getPrototypeOf(LogElement)).call(this, props));
		}

		_createClass(LogElement, [{
			key: 'showContextMenu',
			value: function showContextMenu(e) {
				window.logConsole.initContextMenu(this, e);
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		}]);

		return LogElement;
	}(React.Component);

	var EvalElement = function (_LogElement) {
		_inherits(EvalElement, _LogElement);

		function EvalElement() {
			_classCallCheck(this, EvalElement);

			return _possibleConstructorReturn(this, (EvalElement.__proto__ || Object.getPrototypeOf(EvalElement)).apply(this, arguments));
		}

		_createClass(EvalElement, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				if (this.props.hasResult) {
					this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
				}
			}
		}, {
			key: 'isLine',
			value: function isLine() {
				return true;
			}
		}, {
			key: 'render',
			value: function render() {
				return React.createElement(
					'div',
					{ ref: 'cont', className: 'evalElementContainer' },
					React.createElement(
						'div',
						{ className: 'evalElementCommand' },
						React.createElement(
							'div',
							{ className: 'evalElementCommandPrefix' },
							'>'
						),
						React.createElement(
							'div',
							{ className: 'evalElementCommandValue' },
							this.props.value.code
						)
					),
					React.createElement(
						'div',
						{ className: 'evalElementStatus' },
						this.props.value.hasResult ? React.createElement(
							'div',
							{ className: 'evalElementReturn' },
							React.createElement(
								'div',
								{ className: 'evalElementReturnPrefix' },
								'<'
							),
							React.createElement(
								'div',
								{ className: 'evalElementReturnValue' },
								getTag(this.props.value.result, this)
							)
						) : React.createElement('paper-spinner', { className: 'tinySpinner', active: true })
					)
				);
			}
		}]);

		return EvalElement;
	}(LogElement);

	var StringElement = function (_LogElement2) {
		_inherits(StringElement, _LogElement2);

		function StringElement() {
			_classCallCheck(this, StringElement);

			return _possibleConstructorReturn(this, (StringElement.__proto__ || Object.getPrototypeOf(StringElement)).apply(this, arguments));
		}

		_createClass(StringElement, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				if (!this.props.nolistener) {
					this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
				}
			}
		}, {
			key: 'render',
			value: function render() {
				var type = _typeof(this.props.value);
				var value;
				if (this.props.value === null || this.props.value === undefined) {
					value = this.props.value + '';
				} else {
					value = JSON.stringify(this.props.value);
				}
				return React.createElement(
					'div',
					{ ref: 'cont', className: 'stringElementValue',
						type: type },
					value + ' '
				);
			}
		}]);

		return StringElement;
	}(LogElement);

	;

	var fnRegex = /^(.+)\{((.|\s|\n|\r)+)\}$/;

	var FunctionElement = function (_LogElement3) {
		_inherits(FunctionElement, _LogElement3);

		function FunctionElement(props) {
			_classCallCheck(this, FunctionElement);

			return _possibleConstructorReturn(this, (FunctionElement.__proto__ || Object.getPrototypeOf(FunctionElement)).call(this, props));
		}

		_createClass(FunctionElement, [{
			key: 'expand',
			value: function expand() {
				this.refs.arrow.classList.toggle('toggled');
				this.refs.expandedElements.classList.toggle('visible');
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
			}
		}, {
			key: 'render',
			value: function render() {
				var fn = this.props.value.toString();
				var fnMatch = fnRegex.exec(fn);
				var functionPrefix = fnMatch[1];
				var functionText = fnMatch[2];
				var functionKeywordIndex = functionPrefix.indexOf('function') || 0;
				var functionName = functionPrefix.slice(0, functionPrefix.indexOf('()')).trim();

				var expandClick = this.expand.bind(this);

				return React.createElement(
					'div',
					{ ref: 'cont', className: 'functionElementCont' },
					React.createElement(
						'div',
						{ className: 'functionElement' },
						React.createElement(
							'div',
							{ className: 'functionElementPreviewArea' },
							React.createElement(
								'div',
								{ ref: 'arrow', className: 'objectElementExpandArrow', onClick: expandClick },
								React.createElement(
									'svg',
									{ xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 48 48' },
									React.createElement('path', { d: 'M16 10v28l22-14z' })
								)
							),
							React.createElement(
								'div',
								{ className: 'functionElementPreview' },
								React.createElement(
									'div',
									{ className: 'functionElementPrefixCont' },
									React.createElement(
										'div',
										{ className: 'functionElementPrefix' },
										React.createElement(
											'span',
											{ className: 'functionElementKeyword' },
											'function'
										),
										React.createElement(
											'span',
											null,
											' ' + this.props.value.name + '()'
										)
									)
								)
							)
						),
						React.createElement(
							'div',
							{ ref: 'expandedElements', className: 'functionElementExpanded' },
							React.createElement(
								'div',
								{ className: 'functionElementExpandedContent' },
								React.createElement(
									'div',
									{ className: 'functionElementPrefixCont' },
									functionPrefix.indexOf('=>') > -1 ? React.createElement(
										'div',
										{ className: 'functionElementPrefix' },
										'functionPrefix'
									) : React.createElement(
										'div',
										{ className: 'functionElementPrefix' },
										React.createElement(
											'span',
											null,
											functionPrefix.slice(0, functionKeywordIndex)
										),
										React.createElement(
											'span',
											{ className: 'functionElementKeyword' },
											'function'
										),
										React.createElement(
											'span',
											null,
											functionPrefix.slice(functionKeywordIndex + 8) + '{'
										)
									)
								),
								React.createElement(
									'div',
									{ className: 'functionElementValue' },
									functionText
								),
								React.createElement(
									'span',
									null,
									'}'
								)
							)
						)
					)
				);
			}
		}]);

		return FunctionElement;
	}(LogElement);

	function getKeyValuePairs(item, deep) {
		if (Array.isArray(item)) {
			return item.map(function (value, index) {
				return {
					index: index,
					value: value
				};
			});
		} else {
			var props = Object.getOwnPropertyNames(item).map(function (key) {
				if (key === '__proto__' && item[key] === null) {
					return null;
				} else if (key !== '__parent') {
					return {
						index: key,
						value: item[key]
					};
				}
				return null;
			}).filter(function (pair) {
				return pair !== null;
			});

			if (deep && Object.getOwnPropertyNames(item).indexOf('__proto__') === -1) {
				props.push({
					index: '__proto__',
					value: Object.getPrototypeOf(item)
				});
			}
			return props;
		}
	}

	function getKeys(item) {
		if (Array.isArray(item)) {
			return item.length;
		} else {
			return Object.getOwnPropertyNames(item).length;
		}
	}

	var ObjectElement = function (_LogElement4) {
		_inherits(ObjectElement, _LogElement4);

		function ObjectElement() {
			_classCallCheck(this, ObjectElement);

			return _possibleConstructorReturn(this, (ObjectElement.__proto__ || Object.getPrototypeOf(ObjectElement)).apply(this, arguments));
		}

		_createClass(ObjectElement, [{
			key: 'expand',
			value: function expand() {
				if (!this.props.expanded && !this.props.renderedExpanded) {
					this.props.renderedExpanded = true;

					var _this = this;
					var expandedElements = [];
					var pairs = getKeyValuePairs(this.props.value, true);
					var lastElementIndex = pairs.length - 1;
					pairs.forEach(function (item, i, arr) {
						expandedElements.push(React.createElement(
							'div',
							{ className: 'expandedObjectElement' },
							React.createElement(
								'div',
								{ className: 'expandedObjectElementIndex' },
								item.index,
								':'
							),
							React.createElement(
								'div',
								{ className: 'expandedObjectElementValue' },
								getTag(item.value, _this, {
									isProto: item.index === '__proto__'
								})
							),
							i < lastElementIndex ? React.createElement(
								'span',
								{ className: 'arrayComma' },
								','
							) : null
						));
					});

					this.props.expandedElements = expandedElements;

					this.setState({
						expanded: true
					});
				}

				this.refs.arrow.classList.toggle('toggled');
				this.refs.expandedElements.classList.toggle('visible');
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
			}
		}, {
			key: 'render',
			value: function render() {
				var dataType = Array.isArray(this.props.value) ? 'array' : 'object';
				var expandClick = this.expand.bind(this);
				var dataPairs = getKeyValuePairs(this.props.value);
				var lastElIndex = dataPairs.length - 1;
				var isExpandable = dataType === 'object' || dataPairs.length >= 10 || dataPairs.filter(function (pair) {
					return _typeof(pair.value) === 'object';
				}).length > 0;
				var overflows = dataType === 'object' && dataPairs.length > 3 || dataType === 'array' && dataPairs.length > 10;
				var nonOverflowItems = dataPairs.slice(0, this.props.isProto ? 0 : dataType === 'object' ? 3 : 10);

				if (overflows) {
					nonOverflowItems.push({
						overflow: true
					});
				}

				return React.createElement(
					'div',
					{ ref: 'cont', className: 'objectElementCont' },
					React.createElement(
						'div',
						{ className: 'objectElementPreviewArea' },
						React.createElement(
							'div',
							{ ref: 'arrow', className: 'objectElementExpandArrow', hidden: !isExpandable, onClick: expandClick },
							React.createElement(
								'svg',
								{ xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 48 48' },
								React.createElement('path', { d: 'M16 10v28l22-14z' })
							)
						),
						React.createElement(
							'div',
							{ className: 'objectElementPreviewCont' },
							React.createElement(
								'span',
								null,
								dataType === 'array' ? '[' : '{'
							),
							nonOverflowItems.map(function (item, i, arr) {
								var index = item.index;
								var data = item.value;
								if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
									if (Array.isArray(data)) {
										return React.createElement(
											'span',
											{ className: 'objectElementValueCont' },
											dataType === 'object' ? React.createElement(
												'span',
												{ className: 'objectElementKey' },
												index,
												':'
											) : null,
											React.createElement(
												'span',
												{ className: 'specialArrayElement' },
												'Array'
											),
											i < lastElIndex ? React.createElement(
												'span',
												{ className: 'arrayComma' },
												','
											) : null
										);
									} else {
										return React.createElement(
											'span',
											{ className: 'objectElementValueCont' },
											dataType === 'object' ? React.createElement(
												'span',
												{ className: 'objectElementKey' },
												index,
												':'
											) : null,
											React.createElement(
												'span',
												{ className: 'specialArrayElement' },
												'Object'
											),
											i < lastElIndex ? React.createElement(
												'span',
												{ className: 'arrayComma' },
												','
											) : null
										);
									}
								} else if (typeof data === 'function') {
									return React.createElement(
										'span',
										{ className: 'objectElementValueCont' },
										dataType === 'object' ? React.createElement(
											'span',
											{ className: 'objectElementKey' },
											index,
											':'
										) : null,
										React.createElement(
											'span',
											{ className: 'specialArrayElement' },
											'Function'
										),
										i < lastElIndex ? React.createElement(
											'span',
											{ className: 'arrayComma' },
											','
										) : null
									);
								} else if (item.overflow) {
									return React.createElement(
										'span',
										{ className: 'objectElementValueCont' },
										React.createElement(
											'span',
											{ className: 'specialArrayElement' },
											'...'
										)
									);
								}
								return React.createElement(
									'span',
									{ className: 'objectElementValueCont' },
									dataType === 'object' ? React.createElement(
										'span',
										{ className: 'objectElementKey' },
										index,
										':'
									) : null,
									React.createElement(StringElement, { nolistener: "true", value: data }),
									i < lastElIndex ? React.createElement(
										'span',
										{ className: 'arrayComma' },
										','
									) : null
								);
							}, this),
							React.createElement(
								'span',
								null,
								dataType === 'array' ? ']' : '}'
							)
						)
					),
					React.createElement(
						'div',
						{ ref: 'expandedElements', className: 'objectElementExpanded' },
						this.props.expandedElements
					)
				);
			}
		}]);

		return ObjectElement;
	}(LogElement);

	var LogLine = function (_React$Component2) {
		_inherits(LogLine, _React$Component2);

		function LogLine(props) {
			_classCallCheck(this, LogLine);

			return _possibleConstructorReturn(this, (LogLine.__proto__ || Object.getPrototypeOf(LogLine)).call(this, props));
		}

		_createClass(LogLine, [{
			key: 'isLine',
			value: function isLine() {
				return true;
			}
		}, {
			key: 'takeToTab',
			value: function takeToTab() {
				chrome.tabs.get(~~this.props.line.tabId, function (tab) {
					if (chrome.runtime.lastError) {
						window.logConsole.$.genericToast.text = 'Tab has been closed';
						window.logConsole.$.genericToast.show();
						return;
					}

					chrome.tabs.highlight({
						windowId: tab.windowId,
						tabs: tab.index
					});
				});
			}
		}, {
			key: 'render',
			value: function render() {
				var _this8 = this;

				var takeToTab = this.takeToTab.bind(this);
				return React.createElement(
					'div',
					{ 'data-error': this.props.line.isError, className: 'logLine' },
					React.createElement(
						'div',
						{ className: 'lineData' },
						React.createElement(
							'div',
							{ className: 'lineTimestamp' },
							this.props.line.timestamp
						),
						React.createElement(
							'div',
							{ className: 'lineContent' },
							this.props.value.map(function (value) {
								return getTag(value, _this8, {
									isEval: _this8.props.line.isEval
								});
							})
						)
					),
					React.createElement(
						'div',
						{ className: 'lineSource' },
						React.createElement(
							'span',
							{ className: 'lineSourceIdCont', title: this.props.line.nodeTitle },
							'[id-',
							React.createElement(
								'span',
								{ className: 'lineSourceId' },
								this.props.line.id
							),
							']'
						),
						React.createElement(
							'span',
							{ className: 'lineSourceTabCont', onClick: takeToTab, tabindex: '1', title: this.props.line.tabTitle },
							'[tab-',
							React.createElement(
								'span',
								{ className: 'lineSourceTab' },
								this.props.line.tabId
							),
							']'
						),
						React.createElement(
							'span',
							{ className: 'lineSourceLineCont' },
							'@',
							React.createElement(
								'span',
								{ className: 'lineSourceLineNumber' },
								this.props.line.lineNumber.trim()
							)
						)
					)
				);
			}
		}]);

		return LogLine;
	}(React.Component);

	var LogLineContainer = function (_React$Component3) {
		_inherits(LogLineContainer, _React$Component3);

		function LogLineContainer(props) {
			_classCallCheck(this, LogLineContainer);

			return _possibleConstructorReturn(this, (LogLineContainer.__proto__ || Object.getPrototypeOf(LogLineContainer)).call(this, props));
		}

		_createClass(LogLineContainer, [{
			key: 'add',
			value: function add(lineData, line) {
				this.setState({
					lines: this.state.lines.concat([{
						data: lineData,
						line: line
					}])
				});

				this.props.logConsole.set('lines', this.state.lines.length);
			}
		}, {
			key: 'popEval',
			value: function popEval() {
				var lines = this.state.lines.reverse();
				var popped = null;
				for (var i = 0; i < lines.length; i++) {
					if (lines[i].line.isEval) {
						popped = lines.splice(i, 1);
						break;
					}
				}

				if (popped) {
					this.setState({
						lines: lines.reverse()
					});

					this.props.logConsole.set('lines', this.state.lines.length);
				}

				return popped[0];
			}
		}, {
			key: 'clear',
			value: function clear() {
				this.setState({
					lines: []
				});

				this.props.logConsole.set('lines', this.state.lines.length);
			}
		}, {
			key: 'render',
			value: function render() {
				var children = [];

				this.state = this.state || {};
				this.state.lines = this.state.lines || [];

				for (var i = 0; i < this.state.lines.length; i++) {
					children.push(React.createElement(LogLine, { value: this.state.lines[i].data, line: this.state.lines[i].line }));
				}

				return React.createElement(
					'div',
					{ className: 'logLines' },
					children
				);
			}
		}]);

		return LogLineContainer;
	}(React.Component);

	return {
		logLines: LogLineContainer
	};
}();