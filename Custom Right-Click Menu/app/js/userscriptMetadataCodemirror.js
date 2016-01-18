// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(window.CodeMirror);
})(function (codemirror) {
	"use strict";

	function compareMetaTags(oldMetaTags, newMetaTags) {
		var changes = {
			changed: [],
			removed: [],
			added: []
		}

		for (var oldMetaKey in oldMetaTags) {
			if (oldMetaTags.hasOwnProperty(oldMetaKey)) {
				if (!window.app.compareArray(oldMetaTags[oldMetaKey], newMetaTags[oldMetaTags])) {
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
					if (!window.app.compareArray(oldMetaTags[newMetaKey], newMetaTags[oldMetaTags])) {
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
				if (lines[i].indexOf('==/UserScript==') > -1) {
					metaEnd = i;
					break;
				}
			} else if (lines[i].indexOf('==UserScript==') > -1) {
				metaStart = i;
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
			oldMetaTags = JSON.parse(JSON.stringify(cm.metaTags.metaTags));
			console.log(oldMetaTags);
		}

		var i;
		var metaIndexes = getMetaLines(content);
		var metaStart = metaIndexes.start;
		var metaEnd = metaIndexes.end;
		var startPlusOne = metaStart + 1;
		var lines = content.split('\n');
		var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));

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

		cm.metaTags = cm.metaTags || {};
		cm.metaTags.metaEnd = metaEnd;
		cm.metaTags.metaTags = metaTagObj;
		cm.metaTags.metaStart = metaStart;
		cm.metaTags.metaIndexes = indexes;

		if (oldMetaTags) {
			return compareMetaTags(oldMetaTags, metaTagObj);
		}
		return null;
	}

	function updateMetaTags(cm, changes) {
		var i, j;
		var content = cm.getValue();
		var contentLines = content.split('\n');
		for (i = 0; i < changes.length; i++) {
			var changeLineStart = changes[i].from.line;
			var linesChanged = changes[i].text.length;
			var lastMetatagIndex = cm.metaTags.metaEnd - 1;
			var firstMetatagIndex = cm.metaTags.metaStart + 1;

			var tagsChanged = {
				removed: [],
				added: [],
				changed: []
			};
			if (changes[i].text.length !== changes[i].removed.length) {
				//Insertion or removal
				tagsChanged = setMetaTags(cm, content);
			} else if (changes[i].to.line < lastMetatagIndex || changeLineStart > firstMetatagIndex) {
				for (j = 0; j < linesChanged; j++) {
					var changeLine = changeLineStart + j;

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
						cm.metaTags.metaIndexes[changeLine] = {
							line: changeLine,
							key: regexMatch[1],
							value: regexMatch[3]
						};
						cm.metaTags.metaTags[regexMatch[1]] = cm.metaTags.metaTags[regexMatch[1]] || [];
						cm.metaTags.metaTags[regexMatch[1]].push(regexMatch[3]);
						if (regexMatch[1] !== cm.metaTags.metaIndexes[changeLine].key) {
							tagsChanged.added.push({
								key: regexMatch[1],
								value: regexMatch[3]
							});
							tagsChanged.removed.push({
								key: cm.metaTags.metaIndexes[changeLine].key,
								value: metaTag
							});
						} else {
							tagsChanged.changed.push({
								key: regexMatch[1],
								oldValue: metaTag,
								value: regexMatch[3]
							});
						}
					} else {
						tagsChanged.removed.push({
							key: cm.metaTags.metaIndexes[changeLine].key,
							value: metaTag
						});
					}
				}
			}

			if (tagsChanged) {
				window.CodeMirror.signal(cm, 'metaTagChanged', tagsChanged, cm.metaTags.metaTags);
			}
		}
	}

	codemirror.defineExtension('hideMetatags', function(cm) {
		//TODO
	});

	codemirror.defineExtension('showMetatags', function () {
		//TODO
	});

	codemirror.defineExtension('getMetatags', function(cm) {
		return cm.metaTags.metaTags;
	});

	codemirror.defineInitHook(function(cm) {
		setMetaTags(cm, cm.getValue());
		cm.on('changes', function (instance, changes) {
			updateMetaTags(instance, changes);
		});
	});
});