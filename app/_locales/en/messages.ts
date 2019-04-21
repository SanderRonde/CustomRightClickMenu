import { LocaleSpec } from '../i18n';

// Structure only allows a branch to split into subbranches or
// to contain leafs with messages. Not both at the same time

export const Messages: LocaleSpec = {
	generic: {
		appTitle: {
			message: 'Custom Right-Click Menu',
			description: 'The name of the extension'
		},
		add: {
			message: 'add',
			description: 'Button that adds a new element'
		},
		dismiss: {
			message: 'DISMISS',
			description: 'Button that dismisses a toast (notification)'
		},
		undo: {
			message: 'UNDO',
			description: 'Button that undoes last action'
		},
		next: {
			message: 'NEXT',
			description: 'Button that switches to the next item in some list'
		},
		back: {
			message: 'BACK',
			description: 'Button that switches to the previous item in some list'
		},
		confirm: {
			message: 'Confirm',
			description: 'Confirms a choice'
		},
		previous: {
			message: 'previous',
			description: 'Button that switches to the previous item in some list'
		},
		cancel: {
			message: 'cancel',
			description: 'A button that cancels the current operation or dialog'
		},
		save: {
			message: 'save',
			description: 'A button that saves the current operation'
		},
		discard: {
			message: 'discard',
			description: 'Discards changes the user made'
		},
		no: {
			message: 'no',
			description: 'Word for no'
		},
		yes: {
			message: 'yes',
			description: 'Word for yes'
		},
		close: {
			message: 'close',
			description: 'Closes a dialog of some sort'
		},
		apply: {
			message: 'apply',
			description: 'Applies changes'
		},
		all_capital: {
			message: 'ALL',
			description: 'Would be clicked to select all items in a list for a filter (capitalized)'
		},
		tab: {
			message: 'Tab',
			description: 'Name for a browser tab. First letter capitalized'
		},
		tabIndex: {
			message: 'TabIndex',
			description: 'The index of a script within a tab. First letter capitalized'
		},
		url: {
			message: 'url',
			description: 'Word for URL'
		}
	},
	crmTypes: {
		webpages: {
			message: 'Webpages',
			description: 'A short description for webpages'
		},
		weblinks: {
			message: 'weblinks',
			description: 'A short description for weblinks (HTML anchor elements)'
		},
		selection: {
			message: 'selection',
			description: 'A short description for a block of selected text'
		},
		images: {
			message: 'images',
			description: 'A description for images/pictures'
		},
		videos: {
			message: 'videos',
			description: 'A description for videos'
		},
		audio: {
			message: 'audio',
			description: 'A description for audio elements (music, mp3 etc)'
		}
	},
	crm: {
		link: {
			message: 'Link',
			description: 'Name of the link node type. Used like: "Add {Link}"'
		},
		script: {
			message: 'Script',
			description: 'Name of the script node type. Used like: "Add {Script}"'
		},
		stylesheet: {
			message: 'Stylesheet',
			description: 'Name of the stylesheet node type. Used like: "Add {Stylesheet}"'
		},
		menu: {
			message: 'Menu',
			description: 'Name of the menu node type. Used like: "Add {Menu}"'
		},
		divider: {
			message: 'Divider',
			description: 'Name of the divider node type. Used like: "Add {Divider}"'
		},
		exampleLinkName: {
			message: 'My Link',
			description: 'A default name for a link node'
		},
		exampleStylesheetName: {
			message: 'My Stylesheet',
			description: 'A default name for a stylesheet node'
		},
		exampleScriptName: {
			message: 'My Script',
			description: 'A default name for a script node'
		},
		exampleDividerName: {
			message: 'My Divider',
			description: 'A default name for a divider node'
		},
		exampleMenuName: {
			message: 'My Menu',
			description: 'A default name for a menu node'
		},
		node: {
			message: 'node',
			description: 'Word for a single node/item'
		},
		id: {
			message: 'id',
			description: 'Word for the ID of a node/item. ' +
				'This is used to identify it in the extension ' +
				'itself (the user won\'t see it except in errors)'
		},
		idCapital: {
			message: 'ID',
			description: 'Word for the ID of a node/item. This is ' +
				'used to identify it in the extension itself ' +
				'(the user won\'t see it except in errors).' +
				'This is the same word as above except capitalized'
		}
	},
	permissions: {
		alarms: {
			message: 'Makes it possible to create, view and remove alarms.',
			description: 'Description for the alarms permission'
		},
		activeTab: {
			message: 'Gives temporary access to the tab on which ' +
				'browserActions or contextmenu items are clicked',
			description: 'Description for the activeTab permission'
		},
		background: {
			message: 'Runs the extension in the background even while ' +
				'chrome is closed.',
			description: 'Description for the background permission'
		},
		bookmarks: {
			message: 'Makes it possible to create, edit, remove and view ' +
				'all your bookmarks.',
			description: 'Description for the bookmarks permission'
		},
		browsingData: {
			message: 'Makes it possible to remove any saved data on your ' +
				'browser at specified time allowing the user to delete ' +
				'any history, saved passwords, cookies, cache and basically ' +
				'anything that is not saved in incognito mode but is in ' +
				'regular mode. This is editable so it is possible to delete ' +
				'ONLY your history and not the rest for example. ' +
				'(https://developer.chrome.com/extensions/bookmarks)',
			description: 'Description for the browsingData permission'
		},
		clipboardRead: {
			message: 'Allows reading of the users\' clipboard',
			description: 'Description for the clipboardRead permission'
		},
		clipboardWrite: {
			message: 'Allows writing data to the users\' clipboard',
			description: 'Description for the clipboardWrite permission'
		},
		cookies: {
			message: 'Allows for the setting, getting and listening for ' +
				'changes of cookies on any website. ' +
				'(https://developer.chrome.com/extensions/cookies)',
			description: 'Description for the cookies permission'
		},
		contentSettings: {
			message: 'Allows changing or reading your browser settings ' +
				'to allow or deny things like javascript, plugins, popups, ' +
				'notifications or other things you can choose to accept or ' +
				'deny on a per-site basis. ' +
				'(https://developer.chrome.com/extensions/contentSettings)',
			description: 'Description for the contentSettings permission'
		},
		contextMenus: {
			message: 'Allows for the changing of the chrome contextmenu',
			description: 'Description for the contextMenus permission'
		},
		declarativeContent: {
			message: 'Allows for the running of scripts on pages based on ' +
				'their url and CSS contents. ' +
				'(https://developer.chrome.com/extensions/declarativeContent)',
			description: 'Description for the declarativeContent permission'
		},
		desktopCapture: {
			message: 'Makes it possible to capture your screen, current tab ' +
				'or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
			description: 'Description for the desktopCapture permission'
		},
		downloads: {
			message: 'Allows for the creating, pausing, searching and ' +
				'removing of downloads and listening for any downloads happening. ' +
				'(https://developer.chrome.com/extensions/downloads)',
			description: 'Description for the downloads permission'
		},
		history: {
			message: 'Makes it possible to read your history and remove/add ' +
				'specific urls. This can also be used to search your history ' +
				'and to see how many times you visited given website. ' +
				'(https://developer.chrome.com/extensions/history)',
			description: 'Description for the history permission'
		},
		identity: {
			message: 'Allows for the API to ask you to provide your (google) ' +
				'identity to the script using oauth2, allowing you to pull ' +
				'data from lots of google APIs: calendar, contacts, custom ' +
				'search, drive, gmail, google maps, google+, url shortener ' +
				'(https://developer.chrome.com/extensions/identity)',
			description: 'Description for the identity permission'
		},
		idle: {
			message: 'Allows a script to detect whether your pc is in a locked, ' +
				'idle or active state. (https://developer.chrome.com/extensions/idle)',
			description: 'Description for the idle permission'
		},
		management: {
			message: 'Allows for a script to uninstall or get information ' +
				'about an extension you installed, this does not however give ' +
				'permission to install other extensions. ' +
				'(https://developer.chrome.com/extensions/management)',
			description: 'Description for the management permission'
		},
		notifications: {
			message: 'Allows for the creating of notifications. ' +
				'(https://developer.chrome.com/extensions/notifications)',
			description: 'Description for the notifications permission'
		},
		pageCapture: {
			message: 'Allows for the saving of any page in MHTML. ' +
				'(https://developer.chrome.com/extensions/pageCapture)',
			description: 'Description for the pageCapture permission'
		},
		power: {
			message: 'Allows for a script to keep either your screen or ' +
				'your system altogether from sleeping. ' +
				'(https://developer.chrome.com/extensions/power)',
			description: 'Description for the power permission'
		},
		privacy: {
			message: 'Allows for a script to query what privacy features are ' +
				'on/off, for example autoFill, password saving, the translation ' +
				'feature. (https://developer.chrome.com/extensions/privacy)',
			description: 'Description for the privacy permission'
		},
		printerProvider: {
			message: 'Allows for a script to capture your print jobs\' content ' +
				'and the printer used. ' +
				'(https://developer.chrome.com/extensions/printerProvider)',
			description: 'Description for the printerProvider permission'
		},
		sessions: {
			message: 'Makes it possible for a script to get all recently ' +
				'closed pages and devices connected to sync, also allows it ' +
				'to re-open those closed pages. ' +
				'(https://developer.chrome.com/extensions/sessions)',
			description: 'Description for the sessions permission'
		},
		systemcpu: {
			message: 'Allows a script to get info about the CPU. ' +
				'(https://developer.chrome.com/extensions/system_cpu)',
			description: 'Description for the system.cpu permission'
		},
		systemmemory: {
			message: 'Allows a script to get info about the amount of ' +
				'RAM memory on your computer. ' +
				'(https://developer.chrome.com/extensions/system_memory)',
			description: 'Description for the system.memory permission'
		},
		systemstorage: {
			message: 'Allows a script to get info about the amount of ' +
				'storage on your computer and be notified when external ' +
				'storage is attached or detached. ' +
				'(https://developer.chrome.com/extensions/system_storage)',
			description: 'Description for the system.storage permission'
		},
		topSites: {
			message: 'Allows a script to your top sites, which are the sites ' +
				'on your new tab screen. ' +
				'(https://developer.chrome.com/extensions/topSites)',
			description: 'Description for the topSites permission'
		},
		tabCapture: {
			message: 'Allows the capturing of the CURRENT tab and only ' +
				'the tab. (https://developer.chrome.com/extensions/tabCapture)',
			description: 'Description for the tabCapture permission'
		},
		tabs: {
			message: 'Allows for the opening, closing and getting of tabs',
			description: 'Description for the tabs permission'
		},
		tts: {
			message: 'Allows a script to use chrome\'s text so speech engine. ' +
				'(https://developer.chrome.com/extensions/tts)',
			description: 'Description for the tts permission'
		},
		webNavigation: {
			message: 'Allows a script info about newly created pages and ' +
				'allows it to get info about what website visit at that time. ' +
				'(https://developer.chrome.com/extensions/webNavigation)',
			description: 'Description for the webNavigation permission'
		},
		webRequest: {
			message: 'Allows a script info about newly created pages and ' +
				'allows it to get info about what website you are visiting, ' +
				'what resources are downloaded on the side, and can ' +
				'basically track the entire process of opening a new ' +
				'website. (https://developer.chrome.com/extensions/webRequest)',
			description: 'Description for the webRequest permission'
		},
		webRequestBlocking: {
			message: 'Allows a script info about newly created pages and ' +
				'allows it to get info about what website you are visiting, ' +
				'what resources are downloaded on the side, and can ' +
				'basically track the entire process of opening a new website. ' +
				'This also allows the script to block certain requests for ' +
				'example for blocking ads or bad sites. ' +
				'(https://developer.chrome.com/extensions/webRequest)',
			description: 'Description for the webRequestBlocking permission'
		},
		crmGet: {
			message: 'Allows the reading of your Custom Right-Click Menu, ' +
				'including names, contents of all nodes, what they do and ' +
				'some metadata for the nodes',
			description: 'Description for the crmGet permission'
		},
		crmWrite: {
			message: 'Allows the writing of data and nodes to your Custom ' +
				'Right-Click Menu. This includes <b>creating</b>, <b>copying</b> ' +
				'and <b>deleting</b> nodes. Be very careful with this ' +
				'permission as it can be used to just copy nodes until your ' +
				'CRM is full and delete any nodes you had. It also allows ' +
				'changing current values in the CRM such as names, actual ' +
				'scripts in script-nodes etc.',
			description: 'Description for the crmWrite permission'
		},
		crmRun: {
			message: 'Allows the running of arbitrary scripts from the background-page',
			description: 'Description for the crmRun permission'
		},
		crmContextmenu: {
			message: 'Allows the editing of this item\'s name in the ' +
				'contextmenu at runtime',
			description: 'Description for the crmContextmenu permission'
		},
		chrome: {
			message: 'Allows the use of chrome API\'s',
			description: 'Description for the chrome permission'
		},
		browser: {
			message: 'Allows the use of browser API\'s',
			description: 'Description for the browser permission'
		},
		GMAddStyle: {
			message: 'Allows the adding of certain styles to the document ' +
				'through this API',
			description: 'Description for the GM_addStyle permission'
		},
		GMDeleteValue: {
			message: 'Allows the deletion of storage items',
			description: 'Description for the GM_deleteValue permission'
		},
		GMListValues: {
			message: 'Allows the listing of all storage data',
			description: 'Description for the GM_listValues permission'
		},
		GMAddValueChangeListener: {
			message: 'Allows for the listening of changes to the storage area',
			description: 'Description for the GM_addValueChangeListener permission'
		},
		GMRemoveValueChangeListener: {
			message: 'Allows for the removing of listeners',
			description: 'Description for the GM_removeValueChangeListener permission'
		},
		GMSetValue: {
			message: 'Allows for the setting of storage data values',
			description: 'Description for the GM_setValue permission'
		},
		GMGetValue: {
			message: 'Allows the reading of values from the storage',
			description: 'Description for the GM_getValue permission'
		},
		GMLog: {
			message: 'Allows for the logging of values to the console ' +
				'(same as normal console.log)',
			description: 'Description for the GM_log permission'
		},
		GMGetResourceText: {
			message: 'Allows the reading of the content of resources ' +
				'defined in the header',
			description: 'Description for the GM_getResourceText permission'
		},
		GMGetResourceURL: {
			message: 'Allows the reading of the URL of the pre-declared resource',
			description: 'Description for the GM_getResourceURL permission'
		},
		GMRegisterMenuCommand: {
			message: 'Allows the adding of a button to the extension ' +
				'menu - not implemented',
			description: 'Description for the GM_registerMenuCommand permission'
		},
		GMUnregisterMenuCommand: {
			message: 'Allows the removing of an added button - not implemented',
			description: 'Description for the GM_unregisterMenuCommand permission'
		},
		GMOpenInTab: {
			message: 'Allows the opening of a tab with given URL',
			description: 'Description for the GM_openInTab permission'
		},
		GMXmlhttpRequest: {
			message: 'Allows you to make an XHR to any site you want',
			description: 'Description for the GM_xmlhttpRequest permission'
		},
		GMDownload: {
			message: 'Allows the downloading of data to the hard disk',
			description: 'Description for the GM_download permission'
		},
		GMGetTab: {
			message: 'Allows the reading of an object that\'s persistent ' +
				'while the tab is open - not implemented',
			description: 'Description for the GM_getTab permission'
		},
		GMSaveTab: {
			message: 'Allows the saving of the tab object to reopen after ' +
				'a page unload - not implemented',
			description: 'Description for the GM_saveTab permission'
		},
		GMGetTabs: {
			message: 'Allows the reading of all tab object - not implemented',
			description: 'Description for the GM_getTabs permission'
		},
		GMNotification: {
			message: 'Allows sending desktop notifications',
			description: 'Description for the GM_notification permission'
		},
		GMSetClipboard: {
			message: 'Allows copying data to the clipboard - not implemented',
			description: 'Description for the GM_setClipboard permission'
		},
		GMInfo: {
			message: 'Allows the reading of some script info',
			description: 'Description for the GM_info permission'
		},
		unsafeWindow: {
			message: 'Allows the running on an unsafe window object - ' +
				'available by default',
			description: 'Description for the unsafeWindow permission'
		}
	},
	langs: {
		languages: {
			en: {
				message: 'English',
				description: 'The english language'
			},
		},
		selector: {
			current: {
				message: 'current',
				description: 'Word to signal this is the currently selected ' +
					'item, example: "english, current"'
			},
			clickToChangeLanguage: {
				message: 'Click here to change your language',
				description: 'Used for a button that will allow you to change ' +
					'your language on click'
			},
			requestLanguage: {
				message: 'Request a language or consider translating into yours',
				description: 'Requesting a new language and/or translating ' +
					'into your native one'
			}
		}
	},
	crmApp: {
		editcrm: {
			editingCrm: {
				message: 'Editing the CRM',
				description: 'Title for edit-crm section'
			}
		},
		ribbons: {
			ts: {
				message: 'TS',
				description: 'The typescript icon'
			},
			tslint: {
				message: 'Run TSLint',
				description: 'Runs the TSLint checker'
			},
			jslint: {
				message: 'Run JSLint',
				description: 'Runs the JSLint checker'
			},
			info: {
				message: 'Info',
				description: 'An info button'
			}
		},
		editor: {
			settings: {
				header: {
					message: 'Editor Settings',
					description: 'Title header for the settings for the CRM editor'
				},
				theme: {
					message: 'Theme',
					description: 'The theme setting\'s name'
				},
				fontsizePercentage: {
					message: 'Font size %',
					description: 'The font size option with a % behind it'
				},
				jslintGlobals: {
					message: 'Comma separated list of JSLint globals',
					description: 'Description of the jslint globals option ' +
						'which requires a comma separated list of global values'
				},
				keybindings: {
					message: 'Key Bindings',
					description: 'The key bindings option'
				}
			}
		},
		header: {
			oldChrome: {
				message: 'You are using a very old version of Chrome ' +
					'($VERSION$ years old). Some features may perform worse ' +
					'or not at all. Please consider updating your chrome',
				description: 'Description telling the user that their ' +
					'chrome version is $version$ years old and that it might ' +
					'not work that well and they should consider updating.',
				placeholders: {
					version: {
						content: '$1',
						example: '6'
					}
				}
			}
		},
		crmtype: {
			toggle: {
				message: 'Toggle showing items that are visible when ' +
					'right-clicking on $CONTENTTYPE$',
				description: 'Clicking this button will toggle visibility ' +
					'of given content-type',
				placeholders: {
					contentType: {
						content: '$1',
						example: 'regular webpages, web links, selected'
					}
				}
			},
			regularWebpages: {
				message: 'regular webpages',
				description: 'A longer description for webpages'
			},
			selectedText: {
				message: 'selected text',
				description: 'A short description selected text (a selection)'
			}
		},
		options: {
			header: {
				message: 'Options',
				description: 'The options section\'s header'
			},
			catchErrors: {
				message: 'Catch errors in scripts and log them. If off, ' +
					'allows for easier debugging using your browser\'s ' +
					'"pause on exceptions", if on, allows for custom handling.',
				description: 'See message'
			},
			showoptions: {
				message: 'Show options link in right-click menu',
				description: 'The option to show the "options" link to the ' +
					'options page in the right-click menu'
			},
			recoverUnsavedData: {
				message: 'Prompt you with an option to recover your unsaved ' +
					'script after you close a script/stylesheet without hitting ' +
					'the "save" or "exit" button.',
				description: 'See message'
			},
			CRMOnPageDisabled: {
				message: 'Can\'t disable demo contextmenu in demo mode',
				description: 'Reason the CRMOnPage options is disabled'
			},
			CRMOnPageOption: {
				message: 'Use your custom right-click menu on this page as a ' +
					'preview instead of your browser\'s regular one.',
				description: 'See message'
			},
			chromeLow: {
				message: 'Your chrome version is too low for this to be ' +
					'possible (min is chrome 34, you have $VERSION$)',
				description: 'A message informing the user that their browser ' +
					'is old and as such some features are unsupported',
				placeholders: {
					version: {
						content: '$1',
					}
				}
			},
			notChrome: {
				message: 'not chrome',
				description: 'Used in the form "min chrome version is 34, ' +
					'you have {not chrome}'
			},
			useStorageSyncDisabledUnavailable: {
				message: 'Syncing is not available in your browser',
				description: 'Reason the useStorageSync option is disabled. ' +
					'Reason is because the browser.storage.sync API is not ' +
					'available in the user\'s browser'
			},
			useStorageSyncDisabledTooBig: {
				message: 'Amount of data is too big to sync',
				description: 'Reason the useStorageSync option is disabled. ' +
					'Reason is because the sync storage is full'
			},
			useStorageSyncOption: {
				message: 'Sync your storage across all browser instances signed ' +
					'in to this account using browser storage sync. Turning ' +
					'this on will limit your total CRM size (including scripts, ' +
					'excluding libraries) to a total of 102,400 bytes. Currently using',
				description: 'See message'
			},
			editCRMInRM: {
				message: 'Edit the custom right-click Menu by clicking on the ' +
					'respective elements when right-clicking on this page',
				description: 'See message'
			},
			bytes: {
				message: 'bytes',
				description: 'The bytes unit. Example: 10000 {bytes}'
			},
			managePermissions: {
				message: 'Manage Permissions',
				description: 'Button for managing permissions'
			}
		},
		defaultLinks: {
			header: {
				message: 'Commonly Used Links',
				description: 'Header for the default/commonly used links section'
			},
			description: {
				message: 'Here are some commonly used links to get you started. ' +
					'Click the "ADD" button to add the link to your custom ' +
					'right-click menu. It will be added at the end of the ' +
					'list but you can always change the order later if you want.',
				description: 'Description for the commonly used links section'
			}
		},
		searchEngines: {
			header: {
				message: 'Search Engines',
				description: 'Header for the search engines section'
			},
			description: {
				message: 'These are some commonly used search-engines.' +
					'Click "ADD" to add the search-engine to your CRM. You can ' +
					'then drag the link anywhere you want it to be. You can ' +
					'also change the name you want it to have below or do it ' +
					'when it\'s already in your CRM. The $REPLACE_VAL$ ' +
					'is replaced with whatever text you\'ve selected (if any).',
				description: 'The description for the search engines section',
				placeholders: {
					replace_val: {
						content: '<code class="codeSyntax">%s</code>',
						example: 'Code above'
					}
				}
			}
		},
		uriScheme: {
			header: {
				message: 'Launching programs instead of links',
				description: 'Header for the URI scheme section'
			},
			description: {
				message: 'You may want to launch programs on your computer as well, ' +
					'instead of only using links.' +
					'This is possible, but requires a bit of extra effort because ' +
					'of browsers\' security restrictions.' +
					'Directly linking to files on your computer to open them is ' +
					'not possible (at least not for executable programs),' +
					'this is why you\'ll need to set up a custom (local only) URI ' +
					'that launches the program you want to launch.' +
					'If you want to read up about it some more check out ' +
					'$CUSTOM_URI_INFO$ page.' +
					'To make this possible you\'ll need to add a key/value ' +
					'pair in your registry. After doing this, ' +
					'instead of http:// use yourscheme:// as a link.<br>' +
					'If you are on a mac you can use' +
					'$CUSTOM_URI_MAC$' +
					'method. If you are on a windows computer you can do this ' +
					'yourself if you' +
					'want to (follow ' +
					'$CUSTOM_URI_WINDOWS$ instructions),' +
					'or you can generate a file you can download that will ' +
					'write the key/value pair for you by hitting the button below.' +
					'The second method is a lot easier and faster but it\'s ' +
					'understandable if you don\'t trust this extension in which case you can do it manually.',
				placeholders: {
					custom_uri_info: {
						content: '<a href="https://msdn.microsoft.com/en-us/library/' +
							'aa767914(VS.85).aspx" rel="noopener" target="_blank">' +
							'this</a>'
					},
					custom_uri_mac: {
						content: '<a rel="noopener" href="https://support.' +
							'shotgunsoftware.com/hc/en-us/community/posts/' +
							'209485898-Launching-External-Applications-using-' +
							'Custom-Protocols-under-OSX" target="_blank">this</a>'
					},
					custom_uri_windows: {
						content: '<a href="https://support.microsoft.com/nl-nl' +
							'/kb/310516" rel="noopener" target="_blank">these</a>'
					}
				}
			},
			filePathLabel: {
				message: 'File path including name',
				description: 'A descriptive label for an input that allows ' +
					'the inputting of file paths'
			},
			invalidScheme: {
				message: 'This is not a valid scheme',
				description: 'Error message saying that given URI scheme is invalid'
			},
			schemeNameLabel: {
				message: 'URI scheme name',
				description: 'A descriptive label for an input that allows the ' +
					'inputting of the URI scheme\'s name'
			},
			example: {
				message: 'myscheme',
				description: 'A name for an example scheme. This will be changed ' +
					'by the user later'
			},
			generate: {
				message: 'GENERATE',
				description: 'A button that can be used to generate the ' +
					'custom URI scheme'
			}
		},
		importing: {
			header: {
				message: 'Importing your settings',
				description: 'Header for the import section'
			},
			description: {
				message: 'Here you can import your settings or CRM nodes from ' +
					'somewhere else. Simply copy the code into the box below ' +
					'and hit "import". Checking "overwrite" will overwrite ' +
					'your current settings and/or CRM with the settings you imported.',
				description: 'Description for the import section'
			},
			error: {
				message: 'Something went wrong processing the data, please ' +
					'check the data',
				description: 'Error that is shown when data importing has ' +
					'failed because processing failed.'
			},
			overwrite: {
				message: 'Overwrite',
				description: 'Label for the "overwrite" option. Checking ' +
					'this overwrites previous settings'
			},
			overwriteTitle: {
				message: 'Check this if you want to overwrite your CRM. ' +
					'If not checked, imported CRM is appended to the current one',
				description: 'Description for the overwrite function'
			},
			legacy: {
				message: 'CRM legacy',
				description: 'Label for the "CRM legacy" option. Checking this ' +
					'assumes the data comes from the (very) old version of ' +
					'the extension'
			},
			legacyTitle: {
				message: 'Check this if you\'re importing from the old version ' +
					'of the extension (pre-2016)',
				description: 'Description for the legacy checkbox'
			},
			import: {
				message: 'Import',
				description: 'Label for the main importing function. Imports ' +
					'data from given string into the extension'
			}
		},
		exporting: {
			header: {
				message: 'Exporting your settings',
				description: 'Header for the export section'
			},
			description: {
				message: 'Here you can export your settings and/or CRM. To ' +
					'export select ' +
					'CRM nodes hit the "select" button below the editor above and ' +
					'hit export. Paste the generated data into a different ' +
					'instance\'s "import" field to import the data.',
				description: 'Description for the export section'
			},
			waiting: {
				message: 'Waiting for text field... This may take some time',
				description: 'Message that is displayed while waiting for the exporting'
			},
			exportCRM: {
				message: 'Export your Custom Right-Click Menu',
				description: 'Label for checkbox. When checked, exports the ' +
					'CRM itself (not the other settings)'
			},
			exportSettings: {
				message: 'Export your Settings',
				description: 'Label for checkbox. When checked, exports the ' +
					'settings itself (not the CRM)'
			},
			export: {
				message: 'Export',
				description: 'Label for the main exporting function. Exports ' +
					'data from given string into the extension'
			}
		},
		help: {
			header: {
				message: 'Help/Tutorials',
				description: 'Header for the help section'
			},
			description: {
				message: 'If you need help with anything or you would simply ' +
					'like a step by step plan of how to do something, please check' +
					'out the $WIKI_LINK$. ' +
					'If you feel like there\'s a missing tutorial, please' +
					'$CREATE_LINK$.',
				description: 'Description for the help section',
				placeholders: {
					wiki_link: {
						content: '<a rel="noopener" href="https://github.com/' +
							'SanderRonde/CustomRightClickMenu/wiki" ' +
							'target="_blank">wiki</a>'
					},
					create_link: {
						content: '<a rel="noopener" href="https://github.com/' +
							'SanderRonde/CustomRightClickMenu/issues/new?title=' +
							'[wiki]" target="_blank">create an issue</a>'
					}
				}
			}
		},
		contact: {
			header: {
				message: 'Contact',
				description: 'Header for the contact section'
			},
			description: {
				message: 'If you have found any bugs, thought of any suggestions or ' +
					'have any other reason to contact me you can do so at ' +
					'$SEND_EMAIL$. To ' +
					'find out more about me, check out ' +
					'$GITHUB$. You ' +
					'can also check out the github repository over ' +
					'$GITHUB_REPO$ if you ' +
					'want to report an issue, create a pull request, or just ' +
					'want to check out the code.' +
					'I\'m currently looking for beta testers for the extension.' +
					'If you\'d like to help by testing new releases and want ' +
					'to get new features early please' +
					'send me an email using the address above and I\'ll add ' +
					'you to the list.',
				description: 'Description for the contact section',
				placeholders: {
					send_email: {
						content: '<a rel="noopener" href="mailto:awsdfgvhbjn@' +
							'gmail.com" target="_blank">awsdfgvhbjn@gmail.com</a>'
					},
					github: {
						content: '<a href="https://github.com/SanderRonde/"' +
							' rel="noopener" target="_blank">my github page</a>'
					},
					github_repo: {
						content: '<a href="https://github.com/SanderRonde/' +
							'CustomRightClickMenu" rel="noopener" ' +
							'target="_blank">here</a>'
					}
				}
			}
		},
		bugs: {
			header: {
				message: 'Bugs',
				description: 'Header for the bugs section'
			},
			description: {
				message: 'If you would like to report any bugs, you can do ' +
					'so by using the bug reporting tool.' +
					'This is a screen overlay that will be visible when you ' +
					'toggle it. It is overlaid' +
					'on top of every other dialog so you can always use it. ' +
					'To toggle it on/off use' +
					'the button below or hit $CTRL$ 3 times in a row quickly.',
				description: 'Description for the bugs section',
				placeholders: {
					ctrl: {
						content: '<code class="codeSyntax">ctrl</code>'
					}
				}
			},
			toggle: {
				message: 'toggle',
				description: 'Button that toggles the bug reporting tool'
			}
		},
		globalExcludes: {
			header: {
				message: 'Global Excludes',
				description: 'Header for the global excludes section'
			},
			description: {
				message: 'There are some sites on which you don\'t want any ' +
					'script to run on such as paypal and your bank\'s website, ' +
					'below you can enter these sites to make sure that no ' +
					'CRM script is ever ran on that page unless you ' +
					'specifically clicked on it. URLs must be specified ' +
					'as follows ',
				description: 'Description for the global excludes section ' +
					'(followed by a link)'
			},
			patternLabel: {
				message: 'URL match pattern to exclude',
				description: 'Label for a match pattern input'
			},
			patternInvalid: {
				message: 'This is not a valid URL pattern!',
				description: 'Error message that is displayed when the URL ' +
					'pattern is not valid'
			}
		},
		logging: {
			header: {
				message: 'Checking your scripts\' logs',
				description: 'Header for the logging section'
			},
			description: {
				message: 'Clicking on this button will take you to a page ' +
					'where you can monitor your scripts\' logs' +
					'from one central place. Think of it as a dev tools for ' +
					'all your scripts and with' +
					'only your logs. $BR$' +
					'To make your logs show up there, use $CODE$ in your code.',
				description: 'Description for the logging section',
				placeholders: {
					code: {
						content: '<code class="codeSyntax">crmAPI.log</code>'
					},
					br: {
						content: '<br />'
					}
				},
			},
			logging: {
				message: 'Logging',
				description: 'Button that opens the logging page'
			}
		},
		privacyPolicy: {
			header: {
				message: 'Privacy Policy',
				description: 'Header for the privacy policy section'
			},
			description: {
				message: 'This extension does not store any personally ' +
					'identifiable information.' +
					'This extension uses your browser\'s ' +
					'$DOCUMENTATION_LINK$ ' +
					'to sync your data across devices. This data only consists of ' +
					'your custom right-click menu and its settings.' +
					'This means that these settings are stored on your ' +
					'browser manufacturer\'s servers.' +
					'To turn off this feature, disable the "use storage ' +
					'sync" checkbox at the top of this page.',
				description: 'Description for the privacy policy section',
				placeholders: {
					documentation_link: {
						content: '<a href="https://developer.mozilla.org/' +
							'en-US/Add-ons/WebExtensions/API/storage/sync" ' +
							'rel="noopener" target="_blank">browser.storage.sync</a>'
					}
				}
			}
		},
		changelog: {
			changelog: {
				message: 'Changelog',
				description: 'Header for the changelog section'
			}
		},
		toasts: {
			revert: {
				message: 'Revert last action',
				description: 'Toast that would undo the last action done by the user'
			},
			contentType: {
				message: 'You need to select at least one content type to ' +
					'show this node on, otherwise it will never be shown. ' +
					'To hide it change the triggers.',
				description: 'Warning telling the user that they need ' +
					'to have at least one content type selected'
			},
			storageExceeded: {
				message: 'Storage sync has ran out of space, switched to ' +
					'local storage for the moment, remove CRM nodes or code ' +
					'and switch back to sync later',
				description: 'Warning that is show when storage is full'
			},
			noErrors: {
				message: 'No more errors found',
				description: 'Notification that is shown when there are no ' +
					'more errors to step through'
			},
			acceptDownload: {
				message: 'Please accept the permission request to report a ' +
					'bug or suggest a feature',
				description: 'Notification asking the user to accept the ' +
					'permission request in order to continue'
			}
		},
		dialogs: {
			codeSettings: {
				changingOptions: {
					message: 'Changing the options for',
					description: 'Header signaling what node is being edited'
				},
				noOptions: {
					message: 'Looks like there\'s no options. Go to the options ' +
						'tab in the editor to make them.' +
						'Also be sure to check whether no errors show up, ' +
						'if they do this won\'t work.',
					description: 'Description saying there are no options for this node'
				},
				numberInput: {
					message: 'Number input',
					description: 'An input for numbers'
				},
				booleanInput: {
					message: 'True/False value',
					description: 'An input for true/false (boolean) values'
				},
				textInput: {
					message: 'Text input',
					description: 'An input for text'
				},
				colorInput: {
					message: 'Color picker',
					description: 'An input for colors'
				}
			},
			recoverUnsaved: {
				header: {
					message: 'Recovering unsaved code',
					description: 'Title for the recover unsaved code section'
				},
				description: {
					message: 'You closed an editing instance without saving or ' +
						'discarding it, are you sure you wanted to do this?',
					description: 'Question asking the user if they want to ' +
						'discard these changes'
				},
				whatNode: {
					message: 'What node?',
					description: 'Button that shows the user what script has changed'
				},
				oldCode: {
					message: 'Old Code',
					description: 'The header for the old code'
				},
				unsavedCode: {
					message: 'Unsaved code',
					description: 'The header for the unsaved (changed) code'
				},
				keepOld: {
					message: 'Keep Old',
					description: 'Button that keeps the old (unsaved) version'
				}
			},
			addLibrary: {
				header: {
					message: 'Add your own library',
					description: 'Header for the add library dialog'
				},
				noNameError: {
					message: 'please enter a name',
					description: 'Error message shown when no name is entered'
				},
				urlInput: {
					message: 'Input a url',
					description: 'Option to input a URL to a library'
				},
				codeInput: {
					message: 'Input the code',
					description: 'Option to input URL library through code'
				},
				code: {
					message: 'code',
					description: 'Word for code',
				},
				urlError: {
					message: 'url does not host anything',
					description: 'Error message shown when the URL does not ' +
						'host anything (error 404)'
				},
				usesTypescript: {
					message: 'Check if library uses typescript',
					description: 'Option that should be checked when the library ' +
						'the user inputs uses typescript'
				},
				isThisOkay: {
					message: 'Does this look okay to you?',
					description: 'Question asking the user if the code looks fine'
				},
				added: {
					message: 'Added!',
					description: 'Message telling the user that the library ' +
						'was successfully added'
				}
			},
			cssEditorInfo: {
				header: {
					message: 'CSS Editor Info',
					description: 'Header for the CSS editor info section'
				},
				description: {
					message: '- Use $URL_REFERENCE$ to run certain CSS only on ' +
						'specified url for any code following this statement.' +
						'Calling $URL_END$ will stop this from applying to ' +
						'the code below it.' +
						'You can combine multiple $URL$ statements to run on ' +
						'multiple sites, so calling $URL_EXAMPLE_GOOGLE$ runs ' +
						'the code below on both sites.' +
						'If for example you want any page\'s background-color ' +
						'to be black except for one website, you can use $URL$ ' +
						'to give that page a different background color.' +
						'You can use regular expressions as long as you wrap ' +
						'them in brackets.' +
						'$BR$ $BR$' +
						'- Use the dev tools to find the CSS id/class of elements. ' +
						'Press F12 to open the dev tools, click the magnifying ' +
						'glass and click element you want to style.' +
						'If you want only that element to be styled, right-click ' +
						'it in the developer tools and click "copy CSS path" and ' +
						'use that as the selector.' +
						'If you want all elements with some class to be styled, ' +
						'simply use the class on it.',
					description: 'Description of the CSS editor',
					placeholders: {
						url_reference: {
							content: '<pre class="inlineCodePre">@url ' +
								'\'http://example.com\';</pre>'
						},
						url_end: {
							content: '<pre class="inlineCodePre">@urlend;</pre>'
						},
						url: {
							content: '<pre class="inlineCodePre">@url</pre>'
						},
						url_example_google: {
							content: '<pre class="inlineCodePre">@url ' +
								'\'example.com\'; @url \'google.com\';</pre>'
						},
						br: {
							content: '<br />'
						}
					}
				}
			},
			exporting: {
				header: {
					message: 'Exporting selected nodes',
					description: 'Header for the export dialog'
				},
				description: {
					message: 'You can copy the data below and paste it in a ' +
						'different instance\'s "import" section to import those ' +
						'nodes. Enter an author\'s name below to export the ' +
						'nodes under that name. You can also leave it to ' +
						'"anonymous" to stay anonymous.',
					description: 'Description for the export dialog'
				},
				copyToClipboard: {
					message: 'copy to clipboard',
					description: 'Button that copies text to clipboard'
				},
				authorName: {
					message: 'author\'s name',
					description: 'Label for an input containing the author\'s ' +
						'name that the user fill in'
				}
			},
			permissions: {
				description: {
					message: 'Here you can allow or disallow permissions for ' +
						'the current script, marked permissions are asked for ' +
						'in the script and will probably be needed for script ' +
						'execution. You should however be careful not to just ' +
						'turn on everything since that might enable malicious ' +
						'scripts to do bad things. Permissions starting with ' +
						'"GM_" are greasemonkey permissions, these can also be ' +
						'used if you want to also share this script with ' +
						'greasemonkey/tampermonkey users. You don\'t actually ' +
						'need to turn them on to use those APIs in this ' +
						'extension except the GM_download API and the ' +
						'GM_notification API since all the others are fairly ' +
						'harmless. However they will be required as metaTags ' +
						'if you run this script in greasemonkey/tampermonkey.',
					description: 'The description for the permissions dialog'
				},
				usedPermissions: {
					message: 'Used permissions:',
					description: 'A header for a list of permissions that are ' +
						'used by this script'
				}
			},
			requestPermissions: {
				header: {
					message: 'Allow permissions',
					description: 'Header for the allow/request permission dialog'
				},
				description: {
					message: 'A script that you presumably wrote or added has ' +
						'asked to use one or more browser permissions that you ' +
						'have not yet allowed for this extension, please allow ' +
						'these permissions as you see fit.' +
						'Remember that this will only allow YOU to write scripts ' +
						'that access these permissions and not downloaded and ' +
						'installed scripts.' +
						'Other scripts can only access these permissions if you ' +
						'give those scripts specifically that permission on ' +
						'installing them.' +
						'You can basically allow any permission, they will only ' +
						'be used if you write them into one of your own scripts ' +
						'(or a downloaded one requests it) so allowing permissions ' +
						'that are not used yet simply saves you the hassle of doing ' +
						'it later during script installation or execution.',
					description: 'Description for the allow permissions dialog'
				},
				required: {
					message: 'Required',
					description: 'Word for a required permission as requested by ' +
						'the extension author'
				},
				others: {
					message: 'Others',
					description: 'Word for other permissions that are not ' +
						'necessarily required.'
				},
				acceptAll: {
					message: 'Accept all required',
					description: 'Button that accepts (enables) all permissions ' +
						'that are required'
				}
			},
			addedPermissions: {
				header: {
					message: 'The script ' +
						'$NODENAME$' +
						'has been updated to version ' +
						'$NODEVERSION$' +
						'and some new permissions have been requested',
					description: 'Header signaling that a script with given ' +
						'name has been updated and it requires new permissions',
					placeholders: {
						nodeName: {
							content: '$1',
							example: 'MyScript'
						},
						nodeVersion: {
							content: '$2',
							example: '1.2.3'
						}
					}
				}
			}
		},
		code: {
			nodeUpdated: {
				message: 'Node $NAME$ was updated from version $OLDVERSION ' +
					'to version $NEWVERSION',
				description: 'A message telling the user a node has been updated',
				placeholders: {
					name: {
						content: '$1',
						example: 'MyNode'
					},
					oldVersion: {
						content: '$2',
						example: '1.2.3'
					},
					newVersion: {
						content: '$3',
						example: '1.2.4'
					}
				}
			},
			extensionUpdated: {
				message: 'Extension has been updated to version $VERSION$',
				description: 'Message telling the user the extension has been updated',
				placeholders: {
					version: {
						content: '$1',
						example: '1.2.3'
					}
				}
			},
			settingsUpdated: {
				message: 'Settings were updated to those on $DATE$',
				description: 'Message telling the user their settings were ' +
					'updated to the ones saved on given date on a different instance',
				placeholders: {
					date: {
						content: '$1',
						example: '1-1-2019'
					}
				}
			},
			hiMessage: {
				message: 'Hey there, if you\'re interested in how this ' +
					'extension works check out the github repository over ' +
					'at https://github.com/SanderRonde/CustomRightClickMenu',
				description: 'Message meant for developers looking to see ' +
					'how this extension works'
			},
			consoleInfo: {
				message: 'To get information about how to edit settings from ' +
					'the console ' + 
					'call the window.consoleInfo() function',
				description: 'Info about the console API for developers'
			},
			permissionsNotSupported: {
				message: 'Your browser does not support requesting permissions',
				description: 'Message shown when browser.permissions API is ' +
					'unsupported by the browser'
			},
			downloadNotSupported: {
				message: 'Your browser does not support asking for the download ' +
					'permission',
				description: 'Message shown when browser.download API is ' +
					'unsupported by the browser'
			},
			importSuccess: {
				message: 'Successfully imported your data',
				description: 'Message shown when data importing has ' +
					'completed successfully'
			},
			alreadyEditingNode: {
				message: 'Please close the current dialog first',
				description: 'Message shown when a node is already being edited ' +
					'and another one can\'t be edited before closing the other one'
			},
			wouldExecuteScript: {
				message: 'This would execute a script',
				description: 'Message shown when clicking a script node in the ' +
					'demo mode. Does nothing in this mode except for ' +
					'showing this message'
			},
			wouldExecuteStylesheet: {
				message: 'This would execute a stylesheet',
				description: 'Message shown when clicking a stylesheet ' +
					'node in the demo mode. Does nothing in this mode ' +
					'except for showing this message'
			}
		}
	},
	background: {
		crm: {
			invalidRunat: {
				message: 'Script with id $ID$' +
					'runAt value was changed to default, $RUNAT$' +
					'is not a valid value (use document_start, ' +
					'document_end or document_idle)',
				description: 'runAt value is not valid for script with given id.' + 
					'The runAt value describes when a script should run. ' +
					'At the start or end of' + 
					' a page load or when the page is idle',
				placeholders: {
					id: {
						content: '$1',
						example: '1'
					},
					runat: {
						content: '$2',
						example: 'document_start'
					}
				}
			},
			executionFailed: {
				message: 'Couldn\'t execute on tab with id $TABID$' +
					'for node $NODEID$',
				description: 'Message shown when execution failed for a script',
				placeholders: {
					tabid: {
						content: '$1',
						example: '1'
					},
					nodeid: {
						content: '$2',
						example: '1'
					}
				}
			},
			setupError: {
				message: 'An error occurred while setting up the script for ' +
					'node $NODEID$',
				description: 'A message shown when an error has occurred in ' +
					'the setup stage',
				placeholders: {
					nodeid: {
						content: '$1',
						example: '1'
					}
				}
			},
			updateDownload404: {
				message: 'Tried to update $NODETYPE$ $NODEID$ $NODENAME$' +
					' but could not reach download URL',
				description: 'A message shown when a request to a node\'s ' +
					'download URL (the URL from which it should be updated) failed',
				placeholders: {
					nodeType: {
						content: '$1',
						example: 'script|stylesheet'
					},
					nodeId: {
						content: '$2',
						example: '1'
					},
					nodeName: {
						content: '$3',
						example: 'MyNode'
					}
				}
			},
			optionNotFound: {
				message: 'Could not find option $NODENAME$ for stylesheet $NODEID$',
				description: 'A message shown when a key was not found in ' +
					'the supplied settings',
				placeholders: {
					nodeName: {
						content: '$1',
						example: 'MyNode'
					},
					nodeId: {
						content: '$2',
						example: '1'
					}
				}
			},
			cssCompileError: {
				message: 'An error occurred while compiling $TYPE$ CSS for ' + 
				'node $NODEID$',
				description: 'An error shown when compilation failed for ' +
					'given node\'s preprocessor CSS',
				placeholders: {
					type: {
						content: '$1',
						example: 'less|stylus'
					},
					nodeId: {
						content: '$2',
						example: '1'
					}
				}
			},
			contextmenuErrorRetry: {
				message: 'An error occurred with your context menu,' + 
					' attempting again with no url matching.',
				description: 'Error shown when something went wrong creating ' +
					'the context menu. It will be retried with the URL ' +
					'matching feature disabled'
			},
			contextmenuError: {
				message: 'An error occurred with your context menu!',
				description: 'Error shown when something went wrong creating ' +
					'the context menu.'
			},
			userContextmenuError: {
				message: 'Error recreating user contextmenu',
				description: 'Error shown when something went wrong creating a ' +
					'user context\'s contextmenu. The difference between the ' +
					'regular version and this version is that the other version ' +
					'is generated based on the CRM and its nodes while this one ' +
					'is created by the user themselves using the CRM API'
			},
			createdBackgroundPage: {
				message: 'Creating backgroundpage for node $NODEID$',
				description: 'Message shown when a backgroundpage for given ' +
					'node has started',
				placeholders: {
					nodeId: {
						content: '$1',
						example: '1'
					}
				}
			},
			restartingBackgroundPage: {
				message: 'Restarting background page...',
				description: 'Message shown when restarting a backgroundpage'
			},
			terminatedBackgroundPage: {
				message: 'Terminated background page...',
				description: 'Message shown when restarting a backgroundpage'
			}
		},
		globalDeclarations: {
			getID: {
				noMatches: {
					message: 'Unfortunately no matches were found, please try again',
					description: 'Message shown when the getID function finds no results'
				},
				oneMatch: {
					message: 'One match was found, the id is $MATCHID$' +
						' and the script is',
					description: 'Message shown when the getID function finds one ' +
						'result. This message is followed by the node.',
					placeholders: {
						matchId: {
							content: '$1',
							example: '1'
						}
					}
				},
				multipleMatches: {
					message: 'Found multiple matches, here they are:',
					description: 'Message shown when the getID function finds ' +
						'multiple results'
				}
			},
			tabRestore: {
				success: {
					message: 'Restored tab with id $TABID$',
					description: 'Message shown when a tab that was already ' +
						'open when the extension started is retroactively executed on',
					placeholders: {
						tabId: {
							content: '$1',
							example: '1'
						}
					}
				},
				unknownError: {
					message: 'Failed to restore tab with id $TABID$',
					description: 'Message shown when a tab that was already ' +
						'open when the extension started is retroactively ' +
						'executed on but failed with an unknown error',
					placeholders: {
						tabId: {
							content: '$1',
							example: '1'
						}
					}
				},
				ignored: {
					message: 'Ignoring tab with id $TABID$ (chrome or file url)$',
					description: 'Message shown when a tab that was already ' +
						'open when the extension started is retroactively ' +
						'executed on but it was ignored since the extension ' +
						'can\'t run on that page (for example browser settings ' +
						'pages etc)',
					placeholders: {
						tabId: {
							content: '$1',
							example: '1'
						}
					}
				},
				frozen: {
					message: 'Skipping restoration of tab with id $TABID$' +
						'Tab is frozen, most likely due to user debugging',
					description: 'Message shown when a tab that was already ' +
						'open when the extension started is retroactively ' +
						'executed on but it was frozen since the user is debugging it',
					placeholders: {
						tabId: {
							content: '$1',
							example: '1'
						}
					}
				}
			},
			proxy: {
				redirecting: {
					message: 'Redirecting',
					description: 'Message shown when redirecting a URL to another URL'
				}
			}
		},
		init: {
			loggingExplanation: {
				message: 'If you\'re here to check out your background ' +
					'script, get its ID (you can type getID("name") to ' +
					'find the ID), and type filter(id, [optional tabId])' +
					' to show only those messages. You can also visit ' +
					'the logging page for even better logging over at ' +
					'$LOGGINGURL$',
				description: 'Message shown to inform the user of the ' +
					'getID and logging functions',
				placeholders: {
					loggingUrl: {
						content: '$1',
						example: 'chrome-extension://xxxxx/logging.html'
					}
				}
			},
			debugExplanation: {
				message: 'You can also use the debugger for scripts by ' +
					'calling window.debugNextScriptCall(id) ' +
					'and window.debugBackgroundScript(id) for scripts ' +
					'and backgroundscripts respectively. You can get the ' +
					'id by using the getID("name") function.',
				description: 'Message shown to inform the user of the ' +
					'debugging functions'
			},
			registeringPermissionListeners: {
				message: 'Registering permission listeners',
				description: 'Info message shown when registers listeners ' +
					'for the browser.permissions API. Keeping track of when ' +
					'some are changed'
			},
			registeringHandler: {
				message: 'Setting CRMAPI message handler',
				description: 'Info message shown when setting up message ' +
					'handler for the CRM API. Handling API requests from scripts'
			},
			buildingCrm: {
				message: 'Building Custom Right-Click Menu',
				description: 'Info message shown when building the contextmenu itself'
			},
			compilingTs: {
				message: 'Compiling typescript',
				description: 'Info message shown when typescript is being compiled'
			},
			registeringHandlers: {
				message: 'Registering global handlers',
				description: 'Info message shown when registering general ' +
					'global change handlers (tabs created/removed etc)'
			},
			updatingResources: {
				message: 'Updating resources',
				description: 'Info message shown when updating resources, which ' +
					'are scripts hosted on other websites'
			},
			updatingNodes: {
				message: 'Updating scripts and stylesheets',
				description: 'Info message shown when updating scripts and ' +
					'stylesheets\'s code'
			},
			debugInfo: {
				message: 'For all of these arrays goes, close and re-expand ' +
					'them to "refresh" their contents',
				description: 'Info message telling the user how to refresh ' +
					'arrays in the console'
			},
			invalidatedTabs: {
				message: 'Invalidated tabs:',
				description: 'Label for array that contains invalidated tabs. ' +
					'Invalidated tabs are tabs that can\'t be accessed because ' +
					'they\'re options pages etc.'
			},
			insufficientPermissions: {
				message: 'Insufficient permissions:',
				description: 'Label for an array of scripts that failed because ' +
					'they had insufficient permissions'
			},
			registeringConsoleInterface: {
				message: 'Registering console user interface',
				description: 'Info message shown when registering global ' +
					'functions that allow the user to run functions in the console'
			},
			done: {
				message: 'Done!',
				description: 'Info message shown when setup is done'
			},
			resourceUpdate: {
				message: 'Attempting resource update',
				description: 'Info message shown when updating resources'
			},
			initialization: {
				message: 'Initialization',
				description: 'Message group for initialization messages'
			},
			storage: {
				message: 'Loading storage data',
				description: 'Message group for storage messages'
			},
			resources: {
				message: 'Checking resources',
				description: 'Message group for resource checking'
			},
			previousOpenTabs: {
				message: 'Restoring previous open tabs',
				description: 'Message group for the restoration of already-open tabs'
			},
			backgroundpages: {
				message: 'Creating backgroundpages',
				description: 'Message group for the creation of backgroundpages'
			},
			debugging: {
				message: 'Debugging',
				description: 'Message group for any debugging messages'
			}
		},
		storages: {
			syncUploadError: {
				message: 'Error on uploading to storage.sync, uploading to ' +
					'storage.local instead',
				description: 'Error shown when uploading user settings to ' +
					'storage.sync fails. This is the synced data'
			},
			localUploadError: {
				message: 'Error on uploading to browser.storage.local',
				description: 'Error shown when uploading user settings to ' +
					'storage.local fails. This is the non-synced local data'
			},
			upgrading: {
				message: 'Upgrading minor version from $FROM$ to $TO$',
				description: 'Message shown when upgrading version',
				placeholders: {
					from: {
						content: '$1',
						example: '1.2.3'
					},
					to: {
						content: '$2',
						example: '1.2.4'
					}
				}
			},
			settingGlobalData: {
				message: 'Setting global data stores',
				description: 'Info message shown when setting up data storage'
			},
			buildingCrm: {
				message: 'Building CRM representation',
				description: 'Info message shown when building CRM and its ' +
					'in-background tree representation'
			},
			loadingSync: {
				message: 'Loading sync storage data',
				description: 'Info message shown when loading the ' +
					'browser.storage.sync synced data'
			},
			loadingLocal: {
				message: 'Loading local storage data',
				description: 'Info message shown when loading the ' +
					'browser.storage.local non-synced data'
			},
			checkingFirst: {
				message: 'Checking if this is the first run',
				description: 'Info message shown when checking if this ' +
					'is the very first run of the extension'
			},
			parsingData: {
				message: 'Parsing data encoding',
				description: 'Info message shown when parsing the stored data ' +
					'and transforming it into usable structures. The data is ' +
					'stored in a sort of encoded way and this is a basic form ' +
					'of decoding it'
			},
			checkingUpdates: {
				message: 'Checking for data updates',
				description: 'Info message shown when checking whether any ' +
					'remote updates have happened. For example if the user ' +
					'makes a change on a different computer, this change is ' +
					'synced back to this computer. If something like this ' +
					'happens the user is notified'
			},
			initializingFirst: {
				message: 'Initializing for first run',
				description: 'Info message shown when initializing the initial ' +
					'settings if this is the first run of the extension'
			}
		},
		logging: {
			background: {
				message: 'background',
				description: 'Name for a page that runs in the background ' +
					'similar to a browser extension\'s background page'
			},
			backgroundPage: {
				message: 'Background page',
				description: 'Name for a page that runs in the background ' +
					'similar to a browser extension\'s background page'
			}
		}
	},
	install: {
		confirm: {
			installed: {
				message: 'Installed!',
				description: 'Success message shown when installation completes'
			},
			description: {
				message: 'Description',
				description: 'Label for description field'
			},
			author: {
				message: 'Author',
				description: 'Label for author field'
			},
			source: {
				message: 'Source',
				description: 'Label for source field. Source being the URL ' +
					'from which it was installed'
			},
			permissions: {
				message: 'Permissions',
				description: 'Label for permissions field'
			},
			permissionInfo: {
				message: 'Not accepting a permission might lead to scripts ' +
					'silently failing.' +
					'You can re-enable them at any time by going to the ' +
					'options page, editing' +
					'the node and clicking the "manager permissions" button.',
				description: 'Info for what permissions are'
			},
			allow: {
				message: 'Allow',
				description: 'Allows a permission'
			},
			noneRequired: {
				message: 'No permissions required',
				description: 'Message shown when no permissions are ' +
					'required for a script'
			},
			none: {
				message: 'none',
				description: 'Shown when there are no permissions required ' +
					'in the form "permission: {none}"'
			},
			toggleAll: {
				message: 'Toggle All',
				description: 'Allows or disallows all permissions at once'
			},
			allowAccept: {
				message: 'Allow all and install',
				description: 'Allows all permissions and installs the script'
			},
			install: {
				message: 'install',
				description: 'Installs the script'
			},
			notAsking: {
				message: 'Not asking for permission $PERMISSION$ as your ' +
					'browser does not support asking for permissions',
				description: 'Message shown when requesting permissions ' +
					'is not supported',
				placeholders: {
					permission: {
						content: '$1',
						example: 'alarms'
					}
				}
			}
		},
		error: {
			notFound1: {
				message: 'Userscript',
				description: 'Part 1 of the message "userscript not found"' +
					'It\'s split over 2 lines. If a single line is ' +
					'better, fill this one' +
					' and empty the second one'
			},
			notFound2: {
				message: 'Not Found',
				description: 'Part 2 of the message "userscript not found"' +
					'It\'s split over 2 lines. If a single line is better, ' +
					'keep this one empty' +
					' and fill the second one'
			}
		},
		page: {
			fetching: {
				message: 'Fetching Userscript',
				description: 'State shown when downloading/fetching the userscript'
			},
			failedXhr:{ 
				message: 'Failed XHR',
				description: 'Message shown when the XHR network request fails'
			},
			installing: {
				message: 'Installing userscript from $SOURCE$',
				description: 'State shown when installing a userscript from given URL',
				placeholders: {
					source: {
						content: '$1',
						example: 'www.example.com/script.user.js'
					}
				}
			}
		}
	},
	logging: {
		filter: {
			message: 'filter',
			description: 'A filter that only lists items that match give filter text'
		},
		description: {
			message: 'This page serves as a sort of devTools for specific ' +
				'instances of scripts on tabs.' +
				'You can choose to view logs for all instances, specific nodes, ' +
				'specific tabs, or a combination' +
				'of both. You can access a specific instance\'s variables and ' +
				'get/set them just as you would' +
				'in the chrome dev tools, to do this simply select an ID and a tab ID',
			description: 'Description of the logging page'
		},
		lines: {
			message: 'lines',
			description: 'Prefixed by the amount of logging lines there are ' +
				'in the logging console'
		},
		//TODO:
		runningCodeNotPossible: {
			message: 'Running code is not possible in the current context ' +
				'(select both an ID and a tab)',
			description: 'Warning that running code is not possible right ' +
				'now since no context has been selected.'
		},
		storeAsLocal: {
			message: 'Store as local variable',
			description: 'Stores clicked javascript value in a local value so ' +
				'it can be referenced locally'
		},
		logThis: {
			message: 'Logthis',
			description: 'Logs given value'
		},
		copyAsJson: {
			message: 'Copy as JSON',
			description: 'Copies given value to the clipboard as JSON'
		},
		copyPath: {
			message: 'Copy path',
			description: 'Copies the path to a value. For example if the user ' +
				'expands an array and runs this on the first element, the path is [0]'
		},
		clearConsole: {
			message: 'Clear console',
			description: 'Empties the console and all its log messages'
		},
		tabClosed: {
			message: 'Tab has been closed',
			description: 'Warning that a tab has been closed and as such ' +
				'its log won\'t be updated'
		},
		somethingWentWrong: {
			message: 'Something went wrong highlighting the tab',
			description: 'Generic warning shown when an error occurred on ' +
				'highlighting a tab. Highlighting is the flashing you see ' +
				'on tabs in browsers when something happens on them ' +
				'(for example an alert).'
		},
		logs: {
			message: 'Logs',
			description: 'Title for this page. Describes that this is the ' +
				'log page and contains logs'
		}
	},
	util: {
		errorReportingTool: {
			finish: {
				message: 'Finish',
				description: 'Finishes the action of highlighting the error/bug'
			},
			title: {
				message: 'Reporting a bug or suggesting a feature',
				description: 'Title for the error reporting tool'
			},
			description: {
				message: 'You can report a bug that happened or a feature you ' +
					'would like to see in this extension. If you want you can ' +
					'also highlight a section of the page and send it along. ' +
					'When clicking the submit button you will be taken to the ' +
					'github website where you ' +
					'can file an issue. All necessary files (the image and if ' +
					'you want to your settings) ' +
					'will be downloaded, after which you can drop them on the ' +
					'report issue page. For ' +
					'this to be possible you need to accept the downloads ' +
					'permission window that will ' +
					'pop up.',
				description: 'Description for the error reporting tool'
			},
			bugreportInfo: {
				message: 'Your CRM and settings will be included in the ' +
					'report that will be publicly ' +
					'visible, if you do not wish this you can report a ' +
					'bug or suggest a feature ' +
					'by sending an email to $EMAIL$',
				description: 'Bug report info. Keep in mind that "this address" ' +
					'in the placeholder should also be replaced',
				placeholders: {
					email: {
						content: '<a rel="noopener" target="_blank" ' +
							'href="mailto:awsdfgvhbjn@gmail.com">this ' +
							'address.</a></span>'
					}
				}
			},
			pageCapture: {
				message: 'Page Capture',
				description: 'Launches a page capturing program with which ' +
					'the user can select ' +
					'a section of the page that is then converted to an ' +
					'image and uploaded'
			},
			reportingBug: {
				message: 'Reporting a bug',
				description: 'Button to press when reporting a bug/fault in ' +
					'the extension'
			},
			suggestingFeature: {
				message: 'Suggesting a feature',
				description: 'Button to press when suggesting a new feature ' +
					'for the extension'
			},
			submit: {
				message: 'submit',
				description: 'Submits given bug report or feature request'
			},
			messagePlaceholder:{ 
				message: 'WRITE MESSAGE HERE',
				description: 'Placeholder for the user to write a message in'
			},
			titlePlaceholder: {
				message: 'TITLE HERE',
				description: 'Placeholder for the user to write a title in'
			}
		}
	},
	options: {
		nodeEditBehavior: {
			globPattern: {
				message: 'Globbing pattern or regex',
				description: 'Label shown for an input that wants either a ' +
					'glob pattern or regex'
			},
			matchPattern: {
				message: 'URL match pattern',
				description: 'Label shown for an input that wants a URL match pattern'
			}
		},
		crmEditPage: {
			createdBy: {
				message: 'Created by $AUTHOR$',
				description: 'Label displaying the author of a script',
				placeholders: {
					author: {
						content: '<b title="$1" id="nodeInfoAuthorCont">$1</b>',
						example: 'Anonymous'
					}
				}
			},
			installedFrom: {
				message: 'installed from ($SOURCEURL$)',
				description: 'Label displaying where a script was downloaded from. ' +
					'Keep in mind that the "url" word in the placeholder ' +
					'should be replaced as well',
				placeholders: {
					sourceURL: {
						content: '<span id="nodeInfoFrom"><b>' + 
							'<a id="nodeInfoUrl" title="$1" target="_blank" ' +
							'rel="noopener"' +
							'href="$1">url</a></b></span>',
						example: 'www.google.com/script.user.js'
					}
				}
			},
			createdByYou: {
				message: 'Created by $AUTHOR$',
				description: 'Label displaying the author of a script. This is ' +
					'the same as the ' +
					'other one. The only difference is the HTML in the ' +
					'placeholder which doesn\'t ' +
					'have to be replaced',
				placeholders: {
					author: {
						content: '$1',
						example: 'You'
					}
				}
			},
			hasAllPermissions: {
				message: 'This means it has access to all permissions ' +
					'without having to enable them',
				description: 'Describes the additional permissions enabled ' +
					'when a script ' +
					'is created by the current user and as such has all permissions'
			},
			createdOn: {
				message: 'Created on $DATE$',
				description: 'Date when a script was created',
				placeholders: {
					date: {
						content: '$1',
						example: 'xxxx-xx-xx'
					}
				}
			},
			installedOn: {
				message: 'Installed on $DATE$',
				description: 'Date when a script was installed',
				placeholders: {
					date: {
						content: '$1',
						example: 'xxxx-xx-xx'
					}
				}
			}
		},
		defaultLink: {
			name: {
				message: 'Name',
				description: 'The name for a website. For example for ' +
					'www.google.com ' +
					'the name is "google". For www.facebook.com it\'s "facebook". ' +
					'this is the label for that field.'
			}
		},
		editCrm: {
			empty: {
				message: 'It seems like there is no right-click menu for ' +
					'this content type, try something else or add a new node!',
				description: 'Message shown when the CRM is empty for ' +
					'given content type'
			},
			addHere: {
				message: 'Add Here',
				description: 'Click location for adding a new node. When clicked ' +
					'in adding mode adds a new node at the given location.'
			},
			addNodeType: {
				message: 'Add $NODETYPE$',
				description: 'Adds a new node of given node type',
				placeholders: {
					nodeType: {
						content: '$1',
						example: 'Internationalized version of Link, Script, ' +
							'Stylesheet etc'
					}
				}
			},
			select: {
				message: 'Select',
				description: 'Enables selection mode in which you can select nodes ' +
					'and do things like deleting/moving them.'
			},
			exportSelected: {
				message: 'Export Selected',
				description: 'Exports the nodes selected in selection mode. ' +
					'Exporting allows them to be imported in either another instance ' +
					'of this extension or in a different one such as tampermonkey'
			},
			removeSelected: {
				message: 'Remove Selected',
				description: 'Deletes the nodes selected in selection mode.'
			},
			menuRemoveWarning: {
				message: 'Warning: Children of a removed menu will also be ' +
					'removed recursively!',
				description: 'Warning telling the user that if a node of type menu ' +
					'is removed, its children will also be removed.'
			},
			dragInfo: {
				message: 'Click and hold the three dashes ($HANDLE$) to drag ' +
					'the nodes.',
				description: 'Description on how to use the dragging handle to ' +
					'drag nodes around.',
				placeholders: {
					handle: {
						content: '<svg xmlns="http://www.w3.org/2000/svg" ' +
							'class="infoSvg" viewbox="0 0 32 48" height="30" ' +
							'width="20">' +
							'<path d="M4 31v4h40v-4H4zm0-10v4h40v-4H4zm0-10v4h40v-4H4z"/> ' +
							'</svg>'
					}
				}
			},
			typeInfo: {
				message: 'Hover over and click the colored areas to change types.',
				description: 'Description of how to change the types of node'
			},
			editInfo: {
				message: 'Click the nodes to edit them.',
				description: 'Description of how to edit nodes'
			},
			menuInfo: {
				message: 'Click the arrows ($ARROW$) to show a menu\'s contents.',
				description: 'Description of how to expand a menu\'s children/contents',
				placeholders: {
					arrow: {
						content: '<svg class="infoSvg triangleInfoSvg" ' +
							'xmlns="http://www.w3.org/2000/svg" width="48" ' +
							'height="48" viewbox="0 0 48 48">' +
							'<path d="M16 10v28l22-14z"/>' +
							'</svg>'
					}
				}
			},
			editItem: {
				message: 'Edit item "$NAME$"',
				description: 'Accessibility label for the "edit node" button',
				placeholders: {
					name: {
						content: '$1',
						example: 'MyLink'
					}
				}
			},
			addFail: {
				message: 'Failed to add $NODETYPE$',
				description: 'Error message shown when the adding of a node of ' +
					'type NODETYPE failed',
				placeholders: {
					nodeType: {
						content: '$1',
						example: 'localized version of script'
					}
				}
			}
		},
		editCrmItem: {
			changeType: {
				message: 'Click to change type',
				description: 'Title of an element that changes the type of a node'
			},
			dragNode: {
				message: 'Click and hold to drag node around',
				description: 'Title of an element that moves a node around when ' +
					'dragging it'
			},
			clickToShowChildren: {
				message: 'Click to show children',
				description: 'Title for an element that shows a menu node\'s children'
			},
			clickToShowXChildren: {
				message: 'Click to show $NUMBER$ children',
				description: 'Title for an element that shows a menu node\'s children',
				placeholders: {
					number: {
						content: '$1',
						example: '10'
					}
				}
			},
			clickToShowChild: {
				message: 'Click to show 1 child',
				description: 'Title for an element that shows a menu node\'s child'
			},
			rootName: {
				message: 'Custom Menu',
				description: 'Default root name'
			},
			clickToEditRoot: {
				message: 'Click to edit root node name',
				description: 'Title for a button that allows editing/changing of the '+
					'root node\'s name'
			},
			nodeHidden: {
				message: 'This node won\'t be visible on this content type ' +
					'(select a different one in the top-right corner)',
				description: 'Title for a hidden node. A different content type can be ' +
					'selected by clicking a content type on the top-right of ' +
					'the edit-crm ' +
					'section'
			},
			clickToEdit: {
				message: 'Click to edit node',
				description: 'Title for an element that, on-click edits a regular node'
			}
		},
		tools: {
			paperGetPageProperties: {
				selection: {
					message: 'Selection',
					description: 'Name for the current text selection in a browser'
				},
				host: {
					message: 'Host',
					description: 'The host of a URL. For example for ' +
						'www.google.com/example this would be www.google.com'
				},
				path: {
					message: 'Path',
					description: 'The path of a URL. For example for ' +
						'www.google.com/example this would be /example'
				},
				protocol: {
					message: 'Protocol',
					description: 'The protocol of a URL. this is the part ' +
						'before and including :// For example http:// https:// file://'
				},
				width: {
					message: 'Width',
					description: 'The width of the page in pixels'
				},
				height: {
					message: 'Height',
					description: 'The height of the page in pixels'
				},
				scrolled: {
					message: 'Pixels Scrolled',
					description: 'The amount of pixels scrolled down on a page'
				},
				title: {
					message: 'Title',
					description: 'The title of a page'
				},
				clickedElement: {
					message: 'Clicked Element',
					description: 'The element that was right-clicked on when ' +
						'right-clicking on the page and bringing up the right-click menu'
				}
			},
			paperLibrariesSelector: {
				libraryInfo: {
					message: 'Try to refrain from using unnecessary libraries, libraries ' +
						'load on every single page and load sepaerately for all scripts. ' +
						'This can easily take 100ms for libraries like jQuery. For a ' +
						'jQuery alternative consider using crmAPI.$ or simply $ ' +
						'(without loading jQuery) which features the selector function only.',
					description: 'Warning about not using too many libraries'
				},
				libraries: {
					message: 'Libraries',
					description: 'Label for a list of javascript/typescript libraries'
				},
				anonymous: {
					message: 'anonymous',
					description: 'Name for an anonymous script'
				},
				addOwn: {
					message: 'Add your own',
					description: 'Label for a button that allows you to add ' +
						'your own library'
				},
				xhrFailedMsg: {
					message: 'Failed with status code $STATUSCODE$ "$STATUSMSG$"',
					description: 'Message shown when a request to a script fails',
					placeholders: {
						statusCode: {
							content: '$1',
							example: '404'
						},
						statusMsg: {
							content: '$2',
							example: 'Not Found'
						}
					}
				},
				xhrFailed: {
					message: 'Failed with status code $STATUSCODE$',
					description: 'Message shown when a request to a script fails',
					placeholders: {
						statusCode: {
							content: '$1',
							example: '404'
						}
					}
				},
				nameTaken: {
					message: 'That name is already taken',
					description: 'Error shown when the name for a library is ' +
						'already taken'
				},
				nameMissing: {
					message: 'Please enter a name',
					description: 'Error shown when no name has been entered'
				},
				editing: {
					message: 'Editing library $NAME$',
					description: 'Title when editing a library',
					placeholders: {
						name: {
							content: '$1',
							example: 'MyScript'
						}
					}
				},
				pleaseUpdate: {
					message: 'Please update your chrome (at least chrome 30) to use ' +
						'this feature',
					description: 'Message shown when chrome version is too low ' +
						'to use the (better) monaco editor. Instead falling back to ' +
						'a simple textarea input'
				}
			},
			paperSearchWebsiteDialog: {
				title: {
					message: 'Add a search engine for a website',
					description: 'Title for the paper-search-website dialog'
				},
				description: {
					message: 'This code will search given website for any ' +
						'text you highlight,' +
						' or if nothing is highlighted will prompt you for a query.',
					description: 'Description of what the ' +
						'paper-search-website-dialog does'
				},
				inputOne: {
					message: 'Input one yourself',
					description: 'Option to input your own search website'
				},
				inputDefault: {
					message: 'Choose one of the defaults',
					description: 'Option to choose one of the default search engines'
				},
				chooseDefault: {
					message: 'Choose a default search engine',
					description: 'Title for choosing one of the default search engines'
				},
				try: {
					message: 'Try',
					description: 'Try a search engine and test if it works'
				},
				manualInput: {
					message: 'Manually input your search website',
					description: 'Title for the manual search engine input window'
				},
				findingSearchURL: {
					message: 'By finding out the search URL',
					description: 'Option to manually find the search URL'
				},
				chooseFromList: {
					message: 'By choosing from a list of your visited ' +
						'websites (chrome only)',
					description: 'Option to select a search-engine from a ' +
						'list of your ' +
						'visited websites in your settings'
				},
				goToWebsite: {
					message: 'Please go to the website you want to search. ' +
						'Search for ' +
						'"customRightClickMenu" without quotes and then paste the URL ' +
						'in the input below.',
					description: 'Instructs the user to go to the website they want ' +
						'to search and search for the given string'
				},
				clickOmnibar: {
					message: 'Please right-click the omnibar (the white bar above any page) ' +
						'and go to "edit search engines", press F12, paste the following ' +
						'code in the "console" tab and paste the contents into the box below.',
					description: 'Instructs the user to go to the "edit search engines" page'
				},
				pasteHere: {
					message: 'paste here',
					description: 'Input in which the copied data needs to be pasted'
				},
				invalidInput: {
					message: 'invalid input',
					description: 'Error shown when pasted data is incorrect'
				},
				process: {
					message: 'Process',
					description: 'Process the pasted data and extract possible ' +
						'search engines'
				},
				processedTitle: {
					message: 'Choose the binding you want from this list',
					description: 'Title for the list of processed items. ' +
						'These processed items are basically a list of possible search ' +
						'engines'
				},
				choose: {
					message: 'Choose',
					description: 'Confirm that you want to choose some search engine'
				},
				confirmTitle: {
					message: 'Here you can test whether the given URL gives the ' +
						'expected results',
					description: 'Title for the confirm search engine window'
				},
				searchQuery: {
					message: 'Search query',
					description: 'Title for the search query field. ' +
						'This value will be used as an input for the ' +
						'search engine that was chosen. For example when ' +
						'using google, the query "test" would give ' +
						'www.google.com/search?q=test'
				},
				query: {
					message: 'query',
					description: 'Label for the search query input'
				},
				testURL: {
					message: 'Test URL:',
					description: 'The URL that will be outputted when ' +
						'inputting the query into the search engine. ' +
						'Will be used in the form: {Test URL:} www.google.com/xxxxx'
				},
				howOpenTitle: {
					message: 'How do you want the link to open?',
					description: 'Title for the how to open field. This will give ' +
						'the choice between opening in the current tab or in a new tab'
				},
				newTab: {
					message: 'A new tab',
					description: 'The option to open the URL in a new browser tab'
				},
				currentTab: {
					message: 'The current tab',
					description: 'The option to open the URL in the current tab'
				},
				added: {
					message: 'Added!',
					description: 'Message shown when adding search engine has ' +
						'completed. Try to keep this short'
				},
				enterSearchQuery: {
					message: 'Please enter a search query',
					description: 'Prompt shown to the user when they need to ' +
						'add a search query'
				},
				selectSomething: {
					message: 'Please select something',
					description: 'Message shown when no option has been selected'
				}
			}
		},
		editPages: {
			generic: {
				name: {
					message: 'Name',
					description: 'Label for the name of a node'
				},
				contentType: {
					message: 'Show on content type',
					description: 'Label for the content types section'
				},
				contentTypeTitle: {
					message: 'Toggle showing this item when right-clicking ' +
						'$CONTENTTYPE$',
					description: 'Title for content types',
					placeholders: {
						contentType: {
							content: '$1',
							example: 'Audio'
						}
					}
				},
				showOnSpecified: {
					message: 'Show only on specified sites',
					description: 'Checkbox that allows you to enable ' +
						'showing this on specified sites'
				},
				showOn: {
					message: 'Show on:',
					description: 'Label for what URLs to show this on'
				},
				regexDescr: {
					message: 'Regex is available, check the syntax ' +
						'$PREHTML$here$POSTHTML$.',
					description: 'Info section explaining that regex is available',
					placeholders: {
						prehtml: {
							content: '<a href="https://developer.chrome.com/' +
								'extensions/match_patterns" rel="noopener" ' +
								'target="_blank">'
						},
						posthtml: {
							content: '</a>'
						}
					}
				},
				not: {
					message: 'NOT',
					description: 'Inverts given input when checked. ' +
						'Try to keep this short'
				},
				matchPattern: {
					message: 'URL match pattern',
					description: 'Label for the match pattern input'
				},
				invalidURLPattern: {
					message: 'This is not a valid URL pattern!',
					description: 'Error message shown when match pattern is invalid'
				},
				changeType: {
					message: 'CHANGE TYPE',
					description: 'Allows the changing of a node\'s type'
				}
			},
			link: {
				linkLabel: {
					message: 'Link(s)',
					description: 'Label for the link section where you can ' +
						'configure the links this node will open'
				},
				currentTab: {
					message: 'Open in current tab',
					description: 'Option that, when enabled, will open the URLs ' +
						'in a new tab instead of the current one'
				}
			},
			metadata: {
				name: {
					message: 'The name of this script',
					description: 'Metadata for the "name" key'
				},
				namespace: {
					message: 'The namespace of the script',
					description: 'Metadata for the "namespace" key'
				},
				version: {
					message: 'The script version. This is used for the update check.',
					description: 'Metadata for the "version" key'
				},
				author: {
					message: 'The scripts author',
					description: 'Metadata for the "author" key'
				},
				description: {
					message: 'A short description.',
					description: 'Metadata for the "description" key'
				},
				homepage: {
					message: 'The author\'s homepage',
					description: 'Metadata for the "homepage" key'
				},
				homepageURL: {
					message: 'The author\'s homepage',
					description: 'Metadata for the "homepageURL" key'
				},
				website: {
					message: 'The author\'s homepage',
					description: 'Metadata for the "website" key'
				},
				source: {
					message: 'The author\'s homepage',
					description: 'Metadata for the "source" key'
				},
				icon: {
					message: 'The script\'s icon in low res',
					description: 'Metadata for the "icon" key'
				},
				iconURL: {
					message: 'The script\'s icon in low res',
					description: 'Metadata for the "iconURL" key'
				},
				defaulticon: {
					message: 'The script\'s icon in low res',
					description: 'Metadata for the "defaulticon" key'
				},
				icon64: {
					message: 'This scripts icon in 64x64 pixels.',
					description: 'Metadata for the "icon64" key'
				},
				icon64URL: {
					message: 'This scripts icon in 64x64 pixels.',
					description: 'Metadata for the "icon64URL" key'
				},
				updateURL: {
					message: 'An update URL for the userscript',
					description: 'Metadata for the "updateURL" key'
				},
				downloadURL: {
					message: 'Defines the URL where the script will be downloaded from when an update was detected',
					description: 'Metadata for the "downloadURL" key'
				},
				supportURL: {
					message: 'Defines the URL where the user can report issues and get personal support',
					description: 'Metadata for the "supportURL" key'
				},
				include: {
					message: 'The pages on which the script should run',
					description: 'Metadata for the "include" key'
				},
				match: {
					message: 'The pages on which the script should run',
					description: 'Metadata for the "match" key'
				},
				exclude: {
					message: 'Exclude URLs even if they are included by **@include** or **@match**',
					description: 'Metadata for the "exclude" key'
				},
				require: {
					message: 'Points to a javascript file that is loaded and executed before the script itself',
					description: 'Metadata for the "require" key'
				},
				resource: {
					message: 'The Preloads resources that can be accessed by `GM_getResourceURL` and `GM_getResourceText` by the script of this script',
					description: 'Metadata for the "resource" key'
				},
				connect: {
					message: 'Domains which are allowed to be retrieved by `GM_xmlhttpRequest`',
					description: 'Metadata for the "connect" key'
				},
				runAt: {
					message: 'The moment the script is injected (document-start, document-body, document-end, document-idle or document-menu)',
					description: 'Metadata for the "runAt" key'
				},
				grant: {
					message: 'Whitelists given `GM_*` functions',
					description: 'Metadata for the "grant" key'
				},
				noframes: {
					message: 'Makes the script run on the main page but not in iframes',
					description: 'Metadata for the "noframes" key'
				},
				CRMContentTypes: {
					message: 'The content types on which to run this script as a 6 items long boolean array (e.g. [true, false, true, false, true, false]) (CRM ONLY)',
					description: 'Metadata for the "CRM_contentTypes" key'
				},
				CRMLaunchMode: {
					message: 'When to run this script. 0 = Run on clicking, 1 = always run, 2 = run on specified, 3 = show on specified, 4 = disabled. (CRM ONLY)',
					description: 'Metadata for the "CRM_launchMode" key'
				},
				CRMStylesheet: {
					message: 'Interpret this as a stylesheet (userstyle) instead of a script (userscript). (CRM ONLY)',
					description: 'Metadata for the "CRM_stylesheet" key'
				},
				CRMToggle: {
					message: 'A boolean value (true/false) indicating whether to allow toggling this stylesheet on or off. Only used when @CRM_stylesheet is present. (CRM ONLY)',
					description: 'Metadata for the "CRM_toggle" key'
				},
				CRMDefaultOn: {
					message: 'A boolean value (true/false) indicating whether this stylesheet is toggled on by default. Only used when @CRM_stylesheet and @CRM_toggle are present. (CRM ONLY)',
					description: 'Metadata for the "CRM_defaultOn" key'
				},
				CRMLibraries: {
					message: 'An array containing stringified objects with a "url" and a "name" key, pointing to external libraries used in this script.',
					description: 'Metadata for the "CRM_libraries" key'
				},
				license: {
					message: 'The license for this script. If none is supplied, it\'s under exclusive copyright by default',
					description: 'Metadata for the "license" key'
				},
				preprocessor: {
					message: 'The css preprocessor to use, choose from \'less\', \'stylus\', \'uso\' or \'default\'. For more info check out https://github.com/openstyles/stylus/wiki/Usercss#preprocessor',
					description: 'Metadata for the "preprocessor" key'
				},
				var: {
					message: 'A variable that can be changed by the user and is replaced when compiling the stylesheet',
					description: 'Metadata for the "var" key'
				}
			},
			monaco: {
				startTagUserscript: {
					message: 'The start tag for a UserScript metadata block',
					description: 'Label for the Userscript start tag'
				},
				endTagUserscript: {
					message: 'The end tag for a UserScript metadata block',
					description: 'Label for the Userscript end tag'
				},
				startTagUserstyle: {
					message: 'The start tag for a UserStyle metadata block',
					description: 'Label for the UserStyle start tag'
				},
				endTagUserstyle: {
					message: 'The end tag for a UserStyle metadata block',
					description: 'Label for the UserStyle end tag'
				},
				scriptStart: {
					message: 'UserScript start tag',
					description: 'Short description for the Userscript start tag'
				},
				scriptEnd: {
					message: 'UserScript end tag',
					description: 'Short description for the Userscript end tag'
				},
				styleStart: {
					message: 'Userstyle start tag',
					description: 'Short description for the Userstyle start tag'
				},
				styleEnd: {
					message: 'Userstyle end tag',
					description: 'Short description for the Userstyle end tag'
				},
				metaKey: {
					message: 'Metadata key',
					description: 'Short description for any metadata keys'
				},
				disableMeta: {
					message: 'Disable Metadata Highlight',
					description: 'Description for a button that allows you to '+
						'disable highlighting of metadata values in the editor'
				},
				enableMeta: {
					message: 'Enable Metadata Highlight',
					description: 'Description for a button that allows you to '+
						'enable highlighting of metadata values in the editor'
				},
				keyDescription: {
					message: 'Metadata key $METAKEY$: $METADESCRIPTION$',
					description: 'Long description for metadata keys',
					placeholders: {
						metaKey: {
							content: '$1',
							example: 'Name'
						},
						metaDescription: {
							content: '$2',
							example: 'The name of a script'
						}
					}
				},
				keyDescriptionUnknown: {
					message: 'Metadata key $METAKEY$, unknown key',
					description: 'Long description for metadata keys when the key is unknown',
					placeholders: {
						metaKey: {
							content: '$1',
							example: 'Name'
						}
					}
				},
				valueForKey: {
					message: 'Value $VALUE$ for key $KEY$',
					description: 'Description shown when hovering over a key-value combination',
					placeholders: {
						value: {
							content: '$1',
							example: 'SomeValue'
						},
						key: {
							content: '$2',
							example: 'SomeKey'
						}
					}
				},
				disableUnderline: {
					message: 'Disable CSS underline',
					description: 'Label for a button that disables underlining of ' +
						'colors in CSS'
				},
				enableUnderline: {
					message: 'Enable CSS underline',
					description: 'Label for a button that enables underlining of ' +
						'colors in CSS'
				},
				optionName: {
					message: 'The name of the option',
					description: 'Label for the "name" field of an option config'
				},
				numberOption: {
					message: 'A number type option',
					description: 'Label for any number-type options in config'
				},
				minValue: {
					message: 'The minimum value of the number',
					description: 'Label for the "minimum" field of a number-type ' +
						'option in a config'
				},
				maxValue: {
					message: 'The maximum value of the number',
					description: 'Label for the "maximum" field of a number-type ' +
						'option in a config'
				},
				descr: {
					message: 'A description for this option',
					description: 'Label for the "description" field of an option'
				},
				defaultValue: {
					message: 'The default value for this option',
					description: 'label for the "defaultValue" field of an option. ' +
						'This value specifies the default value of given option'
				},
				value: {
					message: 'The value of this option (set to null to unset)',
					description: 'Label for the "value" field of an option. This is ' +
						'the value that is set when the option is filled in. ' +
						'If this value is set to "null" it\'s treated as not set at all.' +
						'For example if the choices are A and B and the value is null, ' +
						'the value is neither.'
				},
				valueExpanded: {
					message: 'The value of this option, changing it here will have the' + 
						' same effect as changing it in the options dialog',
					description: 'Expanded version of the description above'
				},
				stringOption: {
					message: 'A string type option',
					description: 'Label for any string-type options in config'
				},
				maxLength: {
					message: 'The maximum length of the string',
					description: 'Label for the "maxLength" field of a string-type ' +
						'option which specifies the max length of the string'
				},
				format: {
					message: 'A regex format that the string has to follow',
					description: 'Label for the "format" field of a string-type ' +
						'option which asks for a regex value that should match ' +
						'the eventual value of the string'
				},
				choiceOption: {
					message: 'A choice type option',
					description: 'Label for any choice-type options in config'
				},
				selected: {
					message: 'The selected value\'s index',
					description: 'Label for the "selected" field which ' +
						'takes a number value that is the index of ' +
						'the chosen value in the choices'
				},
				values: {
					message: 'The possible values of this option',
					description: 'Label for the "values" field which ' +
						'takes an array of possible values which can be ' +
						'chosen'
				},
				colorOption: {
					message: 'A color type option',
					description: 'Label for any color-type options in config'
				},
				booleanOption: {
					message: 'A boolean type option',
					description: 'Label for any boolean-type options in config'
				},
				arrayOption: {
					message: 'An array type option',
					description: 'Label for any array-type options in config'
				},
				maxItems: {
					message: 'The maximum number of array items',
					description: 'Label for the "maxItems" field of an ' +
						'array-type option, which limits the max amount of ' +
						'values that can be inputted'
				},
				items: {
					message: 'The type of items this array contains (number or string)',
					description: 'Label for the "items" field of an array-type option ' +
						'which sets the type of the elements it has to either ' +
						'numbers or strings'
				},
				lintingDisabled: {
					message: 'No linting possible in $MODE$ mode',
					description: 'Message shown when linting is not possible in this mode',
					placeholders: {
						mode: {
							content: '$1',
							example: 'typescript|LESS/stylus'
						}
					}
				},
				monacoError: {
					message: 'Caught monaco editor error (ignore these)',
					description: 'Error shown when a monaco editor is caught'
				}
			},
			script: {
				autoUpdate: {
					message: 'toggle auto-update',
					description: 'Button that toggles automatically updating ' +
						'the script when a new version is hosted on the source'
				},
				permissions: {
					message: 'Used Permissions(s)',
					description: 'Title for the used permissions of this script. ' +
						'The permissions specify which APIs the script can use'
				},
				manage: {
					message: 'Manage',
					description: 'Button that opens the permissions manager'
				},
				script: {
					message: 'Script',
					description: 'Title for the script editing section ' +
						'of a javascript script node'
				},
				docs: {
					message: 'docs',
					description: 'Button that opens the documentation of the API' +
						'when clicked'
				},
				scriptMain: {
					message: 'Main',
					description: 'Main section of the script. This is the script ' +
						'that is run on the page, not a background-script'
				},
				scriptBackground: {
					message: 'Background',
					description: 'Background section of the script. This script ' +
						'is ran in the background like an extension background-page'
				},
				scriptOptions: {
					message: 'Options',
					description: 'Options editor for a script. These allow for ' +
						'custom options to be passed to a script'
				},
				scriptLibraries: {
					message: 'Libraries',
					description: 'Library editor. Libraries are external scripts ' +
						'ran whenever this script is ran'
				},
				showBackgroundLibs: {
					message: 'Show backgroundscript libraries',
					description: 'Button that toggles showing libraries for the ' +
						'background script'
				},
				crmNode: {
					message: 'CRM Node',
					description: 'One of the options to which a script can be ' +
						'exported. This exports it to a JSON version of this ' + 
						'node'
				},
				userScript: {
					message: 'Userscript',
					description: 'One of the options to which a script can be ' +
						'exported. This exports it to a greasemonkey and ' +
						'tampermonkey compatible userscript ' +
						'(https://en.wikipedia.org/wiki/Userscript)' +
						'This word probably won\'t have to be changed'
				}
			},
			code: {
				triggers: {
					message: 'Trigger(s)',
					description: 'Title for the triggers section. ' +
						'The triggers specify when the script/stylesheet is ' +
						'ran'
				},
				triggerOnClick: {
					message: 'Execute on clicking',
					description: 'Trigger option that makes the script/stylesheet ' +
						'run on clicking it in the right-click menu'
				},
				triggerAlways: {
					message: 'Always execute',
					description: 'Trigger option that makes the script/stylesheet ' +
						'always execute.'
				},
				triggerSpecified: {
					message: 'Execute when visiting specified sites',
					description: 'Trigger option that makes the script/stylesheet ' +
						'execute when visiting the specified websites'
				},
				triggerShowOnSpecified: {
					message: 'Show only on specified sites',
					description: 'Trigger option that only shows the script/stylesheet ' +
						'on specified websites'
				},
				triggerDisabled: {
					message: 'Disabled',
					description: 'Disables this script/stylesheet altogether and ' +
						'does not show it in the right-click menu. Basically the ' +
						'same as hidden'
				},
				showOn: {
					message: 'Show on:',
					description: 'Label for the showing of a node in the right-click ' +
						'menu on specified websites'
				},
				executeOn: {
					message: 'Execute on:',
					description: 'Label for the executing of a node in the right-click ' +
						'menu on specified websites'
				},
				triggerInfo: {
					message: 'For trigger mode "execute when visiting sides" urls need ' +
						'to match $EXECUTEPREHTML$the following pattern$POSTHTML$ and ' +
						'for trigger mode "show when visiting specified sites" they need ' +
						'to match $MATCHPREHTML$this pattern$POSTHTML$. Regular URLs ' +
						'without wildcards (*) will match just that URL.',
					placeholders: {
						executePreHtml: {
							content: '<a href="https://wiki.greasespot.net/Include_and_' +
								'exclude_rules" rel="noopener" target="_blank">'
						},
						matchPreHTML: {
							content: '<a href="https://developer.chrome.com/extensions/match_' +
								'patterns" rel="noopener" target="_blank">'
						},
						postHTML: {
							content: '</a>'
						}
					}
				},
				backgroundInfo: {
					message: 'The background page will always be running. It\'s ' +
						'possible to communicate with it using the $COMMAPI$. ' +
						'The scripts only share their permissions.',
					description: 'Info about the background script and what it does',
					placeholders: {
						commAPI: {
							content: '<a href="http://sanderronde.github.io' +
								'/CustomRightClickMenu/documentation/classes/' +
								'crm.crmapi.instance.html#comm"target="_blank" ' +
								'rel="noopener">crmAPI.comm API</a>'
						}
					}
				},
				optionsInfo: {
					message: 'Create a key and press Ctrl+Space for format hints ' +
						'in the option object. Check out $PREHTML$this page$POSTHTML$ ' +
						'to see the format of the options. Keep the $schema line ' +
						'to enable format hints on pressing Ctrl+Space',
					description: 'Info about the options editor and how it works',
					placeholders: {
						preHTML: {
							content: '<a href="http://sanderronde.github.io/' +
								'CustomRightClickMenu/documentation/modules/' +
								'crm.scriptoptionsschema.html#options" ' +
								'target="_blank" rel="noopener">'
						},
						postHTML: {
							content: '</a>'
						}
					}
				},
				settings: {
					message: 'Editor Settings',
					description: 'Title for the settings section. This allows ' +
						'you to edit the internal monaco editor\'s settings'
				},
				theme: {
					message: 'Theme',
					description: 'Title for the theme editing section.'
				},
				fontSize: {
					message: 'font size %',
					description: 'The font size of the editor. Include the % sign ' +
						'in some way to convey that it\'s displayed in percentages'
				},
				globals: {
					message: 'Comma separated list of JSLint globals',
					description: 'A list of global javascript values that ' +
						'should be ignored when doing a JSLint ' +
						'syntax check'
				},
				keyBindings: {
					message: 'Key Bindings',
					description: 'Title for the key bindings section'
				},
				goToDef: {
					message: 'Go To Type Definition',
					description: 'The go to definition code action.'
				},
				rename: {
					message: 'Rename Symbol',
					description: 'Renames a variable/function/symbol'
				},
				exportAs: {
					message: 'EXPORT AS',
					description: 'Allows you to export a script/stylesheet. ' +
						'This button then allows you to select something to ' +
						'export it as. For example a regular CRM-compatible node ' +
						'or a userscript'
				}
			},
			stylesheet: {
				togglable: {
					message: 'Is Togglable',
					description: 'A button that sets whether a stylesheet ' +
						'should be togglable from on to off'
				},
				onByDefault: {
					message: 'On by default',
					description: 'A button that sets whether a stylesheet ' +
						'is toggled on by default or off by default'
				},
				toggleInfo: {
					message: 'Non-togglable CSS is not in the right-click ' +
						'menu but always active instead.',
					description: 'Info about the toggle buttons'
				},
				stylesheet: {
					message: 'Stylesheet',
					description: 'The stylesheet itself in this node that ' +
						'can be edited'
				},
				optionsInfo: {
					message: 'See $PRESTYLUSHTML$this page$POSTHTML$ for more ' +
						'info about code options (vars) and preprocessors ' +
						'and see $PREUSERCSSHTML$this section$POSTHTML$ for ' +
						'examples (ignore the @-moz-document part).',
					placeholders: {
						preStylusHTML: {
							content: '<a href="https://github.com/openstyles' +
								'/stylus/wiki/Usercss#var" rel="noopener" ' +
								'target="_blank">'
						},
						preUserCSSHTML: {
							content: '<a href="https://github.com/openstyles' +
								'/stylus/wiki/Usercss#more-examples" ' +
								'rel="noopener" target="_blank">'
						},
						postHTML: {
							content: '</a'
						}
					}
				},
				stylusInfo: {
					message: 'Unfortunately there\'s no syntax highlighting ' +
						'support for Stylus (yet). The editor will use LESS ' +
						'syntax highlighting instead as it\'s somewhat close ' +
						'to Stylus.',
					description: 'Info about the stylus syntax highlighting ' +
						'(and lack thereof)'
				}
			}
		},
		typeSwitcher: {
			title: {
				message: 'Change type to $TYPE$',
				description: 'Changes the type of this node to another type',
				placeholders: {
					type: {
						content: '$1',
						example: 'Script'
					}
				}
			}
		}
	}
}