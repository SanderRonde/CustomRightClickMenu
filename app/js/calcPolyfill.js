document.body.addEventListener('CRMLoaded', function() {
	function makeNum(str) {
		if (typeof str === 'number') {
			return str;
		}
		var splitStr = str.split('.');
		var num = ~~str;
		if (splitStr.length > 1) {
			num = num + (~~splitStr[1] / 10);
		}
		return num;
	}

	function calc(terms) {
		var index;
		if ((index = terms.indexOf('*')) > -1) {
			return calc(terms.slice(0, index - 1).concat([
				makeNum(terms[index - 1]) * makeNum(terms[index + 1])
			]).concat(terms.slice(index + 2)));
		} else if ((index = terms.indexOf('/')) > -1) {
			return calc(terms.slice(0, index - 1).concat([
				makeNum(terms[index - 1]) / makeNum(terms[index + 1])
			]).concat(terms.slice(index + 2)));
		} else if (terms.indexOf('-') > -1 || terms.indexOf('+') > -1) {
			var total = 0;
			terms.forEach(function(term, index) {
				if (term === '-') {
					terms[index + 1] = -1 * makeNum(terms[index + 1]);
					terms[index] = '+';
				}
			});
			return terms.reduce(function(prevValue, currentValue){
				return makeNum(prevValue) + makeNum(currentValue);
			});
		} else {
			return makeNum(terms[0]);
		}
	}

	function splitTerms(str) {
		var index = 0;
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

	function calculate(str) {
		var parenthesesRegex = /\((.*)\)/;
		var match = null;
		if ((match = parenthesesRegex.exec(str))) {
			return calculate(str.replace(match[0], calculate(match[1])));
		} else {
			return calc(splitTerms(str).map(function(term) {
				return term.trim();
			}));
		}
	}


	(function() {
		var el = document.createElement('div');
		el.style.cssText = 'width: calc(100vw - 100px)';
		if (!el.style.length) {
			(function(calcs) {
				var toUpdate = [];

				calcs.forEach(function(calc) {
					var key = calc.key;
					var dashIndex;
					while ((dashIndex = key.indexOf('-')) > -1) {
						key = key.slice(0, dashIndex) +
							key[dashIndex + 1].toUpperCase() +
							key.slice(dashIndex + 2); 
					}

					if (!calc.elements) {
						return null;
					}

					var elements = Array.prototype.slice.call(calc.elements);

					var calcString = calc.calculation
						.replace('vw', ' * ' + window.innerWidth / 100)
						.replace('vh', ' * ' + window.innerHeight / 100)
						.replace('em', ' * 16')
						.replace('px', '');
					if (calc.calculation.indexOf('vh') > -1 || calc.calculation.indexOf('vw') > -1) {
						toUpdate.push({
							calculation: calcString,
							elements: elements,
							key: key
						});
					}
					var result = calculate(calcString);

					elements.forEach(function(el) {
						el.style[key] = result + 'px';
					});
				});

				window.onresize = function() {
					toUpdate.forEach(function(calcToUpdate) {
						var result = calculate(calcToUpdate.calculation);
						calcToUpdate.elements.forEach(function(element) {
							element.style[calcToUpdate.key] = result + 'px';
						});
					})
				}
			}(function(stylesheetBlocks) {
				var calculations= [];

				var calcRegex = /calc\((.+)\)/;
				stylesheetBlocks.forEach(function(stylesheetBlock) {
					stylesheetBlock && stylesheetBlock.rules && stylesheetBlock.rules.forEach(function(stylesheetRule) {
						var match = null;
						if ((match = calcRegex.exec(stylesheetRule.value))) {
							if (match[1].indexOf('vh') > -1 || match[1].indexOf('vw') > -1) {
								calculations.push({
									elements: stylesheetBlock.elements,
									key: stylesheetRule.key,
									calculation: match[1]
								});
							}
						}
					});
				});
				return calculations;
			}(function(stylesheetBlocks) {
				var cssRuleRegex = /(\s*)((\w|-)+)(\s*):(\s*)((\w|%|\/|\*|\+|\(|\)|-|,|\s)+);(\s*)/;
				return stylesheetBlocks.map(function(stylesheetBlock) {
					if (stylesheetBlock.ruleText.indexOf('calc') === -1) {
						return null;
					}
					if (stylesheetBlock.ruleText.indexOf('vh') === -1 && stylesheetBlock.ruleText.indexOf('vw') === -1) {
						return null;
					}
					var rules = [];
					var match = null;
					var blockMatch = stylesheetBlock.ruleText.match(/(\s*)((\w|-)+)(\s*):(\s*)((\w|%|\/|\*|\+|\(|\)|-|,|\s)+);(\s*)/g);
					if (blockMatch) {
						blockMatch.forEach(function(matchedString) {
							var match = matchedString.match(cssRuleRegex)
							rules.push({
								key: match[2],
								value: match[6]
							});
						});
						return {
							rules: rules,
							elements: stylesheetBlock.elements
						};
					}
				}).filter(function(block) {
					return block !== null;
				});
			}(function(stylesheets) {
				var stylesheetBlocks = [];
				var cssBlockRegex = /((.+,(\s+))*(.+)+){(((\s+)(.*)(\s+))+)}/;
				stylesheets.forEach(function(stylesheetContent) {
					if (stylesheetContent.indexOf('calc(') === -1) {
						return null;
					}
					if (stylesheetContent.indexOf('vh') === -1 && stylesheetContent.indexOf('vw') === -1) {
						return null;
					}

					var sheetMatch = stylesheetContent.match(/((.+,(\s+))*(.+)+){(((\s+)(.*)(\s+))+)}/g);
					if (sheetMatch) {
						sheetMatch.forEach(function(matchedString) {
							var match = matchedString.match(cssBlockRegex);
							try {
								stylesheetBlocks.push({
									elements: document.querySelectorAll(match[1]),
									ruleText: match[5]
								});
							} catch(e) { }
						});
					}
				});
				return stylesheetBlocks;
			}(function(linkElements) {
				return Array.prototype.slice.call(linkElements).map(function(linkElement) {
					if (linkElement.tagName === 'STYLE') {
						return linkElement.textContent;
					} else {
						var xhr = new XMLHttpRequest;
						xhr.open('GET', linkElement.sheet.href, false);
						xhr.send();
						if (xhr.status === 200) {
							return xhr.responseText;
						} else {
							return '';
						}
					}
				});
			}(document.querySelectorAll('style, link[rel="stylesheet"]')))))))
		}
		dummy.remove();
	})();
});