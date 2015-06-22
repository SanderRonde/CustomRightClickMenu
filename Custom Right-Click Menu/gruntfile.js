module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		htmlmin: {
			dist: {
				options: {
					removeComments: false,
					collapseWhitespace: true
				},
				files: {
					'build/window.html': 'window.html'
				}
			}
		},
		minified: {
			files: {
				src: [
					'Scripts/*.js'
				],
				dest: 'build/Scripts/'
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundinPrecision: -1
			},
			targets: {
				files: [{
					expand: true,
					src: ['css.css', 'polymer.css'],
					dest: 'build/',
					ext: '.css'
				}]
			}
		},
		copy: {
			main: {
				files: [
					{ expand: true, src: ['Scripts/jquery-2.0.3.min.js', 'Scripts/jquery.color-2.1.2.min.js', 'jquery.easing.js'], dest: 'build/' },
					{ expand: true, src: ['Images/*'], dest: 'build/' },
					{ expand: true, src: ['Colorpicker/**'], dest: 'build/' },
					{ expand: true, src: ['icon-large.png', 'icon-small.png', 'icon-supersmall.png', 'manifest.json', 'Segoe_UI.ttf'], dest: 'build/' }
				]
			}
		},
		usebanner: {
			taskName: {
				options: {
					position: 'top',
					banner: '/*Original can be found at https://github.com/BarryBamibal/BinderApp */',
					linebreak: true
				},
				files: {
					src: ['build/Scripts/background.js', 'build/Scripts/js.js', 'build/Scripts/polymer.js', 'build/Scripts/searchWorker.js', 'build/Scripts/worker.js', 'build/css.css', 'build/polymer.css']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-minified');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-banner');

	grunt.registerTask('build', ['htmlmin', 'minified', 'cssmin', 'copy', 'usebanner']);
}