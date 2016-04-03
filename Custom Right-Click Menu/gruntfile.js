var sources = ['bower_components_uncrisp/webcomponentsjs/webcomponents.min.js','bower_components_uncrisp/polymer/polymer-micro.html', 'bower_components_uncrisp/polymer/polymer-mini.html', 'bower_components_uncrisp/polymer/polymer.html', 'bower_components_uncrisp/paper-toolbar/paper-toolbar.html', 'bower_components_uncrisp/iron-icons/iron-icons.html', 'bower_components_uncrisp/paper-drawer-panel/paper-drawer-panel.html', 'bower_components_uncrisp/paper-input/paper-input.html', 'bower_components_uncrisp/paper-toast/paper-toast.html', 'bower_components_uncrisp/paper-ripple/paper-ripple.html', 'bower_components_uncrisp/paper-menu/paper-menu.html', 'bower_components_uncrisp/paper-item/paper-item.html', 'bower_components_uncrisp/paper-input/paper-textarea.html', 'bower_components_uncrisp/paper-icon-button/paper-icon-button.html', 'bower_components_uncrisp/paper-radio-button/paper-radio-button.html', 'bower_components_uncrisp/paper-radio-group/paper-radio-group.html', 'bower_components_uncrisp/paper-dialog/paper-dialog.html ', 'bower_components_uncrisp/paper-spinner/paper-spinner.html', 'bower_components_uncrisp/paper-toggle-button/paper-toggle-button.html', 'bower_components_uncrisp/neon-animation/animations/scale-down-animation.html ', 'bower_components_uncrisp/neon-animation/animations/fade-out-animation.html', 'bower_components_uncrisp/neon-animation/animations/scale-up-animation.html', 'bower_components_uncrisp/paper-styles/paper-styles.html', 'bower_components_uncrisp/iron-icon/iron-icon.html', 'bower_components_uncrisp/iron-iconset-svg/iron-iconset-svg.html', 'bower_components_uncrisp/iron-media-query/iron-media-query.html', 'bower_components_uncrisp/iron-selector/iron-selector.html', 'bower_components_uncrisp/paper-drawer-panel/paper-drawer-panel.css', 'bower_components_uncrisp/iron-input/iron-input.html', 'bower_components_uncrisp/iron-form-element-behavior/iron-form-element-behavior.html', 'bower_components_uncrisp/paper-input/paper-input-behavior.html', 'bower_components_uncrisp/paper-input/paper-input-container.html', 'bower_components_uncrisp/paper-input/paper-input-error.html', 'bower_components_uncrisp/paper-input/paper-input-char-counter.html', 'bower_components_uncrisp/paper-styles/typography.html', 'bower_components_uncrisp/iron-a11y-announcer/iron-a11y-announcer.html', 'bower_components_uncrisp/iron-a11y-keys-behavior/iron-a11y-keys-behavior.html', 'bower_components_uncrisp/iron-menu-behavior/iron-menu-behavior.html', 'bower_components_uncrisp/paper-menu/paper-menu-shared.css', 'bower_components_uncrisp/iron-behaviors/iron-control-state.html', 'bower_components_uncrisp/iron-behaviors/iron-button-state.html', 'bower_components_uncrisp/paper-item/paper-item-shared-styles.html', 'bower_components_uncrisp/iron-autogrow-textarea/iron-autogrow-textarea.html', 'bower_components_uncrisp/iron-flex-layout/iron-flex-layout.html', 'bower_components_uncrisp/paper-styles/default-theme.html', 'bower_components_uncrisp/paper-behaviors/paper-button-behavior.html', 'bower_components_uncrisp/paper-behaviors/paper-inky-focus-behavior.html', 'bower_components_uncrisp/iron-checked-element-behavior/iron-checked-element-behavior.html', 'bower_components_uncrisp/iron-selector/iron-selectable.html', 'bower_components_uncrisp/neon-animation/neon-animation-runner-behavior.html', 'bower_components_uncrisp/paper-dialog-behavior/paper-dialog-behavior.html', 'bower_components_uncrisp/paper-dialog-behavior/paper-dialog-common.css', 'bower_components_uncrisp/paper-styles/color.html', 'bower_components_uncrisp/paper-spinner/paper-spinner.css', 'bower_components_uncrisp/neon-animation/neon-animation-behavior.html', 'bower_components_uncrisp/neon-animation/web-animations.html','bower_components_uncrisp/iron-flex-layout/classes/iron-flex-layout.html','bower_components_uncrisp/paper-styles/shadow.html','bower_components_uncrisp/iron-meta/iron-meta.html','bower_components_uncrisp/iron-validatable-behavior/iron-validatable-behavior.html','bower_components_uncrisp/paper-input/paper-input-addon-behavior.html','bower_components_uncrisp/font-roboto/roboto.html','bower_components_uncrisp/iron-selector/iron-multi-selectable.html','bower_components_uncrisp/iron-selector/iron-selection.html','bower_components_uncrisp/neon-animation/neon-animatable-behavior.html','bower_components_uncrisp/iron-overlay-behavior/iron-overlay-behavior.html','bower_components_uncrisp/web-animations-js/web-animations-next-lite.min.js','bower_components_uncrisp/iron-flex-layout/classes/iron-shadow-flex-layout.html','bower_components_uncrisp/neon-animation/animations/opaque-animation.html','bower_components_uncrisp/iron-fit-behavior/iron-fit-behavior.html','bower_components_uncrisp/iron-resizable-behavior/iron-resizable-behavior.html','bower_components_uncrisp/iron-overlay-behavior/iron-overlay-backdrop.html','bower_components_uncrisp/iron-overlay-behavior/iron-overlay-manager.html'];
var toCopy = [];
var i;
var obj;
var fileObjects = [];
for (i = 0; i < sources.length; i++) {
	obj = {
		src: 'app/' + sources[i],
		dest: 'app/' + sources[i].replace('bower_components_uncrisp', 'bower_components_test')
	};
	fileObjects.push(obj);
}

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		crisper: {
			updateBower: {
				options: {
					cleanup: false
				},
				files: fileObjects
			}
		},
		extractCrmDefs: {
			updateCRMDefs: {
				files: [{
					src: ['app/js/crmapi.js', 'app/js/crmAPIDefs.test.js', 'app/html/crmAPIDocs.test.html'],
					dest: 'build/',
					expand: true
				}]
			}
		},
		processhtml: {
			inlineCRMAPIDocs: {
				options: {
					strip: true
				},
				files: {
					'app/html/crmAPIDocs.output.html': ['app/html/crmAPIDocsUI.html']
				}
			}
		}
	});

	grunt.loadTasks('tools');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-minified');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-crisper');
	grunt.loadNpmTasks('grunt-processhtml');

	grunt.registerTask('updateBower', ['crisper']);
	grunt.registerTask('updateCRMDefs', ['extractCrmDefs', 'processhtml']);
	grunt.registerTask('build', ['extractCrmDefs', 'processhtml']);
}