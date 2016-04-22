var codeMirrorLicense = '﻿// CodeMirror, copyright (c) by Marijn Haverbeke and others\n// Distributed under an MIT license: http://codemirror.net/LICENSE';
var jsLintLicense = '// jslint.js\n// 2015-08-20\n// Copyright (c) 2015 Douglas Crockford  (www.JSLint.com)\n\n// Permission is hereby granted, free of charge, to any person obtaining a copy\n// of this software and associated documentation files (the "Software"), to deal\n// in the Software without restriction, including without limitation the rights\n// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n// copies of the Software, and to permit persons to whom the Software is\n// furnished to do so, subject to the following conditions:\n\n// The above copyright notice and this permission notice shall be included in\n// all copies or substantial portions of the Software.\n\n// The Software shall be used for Good, not Evil.\n\n// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n// SOFTWARE.';
var cssLintLicense = '/*!\nCSSLint\nCopyright (c) 2015 Nicole Sullivan and Nicholas C. Zakas. All rights reserved.\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \'Software\'), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\nTHE SOFTWARE IS PROVIDED \'AS IS\', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n*/';
var parserLibLicense = '/*!\nParser-Lib\nCopyright (c) 2009-2011 Nicholas C. Zakas. All rights reserved.\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n*/';
var codeMirrorFilesLicenses = [codeMirrorLicense, jsLintLicense, cssLintLicense, parserLibLicense].join('\n\n');

var jqueryContextMenuLicense = '/*!\n * jQuery contextMenu - Plugin for simple contextMenu handling\n *\n * Version: 1.6.5\n *\n * Authors: Rodney Rehm, Addy Osmani (patches for FF)\n * Web: http://medialize.github.com/jQuery-contextMenu/\n *\n * Licensed under\n *   MIT License http://www.opensource.org/licenses/mit-license\n *   GPL v3 http://opensource.org/licenses/GPL-3.0\n *\n */';


