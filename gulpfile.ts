import { extractGlobTypes } from 'html-typings';
import { joinPages } from './tools/joinPages';
import { polymerBuild } from './tools/build';
import processhtml from 'gulp-processhtml';
import childProcess from 'child_process';
import StreamZip from 'node-stream-zip';
import beautify from 'gulp-beautify';
import Undertaker from 'undertaker';
import replace from 'gulp-replace';
import gulpBabel from 'gulp-babel';
import ts from 'gulp-typescript';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import banner from 'gulp-banner';
import * as rollup from 'rollup';
import xpi from 'firefox-xpi';
import crisper from 'crisper';
import mkdirp from 'mkdirp';
import zip from 'gulp-zip';
import "reflect-metadata";
import chalk from 'chalk';
import which from 'which';
import gulp from 'gulp';
import glob from 'glob';
import path from 'path';
import del from 'del';
import fs from 'fs';

// Only show subtasks when they are actually being run, otherwise
// the -T screen is just being spammed
const REGISTER_SUBTASKS = process.argv.indexOf('-T') === -1 &&
	process.argv.indexOf('--tasks') === -1;

const BANNERS = {
	html: '<!--Original can be found at https://www.github.com/SanderRonde' +
		'/CustomRightClickMenu\nThis code may only be used under the MIT' +
		' style license found in the LICENSE.txt file-->\n',
	js: '/*!\n * Original can be found at https://github.com/SanderRonde' +
		'/CustomRightClickMenu \n * This code may only be used under the MIT' +
		' style license found in the LICENSE.txt file \n**/\n'
}

type DescribedFunction<T extends ReturnFunction = ReturnFunction> = T & {
	description: string;
}

type ReturnFunction = (() => void)|(() => Promise<any>)|
	(() => NodeJS.ReadWriteStream)|Undertaker.TaskFunction;

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

 /* Decorators */
interface TaskStructure {
	type: 'parallel'|'series';
	children: (TaskStructure|ReturnFunction)[];
}

function parallel(...tasks: (ReturnFunction|TaskStructure)[]): TaskStructure {
	return {
		type: 'parallel',
		children: tasks
	}
}

function series(...tasks: (ReturnFunction|TaskStructure)[]): TaskStructure {
	return {
		type: 'series',
		children: tasks
	}
}

function describe(description: string): MethodDecorator {
	return (_target, _propertyName, descriptor) => {
		(descriptor.value as unknown as DescribedFunction).description = description;
	}
}

const taskClassMetaKey = Symbol('task-class');
function taskClass(name: string): ClassDecorator {
	return (target) => {
		Reflect.defineMetadata(taskClassMetaKey, name, target);
	}
}

const groupMetaKey = Symbol('group');
// Not used for anything as of now except for documentation purposes
function group(name: string): PropertyDecorator {
	return (target, propertyKey) => {
		Reflect.defineMetadata(groupMetaKey, name, target, propertyKey);
	}
}

const rootTaskMetaKey = Symbol('root-task');
function rootTask(nameOrDescription: string, description?: string): PropertyDecorator {
	let name: string = null;
	if (!description) {
		description = nameOrDescription;
	} else {
		name = nameOrDescription;
	}
	return ((target: any, propertyKey: string, descr: any) => {
		descr && ((descr.value as DescribedFunction).description = description);
		descriptions.set(name || propertyKey, description);

		Reflect.defineMetadata(rootTaskMetaKey, [name || propertyKey, description], 
			target, propertyKey);
	}) as any;
}

const subtaskMetaKey = Symbol('root-task');
function subTask(nameOrDescription: string, description?: string): PropertyDecorator {
	let name: string = '';
	if (!description) {
		description = nameOrDescription;
	} else {
		name = nameOrDescription;
	}
	return (target, propertyKey) => {
		Reflect.defineMetadata(subtaskMetaKey, [name, description], 
			target, propertyKey);
	}
}

