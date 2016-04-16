var path = require('path');
var util = require('util');

var crmAPIFileLoc = '/crmAPIDocs.html';

var chromeDescr = [
	'  Calls the chrome API given in the "API" parameter. Due to some issues with the chrome message passing', br(),
	'		API it is not possible to pass messages and preserve scope. This could be fixed in other ways but', br(),
	'		unfortunately chrome.tabs.executeScript (what is used to execute scripts on the page) runs in a', br(),
	'		sandbox and does not allow you to access a lot. As a solution to this there are a few types of', br(),
	'		functions you can chain-call on the crmAPI.chrome(API) object: ', br(),
	'			', b('a'), 'or', b('args'), ' or ', b('()'), ': uses given arguments as arguments for the API in order specified. When passing a function,', br(),
	'				it will be converted to a placeholder function that will be called on return with the ', br(),
	'				arguments chrome passed to it. This means the function is never executed on the background', br(),
	'				page and is always executed here to preserve scope.', br(),
	'				You can call this function by calling .args or by just using the parentheses as below.', br(),
	'			', b('r'), ' or ', b('return'), ': a function that is called with the value that the chrome API returned. This can', br(),
	'				be used for APIs that don\'t use callbacks and instead just return values such as', br(),
	'				chrome.runtime.getURL().', br(),
	'			', b('s'), ' or ', b('send'), ': executes the request', br(), br(),
	' Examples:', br(),
	'		- For a function that uses a callback:', br(),
	'		crmAPI.chrome(\'alarms.get\')(\'name\', function(alarm) {', br(),
	'			//Do something with the result here', br(),
	'		}).send();', br(), br(),
	'		- For a function that returns a value:', br(),
	'		crmAPI.chrome(\'runtime.getUrl\')(path).return(function(result) {', br(),
	'			//Do something with the result', br(),
	'		}).send();', br(), br(),
	'		- For a function that uses neither:', br(),
	'		crmAPI.chrome(\'alarms.create\')(\'name\', {}).send();', br(), br(),
	'		- A compacter version:', br(),
	'		crmAPI.chrome(\'runtime.getUrl\')(path).r(function(result) {', br(),
	'			//Do something with the result', br(),
	'		}).s();', br(), br(),
	' Requires permission "chrome" and the permission of the the API, so chrome.bookmarks requires', br(),
	' permission "bookmarks", chrome.alarms requires "alarms"'
].map(function(line) {
	if (typeof line === 'string') {
		line = line.split(/	/g);
		var lineSplit = line;
		var resultArr = [];
		for (var i = 0; i < lineSplit.length; i++) {
			resultArr.push(lineSplit[i]);
			resultArr.push([nbsp(), nbsp(), nbsp(), nbsp()]);
		}
		resultArr.pop();
		return resultArr;
	}
	return line;
});

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
			}
			else if (line.indexOf('@see') === 0) {
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

function parseCommentBlock(detailedDefs, defines, cont, lines, start, end, location) {
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
					if (!paramName.indexOf('.') > -1) {
						paramString.push(paramName + (isOptional ? '?' : '') + ': ' + type);
					}
					detailedDefs.params.push({
						type: type,
						name: paramName,
						isOptional: isOptional,
						descr: defs.params[i].paramDescr
					});
				}
			}

			var returnString = '';
			if (defs.returns) {
				var returnType = defs.returns.type;
				returnType = returnType.replace(/([\w|\?]+)\[\]/g, '[$1]');
				returnString = ' -> ' + returnType;

				detailedDefs.returns = {
					type: returnType,
					descr: defs.returns.paramDescr
				}
			}

			cont['!type'] = 'fn(' + paramString.join(', ') + ')' + returnString;
			cont['!url'] = crmAPIFileLoc + '#' + sanitizeName(location);
			cont['!doc'] = defs['!doc'];
			detailedDefs.type = 'function';
			detailedDefs.descr = defs['!doc'];
			detailedDefs.url = defs.url;
			detailedDefs.permissions = defs.permissions;
			break;
		case 'define':
			var val = {};
			val['!url'] = crmAPIFileLoc + '#' + sanitizeName(location);
			if (detailedDefs[defs.name]) {
				detailedDefs = detailedDefs[defs.name];
			} else {
				detailedDefs[defs.name] = {};
				detailedDefs = detailedDefs[defs.name];
			}
			detailedDefs.props = [];
			for (i = 0; i < defs.props.length; i++) {
				var propType = defs.props[i].type.replace(/([\w|\?]+)\[\]/g, '[$1]');
				detailedDefs.props.push({
					name: defs.props[i].name,
					type: propType,
					descr: defs.props[i].propDescr
				});
				if (!defs.props[i].name.indexOf('.') > -1) {
					val[defs.props[i].name] = propType;
				}
			}
			defs.proto && (val['!proto'] = defs.proto);
			defs.name = defs.name.split('~')[1];
			defines[defs.name] = val;
			detailedDefs.type = 'define';
			detailedDefs.descr = descr;
			detailedDefs.name = defs.name;
			detailedDefs.proto = defs.proto;
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
			cont['!url'] = crmAPIFileLoc + '#' + sanitizeName(location);
			var locSplit = location.split('-');
			detailedDefs.name = locSplit[locSplit.length - 1];
			detailedDefs.descr = defs['!doc'];
			if (type === '?') {
				detailedDefs.type = 'section';
			} else {
				detailedDefs.type = 'prop';
				detailedDefs.dataType = defs.type;
			}
			break;
		}
	}
}

