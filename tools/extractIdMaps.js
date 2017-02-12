var htmlParser = require('htmlparser2');
var async = require('async');
var path = require('path');

module.exports = function(grunt) {
	grunt.registerMultiTask('extractIdMaps', 
		'Extracts the ID to typescript type maps from HTML files', function() {
			var fileObj = this.files[0];
			var srcFile = fileObj.src[0];
			var options = this.options({});

			var done = this.async();

			async.forEachSeries(this.files, function(fileObj, nextSeries) {
				var srcFiles = fileObj.src.filter(function(filepath) {
					if (!grunt.file.exists(filepath)) {
						grunt.log.warn('File ' + filepath + ' does not exist');
						return false;
					}
					return true;
				})

				if (srcFile.length === 0) {
					return nextSeries();
				}

				async.concatSeries(srcFiles, function(file, nextFile) {
					console.log(grunt.file.read(file));
					const parser = new htmlParser.Parser({
						onopentag: function(name, attribs) {
							console.log(name, attribs);
						}
					});
					parser.write(grunt.file.read(file));
					parser.end();
					nextFile();
				}, function() {
					nextSeries();
				});
			}, done);
		});
}