@taskClass('')
class Tasks {
	@group('convenience')
	static Convenience = (() => {
		class Convenience {
			static Clean = (() => {
				@taskClass('clean')
				class Clean {
					@describe('Cleans the build cache dir')
					static async cache() {
						await del('./.buildcache');
					}
					
					@describe('Cleans the /build directory')
					static async build() {
						await del('./build');
					}
					
					@describe('Cleans the /dist directory')
					static async dist() {
						await del('./dist');
					}

					@rootTask('cleanDist', 'Cleans the /dist directory')
					static cleanDist = series(
						Clean.dist
					);

					@rootTask('clean', 'Cleans the building and caching directories')
					static clean = parallel(
						Clean.cache, 
						Clean.build, 
						Clean.dist
					);
				}
				return Clean;
			})();

			static PrepareForHotReload = (() => {
				@taskClass('prepareForHotReload')
				class PrepareForHotReload {
					@describe('Crisps the bower components')
					static crispComponents() {
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
					};
			
					@describe('Copies monaco files and beautifies them')
					static copyMonacoBeautiful() {
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
					};
			
					@describe('Embed the typescript compiler')
					static tsEmbedDev() {
						return gulp
							.src('typescript.js', {
								cwd: './node_modules/typescript/lib',
								base: './node_modules/typescript/lib'
							})
							.pipe(uglify())
							.pipe(gulp.dest('./app/js/libraries/'))
					};
			
					@describe('Embed the less compiler')
					static async lessEmbedDev() {
						const less = await readFile('./resources/buildresources/less.min.js');
						await writeFile('./app/js/libraries/less.js', less);
					};
			
					@describe('Embed the stylus compiler)')
					static async stylusEmbedDev() {
						const stylus = await readFile('./resources/buildresources/stylus.min.js');
						await writeFile('./app/js/libraries/stylus.js', stylus);
					};
			
					@describe('Embed the CRM API definitions)')
					static async crmapiLib() {
						await writeFile('./app/js/libraries/crmapi.d.ts', await Tasks.Definitions._joinDefs());
					};

					@rootTask('prepareForHotReload',
						'Prepares the extension for hot reloading, developing through ' +
						'the app/ directory instead and not having to build make sure to run ' +
						'`yarn install --force --ignore-engines` before this')
					static prepareForHotReload = parallel(
						PrepareForHotReload.crispComponents,
						PrepareForHotReload.copyMonacoBeautiful,
						PrepareForHotReload.tsEmbedDev,
						PrepareForHotReload.lessEmbedDev,
						PrepareForHotReload.stylusEmbedDev,
						PrepareForHotReload.crmapiLib
					)
				}
				return PrepareForHotReload;
			})();

			@rootTask('disableHotReload', 
				'Disables hot reloading, required for proper build')
			static disableHotReload() {
				return new Promise((resolve, reject) => {
					which('yarn', (err, cmdPath) => {
						if (err) {
							reject(err);
						} else {
							const cmd = childProcess.spawn(cmdPath, ['--force', '--ignore-engines']);
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
			}
		}
		return Convenience;
	})();

	@group('i18n')
	static I18N = (() => {
		interface I18NMessage {
			message: string;
			description?: string;
			placeholders?: {
				[key: string]: {
					content: string;
					example?: string;
				}
			}
		}

		type I18NRoot = {
			[key: string]: I18NRoot|I18NMessage;
		};

		@taskClass('i18n')
		class I18N {
			private static _isMessage(descriptor: I18NMessage|I18NRoot): descriptor is I18NMessage {
				if (!('message' in descriptor)) return false;
				return typeof descriptor.message === 'string';
			}

			private static _isIgnored(key: string) {
				return key === '$schema' || key === 'comments';
			}

			private static _walkMessages(root: I18NRoot, 
				fn: (message: I18NMessage, currentPath: string[], key: string) => void,
				currentPath: string[] = []) {
					for (const key in root) {
						const message = root[key];
						if (this._isIgnored(key)) continue;
						if (this._isMessage(message)) {
							fn(message, currentPath, key);
						} else {
							this._walkMessages(message, fn, [...currentPath, key]);
						}
					}
				}

			private static _getFreshFileExport(file: string) {
				const resolved = require.resolve(`./${file}`);
				if (resolved in require.cache) {
					delete require.cache[resolved];
				}
				const { Messages } = require(`./${file}`);
				return Messages;
			}

			private static getMessageFiles(): Promise<[any, string][]> {
				return new Promise<[any, string][]>((resolve, reject) => {
					glob('./app/_locales/*/messages.js', async (err, matches) => {
						if (err) {
							reject();
							return;
						}
						resolve(matches.map((file) => {
							return [require(file).Messages, file] as [any, string];
						}));
					});
				});
			}

			private static _genPath(currentPath: string[], key: string) {
				if (currentPath.length === 0) {
					// First item, return key by itself
					return key;
				}
				// Requires an @ and dots for the rest
				return [
					currentPath.slice(0, 2).join('_'), 
					...currentPath.slice(2),
					key
				].join('_');
			}

			@describe('Compiles the .ts files into .js files')
			static compileTS() {
				return new Promise(async (resolve, reject) => {
					const files = await new Promise<string[]>((resolve, reject) => {
						glob('app/_locales/**/*.ts', (err, matches) => {
							if (err) { 
								reject(err);
							} else {
								resolve(matches);
							}
						});
					});
					const dest = (() => {
						if (files.length > 1) {
							return './app/_locales';
						}
						return files[0].split('messages.ts')[0];
					})();

					const project = ts.createProject('app/_locales/tsconfig.json');
					const proj = project.src().pipe(project());
					proj.once('error', () => {
						reject('Error(s) thrown during compilation');
					});
					proj.js.pipe(gulp.dest(dest)).once('end', () => {
						resolve(null);
					});
				});
			}

			static Compile = (() => {
				@taskClass('compile')
				class Compile {					
					private static _normalizeMessages(root: I18NRoot) {
						const normalized: {
							[key: string]: I18NMessage;
						} = {};
						I18N._walkMessages(root, (message, currentPath, key) => {
							normalized[I18N._genPath(currentPath, key)] = message;
						});
						return normalized;
					}
		
					static async _compileI18NFile(file: string, data?: any) {
						const normalized = this._normalizeMessages(
							data || I18N._getFreshFileExport(file));
						await writeFile(path.join(path.dirname(file), 'messages.json'),
							JSON.stringify(normalized, null, '\t'));
					}
		
					@describe('Turns I18N TS files into messages.json files')
					static async compile() {
						const files = await I18N.getMessageFiles();
						await files.map(([ data, fileName ]) => {
							Compile._compileI18NFile(fileName, data);
						});
					}

					private static _activeTask: Promise<any>;

					@describe('Runs when watched file changes')
					static async watchFileChange() {
						let currentTask = Compile._activeTask;
						await Compile._activeTask.then(() => {
							if (Compile._activeTask !== currentTask) {
								return Compile._activeTask;
							} else {
								Compile._activeTask = null;
								return true;
							}
						});
					}

					@describe('Watches for file changes and compiles on change')
					static async watcher() {
						const watcher = gulp.watch('./app/_locales/*/messages.js', 
							Compile.watchFileChange);
						watcher.on('change', (fileName) => {
							Compile._activeTask = (async () => {
								const fileData = I18N._getFreshFileExport(fileName);
								await I18N.Compile._compileI18NFile(fileName, fileData);
							})();
						});
						watcher.on('add', (fileName) => {
							Compile._activeTask = (async () => {
								const fileData = I18N._getFreshFileExport(fileName);
								await I18N.Compile._compileI18NFile(fileName, fileData);
							})();
						});
						return watcher;
					}

					@subTask('watch', 'Compiles, then watches for file changes and compiles on change')
					static watch = series(
						Compile.compile,
						Compile.watcher
					);
				}
				return Compile;
			})();

			static Defs = (() => {
				type NestedObject = {
					[key: string]: string|NestedObject;
				};

				const I18NMessage = [
					'interface I18NMessage {',
					'	message: string;',
					'	description?: string;',
					'	placeholders?: {',
					'		[key: string]: {',
					'			key: string;',
					'			example?: string;',
					'			content: string;',
					'		}',
					'	}',
					'}'
				].join('\n');

				const marker = 'x'.repeat(50);
				const readonlyExpr = new RegExp(`"${marker}"`, 'g');

				type Change = {
					direction: 'forwards'|'backwards';
					name: string;
				};

				@taskClass('defs')
				class Defs {
					private static async _typeMessages(root: I18NRoot, typed: NestedObject = {}) {
						I18N._walkMessages(root, (_message, currentPath, finalKey) => {
							let currentObj = typed;
							for (const key of currentPath) {
								if (!(key in currentObj)) {
									currentObj[key] = {};
								}
								currentObj = currentObj[key] as NestedObject;
							}
							currentObj[finalKey] = marker;
						});
						return typed;
					}

					@describe('Generates the lang spec from input files, making sure all ' +
						'fields are represented in all languages')
					static async genSpec() {
						const files = await I18N.getMessageFiles();
						const typed: NestedObject = {};
						await files.map(([data]) => {
							return Defs._typeMessages(data, typed);
						});
						const spec = JSON.stringify(typed, null, '\t').replace(
							readonlyExpr, 'I18NMessage');
						const specFile = `${I18NMessage}\nexport type LocaleSpec = ${spec}`;
						await writeFile(path.join(__dirname, 'app/_locales/i18n.d.ts'),
							specFile);
					}

					private static _getMatches(a: string[], b: string[]): number {
						let matches: number = 0;
						for (let i = 0; i < Math.max(a.length, b.length); i++) {
							if (a[i] === b[i]) {
								matches++;
							} else {
								return matches;
							}
						}
						return matches;
					}
					
					private static _getDiffPath(a: string[], b: string[]): Change[] {
						let matches = Defs._getMatches(a, b);
					
						if (a.length === b.length && matches === a.length) return [];
						return [
							...a.slice(matches).reverse().map((item) => {
								return {
									direction: 'backwards',
									name: item
								} as Change;
							}),
							...b.slice(matches).map((item) => {
								return {
									direction: 'forwards',
									name: item
								} as Change;
							})
						]
					}

					private static _indent(length: number) {
						return '\t'.repeat(length);
					}

					static genEnumMessages(root: I18NRoot) {
						let str: string[] = [];
						let tree: string[] = [];
						I18N._walkMessages(root, (_message, currentPath, finalKey) => {
							const diff = Defs._getDiffPath(tree, currentPath);
							if (diff.length) {
								for (let i = 0; i < diff.length; i++) {
									const change = diff[i];
									if (change.direction === 'backwards') {
										str.push(Defs._indent(tree.length - 1) + '}');
										tree.pop();
									} else if (i === diff.length - 1) {
										// Last one, this is an enum instead
										str.push(Defs._indent(tree.length) + `export const enum ${change.name} {`);
										tree.push(change.name);
									} else {
										str.push(Defs._indent(tree.length) + `export namespace ${change.name} {`);
										tree.push(change.name);
									}
								}
							} 
							str.push(`${Defs._indent(tree.length)}"${finalKey}" = '${
								I18N._genPath(currentPath, finalKey)}',`);
						});
						for (let i = 0; i < tree.length; i++) {
							str.push(Defs._indent(tree.length - 1) + '}');
						}
						return `export namespace I18NKeys {\n${
							str.map(i => Defs._indent(1) + i).join('\n')
						}\n}`;
					}

					@describe('Generates enums that can be used to reference some ' +
						'property in typescript, preventing typos and allowing for ' +
						'the finding of references')
					static async genEnums() {
						const files = await I18N.getMessageFiles();
						if (files.length === 0) {
							console.log('No source files to generate enums from');
							return;
						}
						const enums = await Defs.genEnumMessages(files[0][0]);
						await writeFile(path.join(__dirname, 'app/_locales/i18n-keys.ts'),
							enums);
					}

					@rootTask('i18nDefs', 'Generates definitions files based on i18n files')
					static defs = series(
						I18N.compileTS,
						parallel(
							Defs.genEnums,
							Defs.genSpec
						)
					)

					private static _activeTask: Promise<any>;

					@describe('Runs when watched file changes')
					static async watchFileChange() {
						let currentTask = Defs._activeTask;
						await Defs._activeTask.then(() => {
							if (Defs._activeTask !== currentTask) {
								return Defs._activeTask;
							} else {
								Defs._activeTask = null;
								return true;
							}
						});
					}

					@describe('Watches for file changes and updates enums on change')
					static async watcher() {
						const watcher = gulp.watch('./app/_locales/*/messages.js', Defs.watchFileChange);
						watcher.on('change', (fileName) => {
							Defs._activeTask = (async () => {
								const fileData = I18N._getFreshFileExport(fileName);
								const enums = await I18N.Defs.genEnumMessages(fileData)
								await writeFile(path.join(__dirname, 'app/_locales/i18n-keys.ts'),
									enums);
							})();
						});
						watcher.on('add', (fileName) => {
							Defs._activeTask = (async () => {
								const fileData = I18N._getFreshFileExport(fileName);
								const enums = await I18N.Defs.genEnumMessages(fileData)
								await writeFile(path.join(__dirname, 'app/_locales/i18n-keys.ts'),
									enums);
							})();
						});
						return watcher;
					}

					@subTask('watch',
						'Gens enums, then watches for file changes and updates enums on change')
					static watch = series(
						Defs.genEnums,
						Defs.watcher
					)
				}
				return Defs;
			})();

			private static _activeTask: Promise<any>;

			@describe('Runs when watched file changes')
			static async watchFileChange() {
				let currentTask = I18N._activeTask;
				await I18N._activeTask.then(() => {
					if (I18N._activeTask !== currentTask) {
						return I18N._activeTask;
					} else {
						I18N._activeTask = null;
						return true;
					}
				});
			}
			
			@describe('Turns I18N TS files into messages.json files whenever they change')
			static watcher() {
				const watcher = gulp.watch('./app/_locales/*/messages.js', I18N.watchFileChange);
				watcher.on('change', (fileName) => {
					I18N._activeTask = (async () => {
						const fileData = I18N._getFreshFileExport(fileName);
						const [ , enums] = await Promise.all([
							I18N.Compile._compileI18NFile(fileName, fileData),
							I18N.Defs.genEnumMessages(fileData)
						]);
						await writeFile(path.join(__dirname, 'app/_locales/i18n-keys.ts'),
							enums);
					})();
				});
				watcher.on('add', (fileName) => {
					I18N._activeTask = (async () => {
						const fileData = I18N._getFreshFileExport(fileName);
						const [ , enums] = await Promise.all([
							I18N.Compile._compileI18NFile(fileName, fileData),
							I18N.Defs.genEnumMessages(fileData)
						]);
						await writeFile(path.join(__dirname, 'app/_locales/i18n-keys.ts'),
							enums);
					})();
				});
				return watcher;
			}

			@subTask('watch', 
				'Turns I18N TS files into messages.json files and repeats it whenever they change')
			static watch = series(
				I18N.Compile.compile,
				I18N.watcher
			)

			@rootTask('i18n', 
				'Compiles I18N files and generates spec and enum files')
			static i18n = series(
				I18N.Defs.genSpec,
				I18N.Defs.genEnums,
				I18N.Compile.compile
			)
		}
		return I18N;
	})();

	@group('compilation')
	static Compilation = (() => {
		class Compilation {
			@rootTask('fileIdMaps',
				'Updates the HTML to Typescript maps')
			static async fileIdMaps() {
				const pattern = '{app/elements/**/*.html,!app/elements/elements.html}';
				const typings = await extractGlobTypes(pattern);
				await writeFile('./app/elements/fileIdMaps.d.ts', typings);
			}

			@rootTask('defs',
				'Generates definitions for various TS files. Required for compilation')
			static defs = parallel(
				Compilation.fileIdMaps,
				Tasks.I18N.Defs.defs
			)

			static Compile = (() => {
				@taskClass('compile')
				class Compile {
					@describe('Compiles the app/ directory\'s typescript')
					static app() {
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
					}

					@describe('Compiles the test/ directory\'s typescript')
					static test() {
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
					}

					@rootTask('compile', 'Compiles the typescript')
					static compile = series(
						Compilation.defs,
						parallel(
							Compile.app,
							Compile.test
						)
					)
				}
				return Compile;
			})();
		}
		return Compilation;
	})();

	@group('documentation-website')
	static DocumentationWebsite = (() => {
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
	
		async function runCmd(cmd: string, cwd: string = __dirname, 
			allowFailure: boolean = false) {
				return new Promise((resolve, reject) => {
					childProcess.exec(cmd, {
						cwd: cwd
					}, (err, stdout, stderr) => {
						if (err !== null && !allowFailure) {
							console.log(stdout, stderr);
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
	
			console.log('Removing post install hook');
			const file = await readFile(path.join(__dirname, 'typedoc', 'package.json'));
			await writeFile(path.join(__dirname, 'typedoc', 'package.json'),
				file.replace(/"prepare":/g, "\"ignored\":"));
	
			console.log('Installing typedoc dependencies (this may take a few minutes)');
			await runCmd('npm install', cwd);
	
			console.log('Running post install hook');
			await runCmd('tsc --project .', cwd, true);
	
			console.log('Installing this extension\'s typescript version in cloned typedoc');
			await runCmd(`npm install --save typescript@${tsVersion}`, cwd);
	
			console.log('Done!');
		}

		class DocumentationWebsite {
			@rootTask('documentationWebsite',
				'Extracts the files needed for the documentationWebsite' +
				' and places them in build/website')
			static async documentationWebsite() {
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
			}

			@rootTask('moveFavicon', 
				'Moves the favicon for the website to the directory')
			static moveFavicon() {
				return gulp
					.src('favicon.ico', { cwd: './test/UI/', base: './test/UI/' })
					.pipe(gulp.dest('./documentation/'));
			}
		}

		return DocumentationWebsite;
	})();

	@group('building')
	static Building = (() => {
		class Building {
			static Build = (() => {
				@taskClass('build')
				class Build {
					static PrePolymer = (() => {
						@taskClass('prepolymer')
						class PrePolymer {
							@describe('Copies monaco files from node_modules to app/ and temp/')
							static copyMonacoJs() {
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
							}

							@describe('Copies non-js monaco files from node_modules to app/ and temp/')
							static copyMonacoNonJs() {
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
							}

							@describe('Replaces CRM-dev with CRM in the manifest')
							static devManifest() {
								return gulp
									.src('manifest.json', { cwd: './app/', base: './app/' })
									.pipe(replace(/CRM-dev/g, 'CRM'))
									.pipe(gulp.dest('./temp/'));
							}

							@describe('Bundles the backgroundpage up')
							static async rollupBackground() {
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
							}

							@describe('Copies files necessary for building from app/ to temp/')
							static copyBuild() {
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
							}

							@describe('Copies install page files to temp/')
							static copyInstalling() {
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
							}

							@describe('Inline external CSS imports into HTML files')
							static inlineImports() {
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
							}

							@describe('Change where "this" points to in webcomponents-lite')
							static changeWebComponentThis() {
								return gulp
									.src('bower_components/webcomponentsjs/webcomponents-lite.js', {
										cwd: './app/',
										base: './app/'
									})
									.pipe(replace(/window===this((\s)?)\?((\s)?)this/g, 'true?window'))
									.pipe(gulp.dest('./temp/'));
							}

							@describe('Embeds the typescript compilation library')
							static embedTS() {
								return cache('ts-lib-ugly', () => {
									return gulp
										.src('typescript.js', {
											cwd: './node_modules/typescript/lib',
											base: './node_modules/typescript/lib'
										})
										.pipe(uglify())
								}).pipe(gulp.dest('./temp/js/libraries'));
							}

							@describe('Embeds the Less compiler')
							static async embedLess() {
								const less = await readFile('./resources/buildresources/less.min.js');
								await writeFile('./temp/js/libraries/less.js', less);
							}

							@describe('Embeds the stylus compiler')
							static async embedStylus() {
								const stylus = await readFile('./resources/buildresources/stylus.min.js');
								await writeFile('./temp/js/libraries/stylus.js', stylus);
							}

							@describe('Embeds the CRM API')
							static async embedCRMAPI() {
								await writeFile('./temp/js/libraries/crmapi.d.ts', await Tasks.Definitions._joinDefs());
							}

							static Entrypoint = (() => {
								@taskClass('entrypoint')
								class Entrypoint {
									@describe('Run processhtml on the entrypoint')
									static process() {
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
									}

									@describe('Crisp the entrypoint file')
									static async crisp() {
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

									@subTask('Entrypointprefix stuff')
									static entrypoint = series(
										Entrypoint.process,
										Entrypoint.crisp
									)
								}
								return Entrypoint;
							})();

							@describe('Run processhtml on the generated files in the temp/ dir')
							static processHTMLTemp() {
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
							}

							@subTask('All pre-polymer tasks during building')
							static prepolymer = series(
								Tasks.Convenience.Clean.build,
								parallel(
									PrePolymer.copyMonacoJs,
									PrePolymer.copyMonacoNonJs
								),
								parallel(
									PrePolymer.devManifest,
									PrePolymer.rollupBackground,
									PrePolymer.copyBuild,
									PrePolymer.copyInstalling,
									PrePolymer.inlineImports,
									PrePolymer.changeWebComponentThis,
									PrePolymer.embedTS,
									PrePolymer.embedLess,
									PrePolymer.embedStylus,
									PrePolymer.embedCRMAPI,
									PrePolymer.Entrypoint.entrypoint
								),
								PrePolymer.processHTMLTemp
							)
						}
						return PrePolymer;
					})();

					static PostPolymer = (() => {
						@taskClass('postpolymer')
						class PostPolymer {
							@describe('Moves all files up a directory, from build/temp to build/')
							static moveUpDir() {
								return gulp
									.src('**/*', { cwd: './build/temp', base: './build/temp' })
									.pipe(gulp.dest('./build'))
							}

							@describe('Cleans the build/temp/ directory')
							static async cleanBuildTemp() {
								await del('./build/temp/');
							}

							@describe('Copy the webcomponent libraries from temp/ to build/')
							static copyWebComponentLibs() {
								return gulp
									.src([
										'webcomponentsjs/*.js',
										'!webcomponentsjs/webcomponents-lite.js'
									], {
											cwd: './temp/bower_components',
											base: './temp/bower_components'
										})
									.pipe(gulp.dest('./build/bower_components'));
							}

							@describe('Copies entrypointPrefix from temp/ to build/')
							static copyPrefixJs() {
								return gulp
									.src('html/entrypointPrefix.js', {
										cwd: './temp/',
										base: './temp/'
									})
									.pipe(gulp.dest('./build/'));
							}

							static EntrypointJS = (() => {
								@taskClass('entrypointJS')
								class EntrypointJS {
									static Crisp = (() => {
										@taskClass('crisp')
										class Crisp {
											@describe('Crisps the options.html page')
											static async options() {
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
											}

											@describe('Crisps the logging.html page')
											static async logging() {
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
											}

											@describe('Crisps the install.html page')
											static async install() {
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
											}

											@describe('Crisps the background.html page')
											static async background() {
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

											@subTask('Crisping of all entrypoints')
											static crisp = parallel(
												Crisp.options,
												Crisp.logging,
												Crisp.install,
												Crisp.background
											)
										}
										return Crisp;
									})();

									static Babel = (() => {
										@taskClass('babel')
										class Babel {
											@describe('Babel the options page')
											static options() {
												return gulp
													.src('./build/html/options.js')
													.pipe(gulpBabel({
														compact: false,
														presets: ['es3', 'es2015']
													}))
													.pipe(rename('options.es3.js'))
													.pipe(gulp.dest('./build/html/'));
											}

											@describe('Babel the logging page')
											static logging() {
												return gulp
													.src('./build/html/logging.js')
													.pipe(gulpBabel({
														compact: false,
														presets: ['es3', 'es2015']
													}))
													.pipe(rename('logging.es3.js'))
													.pipe(gulp.dest('./build/html/'));
											}

											@describe('Babel the install page')
											static install() {
												return gulp
													.src('./build/html/install.js')
													.pipe(gulpBabel({
														compact: false,
														presets: ['es3', 'es2015']
													}))
													.pipe(rename('install.es3.js'))
													.pipe(gulp.dest('./build/html/'));
											}

											@describe('Babel the background page')
											static background() {
												return gulp
													.src('./build/html/background.js')
													.pipe(gulpBabel({
														compact: false,
														presets: ['es3', 'es2015']
													}))
													.pipe(gulp.dest('./build/html/'));
											}

											@describe('Joins the options page with the prefix')
											static async joinOptions() {
												await joinPages({
													parts: [
														'temp/html/entrypointPrefix.html',
														'build/html/options.html'
													],
													dest: 'build/html/options.html'
												});
											}

											@describe('Joins the logging page with the prefix')
											static async joinLogging() {
												await joinPages({
													parts: [
														'temp/html/entrypointPrefix.html',
														'build/html/logging.html'
													],
													dest: 'build/html/logging.html'
												});
											}

											@describe('Joins the install page with the prefix')
											static async joinInstall() {
												await joinPages({
													parts: [
														'temp/html/entrypointPrefix.html',
														'build/html/install.html'
													],
													dest: 'build/html/install.html'
												});
											}

											@subTask('Babelify all entrypoints and join them with the prefix')
											static babel = parallel(
												Babel.options,
												Babel.logging,
												Babel.install,
												Babel.background,
												Babel.joinOptions,
												Babel.joinLogging,
												Babel.joinInstall
											)
										}
										return Babel;
									})();

									@describe('Fix some bugs in the background and options pages')
									static fixBackgroundOptions() {
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
									}

									@describe('Fix some bugs in the webcomponents file that is used in the options page')
									static fixWebcomponentOptionsBugs() {
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
									}

									@describe('Don\'t defer loads in entrypoint HTML files')
									static nodefer() {
										return gulp
											.src([
												'./build/html/options.html',
												'./build/html/install.html',
												'./build/html/logging.html',
											])
											.pipe(replace(/\sdefer/g, ''))
											.pipe(gulp.dest('./build/html/'));
									}

									static Banners = (() => {
										@taskClass('banners')
										class Banners {
											@describe('Creates banners in the HTML files')
											static html() {
												return gulp
													.src(['build/html/**.html'])
													.pipe(banner(BANNERS.html))
													.pipe(gulp.dest('./build/html/'))
											}

											@describe('Creates banners in the JS files')
											static js() {
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
											
											@subTask('Creates banners in all HTML and JS files')
											static banners = parallel(
												Banners.html,
												Banners.js
											)
										}
										return Banners;
									})();

									@subTask('Crisps, babels and joins all entrypoints')
									static entrypointJS = series(
										EntrypointJS.Crisp.crisp,
										EntrypointJS.Babel.babel,
										parallel(
											EntrypointJS.fixBackgroundOptions,
											EntrypointJS.fixWebcomponentOptionsBugs,
											EntrypointJS.nodefer
										),
										EntrypointJS.Banners.banners
									)
								}
								return EntrypointJS;
							})();

							static Monaco = (() => {
								@taskClass('monaco')
								class Monaco {
									@describe('Copies JS files from monaco to build/ and uglifies them')
									static js() {
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
									}

									@describe('Copies non-JS files from monaco to build/ and uglifies them')
									static nonjs() {
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
									}

									@subTask('Operations related to copying monaco')
									static monaco = parallel(
										Monaco.js,
										Monaco.nonjs
									)
								}
								return Monaco;
							})();

							@describe('Cleans the temp/ directory')
							static async cleanTemp() {
								await del('./temp');
							}

							@subTask('postpolymer', 'All post-polymer tasks during building')
							static postpolymer = series(
								PostPolymer.moveUpDir,
								PostPolymer.cleanBuildTemp,
								parallel(
									PostPolymer.copyWebComponentLibs,
									PostPolymer.copyPrefixJs
								),
								PostPolymer.EntrypointJS.entrypointJS,
								parallel(
									PostPolymer.cleanTemp,
									PostPolymer.Monaco.monaco
								)
							)
						}
						return PostPolymer;
					})();

					static Dev = (() => {
						@taskClass('dev')
						class Dev {
							@describe('Builds polymer in dev mode')
							static async polymer() {
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
							}

							@describe('Beautifies all JS files')
							static async beautify() {
								return gulp
									.src('build/**/*.js')
									.pipe(beautify())
									.pipe(gulp.dest('./build/'));
							}
						}
						return Dev;
					})();

					@describe('Copies extra dependencies not already copied by polymer')
					static extraDependencies() {
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
					}


					@rootTask('buildDevNoCompile', 
						'Builds the extension and attempts to beautify' +
						' the code and skips compilation')
					static buildDevNoCompile = series(
						Build.PrePolymer.prepolymer,
						Build.Dev.polymer,
						Build.extraDependencies,
						Build.PostPolymer.postpolymer,
						Build.Dev.beautify
					)

					static Prod = (() => {
						@taskClass('prod')
						class Prod {
							@describe('Runs the polymer build command')
							static async polymer() {
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
							}

							@describe('Uglifies the entrypoint prefix')
							static uglify() {
								return gulp
									.src([
										'./build/html/entrypointPrefix.js'
									])
									.pipe(uglify())
									.pipe(gulp.dest('./build/html/'));
							}
						}
						return Prod;
					})();

					@rootTask('buildNoCompile', 'Builds the extension and skips compilation')
					static buildNoCompile = series(
						Build.PrePolymer.prepolymer,
						Build.Prod.polymer,
						Build.extraDependencies,
						Build.PostPolymer.postpolymer,
						Build.Prod.uglify
					)

					@rootTask('buildDev', 'Builds the extension and attempts to beautify the code')
					static buildDev = series(
						Tasks.Compilation.Compile.compile,
						Tasks.I18N.i18n,
						Build.buildDevNoCompile
					)

					@rootTask('build', 'Builds the extension')
					static build = series(
						Tasks.Compilation.Compile.compile,
						Tasks.I18N.i18n,
						Build.buildNoCompile
					)

					@rootTask('testBuild', 'Attempts to build everything')
					static testBuild = series(
						Tasks.Convenience.Clean.clean,
						Build.build,
						Tasks.Convenience.Clean.clean,
						Tasks.DocumentationWebsite.documentationWebsite,
						Tasks.Convenience.Clean.clean
					)
				}
				return Build;
			})();

			static BuildZip = (() => {
				@taskClass('buildZip')
				class BuildZip {
					@describe('Zips the build/ directory')
					static zip() {
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
					}

					@rootTask('buildZip', 'Builds the extension and zips it')
					static buildZip = series(
						Building.Build.build,
						BuildZip.zip
					)
				}
				return BuildZip;
			})();

			static BuildTest = (() => {
				@taskClass('buildTest')
				class BuildTest {
					@describe('joins the test HTML pages')
					static async join() {
						await joinPages({
							parts: [
								'test/UI/skeleton.html',
								'build/html/background.html',
								'build/html/options.html'
							],
							dest: 'build/html/UITest.html'
						});
					}

					@rootTask('buildTest', 'Builds the tests')
					static buildTest = series(
						Building.Build.build,
						BuildTest.join
					)
				}
				return BuildTest;
			})();
		}
		return Building;
	})();

	@group('demowebsite')
	static DemoWebsite = (() => {
		class DemoWebsite {
			static DemoWebsite = (() => {
				@taskClass('demoWebsite')
				class DemoWebsite {
					@describe('Copies the demo website to /demo')
					static copy() {
						return gulp
							.src('UITest.html', { cwd: './build/html', base: './build/html' })
							.pipe(replace(/<title>((\w|\s)+)<\/title>/g, '<title>Demo</title>'))
							.pipe(replace(/<head>/, '<head><base href="../build/html/">'))
							.pipe(rename('index.html'))
							.pipe(gulp.dest('./demo'));
					}

					@rootTask('demoWebsite', 
						'Creates the demo and moves the demo website to /demo')
					static demoWebsite = series(
						Tasks.Building.BuildTest.buildTest,
						DemoWebsite.copy
					)
				}
				return DemoWebsite;
			})();

			@rootTask('removeBowerComponents',
				'Removes the app/bower_components folder')
			static async removeBowerComponents() {
				await del('./app/bower_components');
			}

			@rootTask('changeGitIgnore',
				'Moves the gitignore for the gh-pages branch to the root')
			static changeGitIgnore() {
				return gulp
					.src('gh-pages-gitignore.gitignore', { cwd: './tools', base: './tools' })
					.pipe(rename('.gitignore'))
					.pipe(gulp.dest('./'));
			}
		}
		return DemoWebsite;
	})();

	@group('definitions')
	static Definitions = (() => {
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

		class Definitions {
			public static _joinDefs = joinDefs;

			/**
			 * Replace a line with given callback's response when regexp matches
			 * 
			 * @param {string[]} lines - The lines to iterate through
			 * @param {RegExp} regexp - The expression that should match
			 * @param {(match: RegExpExecArray) => Promise<string>} callback - A function that
			 * 		returns the to-replace string based on the match
			 * @returns {Promise<string[]>} - The new array
			 */
			public static _doReplace = doReplace;

			@rootTask('genDefs', 'Move all crmapi .d.ts files into a single file')
			static async genDefs() {
				await writeFile('./dist/defs/crmapi.d.ts', await Definitions._joinDefs());
			}
		}
		return Definitions;
	})();

	@group('browser')
	static Browser = (() => {
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

		class Browser {
			@rootTask('Copy the chrome manifest.json')
			static browserChrome() {
				return moveBrowser('chrome', './app');
			}

			@rootTask('Copy the firefox manifest.json')
			static browserFirefox() {
				return moveBrowser('firefox', './app');
			}

			@rootTask('Copy the edge manifest.json')
			static browserEdge() {
				return moveBrowser('edge', './app');
			}

			@rootTask('Copy the opera manifest.json')
			static browserOpera() {
				return moveBrowser('opera', './app');
			}

			@rootTask('Copy the chrome manifest.json')
			static browserChromeBuild() {
				return moveBrowser('chrome', './build');
			}

			@rootTask('Copy the firefox manifest.json')
			static browserFirefoxBuild() {
				return moveBrowser('firefox', './build');
			}

			@rootTask('Copy the edge manifest.json')
			static browserEdgeBuild() {
				return moveBrowser('edge', './build');
			}

			@rootTask('Copy the opera manifest.json')
			static browserOperaBuild() {
				return moveBrowser('opera', './build');
			}

			@rootTask('Copies the unstashed manifest to /build')
			static copyUnstashed() {
				return gulp
				.src('./app/manifest.json')
				.pipe(gulp.dest('./build'));
			}

			@rootTask('Copy the current manifest and store it to undo overrides later')
			static stashBrowser() {
				return gulp
				.src('./app/manifest.json', { allowEmpty: true } as any)
				.pipe(rename('manifest.temp.json'))
				.pipe(gulp.dest('./app'));
			}

			@rootTask('Undo any overrides since the last stashing of the manifest')
			static unstashBrowser() {
				return gulp
				.src('./app/manifest.temp.json', { allowEmpty: true } as any)
				.pipe(rename('manifest.json'))
				.pipe(gulp.dest('./app'));
			}

			@rootTask('Copies the /build folder to the /dist/chrome folder with a test manifest')
			static chromeToDistTest = doMove('chrome');

			@rootTask('Copies the /build folder to the /dist/firefox folder with a test manifest')
			static firefoxToDistTest = doMove('firefox');

			@rootTask('Copies the /build folder to the /dist/edge folder with a test manifest')
			static edgeToDistTest = doMove('edge')

			@rootTask('Copies the /build folder to the /dist/opera folder with a test manifest')
			static operaToDistTest = doMove('opera')

			@rootTask('Copies the /build folder to the /dist/chrome folder')
			static chromeToDist = doMove('chrome', true);

			@rootTask('Copies the /build folder to the /dist/firefox folder')
			static firefoxToDist = doMove('firefox', true);

			@rootTask('Copies the /build folder to the /dist/edge folder')
			static edgeToDist = doMove('edge', true);

			@rootTask('Copies the /build folder to the /dist/opera folder')
			static operaToDist = doMove('opera', true);

			static genCRX = (() => {
				@taskClass('genCRX')
				class GenCRX {
					@describe('Generates the CRX file for firefox')
					static firefox() {
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
					}

					@describe('Generates the CRX file for chrome)')
					static chrome() {
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
					}

					@rootTask('genCRX', 
						'Generates a crx file and places it in the /dist/packed folder')
					static genCRX = parallel(
						GenCRX.firefox,
						GenCRX.chrome
					);
				}
				return GenCRX;
			})();

			@describe('Generates an xpi file and places it in the /dist/packed folder')
			static async genXPI() {
				await xpi('./dist/packed/Custom Right-Click Menu.firefox.xpi', './dist/firefox');
			}
		}
		return Browser;
	})();

	@group('distribution')
	static Distribution = (() => {
		class Distribution {
			static Zip = (() => {
				@taskClass('zip')
				class Zip {
					@describe('Zips the build/ directory and places it in ' + 
						'artifacts.build.zip')
					static build() {
						return gulp
							.src([
								'build/**',
							])
							.pipe(zip('artifacts.build.zip'))
							.pipe(gulp.dest('./'));
					}

					@describe('Zips the dist/ directory and places it in ' + 
						'artifacts.dist.zip')
					static dist() {
						return gulp
							.src([
								'dist/**',
							])
							.pipe(zip('artifacts.dist.zip'))
							.pipe(gulp.dest('./'));
					}

					@rootTask('zipArtifacts', 
						'Creates a zip file from the build/ and dist/ dirs')
					static zipArtifacts = parallel(
						Zip.build,
						Zip.dist
					);
				}
				return Zip;
			})();

			static Unzip = (() => {
				@taskClass('unzip')
				class Unzip {
					@describe('Unzips artifacts.build.zip to build/')
					static async build() {
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
					}

					@describe('Unzips artifacts.dist.zip to dist/')
					static async dist() {
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
					}

					@rootTask('unzipArtifacts',
						'Unzips the artifacts.dist.zip and artifacts.build.zip files')
					static unzipArtifacts = parallel(
						Unzip.build,
						Unzip.dist
					);
				}
				return Unzip;
			})();

			@rootTask('genAppx:copy', 'Copies store images to the packaged dir')
			static genAppxCopy() {
				return gulp
					.src('resources/logo/edge/*')
					.pipe(gulp
						.dest('dist/CRM/edgeextension/manifest/Assets'))
			}

			@rootTask('genAppx:replace', 
				'Replaces manifest fields in edge extension manifest')
			static async genAppxReplace() {
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
			}

			@rootTask('genAppx:clean',
				'Cleans the left over appx files')
			static async genAppxClean() {
				await del('./dist/CRM');
			}
		}
		return Distribution;
	})();

	@group('meta')
	static Meta = (() => {
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

		class Meta {
			@rootTask('tasks', 'Lists all top-level tasks')
			static async tasks() {
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
			}

			@rootTask('default', 'The default task (build)')
			static default = series(
				Tasks.Building.Build.build
			);
		}
		return Meta;
	})();
}

namespace TaskGeneration {
	function joinNames(first: string, second: string): string {
		if (first === '') return second;
		if (second === '') return first;
		return `${first}.${second}`;
	}

	function getFnProperties<T>(taskTree: T): Partial<T> {
		const props: Partial<T> = {};
		for (const key of Object.getOwnPropertyNames(taskTree)) {
			if (key !== 'length' && key !== 'prototype' &&
				key !== 'name') {
					props[key as keyof T] = taskTree[key as keyof T];
				}
		}
		return props;
	}

	function collapseTask(root: TaskStructure|Function): Undertaker.TaskFunction {
		if (typeof root === 'function') return root as Undertaker.TaskFunction;
		const fns = root.children.map((child: ReturnFunction|TaskStructure) => {
			if (typeof child === 'function') {
				// Regular function, get name
				if (REGISTER_SUBTASKS) {
					return fnNames.get(child);
				} else {
					return child;
				}
			} else {
				// Task structure
				return collapseTask(child);
			}
		});
		return root.type === 'parallel' ?
			gulp.parallel(...fns) : gulp.series(...fns);
	}

	const fnNames: WeakMap<ReturnFunction, string> = new WeakMap();
	export function createBasicTasks(taskTree: any, baseName: string = '') {
		const currentName = joinNames(baseName, 
			Reflect.getOwnMetadata(taskClassMetaKey, taskTree) || '');
		const root = getFnProperties(taskTree);

		for (const key in root) {
			if (key.startsWith('_')) continue;

			const value = taskTree[key];
			if (Reflect.getOwnMetadata(taskClassMetaKey, value) ||
				Reflect.getOwnMetadata(groupMetaKey, taskTree, key)) {
					// Subtree
					createBasicTasks(value, currentName);
			} else if (typeof value === 'function' && 
				!Reflect.getOwnMetadata(rootTaskMetaKey, taskTree, key)) {
					// Sub-function
					const taskName = (value as Function).name;
					const joinedNames = joinNames(currentName, taskName);
					if (REGISTER_SUBTASKS) {
						gulp.task(joinedNames, value);
					}
					fnNames.set(value, joinedNames);
			} else if (Reflect.getOwnMetadata(subtaskMetaKey, taskTree, key)) {
				// Sub-task
				const [ taskName ] = Reflect.getOwnMetadata(subtaskMetaKey, taskTree, key);
				const joinedNames = joinNames(currentName, taskName);
				if (REGISTER_SUBTASKS) {
					gulp.task(joinedNames, collapseTask(value));
				}
				fnNames.set(value, joinedNames);
			} else if (Reflect.getOwnMetadata(rootTaskMetaKey, taskTree, key)) {
				const reflected = Reflect.getOwnMetadata(rootTaskMetaKey,
					taskTree, key);
				let [ taskName ] = reflected;
				if (typeof value === 'function') {
					taskName = taskName || key;
				}
				fnNames.set(value, taskName);
			}
		}

		return taskTree;
	}

	export function createRootTasks(taskTree: any) {
		const root = getFnProperties(taskTree);

		for (const key in root) {
			if (key.startsWith('_')) continue;

			const value = taskTree[key];
			if (Reflect.getOwnMetadata(taskClassMetaKey, value) ||
				Reflect.getOwnMetadata(groupMetaKey, taskTree, key)) {
				// Subtree
				createRootTasks(value);
			} else if (Reflect.getOwnMetadata(rootTaskMetaKey, taskTree, key)) {
				// Main task
				const reflected = Reflect.getOwnMetadata(rootTaskMetaKey,
					taskTree, key);
				let [ taskName, description ] = reflected;
				if (typeof value === 'function') {
					taskName = taskName || key;
				}
				gulp.task(taskName, genRootTask(taskName, 
					description, collapseTask(value)));
			}
		}
	}
}

TaskGeneration.createBasicTasks(Tasks)
TaskGeneration.createRootTasks(Tasks);