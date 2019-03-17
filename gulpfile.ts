import * as childProcess from 'child_process';
import * as htmlTypings from 'html-typings';
import processhtml from 'gulp-processhtml';
import { joinPages } from './tools/joinPages';
import * as Undertaker from 'undertaker';
import { polymerBuild } from './tools/build';
import StreamZip from 'node-stream-zip';
import * as ts from 'gulp-typescript';
import * as uglify from 'gulp-uglify';
import beautify from 'gulp-beautify';
import replace from 'gulp-replace';
import banner from 'gulp-banner';
import rename from 'gulp-rename';
import * as mkdirp from 'mkdirp';
import * as rollup from 'rollup';
import babel from 'gulp-babel';
import xpi from 'firefox-xpi';
import crisper from 'crisper';
import * as gulp from 'gulp';
import * as glob from 'glob';
import * as path from 'path';
import zip from 'gulp-zip';
import chalk from 'chalk';
import which from 'which';
import * as fs from 'fs';
import del from 'del';

const BANNERS = {
	html: '<!--Original can be found at https://www.github.com/SanderRonde' +
		'/CustomRightClickMenu\nThis code may only be used under the MIT' +
		' style license found in the LICENSE.txt file-->\n',
	js: '/*!\n * Original can be found at https://github.com/SanderRonde' +
		'/CustomRightClickMenu \n * This code may only be used under the MIT' +
		' style license found in the LICENSE.txt file \n**/\n'
}

type DescribedFunction = ReturnFunction & {
	description: string;
}

type ReturnFunction = (() => void)|(() => Promise<any>)|
	(() => NodeJS.ReadWriteStream)|Undertaker.TaskFunction;

/**
 * Adds a description to given function
 */
function addDescription<T extends ReturnFunction>(description: string, toRun: T): T {
	(toRun as DescribedFunction).description = description;
	return toRun;
}

const descriptions: Map<string, string> = new Map();

/**
 * Generates a root task with given description
 * 	root tasks are meant to be called, contrary to
 *  child tasks which are just there to preserve
 *  structure and to be called for specific reasons.
 */
function genRootTask<T extends ReturnFunction>(name: string, description: string, 
	toRun: T): T {
		if (!toRun && typeof description !== 'string') {
			console.log(`Missing root task name for task with description ${description}`);
			process.exit(1);
		}
		(toRun as DescribedFunction).description = description;
		descriptions.set(name, description);
		return toRun;
	}

/**
 * Creates a directory
 */
function assertDir(dirPath: string): Promise<void> {
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
 */
function writeFile(filePath: string, data: string, options?: { encoding?: 'utf8'; }): Promise<void> {
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
 * Caches the stream piped into this. If glob is provided,
 * uses the glob to source a stream from given glob
 * using cwd if provided, default is ./ (aka project root)
 */
function cacheStream(name: string, glob?: string | string[], cwd?: string): NodeJS.ReadWriteStream {
	const stream = gulp.dest(`./.buildcache/${name}/`);
	if (glob) {
		return gulp.src(glob, {
			cwd: cwd || __dirname
		}).pipe(stream);
	}
	return stream;
}

/**
 * Checks if cache with given name exists
 */
function cacheExists(name: string): boolean {
	return fs.existsSync(`./.buildcache/${name}`);
}

/**
 * Reads the cache and tries to find given cache name.
 * If it fails, calls fallback and uses it instead
 */
function cache(name: string, fallback: () => NodeJS.ReadWriteStream): NodeJS.ReadWriteStream {
	if (!(cacheExists(name))) {
		return fallback().pipe(cacheStream(name));
	}
	return gulp.src(`./.buildcache/${name}/**/*`);
}

/**
 * Read a file
 */
function readFile(filePath: string, options?: { encoding?: 'utf8'; }): Promise<string> {
	return new Promise<string>((resolve, reject) => {
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
					resolve(data.toString());
				}
			});
		}
	});
}

// class Tasks {
// 	static clean = class Clean {
// 		//Cleans the build cache dir
// 		static cache = addDescription('Cleans the build cache dir',
// 			async () => {
// 				await del('./.buildcache');
// 			});
// 	}
// }

