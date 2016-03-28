(function () {
	var manifestPermissions = [
		'alarms',
		'background',
		'bookmarks',
		'browsingData',
		'clipboardRead',
		'clipboardWrite',
		'contentSettings',
		'cookies',
		'contentSettings',
		'declarativeContent',
		'desktopCapture',
		'downloads',
		'history',
		'identity',
		'idle',
		'management',
		'pageCapture',
		'power',
		'privacy',
		'printerProvider',
		'sessions',
		'system.cpu',
		'system.memory',
		'system.storage',
		'topSites',
		'tabCapture',
		'tts',
		'webNavigation',
		'webRequest',
		'webRequestBlocking'
	];

	Polymer({
		is: 'install-confirm',

		/*
		 * The synced settings of the app
		 * 
		 * @attribute settings
		 * @type Object
		 * @value {}
		 */
		settings: {},

		/*
		 * A copy of the synced settings of the app
		 * 
		 * @attribute settingsCopy
		 * @type Object
		 * @value {}
		 */
		settingsCopy: {},

		/*
		 * The local settings of the app
		 * 
		 * @attribute storageLocal
		 * @type Object
		 * @value {}
		 */
		storageLocal: {},

		/*
		 * The metatags for the script
		 * 
		 * @attribute metaTags
		 * @type Object
		 * @value {}
		 */
		metaTags: {},

		/*
		 * The metainfo for the script
		 * 
		 * @attribute metaInfo
		 * @type Object
		 * @value {}
		 */
		metaInfo: {},

		/*
		 * The metatags to be given to the script
		 * 
		 * @attribute tags
		 * @type Object
		 * @value {}
		 */
		tags: {},

		properties: {
			script: {
				type: String,
				notify: true,
				value: ''
			}
		},

		loadSettings: function(cb) {
			var _this = this;

			function callback(items) {
				_this.settings = items;
				_this.settingsCopy = JSON.parse(JSON.stringify(items));
				cb && cb.apply(_this);
			}

			chrome.storage.local.get(function(storageLocal) {
				if (storageLocal.useStorageSync) {
					//Parse the data before sending it to the callback
					chrome.storage.sync.get(function(storageSync) {
						var indexes = storageSync.indexes;
						if (!indexes) {
							chrome.storage.local.set({
								useStorageSync: false
							});
							callback(storageLocal.settings);
						} else {
							var settingsJsonArray = [];
							indexes.forEach(function(index) {
								settingsJsonArray.push(storageSync[index]);
							});
							var jsonString = settingsJsonArray.join('');
							var settings = JSON.parse(jsonString);
							callback(settings);
						}
					});
				} else {
					//Send the "settings" object on the storage.local to the callback
					if (!storageLocal.settings) {
						chrome.storage.local.set({
							useStorageSync: true
						});
						chrome.storage.sync.get(function(storageSync) {
							var indexes = storageSync.indexes;
							var settingsJsonArray = [];
							indexes.forEach(function(index) {
								settingsJsonArray.push(storageSync[index]);
							});
							var jsonString = settingsJsonArray.join('');
							var settings = JSON.parse(jsonString);
							callback(settings);
						});
					} else {
						callback(storageLocal.settings);
					}
				}
				_this.storageLocal = storageLocal;
			});
		},

		getDescription: function (permission) {
			console.log(permission);
			var descriptions = {
				alarms: 'Makes it possible to create, view and remove alarms.',
				background: 'Runs the extension in the background even while chrome is closed. (https://developer.chrome.com/extensions/alarms)',
				bookmarks: 'Makes it possible to create, edit, remove and view all your bookmarks.',
				browsingData: 'Makes it possible to remove any saved data on your browser at specified time allowing the user to delete any history, saved passwords, cookies, cache and basically anything that is not saved in incognito mode but is in regular mode. This is editable so it is possible to delete ONLY your history and not the rest for example. (https://developer.chrome.com/extensions/bookmarks)',
				clipboardRead: 'Allows reading of the users\' clipboard',
				clipboardWrite: 'Allows writing data to the users\' clipboard',
				cookies: 'Allows for the setting, getting and listenting for changes of cookies on any website. (https://developer.chrome.com/extensions/cookies)',
				contentSettings: 'Allows changing or reading your browser settings to allow or deny things like javascript, plugins, popups, notifications or other things you can choose to accept or deny on a per-site basis. (https://developer.chrome.com/extensions/contentSettings)',
				declarativeContent: 'Allows for the running of scripts on pages based on their url and CSS contents. (https://developer.chrome.com/extensions/declarativeContent)',
				desktopCapture: 'Makes it possible to capture your screen, current tab or chrome window (https://developer.chrome.com/extensions/desktopCapture)',
				downloads: 'Allows for the creating, pausing, removing, searching and removing of downloads and listening for any downloads happenng. (https://developer.chrome.com/extensions/downloads)',
				history: 'Makes it possible to read your history and remove/add specific urls. This can also be used to search your history and to see howmany times you visited given website. (https://developer.chrome.com/extensions/history)',
				identity: 'Allows for the API to ask you to provide your (google) identity to the script using oauth2, allowing you to pull data from lots of google APIs: calendar, contacts, custom search, drive, gmail, google maps, google+, url shortener (https://developer.chrome.com/extensions/identity)',
				idle: 'Allows a script to detect whether your pc is in a locked, idle or active state. (https://developer.chrome.com/extensions/idle)',
				management: 'Allows for a script to uninstall or get information about an extension you installed, this does not however give permission to install other extensions. (https://developer.chrome.com/extensions/management)',
				notifications: 'Allows for the creating of notifications. (https://developer.chrome.com/extensions/notifications)',
				pageCapture: 'Allows for the saving of any page in MHTML. (https://developer.chrome.com/extensions/pageCapture)',
				power: 'Allows for a script to keep either your screen or your system altogether from sleeping. (https://developer.chrome.com/extensions/power)',
				privacy: 'Allows for a script to query what privacy features are on/off, for exaple autoFill, password saving, the translation feature. (https://developer.chrome.com/extensions/privacy)',
				printerProvider: 'Allows for a script to capture your print jobs\' content and the printer used. (https://developer.chrome.com/extensions/printerProvider)',
				sessions: 'Makes it possible for a script to get all recently closed pages and devices connected to sync, also allows it to re-open those closed pages. (https://developer.chrome.com/extensions/sessions)',
				"system.cpu": 'Allows a script to get info about the CPU. (https://developer.chrome.com/extensions/system_cpu)',
				"system.memory": 'Allows a script to get info about the amount of RAM memory on your computer. (https://developer.chrome.com/extensions/system_memory)',
				"system.storage": 'Allows a script to get info about the amount of storage on your computer and be notified when external storage is attached or detached. (https://developer.chrome.com/extensions/system_storage)',
				topSites: 'Allows a script to your top sites, which are the sites on your new tab screen. (https://developer.chrome.com/extensions/topSites)',
				tabCapture: 'Allows the capturing of the CURRENT tab and only the tab. (https://developer.chrome.com/extensions/tabCapture)',
				tts: 'Allows a script to use chrome\'s text so speach engine. (https://developer.chrome.com/extensions/tts)',
				webNavigation: 'Allows a script info about newly created pages and allows it to get info about what website visit at that time.' +
					' (https://developer.chrome.com/extensions/webNavigation)',
				webRequest: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. (https://developer.chrome.com/extensions/webRequest)',
				webRequestBlocking: 'Allows a script info about newly created pages and allows it to get info about what website you are visiting, what resources are downloaded on the side, and can basically track the entire process of opening a new website. This also allows the script to block certain requests for example for blocking ads or bad sites. (https://developer.chrome.com/extensions/webRequest)',

				//Script-specific descriptions
				crmGet: 'Allows the reading of your Custom Right-Click Menu, including names, contents of all nodes, what they do and some metadata for the nodes',
				crmWrite: 'Allows the writing of data and nodes to your Custom Right-Click Menu. This includes <b>creating</b>, <b>copying</b> and <b>deleting</b> nodes. Be very careful with this permission as it can be used to just copy nodes until your CRM is full and delete any nodes you had. It also allows changing current values in the CRM such as names, actual scripts in script-nodes etc.',
				chrome: 'Allows the use of chrome API\'s. Without this permission only the \'crmGet\' and \'crmWrite\' permissions will work.',

				none: 'No permissions',
				
				//Greasemonkey APIs
				GM_addStyle: 'Allows the adding of certain styles to the document through this API',
				GM_deleteValue: 'Allows the deletion of storage items',
				GM_listValues: 'Allows the listing of all storage data',
				GM_addValueChangeListener: 'Allows for the listening of changes to the storage area',
				GM_removeValueChangeListener: 'Allows for the removing of listeners',
				GM_setValue: 'Allows for the setting of storage data values',
				GM_getValue: 'Allows the reading of values from the storage',
				GM_log: 'Allows for the logging of values to the console (same as normal console.log)',
				GM_getResourceText: 'Allows the reading of the content of resources defined in the header',
				GM_getResourceURL: 'Allows the reading of the URL of the predeclared resource',
				GM_registerMenuCommand: 'Allows the adding of a button to the extension menu - not implemented',
				GM_unregisterMenuCommand: 'Allows the removing of an added button - not implemented',
				GM_openInTab: 'Allows the opening of a tab with given URL',
				GM_xmlhttpRequest: 'Allows you to make an XHR to any site you want',
				GM_download: 'Allows the downloading of data to the hard disk',
				GM_getTab: 'Allows the reading of an object that\'s persistent while the tab is open - not implemented',
				GM_saveTab: 'Allows the saving of the tab object to reopen after a page unload - not implemented',
				GM_getTabs: 'Allows the readin gof all tab object - not implemented',
				GM_notification: 'Allows sending desktop notifications',
				GM_setClipboard: 'Allows copying data to the clipboard - not implemented',
				GM_info: 'Allows the reading of some script info'
			};

			window.descriptions = descriptions;
			console.log(descriptions[permission]);

			return descriptions[permission];
		},

		isNonePermission: function(permission) {
			return permission === 'none';
		},

		showPermissionDescription: function(e) {
			var el = e.target;
			if (el.tagName.toLowerCase === 'div') {
				el = el.children[0];
			}
			else if (el.tagName.toLowerCase() === 'path') {
				el = el.parentNode;
			}

			var children = el.parentNode.parentNode.parentNode.children;
			var description = children[children.length - 1];
			if (el.classList.contains('shown')) {
				$(description).stop().animate({
					height: 0
				}, 250);
			} else {
				$(description).stop().animate({
					height: (description.scrollHeight + 7) + 'px'
				}, 250);
			}
			el.classList.toggle('shown');
		},

		isManifestPermissions: function(permission) {
			return manifestPermissions.indexOf(permission) > -1;
		},

		checkPermission: function(e) {
			var checkbox = e.target;
			while (checkbox.tagName.toLowerCase() !== 'paper-checkbox') {
				checkbox = checkbox.parentNode;
			}

			if (checkbox.checked) {
				var permission = checkbox.getAttribute('permission');
				if (this.isManifestPermissions(permission)) {
					chrome.permissions.getAll(function(permissions) {
						var allowed = permissions.permissions;
						if (allowed.indexOf(permission) === -1) {
							try {
								chrome.permissions.request(permission, function(granted) {
									if (!granted) {
										checkbox.checked = false;
									}
								});
							} catch (e) {
								//Is not a valid requestable permission
							}
						}
					});
				}
			}
		},

		cancelInstall: function() {
			window.close();
		},

		getlastMetaTagValue: function(key) {
			return this.metaTags[key] && this.metaTags[key][this.metaTags[key].length - 1];
		},

		uploadSettings: function (_this) {
			chrome.runtime.sendMessage({
				type: 'updateStorage',
				data: {
					type: 'optionsPage',
					settingsChanges: [
					{
						oldValue: _this.settingsCopy.crm,
						newValue: _this.settings.crm,
						key: 'crm'
					}]
				}
			});
		},

		addToRequestPermissions: function (node) {
			chrome.storage.local.get('requestPermissions', function(keys) {
				var requestPermissions = keys.requestPermissions;
				requestPermissions = (requestPermissions && requestPermissions.permissions && requestPermissions.permissions.concat(node.permissions)) || node.permissions;
				chrome.storage.local.set({
					requestPermissions: requestPermissions
				}, function() {
					chrome.runtime.openOptionsPage();
				});
			});
		},

		convertTriggerToMatch: function(trigger) {
			var protocolSplit = trigger.split('://')[0];
			var i;
			if (protocolSplit.length > 1 && protocolSplit[1] !== '') {
				var protocol = protocolSplit[0];
				if (protocolSplit[1] === '*') {
					return protocol + '://*/*';
				} else {
					var hostSplit = protocolSplit[1].split('/');
					var host = hostSplit[0];
					var hostRegex = /(((\*\.)?)(([^\/\*\s])+))|(\*)/;
					if (hostSplit.length > 1) {
						var path = hostSplit[1];

						if (host.match(hostRegex)) {
							return null;
						} else {
							return protocol + '://' + host + '/' + path;
						}
					} else {
						if (host.match(hostRegex)) {
							return protocol + '://' + host + '/*';
						} else {
							return null;
						}
					}
				}

			} else {
				//Only one protocol part, meaning it's either an asterisk
				//or protocol*
				if (trigger !== '*') {
					var schemes = ['http', 'https', 'file', 'ftp'];
					for (i = 0; i < schemes.length; i++) {
						if (protocolSplit[0].indexOf(schemes[i]) > -1) {
							return schemes[i] + '://*/*';
						}
					}
				}
				return '*://*/*';
			}
		},

		applyMetaTags: function (node) {
			var metaTagsArr = [];

			var metaValue;
			var tags = this.tags;
			for (var metaKey in tags) {
				if (tags.hasOwnProperty(metaKey)) {
					metaValue = tags[metaKey];
					var value;
					if (metaKey === 'CRM_contentTypes') {
						value = JSON.stringify(metaValue);
						metaTagsArr.push(' //' + metaKey + '	' + value);
					} else {
						for (var i = 0; i < metaValue.length; i++) {
							value = metaValue[i];
							metaTagsArr.push(' //' + metaKey + '	' + value);
						}
					}
				}
			}

			var scriptSplit = (node.type === 'script' ? node.value.script : node.value.stylesheet).split('\n');

			var finalMetaTags;
			var beforeMetaTags;
			if (this.metaInfo && this.metaInfo.start) {
				beforeMetaTags = scriptSplit.splice(0, this.metaInfo.metaStart);
				scriptSplit.splice(0, (this.metaInfo.metaEnd - this.metaInfo.metaStart));
			} else {
				beforeMetaTags = [];
			}
			var afterMetaTags = scriptSplit;

			finalMetaTags = beforeMetaTags;
			finalMetaTags = finalMetaTags.concat(metaTagsArr);
			finalMetaTags = finalMetaTags.concat(afterMetaTags);

			node.value[node.type] = finalMetaTags.join('\n');
		},

		completeInstall: function () {
			var node = {};
			var _this = this;

			var tags = JSON.parse(JSON.stringify(this.metaTags));

			//Name
			node.name = (this.tags.name = this.getlastMetaTagValue('name') || 'name');

			//Triggers
			var i;
			var url;
			var triggers = [];
			var includes = this.metaTags.include;
			if (includes) {
				tags.match = [];
				for (i = 0; i < includes.length; i++) {
					url = this.convertTriggerToMatch(includes[i]);
					if (!url) {
						includes.splice(i, 1);
						i--;
					} else {
						includes[i] = {
							url: url,
							not: false
						};
						tags.match.push(url);
					}
				}
				triggers = triggers.concat(includes);
			}
			var match = this.metaTags.match;
			if (match) {
				tags.match = [];
				match.map(function (item) {
					tags.match.push(item);
					return {
						url: item,
						not: false
					}
				});
				triggers = triggers.concat(match);
			}
			var exclude = this.metaTags.exclude;
			if (exclude) {
				tags.excludes = [];
				for (i = 0; i < includes.length; i++) {
					url = this.convertTriggerToMatch(includes[i]);
					if (!url) {
						includes.splice(i, 1);
						i--;
					} else {
						tags.excludes.push(url);
						includes[i] = {
							url: url,
							not: true
						};
					}
				}
				triggers = triggers.concat(exclude);
			}

			//Type-specific data
			var launchMode;
			if (this.getlastMetaTagValue('CRM_stylesheet') === 'true') {
				node.type = 'stylesheet';
				launchMode = this.getlastMetaTagValue('CRM_launchMode') || 0;
				launchMode = this.tags.CRM_launchMode = parseInt(launchMode, 10);
				node.value = {
					stylesheet: this.script,
					defaultOn: (this.tags.CRM_defaultOn = this.getlastMetaTagValue('CRM_defaultOn') || false),
					toggle: (this.tags.CRM_toggle = this.getlastMetaTagValue('CRM_toggle') || false),
					triggers: exclude,
					launchMode: launchMode
				}
			} else {
				node.type = 'script';

				//Libraries
				var libs = [];
				if (this.metaTags.CRM_libraries) {
					this.metaTags.CRM_libraries.forEach(function(item) {
						try {
							libs.push(JSON.stringify(item));
						} catch (e) {
						};
					});
				};
				this.tags.CRM_libraries = libs;

				var anonymousLibs = this.metaTags.require;
				if (this.metaTags.require) {
					for (i = 0; i < anonymousLibs.length; i++) {
						for (var j = 0; j < libs.length; j++) {
							if (libs[j].url === anonymousLibs[i]) {
								anonymousLibs.splice(i, 1);
								i--;
								break;
							}
						}
						anonymousLibs[i] = {
							url: anonymousLibs[i],
							name: null
						}
					}
				}

				var anonymousVersion = [];
				for (i = 0; i < libs.length; i++) {
					anonymousVersion.push(libs[i].url);
				}
				for (i = 0; i < anonymousLibs.length; i++) {
					anonymousVersion.push(anonymousLibs[i].url);
				}

				launchMode = this.getlastMetaTagValue('CRM_launchMode') || 0;
				launchMode = this.tags.CRM_launchMode = parseInt(launchMode, 10);
				node.value = {
					script: this.script,
					launchMode: launchMode,
					libraries: libs,
					triggers: triggers
				};
			}

			//URL
			var updateUrl = this.getlastMetaTagValue('updateURL') || this.getlastMetaTagValue('downloadURL');

			//Requested permissions
			var permissions = [];
			if (this.metaTags.grant) {
				permissions = this.metaTags.grant;
				permissions.splice(permissions.indexOf('none'), 1);
				this.tags.grant = permissions;
			}

			//NodeInfo
			node.nodeInfo = {
				version: this.getlastMetaTagValue('version') || null,
				source: {
					updateURL: updateUrl || window.installPage.userscriptUrl,
					url: updateUrl || this.getlastMetaTagValue('namespace') || window.installPage.userscriptUrl,
					author: this.getlastMetaTagValue('author') || null
				},
				permissions: permissions,
				installDate: new Date().toLocaleDateString()
			};

			//Content types
			if (this.getlastMetaTagValue('CRM_contentTypes')) {
				try {
					node.onContentTypes = JSON.parse(this.getlastMetaTagValue('CRM_contentTypes'));
				} catch (e) {}
			}
			node.onContentTypes = this.tags.CRM_contentTypes = (node.onContentTypes || [true, true, true, true, true, true]);
			node.path = [this.settings.crm.length];

			//Allowed permissions
			var allowedPermissions = [];
			$('.infoPermissionCheckbox').each(function() {
				this.checked && allowedPermissions.push(this.getAttribute('permission'));
			});
			node.permissions = allowedPermissions;

			//Id
			chrome.storage.local.get('latestId', function (id) {
				id = id.latestId;
				node.id = id;
				chrome.storage.local.set({
					latestId: id++
				});

				//Resources
				if (_this.metaTags.resource) {
					//Register resources
					var resources = _this.metaTags.resource;
					resources.forEach(function(resource) {
						var resourceSplit = resource.split(/(\s*)/);
						var resourceName = resourceSplit[0];
						var resourceUrl = resourceSplit[1];
						chrome.runtime.sendMessage({
							type: 'resource',
							data: {
								type: 'register',
								name: resourceName,
								url: resourceUrl,
								scriptId: id
							}
						});
					});
				}

				//Uploading
				_this.settings.crm.push(node);
				_this.uploadSettings(_this);
				chrome.tabs.getCurrent(function(tab) {
					chrome.runtime.sendMessage({
						type: 'scriptInstall',
						data: {
							tabId: tab.id,
							url: window.installPage.userscriptUrl
						}
					});

					_this.applyMetaTags(node);

					_this.addToRequestPermissions(node);
				});
			});
		},

		setMetaTag: function (name, values) {
			var value;
			if (values) {
				value = values[values.length - 1];
			} else {
				value = '-';
			}
			this.$[name].innerText = value;
		},

		setMetaInformation: function(tags, metaInfo) {
			this.setMetaTag('descriptionValue', tags.description);
			this.setMetaTag('authorValue', tags.author);

			window.installPage.$.title.innerHTML = 'Installing ' + (tags.name && tags.name[0]);

			this.$.sourceValue.innerText = window.installPage.userscriptUrl;
			this.$.permissionValue.items = tags.grant || ['none'];
			this.metaTags = tags;
			this.metaInfo = metaInfo;
		},

		cmLoaded: function (cm) {
			var _this = this;
			$('<style id="editorZoomStyle">' +
			'.CodeMirror, .CodeMirror-focused {' +
			'font-size: ' + (1.25 * window.installConfirm.settings.editor.zoom) + '%!important;' +
			'}' +
			'</style>').appendTo('head');
			cm.refresh();
			window.cm = cm;
			$(cm.display.wrapper).keypress(function (e) {
				e.which === 8 && e.preventDefault();
			});

			//Show info about the script, if available
			//var tags = cm.metaTags.metaTags;
			var interval = window.setInterval(function () {
				if (cm.getMetaTags) {
					window.clearInterval(interval);
					cm.getMetaTags(cm);
					if (cm.metaTags && cm.metaTags.metaTags) {
						_this.setMetaInformation.apply(_this, [cm.metaTags.metaTags, cm.metaTags]);
					}
				}
			}, 25);
		},

		loadEditor: function(_this) {
			var placeHolder = $(_this.$.editorPlaceholder);
			this.editorHeight = placeHolder.height();
			this.editorWidth = placeHolder.width();
			!this.settings.editor && (_this.settings.editor = {});
			this.editor = new window.CodeMirror(_this.$.editorCont, {
				lineNumbers: true,
				value: this.script,
				lineWrapping: true,
				onLoad: this.cmLoaded,
				mode: 'javascript',
				readOnly: 'nocursor',
				theme: (_this.settings.editor.theme === 'dark' ? 'dark' : 'default'),
				indentUnit: _this.settings.editor.tabSize,
				messageInstallConfirm: true,
				indentWithTabs: _this.settings.editor.useTabs,
				gutters: ['CodeMirror-lint-markers'],
				undoDepth: 500
			});
		},

		ready: function () {
			var _this = this;
			this.loadSettings(function() {
				if (window.CodeMirror) {
					_this.loadEditor(_this);
				} else {
					var editorCaller = function() {
						_this.loadEditor(_this);
					};
					if (window.codeMirrorToLoad) {
						window.codeMirrorToLoad.final = editorCaller;
					} else {
						window.codeMirrorToLoad = {
							toLoad: [],
							final: editorCaller
						};
					}
				}
			});
			window.installConfirm = this;
		}
	});
}());