/// <reference path="../../../../tools/definitions/polymer.d.ts" />

import { LogConsole } from './log-console';
import { LogLineContainerInterface } from '../../elements';
import * as _React from '../../../../tools/definitions/react';
import {
	LogListenerLine,
	LogLineData,
} from '../../../js/background/sharedTypes';

declare const browserAPI: browserAPI;
declare const React: typeof _React;

window.logElements = (() => {
	function getTag(
		item: any,
		parent: EvalElement | LogElement | LogLine,
		additionalProps: {
			[key: string]: any;
		} = {}
	): JSX.Element {
		if (additionalProps['isEval']) {
			return (
				<EvalElement
					{...additionalProps}
					parent={parent}
					value={item}
				/>
			);
		}

		if (item === null || item === undefined) {
			return (
				<StringElement
					{...additionalProps}
					parent={parent}
					value={item}
				/>
			);
		}

		switch (typeof item) {
			case 'function':
				return (
					<FunctionElement
						{...additionalProps}
						parent={parent}
						value={item}
					/>
				);
			case 'object':
				return (
					<ObjectElement
						{...(additionalProps as any)}
						parent={parent}
						value={item}
					/>
				);
			case 'string':
			default:
				return (
					<StringElement
						{...additionalProps}
						parent={parent}
						value={item}
					/>
				);
		}
	}

	class LogElement extends React.Component<any, any> {
		refs: {
			cont: HTMLElement;
		};
		parent: HTMLElement;

		constructor(props: {}) {
			super(props);
		}
		showContextMenu(e: MouseEvent) {
			window.logConsole.initContextMenu(this as any, e);
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	}

	class EvalElement extends LogElement {
		componentDidMount() {
			if (this.props.hasResult) {
				this.refs.cont.addEventListener(
					'contextmenu',
					this.showContextMenu.bind(this)
				);
			}
		}
		isLine(): true {
			return true;
		}
		render() {
			return (
				<div ref="cont" className="evalElementContainer">
					<div className="evalElementCommand">
						<div className="evalElementCommandPrefix">&gt;</div>
						<div className="evalElementCommandValue">
							{this.props.value.code}
						</div>
					</div>
					<div className="evalElementStatus">
						{this.props.value.hasResult ? (
							<div className="evalElementReturn">
								<div className="evalElementReturnPrefix">
									&lt;
								</div>
								<div className="evalElementReturnValue">
									{getTag(this.props.value.result, this)}
								</div>
							</div>
						) : (
							<paper-spinner
								className="tinySpinner"
								active
							></paper-spinner>
						)}
					</div>
				</div>
			);
		}
	}

	class StringElement extends LogElement {
		componentDidMount() {
			if (!this.props.noListener) {
				this.refs.cont.addEventListener(
					'contextmenu',
					this.showContextMenu.bind(this)
				);
			}
		}
		render() {
			const type = typeof this.props.value;
			let value;
			if (this.props.value === null || this.props.value === undefined) {
				value = this.props.value + '';
			} else {
				value = JSON.stringify(this.props.value);
			}
			return (
				<div ref="cont" className="stringElementValue" type={type}>
					{value + ' '}
				</div>
			);
		}
	}

	const fnRegex = /^(.+)\{((.|\s|\n|\r)+)\}$/;

	class FunctionElement extends LogElement {
		refs: {
			arrow: HTMLElement;
			expandedElements: HTMLElement;
			cont: HTMLElement;
		};

		constructor(props: any) {
			super(props);
		}
		expand() {
			this.refs.arrow.classList.toggle('toggled');
			this.refs.expandedElements.classList.toggle('visible');
		}
		componentDidMount() {
			this.refs.cont.addEventListener(
				'contextmenu',
				this.showContextMenu.bind(this)
			);
		}
		render() {
			const fn = this.props.value.toString();
			const fnMatch = fnRegex.exec(fn);
			const functionPrefix = fnMatch[1];
			const functionText = fnMatch[2];
			const functionKeywordIndex =
				functionPrefix.indexOf('function') || 0;

			const expandClick = this.expand.bind(this);

			return (
				<div ref="cont" className="functionElementCont">
					<div className="functionElement">
						<div className="functionElementPreviewArea">
							<div
								ref="arrow"
								className="objectElementExpandArrow"
								onClick={expandClick}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 48 48"
								>
									<path d="M16 10v28l22-14z" />
								</svg>
							</div>
							<div className="functionElementPreview">
								<div className="functionElementPrefixCont">
									<div className="functionElementPrefix">
										<span className="functionElementKeyword">
											function
										</span>
										<span>
											{' ' + this.props.value.name + '()'}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div
							ref="expandedElements"
							className="functionElementExpanded"
						>
							<div className="functionElementExpandedContent">
								<div className="functionElementPrefixCont">
									{functionPrefix.indexOf('=>') > -1 ? (
										<div className="functionElementPrefix">
											functionPrefix
										</div>
									) : (
										<div className="functionElementPrefix">
											<span>
												{functionPrefix.slice(
													0,
													functionKeywordIndex
												)}
											</span>
											<span className="functionElementKeyword">
												function
											</span>
											<span>
												{functionPrefix.slice(
													functionKeywordIndex + 8
												) + '{'}
											</span>
										</div>
									)}
								</div>
								<div className="functionElementValue">
									{functionText}
								</div>
								<span>{'}'}</span>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}

	function getKeyValuePairs<T>(
		item:
			| Array<T>
			| {
					[key: string]: T;
					[key: number]: T;
			  },
		deep: boolean = false
	): Array<{
		index: string | number;
		value: T;
	}> {
		if (Array.isArray(item)) {
			return item.map(function (value, index) {
				return {
					index: index,
					value: value,
				};
			});
		} else {
			const props = Object.getOwnPropertyNames(item)
				.map(function (key) {
					if (key === '__proto__' && item[key] === null) {
						return null;
					} else if (key !== '__parent') {
						return {
							index: key,
							value: item[key],
						};
					}
					return null;
				})
				.filter(function (pair) {
					return pair !== null;
				});

			if (
				deep &&
				Object.getOwnPropertyNames(item).indexOf('__proto__') === -1
			) {
				props.push({
					index: '__proto__',
					value: Object.getPrototypeOf(item),
				});
			}
			return props;
		}
	}

	class ObjectElement extends LogElement {
		refs: {
			arrow: HTMLElement;
			expandedElements: HTMLElement;
			cont: HTMLElement;
		};
		props: {
			parent: EvalElement | LogLine | LogElement;
			expanded: boolean;
			renderedExpanded: boolean;
			expandedElements: Array<JSX.Element>;
			value: {
				[key: string]: any;
				[key: number]: any;
			};
			isProto: boolean;
		};

		expand() {
			if (!this.props.expanded && !this.props.renderedExpanded) {
				this.props.renderedExpanded = true;

				const expandedElements: Array<JSX.Element> = [];
				const pairs = getKeyValuePairs(this.props.value, true);
				const lastElementIndex = pairs.length - 1;
				pairs.forEach((item, i) => {
					expandedElements.push(
						<div className="expandedObjectElement">
							<div className="expandedObjectElementIndex">
								{item.index}:
							</div>
							<div className="expandedObjectElementValue">
								{getTag(item.value, this, {
									isProto: item.index === '__proto__',
								})}
							</div>
							{i < lastElementIndex ? (
								<span className="arrayComma">,</span>
							) : null}
						</div>
					);
				});

				this.props.expandedElements = expandedElements;

				this.setState({
					expanded: true,
				});
			}

			this.refs.arrow.classList.toggle('toggled');
			this.refs.expandedElements.classList.toggle('visible');
		}
		componentDidMount() {
			this.refs.cont.addEventListener(
				'contextmenu',
				this.showContextMenu.bind(this)
			);
		}
		render() {
			const dataType = Array.isArray(this.props.value) ? 'arr' : 'object';
			const expandClick = this.expand.bind(this);
			const dataPairs = getKeyValuePairs(this.props.value);
			const lastElIndex = dataPairs.length - 1;
			const isExpandable =
				dataType === 'object' ||
				dataPairs.length >= 10 ||
				dataPairs.filter(function (pair) {
					return typeof pair.value === 'object';
				}).length > 0;
			const overflows =
				(dataType === 'object' && dataPairs.length > 3) ||
				(dataType === 'arr' && dataPairs.length > 10);
			const nonOverflowItems: Array<
				| {
						index: string | number;
						value: any;
				  }
				| {
						overflow: boolean;
				  }
			> = dataPairs.slice(
				0,
				this.props.isProto ? 0 : dataType === 'object' ? 3 : 10
			);

			if (overflows) {
				nonOverflowItems.push({
					overflow: true,
				});
			}

			return (
				<div ref="cont" className="objectElementCont">
					<div className="objectElementPreviewArea">
						<div
							ref="arrow"
							className="objectElementExpandArrow"
							hidden={!isExpandable}
							onClick={expandClick}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 48 48"
							>
								<path d="M16 10v28l22-14z" />
							</svg>
						</div>
						<div className="objectElementPreviewCont">
							<span>{dataType === 'arr' ? '[' : '{'}</span>
							{nonOverflowItems.map(function (item, i) {
								const index = (item as {
									index: string | number;
									value: any;
								}).index;
								let data = (item as {
									index: string | number;
									value: any;
								}).value;
								if (typeof data === 'object') {
									if (Array.isArray(data)) {
										return (
											<span className="objectElementValueCont">
												{dataType === 'object' ? (
													<span className="objectElementKey">
														{index}:
													</span>
												) : null}
												<span className="specialArrayElement">
													Array
												</span>
												{i < lastElIndex ? (
													<span className="arrayComma">
														,
													</span>
												) : null}
											</span>
										);
									} else {
										return (
											<span className="objectElementValueCont">
												{dataType === 'object' ? (
													<span className="objectElementKey">
														{index}:
													</span>
												) : null}
												<span className="specialArrayElement">
													Object
												</span>
												{i < lastElIndex ? (
													<span className="arrayComma">
														,
													</span>
												) : null}
											</span>
										);
									}
								} else if (typeof data === 'function') {
									return (
										<span className="objectElementValueCont">
											{dataType === 'object' ? (
												<span className="objectElementKey">
													{index}:
												</span>
											) : null}
											<span className="specialArrayElement">
												Function
											</span>
											{i < lastElIndex ? (
												<span className="arrayComma">
													,
												</span>
											) : null}
										</span>
									);
								} else if (
									(item as {
										overflow: boolean;
									}).overflow
								) {
									return (
										<span className="objectElementValueCont">
											<span className="specialArrayElement">
												...
											</span>
										</span>
									);
								}
								return (
									<span className="objectElementValueCont">
										{dataType === 'object' ? (
											<span className="objectElementKey">
												{index}:
											</span>
										) : null}
										<StringElement
											noListener={'true'}
											value={data}
										/>
										{i < lastElIndex ? (
											<span className="arrayComma">
												,
											</span>
										) : null}
									</span>
								);
							}, this)}
							<span>{dataType === 'arr' ? ']' : '}'}</span>
						</div>
					</div>
					<div
						ref="expandedElements"
						className="objectElementExpanded"
					>
						{this.props.expandedElements}
					</div>
				</div>
			);
		}
	}

	class LogSource extends React.Component<
		{
			line: LogListenerLine;
		},
		{}
	> {
		constructor(props: { line: LogListenerLine }) {
			super(props);
		}
		async takeToTab() {
			if (this.props.line.tabId === 'background') {
				window.logConsole.$.genericToast.text =
					"Can't open a background page";
				window.logConsole.$.genericToast.show();
			} else {
				const tab = await browserAPI.tabs
					.get(~~this.props.line.tabId)
					.catch(() => {
						window.logConsole.$.genericToast.text =
							'Tab has been closed';
						window.logConsole.$.genericToast.show();
					});
				if (!tab) {
					return;
				}

				if ('highlight' in browserAPI.tabs) {
					const chromeTabs: typeof _chrome.tabs = browserAPI.tabs as any;
					if (!chromeTabs.highlight) {
						return;
					}
					await chromeTabs.highlight(
						{
							windowId: tab.windowId,
							tabs: tab.index,
						},
						() => {
							if ((window as any).chrome.runtime.lastError) {
								console.log(
									(window as any).chrome.runtime.lastError
								);
								console.log(
									'Something went wrong highlighting the tab'
								);
							}
						}
					);
				}
			}
		}
		getLineNumber() {
			return (
				(this.props.line.lineNumber &&
					this.props.line.lineNumber.trim()) ||
				'?'
			);
		}
		listenClick<T extends () => void>(fn: T) {
			return (target: HTMLElement | null) => {
				if (target !== null) {
					target.addEventListener('click', fn);
				}
			};
		}
		render() {
			return (
				<div className="lineSource">
					<span
						className="lineSourceIdCont"
						title={`Node name: ${this.props.line.nodeTitle}`}
					>
						[id-
						<span className="lineSourceId">
							{this.props.line.id}
						</span>
						]
					</span>
					<span className="lineSourceTabCont">
						[
						<span
							ref={this.listenClick(this.takeToTab.bind(this))}
							className="lineSourceTabsInner"
							title={`Tab name: ${
								this.props.line.tabTitle
							}, instance: ${
								this.props.line.tabInstanceIndex || 0
							}`}
							tabIndex={1}
						>
							tab-
							<span className="lineSourceTab">
								{this.props.line.tabId}
							</span>
							:{this.props.line.tabInstanceIndex || 0}
						</span>
						]
					</span>
					<span
						title="Log source file and line number"
						className="lineSourceLineCont"
					>
						@
						<span className="lineSourceLineNumber">
							{this.getLineNumber()}
						</span>
					</span>
				</div>
			);
		}
	}

	class LogLine extends React.Component<
		{
			value: Array<LogLineData>;
			line: LogListenerLine;
		},
		{}
	> {
		constructor(props: {
			value: Array<LogLineData>;
			line: LogListenerLine;
		}) {
			super(props);
		}
		isLine() {
			return true;
		}
		async takeToTab() {
			const tab = await browserAPI.tabs
				.get(~~this.props.line.tabId)
				.catch(() => {
					window.logConsole.$.genericToast.text =
						'Tab has been closed';
					window.logConsole.$.genericToast.show();
				});
			if (!tab) {
				return;
			}

			if ('highlight' in browserAPI.tabs) {
				const chromeTabs: typeof _chrome.tabs = browserAPI.tabs as any;
				if (!chromeTabs.highlight) {
					return;
				}
				await chromeTabs.highlight(
					{
						windowId: tab.windowId,
						tabs: tab.index,
					},
					() => {
						if ((window as any).chrome.runtime.lastError) {
							console.log(
								(window as any).chrome.runtime.lastError
							);
							console.log(
								'Something went wrong highlighting the tab'
							);
						}
					}
				);
			}
		}
		render() {
			return (
				<div data-error={this.props.line.isError} className="logLine">
					<div className="lineData">
						<div className="lineTimestamp">
							{this.props.line.timestamp}
						</div>
						<div className="lineContent">
							{this.props.value.map((value: LogLineData) => {
								return getTag(value, this, {
									isEval: this.props.line.isEval,
								});
							})}
						</div>
					</div>
					<LogSource line={this.props.line} />
				</div>
			);
		}
	}

	class LogLineContainer
		extends React.Component<
			{
				items: Array<any>;
				logConsole: LogConsole;
			},
			{
				lines: Array<{
					data: Array<LogLineData>;
					line: LogListenerLine;
				}>;
			}
		>
		implements LogLineContainerInterface {
		constructor(props: {}) {
			super(props);
		}
		add(lineData: Array<LogLineData> = [], line: LogListenerLine): void {
			this.setState({
				lines: this.state.lines.concat([
					{
						data: lineData,
						line: line,
					},
				]),
			});

			this.props.logConsole.set('lines', this.state.lines.length);
		}
		popEval(): {
			data: Array<LogLineData>;
			line: LogListenerLine;
		} {
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
					lines: lines.reverse(),
				});

				this.props.logConsole.set('lines', this.state.lines.length);
			}

			return popped[0];
		}
		clear(): void {
			this.setState({
				lines: [],
			});

			this.props.logConsole.set('lines', this.state.lines.length);
		}
		render() {
			const children = [];

			this.state = this.state || {
				lines: [],
			};

			for (let i = 0; i < this.state.lines.length; i++) {
				children.push(
					<LogLine
						value={this.state.lines[i].data}
						line={this.state.lines[i].line}
					/>
				);
			}

			return <div className="logLines">{children}</div>;
		}
	}

	return {
		logLines: LogLineContainer as any,
	};
})();
