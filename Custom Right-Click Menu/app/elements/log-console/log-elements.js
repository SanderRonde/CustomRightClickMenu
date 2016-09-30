var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

window.logElements = (() => {
	function getTag(item, parent, additionalProps) {
		additionalProps = additionalProps || {};

		if (additionalProps.isEval) {
			return React.createElement(EvalElement, _extends({}, additionalProps, { parent: parent, value: item }));
		}

		if (item === null || item === undefined) {
			return React.createElement(StringElement, _extends({}, additionalProps, { parent: parent, value: item }));
		}

		switch (typeof item) {
			case 'function':
				return React.createElement(FunctionElement, _extends({}, additionalProps, { parent: parent, value: item }));
			case 'object':
				return React.createElement(ObjectElement, _extends({}, additionalProps, { parent: parent, value: item }));
			case 'string':
			default:
				return React.createElement(StringElement, _extends({}, additionalProps, { parent: parent, value: item }));
		}
	}

	class LogElement extends React.Component {
		constructor(props) {
			super(props);
		}
		showContextMenu(e) {
			window.logConsole.initContextMenu(this, e);
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}

	class EvalElement extends LogElement {
		componentDidMount() {
			if (this.props.hasResult) {
				this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
			}
		}
		isLine() {
			return true;
		}
		render() {
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
	}

	class StringElement extends LogElement {
		componentDidMount() {
			if (!this.props.nolistener) {
				this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
			}
		}
		render() {
			var type = typeof this.props.value;
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
	};

	var fnRegex = /^(.+)\{((.|\s|\n|\r)+)\}$/;

	class FunctionElement extends LogElement {
		constructor(props) {
			super(props);
		}
		expand() {
			this.refs.arrow.classList.toggle('toggled');
			this.refs.expandedElements.classList.toggle('visible');
		}
		componentDidMount() {
			this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
		}
		render() {
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
	}

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

	class ObjectElement extends LogElement {
		expand() {
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
		componentDidMount() {
			this.refs.cont.addEventListener('contextmenu', this.showContextMenu.bind(this));
		}
		render() {
			var dataType = Array.isArray(this.props.value) ? 'array' : 'object';
			var expandClick = this.expand.bind(this);
			var dataPairs = getKeyValuePairs(this.props.value);
			var lastElIndex = dataPairs.length - 1;
			var isExpandable = dataType === 'object' || dataPairs.length >= 10 || dataPairs.filter(function (pair) {
				return typeof pair.value === 'object';
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
							if (typeof data === 'object') {
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
	}

	class LogLine extends React.Component {
		constructor(props) {
			super(props);
		}
		isLine() {
			return true;
		}
		takeToTab() {
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
		render() {
			const takeToTab = this.takeToTab.bind(this);
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
						this.props.value.map(value => {
							return getTag(value, this, {
								isEval: this.props.line.isEval
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
	}

	class LogLineContainer extends React.Component {
		constructor(props) {
			super(props);
		}
		add(lineData, line) {
			this.setState({
				lines: this.state.lines.concat([{
					data: lineData,
					line: line
				}])
			});

			this.props.logConsole.set('lines', this.state.lines.length);
		}
		popEval() {
			const lines = this.state.lines.reverse();
			let popped = null;
			for (let i = 0; i < lines.length; i++) {
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
		clear() {
			this.setState({
				lines: []
			});

			this.props.logConsole.set('lines', this.state.lines.length);
		}
		render() {
			const children = [];

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
	}

	return {
		logLines: LogLineContainer
	};
})();
