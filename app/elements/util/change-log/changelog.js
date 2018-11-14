//@ts-check
((cl) => {
	typeof module !== 'undefined' ? 
		module.exports = cl : 
		//@ts-ignore
		window.changelogLog = cl;
})(function (config) {
	'use strict';
	const changelog = {
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
			'Fixed the "Â" character appearing in the editors',
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
		],
		'2.0.17': [
			'Nodes are selectable again',
			'Link nodes can be removed properly',
			'%s in link nodes gets replaced with the currently selected text'
		],
		'2.0.18': [
			'Fixed dragging',
			'Types can be changed again',
			'Widened nodes'
		],
		'2.0.19': [
			'Fixed cancelling selection',
			'Fixed type switching animation'
		],
		'2.1.0': [
			'Uses polymer 2 instead of polymer 1 (~25% faster loading)',
			'Works on multiple browsers now (chrome, firefox, edge and opera)',
			'Uses the monaco editor instead of codemirror, featuring better code completion and more features overall',
			'Supports writing scripts in [typescript](https://www.typescriptlang.org/) and compiling them in-extension',
			'Supports typescript libraries and includes code completion for them as well',
			'Added a "libraries" tab in the script dialog for quick toggling of libraries',
			'Libraries can be edited and/or removed',
			'You can now change the name of the root node',
			'Uses [TypeDoc](http://typedoc.org/) for documentation instead',
			'Added the ' + 
				'[crmAPI.storageSync](https://sanderronde.github.io/CustomRightClickMenu/documentation/classes/crm.crmapi.instance.html#storagesync)' + 
				' API for syncing your script\'s storage across browser instances',
			'Added the ' + 
				'[crmAPI.browser](https://sanderronde.github.io/CustomRightClickMenu/documentation/classes/crm.crmapi.instance.html#browser)' +
				' API which combines the [webExtensions](https://developer.mozilla.org/nl/Add-ons/WebExtensions)' + 
				' and [crmAPI.chrome](https://sanderronde.github.io/CustomRightClickMenu/documentation/classes/crm.crmapi.instance.html#chrome)' + 
				' functionalities',
			'All callback-based crmAPI functions now also return a promise as well',
			'Added the ' +
				'[crmAPI.contextMenuItem](https://sanderronde.github.io/CustomRightClickMenu/documentation/classes/crm.crmapi.instance.html#contextmenuitem)' + 
				' API for changing the contextmenu item\'s look,' +
				' such as adding/removing a checkmark, changing the title, disabling or hiding it',
			'Added the lastError, instanceId, chromeAPISupported and browserAPISupported properties' + 
				' to the crmAPI object',
			'Added better code completion for the CRM API',
			'The script and stylesheet options tab has better code completion',
			'It\'s now possible to create contextmenu items as a script',
			'Removed the external editor\'s functionality as chrome apps are being [deprecated](https://blog.chromium.org/2016/08/from-chrome-apps-to-web.html)',
			'Added some more options to the "get page property" ribbon tool',
			'Added support for a more programmatic way of editing the CRM through window.consoleInfo()',
			'Reversed changelog order so the newest changes are on top',
			'Plenty of changes/improvements to the UI',
			'A lot of bug fixes and improvements to code legibility and documentation'
		],
		'2.1.1': [
			'Changed the logo. Huge thanks to [Ulises](https://github.com/tjulises) for designing the logo',
			'Added link to search engine dialog on main options page',
			'Replaces %s with selected text in links, enabling easy search engine creation',
			'Added checkmark after clicking some buttons, giving a bit more visual feedback',
			'Hides code options button if there are no options',
			'Content types can be toggled instead of only being able to select a single one',
			'Nodes that are not shown on the current content type are greyed out instead of hidden'
		],
		'2.1.2': [
			'Fixed a bug firefox bug causing the options page to not load'
		],
		'2.1.3': [
			'Fixed the "change type" button',
			'Backgroundscripts restart on change',
			'Scripts/stylesheets that run early also run when refreshing a page',
			'Small performance improvements, bug fixes and file size reductions'
		],
		'2.1.4': [
			'Add support for installing from openusercss and *.user.css urls',
			'Add support for stylesheet metablock highlighting/completion',
			'Support [CSS preprocesors](https://github.com/openstyles/stylus/wiki/UserCSS#preprocessor)'
		],
		'2.1.5': [
			'Attempt fix dragging of nodes'
		],
		'2.1.6': [
			'Fix dragging of nodes'
		],
		'2.1.7': [
			'Remove some bad practices in code (eval use etc).'
		],
		'2.1.8': [
			'Just a version bump (no changes), on request of the firefox addon store'
		],
		'2.2.0': [
			'Only a version bump from version 2.1.8 (no changes). This is the first ' + 
				'version since 2.0.19 that is published on the chrome webstore ' +
				'and as such will be a breaking change relative to 2.0.19, which ' +
				' is why the version is bumped.'
		],
		'2.2.1': [
			'Fixed issue where dragging nodes downwards placed them one spot above the target',
			'Fixed the "add here" button not working when adding a node as a child to a menu'
		],
		'2.2.2': [
			'Fixed a bug that was introduced in Firefox 63 that prevented clicking of buttons',
			'Added more "Add" buttons to make it more straightforward to add a specific type node'
		]
	};

	return changelog;
}());