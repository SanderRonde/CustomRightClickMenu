///<reference path="codemirror.js"/>
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
	if (typeof exports == 'object' && typeof module == 'object') // CommonJS
		mod(require('../../lib/codemirror'));
	else if (typeof define == 'function' && define.amd) // AMD
		define(['../../lib/codemirror'], mod);
	else {
		if (window.CodeMirror) {
			mod(CodeMirror);
		} else {
			if (window.codeMirrorToLoad) {
				window.codeMirrorToLoad.toLoad.push(mod);
			} else {
				window.codeMirrorToLoad = {
					toLoad: [mod]
				};
			}
		}
	}
})(function (codemirror) {
	'use strict';

	function compareMetaTags(oldMetaTags, newMetaTags) {
		var changes = {
			changed: [],
			removed: [],
			added: []
		}

		for (var oldMetaKey in oldMetaTags) {
			if (oldMetaTags.hasOwnProperty(oldMetaKey)) {
				if (!window.app.compareArray(oldMetaTags[oldMetaKey], newMetaTags[oldMetaKey])) {
					changes.removed.push({
						key: oldMetaKey,
						value: oldMetaTags[oldMetaKey]
					});
				}
			}
		}

		for (var newMetaKey in newMetaTags) {
			if (newMetaTags.hasOwnProperty(newMetaKey)) {
				if (oldMetaTags[newMetaKey] !== undefined) {
					if (!window.app.compareArray(oldMetaTags[newMetaKey], newMetaTags[newMetaKey])) {
						changes.changed.push({
							key: newMetaKey,
							value: newMetaTags[newMetaKey]
						});
					}
				} else {
					changes.added.push({
						key: newMetaKey,
						value: newMetaTags[newMetaKey]
					});
				}
			}
		}

		return changes;
	}

	function getMetaLines(content) {
		var metaStart = -1;
		var metaEnd = -1;
		var lines = content.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if (metaStart !== -1) {
				var endIndex = lines[i].indexOf('==/UserScript==');
				if (endIndex > -1) {
					metaEnd = {
						line: i,
						ch: endIndex + 15
					};
					break;
				}
			} else {
				var startIndex = lines[i].indexOf('==UserScript==');
				if (startIndex > -1) {
					metaStart = {
						line: i,
						ch: startIndex
					};
				}
			}
		}
		return {
			start: metaStart,
			end: metaEnd
		};
	}

	function setMetaTags(cm, content) {
		var oldMetaTags;
		if (cm.metaTags) {
			console.log(cm.metaTags);
			oldMetaTags = JSON.parse(JSON.stringify(cm.metaTags));
			console.log(oldMetaTags);
		}

		var i;
		var metaIndexes = getMetaLines(content);
		var metaStart = metaIndexes.start.line;
		var metaEnd = metaIndexes.end.line;
		var startPlusOne = metaStart + 1;
		var lines = content.split('\n');
		var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
		console.log(metaLines.length);
		if (metaLines.length === 0) {
			cm.metaTags = {};
			return null;
		}

		var metaTagObj = {};
		var indexes = {};
		var regex = new RegExp(/@(\w+)(\s+)(.+)/);
		var regexMatches;
		for (i = 0; i < metaLines.length; i++) {
			regexMatches = metaLines[i].match(regex);
			if (regexMatches) {
				metaTagObj[regexMatches[1]] = metaTagObj[regexMatches[1]] || [];
				metaTagObj[regexMatches[1]].push(regexMatches[3]);
				var line = startPlusOne + i;
				indexes[line] = {
					line: line,
					key: regexMatches[1],
					value: regexMatches[3]
				};
			}
		}

		console.log('got to this pointed obv');

		cm.metaTags = cm.metaTags || {};
		cm.metaTags.metaStart = metaIndexes.start;
		cm.metaTags.metaTags = metaTagObj;
		cm.metaTags.metaEnd = metaIndexes.end;
		cm.metaTags.metaIndexes = indexes;
		console.log(cm);
		console.log(cm.metaTags);

		if (oldMetaTags) {
			return compareMetaTags(oldMetaTags, metaTagObj);
		}
		return null;
	}

	function updateMetaTags(cm, changes) {
		console.log('WAAAAAAAA changes');
		console.log(cm, changes);

		var i, j;
		var content = cm.getValue();
		var contentLines = content.split('\n');
		for (i = 0; i < changes.length; i++) {
			var changeLineStart = changes[i].from.line;
			var linesChanged = changes[i].text.length;
			var lastMetatagIndex = cm.metaTags.metaEnd.line - 1;
			var firstMetatagIndex = cm.metaTags.metaStart.line + 1;

			var tagsChanged = {
				removed: [],
				added: [],
				changed: []
			};
			if (changes[i].text.length !== changes[i].removed.length) {
				//Insertion or removal
				console.log('INSERTION OR REMOVAL');
				tagsChanged = setMetaTags(cm, content);
			} else if (changes[i].to.line < lastMetatagIndex || changeLineStart > firstMetatagIndex) {
				for (j = 0; j < linesChanged; j++) {
					var changeLine = changeLineStart + j;

					if (!cm.metaTags.metaIndexes[changeLine]) {
						continue;
					}

					//Remove those values from the metaTags object
					var metaTag = cm.metaTags.metaTags[cm.metaTags.metaIndexes[changeLine].key];
					
					if (metaTag) {
						metaTag.splice(metaTag.indexOf(cm.metaTags.metaIndexes[changeLine].value), 1);
						if (metaTag.length === 0) {
							delete cm.metaTags.metaTags[cm.metaTags.metaIndexes[changeLine].key];
						}
					}

					var regexMatch = contentLines[changeLine].match(/@(\w+)(\s+)(.+)/);
					if (regexMatch) {
						cm.metaTags.metaTags[regexMatch[1]] = cm.metaTags.metaTags[regexMatch[1]] || [];
						cm.metaTags.metaTags[regexMatch[1]].push(regexMatch[3]);
						if (regexMatch[1] !== cm.metaTags.metaIndexes[changeLine].key) {
							tagsChanged.added.push({
								key: regexMatch[1],
								value: regexMatch[3]
							});
							tagsChanged.removed.push({
								key: cm.metaTags.metaIndexes[changeLine].key,
								value: cm.metaTags.metaIndexes[changeLine].value
							});
						} else {
							tagsChanged.changed.push({
								key: regexMatch[1],
								oldValue: cm.metaTags.metaIndexes[changeLine].value,
								value: regexMatch[3]
							});
						}
						cm.metaTags.metaIndexes[changeLine] = {
							line: changeLine,
							key: regexMatch[1],
							value: regexMatch[3]
						};
					} else {
						tagsChanged.removed.push({
							key: cm.metaTags.metaIndexes[changeLine].key,
							value: cm.metaTags.metaIndexes[changeLine].value
						});
					}
				}
			}

			if (tagsChanged) {
				window.CodeMirror.signal(cm, 'metaTagChanged', tagsChanged, cm.metaTags.metaTags);
			}
		}
	}

	function makeHideMarker() {
		var marker = document.createElement('svg');
		marker.innerHTML = '<svg width="30px" height="30px" class="codeMirrorHideMarker" xmlns="http://www.w3.org/2000/svg">' +
			'<g>' +
				'<rect id="svg_3" height="80%" width="80%" y="10%" x="10%" stroke-width="4%" stroke="#000" fill="#fff"/>' +
				'<line y2="50%" x2="80%" y1="50%" x1="20%" stroke-width="12.5%" stroke="#000" fill="none"/>' +
			'</g>' +
			'</svg>';
		marker.classList.add('codeMirrorHideMarker');
		return marker;
	}

	function makeExpandMarker() {
		var marker = document.createElement('div');
		marker.innerHTML = '<svg width="30px" height="30px" class="codeMirrorHideMarker" xmlns="http://www.w3.org/2000/svg">' +
			'<g>' +
				'<rect id="svg_3" height="80%" width="80%" y="10%" x="10%" stroke-width="4%" stroke="#000" fill="#fff"/>' +
				'<line y2="50%" x2="80%" y1="50%" x1="20%" stroke-width="12.5%" stroke="#000" fill="none"/>' +
				'<line y2="80%" x2="50%" y1="20%" x1="50%" stroke-width="12.5%" stroke="#000" fill="none"/>' +
			'</g>' +
			'</svg>';
		marker.classList.add('codeMirrorExpandMarker');
		return marker;
	}

	function getMetaTagString(metaTags, addSlashes) {
		var metaTagsArr = [(addSlashes ? '//' : '') + '==UserScript=='];

		var metaKey, metaValue;
		for (metaKey in metaTags) {
			if (metaTags.hasOwnProperty(metaKey)) {
				metaValue = metaTags[metaKey];
				for (var i = 0; i < metaValue.length; i++) {
					metaTagsArr.push('//@' + metaKey + ' ' + metaValue[i]);
				}
			}
		}
		metaTagsArr.push('//==/UserScript==');

		return metaTagsArr.join('\n');
	}

	function hideMetaTags(cm) {
		//Make sure the metatags are saved one last time
		setMetaTags(cm, cm.getValue());

		//Save those changes
		console.log(cm.metaTags);
		window.CodeMirror.signal(cm, 'metaTagChanged', null, cm.metaTags.metaTags);
		window.CodeMirror.signal(cm, 'metaDisplayStatusChanged', {
			status: 'hidden'
		});

		//Hide the metaTags
		cm.doc.replaceRange('==UserScript/UserScript==', cm.metaTags.metaStart, cm.metaTags.metaEnd);
		cm.metaTags.collapsedMarker = cm.doc.markText({
			line: cm.metaTags.metaStart.line,
			ch: cm.metaTags.metaStart.ch - 2
		}, {
			line: cm.metaTags.metaStart.line,
			ch: cm.metaTags.metaStart.ch + 27
		}, {
			className: 'metaTagHiddenText',
			inclusiveLeft: false,
			inclusiveRight: false,
			atomic: true,
			readOnly: true,
			title: getMetaTagString(cm.metaTags.metaTags, true)
		});
	}

	function showMetaTags(cm, metaTags) {
		//Get the index of the metaTags placeholder
		var metaTagsStart = null;
		var metaTagsEnd = null;

		var lines = cm.getValue().split('\n');
		for (var i = 0; i < lines.length; i++) {
			var index = lines[i].indexOf('==UserScript/UserScript==');
			if (index > -1) {
				metaTagsStart = {
					line: i,
					ch: index
				};
				metaTagsEnd = {
					line: i,
					ch: i + 28
				};
				break;
			}
		}

		var metaTagString;
		if (metaTagsStart === null) {
			//Insert at the first line
			var firstLine = {
				line: 0,
				ch: 0
			};
			cm.doc.replaceRange('\n', {
				line: 0,
				ch: 2
			});
			metaTagsStart = firstLine;
			metaTagsEnd = firstLine;
			metaTagString = getMetaTagString(metaTags, true);
		} else {
			metaTagString = getMetaTagString(metaTags, false);
		}

		cm.metaTags.collapsedMarker && cm.metaTags.collapsedMarker.clear();
		cm.doc.replaceRange(metaTagString, metaTagsStart, metaTagsEnd);
		window.CodeMirror.signal(cm, 'metaDisplayStatusChanged', {
			status: 'visible'
		});
	}

	function handleGutterClick(cm, line) {
		var lineInfo = cm.lineInfo(line);
		if (lineInfo.gutterMarkers && lineInfo.gutterMarkers['collapse-meta-tags']) {
			var element = lineInfo.gutterMarkers['collapse-meta-tags'];
			var isExpand = element.classList.contains('codeMirrorExpandMarker');
			if (isExpand) {
				//Expand
				showMetaTags(cm, cm.metaTags.metaTags);
			}
			else {
				//Collapse
				hideMetaTags(cm);
			}
			cm.setGutterMarker(line, 'collapse-meta-tags', isExpand ? makeHideMarker() : makeExpandMarker());
		}
	}

	codemirror.defineExtension('hideMetatags', function (cm) {
		hideMetaTags(cm);
	});

	codemirror.defineExtension('showMetatags', function (cm, metaTags) {
		showMetaTags(cm, metaTags);
	});

	codemirror.defineExtension('removeMetaTags', function(cm, key, value) {
		setMetaTags(cm, cm.getValue());
		for (var index in cm.metaTags.metaIndexes) {
			if (cm.metaTags.metaIndexes.hasOwnProperty(index)) {
				if (cm.metaTags.metaIndexes[index].key === key && cm.metaTags.metaIndexes[index].value === value) {
					console.log(parseInt(index, 10) + 1);
					cm.doc.replaceRange('', {
						line: index,
						ch: 0
					}, {
						line: parseInt(index, 10) + 1,
						ch: 0
					});
					return index;
				}
			}
		}

		return null;
	});

	codemirror.defineExtension('updateMetaTags', function(cm, key, oldValue, value, singleValue) {
		setMetaTags(cm, cm.getValue());

		console.log(singleValue);
		console.log(cm.metaTags.metaIndexes);
		for (var index in cm.metaTags.metaIndexes) {
			if (cm.metaTags.metaIndexes.hasOwnProperty(index)) {
				console.log(cm.metaTags.metaIndexes[index].value);
				console.log(oldValue);
				if (cm.metaTags.metaIndexes[index].key === key && (singleValue || cm.metaTags.metaIndexes[index].value === '' + oldValue)) {
					console.log('equal');
					cm.doc.replaceRange('// @' + key + '	' + value, {
						line: index,
						ch: 0
					}, {
						line: index,
						ch: cm.doc.getLine(index).length
					});
					return;
				}
			}
		}
		console.log('not found');
		cm.addMetaTags(cm, key, value);
	});

	codemirror.defineExtension('addMetaTags', function(cm, key, value, line) {
		setMetaTags(cm, cm.getValue());

		cm.doc.replaceRange('// @' + key + '	' + value + '\n', {
			line: (line && parseInt(line, 10)) || cm.metaTags.metaEnd.line,
			ch: 0
		}, {
			line: (line && parseInt(line, 10)) || cm.metaTags.metaEnd.line,
			ch: 0
		});
	});

	console.log('loaded');
	codemirror.defineExtension('getMetatags', function (cm) {
		return cm.metaTags.metaTags;
	});

	codemirror.defineInitHook(function (cm) {
		var i;
		var value = cm.getValue();
		setMetaTags(cm, value);
		cm.on('changes', function (instance, changes) {
			updateMetaTags(instance, changes);
		});

		var collapsed = false;
		var lines = value.split('\n');
		for (i = 0; i < lines.length; i++) {
			if (lines[i].indexOf('==UserScript/UserScript==') > -1) {
				collapsed = true;
				break;
			}
		}
		if (collapsed) {
			cm.setGutterMarker(i, 'collapse-meta-tags', makeExpandMarker());
		} else if (cm.metaTags && cm.metaTags.metaStart && cm.metaTags.metaStart.line) {
			cm.setGutterMarker(cm.metaTags.metaStart.line, 'collapse-meta-tags', makeHideMarker());
		}
		cm.on('gutterClick', function(instance, line) {
			handleGutterClick(instance, line);
		});
	});
});