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

module.exports = function (grunt) {
	grunt.registerMultiTask('joinPages', 'Joines the options.html and background.html pages', async function() {
		const options = this.options({});
		const done = this.async();
		if (!options.optionsPage) {
			grunt.log.error('Options page location missing');
		}
		if (!options.backgroundPage) {
			grunt.log.error('Background page location missing');
		}
		if (!options.destination) {
			grunt.log.error('Destination missing');
		}

		const optionsPageLocation = path.join(__dirname, '../', options.optionsPage);
		const backgroundPageLocation = path.join(__dirname, '../', options.backgroundPage);
		const destination = path.join(__dirname, '../', options.destination);

		const optionsPageFile = await readFile(grunt, done, optionsPageLocation);
		const backgroundPageFile = await readFile(grunt, done, backgroundPageLocation);

		const optionsParsed = getBodyContent(optionsPageFile, htmlParseFile(grunt, done, optionsPageFile));
		const backgroundParsed = getBodyContent(backgroundPageFile, htmlParseFile(grunt, done, backgroundPageFile));

		const joinedFile = `<html>
			<head>
				<title>Test</title>
				<link rel="shortcut icon" href="../../test/UI/favicon.ico"/>
			</head>
			<body>
				<script src="../../test/UI/chrome-api-dummy.js"></script>
				${backgroundParsed}
				${optionsParsed}
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