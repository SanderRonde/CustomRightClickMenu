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
		],
		'2.0.9': [
			'Fixed bug with buttons no longer working'
		],
		'2.0.10': [
			'Fixed a bug in the crmAPI.GM.GM_notification function'
		],
		'2.0.11': [
			'Fixed the \'Â\' character appearing in the editors',
			'Added an indicator for when the exporting field is slow',
			'Added/removed permissions are updated instantly',
			'Fixed userscript installation page',
			'Fixed unsafewindow permission',
			'No longer enables userscript installation if TamperMonkey is already installed'
		],
		'2.0.12': [
			'Added background.runScript, background.runSelf and background.addKeyboardListener functions to crmAPI',
			'Rewrote crmAPI file and fixed some of its bugs',
			'Cleaned up and structured logs on background file console'
		],
		'2.0.13': [
			'Fixed GM_xmlhttpRequest error (thanks to [bumaociyuan](https://github.com/bumaociyuan) for the report)'
		],
		'2.0.14': [
			'Added a remove button for libraries (thanks to robinchew for the suggestion)',
			'Fixed some bugs related to background-pages'
		],
		'2.0.15': [
			'It\'s now possible to change the root menu name (thanks to anonymous user)'
		],
		'2.0.16': [
			'Fixed possible bug that can break the CRM on the options page from appearing since the last update'
		]
	};
}());