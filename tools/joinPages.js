const fs = require('fs');
const path = require('path');
const htmlParser = require('htmlparser');

function readFile(grunt, done, path) {
	return new Promise((resolve) => {
		fs.readFile(path, {
			encoding: 'utf8'
		}, (err, data) => {
			if (err) {
				grunt.log.error('Error reading file', path);
				done(false);
			} else {
				resolve(data);
			}
		});
	});
}

function htmlParseFile(grunt, done, content) {
	const handler = new htmlParser.DefaultHandler((error, dom) => {
		if (error) {
			grunt.log.error('Error merging HTML');
			done(false);
		}
	});
	const parser = new htmlParser.Parser(handler);
	parser.parseComplete(content);
	return handler.dom;
}

function getByTagName(parsed, tag) {
	for (let i = 0; i < parsed.length; i++) {
		if (parsed[i].type === 'tag' && parsed[i].name === tag) {
			return parsed[i];
		}
	}
	return null;
}

function reverseString(str) {
	return str.split('').reverse().join('');
}

function findReverse(haystack, needle) {
	return (haystack.length - reverseString(haystack).indexOf(reverseString(needle))) - needle.length;
}

function getBodyContent(file, parsed) {
	const bodyStart = getByTagName(getByTagName(parsed, 'html').children, 'body');
	return file.slice(file.indexOf(`${bodyStart.raw}>`) + `${bodyStart.raw}>`.length, 
		findReverse(file, '</body>'));
}

function getHeadContent(file, parsed) {
	const headStart = getByTagName(getByTagName(parsed, 'html').children, 'head');
	return file.slice(file.indexOf(`${headStart.raw}>`) + `${headStart.raw}>`.length, 
		findReverse(file, '</head>'));
}

function filterTitle(content) {
	return content.replace(/<title>\w*<\/title>/g, '');
}

module.exports = function (grunt) {
	grunt.registerMultiTask('joinPages', 'Joines the given html pages', async function() {
		const options = this.options({});
		const done = this.async();
		if (!options.dest) {
			grunt.log.error('Destination missing');
		}

		const locations = options.parts.map((part) => {
			return path.join(__dirname, '../', part);
		});
		const files = await Promise.all(locations.map((location) => {
			return readFile(grunt, done, location);
		}));
		const parsed = files.map((file) => {
			return htmlParseFile(grunt, done, file);
		});
		const contents = parsed.map((parsedPart, index) => {
			let headContent = getHeadContent(files[index], parsedPart);
			if (index !== 0) {
				headContent = filterTitle(headContent);
			}
			return {
				head: headContent,
				body: getBodyContent(files[index], parsedPart)
			}
		});

		const destination = path.join(__dirname, '../', options.dest);

		const joinedFile = `<html>
			<head>
				${contents.map((content) => {
					return content.head;
				}).join('\n')}
			</head>
			<body>
				${contents.map((content) => {
					return content.body;
				}).join('\n')}
			</body>
		</html>`;

		fs.writeFile(destination, joinedFile, {
			encoding: 'utf8'
		}, (err) => {
			if (err) {
				grunt.log.error('Error writing to output file');
				done(false);
			} else {
				grunt.log.ok(`Output written to ${destination}`);
				done(true);
			}
		});
	});
}