module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		zip: {
			'using-cwd': {
				cwd: 'app/',
				src: ['app/**'],
				dest: 'build/Custom Right-Click Menu.zip'
			}
		},
		clean: {
			build: ['build/']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-zip');

	grunt.registerTask('build', ['clean', 'zip']);
}