function extractDefsFromLine(detailedDefs, definitions, defines, lines, lineNumber, isTypeDef) {
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
	for (; lines[currentLine].indexOf('/*') === -1; currentLine--) { }
	var commentBlockStart = currentLine;

	parseCommentBlock(detailedDefs, defines, cont, lines, commentBlockStart, commentBlockEnd, location.join('-'));
}

function categoriseHTML(detailedDefs) {
	var defines = [];
	var props = [];
	var sections = [
		{
			name: 'general',
			type: 'section',
			descr: 'General CRM API functions'
		}
	];
	for (var key in detailedDefs) {
		if (detailedDefs.hasOwnProperty(key)) {
			switch (detailedDefs[key].type) {
				case 'section':
					sections.push(detailedDefs[key]);
					break;
				case 'function':
					if (key === 'chrome') {
						detailedDefs[key].descr = chromeDescr;
					}
					sections[0][key] = detailedDefs[key];
					break;
				case 'define':
					defines.push(detailedDefs[key]);
					break;
				case 'prop':
					props.push(detailedDefs[key]);
					break;
			}
		}
	}

	return {
		defines: defines,
		props: props,
		sections: sections
	}
}

function capitalizeName(name) {
	return name.split(' ').map(function (word) {
		word = word.toLowerCase();
		word = word[0].toUpperCase() + word.slice(1);
		return word;
	}).join(' ');
}

var map = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;'
};

function escapeHTML(text) {
	return text.replace(/[&<>"']/g, function (m) {
		return map[m];
	});
}

function JshtmlElement(tagName, options, classNames, content) {
	this.tagName = tagName;
	this.classNames = classNames;
	if (!Array.isArray(content)) {
		content = [content];
	}
	this.content = content;
	this.options = options;
	this.isEl = true;
	return this;
}

function element(tagName, classNamesOrOptions, contentOrClassNames, optionalContent) {
	var options = {};
	var classNames;
	var content;
	if (typeof classNamesOrOptions === 'object') {
		options = classNamesOrOptions;
		classNames = contentOrClassNames;
		content = optionalContent;
	} else {
		classNames = classNamesOrOptions;
		content = contentOrClassNames;
	}
	return new JshtmlElement(tagName, options, classNames, content);
}

function convertArraysBack(str) {
	var index;
	if ((index = str.indexOf('[')) > -1) {
		var endIndex = str.indexOf(']');
		str = 'Array of ' + str.slice(index + 1, endIndex) + 's' + convertArraysBack(str.slice(endIndex + 2));
	}
	return str;
}

function convertTypeBack(type) {
	type = type.replace(/bool/g, 'Boolean').replace(/\?/g, 'Object').replace(/number/g, 'Number').replace(/string/g, 'String').replace(/\|/, ' or ');
	return convertArraysBack(type);
}

function stringifyContent(content) {
	if (Array.isArray(content)) {
		return content.map(stringifyContent).join('');
	}
	if (content.raw) {
		return content.text;
	}
	if (content.isEl) {
		return stringify(content);
	}
	return escapeHTML(content);
}

function generateAttributesString(options) {
	var attrs = [];
	for (var attr in options) {
		if (options.hasOwnProperty(attr)) {
			var value = options[attr];
			attrs.push(attr + '="' + value + '"');
		}
	}
	return attrs.join(' ');
}

