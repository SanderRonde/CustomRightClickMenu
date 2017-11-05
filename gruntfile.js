var codeMirrorLicense = '// CodeMirror, copyright (c) by Marijn Haverbeke and others\n// Distributed under an MIT license: http://codemirror.net/LICENSE';
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
				files: [
					{
						src: ['app/js/crmapi.ts'],
						dest: 'app/js/crmAPIDefs.js',
						expand: false
					}
				]
			},
			updateHTMLDocs: {
				options: {
					type: 'html'
				},
				files: [
					{
						src: ['app/js/crmapi.ts'],
						dest: 'app/html/crmAPIDocs.html',
						expand: false
					}
				]
			},
			updateCRMDefsWebsite: {
				options: {
					type: 'tern',
					local: false
				},
				files: [
					{
						src: ['app/js/crmapi.ts'],
						dest: 'buildBeforePolymer/crmAPIDefs.js',
						expand: false
					}
				]
			},
			updateHTMLDocsWebsite: {
				options: {
					type: 'html',
					local: false
				},
				files: [
					{
						src: ['app/js/crmapi.ts'],
						dest: 'app/html/crmAPIDocs.html',
						expand: false
					}
				]
			},
			updateJSONDocsWebsite: {
				options: {
					type: 'json',
					local: false
				},
				files: [
					{
						src: ['app/js/crmapi.ts'],
						dest: 'buildBeforePolymer/crmAPIDefs.json',
						expand: false
					}
				]
			}
		},
		processhtml: {
			updateCRMDefs: {
				options: {
					strip: true,
					data: {
						classes: 'content extension',
						base: './'
					}
				},
				files: {
					'app/html/crmAPIDocs.html': ['app/html/crmAPIDocsUI.html']
				}
			},
			build: {
				options: {
					strip: true,
					data: {
						classes: 'content extension',
						base: 'html/'
					}
				},
				files: {
					'buildBeforePolymer/html/background.html': ['app/html/background.html'],
					'buildBeforePolymer/html/crmAPIDocs.html': ['app/html/crmAPIDocsUI.html'],
					'buildBeforePolymer/elements/crm-app/crm-app.html': [
						'buildBeforePolymer/elements/crm-app/crm-app.html'],
					'buildBeforePolymer/html/options.html': ['buildBeforePolymer/html/options.html'],
					'buildBeforePolymer/elements/installing/install-confirm/install-confirm.html': [
						'app/elements/installing/install-confirm/install-confirm.html'
					]
				}
			},
			documentationWebsite: {
				options: {
					strip: true,
					data: {
						classes: 'content website',
						base: 'html/'
					}
				},
				files: {
					'buildBeforePolymer/website/index.html': ['app/html/crmAPIDocsUI.html']
				}
			},
			inlineElementImports: {
				options: {
					strip: true
				},
				files: [{
					expand: true,
					cwd: 'app/elements',
					src: ['**/*.html'],
					dest: 'buildBeforePolymer/elements'
				}]
			}
		},
		uglify: {
			options: {
				screwIE8: true,
				ascii_only: true,
				ASCIIOnly: true
			},
			crmMinifiy: {
				files: [
					{
						expand: true,
						cwd: 'app/js',
						src: [
							'background.js',
							'crmapi.js', 
							'crmAPIDefs.js',
							'crmAPIDocs.js', 
							'contentscript.js',
							'sandbox.js', 
							'installStylesheet.js',
							'calcPolyfill.js'
						],
						dest: 'buildBeforePolymer/js/'
					}
				]
			},
			elementsMinify: {
				options: {
					banner: '/*\n * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu \n * This code may only be used under the MIT style license found in the LICENSE.txt file \n**/\n'
				},
				files: [ { expand: true, src: ['buildBeforePolymer/elements/**/*.js'] } ]
			},
			bower_components: {
				files: [{
					expand: true,
					src: ['buildBeforePolymer/bower_components/**/*.js']
				}]
			}
		},
		usebanner: {
			htmlBanners: {
				options: {
					position: 'top',
					banner: '<!--Original can be found at https://www.github.com/SanderRonde/CustomRightClickMenu\nThis code may only be used under the MIT style license found in the LICENSE.txt file-->\n',
					linebreak: true
				},
				files: {
					src: ['build/html/**.html', 'build/elements/elements.html']
				}
			},
			jsBanners: {
				options: {
					position: 'top',
					banner: '/*\n * Original can be found at https://github.com/SanderRonde/CustomRightClickMenu \n * This code may only be used under the MIT style license found in the LICENSE.txt file \n**/',
					linebreak: true
				},
				files: {
					src: ['build/html/**.js', 'build/js/background.js', 'build/js/crmapi.js', 'build/js/crmAPIDefs.js', 'build/js/crmAPIDocs.js']
				}
			}
		},
		copy: {
			build: {
				files: [
					{ expand: true, cwd: 'app/', src: ['fonts/*'], dest: 'buildBeforePolymer/' }, //Fonts
					{ expand: true, cwd: 'app/', src: ['css/*'], dest: 'buildBeforePolymer/' }, //CSS
					{ expand: true, cwd: 'app/', src: ['js/**/*'], dest: 'buildBeforePolymer/' }, //JS
					{ expand: true, cwd: 'app/', src: ['html/crmAPIDocs.html', 'html/install.html', 'html/logging.html', 'html/options.html', 'html/base.html'], dest: 'buildBeforePolymer/' }, //HTML files
					{ expand: true, cwd: 'app/', src: ['js/defaultLibraries/*'], dest: 'buildBeforePolymer/' }, //Default libraries
					{ expand: true, cwd: 'app/', src: ['bower_components/**/*'], dest: 'buildBeforePolymer/' }, //Webanimations
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
						dest: 'buildBeforePolymer/' //Images
					},
					{ expand: true, cwd: 'app/', src: ['js/libraries/jsonfn.js', 'js/libraries/md5.js', 'js/libraries/jquery/jquery-2.0.3.js'], dest: 'buildBeforePolymer/' }, //JS libs
					{ expand: true, cwd: 'app/', src: ['icon-large.png', 'icon-small.png', 'icon-supersmall.png', 'LICENSE.txt', 'manifest.json', 'elements/change-log/changelog.js'], dest: 'buildBeforePolymer/' } //Misc files
				]
			},
			elements: {
				expand: true,
				cwd: 'app/',
				src: [
					'elements/crm-app/crm-app.js',
					'elements/crm-app/crm-app.css',
					'!elements/crm-app/crm-app.ts',
					'elements/error-reporting-tool/*',
					'!elements/error-reporting-tool/error-reporting-tool.ts',
					'elements/installing/*',
					'bower_components/polymer/*',
					'bower_components/webcomponentsjs/webcomponents.min.js'
				],
				dest: 'buildBeforePolymer/'
			}, //Elements
			documentationWebsite: {
				files: [
					{
						expand: true,
						cwd: 'app/',
						src: [
							'bower_components/webcomponentsjs/webcomponents.min.js',
							'bower_components/polymer/*.*',
							'fonts/*.*',
							'css/crmAPIDocs.css',
							'js/crmAPIDocs.js',
							'icon-large.png',
							'icon-small.png',
							'icon-supersmall.png',
							'html/webmanifest.json'
						],
						dest: 'buildBeforePolymer/website/'
					}
				]
			},
			moveDocumentationWebsite: {
				files: [{
					expand: true,
					cwd: 'buildBeforePolymer/website',
					src: ['**/*.*', '!buildBeforePolymer/website/'],
					dest: './documentation/'
				}]
			},
			demoWebsite: {
				files: [{
					expand: false,
					src: [
						'app/html/demo.html'
					],
					dest: 'demo/index.html'
				}]
			},
			gitignore: {
				files: [{
					expand: false,
					cwd: './',
					src: [
						'tools/gh-pages-gitignore.gitignore'
					],
					dest: './.gitignore'
				}]
			},
			jsFiles: {
				files: [
					{
						expand: true,
						cwd: 'app/js',
						src: [
							'background.js',
							'crmapi.js', 
							'crmAPIDefs.js',
							'crmAPIDocs.js', 
							'contentscript.js',
							'sandbox.js', 
							'installStylesheet.js',
							'calcPolyfill.js'
						],
						dest: 'buildBeforePolymer/js/'
					}
				]
			},
			installing: {
				files: [{
					expand: true,
					cwd: 'app/elements/installing',
					src: [
						'install-confirm/install-confirm.html',
						'install-confirm/install-confirm.css',
						'install-confirm/install-confirm.js',
						'install-error/install-error.html',
						'install-error/install-error.css',
						'install-error/install-error.js',
						'install-page/install-page.html',
						'install-page/install-page.css',
						'install-page/install-page.js',
					],
					dest: 'buildBeforePolymer/elements/installing'
				}]
			},
			html: {
				files: [
					{ expand: true, src: ['buildBeforePolymer/html/*'], filter: 'isFile' }
				]
			},
			es5Adapter: {
				files: [{ 
					expand: true, 
					src: ['buildBeforePolymer/bower_components/webcomponentsjs/custom-elements-es5-adapter.js'], 
					dest: 'build/bower_components/webcomponentsjs/custom-elements-es5-adapter.js'
				}]
			},
			moveUpDirectory: {
				files: [{
					expand: true,
					cwd: 'build/buildBeforePolymer',
					src: ['**/*'],
					dest: 'build/'
				}]
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
					{ expand: true, src: ['buildBeforePolymer/html/*'], filter: 'isFile' }
				]
			}
		},
		zip: {
			'using-cwd': {
				cwd: 'build/',
				src: ['build/**', '!build/Custom Right-Click Menu.zip', '!build/crmAPIDefs.json'],
				dest: 'build/Custom Right-Click Menu.zip'
			}
		},
		clean: {
			build: ['build/'],
			buildBeforePolymer: ['buildBeforePolymer/'],
			unzipped: ['buildBeforePolymer/**/*', '!buildBeforePolymer/*.zip'],
			tsFiles: ['build/elements/**/*.ts'],
			removeBuildBeforePolymer: ['build/buildBeforePolymer/']
		},
		'string-replace': {
			manifestReplace: {
				options: {
					replacements: [
						{
							pattern: /CRM-dev/g,
							replacement: function () {
								return 'CRM';
							}
						}
					]
				},
				files: {
					'buildBeforePolymer/manifest.json': 'app/manifest.json'
				}
			},
			removeCharacter: {
				options: {
					replacements: [{
						pattern: /﻿/g, //You may think there is nothing there, but there is, it's the ﻿&#65279 character
						replacement: function() {
								return '';
							}
						}
					]
				},
				files: [{
					expand: true,
					cwd: 'buildBeforePolymer/elements',
					src: ['**/*.html'],
					dest: 'buildBeforePolymer/elements'
				}]
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
					{ expand: true, cwd: 'app/elements/', src: 'elements.html', dest: 'buildBeforePolymer/' }
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
					{ expand: true, cwd: 'app/elements/installing/', src: 'install-imports.html', dest: 'buildBeforePolymer/' }
				]
			},
			documentationWebsite: {
				options: {
					ignore: [
						'bower_components/polymer/polymer.html',
						'bower_components/polymer/polymer.js',
						'bower_components/polymer/polymer-mini.html',
						'bower_components/polymer/polymer-mini.js',
						'bower_components/polymer/polymer-micro.html',
						'bower_components/polymer/polymer-micro.js'
					],
					rootFolder: 'app/html/'
				},
				files: [
					{ expand: true, cwd: 'app/html/', src: 'crmAPIDocsElements.html', dest: 'buildBeforePolymer/website/' }
				]
			}
		},
		removePrefix: {
			options: {
				prefix: '../'
			},
			files: [
				{ expand: true, cwd: 'buildBeforePolymer/website/', src: ['index.html', 'crmAPIDocsElements.html'] }
			]
		},
		vulcanize: {
			documentationWebsite: {
				options: {
					abspath: 'buildBeforePolymer/website/',
					inlineScripts: true,
					inlineCss: true,
					stripComments: true,
					targetUrl: 'crmAPIDocsElements.html'
				},
				files: {
					'buildBeforePolymer/website/crmAPIDocsElements.html': 'crmAPIDocsElements.html'
				}
			}
		},
		mochaTest: {
			test: {
				options: {
					quiet: false
				},
				src: ['test/test.js', 'test/UITest.js']
			}
		},
		htmlTypings: {
			app: {
				options: {

				},
				files: [{
					expand: false,
					src: ['app/elements/**/*.html', '!app/elements/elements.html'],
					dest: 'app/elements/fileIdMaps.d.ts'
				}]
			}
		},
		ts: {
			app: {
				tsconfig: {
					tsconfig: './tsconfig.json',
					passThrough: true
				}
			},
			test: {
				tsconfig: {
					tsconfig: './test/tsconfig.json',
					passThrough: true
				}
			}
		},
		crisper: {
			optionsPage: {
				options: {
					cleanup: false,
					scriptInhead: false
				},
				files: [{
					src: './build/html/options.html',
					dest: './build/html/options.html'
				}]
			},
			background: {
				options: {
					cleanup: false,
					scriptInhead: false
				},
				files: [{
					src: './build/html/background.html',
					dest: './build/html/background.html'
				}]
			}
		},
		watch: {
			tsApp: {
				files: ['app/**/*.ts'],
				tasks: ['ts:app']
			},
			tsTest: {
				files: ['test/**/*.ts'],
				tasks: ['ts:test']
			},
			htmlTypings: {
				files: ['app/**/*.html'],
				tasks: ['updateTsIdMaps']
			}
		},
		polymerBuild: {
			dev: {
				options: {
					project: {
						entrypoint: [
							"html/options.html"
						],
						root: "buildBeforePolymer/",
						extraDependencies: [
							"html/background.html",
							"fonts/**/*",
							"images/**/*",
							"js/**/*.*",
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
				}
			},
			prod: {
				options: {
					project: {
						entrypoint: [
							"html/options.html"
						],
						root: "buildBeforePolymer/",
						extraDependencies: [
							"html/background.html",
							"fonts/**/*",
							"images/**/*",
							"js/**/*.*",
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
				}
			}
		},
		jsbeautifier: {
			beautifyBuilt: {
				src: ["build/**/*.css", "build/**/*.html", "build/**/*.js"],
				options: {

				}
			}
		}
	});

	grunt.loadTasks('tools');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-crisper');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-jsbeautifier');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-vulcanize');
	grunt.loadNpmTasks('grunt-zip');
	grunt.loadNpmTasks('html-typings');

	/* Alias only tasks, not meant for running */
	grunt.registerTask('_extractDefs', ['extractCrmDefs:updateCRMDefs', 'extractCrmDefs:updateHTMLDocs']);
	grunt.registerTask('_extractWebsite', ['extractCrmDefs:updateCRMDefsWebsite',
		'extractCrmDefs:updateHTMLDocsWebsite', 'extractCrmDefs:updateJSONDocsWebsite']);
	grunt.registerTask('_defsNoClean', ['extractCrmDefs:updateHTMLDocs', 'processhtml:updateCRMDefs']);



	/* Convenience tasks */

	//Cleans the build dir
	grunt.registerTask('cleanBuild', ['clean:build']);



	/* Defs related tasks */

	//Extracts the definitions from crmapi.js and creates documentation and a tern defs file
	grunt.registerTask('defs', ['compile', '_extractDefs', 'processhtml:updateCRMDefs']);

	//Extracts the external editor definitions and places them in build/
	grunt.registerTask('externalEditorDefs', ['compile', 'extractCrmDefs:updateCRMDefsWebsite',
		'extractCrmDefs:updateJSONDocsWebsite']);



	/* Website related tasks */

	//Extracts the files needed for the documentationWebsite and places them in build/website
	grunt.registerTask('documentationWebsite', ['compile', 'extractCrmDefs:updateHTMLDocsWebsite',
		'processhtml:documentationWebsite', 'copyImportedElements:documentationWebsite',
		'processhtml:inlineElementImports', 'string-replace:removeCharacter',
		'copy:documentationWebsite', '_defsNoClean', 'removePrefix', 'vulcanize']);
	
	//Moves the documentationWebsite from build/website to /documentation
	grunt.registerTask('moveDocumentationWebsite', ['compile', 'copy:moveDocumentationWebsite']);

	//Moves the gitignore for the gh-pages branch to the root
	grunt.registerTask('changeGitIgnore', ['copy:gitignore']);

	//Moves the demo website to /demo
	grunt.registerTask('demoWebsite', ['compile', 'copy:demoWebsite'])



	/* Compilation related tasks */

	//Extracts the HTML element ID to element type maps from HTML files
	grunt.registerTask('updateTsIdMaps', ['htmlTypings:app']);

	//Compiles all the typescript
	grunt.registerTask('compile', ['updateTsIdMaps', 'ts:app', 'ts:test']);

	//Watches all files for compilation
	grunt.registerTask('watchCompile', ['updateTsIdMaps', 'compile', 'watch']);



	/* Building the app */

	//Runs all of the build steps before polymerBuild is invoked
	grunt.registerTask('_buildPrePolymer', ['cleanBuild', '_extractDefs',
		'copy:build', 'copy:installing', 'string-replace', 'processhtml:build', 'processhtml:updateCRMDefs', 
		'processhtml:inlineElementImports', 'string-replace:removeCharacter',
		'copy:elements', 'copy:jsFiles', 'copy:html']);

	//Runs all of the build steps after polymerBuild is invoked
	grunt.registerTask('_buildPostPolymer', ['copy:moveUpDirectory', 'clean:removeBuildBeforePolymer', 'crispify', 
		'copy:es5Adapter', 'usebanner', 'clean:buildBeforePolymer']);

	//Builds the extension but tries to keep the code readable and unminified
	// (and preserves debugger statements etc), skips the compile step
	// for if you're running a typescript compiler on watch mode
	grunt.registerTask('buildDebugNoCompile', ['_buildPrePolymer', 
		'polymerBuild:dev', '_buildPostPolymer', 'jsbeautifier:beautifyBuilt',
		'zip']);

	//Builds the extension but tries to keep the code readable and unminified
	// (and preserves debugger statements etc)
	grunt.registerTask('buildDebug', ['compile', 'buildDebugNoCompile']);

	//Builds the extension and places the zip and all other files in build/
	grunt.registerTask('build', ['compile', '_buildPrePolymer',
		'polymerBuild:prod', '_buildPostPolymer', 'zip']);

	//Builds the extension and places only the zip in build/
	grunt.registerTask('buildZip', ['build', 'clean:unzipped']);

	//Tests whether the extension can be built properly without errors
	grunt.registerTask('testBuild', ['cleanBuild', 'build', 'cleanBuild', '_extractDefs',
		'cleanBuild', 'documentationWebsite', 'cleanBuild']);

	//Runs mocha and then tries to build the extension to see if any errors occur while building
	grunt.registerTask('test', ['testBuild', 'build', 'exec:test', 'compile', 'mochaTest']);

	//Crisps all HTML files for CSP compliance
	grunt.registerTask('crispify', ['crisper:optionsPage', 'crisper:background']);
};
