import fs from 'fs';
import path from 'path';
import htmlParser, { Dom } from 'htmlparser';

function readFile(path: string): Promise<string> {
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

function htmlParseFile(content: string) {
	const handler = new htmlParser.DefaultHandler((error) => {
		if (error) {
			throw error;
		}
	});
	const parser = new htmlParser.Parser(handler);
	parser.parseComplete(content);
	return handler.dom;
}

function getByTagName(parsed: Dom, tag: string) {
	for (let i = 0; i < parsed.length; i++) {
		if (parsed[i].type === 'tag' && parsed[i].name === tag) {
			return parsed[i];
		}
	}
	return null;
}

function reverseString(str: string) {
	return str.split('').reverse().join('');
}

function findReverse(haystack: string, needle: string) {
	return (haystack.length - reverseString(haystack).indexOf(reverseString(needle))) - needle.length;
}

function getBodyContent(file: string, parsed: Dom) {
	const bodyStart = getByTagName(getByTagName(parsed, 'html').children, 'body');
	return file.slice(file.indexOf(`${bodyStart.raw}>`) + `${bodyStart.raw}>`.length, 
		findReverse(file, '</body>'));
}

function getHeadContent(file: string, parsed: Dom) {
	const headStart = getByTagName(getByTagName(parsed, 'html').children, 'head');
	return file.slice(file.indexOf(`${headStart.raw}>`) + `${headStart.raw}>`.length, 
		findReverse(file, '</head>'));
}

function filterTitle(content: string) {
	const regex = /<title>\w*<\/title>/g;
	const title = regex.exec(content);
	return {
		title: (title && title[0]) || '',
		content: content.replace(regex, '')
	};
}

/**
 * Joins given pages
 * 
 * @param {Object} options - Options for this config
 * @param {string[]} options.parts - The parts of the pages
 * @param {string} options.dest - The destination to write to
 * 
 * @returns {Promise<void>} A promise signaling when it's done
 */
export async function joinPages(options: {
	parts: string[];
	dest: string;
}) {
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
		let lastTitle = '';
		if (index !== 0) {
			const { content, title } = filterTitle(headContent);
			lastTitle = title;
			headContent = content;
		}
		return {
			head: headContent,
			title: lastTitle,
			body: getBodyContent(files[index], parsedPart)
		}
	});

	const destination = path.join(__dirname, '../', options.dest);

	const joinedFile = `<!DOCTYPE html>
	<html>
		<head>
			${contents.map(({ title }) => {
				return title;
			}).join('\n')}
			${contents.map(({ head }) => {
				return head;
			}).join('\n')}
		</head>
		<body>
			${contents.map(({ body }) => {
				return body;
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