/* Convenience tasks */
(() => {
	gulp.task('clean.cache', addDescription('Cleans the build cache dir', async () => {
		await del('./.buildcache');
	}));

	gulp.task('clean.build', addDescription('Cleans the /build directory', async () => {
		await del('./build');
	}));

	gulp.task('clean.dist', addDescription('Cleans the /dist directory', async () => {
		await del('./dist');
	}));

	gulp.task('cleanDist', genRootTask('cleanDist', 'Cleans the /dist directory', gulp.series(
		'clean.dist'
	)));

	gulp.task('clean', genRootTask('clean', 'Cleans the building and caching directories',
		gulp.parallel(
			'clean.cache',
			'clean.build',
			'clean.dist'
		)));

	/** prepareForHotReload */
	(() => {
		gulp.task('prepareForHotReload.crispComponents', addDescription('Crisps the bower components', () => {
			return new Promise((resolve, reject) => {
				glob('./app/bower_components/**/*.html', async (err, matches) => {
					if (err) {
						reject(err);
						return;
					}
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
					})]).catch(reject);
					resolve();
				});
			});
		}));

		gulp.task('prepareForHotReload.copyMonacoBeautiful',
			addDescription('Copies monaco files and beautifies them', () => {
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
					.pipe(beautify())
					.pipe(gulp.dest('app/elements/options/editpages/monaco-editor/src/min/'));
			}));

		gulp.task('prepareForHotReload.tsEmbedDev', addDescription('Embed the typescript compiler', () => {
			return gulp
				.src('typescript.js', {
					cwd: './node_modules/typescript/lib',
					base: './node_modules/typescript/lib'
				})
				.pipe(uglify())
				.pipe(gulp.dest('./app/js/libraries/'))
		}));

		gulp.task('prepareForHotReload.lessEmbedDev', addDescription('Embed the less compiler', async () => {
			const less = await readFile('./resources/buildresources/less.min.js');
			await writeFile('./app/js/libraries/less.js', less);
		}));

		gulp.task('prepareForHotReload.stylusEmbedDev', addDescription('Embed the stylus compiler', async () => {
			const stylus = await readFile('./resources/buildresources/stylus.min.js');
			await writeFile('./app/js/libraries/stylus.js', stylus);
		}));

		gulp.task('prepareForHotReload.crmapiLib', addDescription('Embed the CRM API definitions', async () => {
			await writeFile('./app/js/libraries/crmapi.d.ts', await joinDefs());
		}));
	})();

	gulp.task('prepareForHotReload', genRootTask('prepareForHotReload', 'Prepares the extension for hot reloading, ' +
		'developing through the app/ directory instead and not having to build ' +
		'make sure to run `yarn install --force` before this',
		gulp.parallel(
			'prepareForHotReload.crispComponents',
			'prepareForHotReload.copyMonacoBeautiful',
			'prepareForHotReload.tsEmbedDev',
			'prepareForHotReload.lessEmbedDev',
			'prepareForHotReload.stylusEmbedDev',
			'prepareForHotReload.crmapiLib'
		)));

	gulp.task('disableHotReload', genRootTask('disableHotReload',
		'Disables hot reloading, required for proper build', () => {
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
	gulp.task('defs', genRootTask('defs', 'Updates the HTML to Typescript maps', async () => {
		const pattern = '{app/elements/**/*.html,!app/elements/elements.html}';
		const typings = await htmlTypings.extractGlobTypes(pattern);
		await writeFile('./app/elements/fileIdMaps.d.ts', typings);
	}));

	gulp.task('compile.app', addDescription('Compiles the app/ directory\'s typescript', () => {
		return new Promise((resolve, reject) => {
			const project = ts.createProject('app/tsconfig.json');
			const proj = project.src().pipe(project());
			proj.once('error', () => {
				reject('Error(s) thrown during compilation');
			});
			proj.js.pipe(gulp.dest('./app')).once('end', () => {
				resolve(null);
			});
		});
	}));

	gulp.task('compile.test', addDescription('Compiles the test/ directory\'s typescript', () => {
		return new Promise((resolve, reject) => {
			const project = ts.createProject('test/tsconfig.json');
			const proj = project.src().pipe(project());
			proj.once('error', () => {
				reject('Error(s) thrown during compilation');
			});
			proj.js.pipe(gulp.dest('./test')).once('end', () => {
				resolve(null);
			});
		});
	}));

	gulp.task('compile', genRootTask('compile', 'Compiles the typescript',
		gulp.series('defs', gulp.parallel(
			'compile.app',
			'compile.test'
		))));
})();

/* Website related tasks (documentation part) */
(() => {
	function typedocCloned() {
		return new Promise((resolve) => {
			fs.stat(path.join(__dirname, 'typedoc', 'package.json'), (err) => {
				if (err) {
					//Doesn't exist yet
					resolve(false);
				} else {
					resolve(true);
				}
			});
		});
	}

	async function runCmd(cmd: string, cwd: string = __dirname) {
		return new Promise((resolve, reject) => {
			childProcess.exec(cmd, {
				cwd: cwd
			}, (err) => {
				if (err !== null) {
					reject(err);
				} else {
					resolve();
				}
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

	gulp.task('documentationWebsite', genRootTask('documentationWebsite',
		'Extracts the files needed for the documentationWebsite' +
		' and places them in build/website', async () => {
			console.log('Checking if typedoc has been cloned...');
			const exists = await typedocCloned();
			if (!exists) {
				await cloneTypedoc();
			}

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
		}));

	gulp.task('moveFavicon', genRootTask('moveFavicon',
		'Moves the favicon for the website to the directory', () => {
			return gulp
				.src('favicon.ico', { cwd: './test/UI/', base: './test/UI/' })
				.pipe(gulp.dest('./documentation/'));
		}));
})();

/* Building the app */
(() => {

	/* Pre-polymer */
	(() => {
		gulp.task('build.prepolymer.copyMonacoJs',
			addDescription('Copies monaco files from node_modules to app/ and temp/', () => {
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
			}));

		gulp.task('build.prepolymer.copyMonacoNonJs',
			addDescription('Copies non-js monaco files from node_modules to app/ and temp/', () => {
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
			}));

		gulp.task('build.prepolymer.devManifest',
			addDescription('Replaces CRM-dev with CRM in the manifest', () => {
				return gulp
					.src('manifest.json', { cwd: './app/', base: './app/' })
					.pipe(replace(/CRM-dev/g, 'CRM'))
					.pipe(gulp.dest('./temp/'));
			}));

		gulp.task('build.prepolymer.rollupBackground',
			addDescription('Bundles the backgroundpage up', async () => {
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
			}));

		gulp.task('build.prepolymer.copyBuild',
			addDescription('Copies files necessary for building from app/ to temp/', () => {
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
			}));

		gulp.task('build.prepolymer.copyInstalling',
			addDescription('Copies install page files to temp/', () => {
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
			}));

		gulp.task('build.prepolymer.inlineImports',
			addDescription('Inline external CSS imports into HTML files', () => {
				return gulp
					.src('**/*.html', { cwd: './app/elements/', base: './app/elements/' })
					.pipe(processhtml({
						strip: true,
						data: {
							classes: 'content extension',
							base: 'html/'
						}
					}))
					.pipe(gulp.dest('./temp/elements/'));
			}));

		gulp.task('build.prepolymer.changeWebComponentThis',
			addDescription('Change where "this" points to in webcomponents-lite', () => {
				return gulp
					.src('bower_components/webcomponentsjs/webcomponents-lite.js', {
						cwd: './app/',
						base: './app/'
					})
					.pipe(replace(/window===this((\s)?)\?((\s)?)this/g, 'true?window'))
					.pipe(gulp.dest('./temp/'));
			}));

		gulp.task('build.prepolymer.embedTS',
			addDescription('Embeds the typescript compilation library', () => {
				return cache('ts-lib-ugly', () => {
					return gulp
						.src('typescript.js', {
							cwd: './node_modules/typescript/lib',
							base: './node_modules/typescript/lib'
						})
						.pipe(uglify())
				}).pipe(gulp.dest('./temp/js/libraries'));
			}));

		gulp.task('build.prepolymer.embedLess',
			addDescription('Embeds the Less compiler', async () => {
				const less = await readFile('./resources/buildresources/less.min.js');
				await writeFile('./temp/js/libraries/less.js', less);
			}));

		gulp.task('build.prepolymer.embedStylus',
			addDescription('Embeds the stylus compiler', async () => {
				const stylus = await readFile('./resources/buildresources/stylus.min.js');
				await writeFile('./temp/js/libraries/stylus.js', stylus);
			}));

		gulp.task('build.prepolymer.embedCRMAPI',
			addDescription('Embeds the CRM API', async () => {
				await writeFile('./temp/js/libraries/crmapi.d.ts', await joinDefs());
			}));

		/** Entrypoints */
		(() => {
			gulp.task('build.prepolymer.entrypoint.process',
				addDescription('Run processhtml on the entrypoint', () => {
					return gulp
						.src([
							'html/entrypointPrefix.html',
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
				}));

			gulp.task('build.prepolymer.entrypoint.crisp',
				addDescription('Crisp the entrypoint file', async () => {
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
				}));

			gulp.task('build.prepolymer.entrypoint',
				addDescription('Entrypointprefix stuff', gulp.series(
					'build.prepolymer.entrypoint.process',
					'build.prepolymer.entrypoint.crisp'
				)));
		})();

		gulp.task('build.prepolymer.processHTMLTemp',
			addDescription('Run processhtml on the generated files in the temp/ dir', () => {
				return gulp
					.src([
						'./temp/html/background.html',
						'./temp/html/logging.html',
						'./temp/html/install.html',
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
			}));

		gulp.task('build.prepolymer', addDescription('All pre-polymer tasks during building',
			gulp.series(
				'clean.build',
				'build.prepolymer.copyMonacoJs',
				'build.prepolymer.copyMonacoNonJs',
				gulp.parallel(
					'build.prepolymer.devManifest',
					'build.prepolymer.rollupBackground',
					'build.prepolymer.copyBuild',
					'build.prepolymer.copyInstalling',
					'build.prepolymer.inlineImports',
					'build.prepolymer.changeWebComponentThis',
					'build.prepolymer.embedTS',
					'build.prepolymer.embedLess',
					'build.prepolymer.embedStylus',
					'build.prepolymer.embedCRMAPI',
					'build.prepolymer.entrypoint'
				),
				'build.prepolymer.processHTMLTemp'
			)));
	})();

	/** postpolymer */
	(() => {
		gulp.task('build.postpolymer.moveUpDir',
			addDescription('Moves all files up a directory, from build/temp to build/', () => {
				return gulp
					.src('**/*', { cwd: './build/temp', base: './build/temp' })
					.pipe(gulp.dest('./build'))
			}));

		gulp.task('build.postpolymer.cleanBuildTemp',
			addDescription('Cleans the build/temp/ directory', async () => {
				await del('./build/temp/');
			}));

		gulp.task('build.postpolymer.copyWebComponentLibs',
			addDescription('Copy the webcomponent libraries from temp/ to build/', () => {
				return gulp
					.src([
						'webcomponentsjs/*.js',
						'!webcomponentsjs/webcomponents-lite.js'
					], {
							cwd: './temp/bower_components',
							base: './temp/bower_components'
						})
					.pipe(gulp.dest('./build/bower_components'));
			}));

		gulp.task('build.postpolymer.copyPrefixJs',
			addDescription('Copies entrypointPrefix from temp/ to build/', () => {
				return gulp
					.src('html/entrypointPrefix.js', {
						cwd: './temp/',
						base: './temp/'
					})
					.pipe(gulp.dest('./build/'));
			}));

		/** Entrypoint JS */
		(() => {

			/** Crisping */
			(() => {
				gulp.task('build.postpolymer.entrypointJS.crisp.options',
					addDescription('Crisps the options.html page', async () => {
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
					}));

				gulp.task('build.postpolymer.entrypointJS.crisp.logging',
					addDescription('Crisps the logging.html page', async () => {
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
					}));

				gulp.task('build.postpolymer.entrypointJS.crisp.install',
					addDescription('Crisps the install.html page', async () => {
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
					}));

				gulp.task('build.postpolymer.entrypointJS.crisp.background',
					addDescription('Crisps the background.html page', async () => {
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
					}));

				gulp.task('build.postpolymer.entrypointJS.crisp',
					addDescription('Crisping of all entrypoints', gulp.parallel(
						'build.postpolymer.entrypointJS.crisp.options',
						'build.postpolymer.entrypointJS.crisp.logging',
						'build.postpolymer.entrypointJS.crisp.install',
						'build.postpolymer.entrypointJS.crisp.background'
					)));
			})();

			/** Babel */
			(() => {
				gulp.task('build.postpolymer.entrypointJS.babel.options',
					addDescription('Babel the options page ', () => {
						return gulp
							.src('./build/html/options.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(rename('options.es3.js'))
							.pipe(gulp.dest('./build/html/'));
					}));

				gulp.task('build.postpolymer.entrypointJS.babel.logging',
					addDescription('Babel the logging page ', () => {
						return gulp
							.src('./build/html/logging.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(rename('logging.es3.js'))
							.pipe(gulp.dest('./build/html/'));
					}));

				gulp.task('build.postpolymer.entrypointJS.babel.install',
					addDescription('Babel the install page ', () => {
						return gulp
							.src('./build/html/install.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(rename('install.es3.js'))
							.pipe(gulp.dest('./build/html/'));
					}));

				gulp.task('build.postpolymer.entrypointJS.babel.background',
					addDescription('Babel the background page ', () => {
						return gulp
							.src('./build/html/background.js')
							.pipe(babel({
								compact: false,
								presets: ['es3', 'es2015']
							}))
							.pipe(gulp.dest('./build/html/'));
					}));

				gulp.task('build.postpolymer.entrypointJS.babel.joinOptions',
					addDescription('Joins the options page with the prefix ', async () => {
						await joinPages({
							parts: [
								'temp/html/entrypointPrefix.html',
								'build/html/options.html'
							],
							dest: 'build/html/options.html'
						});
					}));

				gulp.task('build.postpolymer.entrypointJS.babel.joinLogging',
					addDescription('Joins the logging page with the prefix ', async () => {
						await joinPages({
							parts: [
								'temp/html/entrypointPrefix.html',
								'build/html/logging.html'
							],
							dest: 'build/html/logging.html'
						});
					}));

				gulp.task('build.postpolymer.entrypointJS.babel.joinInstall',
					addDescription('Joins the install page with the prefix ', async () => {
						await joinPages({
							parts: [
								'temp/html/entrypointPrefix.html',
								'build/html/install.html'
							],
							dest: 'build/html/install.html'
						});
					}));

				gulp.task('build.postpolymer.entrypointJS.babel',
					addDescription('Babelify all entrypoints and join them with the prefix ', gulp.parallel(
						'build.postpolymer.entrypointJS.babel.options',
						'build.postpolymer.entrypointJS.babel.logging',
						'build.postpolymer.entrypointJS.babel.install',
						'build.postpolymer.entrypointJS.babel.background',
						'build.postpolymer.entrypointJS.babel.joinOptions',
						'build.postpolymer.entrypointJS.babel.joinLogging',
						'build.postpolymer.entrypointJS.babel.joinInstall'
					)));
			})();

			gulp.task('build.postpolymer.entrypointJS.fixBackgroundOptions',
				addDescription('Fix some bugs in the background and options pages', () => {
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
				}));

			gulp.task('build.postpolymer.entrypointJS.fixWebcomponentOptionsBugs',
				addDescription('Fix some bugs in the webcomponents file that is used in the options page', () => {
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
				}));

			gulp.task('build.postpolymer.entrypointJS.nodefer',
				addDescription('Don\'t defer loads in entrypoint HTML files', () => {
					return gulp
						.src([
							'./build/html/options.html',
							'./build/html/install.html',
							'./build/html/logging.html',
						])
						.pipe(replace(/\sdefer/g, ''))
						.pipe(gulp.dest('./build/html/'));
				}));

			/** Banners */
			(() => {
				gulp.task('build.postpolymer.entrypointJS.banners.html',
					addDescription('Creates banners in the HTML files', () => {
						return gulp
							.src(['build/html/**.html'])
							.pipe(banner(BANNERS.html))
							.pipe(gulp.dest('./build/html/'))
					}));

				gulp.task('build.postpolymer.entrypointJS.banners.js',
					addDescription('Creates banners in the JS files', () => {
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
					}));

				gulp.task('build.postpolymer.entrypointJS.banners',
					addDescription('Creates banners in all HTML and JS files', gulp.parallel(
						'build.postpolymer.entrypointJS.banners.html',
						'build.postpolymer.entrypointJS.banners.js'
					)));
			})();

			gulp.task('build.postpolymer.entrypointJS',
				addDescription('Crisps, babels and joins all entrypoints', gulp.series(
					'build.postpolymer.entrypointJS.crisp',
					'build.postpolymer.entrypointJS.babel',
					gulp.parallel(
						'build.postpolymer.entrypointJS.fixBackgroundOptions',
						'build.postpolymer.entrypointJS.fixWebcomponentOptionsBugs',
						'build.postpolymer.entrypointJS.nodefer'
					),
					'build.postpolymer.entrypointJS.banners'
				)));
		})();

		/** Monaco */
		(() => {
			gulp.task('build.postpolymer.monaco.js',
				addDescription('Copies JS files from monaco to build/ and uglifies them', () => {
					return cache('monaco-post-js', () => {
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
					}).pipe(gulp.dest('build/elements/options/editpages/monaco-editor/src/min/'));
				}));

			gulp.task('build.postpolymer.monaco.nonjs',
				addDescription('Copies non-JS files from monaco to build/ and uglifies them', () => {
					return cache('monaco-post-nonjs', () => {
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
					}).pipe(gulp.dest('build/elements/options/editpages/monaco-editor/src/min/'));
				}));

			gulp.task('build.postpolymer.monaco',
				addDescription('Operations related to copying monaco', gulp.parallel(
					'build.postpolymer.monaco.js',
					'build.postpolymer.monaco.nonjs'
				)));

			gulp.task('build.postpolymer.cleanTemp',
				addDescription('Cleans the temp/ directory', async () => {
					await del('./temp');
				}));
		})();

		gulp.task('build.postpolymer', addDescription('All post-polymer tasks during building',
			gulp.series(
				'build.postpolymer.moveUpDir',
				'build.postpolymer.cleanBuildTemp',
				gulp.parallel(
					'build.postpolymer.copyWebComponentLibs',
					'build.postpolymer.copyPrefixJs'
				),
				'build.postpolymer.entrypointJS',
				gulp.parallel(
					'build.postpolymer.cleanTemp',
					'build.postpolymer.monaco'
				)
			)));
	})();

	/** Dev */
	(() => {
		gulp.task('build.dev.polymer', addDescription('Builds polymer in dev mode', async () => {
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
			});
		}));

		gulp.task('build.dev.beautify', addDescription('Beautifies all JS files', async () => {
			return gulp
				.src('build/**/*.js')
				.pipe(beautify())
				.pipe(gulp.dest('./build/'));
		}));
	})();

	gulp.task('build.extraDependencies',
		addDescription('Copies extra dependencies not already copied by polymer', () => {
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
		}));

	gulp.task('buildDevNoCompile', genRootTask('buildDevNoCompile',
		'Builds the extension and attempts to beautify the code and skips compilation',
		gulp.series(
			'build.prepolymer',
			'build.dev.polymer',
			'build.extraDependencies',
			'build.postpolymer',
			'build.dev.beautify'
		)));

	/** Non-dev */
	(() => {
		gulp.task('build.prod.polymer', addDescription('Runs the polymer build command', async () => {
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
		}));

		gulp.task('build.prod.uglify',
			addDescription('Uglifies the entrypoint prefix', () => {
				return gulp
					.src([
						'./build/html/entrypointPrefix.js'
					])
					.pipe(uglify())
					.pipe(gulp.dest('./build/html/'));
			}));
	})();

	gulp.task('buildNoCompile', genRootTask('buildNoCompile',
		'Builds the extension and skips compilation',
		gulp.series(
			'build.prepolymer',
			'build.prod.polymer',
			'build.extraDependencies',
			'build.postpolymer',
			'build.prod.uglify'
		)));

	gulp.task('buildDev', genRootTask('buildDev',
		'Builds the extension and attempts to beautify the code',
		gulp.series(
			'compile',
			'buildDevNoCompile'
		)));

	gulp.task('build', genRootTask('build',
		'Builds the extension',
		gulp.series(
			'compile',
			'buildNoCompile'
		)));

	gulp.task('build.zip', addDescription('Zips the build/ directory', () => {
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
	}));

	gulp.task('buildZip', genRootTask('buildZip', 'Builds the extension and zips it',
		gulp.series(
			'build', 
			'build.zip'
		)));

	/** BuildTest */
	(() => {
		gulp.task('buildTest.join', 
			addDescription('joins the test HTML pages', async () => {
				await joinPages({
					parts: [
						'test/UI/skeleton.html',
						'build/html/background.html',
						'build/html/options.html'
					],
					dest: 'build/html/UITest.html'
				});
			}));
	})();

	gulp.task('buildTest', genRootTask('buildTest',
		'Builds the tests', gulp.series(
			'build', 
			'buildTest.join'
		)));

	gulp.task('testBuild', genRootTask('testBuild',
		'Attempts to build everything', gulp.series(
			'clean', 
			'build', 
			'clean', 
			'documentationWebsite', 
			'clean'
		)));
})();

/** Website related tasks (demo part) */
(() => {
	/** DemoWebsite */
	(() => {
		gulp.task('demoWebsite.copy', addDescription('Copies the demo website to /demo', () => {
			return gulp
				.src('UITest.html', { cwd: './build/html', base: './build/html' })
				.pipe(replace(/<title>((\w|\s)+)<\/title>/g, '<title>Demo</title>'))
				.pipe(replace(/<head>/, '<head><base href="../build/html/">'))
				.pipe(rename('index.html'))
				.pipe(gulp.dest('./demo'));
		}));
	})();

	gulp.task('demoWebsite', genRootTask('demoWebsite', 
		'Creates the demo and moves the demo website to /demo', gulp.series(
			'buildTest', 
			'demoWebsite.copy'
		)));

	gulp.task('removeBowerComponents', genRootTask('removeBowerComponents',
		'Removes the app/bower_components folder', async () => {
			await del('./app/bower_components');
		}));

	gulp.task('changeGitIgnore', genRootTask('changeGitIgnore', 
		'Moves the gitignore for the gh-pages branch to the root', () => {
			return gulp
				.src('gh-pages-gitignore.gitignore', { cwd: './tools', base: './tools' })
				.pipe(rename('.gitignore'))
				.pipe(gulp.dest('./'));
		}));
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
async function doReplace(lines: string[], regexp: RegExp, callback: (match: RegExpExecArray) => Promise<string>): Promise<string[]> {
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
	gulp.task('genDefs', genRootTask('genDefs', 
		'Move all crmapi .d.ts files into a single file', async () => {
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
	function moveBrowser(browser: string, dest: string) {
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
	function moveToDist(browser: string) {
		return gulp
			.src('./**/*', { cwd: './build/', base: './build/' })
			.pipe(gulp.dest(`./dist/${browser}`));
	}

	gulp.task('browserChrome', genRootTask('browserChrome', 
		'Copy the chrome manifest.json', () => {
			return moveBrowser('chrome', './app');
		}));

	gulp.task('browserFirefox', genRootTask('browserFirefox',
		'Copy the firefox manifest.json', () => {
			return moveBrowser('firefox', './app');
		}));

	gulp.task('browserEdge', genRootTask('browserEdge', 
		'Copy the edge manifest.json', () => {
			return moveBrowser('edge', './app');
		}));

	gulp.task('browserOpera', genRootTask('browserOpera',
		'Copy the opera manifest.json', () => {
				return moveBrowser('opera', './app');
			}));

	gulp.task('browserChromeBuild', genRootTask('browserChromeBuild',
		'Copy the chrome manifest.json', () => {
			return moveBrowser('chrome', './build');
		}));

	gulp.task('browserFirefoxBuild', genRootTask('browserFirefoxBuild',
		'Copy the firefox manifest.json', () => {
			return moveBrowser('firefox', './build');
		}));

	gulp.task('browserEdgeBuild', genRootTask('browserEdgeBuild', 
		'Copy the edge manifest.json', () => {
			return moveBrowser('edge', './build');
		}));

	gulp.task('browserOperaBuild', genRootTask('browserOperaBuild', 
		'Copy the opera manifest.json', () => {
			return moveBrowser('opera', './build');
		}));

	gulp.task('copyUnstashed', genRootTask('copyUnstashed', 
		'Copies the unstashed manifest to /build', () => {
			return gulp
				.src('./app/manifest.json')
				.pipe(gulp.dest('./build'));
		}));

	gulp.task('stashBrowser', genRootTask('stashBrowser',
		'Copy the current manifest and store it to undo overrides later', () => {
			return gulp
				.src('./app/manifest.json', { allowEmpty: true })
				.pipe(rename('manifest.temp.json'))
				.pipe(gulp.dest('./app'));
		}));

	gulp.task('unstashBrowser', genRootTask('unstashBrowser',
		'Undo any overrides since the last stashing of the manifest', () => {
			return gulp
				.src('./app/manifest.temp.json', { allowEmpty: true })
				.pipe(rename('manifest.json'))
				.pipe(gulp.dest('./app'));
		}));

	/**
	 * Move the built files to /dist and create a zip to place in /dist/packed
	 */
	function doMove(browser: string, replaceName?: boolean): Undertaker.TaskFunction {
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

	gulp.task('chromeToDistTest', genRootTask('chromeToDistTest',
		'Copies the /build folder to the /dist/chrome folder with a test manifest',
			doMove('chrome')));

	gulp.task('firefoxToDistTest', genRootTask('firefoxToDistTest',
		'Copies the /build folder to the /dist/firefox folder with a test manifest',
			doMove('firefox')));

	gulp.task('edgeToDistTest', genRootTask('edgeToDistTest',
		'Copies the /build folder to the /dist/edge folder with a test manifest',
			doMove('edge')));

	gulp.task('operaToDistTest', genRootTask('operaToDistTest',
		'Copies the /build folder to the /dist/opera folder with a test manifest',
			doMove('opera')));

	gulp.task('chromeToDist', genRootTask('chromeToDist',
		'Copies the /build folder to the /dist/chrome folder',
			doMove('chrome', true)));

	gulp.task('firefoxToDist', genRootTask('firefoxToDist',
		'Copies the /build folder to the /dist/firefox folder',
			doMove('firefox', true)));

	gulp.task('edgeToDist', genRootTask('edgeToDist',
		'Copies the /build folder to the /dist/edge folder',
			doMove('edge', true)));

	gulp.task('operaToDist', genRootTask('operaToDist',
		'Copies the /build folder to the /dist/opera folder',
			doMove('opera', true)));

	/** genCRX */
	(() => {
		gulp.task('genCRX.firefox', 
			addDescription('Generates the CRX file for firefox', () => {
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
			}));

		gulp.task('genCRX.chrome', 
			addDescription('Generates the CRX file for chrome', () => {
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
			}));
	})();

	gulp.task('genCRX', genRootTask('genCRX',
		'Generates a crx file and places it in the /dist/packed folder',
			gulp.parallel(
				'genCRX.firefox',
				'genCRX.chrome'
			)));

	gulp.task('genXPI', genRootTask('genXPI',
		'Generates an xpi file and places it in the /dist/packed folder', async () => {
			await xpi('./dist/packed/Custom Right-Click Menu.firefox.xpi', './dist/firefox');
		}));
})();

/* Distributing and getting build artifacts */
(() => {
	/** Zipping */
	(() => {
		gulp.task('zip.build', 
			addDescription('Zips the build/ directory and places it in ' + 
				'artifacts.build.zip', () => {
					return gulp
						.src([
							'build/**',
						])
						.pipe(zip('artifacts.build.zip'))
						.pipe(gulp.dest('./'));
				}));

		gulp.task('zip.dist', 
			addDescription('Zips the dist/ directory and places it in ' + 
				'artifacts.dist.zip', () => {
					return gulp
						.src([
							'dist/**',
						])
						.pipe(zip('artifacts.dist.zip'))
						.pipe(gulp.dest('./'));
				}));
	})();
	
	gulp.task('zipArtifacts', genRootTask('zipArtifacts',
		'Creates a zip file from the build/ and dist/ dirs',
			gulp.parallel(
				'zip.build',
				'zip.dist'
			)));

	/** Unzipping */
	(() => {
		gulp.task('unzip.build', 
			addDescription('Unzips artifacts.build.zip to build/', async () => {
				await new Promise((resolve, reject) => {
					const zip = new StreamZip({
						file: 'artifacts.build.zip',
						storeEntries: true
					});

					mkdirp(path.join(__dirname, 'build/'), (err) => {
						if (err) {
							reject(err);
						} else {
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
			}));

		gulp.task('unzip.dist', 
			addDescription('Unzips artifacts.dist.zip to dist/', async () => {
				await new Promise((resolve, reject) => {
					const zip = new StreamZip({
						file: 'artifacts.dist.zip',
						storeEntries: true
					});

					mkdirp(path.join(__dirname, 'dist/'), (err) => {
						if (err) {
							reject(err);
						} else {
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
			}));
	})();

	gulp.task('unzipArtifacts', genRootTask('unzipArtifacts',
		'Unzips the artifacts.dist.zip and artifacts.build.zip files',
			gulp.parallel(
				'unzip.build',
				'unzip.dist'
			)));

	gulp.task('genAppx:copy', genRootTask('genAppx:copy',
		'Copies store images to the packaged dir', async () => {
				return gulp
					.src('resources/logo/edge/*')
					.pipe(gulp
						.dest('dist/CRM/edgeextension/manifest/Assets'))
			}));

	gulp.task('genAppx:replace', genRootTask('genAppx:replace',
		'Replaces manifest fields in edge extension manifest', async () => {
			let packageManifest = await readFile(
				'dist/CRM/edgeextension/manifest/appxmanifest.xml');
			/**
			 * @type {{"version": string}}
			 */
			const edgeManifest: { "version": string; } = JSON.parse(await readFile(
				'dist/edge/manifest.json'));

			/**
			 * @type {{"Name": string, "Publisher": string, "PublisherDisplayName": string}}
			 */
			const secrets: { "Name": string; "Publisher": string; "PublisherDisplayName": string; } = JSON.parse(await readFile(
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

	gulp.task('genAppx:clean', genRootTask('genAppx:clean', 
		'Cleans the left over appx files', async () => {
			await del('./dist/CRM');
		}));
})();

/** Meta */
(() => {
	/**
	 * Repeats given {char} {amount} times
	 * 
	 * @param {string} char - The char to repeat
	 * @param {number} amount - The amount of times to repeat it
	 * 
	 * @returns {string} The new string
	 */
	function repeat(char: string, amount: number): string {
		return new Array(amount).fill(char).join('');
	}

	gulp.task('tasks', genRootTask('tasks', 'Lists all top-level tasks', async () => {
		console.log('These are the top-level tasks:');
		console.log('');

		const longest = Array.from(descriptions.keys()).map(k => k.length)
			.reduce((prev, current) => {
				return Math.max(prev, current);
			}, 0);

		for (const [task, description] of descriptions.entries()) {
			console.log(`${chalk.bold(task)}${
				repeat(' ', longest - task.length)} - ${description}`);
		}
	}));

	gulp.task('default', genRootTask('default', 'The default task (build)',
		gulp.series('build')));
})();