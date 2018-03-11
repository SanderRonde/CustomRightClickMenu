const fs = require('fs');
const path = require('path');
const htmlParser = require('htmlparser');

function readFile(path) {
	return new Promise((resolve) => {
		fs.readFile(path, {
			encoding: 'utf8'
		}, (err, data) => {
			if (err) {
				throw err;
			} else {
				resolve(data);
			}
		});
	});
}

function htmlParseFile(content) {
	const handler = new htmlParser.DefaultHandler((error, dom) => {
		if (error) {
			throw error;
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

/**
 * @param {Object} options - Options for this config
 * @param {string[]} options.parts - The parts of the pages
 * @param {string} options.dest - The destination to write to
 */
module.exports = async function (options) {
	if (!options.dest) {
		throw new Error('Destination missing');
	}

	const locations = options.parts.map((part) => {
		return path.join(__dirname, '../', part);
	});
	const files = await Promise.all(locations.map((location) => {
		return readFile(location);
	}));
	const parsed = files.map((file) => {
		return htmlParseFile(file);
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

	const joinedFile = `<!DOCTYPE html>
	<html>
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

	await new Promise((resolve, reject) => {
		fs.writeFile(destination, joinedFile, {
			encoding: 'utf8'
		}, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}