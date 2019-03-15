// @ts-ignore
const processhtml = require('gulp-processhtml');
const joinPages = require('./tools/joinPages');
const polymerBuild = require('./tools/build');
const childProcess = require('child_process');
// @ts-ignore
const StreamZip = require('node-stream-zip');
const htmlTypings = require('html-typings');
// @ts-ignore
const beautify = require('gulp-beautify');
const replace = require('gulp-replace');
// @ts-ignore
const banner = require('gulp-banner');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const request = require('request');
const through = require('through2');
// @ts-ignore
const xpi = require('firefox-xpi');
// @ts-ignore
const crisper = require('crisper');
const mkdirp = require('mkdirp');
const rollup = require('rollup');
const zip = require('gulp-zip');
const which = require('which');
const gulp = require('gulp');
const glob = require('glob');
const path = require('path');
const del = require('del');
const fs = require('fs');

const BANNERS = {
	html: '<!--Original can be found at https://www.github.com/SanderRonde' + 
		'/CustomRightClickMenu\nThis code may only be used under the MIT' + 
		' style license found in the LICENSE.txt file-->\n',
	js: '/*!\n * Original can be found at https://github.com/SanderRonde' + 
		'/CustomRightClickMenu \n * This code may only be used under the MIT' +
		' style license found in the LICENSE.txt file \n**/\n'
}

/**
 * Generates a task with given description
 * 
 * @param {string|any} description - The description of the task
 * @param {any} [toRun] - The function to execute
 */
function genTask(description, toRun) {
	toRun.description = description;
	return toRun;
}

/**
 * Creates a directory
 * 
 * @param {string} dirPath - The path to the dir to create
 */
function assertDir(dirPath) {
	return new Promise((resolve, reject) => {
		mkdirp(dirPath, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		})
	});
}

/**
 * Write a file
 * 
 * @param {string} filePath - The location to write to
 * @param {string} data - The data to write
 * @param {{encoding?: 'utf8'}} [options] - Any options
 */