function stringify(element) {
	if (element.content.indexOf(undefined) > -1) {
	}
	return '<' + element.tagName + ' class="' + element.classNames + '" ' + generateAttributesString(element.options) + '>' +
		element.content.map(stringifyContent).join('') +
		'</' + element.tagName + '>';
}

function br() {
	var el = new JshtmlElement('span', {}, 'br', {
		raw: true,
		text: '<br>'
	});
	return el;
}

function nbsp() {
	var el = new JshtmlElement('span', {}, 'space', {
		raw: true,
		text: '&nbsp;'
	});
	return el;
}

function b(content) {
	var el = new JshtmlElement('b', {}, 'bold', content);
	return el;
}

function sanitizeName(name) {
	return name.replace(/ /g, '_').toLowerCase();
}

function generateDoc(data) {
	return stringify(
		element('paper-material', { elevation: '4' }, 'docElevation', [
			element('a', { name: sanitizeName(data.name), id: 'anchor' + sanitizeName(data.name) }, 'docAnchor', ''),
			element('div', 'docTitle', data.name),
			element('div', 'docDescr', data.descr),
			element('div', 'docDataCont',
				(data.dataType ?
						element('div', 'docPropCont', [
							element('div', 'docPropTxt', 'Type:'),
							element('div', 'docProp', convertTypeBack(data.dataType))
						])
						:
						element('div', 'docDataPropsCont', [
							(data.type === 'define' ? [
										br(), br(),
										element('div', 'docDataPropsTxt', 'Properties:'),
										element('table', 'docDataPropTable',
											element('tbody', 'docDataPropTBody',
											(data.props ? data.props.map(function(prop) {
												return element('tr', 'docDataPropCont', [
													element('td', 'docDataPropType', convertTypeBack(prop.type)),
													element('td', 'docDataPropName', prop.name + (prop.isOptional ? ' (optional)' : '')),
													element('td', 'docDataPropDescr', prop.descr)
												]);
											}) : []))),
										data.proto ? [br(),
											element('div', 'docPropProtoTxt', 'Inherits from:'),
											element('div', 'docPropProtoCont', 
												element('a', { href: '#' + data.proto }, 'docPropProto', data.proto))
										] : ''
									]
									: [
										(data.url ? [br(), element('div', 'docDataFunctionUrlCont', [
											element('div', 'docDataFunctionUrlTxt', 'Url:'),
											element('div', 'docDataFunctionUrlCont', 
												element('a', { href: data.url, target: '_blank' }, 'docDataFunctionUrlData', data.url))
										])] : ''),
										(data.permissions ? [
											br(),
											element('div', 'permissionsTxt', 'Permissions:'),
											element('table', 'permissionsTable',
												element('tbody', 'permissionsTBody', [
													data.permissions.map(function(permission) {
														return element('tr', 'permissionsTr',
															element('td', 'permissionsTd', permission));
													})
												]))
										] : ''),
										(data.params && data.params.length > 0 ? [
											br(),
											element('div', 'docDataParamTxt', 'Parameters:'),
											element('table', 'docDataParamsTable',
												element('tbody', 'docDataPropTBody',
												(data.params ? data.params.map(function(param) {
													return element('tr', 'docDataParaCont', [
														element('td', 'docDataParamType', convertTypeBack(param.type)),
														element('td', 'docDataParamName', param.name + (param.isOptional ? ' (optional)' : '')),
														element('td', 'docDataParamDescr', param.descr)
													]);
												}) : [])))
										] : ''),
										(data.returns ? [
													br(),
													element('div', 'docDataReturnsTxt', 'Returns:'),
													element('table', 'docDataReturnsTable',
														element('tbody', 'docDataPropTBody',
															element('tr', 'docDataReturnsCont', [
																element('td', 'docDataReturnsType', convertTypeBack(data.returns.type)),
																element('td', 'docDataReturnsDescr', data.returns.descr)
															])
														)
													)
												]
												:
												[]
										)
									]
							)
						])
				)
			)
		])
	) + '<br />';
}

function generateSection(sectionParts, descr, name) {
	var html = [stringify(element('a', { name: sanitizeName(name), id: 'anchor' + sanitizeName(name) }, 'sectionTitleAnchor', ''))];
	html.push(stringify(element('div', 'sectionTitle', name)));
	html.push(stringify(element('div', 'sectionDescr', descr)));
	html.push('<br>');

	for (var i = 0; i < sectionParts.length; i++) {
		var sectionPart = sectionParts[i];
		if (!sectionPart.isEmpty) {
			html.push(generateDoc(sectionPart));
		}
	}
	html.push('<br /><br />');
	return html.join('');
}

