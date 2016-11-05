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
].map(function (line) {
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

var hashPrefix = '#';

/**
 * Sanitizes the name to fit the URL bar for linking to the docs webpage
 *
 * @param {string} name - The name to sanitize
 * @returns {string} The sanitized name
 */
function sanitizeName(name) {
	return name.replace(/ /g, '_').toLowerCase();
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
											(data.props ? data.props.map(function (prop) {
												return element('tr', 'docDataPropCont', [
													element('td', 'docDataPropType', prop.linkTo ?
														element('a', { href: prop.linkTo }, 'docDataParamTypeUrl',
															convertTypeBack(prop.type)) :
														convertTypeBack(prop.type)),
													element('td', 'docDataPropName', 
														prop.name + (prop.isOptional ? ' (optional)' : '')),
													element('td', 'docDataPropDescr', prop.descr)
												]);
											}) : []))),
										data.proto ? [br(),
											element('div', 'docPropProtoTxt', 'Inherits from:'),
											element('div', 'docPropProtoCont',
												element('a', { href: hashPrefix + sanitizeName(data.proto) }, 'docPropProto', data.proto))
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
													data.permissions.map(function (permission) {
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
												(data.params ? data.params.map(function (param) {
													return element('tr', 'docDataParaCont', [
														element('td', 'docDataParamType', param.linkTo ?
														 	element('a', { href: param.linkTo }, 'docDataParamTypeUrl',
															 	convertTypeBack(param.type)) :
															convertTypeBack(param.type)),
														element('td', 'docDataParamName', 
															param.name + (param.isOptional ? ' (optional)' : '')),
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
			element('a', { href: hashPrefix + sanitizeName(prop.name) }, 'docIndexLink', prop.name)
		)
	);
}

function generateIndexForSection(section) {
	return element('div', 'docIndexSection',
		element('table', 'indexTable',
			element('tbody', 'indexTBody', [
				element('tr', 'indexRow titleIndexRow',
					element('td', 'indexCol',
						element('a', { href: hashPrefix + sanitizeName(section.name) }, 'docIndexSectionTitleLink', section.name)
					)
				),
				section.props.map(generateIndexForProp)
			])
		)
	);
}

function generateIndex(sections) {
	return stringify(
			element('paper-material', { elevation: '4' }, 'docIndexEdge',
			element('div', 'docIndexCont', sections.map(generateIndexForSection)))
		);
}

exports.generate = function(detailedDefs, options) {
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