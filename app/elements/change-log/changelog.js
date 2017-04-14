(function () {
	'use strict';
	window.changelogLog = {
		'2.0.0': [
			'Revamped the UI',
			'Rewrote the entire extension',
			'Added the CRM-API for more features',
			'Added a stylesheet element',
			'Added the ability to only show certain nodes on specified websites and/or content types',
			'Added the ability to reposition nodes',
			'Made it possible to delete or export selected nodes',
			'Added compatability with Grease/Tamper-Monkey UserScripts',
			'Added compatability with UserStylesheets',
			'Added the ability to connect a script/stylesheet to a local editor',
			'Now uses the better CodeMirror editor'
		],
		'2.0.4': [
			'Scripts that use the Chrome API are now transferred over to using the crmAPI.chrome API',
			'More clearly reflects a script created by you and what that means (all permissions)',
			'Keeps track of info of local nodes as well now',
			'Allows the editing of the version number'
		],
		'2.0.5': [
			'Fixed a bug that caused scripts to not run when the catch errors option was on'
		],
		'2.0.6': [
			'Added a docs button on script-edit page',
			'Shows a warning when using the deprecated direct chrome API (use crmAPI.chrome instead)',
			'Fixed a bug that occurred on saving',
		],
		'2.0.7': [
			'Fixed json parser bug that sometimes occurred on loading page',
			'Code cleanup and dead code removal',
			'Node instances are now all shown',
			'Fixed some bugs related to scripts not running in their own context'
		],
		'2.0.8': [
			'Fixed some nodes missing IDs after creation',
			'Fixed error that occurred on backgroundpage when running any script'
		]
	};
}());