function structureSections(sections, resultArr) {
	var waitPush = [];

	var result = {
		props: []
	};
	result.name = sections.name;
	result.descr = sections.descr;

	delete sections.name;
	delete sections.type;
	delete sections.descr;

	for (var key in sections) {
		if (sections.hasOwnProperty(key)) {
			if (sections[key].type === 'section') {
				sections[key].name = result.name + '.' + sections[key].name;
				structureSections(sections[key], waitPush);
			} else {
				result.props.push(sections[key]);
			}
		}
	}

	resultArr.push(result);
	for (var i = 0; i < waitPush.length; i++) {
		resultArr.push(waitPush[i]);
	}
}

function generateIndexForProp(prop) {
	return element('tr', 'indexRow',
		element('td', 'indexCol',
			element('a', { href: '#' + sanitizeName(prop.name) }, 'docIndexLink', prop.name)
		)
	);
}

function generateIndexForSection(section) {
	return element('div', 'docIndexSection',
		element('table', 'indexTable',
			element('tbody', 'indexTBody', [
				element('tr', 'indexRow titleIndexRow',
					element('td', 'indexCol',
						element('a', { href: '#' + sanitizeName(section.name) }, 'docIndexSectionTitleLink', section.name)
					)
				),
				section.props.map(generateIndexForProp)
			])
		)
	);
}

function generateIndex(sections) {
	return stringify(element('paper-material', { elevation: '4' }, 'docIndexEdge',
		element('div', 'docIndexCont', sections.map(generateIndexForSection))));
}

function generateIndex(sections) {
	return stringify(
			element('paper-material', { elevation: '4' }, 'docIndexEdge',
			element('div', 'docIndexCont', sections.map(generateIndexForSection)))
		);
}

function generateHTML(detailedDefs) {
	var result = categoriseHTML(detailedDefs);
	var defines = result.defines;
	var props = result.props;
	var sections = result.sections;

	var structuredSections = [];
	for (var section in sections) {
		if (sections.hasOwnProperty(section)) {
			structureSections(sections[section], structuredSections);
		}
	}

	var indexSections = [
		{
			name: 'data types',
			props: defines
		}, {
			name: 'properties of CRMAPI',
			props: props
		}
	].concat(structuredSections);

	var html = generateIndex(JSON.parse(JSON.stringify(indexSections)));

	html += '<br /><br /><br />';

	html += generateSection(defines, 'Data types used in the CRM API apart from the default javascript ones',
		'data types');
	html += generateSection(props, 'Properties of the CRM API. These can be turned to true or false depending' +
		'on what you want.', 'properties of CRMAPI');

	for (var i = 0; i < structuredSections.length; i++) {
		html += generateSection(structuredSections[i].props, structuredSections[i].descr, structuredSections[i].name);
	}
	return html;
}

function extractDefs(js) {
	var detailedDefs = {};
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
			extractDefsFromLine(detailedDefs, definitions, defines, lines, i);
		}
		else if (lines[i].match(typeDefRegex) || lines[i].match(callbackRegex)) {
			//Find end of comment
			searchingCommentEnd = true;
		} else {
			if (searchingCommentEnd) {
				if (lines[i].trim() === '*/') {
					searchingCommentEnd = false;
					extractDefsFromLine(detailedDefs, definitions, defines, lines, i + 1, true);
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
		html: generateHTML(detailedDefs)
	};
}

module.exports = function (grunt) {
	grunt.registerMultiTask('extractCrmDefs', 'Extacts the definitions and HTML for a help page for the crmapi.js file', function () {
		this.data.files.forEach(function (file) {
			var sourceFile = file.src[0];
			var defsOutput = file.src[1];
			var htmlOutput = file.src[2];

			var sourceFileContents = grunt.file.read(sourceFile);
			var result = extractDefs(sourceFileContents);
			var defs = 'window.crmAPIDefs = ' + JSON.stringify(result.defs);
			var html = result.html;

			grunt.file.write(defsOutput, defs);
			grunt.log.ok('Created defs, ' + sourceFile + ' -> ' + defsOutput);
			grunt.file.write(htmlOutput, html);
			grunt.log.ok('Created docs, ' + sourceFile + ' -> ' + htmlOutput);
		});
	});
}