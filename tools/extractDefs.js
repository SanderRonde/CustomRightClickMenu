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

/**
 * Sanitizes the name to fit the URL bar for linking to the docs webpage
 *
 * @param {string} name - The name to sanitize
 * @returns {string} The sanitized name
 */
function sanitizeName(name) {
	return name.replace(/ /g, '_').toLowerCase();
};

/**
 * Gets the short description (like this line) from given comment lines
 *
 * @param {string[]} commentLines - The lines of which to get the description
 * @returns {string} The description
 */
function getDescr(commentLines) {
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
function adjustType(type) {
	return type.replace(/[B|b]oolean/g, 'bool').replace(/[O|o]bject/g, '?').replace(/[N|n]umber/g, 'number').replace(/[S|s]tring/g, 'string');
}

/**
 * Gets the type (number, function, obj, etc.) at given line
 *
 * @param {string} line
 * @returns {Object} An object containing the type and a lineSplit property,
 *		the lineSplit property is the line split to remove any from-now-on
 *		irrelevant info (such as the type)
 */
function getType(line) {
	var type = line.match(/{([\w|\||\.|~|\[|\]])+}/)[0];
	type = type.slice(1, type.length - 1);
	var lineSplit = line.split(type).slice(1).join(type);

	type = adjustType(type);
	return {
		type: type,
		lineSplit: lineSplit
	};
}

/**
 * Gets the type (number, function, obj, etc.) and name of a parameter/property from given line
 *
 * @param {string} line - The line to analyze
 * @returns {Object} An object containing the type and name
 */
function getTypeAndName(line) {
	var result = getType(line);
	var type = result.type;
	var lineSplit = result.lineSplit;

	var name = lineSplit.trim().split(' ')[0];

	return {
		type: type,
		name: name
	}
}

/**
 * Converts a comment block to its properties in object form from string form
 *
 * @param {string[]} unparsedComment - An array of the lines of the unparsed comment
 * @param {string} descr - The description of a given comment block (the line above the blank line)
 * @returns {Object} An object containing the type of the property (function, typedef etc) and
 *		the properties of it (param, returns, property, etc.)
 */
function convertCommentBlockToProperties(unparsedComment, descr) {
	var isProp = false;
	var isFn = false;
	var isTypedef = false;
	var defs = {};

	var waitFor = null;

	var currentValue;
	for (var i = 0; i < unparsedComment.length; i++) {
		var line = unparsedComment[i].replace('*', '').trim();
		if (line.indexOf('@') === 0) {
			if (waitFor) {
				if (waitFor.dataType === 'param') {
					if (waitFor.isParam) {
						defs.params = defs.params || [];
						waitFor.paramDescr = currentValue.join(' ');
						defs.params.push(waitFor);
					} else {
						waitFor.paramDescr = currentValue.join(' ');
						defs.returns = waitFor;
					}
				} else {
					defs.props = defs.props || [];
					waitFor.propDescr = currentValue.join(' ');
					defs.props.push(waitFor);
				}
				waitFor = null;
			}


			var isCb;
			var type;
			var name;
			var result;
			if (line.indexOf('@noLog') === 0) {
				return null;
			} else if (line.indexOf('@permission') === 0) {
				defs.permissions = defs.permissions || [];
				defs.permissions.push(line.split('@permission')[1].trim());
			} else if (line.indexOf('@type') === 0 && line.indexOf('@typedef') === -1) {
				isProp = true;
				type = line.split('@type')[1].trim();
				defs.type = adjustType(type);
			} else if ((!isCb && line.indexOf('@param') === 0) || line.indexOf('@returns') === 0) {
				isFn = true;
				result = getType(line);
				type = result.type;
				var lineSplit = result.lineSplit;

				var isParam = line.indexOf('@param') === 0;

				var param;
				if (isParam) {
					param = lineSplit.trim().match(/[\w|\[|\]|.|0-9]+/)[0];
					currentValue = [lineSplit.split('-')[1].trim()];
				} else {
					currentValue = lineSplit.split('}')[1].trim();
					if (currentValue[0] === '-') {
						currentValue = [currentValue.slice(1).trim()];
					} else {
						currentValue = [currentValue];
					}
				}

				waitFor = {
					type: type,
					paramName: param,
					isParam: isParam,
					dataType: 'param'
				}
			} else if (line.indexOf('@augments') === 0) {
				isTypedef = true;
				defs.proto = line.split('@augments')[1].trim().split('~')[1];
			} else if (line.indexOf('@typedef') === 0 || (isCb = line.indexOf('@callback') === 0)) {
				isTypedef = true;
				if (isCb) {
					type = '?';
					name = line.split('@callback')[1].trim();
				} else {
					type = line.split('{')[1].split('}')[0];
					name = line.split(type)[1].split('}')[1].trim();
				}

				defs.type = type;
				defs.name = name;
			} else if (line.indexOf('@property') === 0 || line.indexOf('@param') === 0) {
				isTypedef = true;
				result = getTypeAndName(line);
				type = result.type;
				var paramSplit = line.split('}')[1].split('-');
				name = paramSplit[0].trim();
				currentValue = [paramSplit[1].trim()];

				waitFor = {
					type: type,
					name: name,
					dataType: 'property'
				};
			} else if (line.indexOf('@see') === 0) {
				var url = line.split('@link')[1].split('}')[0].trim();
				defs.url = url;
			}
		} else {
			currentValue && currentValue.push(line);
		}
	}

	if (waitFor) {
		if (waitFor.dataType === 'param') {
			if (waitFor.isParam) {
				defs.params = defs.params || [];
				waitFor.paramDescr = currentValue.join(' ');
				defs.params.push(waitFor);
			} else {
				waitFor.paramDescr = currentValue.join(' ');
				defs.returns = waitFor;
			}
		} else {
			defs.props = defs.props || [];
			waitFor.propDescr = currentValue.join(' ');
			defs.props.push(waitFor);
		}
		waitFor = null;
	}

	var resultType;
	if (isProp) {
		resultType = 'prop';
	} else if (isFn) {
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
 * Parses given comment block
 *
 * @param {Object} detailedDefs - The object to store the detailed definitions
 * @param {Object} defines - The object to store any defines (new classes/types)
 * @param {Object} cont - The object to store the regular, less detailed definitions
 * @param {string[]} lines - All lines in an array
 * @param {number} start - The line at which the comment block starts
 * @param {number} end - The line at which the comment block ends
 * @param {string} location - The location of this comment block in reference to the global scope
 *		(if it's in window.x.y the location is x.y)
 * @param {boolean} isTypeDef - True if this is a typedef block
 * @param {boolean} isTernExtraction - True if this is a tern extraction (less detailed, more specific)
 * @param {string} docsLoc - The location of the docs webpage
 */
function parseCommentBlock(detailedDefs, defines, cont, lines, start, end, location, isTernExtraction, docsLoc) {
	var commentLines = lines.slice(start + 1, end);
	var unparsedComment = commentLines;
	var descr = getDescr(unparsedComment).join(' ');

	var result = convertCommentBlockToProperties(unparsedComment, descr);
	if (result) {
		var defs = result.defs;
		var type;
		var i;
		switch (result.type) {
			case 'fn':
				var paramString = [];
				if (defs.params) {
					detailedDefs.params = [];
					for (i = 0; i < defs.params.length; i++) {
						var paramName = defs.params[i].paramName;
						var lastChar = paramName.length - 1;
						var isOptional = false;
						if (paramName[0] === '[' && paramName[lastChar] === ']') {
							isOptional = true;
							paramName = paramName.slice(1, lastChar);
						}
						type = defs.params[i].type;
						type = type.replace(/([\w|\?]+)\[\]/g, '[$1]');
						type = type.split('~');
						if (type[1]) {
							type = type[1];
						} else {
							type = type[0];
						}
						if (paramName.indexOf('.') === -1) {
							paramString.push(paramName + (isOptional ? '?' : '') + ': ' + type);
						}

						if (!isTernExtraction) {
							detailedDefs.params.push({
								type: type,
								name: paramName,
								isOptional: isOptional,
								descr: defs.params[i].paramDescr
							});
						}
					}
				}

				var returnString = '';
				if (defs.returns) {
					var returnType = defs.returns.type;
					returnType = returnType.replace(/([\w|\?]+)\[\]/g, '[$1]');
					returnString = ' -> ' + returnType;

					if (!isTernExtraction) {
						detailedDefs.returns = {
							type: returnType,
							descr: defs.returns.paramDescr
						}
					}
				}

				if (isTernExtraction) {
					cont['!type'] = 'fn(' + paramString.join(', ') + ')' + returnString;
					cont['!url'] = docsLoc + '#' + sanitizeName(location);
					cont['!doc'] = defs['!doc'];
				} else {
					detailedDefs.type = 'function';
					detailedDefs.descr = defs['!doc'];
					detailedDefs.url = defs.url;
					detailedDefs.permissions = defs.permissions;
				}
				break;
			case 'define':
				var val = {};
				if (!isTernExtraction) {
					if (detailedDefs[defs.name]) {
						detailedDefs = detailedDefs[defs.name];
					} else {
						detailedDefs[defs.name] = {};
						detailedDefs = detailedDefs[defs.name];
					}
					detailedDefs.props = [];
				}
				for (i = 0; i < defs.props.length; i++) {
					var propType = defs.props[i].type.replace(/([\w|\?]+)\[\]/g, '[$1]');
					if (!isTernExtraction) {
						detailedDefs.props.push({
							name: defs.props[i].name,
							type: propType,
							descr: defs.props[i].propDescr
						});
					}
					if (!defs.props[i].name.indexOf('.') > -1) {
						val[defs.props[i].name] = propType;
					}
				}
				defs.proto && (val['!proto'] = defs.proto);
				defs.name = defs.name.split('~')[1];
				val['!url'] = docsLoc + '#' + sanitizeName(defs.name);

				if (isTernExtraction) {
					defines[defs.name] = val;
				} else {
					detailedDefs.type = 'define';
					detailedDefs.descr = descr;
					detailedDefs.name = defs.name;
					detailedDefs.proto = defs.proto;
				}
				break;
			case 'prop':
				type = defs.type;
				if (type && type.indexOf('[]') > 0) {
					type = '[' + type.slice(0, type.length - 2) + ']';
				}
				defs.type = defs.type.split('~');
				if (defs.type[1]) {
					defs.type = defs.type[1];
				} else {
					defs.type = defs.type[0];
				}

				if (isTernExtraction) {
					if (type !== '?') {
						cont['!type'] = defs.type;
					}
					cont['!doc'] = defs['!doc'];
					cont['!url'] = docsLoc + '#' + sanitizeName(location);
				}
				var locSplit = location.split('-');

				if (!isTernExtraction) {
					detailedDefs.name = locSplit[locSplit.length - 1];
					detailedDefs.descr = defs['!doc'];
					if (type === '?') {
						detailedDefs.type = 'section';
					} else {
						detailedDefs.type = 'prop';
						detailedDefs.dataType = defs.type;
					}
				}
				break;
		}
	}
}

/**
 * Extracts the definitions from given lines
 *
 * @param {Object} detailedDefs - The object to store the detailed definitions
 * @param {Object} definitions - The object to store the regular, less detailed definitions
 * @param {Object} defines - The object to store any defines (new classes/types)
 * @param {string[]} lines - All lines in an array
 * @param {number} lineNumber - The line number the to-analyze code is at
 * @param {boolean} isTypeDef - True if this is a typedef block
 * @param {boolean} isTernExtraction - True if this is a tern extraction (less detailed, more specific)
 * @param {string} docsLoc - The location of the docs webpage
 */
function extractDefsFromLine(detailedDefs, definitions, defines, lines, lineNumber, isTypeDef, isTernExtraction, docsLoc) {
	var line = lines[lineNumber].slice(1);

	var location = [];
	var cont = definitions;
	if (!isTypeDef) {
		var definition = line.match(/this\.([a-z|A-Z|0-9|_|\.]+)/)[1];
		var definitionSplit = definition.split('.');

		for (var i = 0; i < definitionSplit.length; i++) {
			if (cont[definitionSplit[i]]) {
				detailedDefs = detailedDefs[definitionSplit[i]];
				cont = cont[definitionSplit[i]];
			} else {
				cont[definitionSplit[i]] = {};
				detailedDefs[definitionSplit[i]] = {};
				detailedDefs = detailedDefs[definitionSplit[i]];
				cont = cont[definitionSplit[i]];
			}
			detailedDefs.name = definitionSplit[i];
			location.push(definitionSplit[i]);
		}
	}

	//Get the comment block
	var currentLine = lineNumber;
	var commentBlockEnd = lineNumber - 1;
	for (; lines[currentLine].indexOf('/*') === -1; currentLine--) {
	}
	var commentBlockStart = currentLine;

	parseCommentBlock(detailedDefs, defines, cont, lines, commentBlockStart, commentBlockEnd, location.join('-'), isTernExtraction, docsLoc);
}

/**
 * Gets the indentation used in this file
 *
 * @param {string[]} lines - The lines in the file
 * @returns {number} The indentation size (number of spaces or 1 for tabs)
 */
function getIndentation(lines) {
	var fnRegex = /function(\s+)CrmAPIInit/;
	var i = -1;
	while (!lines[++i].match(fnRegex)) {}

	//Line lines[i] is now the main function declaration,next line should contain indenting
	if (lines[i+1].indexOf('{') === -1) {
		//If the function declaration hasn't been passed through to the next line
		i += 1;
	} else {
		i += 2;
	}

	var firstLineRegex = /((\s)+)\w/;
	var match = lines[i].match(firstLineRegex);
	return match[1].split(' ').length;
}

/**
 * Extracts the definitions from given JS
 *
 * @param {string} js - The JS to analyze
 * @param {boolean} isTernExtraction - If the extraction is a tern extraction (less detailed, more specific)
 * @param {string} docsLoc - The location of the docs webpage
 * @returns {Object} The detailed definitions or the tern definitons
 */
function extractDefs(js, isTernExtraction, docsLoc) {
	var detailedDefs = {};
	var definitions = {};
	var defines = {};

	var lines = js.split('\n');

	var indentation = getIndentation(lines);
	console.log('used indentation is', indentation, '\\s');

	var searchingCommentEnd = false;
	var propRegex = new RegExp('(\\s{' + indentation * 2 + '})this.(\\w+)');
	var typeDefRegex = new RegExp(/(\s+)\* @typedef/);
	var callbackRegex = new RegExp(/(\s+)\* @callback/);
	for (var i = 0; i < lines.length; i++) {
		var match = lines[i].match(propRegex);
		if (match && lines[i].indexOf(match[0]) === 0) {
			extractDefsFromLine(detailedDefs, definitions, defines, lines, i, false, isTernExtraction, docsLoc);
		} else if (lines[i].match(typeDefRegex) || lines[i].match(callbackRegex)) {
			//Find end of comment
			searchingCommentEnd = true;
		} else {
			if (searchingCommentEnd) {
				if (lines[i].trim() === '*/') {
					searchingCommentEnd = false;
					extractDefsFromLine(detailedDefs, definitions, defines, lines, i + 1, true, isTernExtraction, docsLoc);
				}
			}
		}
	}

	return (isTernExtraction ?
			{
				'!name': 'crmAPI',
				'crmAPI': definitions,
				'!define': defines
			}
		:
			detailedDefs
	);
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
			var result = extractDefs(grunt.file.read(sourceFile), isTern,
				(options.local ? '/html/crmAPIDocs.html' : 'https://www.sanderronde.github.io/'));

			result = generators[options.type].generate(result, options);

			grunt.log.ok('Created ' + options.type + ' defs, ' + sourceFile + ' -> ' + destFile);
			grunt.file.write(destFile, result);
		});
	});
}