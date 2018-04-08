const inlineSource = require('gulp-inline-source');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const ts = require('gulp-typescript');
const mkdirp = require('mkdirp');
const rollup = require('rollup');
const path = require('path');
const gulp = require('gulp');
const del = require('del');
const fs = require('fs');

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
 * Read a file
 * 
 * @param {string} filePath - The location to read from
 * @param {{encoding?: 'utf8'}} [options] - Any options
 * @returns {Promise<string>}
 */
function readFile(filePath, options) {
	return new Promise((resolve, reject) => {
		if (!options) {
			fs.readFile(filePath, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data.toString());
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

/**
 * Write a file
 * 
 * @param {string} filePath - The location to write to
 * @param {string} data - The data to write
 * @param {{encoding?: 'utf8'}} [options] - Any options
 */
function writeFile(filePath, data, options) {
	return new Promise(async (resolve, reject) => {
		mkdirp(path.dirname(filePath), (err) => {
			if (err) {
				reject(err);
			} else {
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
			}
		})
	});
}

/* Convenience tasks */
(() => {
	gulp.task(genTask('Cleans the /temp directory',
		async function cleanTemp() {
			await del('./../temp', {
				force: true
			});
		}));

	gulp.task(genTask('Cleans the /dist/meta/ directory',
		async function cleanDist() {
			await del('./../dist/meta', {
				force: true
			});
		}));
})();

/* Compilation */
(() => {
	gulp.task('compile', genTask('Compiles the typescript',
		function compileApp() {
			const project = ts.createProject('tsconfig.json');
			return project.src()
				.pipe(project())
				.js.pipe(gulp.dest('./'));
		}
	));
})();

/* Making original build files fit for this format (single file) */
(() => {
	/**
	 * Inlines all file imports
	 * 
	 * @type {string} fileName - The name of the file
	 * @returns {NodeJS.ReadWriteStream}
	 */
	function inlineFileSource(fileName) {
		return gulp
			.src(`${fileName}.html`, {
				base: './../build/html/',
				cwd: './../build/html/'
			})
			.pipe(replace(/entrypointPrefix.js/,
				`${fileName}.js`))
			.pipe(inlineSource({
				attribute: false,
				swallowErrors: true,
				
				rootpath: path.join(__dirname, '../', './build/html/')
			}))
			.pipe(gulp.dest('./../temp/html/'));
	}

	gulp.task('inline-source', genTask('Inlines all file contents' + 
		'so they can be served as a single string', gulp.parallel(
			function inlineOptions() {
				return inlineFileSource('options')
			},
			function inlineLogging() {
				return inlineFileSource('logging');
			},
			function inlineInstall() {
				return inlineFileSource('install');
			}
		)));
})();

/* Inlining the files in containers */
(() => {
	/**
	 * Inlines given source file into inFile's export string
	 * 
	 * @param {string} inFilePath - The path to the input file
	 * @param {string} sourceFilePath - The path to the file to inline
	 * @returns {Promise<any>}
	 */
	async function doInline(inFilePath, sourceFilePath) {
		const replacement = JSON.stringify((await readFile(sourceFilePath, {
			encoding: 'utf8'
		})).split('\n'));
		gulp
			.src(inFilePath, {
				cwd: './pages/',
				base: './pages/'
			})
			.pipe(replace(/\["FILECONTENTS"\]/g, () => {
				return replacement
			}))
			.pipe(gulp.dest('./../temp/pages/'));
			
	}

	gulp.task('create-file-modules', genTask('Generates .js files containing' + 
		' the source of some files for easy modularisation', gulp.parallel(
			function contentScript() {
				return doInline('content-page.js',
					'./../build/js/contentscript.js');
			},
			function crmapi() {
				return doInline('crmapi-page.js',
					'./../build/js/crmapi.js');
			},
			function installStylesheet() {
				return doInline('installstylesheet-page.js',
					'./../build/js/installStylesheet.js');
			},
			function installPage() {
				return doInline('install-page.js',
					'./../temp/html/install.html');
			},
			function loggingPage() {
				return doInline('logging-page.js',
					'./../temp/html/logging.html');
			},
			function optionsPage() {
				return doInline('options-page.js',
					'./../temp/html/options.html');
			},
		)));
})();

/* Building entrypoints */
(() => {
	gulp.task(genTask('Copy the built adapter files to /temp',
		function copySrc() {
			return gulp.src([
				'background/*',
				'contentscript/*',
				'shared/*'
			], {
				base: './',
				cwd: './'
			}).pipe(gulp.dest('./../temp/'));
		}));

	gulp.task('bundle', genTask('Create file bundles',
		gulp.parallel(
			async function bundleBackground() {
				const bundle = await rollup.rollup({
					input: './../temp/background/background-adapter.js',
					treeshake: false,
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
					file: './../temp/bundles/background.adapter.js'
				});
			},
			async function bundleContent() {
				const bundle = await rollup.rollup({
					input: './../temp/contentscript/contentscript.js',
					treeshake: false,
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
					file: './../temp/bundles/contentscript.js'
				});
			}
		)));

	gulp.task(genTask('Join the background.js file with the background.js adapter',
		function concatBackground() {
			return gulp
				.src([
					'./../temp/bundles/background.adapter.js',
					'./../build/html/background.js'
				])
				.pipe(concat('background.js'))
				.pipe(gulp.dest('./../temp/bundles/'));
		}));

	gulp.task(genTask('Copy the generated files to the /dist dir',
		function copyToDist() {
			return gulp
				.src(['background.js', 'contentscript.js'], {
					cwd: './../temp/bundles/',
					base: './../temp/bundles/'
				})
				.pipe(gulp.dest('./../dist/meta/'));
		}));
})();

/* Main tasks */
(() => {
	gulp.task('meta-adapter-no-compile', genTask('Generates the meta ' +
		'adapter and places it in /dist/meta/ (without compiling)', 
		gulp.series(
			gulp.parallel('cleanTemp', 'cleanDist'),
			'inline-source',
			'create-file-modules',
			'copySrc',
			'bundle',
			'concatBackground',
			'copyToDist',
			// 'cleanTemp'
		)));

	gulp.task('meta-adapter', genTask('Generates the meta adapter ' +
		'and places it in /dist/meta/', gulp.series(
			'compile', 'meta-adapter-no-compile')));
})();

gulp.task('default', gulp.series('meta-adapter'));