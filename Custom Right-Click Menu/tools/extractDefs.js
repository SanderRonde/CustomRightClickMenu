var path = require('path');
var util = require('util');

var crmAPIFileLoc = '/crmapiDoc.html';

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

function adjustType(type) {
	return type.replace(/[B|b]oolean/g, 'bool').replace(/[O|o]bject/g, '?').replace(/[N|n]umber/g, 'number').replace(/[S|s]tring/g, 'string');
}

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

function convertCommentBlockToProperties(unparsedComment, descr) {
	var isProp = false;
	var isFn = false;
	var isTypedef = false;
	var defs = {};

	var currentProp;
	var currentValue;
	for (var i = 0; i < unparsedComment.length; i++) {
		var line = unparsedComment[i].replace('*', '').trim();
		if (line.indexOf('@') === 0) {
			var isCb;
			var type;
			var name;
			var result;
			if (line.indexOf('@type') === 0 && line.indexOf('@typedef') === -1) {
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
					if (param.indexOf('.') > -1) {
						//It's a sub-property, ignore
						continue;
					}
				}

				currentValue = [lineSplit.split('-')[1]];

				currentProp = {
					type: type,
					paramName: param,
					isParam: isParam
				};

				if (isParam) {
					defs.params = defs.params || [];
					defs.params.push(currentProp);
				} else {
					defs.returns = currentProp;
				}
			} else if (line.indexOf('@augments') === 0) {
				isTypedef = true;
				defs.proto = line.split('@augments')[1].trim();
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
				name = line.split('}')[1].split('-')[0].trim();
				if (name.indexOf('.') > 0) {
					//Sub-property, ignore
					continue;
				}

				defs.props = defs.props || [];
				defs.props.push({
					type: type,
					name: name
				});
			}
			else if (line.indexOf('@see') === 0) {
				var url = line.split('@link')[1].split('}')[0].trim();
				defs.url = url;
			}
		} else {
			currentValue && currentValue.push(line);
		}
	}
	var resultType;
	if (isProp) {
		resultType = 'prop';
	}
	else if (isFn) {
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

function parseCommentBlock(defines, cont, lines, start, end) {
	var commentLines = lines.slice(start + 1, end);
	var unparsedComment = commentLines;
	var descr = getDescr(unparsedComment).join(' ');

	var result = convertCommentBlockToProperties(unparsedComment, descr);
	var defs = result.defs;
	var type;
	var i;
	switch (result.type) {
		case 'fn':
			var paramString = [];
			if (defs.params) {
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
					paramString.push(paramName + (isOptional ? '?' : '') + ': ' + type);
				}
			}

			var returnString = '';
			if (defs.returns) {
				var returnType = defs.returns.type;
				returnType = returnType.replace(/([\w|\?]+)\[\]/g, '[$1]');
				returnString = ' -> ' + returnType;
			}

			cont['!type'] = 'fn(' + paramString.join(', ') + ')' + returnString;
			cont['!url'] = defs.url || crmAPIFileLoc;
			cont['!doc'] = defs['!doc'];
			break;
		case 'define':
			var val = {};
			val['!url'] = defs.url || crmAPIFileLoc;
			for (i = 0; i < defs.props.length; i++) {
				val[defs.props[i].name] = defs.props[i].type.replace(/([\w|\?]+)\[\]/g, '[$1]');
			}
			defs.proto && (val['!proto'] = defs.proto);
			console.log(val);
			defs.name = defs.name.split('~')[1];
			defines[defs.name] = val;
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
			if (type !== '?') {
				cont['!type'] = defs.type;
			}
			cont['!doc'] = defs['!doc'];
			cont['!url'] = defs.url || crmAPIFileLoc;
			break;
	}
}

function extractDefsFromLine(definitions, defines, lines, lineNumber, isTypeDef) {
	var line = lines[lineNumber].slice(1);

	var cont = definitions;
	if (!isTypeDef) {
		var definition = line.match(/this\.([a-z|A-Z|0-9|_|\.]+)/)[1];
		var definitionSplit = definition.split('.');

		for (var i = 0; i < definitionSplit.length; i++) {
			if (cont[definitionSplit[i]]) {
				cont = cont[definitionSplit[i]];
			} else {
				cont[definitionSplit[i]] = {};
				cont = cont[definitionSplit[i]];
			}
		}
	}

	//Get the comment block
	var currentLine = lineNumber;
	var commentBlockEnd = lineNumber - 1;
	for (; lines[currentLine].indexOf('/*') === -1; currentLine--) { }
	var commentBlockStart = currentLine;

	parseCommentBlock(defines, cont, lines, commentBlockStart, commentBlockEnd);
}

function extractDefs(js) {
	var definitions = {};
	var defines = {};

	var lines = js.split('\n');
	var searchingCommentEnd = false;
	var propRegex = new RegExp(/(\s)this.(\w+)/);
	var typeDefRegex = new RegExp(/(\s+)\* @typedef/);
	var callbackRegex = new RegExp(/(\s+)\* @callback/);
	for (var i = 0; i < lines.length; i++) {
		var match = lines[i].match(propRegex);
		if (match && lines[i].indexOf(match[0]) === 0) {
			extractDefsFromLine(definitions, defines, lines, i);
		}
		else if (lines[i].match(typeDefRegex) || lines[i].match(callbackRegex)) {
			//Find end of comment
			searchingCommentEnd = true;
		} else {
			if (searchingCommentEnd) {
				if (lines[i].trim() === '*/') {
					searchingCommentEnd = false;
					extractDefsFromLine(definitions, defines, lines, i + 1, true);
				}
			}
		}
	}

	return {
		defs: {
			'!name': 'crmAPI',
			'crmAPI': definitions,
			'!define': defines
		},
		html: ''
	};
}

module.exports = function (grunt) {
	grunt.registerMultiTask('extractCrmDefs', 'Extacts the definitions and HTML for a help page for the crmapi.js file', function () {
		grunt.log.writeln('this should be the write');
		this.data.files.forEach(function (file) {
			var sourceFile = file.src[0];
			var defsOutput = file.src[1];
			var htmlOutput = file.src[2];

			var sourceFileContents = grunt.file.read(sourceFile);
			var result = extractDefs(sourceFileContents);
			var defs = 'window.crmAPIDefs = ' + JSON.stringify(result.defs);
			var html = result.html;

			grunt.file.write(defsOutput, defs);
			grunt.file.write(htmlOutput, html);
		});
	});
}