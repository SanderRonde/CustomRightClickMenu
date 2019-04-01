const babelPresetEs5 = require('babel-plugin-transform-es5-property-mutators');
import { HtmlSplitter, forkStream, PolymerProject } from 'polymer-build';
const externalHelpers = require('babel-plugin-external-helpers');
const babelPreset2015 = require('babel-preset-es2015');
const minifyPreset = require('babel-preset-minify');
const presetEs3 = require('babel-preset-es3');
import * as htmlMinifier from 'html-minifier';
import * as babelCore from 'babel-core';
import mergeStream from 'merge-stream';
import ProgressBar from 'progress';
import * as stream from 'stream';
import { dest } from 'vinyl-fs';
import cssSlam from 'css-slam';
import * as path from 'path';
import gulpif from 'gulp-if';

const babelTransform = babelCore.transform;
const es2015Preset = babelPreset2015.buildPreset({}, {
	modules: false
});


function pipeStreams(streams: (NodeJS.ReadWriteStream|NodeJS.ReadWriteStream[])[]): NodeJS.ReadWriteStream {
	return Array.prototype.concat.apply([], streams)
		.filter((val: any) => val !== null)
		.reduce((a: NodeJS.ReadWriteStream, b: NodeJS.ReadWriteStream) => {
			return a.pipe(b);
		});
}

interface StreamFile {
	path: string;
	contents: Buffer;
}

class GenericOptimizeTransform<T> extends stream.Transform {
	constructor(public optimizerName: string, 
		public optimizer: (content: string, options: T) => string, 
		public optimizerOptions: T = {} as any) {
		super({objectMode: true});
	}
	
	_transform(file: StreamFile, _encoding: string, 
		callback: (error: Error|null, file: StreamFile) => void) {
			if (!file.path || file.path.indexOf('webcomponentsjs/') >= 0 ||
				file.path.indexOf('webcomponentsjs\\') >= 0) {
				callback(null, file);
				return;
			}
		
			if (file.contents) {
				const contents = file.contents.toString();
				const stringContents = this.optimizer(contents, this.optimizerOptions);
				file.contents = Buffer.from(stringContents);
			}
			callback(null, file);
		}
}

class JSBabelTransform extends GenericOptimizeTransform<{
	presets: any[];
	plugins?: any[];
}> {
	constructor(config: {
		presets: any[];
		plugins?: any[];
	}) {
		super('.js', (contents, options) => {
			return babelTransform(contents, {...options, ...{
				compact: false
			}}).code;
		}, config as any);
	}
}

class JSDefaultCompileTransform extends JSBabelTransform {
	constructor() {
		super({
			presets: [presetEs3, es2015Preset],
			plugins: [babelPresetEs5, externalHelpers],
		});
	}
}

class HTMLOptimizeTransform extends GenericOptimizeTransform<htmlMinifier.Options> {
	constructor(options: htmlMinifier.Options) {
		super('html-minify', htmlMinifier.minify, {...options, ...{
			compact: false
		}});
	}
}

class CSSMinifyTransform extends GenericOptimizeTransform<{
	stripWhitespace?: boolean;
}> {
	constructor(options: {
		stripWhitespace?: boolean;
	}) {
	  super('css-slam', cssSlam.css, {...options, ...{
		compact: false
	}} as any);
	}
  
	_transform(file: StreamFile, encoding: string, 
		callback: (error: Error|null, file: StreamFile) => void) {
		// css-slam will only be run if the `stripWhitespace` option is true.
		// Because css-slam itself doesn't accept any options, we handle the
		// option here before transforming.
		if (this.optimizerOptions.stripWhitespace) {
			super._transform(file, encoding, callback);
		}
	}
}

class InlineCSSOptimizeTransform extends GenericOptimizeTransform<{
	stripWhitespace?: boolean;
}> {
	constructor(options: {
		stripWhitespace?: boolean;
	}) {
	  super('css-slam', cssSlam.html, {...options, ...{
		compact: false
	}});
	}
  
	_transform(file: StreamFile, encoding: string, 
		callback: (error: Error|null, file: StreamFile) => void) {
		// css-slam will only be run if the `stripWhitespace` option is true.
		// Because css-slam itself doesn't accept any options, we handle the
		// option here before transforming.
		if (this.optimizerOptions.stripWhitespace) {
			super._transform(file, encoding, callback);
		}
	}
}

class JSDefaultMinifyTransform extends JSBabelTransform {
	constructor() {
		super({
			presets: [minifyPreset(null, {simplifyComparisons: false})]
		});
	}
}

/**
 * Generates all optimize streams
 */