module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		extractCrmDefs: {
			updateCRMDefs: {
				options: {
					type: 'tern'
				},
				files: [{
					src: ['app/js/crmapi.js'],
					dest: 'build/js/crmAPIDefs.js',
					expand: false
				}]
			},
			updateHTMLDocs: {
				options: {
					type: 'html'
				},
				files: [{
					src: ['app/js/crmapi.js'],
					dest: 'app/html/crmAPIDocs.html',
					expand: false
				}]
			},
			updateVsDocs: {
				options: {
					type: 'vs'
				},
				files: [{
					src: ['app/js/crmapi.js'],
					dest: 'definitionFiles/vsDocs.js',
					expand: false
				}]
			}
		},
		processhtml: {
			updateCRMDefs: {
				options: {
					strip: true
				},
				files: {
					'app/html/crmAPIDocs.html': ['app/html/crmAPIDocsUI.html']
				}
			},
			build: {
				options: {
					strip: true
				},
				files: {
					'build/html/crmAPIDocs.html': ['app/html/crmAPIDocsUI.html'],
					'build/elements/crm-app/crm-app.html': ['build/elements/crm-app/crm-app.html'],
					'build/html/options.html': ['build/html/options.html']
				}
			}
		},
		uglify: {
			options: {
				screwIE8: true
			},
			codeMirrorMinify: {
				files: {
					'build/js/codeMirrorFile.min.js': ['app/js/codemmirror.js', 'app/js/diff_match_patch.js', 'app/js/codeMirrorAddons.js', 'app/js/userscriptMetadataCodemirror.js', 'app/js/codemirrorJs.js']
				}
			},
			crmMinifiy: {
				files: [
					{
						expand: true,
						cwd: 'app/js',
						src: ['background.js', 'crmapi.js', 'crmAPIDefs.js', 'crmAPIDocs.js'],
						dest: 'build/js/'
					}
				]
			}
		},
		concat: {
			options: {
				seperator: ';\n'
			},
			jqueryConcat: {
				src: ['app/js/jquery-2.0.3.min.js', 'app/js/jquery-ui.min.js', 'app/js/jquery.requestAnimationFrame.min.js', 'app/js/jquery.contextMenu.js', 'app/js/jquery.bez.js'],
				dest: 'build/js/jqueryFiles.min.js'
			}
		},
		usebanner: {
			codeMirrorBanner: {
				options: {
					position: 'top',
					banner: codeMirrorFilesLicenses,
					linebreak: true
				},
				files: {
					src: ['build/js/codeMirrorFiles.min.js']
				}
			},
			htmlBanners: {
				options: {
					position: 'top',
					banner: '<!--Original can be found at https://www.github.com/SanderRonde/CustomRightClickMenu\nThis code may only be used under the MIT style license found in the LICENSE.txt file-->\n',
					linebreak: true
				},
				files: {
					src: ['build/html/*', 'build/elements/elements.html']
				}
			},
			jsBanners: {
				options: {
					position: 'top',
					banner: '/*\n * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu \n * This code may only be used under the MIT style license found in the LICENSE.txt file \n**/',
					linebreak: true
				},
				files: {
					src: ['build/js/background.js', 'build/js/crmapi.js', 'build/js/crmAPIDefs.js', 'build/js/crmAPIDocs.js', 'build/elements/elements.js']
				}
			},
			cssBanners: {
				options: {
					position: 'top',
					banner: '/*\n * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu \n * This code may only be used under the MIT style license found in the LICENSE.txt file \n**/',
					linebreak: true
				},
				files: {
					src: ['build/css/*', '!build/css/jquery.contextMenu.css']
				}
			},
			jqueryContextMenuBanner: {
				options: {
					position: 'top',
					banner: '\n', //jqueryContextMenuLicense,
					linebreak: true
				},
				files: {
					src: ['build/css/jquery.contextMenu.css']
				}
			}
		},
		copy: {
			build: {
				files: [
					{ expand: true, cwd: 'app/', src: ['fonts/*'], dest: 'build/' }, //Fonts
					{ expand: true, cwd: 'app/', src: ['html/crmAPIDocs.html', 'html/install.html', 'html/options.html'], dest: 'build/' }, //HTML files
					{ expand: true, cwd: 'app/', src: ['js/defaultLibraries/*'], dest: 'build/' }, //Default libraries
					{
						expand: true,
						cwd: 'app/',
						src: [
							'images/chromearrow.png',
							'images/shadowImg.png',
							'images/shadowImgRight.png',
							'images/stylesheet.gif',
							'images/whitearrow.png'
						],
						dest: 'build/' //Images
					},
					{
						expand: true,
						cwd: 'app/',
						src: [
							'elements/crm-app/*',
							'elements/installing/*',
							'bower_components/polymer/*',
							'bower_components/webcomponentsjs/webcomponents.min.js',
							'elements/error-reporting-tool/*'
						],
						dest: 'build/'
					}, //Elements
					{ expand: true, cwd: 'app/', src: ['js/jsonfn.js', 'js/md5.js', 'js/jquery-2.0.3.min.js'], dest: 'build/' }, //JS libs
					{ expand: true, cwd: 'app/', src: ['icon-large.png', 'icon-small.png', 'icon-supersmall.png', 'LICENSE.txt', 'manifest.json'], dest: 'build/' } //Misc files
				]
			}
		},
		htmlmin: {
			build: {
				options: {
					removeComments: false,
					collapseWhitespace: true,
					minifyCSS: true
				},
				files: [
					{ expand: true, src: ['build/html/*'], filter: 'isFile' }
				]
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false
			},
			targets: {
				files: [
					{ expand: true, cwd: 'app/css/', src: ['*', '!jquery.contextMenu.css'], dest: 'build/css/', ext: '.css' },
					{ expand: true, cwd: 'app/css/', src: ['jquery.contextMenu.css'], dest: 'build/css/', ext: '.contextMenu.css' }
				]
			}
		},
		zip: {
			'using-cwd': {
				cwd: 'build/',
				src: ['build/**', '!build/Custom Right-Click Menu.zip'],
				dest: 'build/Custom Right-Click Menu.zip'
			}
		},
		clean: {
			build: ['build/']
		},
		'string-replace': {
			manifestReplace: {
				options: {
					replacements: [
						{
							pattern: /\/\* build:json:(\w+) \*\/(.*)\/\* \/build \*\//g,
							replacement: function(match, type, content) {
								if (type === 'remove') {
									return '';
								} else if (type === 'uncomment') {
									return content.replace(/\/\//g, '');
								}
								return '';
							}
						}
					]
				},
				files: {
					'build/manifest.json': 'app/manifest.json'
				}
			}
		},
		copyImportedElements: {
			elements: {
				options: {
					ignore: [
						'bower_components/polymer/polymer.html',
						'bower_components/polymer/polymer.js',
						'bower_components/polymer/polymer-mini.html',
						'bower_components/polymer/polymer-mini.js',
						'bower_components/polymer/polymer-micro.html',
						'bower_components/polymer/polymer-micro.js'
					],
					rootFolder: 'app/'
				},
				files: [
					{ expand: true, cwd: 'app/elements/', src: 'elements.html', dest: 'build/' }
				]
			},
			installing: {
				options: {
					ignore: [
						'bower_components/polymer/polymer.html',
						'bower_components/polymer/polymer.js',
						'bower_components/polymer/polymer-mini.html',
						'bower_components/polymer/polymer-mini.js',
						'bower_components/polymer/polymer-micro.html',
						'bower_components/polymer/polymer-micro.js'
					],
					rootFolder: 'app/'
				},
				files: [
					{ expand: true, cwd: 'app/elements/installing/', src: 'install-imports.html', dest: 'build/' }
				]
			}
		}
	});

	grunt.loadTasks('tools');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-minified');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-zip');

	grunt.registerTask('updateCRMDefs', ['extractCrmDefs', 'processhtml:updateCRMDefs']);
	grunt.registerTask('build', ['clean:build', 'extractCrmDefs', 'copy:build', 'copyImportedElements:elements', 'copyImportedElements:installing', 'string-replace', 'processhtml', 'concat:jqueryConcat', 'uglify', 'htmlmin', 'cssmin', 'usebanner', 'zip']);
	grunt.registerTask('woob', ['extractCrmDefs']);
}