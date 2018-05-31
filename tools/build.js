const babelPresetEs5 = require('babel-plugin-transform-es5-property-mutators');
const { HtmlSplitter, forkStream, PolymerProject } = require('polymer-build');
const externalHelpers = require('babel-plugin-external-helpers');
const babelPreset2015 = require('babel-preset-es2015');
const minifyPreset = require('babel-preset-minify');
const presetEs3 = require('babel-preset-es3');
const htmlMinifier = require('html-minifier');
const mergeStream = require('merge-stream');
const babelCore = require('babel-core');
const dest = require('vinyl-fs').dest;
const cssSlam = require('css-slam');
const gulpif = require('gulp-if');
const stream = require('stream');
const path = require('path');
const babelTransform = babelCore.transform;
	const es2015Preset = babelPreset2015.buildPreset({}, {
	modules: false
});


function pipeStreams(streams) {
	return Array.prototype.concat.apply([], streams)
		.filter(val => val !== null)
		.reduce((a, b) => {
			return a.pipe(b);
		});
}

class GenericOptimizeTransform extends stream.Transform {
	
	constructor(optimizerName, optimizer, optimizerOptions) {
		super({objectMode: true});
		this.optimizer = optimizer;
		this.optimizerName = optimizerName;
		this.optimizerOptions = Object.assign(optimizerOptions || {}, {
			compact: true	
		});
	}
	
	_transform(file, _encoding, callback) {
		if (!file.path || file.path.indexOf('webcomponentsjs/') >= 0 ||
			file.path.indexOf('webcomponentsjs\\') >= 0) {
			callback(null, file);
			return;
		}
	
		if (file.contents) {
			let contents = file.contents.toString();
			contents = this.optimizer(contents, this.optimizerOptions);
			file.contents = Buffer.from(contents);
		}
		callback(null, file);
	}
}

class JSBabelTransform extends GenericOptimizeTransform {
	constructor(config) {
		const transform = (contents, options) => {
			return babelTransform(contents, options).code;
		};
		super('.js', transform, config);
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

class HTMLOptimizeTransform extends GenericOptimizeTransform {
	constructor(options) {
		super('html-minify', htmlMinifier.minify, options);
	}
}

class CSSMinifyTransform extends GenericOptimizeTransform {
	constructor(options) {
	  super('css-slam', cssSlam.css, options);
	}
  
	_transform(file, encoding, callback) {
		// css-slam will only be run if the `stripWhitespace` option is true.
		// Because css-slam itself doesn't accept any options, we handle the
		// option here before transforming.
		if (this.optimizerOptions.stripWhitespace) {
			super._transform(file, encoding, callback);
		}
	}
}

class InlineCSSOptimizeTransform extends GenericOptimizeTransform {
	constructor(options) {
	  super('css-slam', cssSlam.html, options);
	}
  
	_transform(file, encoding, callback) {
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
 * @param {Object} options - Optimization options
 * @param {Object} [options.css] - CSS optimization options
 * @param {boolean} [options.css.minify] - Whether to minify the css files
 * @param {Object} [options.html] - HTML optimization options
 * @param {boolean} [options.html.minify] - Whether to minify the html files
 * @param {Object} [options.js] - JS optimization options
 * @param {boolean} [options.js.minify] - Whether to minify the js files
 * @param {boolean} [options.js.compile] - Whether to compile the JS files
 */
function getOptimizeStreams(options) {
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
module.exports = async function(options) {
	const entrypoints = Array.isArray(options.project.entrypoint) ?
		options.project.entrypoint : [options.project.entrypoint];

	const projectConfigBase = Object.assign(options.project);
	delete projectConfigBase.entrypoint;
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
			buildStream.on('error', (err) => {
				reject();
			});
		});
	}));
}