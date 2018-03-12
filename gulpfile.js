const processhtml = require('gulp-processhtml');
const joinPages = require('./tools/joinPages');
const polymerBuild = require('./tools/build');
const childProcess = require('child_process');
const htmlTypings = require('html-typings');
const beautify = require('js-beautify').js;
const replace = require('gulp-replace');
const banner = require('gulp-banner');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const through = require('through2');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const typedoc = require('typedoc');
const crisper = require('crisper');
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
	js: '/*\n * Original can be found at https://github.com/SanderRonde' + 
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
 * Write a file
 * 
 * @param {string} filePath - The location to write to
 * @param {string} data - The data to write
 * @param {{encoding?: 'utf8'}} [options] - Any options
 */
function writeFile(filePath, data, options) {
	return new Promise((resolve, reject) => {
		if (!options) {
			fs.writeFile(filePath, data, (err) => {
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
 * Read a file
 * 
 * @param {string} filePath - The location to read from
 * @param {{encoding?: 'utf8'}} [options] - Any options
 */
function readFile(filePath, options) {
	return new Promise((resolve, reject) => {
		if (!options) {
			fs.readFile(filePath, (err, data) => {
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
	gulp.task(genTask('Cleans the /build directory',
		async function clean() {
			await del('./build');
		}));

	gulp.task('prepareForHotReload', genTask('Prepares the extension for hot reloading, ' + 
		'developing through the app/ directory instead and not having to build ' +
		'make sure to run `yarn install --force` before this',
			gulp.parallel(
				function crispComponents() { 
					return new Promise((resolve, reject) => {
						glob('./app/bower_components/**/*.html', async (err, matches) => {
							await Promise.all([matches.map((file) => {
								return new Promise(async (resolve) => {
									const content = await readFile(file, {
										encoding: 'utf8'
									});
									const { name, dir } = path.parse(file);
									const { html, js } = crisper({
										jsFileName: `./${name}.js`,
										source: content,
										scriptInHead: false,
										cleanup: false
									});
									await Promise.all([
										writeFile(file, html, {
											encoding: 'utf8'
										}),
										writeFile(`${dir}${name}.js`, js, {
											encoding: 'utf8'
										}),
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
							'vs/basic-languages/src/css.js'
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
						.pipe(through.obj((file, enc, cb) => {
							const content = beautify(file.contents.toString('utf8'));
							file.contents = new Buffer(content);
							cb(null, file);
						}))
						.pipe(gulp.dest('app/elements/edit-pages/monaco-editor/src/min/'));
				},
				function tsEmbedDev() {
					return gulp
						.src('typescript.js', { 
							cwd: './node_modules/typescript/lib',
							base: './node_modules/typescript/lib'
						})
						.pipe(gulp.dest('./app/js/libraries/'))
				},
				function crmapiLib() {
					return gulp
						.src('crmapi.d.ts', { 
							cwd: './tools/definitions/',
							base: './tools/definitions/'
						})
						.pipe(gulp.dest('./app/js/libraries/'))
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
		async function updateTsIdMaps(done) {
			const pattern = '{app/elements/**/*.html,!app/elements/elements.html}';
			const typings = await htmlTypings.extractGlobTypes(pattern);
			await writeFile('./app/elements/fileIdMaps.d.ts', typings, {
				encoding: 'utf8'
			});
		}));

	gulp.task('compile', genTask('Compiles the typescript',
		gulp.series('updateTsIdMaps', gulp.parallel(
			function compileApp() {
				const project = ts.createProject('tsconfig.json');
				return project.src()
					.pipe(project())
					.js.pipe(gulp.dest('./app'));
			},
			function compileTest() {
				const project = ts.createProject('test/tsconfig.json');
				return project.src()
					.pipe(project())
					.js.pipe(gulp.dest('./test'));
			}
		))));
})();

/* Website related tasks */
(() => {
	gulp.task(genTask('Extracts the files needed for the documentationWebsite' + 
		' and places them in build/website',
			function documentationWebsite(done) {
				const app = new typedoc.Application({
					mode: 'file',
					out: 'documentation/',
					includeDeclarations: true,
					entryPoint: 'CRM',
					theme: 'docs/theme',
					name: 'CRM API',
					readme: 'none',
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
		gulp.series('compile', function copyDemoWebsite() {
			return gulp
				.src('demo.html', { cwd: './app/html', base: './app/html' })
				.pipe(rename('index.html'))
				.pipe(gulp.dest('./demo'));
		})));
})();

/* Building the app */
(() => {
	const buildPrePolymer = gulp.series(
		async function cleanBuild() {
			await del('./build');	
		}, 
		//Copy from /app to /temp
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
					file: './temp/js/background.js'
				});
			},
			function copyBuild() {
				return gulp
					.src([
						'fonts/*',
						'css/*',
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
						'js/libraries/jsonfn.js', 
						'js/libraries/md5.js', 
						'js/libraries/jquery/jquery-2.0.3.js',
						'icon-large.png', 
						'icon-small.png', 
						'icon-supersmall.png', 
						'LICENSE.txt', 
						'elements/change-log/changelog.js',
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
					.pipe(processhtml({
						strip: true,
						data: {
							classes: 'content extension',
							base: 'html/'
						}
					}))
					.pipe(replace(/﻿/g, ''))
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
					.pipe(gulp.dest('./temp/js/libraries'));
			},
			function crmapiLibBuild() {
				return gulp
					.src('crmapi.d.ts', {
						cwd: './tools/definitions',
						base: './tools/definitions'
					})
					.pipe(gulp.dest('./temp/js/libraries'));
			},
			function copyMonacoTemp() {
				return gulp
					.src([
						'**/**',
						'!vs/basic-languages/src/**',
						'vs/basic-languages/src/css.js'
					], {
						base: 'node_modules/monaco-editor/min',
						cwd: 'node_modules/monaco-editor/min'
					})
					.pipe(gulp.dest('temp/elements/edit-pages/monaco-editor/src/min/'));
			},
			gulp.series(
				//optionsPrefix.html specific stuff
				function copyMonaco() {
					return gulp
						.src([
							'**/**',
							'!vs/basic-languages/src/**',
							'vs/basic-languages/src/css.js'
						], {
							base: 'node_modules/monaco-editor/min',
							cwd: 'node_modules/monaco-editor/min'
						})
						.pipe(gulp.dest('app/elements/edit-pages/monaco-editor/src/min/'));
				},
				function processHTMLApp() {
					return gulp
						.src([
							'html/optionsPrefix.html',
							'elements/installing/install-confirm/install-confirm.html'
						], { cwd: './app/', base: './app/' })
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
					const optionsPrefix = await readFile('./temp/html/optionsPrefix.html', {
						encoding: 'utf8'
					});
					const { html, js } = crisper({
						jsFileName: './optionsPrefix.js',
						source: optionsPrefix,
						scriptInHead: false,
						cleanup: false
					});
					await Promise.all([
						writeFile('./temp/html/optionsPrefix.html', html, {
							encoding: 'utf8'
						}),
						writeFile('./temp/html/optionsPrefix.js', js, {
							encoding: 'utf8'
						}),
					]);
				}
			)
		),
		//Do things that require files already being in /temp
		function processHTMLTemp() {
			return gulp
				.src([
					'./temp/html/background.html',
					'./temp/html/options.html'
				])
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
					.src('webcomponentsjs/**/*.js', { 
						cwd: './temp/bower_components', 
						base: './temp/bower_components'
					})
					.pipe(gulp.dest('./build/bower_components'));
			},
			function copyPrefixJs() {
				return gulp
					.src('html/optionsPrefix.js', { 
						cwd: './temp/', 
						base: './temp/'
					})
					.pipe(gulp.dest('./build/'));
			},
			//The options.js and background.js files
			gulp.series(
				//Crisping them
				gulp.parallel(
					async function crispOptions() {
						const options = await readFile('./build/html/options.html', {
							encoding: 'utf8'
						});
						const { html, js } = crisper({
							jsFileName: './options.js',
							source: options,
							scriptInHead: false,
							cleanup: false
						});
						await Promise.all([
							writeFile('./build/html/options.html', html, {
								encoding: 'utf8'
							}),
							writeFile('./build/html/options.js', js, {
								encoding: 'utf8'
							}),
						]);
					},
					async function crispBackground() {
						const background = await readFile('./build/html/background.html', {
							encoding: 'utf8'
						});
						const { html, js } = crisper({
							jsFileName: './background.js',
							source: background,
							scriptInHead: false,
							cleanup: false
						});
						await Promise.all([
							writeFile('./build/html/background.html', html, {
								encoding: 'utf8'
							}),
							writeFile('./build/html/background.js', js, {
								encoding: 'utf8'
							}),
						]);
					}
				),
				//Running them through babel and creating the full options page
				gulp.parallel(
					function babelOptions() {
						return gulp
							.src('./build/html/options.js')
							.pipe(replace(/<script src="options.js"><\/script>/g, ''))
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(rename('options.es3.js'))
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
								'temp/html/optionsPrefix.html',
								'build/html/options.html'
							],
							dest: 'build/html/options.html'
						});
					}
				),
				//Changing of the files created in the last step
				gulp.parallel(
					function fixBugs() {
						return gulp
							.src([
								'./build/html/background.js',
								'./build/html/options.js',
								'./build/html/options.es3.js'
							])
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
							.pipe(gulp.dest('./build/html/'));
					},
					function noDefer() {
						return gulp
							.src('./build/html/options.html')
							.pipe(replace(/\sdefer/g, ''))
							.pipe(gulp.dest('./build/html/'));
					}
				),
				//Changing of all HTML and JS files in general
				gulp.parallel(
					function htmlBanners() {
						return gulp
							.src(['build/html/**.html'])
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
			function copyMonacoPost() {
				return gulp
					.src([
						'**/**',
						'!vs/basic-languages/src/**',
						'vs/basic-languages/src/css.js'
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
					.pipe(gulp.dest('build/elements/edit-pages/monaco-editor/src/min/'));
			}
		)
	);

	const buildDevNoCompile = gulp.series(
		buildPrePolymer, 
		async function buildPolymer() {
			await polymerBuild({
				project: {
					entrypoint: [
						"html/options.html"
					],
					sources: ['elements/**'],
					root: "temp/",
					extraDependencies: [
						"html/background.html",
						"fonts/**/*",
						"images/**/*",
						"js/crmapi.js",
						"js/libraries/csslint.js",
						"js/libraries/jslint.js",
						"js/libraries/crmapi.d.ts",
						"js/contentscript.js",
						"js/installStylesheet.js",
						"js/libraries/tern/*.*",
						"js/polyfills/browser.js",
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
		buildPostPolymer,
		async function beautifyJs() {
			return gulp
				.src('build/**/*.js')
				.pipe(through.obj((file, enc, cb) => {
					const content = beautify(file.contents.toString('utf8'));
					file.contents = new Buffer(content);
					cb(null, file);
				}))
				.pipe(gulp.dest('./build/'));
		}
	); 

	const buildNoCompile = gulp.series(
		buildPrePolymer,
		async function buildPolymer() {
			await polymerBuild({
				project: {
					entrypoint: [
						"html/options.html"
					],
					root: "temp/",
					extraDependencies: [
						"html/background.html",
						"fonts/**/*",
						"images/**/*",
						"js/crmapi.js",
						"js/libraries/csslint.js",
						"js/libraries/jslint.js",
						"js/libraries/crmapi.d.ts",
						"js/contentscript.js",
						"js/installStylesheet.js",
						"js/libraries/tern/*.*",
						"js/polyfills/browser.js",
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
		buildPostPolymer,
		function uglifyFiles() {
			return gulp
				.src([
					'./build/html/optionsPrefix.js'
				])
				.pipe(uglify())
				.pipe(gulp.dest('./build/html/'));
		}
	);

	gulp.task('buildDev', genTask('Builds the extension and attempts to beautify the code',
		gulp.series('compile', buildDevNoCompile)));

	gulp.task('build', genTask('Builds the extension',
		gulp.series('compile', buildNoCompile)));

	gulp.task('buildZip', genTask('Builds the extension and zips it',
		gulp.series('build', function createZip() {
			return gulp
				.src([
					'build/**', 
					'!build/Custom Right-Click Menu.zip',
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

	gulp.task('testBuild', genTask('Attempts to build everything',
		gulp.series('clean', 'build', 'clean', 'documentationWebsite', 'clean')));
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

	gulp.task(genTask('Copy the current manifest and store it to undo overrides later',
		function stashBrowser() {
			return gulp
				.src('./app/manifest.json')
				.pipe(rename('manifest.temp.json'))
				.pipe(gulp.dest('./app'));
		}));

	gulp.task(genTask('Undo any overrides since the last stashing of the manifest',
	 	function unstashBrowser() {
			return gulp
				.src('./app/manifest.temp.json')
				.pipe(rename('manifest.json'))
				.pipe(gulp.dest('./app'));
		}));

	gulp.task(genTask('Copies the /build folder to the /dist/chrome folder',
		function chromeToDist() {
			return moveToDist('chrome');
		}));

	gulp.task(genTask('Copies the /build folder to the /dist/firefox folder',
		function firefoxToDist() {
			return moveToDist('firefox');
		}));

	gulp.task(genTask('Copies the /build folder to the /dist/edge folder',
		function edgeToDist() {
			return moveToDist('edge');
		}));

	gulp.task(genTask('Copies the /build folder to the /dist/opera folder',
		function operaToDist() {
			return moveToDist('opera');
		}));
})();

gulp.task('default', gulp.series('build'));