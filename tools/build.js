const externalHelpers = require('babel-plugin-external-helpers');
const polymerBuild = require('polymer-build');
const mergeStream = require('merge-stream');
const gulpif = require('gulp-if');
const forkStream = polymerBuild.forkStream;
const HtmlSplitter = polymerBuild.HtmlSplitter;
const stream = require('stream');
const babelCore = require('babel-core');
const babelTransform = babelCore.transform;
const presetEs3 = require('babel-preset-es3');
const minifyPreset = require('babel-preset-minify');
const babelPreset2015 = require('babel-preset-es2015');
const babelPresetEs5 = require('babel-plugin-transform-es5-property-mutators');
const es2015Preset = babelPreset2015.buildPreset({}, {
	modules: false
});
const htmlMinifier = require('html-minifier');
const cssSlam = require('css-slam');
const dest = require('vinyl-fs').dest;
const path = require('path');


function pipeStreams(streams) {
	return Array.prototype.concat.apply([], streams)
		.filter(val => val !== null)
		.reduce((a, b) => {
			return a.pipe(b);
		});
}

function genLabeler(grunt, containerName) {
	return (stream, streamName) => {
		return labelStream(stream, streamName, grunt, containerName);
	};
}

function labelStream(stream, name, grunt, containerName) {
	stream.on && stream.on('end', () => {
		grunt.log.writeln('Stream', name, 'done', 'in entrypoint', containerName);
	});
	return stream;
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
			file.contents = new Buffer(contents);
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

module.exports = function(grunt) {
	grunt.registerMultiTask('polymerBuild', 'Builds a polymer project', function() {
		const done = this.async();

		var options = this.options({});
		const PolymerProject = polymerBuild.PolymerProject;
		const entrypoints = Array.isArray(options.project.entrypoint) ?
			options.project.entrypoint : [options.project.entrypoint];

		const projectConfigBase = Object.assign(options.project);
		delete projectConfigBase.entrypoint;
		Promise.all(entrypoints.map((entryPoint) => {
			return new Promise((resolve, reject) => {
				const project = new PolymerProject(Object.assign(projectConfigBase, {
					entrypoint: entryPoint
				}));

				const labeler = genLabeler(grunt, entryPoint);

				grunt.log.writeln('Reading sources...');
				const sourcesStream = labeler(forkStream(project.sources()), 'sources');
				const depsStream = labeler(forkStream(project.dependencies()), 'deps');
				const splitter = new HtmlSplitter();

				let buildStream = pipeStreams([
					labeler(mergeStream(sourcesStream, depsStream), 'merger'),
					labeler(splitter.split(), 'splitter'),
					labeler(getOptimizeStreams(options.optimization), 'optimizer'),
					labeler(splitter.rejoin(), 'rejoiner'),
					labeler(project.addBabelHelpersInEntrypoint(), 'babelHelpersOptions'),
					pipeStreams((options.project.nonPolymerEntrypoints || []).map((point) => {
						return labeler(project.addBabelHelpersInEntrypoint(path.join(project.config.root, point)), 'babel helpers');
					})) || null,
					options.optimization.bundle ? labeler(project.bundler({
						rewriteUrlsInTemplates: false
					}), 'bundler') : null,
					labeler(dest(options.dest), 'dest')
				]);

				buildStream.on('end', () => {
					grunt.log.ok('Done with entrypoint', entryPoint);
					resolve();
				});
				buildStream.on('error', (err) => {
					reject();
				});
			});
		})).then(() => {
			grunt.log.ok('Done building polymer project');
			done();
		}).catch((err) => {
			grunt.log.error(err);
			done(false);
		});
	});
}