window.CRMLoaded = window.CRMLoaded || {
	listener: null,
	register: (fn) => {
		window.CRMLoaded.listener = fn;
	},
};

type StyleString = Extract<keyof CSSStyleDeclaration, string>;

window.CRMLoaded.register(() => {
	//Because of a chrome bug that causes it to freeze
	// when handling at least this regex string
	// /((.+,(\s+))*(.+)+){(((\s+)(.*)(\s+))+)}/
	// the regex engine cannot be applied, so this
	// will have to do
	function findStylesheetBlocks(text: string) {
		const rules: {
			elements: string;
			ruleText: string;
		}[] = [];

		const textSplit = text.split('}');
		textSplit.slice(0, -1).forEach((block) => {
			const bracketIndex = block.indexOf('{');
			const selector = block.slice(0, bracketIndex).trim();
			const ruleText = block.slice(bracketIndex + 1).trim();
			rules.push({
				elements: selector,
				ruleText: ruleText,
			});
		});
		return rules;
	}

	function makeNum(str: string | number): number {
		if (typeof str === 'number') {
			return str;
		}
		const splitStr = str.split('.');
		let num = ~~str;
		if (splitStr.length > 1) {
			num = num + ~~splitStr[1] / 10;
		}
		return num;
	}

	function calc(terms: (string | number)[]): number {
		let index;
		if ((index = terms.indexOf('*')) > -1) {
			return calc(
				terms
					.slice(0, index - 1)
					.concat([
						makeNum(terms[index - 1]) * makeNum(terms[index + 1]),
					])
					.concat(terms.slice(index + 2))
			);
		} else if ((index = terms.indexOf('/')) > -1) {
			return calc(
				terms
					.slice(0, index - 1)
					.concat([
						makeNum(terms[index - 1]) / makeNum(terms[index + 1]),
					])
					.concat(terms.slice(index + 2))
			);
		} else if (terms.indexOf('-') > -1 || terms.indexOf('+') > -1) {
			terms.forEach((term, index) => {
				if (term === '-') {
					terms[index + 1] = -1 * makeNum(terms[index + 1]);
					terms[index] = '+';
				}
			});
			if (terms.length === 0) {
				return 0;
			} else if (terms.length === 1) {
				return makeNum(terms[0]);
			} else {
				return terms.reduce((prevValue, currentValue) => {
					return makeNum(prevValue) + makeNum(currentValue);
				}) as number;
			}
		} else {
			return makeNum(terms[0]);
		}
	}

	function splitTerms(str: string): string[] {
		let index = 0;
		if ((index = str.indexOf('+')) > -1) {
			return []
				.concat(splitTerms(str.slice(0, index)))
				.concat(['+'])
				.concat(splitTerms(str.slice(index + 1)));
		} else if ((index = str.indexOf('-')) > -1) {
			return []
				.concat(splitTerms(str.slice(0, index)))
				.concat(['-'])
				.concat(splitTerms(str.slice(index + 1)));
		} else if ((index = str.indexOf('*')) > -1) {
			return []
				.concat(splitTerms(str.slice(0, index)))
				.concat(['*'])
				.concat(splitTerms(str.slice(index + 1)));
		} else if ((index = str.indexOf('/')) > -1) {
			return []
				.concat(splitTerms(str.slice(0, index)))
				.concat(['/'])
				.concat(splitTerms(str.slice(index + 1)));
		} else {
			return [str];
		}
	}

	function calculate(str: string): number {
		const parenthesesRegex = /\((.*)\)/;
		let match = null;
		if ((match = parenthesesRegex.exec(str))) {
			return calculate(str.replace(match[0], calculate(match[1]) + ''));
		} else {
			return calc(
				splitTerms(str).map((term) => {
					return term.trim();
				})
			);
		}
	}

	/**
	 * @type {Array<HTMLElement>}
	 */
	let allRoots: (HTMLElement | ShadowRoot)[] = null;

	function getAllRoots() {
		if (allRoots) {
			return allRoots;
		}
		const docEl = document.documentElement;
		allRoots = [docEl as HTMLElement | ShadowRoot].concat(
			getRoots(docEl.children as any)
		);
		return allRoots;
	}

	function querySelectorEverything(selector: string) {
		return flatten<HTMLElement>(
			getAllRoots().map((root: HTMLElement) => {
				return root.querySelectorAll(selector);
			}) as any
		);
	}

	function traverseDom(node: HTMLElement, fn: (node: HTMLElement) => void) {
		fn(node);
		if (node.children) {
			for (let i = 0; i < node.children.length; i++) {
				traverseDom(node.children[i] as HTMLElement, fn);
			}
		}
	}

	function getRoots(children: HTMLElement[]) {
		const roots: ShadowRoot[] = [];
		for (let i = 0; i < children.length; i++) {
			traverseDom(children[i], (node) => {
				if (node.shadowRoot) {
					roots.push(node.shadowRoot);
				}
			});
		}
		return roots;
	}

	function flatten<T>(arr: T[][]): T[] {
		const newArr = [];
		for (let i = 0; i < arr.length; i++) {
			for (let j = 0; j < arr[i].length; j++) {
				newArr.push(arr[i][j]);
			}
		}
		return newArr;
	}

	function breakdownSelector(selector: string) {
		const parts = selector.split(' ');
		let current = querySelectorEverything(parts[0]);
		for (let i = 1; i < parts.length; i++) {
			current = flatten<HTMLElement>(
				current
					.map((node: HTMLElement) => {
						if (node.shadowRoot) {
							return node.shadowRoot;
						}
						return node.shadowRoot;
					})
					.map((node: HTMLElement | ShadowRoot) => {
						return node.querySelectorAll(parts[i]);
					}) as any
			);
		}
		return current;
	}

	function toArr(els: HTMLCollection): HTMLElement[] {
		return Array.prototype.slice.apply(els);
	}

	let calcSupported: boolean;

	const toUpdate: {
		elements: HTMLElement[];
		calculation: string;
		key: StyleString;
	}[] = [];

	window.addCalcFn = (
		element: HTMLElement,
		prop: StyleString,
		calcValue: string,
		disable: boolean
	) => {
		if (
			calcSupported &&
			!disable &&
			prop !== 'length' &&
			prop !== 'parentRule'
		) {
			(element.style as any)[prop] = 'calc(' + calcValue + ')';
			return;
		}

		//Check if it already has an object defined on it
		for (let i = 0; i < toUpdate.length; i++) {
			if (
				toUpdate[i].elements.indexOf(element) > -1 &&
				toUpdate[i].key === prop
			) {
				toUpdate.splice(i, 1);
				break;
			}
		}

		if (disable) {
			return;
		}

		const calcObject = {
			elements: [element],
			calculation: calcValue,
			key: prop,
		};

		toUpdate.push(calcObject);
		updateCalcs();
	};

	function updateCalcs() {
		toUpdate.forEach((calcToUpdate) => {
			const result = calculate(
				calcToUpdate.calculation
					.replace('vw', ' * ' + window.innerWidth / 100)
					.replace('vh', ' * ' + window.innerHeight / 100)
					.replace('em', ' * 16')
					.replace('px', '')
			);
			calcToUpdate.elements.forEach((element) => {
				if (
					calcToUpdate.key !== 'length' &&
					calcToUpdate.key !== 'parentRule'
				)
					(element.style as any)[calcToUpdate.key] = result + 'px';
			});
		});
	}

	(() => {
		const el = document.createElement('div');
		el.style.cssText = 'width: calc(100vw - 100px)';

		calcSupported = !!el.style.length;
		if (!calcSupported) {
			((calcs) => {
				calcs.forEach((calc) => {
					let key = calc.key;
					let dashIndex;
					while ((dashIndex = key.indexOf('-')) > -1) {
						key = (key.slice(0, dashIndex) +
							key[dashIndex + 1].toUpperCase() +
							key.slice(dashIndex + 2)) as StyleString;
					}

					calc.elements = breakdownSelector(calc.elements as string);

					if (!calc.elements) {
						return null;
					}

					const elements = toArr(calc.elements as any);

					if (
						calc.calculation.indexOf('vh') > -1 ||
						calc.calculation.indexOf('vw') > -1
					) {
						toUpdate.push({
							calculation: calc.calculation,
							elements: elements,
							key: key,
						});
					}
					const calcString = calc.calculation
						.replace('vw', ' * ' + window.innerWidth / 100)
						.replace('vh', ' * ' + window.innerHeight / 100)
						.replace('em', ' * 16')
						.replace('px', '');
					const result = calculate(calcString);

					elements.forEach((el) => {
						if (key !== 'length' && key !== 'parentRule') {
							(el.style as any)[key] = result + 'px';
						}
					});
				});

				window.onresize = () => {
					updateCalcs();
				};
			})(
				((stylesheetBlocks) => {
					const calculations: {
						elements: string | HTMLElement[];
						key: StyleString;
						calculation: string;
					}[] = [];

					const calcRegex = /calc\((.+)\)/;
					stylesheetBlocks.forEach((stylesheetBlock) => {
						stylesheetBlock &&
							stylesheetBlock.rules &&
							stylesheetBlock.rules.forEach((stylesheetRule) => {
								let match = null;
								if (
									(match = calcRegex.exec(
										stylesheetRule.value
									))
								) {
									if (
										match[1].indexOf('vh') > -1 ||
										match[1].indexOf('vw') > -1
									) {
										calculations.push({
											elements: stylesheetBlock.elements,
											key: stylesheetRule.key,
											calculation: match[1],
										});
									}
								}
							});
					});
					return calculations;
				})(
					((stylesheetBlocks) => {
						const cssRuleRegex = /(\s*)((\w|-)+)(\s*):(\s*)((\w|%|\/|\*|\+|\(|\)|-|,|\s)+);(\s*)/;
						return stylesheetBlocks
							.map((stylesheetBlock) => {
								if (
									stylesheetBlock.ruleText.indexOf('calc') ===
										-1 ||
									(stylesheetBlock.ruleText.indexOf('vh') ===
										-1 &&
										stylesheetBlock.ruleText.indexOf(
											'vw'
										) === -1)
								) {
									return null;
								}
								const rules: {
									key: StyleString;
									value: string;
								}[] = [];
								const blockMatch = stylesheetBlock.ruleText.match(
									/(\s*)((\w|-)+)(\s*):(\s*)((\w|%|\/|\*|\+|\(|\)|-|,|\s)+);(\s*)/g
								);
								if (blockMatch) {
									blockMatch.forEach((matchedString) => {
										const match = matchedString.match(
											cssRuleRegex
										);
										rules.push({
											key: match[2] as StyleString,
											value: match[6],
										});
									});
									return {
										rules: rules,
										elements: stylesheetBlock.elements,
									};
								}
								return null;
							})
							.filter((block) => block !== null);
					})(
						((stylesheets) => {
							let stylesheetBlocks: {
								elements: string;
								ruleText: string;
							}[] = [];
							stylesheets.forEach((stylesheetContent) => {
								if (
									stylesheetContent.indexOf('calc(') === -1 ||
									(stylesheetContent.indexOf('vh') === -1 &&
										stylesheetContent.indexOf('vw') === -1)
								) {
									return null;
								}

								stylesheetBlocks = stylesheetBlocks.concat(
									findStylesheetBlocks(stylesheetContent)
								);
							});
							return stylesheetBlocks;
						})(
							((
								linkElements: (
									| HTMLLinkElement
									| HTMLStyleElement
								)[]
							) => {
								return linkElements.map((linkElement) => {
									if (linkElement.tagName === 'STYLE') {
										return linkElement.textContent;
									} else {
										const xhr = new XMLHttpRequest();
										xhr.open(
											'GET',
											linkElement.sheet.href,
											false
										);
										xhr.send();
										if (xhr.status === 200) {
											return xhr.responseText;
										} else {
											return '';
										}
									}
								});
							})(
								querySelectorEverything(
									'style, link[rel="stylesheet"]'
								) as (HTMLLinkElement | HTMLStyleElement)[]
							)
						)
					)
				)
			);
		}
		el.remove();
	})();
});
