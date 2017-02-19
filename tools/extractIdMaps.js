const htmlParser = require('htmlparser2');
const async = require('async');
const path = require('path');

const getFileTemplate = (content) => {
	return `///<reference path="./elements.d.ts" />

interface IDMap 
${content}
`;
}


function stringToType(str) {
	return str.replace(/":"(\w+)"/g, '": $1');
}

function prettyify(str) {
	str = str
		.replace(/"(\w+)": (\w+),/g, '\t"$1": $2,\n')
		.replace(/"(\w+)": (\w+)},/g, '\t"$1": $2\n},\n')
		.replace(/"([\w|-]+)":{/g, '"$1":{\n')
		.replace(/\n},"/g, '\n},\n"')
		.replace(/{\n}/g, '{ }')
		.replace(/"(\w+)": (\w+)}}/g, '\t"$1": $2\n}\n}')
		.replace(/{"/g, '{\n"')
		.replace(/:"{ }",/, ':{ },\n');
	const split = str.split('\n');
	return `${split[0]}\n${split.slice(1, -1).map((line) => {
		return `\t${line}`;
	}).join('\n')}\n${split.slice(-1)[0]}`;
}

function getTagType(name) {
	switch (name) {
		case 'svg':
			return 'SVGElement';
		case 'textarea':
			return 'HTMLTextAreaElement';
		case 'a':
			return 'HTMLAnchorElement';
		case 'h1':
		case 'h2':
		case 'h3':
			return 'HTMLHeadingElement';
		case 'br':
			return 'HTMLBRElement';
		case 'img':
			return 'HTMLImageElement';
		case 'b':
			return 'HTMLElement';
		default: 
			return `HTML${name.split('-').map((word) => {
				return word[0].toUpperCase() + word.slice(1);
			}).join('')}Element`;
	}
}

module.exports = function(grunt) {
	grunt.registerMultiTask('extractIdMaps', 
		'Extracts the ID to typescript type maps from HTML files', function() {
			const fileObj = this.files[0];
			const srcFile = fileObj.src[0];
			const options = this.options({});

			const done = this.async();

			const map = {
				behavior: '{ }'
			};

			Promise.all(this.files.map((fileObj) => {
				return new Promise((resolve) => {
					const srcFiles = fileObj.src.filter(function(filepath) {
						if (!grunt.file.exists(filepath)) {
							grunt.log.warn('File ' + filepath + ' does not exist');
							return false;
						}
						return true;
					})

					if (srcFile.length === 0) {
						return nextSeries();
					}

					let fileMapKey = 'unset';
					const fileMap = {};

					Promise.all(srcFiles.map((file) => {
						return new Promise((resolveFile, rejectFile) => {
							try {
								const parser = new htmlParser.Parser({
									onopentag: function(name, attribs) {
										if (name === 'dom-module') {
											fileMapKey = attribs.id;
										} else if (name === 'template') {
											if (attribs.id) {
												fileMap[attribs.id] = attribs['data-element-type'] || 
													getTagType(attribs.is);
											}
										} else {
											if (attribs.id) {
												fileMap[attribs.id] = attribs['data-element-type'] || 
													getTagType(name);
											}
										}
									}
								});
								parser.write(grunt.file.read(file));
								parser.end();

								if (fileMapKey !== 'unset') {
									map[fileMapKey] = fileMap;
								}

								resolveFile();
							} catch(e) {
								rejectFile(file);
							}
						});
					})).then(() => {
						resolve();
					}, (file) => {
						grunt.log.warn(`Something went wrong parsing file ${file}`);
					});
				});
			})).then(() => {
				grunt.file.write(this.files[0].orig.dest, 
					getFileTemplate(prettyify(stringToType(JSON.stringify(map)))));
				done();
			});
		});
}