function writeFile(filePath, data, options) {
	return new Promise(async (resolve, reject) => {
		await assertDir(path.dirname(filePath)).catch((err) => {
			resolve(err);
		});
		if (!options) {
			fs.writeFile(filePath, data, {
				encoding: 'utf8'
			}, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		} else {
			fs.writeFile(filePath, data, options, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		}
	});
}

/**
 * Checks whether file with given filePath exists
 * 
 * @param {string} filePath - The file to check
 * 
 * @returns {Promise<boolean>} A promise that indicates whether
 * 		the file exists
 */
function fileExists(filePath) {
	return new Promise((resolve) => {
		fs.access(filePath, fs.constants.R_OK, (err) => {
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

/**
 * Caches the stream piped into this. If glob is provided,
 * uses the glob to source a stream from given glob
 * using cwd if provided, default is ./ (aka project root)
 * 
 * @param {string} name - The name of the cache. Used for retrieving it
 * @param {string|string[]} [glob] - An optional glob pattern(s) to use instead
 * @param {string} [cwd] - An optional cwd to use
 * 
 * @returns {NodeJS.ReadWriteStream} A readwritestream which mimics
 * 	the piped-in files
 */
function cacheStream(name, glob, cwd) {
	const stream = gulp.dest(`./.buildcache/${name}/`);
	if (glob) {
		return gulp.src(glob, {
			cwd: __dirname
		}).pipe(stream);
	}
	return stream;
}

/**
 * Checks if cache with given name exists
 * 
 * @param {string} name - The name of the cache to check
 * 
 * @returns {boolean} Whether the cache exists
 */
function cacheExists(name) {
	return fs.existsSync(`./.buildcache/${name}`);
}

/**
 * Reads the cache and tries to find given cache name.
 * If it fails, calls fallback and uses it instead
 * 
 * @param {string} name - The name of the cache
 * @param {() => NodeJS.ReadWriteStream} fallback - The fallback to use
 * 		if the cache is empty
 * 
 * @returns {NodeJS.ReadWriteStream} A readwritestream containing
 * 		either the fallback or the cache data
 */
function cache(name, fallback) {
	if (!(cacheExists(name))) {
		return fallback().pipe(cacheStream(name));
	}
	return gulp.src(`./.buildcache/${name}/**/*`);
}

/**
 * Creates an object from a map element
 * 
 * @template {any} V
 * @param {Map<string, V>} map - A map
 * 
 * @returns {{[key: string]: V}} The new object
 */
function mapToObj(map) {
	const obj = {};
	for (const [ key, val ] of map.entries()) {
		obj[key] = val;
	}
	return obj;
}

/**
 * Creates a map from an object element
 * 
 * @template {any} V
 * @param {{[key: string]: V}} obj - An object
 * 
 * @returns {Map<string, V>} The map
 */
function objToMap(obj) {
	const map = new Map();
	for (const key in obj) {
		map.set(key, obj[key]);
	}
	return map;
}

let fileStates = new Map();
/**
 * Saves file states of given glob pattern if they don't
 * exist already. If they do exist, loads them into global
 * map to be used for comparison
 * 
 * @param {string|string[]} glob - A glob or array of globs of files
 * 		that need to be indexed
 * @returns {Promise<void>} A promise
 */
async function initFileStates(glob) {
	const FILE_LOCATION = './.buildcache/filestates/states.json';
	if (await fileExists(FILE_LOCATION)) {
		fileStates = objToMap(JSON.parse(await readFile(FILE_LOCATION)));
		return;
	}
	await new Promise((resolve, reject) => {
		gulp.src(glob).pipe(through.obj((file, encoding, callback) => {
			fileStates.set(file.path, file.stat.mtime.getTime());
			callback(null, file);
		})).on('data', () => {}).once('end', () => {
			resolve();y
		}).once('error', (e) => {
			reject(e);
		});
	});
	await writeFile(FILE_LOCATION, JSON.stringify(mapToObj(fileStates)));
}

/**
 * Read a file
 * 
 * @param {string} filePath - The location to read from
 * @param {{encoding?: 'utf8'}} [options] - Any options
 */
function readFile(filePath, options) {
	return new Promise((resolve, reject) => {
		if (!options) {
			fs.readFile(filePath, {
				encoding: 'utf8'
			}, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		} else {
			fs.readFile(filePath, options, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		}
	});
}

/* Convenience tasks */
(() => {
	gulp.task(genTask('Cleans the cache',
		async function cleanCache() {
			await del('./.buildcache');
		}))

	gulp.task(genTask('Cleans the /build directory',
		async function clean() {
			await del('./build');
		}));

	gulp.task(genTask('Cleans the /dist directory',
		async function cleanDist() {
			await del('./dist');
		}));

	gulp.task('prepareForHotReload', genTask('Prepares the extension for hot reloading, ' + 
		'developing through the app/ directory instead and not having to build ' +
		'make sure to run `yarn install --force` before this',
			gulp.parallel(
				function crispComponents() { 
					// @ts-ignore
					return new Promise((resolve, reject) => {
						// @ts-ignore
						glob('./app/bower_components/**/*.html', async (err, matches) => {
							await Promise.all([matches.map((file) => {
								return new Promise(async (resolve) => {
									const content = await readFile(file);
									const { name, dir } = path.parse(file);
									const { html, js } = crisper({
										jsFileName: `${name}.js`,
										source: content,
										scriptInHead: false,
										cleanup: false
									});
									await Promise.all([
										writeFile(file, html),
										writeFile(path.join(dir, `${name}.js`), js),
									]);
									resolve();
								});
							})]);
							resolve();
						});
					});
				},
				function copyMonacoTemp() {
					return gulp
						.src([
							'**/**',
							'!vs/basic-languages/src/**',
							'vs/basic-languages/src/css.js',
							'vs/basic-languages/src/less.js'
						], {
							base: 'node_modules/monaco-editor/min',
							cwd: 'node_modules/monaco-editor/min'
						})
						.pipe(replace(/node = node\.parentNode/g,
							'node = node.parentNode || node.host'))
						.pipe(replace(/document\.body/g,
							'MonacoEditorHookManager.getLocalBodyShadowRoot'))
						.pipe(replace(/document\.caretRangeFromPoint/g,
							'MonacoEditorHookManager.caretRangeFromPoint(arguments[0])'))
						.pipe(replace(/this.target(\s)?=(\s)?e.target/g,
							'this.target = e.path ? e.path[0] : e.target'))
						// @ts-ignore
						.pipe(beautify())
						.pipe(gulp.dest('app/elements/options/editpages/monaco-editor/src/min/'));
				},
				function tsEmbedDev() {
					return gulp
						.src('typescript.js', { 
							cwd: './node_modules/typescript/lib',
							base: './node_modules/typescript/lib'
						})
						.pipe(uglify())
						.pipe(gulp.dest('./app/js/libraries/'))
				},
				async function lessEmbedDev() {
					const less = await readFile('./resources/buildresources/less.min.js');
					await writeFile('./app/js/libraries/less.js', less);
				},
				async function stylusEmbedDev() {
					const stylus = await readFile('./resources/buildresources/stylus.min.js');
					await writeFile('./app/js/libraries/stylus.js', stylus);
				},
				async function crmapiLib() {
					await writeFile('./app/js/libraries/crmapi.d.ts', await joinDefs());
				}
			)));

	gulp.task(genTask('Disables hot reloading, required for proper build',
		function disableHotReload() {
			return new Promise((resolve, reject) => {
				which('yarn', (err, cmdPath) => {
					if (err) {
						reject(err);
					} else {
						const cmd = childProcess.spawn(cmdPath, ['--force']);
						cmd.on('close', (code) => {
							if (code !== 0) {
								reject(`Yarn failed with exit code ${code}`)
							} else {
								resolve();
							}
						});
					}
				});
			});
		}));
})();

/* Compilation */
(() => {
	gulp.task(genTask('Updates the HTML to Typescript maps',
		// @ts-ignore
		async function updateTsIdMaps(done) {
			const pattern = '{app/elements/**/*.html,!app/elements/elements.html}';
			const typings = await htmlTypings.extractGlobTypes(pattern);
			await writeFile('./app/elements/fileIdMaps.d.ts', typings);
		}));

	gulp.task('compile', genTask('Compiles the typescript',
		gulp.series('updateTsIdMaps', gulp.parallel(
			function compileApp() {
				return new Promise((resolve, reject) => {
					const project = ts.createProject('tsconfig.json');
					const proj =  project.src().pipe(project());
					proj.once('error', () => { 
						reject('Error(s) thrown during compilation');
					});
					proj.js.pipe(gulp.dest('./app')).once('end', () => {
						resolve(null);
					});
				});
			},
			function compileTest() {
				return new Promise((resolve, reject) => {
					const project = ts.createProject('test/tsconfig.json');
					const proj =  project.src().pipe(project());
					proj.once('error', () => { 
						reject('Error(s) thrown during compilation');
					});
					proj.js.pipe(gulp.dest('./test')).once('end', () => {
						resolve(null);
					});
				});
			}
		))));
})();

/* Building the app */
(() => {
	const buildPrePolymer = gulp.series(
		async function cleanBuild() {
			await del('./build');	
		}, 
		//Copy from /app to /temp
		function copyMonacoJS() {
			return cache('monaco-js', () => {
				return gulp
					.src([
						'**/**/*.js',
						'!vs/basic-languages/src/**',
						'vs/basic-languages/src/css.js',
						'vs/basic-languages/src/less.js'
					], {
						base: 'node_modules/monaco-editor/min',
						cwd: 'node_modules/monaco-editor/min'
					})
					.pipe(uglify())
			}).pipe(gulp.dest('temp/elements/options/editpages/monaco-editor/src/min/'))
				.pipe(gulp.dest('app/elements/options/editpages/monaco-editor/src/min/'));
		},
		function copyMonacoNonJs() {
			return cache('monaco-non-js', () => {
				return gulp
					.src([
						'**/**',
						'!**/**/*.js',
						'!vs/basic-languages/src/**'
					], {
						base: 'node_modules/monaco-editor/min',
						cwd: 'node_modules/monaco-editor/min'
					})
			}).pipe(gulp.dest('temp/elements/options/editpages/monaco-editor/src/min/'))
				.pipe(gulp.dest('app/elements/options/editpages/monaco-editor/src/min/'));
		},
		gulp.parallel(
			function manifest() {
				return gulp
					.src('manifest.json', { cwd: './app/', base: './app/' })
					.pipe(replace(/CRM-dev/g, 'CRM'))
					.pipe(gulp.dest('./temp/'));
			},
			async function rollupBackground() {
				const bundle = await rollup.rollup({
					input: './app/js/background.js',
					external: ['tslib'],
					onwarn: (warning) => {
						if (typeof warning === 'string') {
							console.log(warning);
						} else {
							switch (warning.code) {
								case 'THIS_IS_UNDEFINED':
								case 'EVAL':
									return;
								default:
									console.log(warning.message);
							}
						}
					}
				});

				await bundle.write({
					format: 'iife',
					globals: {
						tslib: 'tslib_1'	
					},
					file: './temp/js/background.js'
				});
			},
			function copyBuild() {
				return gulp
					.src([
						'fonts/*',
						'js/**/*',
						'html/install.html', 
						'html/logging.html', 
						'html/options.html', 
						'html/background.html',
						'bower_components/**/*',
						'images/chromearrow.png',
						'images/shadowImg.png',
						'images/shadowImgRight.png',
						'images/stylesheet.gif',
						'images/whitearrow.png',
						'images/country_flags/**/*',
						'_locales/**/*',
						'js/libraries/jsonfn.js', 
						'js/libraries/md5.js', 
						'js/libraries/jquery/jquery-3.3.1.js',
						'icon-large.png', 
						'icon-small.png', 
						'icon-supersmall.png', 
						'LICENSE.txt', 
						'elements/util/change-log/changelog.js',
						'!js/background/**/*',
						'!js/background.js',
						'!bower_components/webcomponentsjs/webcomponents-lite.js'
					], { 
						base: './app/',
						cwd: './app/'
					})
					.pipe(gulp.dest('./temp/'))
			},
			function copyInstalling() {
				return gulp
					.src([
						'install-confirm/install-confirm.html',
						'install-confirm/install-confirm.css',
						'install-confirm/install-confirm.js',
						'install-error/install-error.html',
						'install-error/install-error.css',
						'install-error/install-error.js',
						'install-page/install-page.html',
						'install-page/install-page.css',
						'install-page/install-page.js'
					], {
						base: './app/elements/installing/',
						cwd: './app/elements/installing/'
					})
					.pipe(gulp.dest('./temp/elements/installing'));
			},
			function inlineElementImports() {
				return gulp
					.src('**/*.html', { cwd: './app/elements/', base: './app/elements/'})
					// @ts-ignore
					.pipe(processhtml({
						strip: true,
						data: {
							classes: 'content extension',
							base: 'html/'
						}
					}))
					.pipe(gulp.dest('./temp/elements/'));
			},
			function changeWebcomponentsThis() {
				return gulp
					.src('bower_components/webcomponentsjs/webcomponents-lite.js', {
						cwd: './app/',
						base: './app/'
					})
					.pipe(replace(/window===this((\s)?)\?((\s)?)this/g, 'true?window'))
					.pipe(gulp.dest('./temp/'));
			},
			function embedTs() {
				return gulp
					.src('typescript.js', {
						cwd: './node_modules/typescript/lib',
						base: './node_modules/typescript/lib'
					})
					.pipe(uglify())
					.pipe(gulp.dest('./temp/js/libraries'));
			},
			async function embedLess() {
				const less = await readFile('./resources/buildresources/less.min.js');
				await writeFile('./temp/js/libraries/less.js', less);
			},
			async function embedStylus() {
				const stylus = await readFile('./resources/buildresources/stylus.min.js');
				await writeFile('./temp/js/libraries/stylus.js', stylus);
			},
			async function crmapiLibBuild() {
				await writeFile('./temp/js/libraries/crmapi.d.ts', await joinDefs());
			},
			gulp.series(
				//entrypointPrefix.html specific stuff
				function processHTMLApp() {
					return gulp
						.src([
							'html/entrypointPrefix.html',
							'elements/installing/install-confirm/install-confirm.html'
						], { cwd: './app/', base: './app/' })
						// @ts-ignore
						.pipe(processhtml({
							strip: true,
							data: {
								classes: 'content extension',
								base: 'html/'
							}
						}))
						.pipe(gulp.dest('./temp/'));
				},
				async function crisp() {
					const entrypointPrefix = await readFile('./temp/html/entrypointPrefix.html');
					const { html, js } = crisper({
						jsFileName: 'entrypointPrefix.js',
						source: entrypointPrefix,
						scriptInHead: true,
						cleanup: false
					});
					await Promise.all([
						writeFile('./temp/html/entrypointPrefix.html', html),
						writeFile('./temp/html/entrypointPrefix.js', js),
					]);
				}
			)
		),
		//Do things that require files already being in /temp
		function processHTMLTemp() {
			return gulp
				.src([
					'./temp/html/background.html',
					'./temp/html/logging.html',
					'./temp/html/install.html',
					'./temp/html/options.html'
				])
				// @ts-ignore
				.pipe(processhtml({
					strip: true,
					data: {
						classes: 'content extension',
						base: 'html/'
					}
				}))
				.pipe(gulp.dest('./temp/html/'));
		}
	);

	const buildPostPolymer = gulp.series(
		//Move directory
		function moveUpDirectory() {
			return gulp
				.src('**/*', { cwd: './build/temp', base: './build/temp' })
				.pipe(gulp.dest('./build'))
		},
		//Remove that directory
		async function cleanTemp() {
			await del('./build/temp/');
		},
		// Stuff related to the new directory
		gulp.parallel(
			function copyWebcomponentsLibs() {
				return gulp
					.src([
						'webcomponentsjs/*.js',
						'!webcomponentsjs/webcomponents-lite.js'
					], { 
						cwd: './temp/bower_components', 
						base: './temp/bower_components'
					})
					.pipe(gulp.dest('./build/bower_components'));
			},
			function copyPrefixJs() {
				return gulp
					.src('html/entrypointPrefix.js', { 
						cwd: './temp/', 
						base: './temp/'
					})
					.pipe(gulp.dest('./build/'));
			},
			//The entrypoint JS files
			gulp.series(
				//Crisping them
				gulp.parallel(
					async function crispOptions() {
						const options = await readFile('./build/html/options.html');
						const { html, js } = crisper({
							jsFileName: 'options.js',
							source: options,
							scriptInHead: false,
							cleanup: false
						});
						const optionsRemoved = html.replace(
							/<script src="options.js"><\/script>/g, '');
						await Promise.all([
							writeFile('./build/html/options.html', optionsRemoved),
							writeFile('./build/html/options.js', js)
						]);
					},
					async function crispLogging() {
						const content = await readFile('./build/html/logging.html');
						const { html, js } = crisper({
							jsFileName: 'logging.js',
							source: content,
							scriptInHead: false,
							cleanup: false
						});
						const tagRemoved = html.replace(
							/<script src="logging.js"><\/script>/g, '');
						await Promise.all([
							writeFile('./build/html/logging.html', tagRemoved),
							writeFile('./build/html/logging.js', js),
						]);
					},
					async function crispInstall() {
						const content = await readFile('./build/html/install.html');
						const { html, js } = crisper({
							jsFileName: 'install.js',
							source: content,
							scriptInHead: false,
							cleanup: false
						});
						const tagRemoved = html.replace(
							/<script src="install.js"><\/script>/g, '');
						await Promise.all([
							writeFile('./build/html/install.html', tagRemoved),
							writeFile('./build/html/install.js', js),
						]);
					},
					async function crispBackground() {
						const background = await readFile('./build/html/background.html');
						const { html, js } = crisper({
							jsFileName: 'background.js',
							source: background,
							scriptInHead: false,
							cleanup: false
						});
						await Promise.all([
							writeFile('./build/html/background.html', html),
							writeFile('./build/html/background.js', js),
						]);
					}
				),
				//Running them through babel and creating the full options page
				gulp.parallel(
					function babelOptions() {
						return gulp
							.src('./build/html/options.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(rename('options.es3.js'))
							.pipe(gulp.dest('./build/html/'));
					},
					function babelLogging() {
						return gulp
							.src('./build/html/logging.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(rename('logging.es3.js'))
							.pipe(gulp.dest('./build/html/'));
					},
					function babelInstall() {
						return gulp
							.src('./build/html/install.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(rename('install.es3.js'))
							.pipe(gulp.dest('./build/html/'));
					},
					function babelBackground() {
						return gulp
							.src('./build/html/background.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(gulp.dest('./build/html/'));
					},
					async function joinOptionsPage() {
						await joinPages({
							parts: [
								'temp/html/entrypointPrefix.html',
								'build/html/options.html'
							],
							dest: 'build/html/options.html'
						});
					},
					async function joinLoggingPage() {
						await joinPages({
							parts: [
								'temp/html/entrypointPrefix.html',
								'build/html/logging.html'
							],
							dest: 'build/html/logging.html'
						});
					},
					async function joinInstallPage() {
						await joinPages({
							parts: [
								'temp/html/entrypointPrefix.html',
								'build/html/install.html'
							],
							dest: 'build/html/install.html'
						});
					}
				),
				//Changing of the files created in the last step
				gulp.parallel(
					function fixBugsBackgroundOptions() {
						return gulp
							.src([
								'./build/html/background.js',
								'./build/html/options.js',
								'./build/html/options.es3.js',
								'./build/html/install.js',
								'./build/html/install.es3.js',
								'./build/html/logging.js',
								'./build/html/logging.es3.js'
							])
							.pipe(replace(
								/Object.setPrototypeOf\(((\w|\.)+),(\s*)((\w|\.)*)\)/g,
								'typeof Object[\'setPrototype\' + \'Of\'] === \'function\'' + 
									'?Object[\'setPrototype\' + \'Of\']($1,$4):$1.__proto__ = $4'
							))
							.pipe(replace(
								/typeof (\w+)\.global\.define/g,
								'typeof ($1.global = $1.global || {}).define'
							))
							.pipe(replace(
								/use strict/g,
								'use notstrict'
							))
							.pipe(replace(
								/\s\(\(\)\=\>\{'use notstrict';if\(!window.customElements\)(.*)\s/g,
								`try { eval('class foo {}'); eval("(()=>{if(!window.customElements)$1")` + 
									` } catch (e) { }`
							))
							.pipe(gulp.dest('./build/html/'));
					},
					function fixBugsWebcomponentsOptions() {
						return gulp
							.src([
								'./bower_components/webcomponentsjs/webcomponents-lite.js'
							], {
								cwd: './temp/',
								base: './temp/'
							})
							.pipe(replace(
								/Object.setPrototypeOf\(((\w|\.)+),(\s*)((\w|\.)*)\)/g,
								'typeof Object[\'setPrototype\' + \'Of\'] === \'function\'' + 
									'?Object[\'setPrototype\' + \'Of\']($1,$4):$1.__proto__ = $4'
							))
							.pipe(replace(
								/typeof l\.global\.define/g,
								'typeof (l.global = l.global || {}).define'
							))
							.pipe(replace(
								/use strict/g,
								'use notstrict'
							))
							.pipe(replace(
								/\s\(\(\)\=\>\{'use notstrict';if\(!window.customElements\)(.*)\s/g,
								`try { eval('class foo {}'); eval("(()=>{if(!window.customElements)$1")` + 
									` } catch (e) { }`
							))
							.pipe(gulp.dest('./build/'));
					},
					function noDefer() {
						return gulp
							.src([
								'./build/html/options.html',
								'./build/html/install.html',
								'./build/html/logging.html',
							])
							.pipe(replace(/\sdefer/g, ''))
							.pipe(gulp.dest('./build/html/'));
					}
				),
				//Changing of all HTML and JS files in general
				gulp.parallel(
					function htmlBanners() {
						return gulp
							.src(['build/html/**.html'])
							// @ts-ignore
							.pipe(banner(BANNERS.html))
							.pipe(gulp.dest('./build/html/'))
					},
					function jsBanners() {
						return gulp
							.src([
								'html/**.js', 
								'js/crmapi.js',
							], {
								cwd: './build',
								base: './build'
							})
							// @ts-ignore
							.pipe(banner(BANNERS.js))
							.pipe(gulp.dest('./build/'))
					}
				)
			)
		),
		//Final operations related to files outside of that folder
		gulp.parallel(
			async function cleanTemp() {
				await del('./temp');
			},
			function copyMonacoPostJS() {
				return gulp
					.src([
						'**/**/*.js',
						'!vs/basic-languages/src/**',
						'vs/basic-languages/src/css.js',
						'vs/basic-languages/src/less.js'
					], {
						base: 'node_modules/monaco-editor/min',
						cwd: 'node_modules/monaco-editor/min'
					})
					.pipe(replace(/node = node\.parentNode/g, 
						'node = node.parentNode || node.host'))
					.pipe(replace(/document\.body/g,
						'MonacoEditorHookManager.getLocalBodyShadowRoot'))
					.pipe(replace(/document\.caretRangeFromPoint/g,
						'MonacoEditorHookManager.caretRangeFromPoint(arguments[0])'))
					.pipe(replace(/this.target(\s)?=(\s)?e.target/g,
						'this.target = e.path ? e.path[0] : e.target'))
					.pipe(uglify())
					.pipe(gulp.dest('build/elements/options/editpages/monaco-editor/src/min/'));
			},
			function copyMonacoPostNonJs() {
				return gulp
					.src([
						'**/**',
						'!**/**/*.js',
						'!vs/basic-languages/src/**'
					], {
						base: 'node_modules/monaco-editor/min',
						cwd: 'node_modules/monaco-editor/min'
					})
					.pipe(replace(/node = node\.parentNode/g, 
						'node = node.parentNode || node.host'))
					.pipe(replace(/document\.body/g,
						'MonacoEditorHookManager.getLocalBodyShadowRoot'))
					.pipe(replace(/document\.caretRangeFromPoint/g,
						'MonacoEditorHookManager.caretRangeFromPoint(arguments[0])'))
					.pipe(replace(/this.target(\s)?=(\s)?e.target/g,
						'this.target = e.path ? e.path[0] : e.target'))
					.pipe(gulp.dest('build/elements/options/editpages/monaco-editor/src/min/'));
			}
		)
	);

	gulp.task('buildDevNoCompile', genTask('Builds the extension and attempts to beautify the' + 
		' code and skips compilation',
			gulp.series(buildPrePolymer, 
				async function buildPolymer() {
					await polymerBuild({
						project: {
							entrypoint: [
								"html/options.html",
								"html/logging.html",
								"html/install.html"
							],
							sources: ['elements/**'],
							root: "temp/",
							extraDependencies: [
								"html/background.html",
								"fonts/**/*",
								'_locales/**/*',
								"images/**/*",
								"js/libraries/csslint.js",
								"js/libraries/jslint.js",
								"js/libraries/crmapi.d.ts",
								"js/contentscripts/contentscript.js",
								"js/libraries/tern/*.*",
								"icon-large.png",
								"icon-small.png",
								"icon-supersmall.png",
								"LICENSE.txt",
								"manifest.json"
							],
							nonPolymerEntrypoints: [
								"html/background.html"
							]
						},
						optimization: {
							bundle: true,
							js: {
								compile: true
							}
						},
						dest: './build/'
					})
				},
				function copyExtraDependencies() {
					return gulp
						.src([
							'./js/crmapi.js',
							'./js/contentscripts/openusercss.js',
							'./js/contentscripts/usercss.js',
							'./js/contentscripts/userstyles.js',
							'./js/sandbox.js',
							'./js/libraries/typescript.js',
							'./js/libraries/less.js',
							'./js/libraries/stylus.js',
							'./js/contentscripts/contentscript.js',
							'./js/polyfills/browser.js'
						], { 
							cwd: './temp', 
							base: './temp' 
						})
						.pipe(uglify())
						.pipe(gulp.dest('./build'));
				},
				buildPostPolymer,
				async function beautifyJs() {
					return gulp
						.src('build/**/*.js')
						// @ts-ignore
						.pipe(beautify())
						.pipe(gulp.dest('./build/'));
				})));

	gulp.task('buildNoCompile', genTask('Builds the extension and skips compilation',
		gulp.series(
			buildPrePolymer,
			async function buildPolymer() {
				await polymerBuild({
					project: {
						entrypoint: [
							"html/options.html",
							"html/logging.html",
							"html/install.html"
						],
						root: "temp/",
						extraDependencies: [
							"html/background.html",
							"fonts/**/*",
							"images/**/*",
							'_locales/**/*',
							"js/libraries/csslint.js",
							"js/libraries/jslint.js",
							"js/libraries/crmapi.d.ts",
							"js/contentscripts/contentscript.js",
							"js/libraries/tern/*.*",
							"icon-large.png",
							"icon-small.png",
							"icon-supersmall.png",
							"LICENSE.txt",
							"manifest.json"
						],
						nonPolymerEntrypoints: [
							"html/background.html"
						]
					},
					optimization: {
						bundle: true,
						js: {
							compile: true,
							minify: true
						},
						css: {
							minify: true
						},
						html: {
							minify: true
						}
					},
					dest: './build/'
				});
			},
			function copyExtraDependencies() {
				return gulp
					.src([
						'./js/crmapi.js',
						'./js/contentscripts/openusercss.js',
						'./js/contentscripts/usercss.js',
						'./js/contentscripts/userstyles.js',
						'./js/libraries/typescript.js',
						'./js/libraries/less.js',
						'./js/libraries/stylus.js',
						'./js/sandbox.js',
						'./js/contentscripts/contentscript.js',
						'./js/polyfills/browser.js'
					], { 
						cwd: './temp', 
						base: './temp' 
					})
					.pipe(uglify())
					.pipe(gulp.dest('./build'));
			},
			buildPostPolymer,
			function uglifyFiles() {
				return gulp
					.src([
						'./build/html/entrypointPrefix.js'
					])
					.pipe(uglify())
					.pipe(gulp.dest('./build/html/'));
			}
		)));

	gulp.task('buildDev', genTask('Builds the extension and attempts to beautify the code',
		gulp.series('compile', 'buildDevNoCompile')));

	gulp.task('build', genTask('Builds the extension',
		gulp.series('compile', 'buildNoCompile')));

	gulp.task('buildZip', genTask('Builds the extension and zips it',
		gulp.series('build', function createZip() {
			return gulp
				.src([
					'**', 
					'!Custom Right-Click Menu.zip',
				], {
					cwd: './build/',
					base: './build/'
				})
				.pipe(zip('Custom Right-Click Menu.zip'))
				.pipe(gulp.dest('./build'));
		})));

	gulp.task('buildZipOnly', genTask('Builds the extension and only keeps the zip',
		gulp.series('buildZip', async function testBuild() {
			await del(['./temp/**/*', './build/**/*', '!./build/*.zip']);
		})));

	gulp.task('buildTest', genTask('Builds the tests', 
		gulp.series('build', async function joinPagesTest() {
			await joinPages({
				parts: [
					'test/UI/skeleton.html',
					'build/html/background.html',
					'build/html/options.html'
				],
				dest: 'build/html/UITest.html'
			});
		})));
})();

/* Website related tasks */
(() => {
	function typedocCloned() {
		return new Promise((resolve) => {
			// @ts-ignore
			fs.stat(path.join(__dirname, 'typedoc', 'package.json'), (err, stat) => {
				if (err) {
					//Doesn't exist yet
					resolve(false);
				} else {
					resolve(true);
				}
			});
		});
	}

	async function runCmd(cmd, cwd = __dirname) {
		return new Promise((resolve, reject) => {
			// @ts-ignore
			const proc = childProcess.exec(cmd, {
				cwd: cwd
			// @ts-ignore
			}, (err, stdout, stderr) => {
				if (err !== null) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	// @ts-ignore
	function promisePipe(pipe) {
		return new Promise((resolve, reject) => {
			pipe.once('close', () => {
				console.log('done');
				resolve();
			}).on('error', (err) => {
				console.log(err);
				reject(err);
			});
		});
	}

	async function cloneTypedoc() {
		let cwd = __dirname;
		console.log('Cloning typedoc locally');
		
		console.log('Cloning into ./typedoc/');
		await runCmd('git clone https://github.com/TypeStrong/typedoc typedoc')
		cwd = path.join(cwd, 'typedoc/');
		
		console.log('Getting this extension\'s version of typescript');
		const CRMPackage = JSON.parse(await readFile(path.join(__dirname, 'package.json')));
		const tsVersion = CRMPackage.devDependencies.typescript;

		console.log('Installing grunt');
		await runCmd('npm install -g grunt-cli', cwd);

		console.log('Removing post install hook');
		const file = await readFile(path.join(__dirname, 'typedoc', 'package.json'));
		await writeFile(path.join(__dirname, 'typedoc', 'package.json'), 
			file.replace(/"prepare":/g, "\"ignored\":"));

		console.log('Installing typedoc dependencies (this may take a few minutes)');
		await runCmd('npm install', cwd);

		console.log('Running post install hook');
		await runCmd('grunt default --force', cwd);

		console.log('Installing this extension\'s typescript version in cloned typedoc');
		await runCmd(`npm install --save typescript@${tsVersion}`, cwd);
		
		console.log('Done!');
	}

	gulp.task(genTask('Removes the app/bower_components dir', async function removeBowerComponents() {
		await del('./app/bower_components');
	}));

	gulp.task(genTask('Extracts the files needed for the documentationWebsite' + 
		' and places them in build/website',
			async function documentationWebsite(done) {
				console.log('Checking if typedoc has been cloned...');
				const exists = await typedocCloned();
				if (!exists) {
					await cloneTypedoc();
				}

				// @ts-ignore
				const typedoc = require('./typedoc');
				const app = new typedoc.Application({
					mode: 'file',
					out: 'documentation/',
					includeDeclarations: true,
					entryPoint: 'CRM',
					theme: 'docs/theme',
					name: 'CRM API',
					readme: 'none',
					ignoreCompilerErrors: true
				});
				
				const src = app.expandInputFiles(['./tools/definitions/crmapi.d.ts']);
				const project = app.convert(src);
				if (!project) {
					throw new Error('Failed to load TypeDoc project');
				}
				app.generateDocs(project, 'documentation/');
				done();
			}));

	gulp.task(genTask('Moves the favicon for the website to the directory',
		function moveFavicon() {
			return gulp
				.src('favicon.ico', { cwd: './test/UI/', base: './test/UI/' })
				.pipe(gulp.dest('./documentation/'));
		}));
	
	gulp.task(genTask('Moves the gitignore for the gh-pages branch to the root',
		function changeGitIgnore() {
			return gulp
				.src('gh-pages-gitignore.gitignore', { cwd: './tools', base: './tools' })
				.pipe(rename('.gitignore'))
				.pipe(gulp.dest('./'));
		}));

	gulp.task('demoWebsite', genTask('Moves the demo website to /demo',
		gulp.series('buildTest', function copyDemoWebsite() {
			return gulp
				.src('UITest.html', { cwd: './build/html', base: './build/html' })
				.pipe(replace(/<title>((\w|\s)+)<\/title>/g, '<title>Demo</title>'))
				.pipe(replace(/<head>/, '<head><base href="../build/html/">'))
				.pipe(rename('index.html'))
				.pipe(gulp.dest('./demo'));
		})));
})();

/**
 * Replace a line with given callback's response when regexp matches
 * 
 * @param {string[]} lines - The lines to iterate through
 * @param {RegExp} regexp - The expression that should match
 * @param {(match: RegExpExecArray) => Promise<string>} callback - A function that
 * 		returns the to-replace string based on the match
 * @returns {Promise<string[]>} - The new array
 */
async function doReplace(lines, regexp, callback) {
	let match;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if ((match = regexp.exec(line))) {
			const replacement = (await callback(match)).split('\n');
			lines.splice(i, 1, ...replacement);
			return doReplace(lines, regexp, callback);
		}
	}
	return lines;
}

async function joinDefs() {
	const srcFile = await readFile('./tools/definitions/crmapi.d.ts');
	const lines = srcFile.split('\n');
	return (await doReplace(lines, /\/\/\/(\s*)<reference path="(.*)"(\s*)\/>/, async (match) => {
		const file = match[2];
		return await readFile(path.join('./tools/definitions', file));
	})).join('\n');
}

/* Definitions */
(() => {
	gulp.task(genTask('Move all crmapi .d.ts files into a single file',
		async function genDefs() {
			await writeFile('./dist/defs/crmapi.d.ts', await joinDefs());
		}));
})();

/* Choosing a browser to test/build/develop */
(() => {
	/**
	 * Moves a browser's manifest
	 * 
	 * @param {string} browser - The name of the browser
	 * @param {string} dest - The dir to place it in
	 */
	function moveBrowser(browser, dest) {
		return gulp
			.src(`./app/manifest.${browser}.json`)
			.pipe(rename('manifest.json'))
			.pipe(gulp.dest(dest));
	}

	/**
	 * Replace the short name of the extension from CRM-dev to CRM
	 */
	function replaceShortName() {
		return gulp
			.src('manifest.json', { cwd: './build/', base: './build/' })
			.pipe(replace(/CRM-dev/g, 'CRM'))
			.pipe(gulp.dest('./build'));
	}

	/**
	 * Moves the /build directory to the /dist/{browser} directory
	 * 
	 * @param {string} browser - The name of the browser
	 */
	function moveToDist(browser) {
		return gulp
			.src('./**/*', { cwd: './build/', base: './build/' })
			.pipe(gulp.dest(`./dist/${browser}`));
	}

	gulp.task(genTask('Copy the chrome manifest.json',
		function browserChrome() {
			return moveBrowser('chrome', './app');
		}));

	gulp.task(genTask('Copy the firefox manifest.json',
		function browserFirefox() {
			return moveBrowser('firefox', './app');
		}));

	gulp.task(genTask('Copy the edge manifest.json',
		function browserEdge() {
			return moveBrowser('edge', './app');
		}));

	gulp.task(genTask('Copy the opera manifest.json',
		function browserOpera() {
			return moveBrowser('opera', './app');
		}));

	gulp.task(genTask('Copy the chrome manifest.json',
		function browserChromeBuild() {
			return moveBrowser('chrome', './build');
		}));

	gulp.task(genTask('Copy the firefox manifest.json',
		function browserFirefoxBuild() {
			return moveBrowser('firefox', './build');
		}));

	gulp.task(genTask('Copy the edge manifest.json',
		function browserEdgeBuild() {
			return moveBrowser('edge', './build');
		}));

	gulp.task(genTask('Copy the opera manifest.json',
		function browserOperaBuild() {
			return moveBrowser('opera', './build');
		}));

	gulp.task(genTask('Copies the unstashed manifest to /build',
 		function copyUnstashed() {
			return gulp
				.src('./app/manifest.json')
				.pipe(gulp.dest('./build'));
		 }))

	gulp.task(genTask('Copy the current manifest and store it to undo overrides later',
		function stashBrowser() {
			return gulp
				.src('./app/manifest.json', { allowEmpty: true})
				.pipe(rename('manifest.temp.json'))
				.pipe(gulp.dest('./app'));
		}));

	gulp.task(genTask('Undo any overrides since the last stashing of the manifest',
	 	function unstashBrowser() {
			return gulp
				.src('./app/manifest.temp.json', { allowEmpty: true })
				.pipe(rename('manifest.json'))
				.pipe(gulp.dest('./app'));
		}));

	/**
	 * Move the built files to /dist and create a zip to place in /dist/packed
	 * 
	 * @param {string} browser - The browser that is used
	 * @param {boolean} [replaceName] - Replace the manifest name
	 */
	function doMove(browser, replaceName) {
		const fns = [...replaceName ? 
			[function replaceName() {
				return replaceShortName();
			}] : [], 
			gulp.parallel(
				function copy() {
					return moveToDist(browser);
				},
				function createZip() {
					return gulp
						.src('./**/*', { cwd: './build/', base: './build/' })
						.pipe(zip(`Custom Right-Click Menu.${browser}.zip`))
						.pipe(gulp.dest(`./dist/packed/`));
				})];
		return gulp.series(...fns);
	}

	gulp.task('chromeToDistTest', genTask('Copies the /build folder to the /dist/chrome folder with a test manifest',
		doMove('chrome')));

	gulp.task('firefoxToDistTest', genTask('Copies the /build folder to the /dist/firefox folder with a test manifest',
		doMove('firefox')));

	gulp.task('edgeToDistTest', genTask('Copies the /build folder to the /dist/edge folder with a test manifest',
		doMove('edge')));

	gulp.task('operaToDistTest', genTask('Copies the /build folder to the /dist/opera folder with a test manifest',
		doMove('opera')));

	gulp.task('chromeToDist', genTask('Copies the /build folder to the /dist/chrome folder',
		doMove('chrome', true)));

	gulp.task('firefoxToDist', genTask('Copies the /build folder to the /dist/firefox folder',
		doMove('firefox', true)));

	gulp.task('edgeToDist', genTask('Copies the /build folder to the /dist/edge folder',
		doMove('edge', true)));

	gulp.task('operaToDist', genTask('Copies the /build folder to the /dist/opera folder',
		doMove('opera', true)));

	gulp.task('genCRX', genTask('Generates a crx file and places it in the /dist/packed folder',
		gulp.parallel(
			function genCRXFirefox() {
				return gulp
					.src([
						'**',
						'!Custom Right-Click Menu.zip'
					], {
						cwd: './dist/firefox/',
						base: './dist/firefox'
					})
					.pipe(zip('Custom Right-Click Menu.zip'))
					.pipe(rename('Custom Right-Click Menu.firefox.crx'))
					.pipe(gulp.dest('./dist/packed/'));
			},
			function genCRXChrome() {
				return gulp
					.src([
						'**',
						'!Custom Right-Click Menu.zip'
					], {
						cwd: './dist/chrome/',
						base: './dist/chrome'
					})
					.pipe(zip('Custom Right-Click Menu.zip'))
					.pipe(rename('Custom Right-Click Menu.chrome.crx'))
					.pipe(gulp.dest('./dist/packed/'));
			})));

	gulp.task(genTask('Generates an xpi file and places it in the /dist/packed folder',
		async function genXPI() {
			await xpi('./dist/packed/Custom Right-Click Menu.firefox.xpi', './dist/firefox');
		}));
})();

/* Distributing and getting build artifacts */
(() => {
	gulp.task('zipArtifacts', genTask('Creates a zip file from the build/ and dist/ dirs', 
		gulp.parallel(
			function zipBuild() {
				return gulp
					.src([
						'build/**',
					])
					.pipe(zip('artifacts.build.zip'))
					.pipe(gulp.dest('./'));
			},
			function zipDist() {
				return gulp
					.src([
						'dist/**',
					])
					.pipe(zip('artifacts.dist.zip'))
					.pipe(gulp.dest('./'));
			}
		)));

	gulp.task('unzipArtifacts', genTask('Unzips the artifacts.dist.zip and artifacts.build.zip files', 
		gulp.parallel(
			async function unzipBuild() {
				await new Promise((resolve, reject) => {
					const zip = new StreamZip({
						file: 'artifacts.build.zip',
						storeEntries: true
					});

					mkdirp(path.join(__dirname, 'build/'), (err) => {
						if (err) {
							reject(err);
						} else {
							//@ts-ignore
							zip.on('ready', () => {
								zip.extract(null, path.join(__dirname, 'build/'), (err) => {
									if (err) {
										reject(err);
									} else {
										zip.close();
										resolve();
									}
								});
							});
						}
					});
				});
			},
			async function unzipDist() {
				await new Promise((resolve, reject) => {
					const zip = new StreamZip({
						file: 'artifacts.dist.zip',
						storeEntries: true
					});

					mkdirp(path.join(__dirname, 'dist/'), (err) => {
						if (err) {
							reject(err);
						} else {
							//@ts-ignore
							zip.on('ready', () => {
								zip.extract(null, path.join(__dirname, 'dist/'), (err) => {
									if (err) {
										reject(err);
									} else {
										zip.close();
										resolve();
									}
								});
							});
						}
					});
				});
			}
		)));

	gulp.task('genAppx:copy', genTask('Copies store images to the packaged dir',
		async function copyFiles() {
			return gulp
				.src('resources/logo/edge/*')
				.pipe(gulp
					.dest('dist/CRM/edgeextension/manifest/Assets'))
		}));

	gulp.task('genAppx:replace', 
		genTask('Replaces manifest fields in edge extension manifest',
			async function replaceManifestFields() {
				let packageManifest = await readFile(
					'dist/CRM/edgeextension/manifest/appxmanifest.xml');
				/**
				 * @type {{"version": string}}
				 */
				const edgeManifest = JSON.parse(await readFile(
					'dist/edge/manifest.json'));

				/**
				 * @type {{"Name": string, "Publisher": string, "PublisherDisplayName": string}}
				 */
				const secrets = JSON.parse(await readFile(
					'resources/buildresources/edge_secrets.json'));

				packageManifest = packageManifest
					.replace(/INSERT-YOUR-PACKAGE-IDENTITY-NAME-HERE/g,
						secrets.Name)
					.replace(/CN=INSERT-YOUR-PACKAGE-IDENTITY-PUBLISHER-HERE/g,
						secrets.Publisher)
					.replace(/INSERT-YOUR-PACKAGE-PROPERTIES-PUBLISHERDISPLAYNAME-HERE/g,
						secrets.PublisherDisplayName)
					.replace(/Version="(\.|\d)+"/,
						`Version="${edgeManifest.version}.0"`);

				await writeFile(
					'dist/CRM/edgeextension/manifest/appxmanifest.xml',
					packageManifest);
			}));

	gulp.task('genAppx:clean', genTask('Cleans the left over appx files', 
		async function cleanAppx() {
			await del('./dist/CRM');
		}));
})();

gulp.task('default', gulp.series('build'));
gulp.task('testBuild', genTask('Attempts to build everything',
	gulp.series('clean', 'build', 'clean', 'documentationWebsite', 'clean')));