function getOptimizeStreams(options: {
	css?: {
		minify?: boolean;
	}
	html?: {
		minify?: boolean;
	}
	js?: {
		minify?: boolean;
		compile?: boolean;
	}
}): NodeJS.ReadWriteStream[] {
	options = options || {};

	const streams = [];

	if (options.js && options.js.compile) {
		streams.push(gulpif(/\.js$/, new JSDefaultCompileTransform()));
	}

	if (options.html && options.html.minify) {
		streams.push(gulpif(/\.html$/,
			new HTMLOptimizeTransform(
				{collapseWhitespace: true, removeComments: true})));
	}
	if (options.css && options.css.minify) {
		streams.push(
			gulpif(/\.css$/, new CSSMinifyTransform({stripWhitespace: true})));
		streams.push(gulpif(
			/\.html$/, new InlineCSSOptimizeTransform({stripWhitespace: true})));
	}
	if (options.js && options.js.minify) {
		streams.push(gulpif(/\.js$/, new JSDefaultMinifyTransform()));
	}
	
	return streams;
}

class LoggerStream extends stream.Transform {
	constructor(public bar: ProgressBar) {
		super({objectMode: true});
	}
	
	_transform(file: StreamFile, _encoding: string, 
		callback: (error: Error|null, file: StreamFile) => void) {
		if (!this.bar.complete) {
			this.bar.tick();
		}

		callback(null, file);
	}
}

/**
 * @param {Object} options - The options for this project
 * @param {Object} options.project - The project
 * @param {string[]} options.project.entrypoint - The entrypoints
 * @param {string[]} [options.project.sources] - The sources to read from
 * @param {string} options.project.root - The root of the files (cwd)
 * @param {string[]} options.project.extraDependencies - Any other files to copy along
 * @param {string[]} [options.project.nonPolymerEntrypoints] - Entrypoints that don't use polymer
 * @param {Object} options.optimization - Options related to optimizing the resulting code
 * @param {boolean} [options.optimization.bundle] - Whether to bundle the files
 * @param {Object} [options.optimization.js] - Config related to JS
 * @param {boolean} [options.optimization.js.compile] - Whether to compile the JS
 * @param {boolean} [options.optimization.js.minify] - Whether to minify the JS
 * @param {Object} [options.optimization.css] - Config related to CSS
 * @param {boolean} [options.optimization.css.compile] - Whether to compile the CSS
 * @param {boolean} [options.optimization.css.minify] - Whether to minify the CSS
 * @param {Object} [options.optimization.html] - Config related to HTML
 * @param {boolean} [options.optimization.html.compile] - Whether to compile the HTML
 * @param {boolean} [options.optimization.html.minify] - Whether to minify the HTML
 * @param {string} options.dest - Where to write the files to
 */
export async function polymerBuild(options: {
	project: {
		entrypoint: string|string[];
		sources?: string[];
		root: string;
		extraDependencies: string[];
		nonPolymerEntrypoints?: string[];
	}
	optimization?: {
		bundle?: boolean;
		js?: {
			compile?: boolean;
			minify?: boolean;
		}
		css?: {
			compile?: boolean;
			minify?: boolean;
		}
		html?: {
			compile?: boolean;
			minify?: boolean;
		}
	}
	dest: string;
}) {
	const entrypoints = Array.isArray(options.project.entrypoint) ?
		options.project.entrypoint : [options.project.entrypoint];

	const projectConfigBase = Object.assign(options.project);
	delete projectConfigBase.entrypoint;
	const bar = new ProgressBar(':bar :percent :current/:total', 462);
	await Promise.all(entrypoints.map((entryPoint) => {
		return new Promise((resolve, reject) => {
			const project = new PolymerProject(Object.assign(projectConfigBase, {
				entrypoint: entryPoint
			}));

			const sourcesStream = forkStream(project.sources());
			const depsStream = forkStream(project.dependencies());
			const splitter = new HtmlSplitter();

			let buildStream = pipeStreams([
				mergeStream(sourcesStream, depsStream),
				new LoggerStream(bar),
				splitter.split(),
				getOptimizeStreams(options.optimization),
				splitter.rejoin(),
				project.addBabelHelpersInEntrypoint(),
				pipeStreams((options.project.nonPolymerEntrypoints || []).map((point) => {
					return project.addBabelHelpersInEntrypoint(path.join(project.config.root, point));
				})) || null,
				options.optimization.bundle ? project.bundler({
					rewriteUrlsInTemplates: false
				}) : null,
				dest(options.dest)
			]);

			buildStream.on('end', () => {
				resolve();
			});
			buildStream.on('error', () => {
				reject();
			});
		});
	}));
}