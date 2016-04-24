var path = require('path');
var util = require('util');

module.exports = function(grunt) {
    grunt.registerMultiTask('removePrefix', 'Removed a prefix from all links, hrefs and src attibutes in an html file', function() {
        var _this = this;
        var options = this.options({
            prefix: '../'
        })
		this.files.forEach(function(fileObj) {
			fileObj.orig.src.forEach(function(fileOrig) {
				fileOrig.src.forEach(function(file) {
					var fileLoc = fileOrig.cwd + file;
					var fileContents = grunt.file.read(fileLoc);
					var lines = fileContents.split('\n');
					lines = lines.map(function(line) {
						return line
							.replace('href="' + options.prefix, 'href="')
							.replace('src="' + options.prefix, 'src="');
					});
					grunt.log.ok('Removed prefixes from ' + fileLoc);
					grunt.file.write(fileLoc, lines.join('\n'));
				})
			});
		})
    })
}