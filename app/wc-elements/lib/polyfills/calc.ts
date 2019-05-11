function supportsPrefix(prefix: string = ''): boolean {
	const el = document.createElement('div');
	el.style.cssText = prefix + 'width: calc(1px);';
	return !!el.style.length;
};

const supportsCalc = supportsPrefix('');
const supportsWebkitCalc = supportsPrefix('-webkit-');

function makeNum(str: string|number): number {
	if (typeof str === 'number') {
		return str;
	}
	const splitStr = str.split('.');
	let num = ~~str;
	if (splitStr.length > 1) {
		num = num + (~~splitStr[1] / 10);
	}
	return num;
}

function calcTerm(terms: (string|number)[]): number {
	let index;
	if ((index = terms.indexOf('*')) > -1) {
		return calcTerm(terms.slice(0, index - 1).concat([
			makeNum(terms[index - 1]) * makeNum(terms[index + 1])
		]).concat(terms.slice(index + 2)));
	} else if ((index = terms.indexOf('/')) > -1) {
		return calcTerm(terms.slice(0, index - 1).concat([
			makeNum(terms[index - 1]) / makeNum(terms[index + 1])
		]).concat(terms.slice(index + 2)));
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
		return calcTerm(splitTerms(str).map((term) => {
			return term.trim();
		}));
	}
}

export function calc(calcString: string) {
	if (supportsCalc) {
		return `calc(${calcString})`;
	} else if (supportsWebkitCalc) {
		return `-webkit-calc(${calcString})`;
	} else {
		// Calculate the actual contents
		return `${calculate(calcString)}px`;
	}
}