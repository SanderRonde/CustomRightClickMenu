var path = require('path');
var util = require('util');
var generators = {
	html: require('./defGenerators/htmlGenerator'),
	tern: {
		generate: function(defs) {
			return 'window.crmAPIDefs = ' + JSON.stringify(defs);
		}
	},
	json: {
		generate: function(defs) {
			return JSON.stringify(defs);
		}
	}
}

var extractDefs = class ExtractDefs {
	/**
	 * Sanitizes the name to fit the URL bar for linking to the docs webpage
	 *
	 * @param {string} name - The name to sanitize
	 * @returns {string} The sanitized name
	 */
	static sanitizeName(name) {
		return name.replace(/ /g, '_').toLowerCase();
	}

	/**
	 * Gets the short description (like this line) from given comment lines
	 *
	 * @param {string[]} commentLines - The lines of which to get the description
	 * @returns {string[]} The description
	 */
	static getDescr(commentLines) {
		var descr = [];
		for (var line = 0; line < commentLines.length;) {
			if (commentLines[line].trim() === '*') {
				commentLines.splice(line, 1);
				break;
			} else {
				descr.push(commentLines.splice(line, 1)[0].trim().replace('*', '').trim());
			}
		}
		return descr;
	}

	/**
	 * Adjusts the type to the way tern wants them
	 *
	 * @param {string} type - The type to adjust
	 * @returns {string} The type, adjusted
	 */
	static adjustType(type) {
		return type.replace(/[B|b]oolean/g, 'bool')
			.replace(/[O|o]bject/g, '?')
			.replace(/[N|n]umber/g, 'number')
			.replace(/[S|s]tring/g, 'string');
	}

	/**
	 * Gets the type (number, function, obj, etc.) at given line
	 *
	 * @param {string} line
	 */
	static getType(line) {
		var type = line.match(/{([\w|\||\.|~|\[|\]])+}/)[0];
		type = type.slice(1, type.length - 1);
		var lineSplit = line.split(type).slice(1).join(type);

		type = this.adjustType(type);
		return {
			type: type,
			lineSplit: lineSplit
		};
	}

	/**
	 * Gets the type (number, function, obj, etc.) and name of a parameter/property from given line
	 *
	 * @param {string} line - The line to analyze
	 */
	static getTypeAndName(line) {
		var result = this.getType(line);
		var type = result.type;
		var lineSplit = result.lineSplit;

		var name = lineSplit.trim().split(' ')[0];

		return {
			type: type,
			name: name
		}
	}

	/**
	 * Updates the waitFor state part of the comment block to properties 
	 * conversion function
	 * 
	 * @param {Object} defs - The definitions found this far
	 * @param {Object} state - The state object
	 */
	updateCommentBlockWaitForState(defs, state) {
		if (state.waitFor) {
			if (state.waitFor.dataType === 'param') {
				if (state.waitFor.isParam) {
					defs.params = defs.params || [];
					state.waitFor.paramDescr = state.currentValue.join(' ');
					defs.params.push(state.waitFor);
				} else {
					state.waitFor.paramDescr = state.currentValue.join(' ');
					defs.returns = state.waitFor;
				}
			} else {
				defs.props = defs.props || [];
				state.waitFor.propDescr = state.currentValue.join(' ');
				defs.props.push(state.waitFor);
			}
			state.waitFor = null;
		}
	}

	/**
	 * Handles converting a param or return line in a comment block
	 * 
	 * @param {Object} state - The state of the conversion
	 * @param {string} line - The line to convert
	 */
	handleParamOrReturnLine(state, line) {
		state.isFn = true;
		const {type, lineSplit} = ExtractDefs.getType(line);
		var isParam = line.indexOf('@param') === 0;

		var param;
		if (isParam) {
			param = lineSplit.trim().match(/[\w|\[|\]|.|0-9]+/)[0];
			state.currentValue = [lineSplit.split('-')[1].trim()];
		} else {
			const currentValueStr = lineSplit.split('}')[1].trim();
			if (currentValueStr[0] === '-') {
				state.currentValue = [currentValueStr.slice(1).trim()];
			} else {
				state.currentValue = [currentValueStr];
			}
		}

		state.waitFor = {
			type: type,
			paramName: param,
			isParam: isParam,
			dataType: 'param',
		}
	}

	/**
	 * Handles converting a typedef or callback line in a comment block
	 * 
	 * @param {Object} state - The state of the conversion
	 * @param {string} line - The line to convert
	 * @param {Object} defs - The definitions found this far
	 */
	handleTypedefOrCallbackLine(state, line, defs) {
		state.isTypedef = true;
		let type;
		let name;
		if (line.indexOf('@callback') === 0) {
			type = '?';
			name = line.split('@callback')[1].trim();
		} else {
			type = line.split('{')[1].split('}')[0];
			name = line.split(type)[1].split('}')[1].trim();
		}

		defs.type = type;
		defs.name = name;
	}

	/**
	 * Handles converting a property line in a comment block
	 * 
	 * @param {Object} state - The state of the conversion
	 * @param {string} line - The line to convert
	 */
	handleProperty(state, line) {
		state.isTypedef = true;
		const {type} = ExtractDefs.getTypeAndName(line);
		var paramSplit = line.split('}')[1].split('-');
		const name = paramSplit[0].trim();
		state.currentValue = [paramSplit[1].trim()];

		state.waitFor = {
			type: type,
			name: name,
			dataType: 'property',
			isParam: false,
		};
	}

	/**
	 * Converts a comment block to its properties in object form from string form
	 *
	 * @param {string[]} unparsedComment - An array of the lines of the unparsed comment
	 * @param {string} descr - The description of a given comment block (the line above the blank line)
	 */
	convertCommentBlockToProperties(unparsedComment, descr) {
		const state = {
			isProp: false,
			isFn: false,
			isTypedef: false,
			waitFor: null,
			currentValue: null
		}
		var defs = {};

		for (var i = 0; i < unparsedComment.length; i++) {
			var line = unparsedComment[i].replace('*', '').trim();
			if (line.indexOf('@') === 0) {
				this.updateCommentBlockWaitForState(defs, state);

				if (line.indexOf('@noLog') === 0) {
					return null;
				} else if (line.indexOf('@permission') === 0) {
					defs.permissions = defs.permissions || [];
					defs.permissions.push(line.split('@permission')[1].trim());
				} else if (line.indexOf('@type') === 0 && line.indexOf('@typedef') === -1) {
					state.isProp = true;
					const type = line.split('@type')[1].trim();
					defs.type = ExtractDefs.adjustType(type);
				} else if (line.indexOf('@param') === 0 || line.indexOf('@returns') === 0) {
					this.handleParamOrReturnLine(state, line);
				} else if (line.indexOf('@augments') === 0) {
					state.isTypedef = true;
					defs.proto = line.split('@augments')[1].trim();
				} else if (line.indexOf('@typedef') === 0 || line.indexOf('@callback') === 0) {
					this.handleTypedefOrCallbackLine(state, line, defs);
				} else if (line.indexOf('@property') === 0) {
					this.handleProperty(state, line);
				} else if (line.indexOf('@see') === 0) {
					var url = line.split('@link')[1].split('}')[0].trim();
					defs.url = url;
				}
			} else {
				state.currentValue && state.currentValue.push(line);
			}
		}

		this.updateCommentBlockWaitForState(defs, state);

		var resultType;
		if (state.isProp) {
			resultType = 'prop';
		} else if (state.isFn) {
			resultType = 'fn';
		} else {
			resultType = 'define';
		}
		defs['!doc'] = descr;
		return {
			type: resultType,
			defs: defs
		}
	}

	/**
	 * Parses the params for a given comment block
	 * 
	 * @param {Object} defs - The definitions that have been found
	 * @param {Object} detailedDefs - The detailedDefs portion of this symbol
	 */
	parseParams(defs, detailedDefs) {
		const paramString = [];
		detailedDefs.params = [];
		for (let i = 0; i < defs.params.length; i++) {
			var paramName = defs.params[i].paramName;
			var lastChar = paramName.length - 1;
			var isOptional = false;
			if (paramName[0] === '[' && paramName[lastChar] === ']') {
				isOptional = true;
				paramName = paramName.slice(1, lastChar);
			}
			let type = defs.params[i].type;
			type = type.replace(/([\w|\?]+)\[\]/g, '[$1]');
			if (paramName.indexOf('.') === -1) {
				paramString.push(paramName + (isOptional ? '?' : '') + ': ' + type);
			}

			if (!this.isTernExtraction) {
				var data = {
					type: type,
					name: paramName,
					isOptional: isOptional,
					descr: defs.params[i].paramDescr
				};
				if (this.defines[type]) {
					data.linkTo = this.defines[type];
				}
				detailedDefs.params.push(data);
			}
		}
		return paramString;
	}

	/**
	 * Parses the return section for a given function comment block
	 * 
	 * @param {Object} defs - The definitions that have been found
	 * @param {Object} detailedDefs - The detailedDefs portion of this symbol
	 */
	parseReturn(defs, detailedDefs) {
		var returnType = defs.returns.type;
		returnType = returnType.replace(/([\w|\?]+)\[\]/g, '[$1]');
		const returnString = ' -> ' + returnType;

		if (!this.isTernExtraction) {
			detailedDefs.returns = {
				type: returnType,
				descr: defs.returns.paramDescr
			}
		}
		return returnString;
	}

	/**
	 * Parses given function comment block
	 *
	 * @param {Object} cont - The object to store the regular, less detailed definitions
	 * @param {Object} defs - The definitions that have been found
	 * @param {Object} detailedDefs - The detailedDefs portion of this symbol
	 * @param {string} location - The location of this comment block in its parent objects
	 */
	parseFnCommentBlock(cont, defs, detailedDefs, location) {
		const paramString = defs.params ? this.parseParams(defs, detailedDefs) : [];
		const returnString = defs.returns ? this.parseReturn(defs, detailedDefs) : '';

		if (this.isTernExtraction) {
			cont['!type'] = 'fn(' + paramString.join(', ') + ')' + returnString;
			cont['!url'] = this.docsLoc + '#' + ExtractDefs.sanitizeName(location);
			cont['!doc'] = defs['!doc'];
		} else {
			detailedDefs.type = 'function';
			detailedDefs.descr = defs['!doc'];
			detailedDefs.url = defs.url;
			detailedDefs.permissions = defs.permissions;
		}
	}

	/**
	 * Parses given function comment block
	 *
	 * @param {Object} cont - The object to store the regular, less detailed definitions
	 * @param {Object} defs - The definitions that have been found
	 * @param {Object} detailedDefs - The detailedDefs portion of this symbol
	 * @param {string} descr - The description of the comment block
	 */
	parseDefineCommentBlock(cont, defs, detailedDefs, descr) {
		var val = {};
		if (!this.isTernExtraction) {
			if (!detailedDefs[defs.name]) {
				detailedDefs[defs.name] = {};
			}
			detailedDefs = detailedDefs[defs.name];
			detailedDefs.props = [];
		}
		for (let i = 0; defs.props && i < defs.props.length; i++) {
			var propType = defs.props[i].type.replace(/([\w|\?]+)\[\]/g, '[$1]');
			if (!this.isTernExtraction) {
				detailedDefs.props.push({
					name: defs.props[i].name,
					type: propType,
					descr: defs.props[i].propDescr
				});
			}
			val[defs.props[i].name] = propType;
		}
		defs.proto && (val['!proto'] = defs.proto);
		val['!url'] = this.docsLoc + '#' + ExtractDefs.sanitizeName(defs.name);

		if (this.isTernExtraction) {
			this.defines[defs.name] = val;
		} else {
			this.defines[defs.name] = '#' + ExtractDefs.sanitizeName(defs.name);
			detailedDefs.type = 'define';
			detailedDefs.descr = descr;
			detailedDefs.name = defs.name;
			detailedDefs.proto = defs.proto;
		}
	}

	/**
	 * Parses given function comment block
	 *
	 * @param {Object} cont - The object to store the regular, less detailed definitions
	 * @param {Object} defs - The definitions that have been found
	 * @param {Object} detailedDefs - The detailedDefs portion of this symbol
	 * @param {string} location - The location of this comment block in its parent objects
	 */
	parsePropCommentBlock (cont, defs, detailedDefs, location) {
		let type = defs.type;
		if (type && type.indexOf('[]') > 0) {
			var arrayContents = type.slice(0, type.length - 2);
			if (this.defines[arrayContents]) {
				detailedDefs.linkTo = this.defines[arrayContents];
			}
			type = '[' + arrayContents + ']';
		} else if (type) {
			if (this.defines[type]) {
				detailedDefs.linkTo = this.defines[type];
			}
		}

		if (this.isTernExtraction) {
			if (type !== '?') {
				cont['!type'] = defs.type;
			}
			cont['!doc'] = defs['!doc'];
			cont['!url'] = this.docsLoc + '#' + ExtractDefs.sanitizeName(location);
		}
		var locSplit = location.split('-');

		if (!this.isTernExtraction) {
			detailedDefs.name = locSplit[locSplit.length - 1];
			detailedDefs.descr = defs['!doc'];
			if (type === '?') {
				detailedDefs.type = 'section';
			} else {
				detailedDefs.type = 'prop';
				detailedDefs.dataType = defs.type;
			}
		}
	}

	/**
	 * Parses given comment block
	 *
	 * @param {Object} cont - The object to store the regular, less detailed definitions
	 * @param {number} start - The line at which the comment block starts
	 * @param {number} end - The line at which the comment block ends
	 * @param {string} location - The location of this comment block in reference to the global scope
	 *		(if it's in window.x.y the location is x.y)
	 * @param {Object} detailedDefs - The detailedDefs portion of this symbol
	 * @param {boolean} isTypedef - Whether this is a typedef block
	 */
	parseCommentBlock(cont, start, end, location, detailedDefs, isTypedef) {
		var commentLines = this.lines.slice(start + 1, end);
		var descr = ExtractDefs.getDescr(commentLines).join(' ');
		var commentBlockProperties = this.convertCommentBlockToProperties(commentLines, descr);
		if (commentBlockProperties) {
			var defs = commentBlockProperties.defs;
			if (commentBlockProperties.type === 'define' || isTypedef) {
				this.parseDefineCommentBlock(cont, defs, detailedDefs, descr);
			} else if (commentBlockProperties.type === 'fn') {
				this.parseFnCommentBlock(cont, defs, detailedDefs, location);
			} else if (commentBlockProperties.type === 'prop') {
				this.parsePropCommentBlock(cont, defs, detailedDefs, location);
			}
		}
	}

	/**
	 * Extracts the definitions from given lines
	 *
	 * @param {number} lineNumber - The line number the to-analyze code is at
	 * @param {boolean} isTypeDef - True if this is a typedef block
	 * @param {Object[]} parents - The parent objects that the current line is in
	 */
	extractDefsFromLine(lineNumber, isTypeDef, parents) {
		var line = this.lines[lineNumber].slice(1);

		if (line.match(this.privateRegex) || (parents.length > 0 && parents.filter((value) => {
			return value.private;
		}).length > 0)) {
			return;
		}

		var location = [];
		var cont = this.definitions;
		let detailedDefsCopy = this.detailedDefs;
		if (!isTypeDef) {
			var definition = line.match(/([a-z|A-Z|0-9|_|\.]+)/)[1];
			var scope = parents.concat({
				name: definition
			});
		
			for (var i = 0; i < scope.length; i++) {
				const scopeName = scope[i].name;
				if (!cont[scopeName]) {
					cont[scopeName] = {};
					detailedDefsCopy[scopeName] = {};
				}
				detailedDefsCopy = detailedDefsCopy[scopeName];
				cont = cont[scopeName];
				detailedDefsCopy.name = scopeName;
				location.push(scopeName);
			}
		}

		//Get the comment block
		var currentLine = lineNumber;
		var commentBlockEnd = lineNumber - 1;
		for (; this.lines[currentLine].indexOf('/*') === -1; currentLine--) { }
		var commentBlockStart = currentLine;

		this.parseCommentBlock(cont, commentBlockStart, commentBlockEnd, location.join('-'), 
			detailedDefsCopy, isTypeDef);
	}

	/**
	 * Gets the indentation used in this file
	 *
	 * @param {string[]} lines - The lines in the file
	 */
	static getIndentation(lines) {
		var fnRegex = /class CrmAPIInit/;
		var i = -1;
		while (!lines[++i].match(fnRegex)) {}

		var firstLineRegex = /(\s+)./;
		var match = lines[i + 1].match(firstLineRegex);
		return [match[1].split('\t').length - 1, i + 1];
	}

	/**
	 * Generates regexes for indentation in- and decrease
	 * 
	 * @param {number} currentIndentation - The indentation right now
	 */
	static genIndentationRegexes(currentIndentation) {
		return {
			increase: new RegExp('(\\t{' + currentIndentation + '})(\\w+)(( =)|(:)) ({|class .*)(\\r)?\\n(\\t{' + (currentIndentation + 1) + '}).'),
			decrease: new RegExp('(\\t{' + currentIndentation + '})\\}(\\r)?\\n(\\t{' + (currentIndentation - 1) + '})\\}'),
			propRegex: new RegExp('(\\t{' + currentIndentation + '})(\\w+)'),
			typeDefRegex: new RegExp(/(\s+)\* @typedef/),
			callbackRegex: new RegExp(/(\s+)\* @callback/)
		}
	}

	/**
	 * Gets the results of the given regex if any
	 * 
	 * @param {RegExp} regex - The expression to run
	 * @param {string} string - The string to check
	 * @param {Function} ifTrue - The index of the result
	 * @param {boolean} first - Has to be the first chars
	 */
	getRegexResults(regex, string, ifTrue, first) {
		const result = string.match(regex);
		if (result && string.indexOf(result[0]) === 0) {
			ifTrue(result);
		}
	}

	/**
	 * Extracts the definitions from given JS
	 */
	extractDefs() {
		var [ indentation, i ] = ExtractDefs.getIndentation(this.lines);
		var currentIndentation = indentation;

		var searchingCommentEnd = false;
		var parents = [];
		for (; i < this.lines.length; i++) {
			const indentationRegexes = ExtractDefs.genIndentationRegexes(currentIndentation);
			const propRegexMatch = this.lines[i].match(indentationRegexes.propRegex);
			if (propRegexMatch && this.lines[i].indexOf(propRegexMatch[0]) === 0) {
				this.extractDefsFromLine(i, false, parents);
			} else if (this.lines[i].match(indentationRegexes.typeDefRegex) || 
					this.lines[i].match(indentationRegexes.callbackRegex)) {
				//Find end of comment
				searchingCommentEnd = true;
			} else if (searchingCommentEnd && this.lines[i].trim() === '*/') {
				searchingCommentEnd = false;
				this.extractDefsFromLine(i + 1, true, parents);
			}

			this.getRegexResults(indentationRegexes.increase, this.lines.slice(i, i + 2).join('\n'), (res) => {
				parents.push({
					private: !!this.lines[i].match(this.privateRegex),
					name: res[2]
				});
				currentIndentation += 1;
			}, true);
			this.getRegexResults(indentationRegexes.decrease, this.lines.slice(i, i + 2).join('\n'), (res) => {
				parents.pop();
				currentIndentation -= 1;
			}, true);
		}

		return (this.isTernExtraction ? {
				'!name': 'crmAPI',
				'crmAPI': this.definitions,
				'!define': this.defines
			} : this.detailedDefs
		);
	}

	constructor(js, isTernExtraction, docsLoc) {
		this.isTernExtraction = isTernExtraction;
		this.docsLoc = docsLoc;
		this.lines = js.split('\n');

		this.detailedDefs = {}
		this.definitions = {}
		this.defines = {};

		this.privateRegex = /((private)? _)|constructor|_init|static/;
	}
}

module.exports = function (grunt) {
	grunt.registerMultiTask('extractCrmDefs', 'Extacts the definitions and HTML for a help page for the crmapi.js file', function () {
		var _this = this;
		this.files.forEach(function (file) {
			var options = _this.options({
				type: 'tern',
				local: true
			});
			var destFile = file.dest;
			var sourceFile = file.src[0];
			var isTern = options.type === 'tern' || options.type === 'json';
			const instance = new extractDefs(grunt.file.read(sourceFile), isTern,
				'https://www.sanderronde.github.io/documentation/');
			var result = instance.extractDefs();

			result = generators[options.type].generate(result, options);

			grunt.log.ok('Created ' + options.type + ' defs, ' + sourceFile + ' -> ' + destFile);
			grunt.file.write(destFile, result);
		});
	});
}