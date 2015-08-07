Polymer({
	is: 'use-external-editor-dialog',
	
	/*
	 * The port at which the app is located
	 * 
	 * @attribute appPort
	 * @type Object
	 * @default null
	 */
	appPort: null,

	/*
	 * The connection to the app and its status
	 * 
	 * @attribute connection
	 * @type Object
	 * @default {status: 'no connection',connected: false}
	 */
	connection: {
		status: 'no connection',
		connected: false
	},

	/*
	 * Clears any recent user input that might be annoying or heavy to keep (huge amounts of text)
	 */
	clear: function() {
		
	},
	
	/*
	 * Calls the fit function on the dialog to adapt it to its new size
	 */
	fit: function() {
		this.$.externalEditorDialog.fit();
	},
	
	/*
	 * Initialize the dialog for use
	 */
	init: function() {
		var _this = this;
		if (!window.options.file) {
			window.webkitStorageInfo.requestQuota(
				window.PERSISTENT,
				10485760, //10MB max should be enough unless you're writing a new operating system in javascript or something
				function (grantedBytes) {
					window.webkitRequestFileSystem(
						window.PERSISTENT,
						grantedBytes,
						function(fileSystem) {
							_this.handleFileSystem(fileSystem, _this);
						},
						_this.errorHandler
					);
				},
				_this.errorHandler
			);
		}
		this.clear();
		this.fit();
	},
	
	/*
	 * Toggles the dialog
	 */
	toggle: function() {
		this.$.externalEditorDialog.toggle();
	},

	/*
	 * Shows the dialog
	 */
	show: function() {
		this.$.externalEditorDialog.open();
	},

	/*
	 * Hides the dialog
	 */
	hide: function() {
		this.$.externalEditorDialog.close();
	},
	
	/*
	 * Finds or creates the script.js file in the given fileSystem
	 *
	 * @param {fileSystem} fileSystem The filesystem passed
	 * @param {element} _this The external editor element
	 */
	handleFileSystem: function(fileSystem, _this) {
		console.log(fileSystem);
		console.log(fileSystem.root.toURL());
		//Check if the file exists
		fileSystem.root.getFile(
			'script.js',
			{},
			function(fileEntry) {
				_this.file = fileEntry;
				console.log(_this.file);
			},
			function(error) {
				if (error.code === 1) { //File doesn't exist, create it
					fileSystem.root.getFile('script.js', {
						create:true,
						exclusive: true
					},
					function(fileEntry) {
						_this.file = fileEntry;
						console.log(_this.file);
					},
					_this.errorHandler
					);
				}
			}
		);
	},
	
	/*
	 * Notifies the user if something went wrong
	 *
	 * @param {string} error What went wrong
	 */
	errorHandler: function(error) {
		console.log(error);
		//TODO show something went wrong message
	},
	
	/*
	 * Updates the external file to the current value of the script (local->external)
	 */
	updateToExternal: function() {
		
	},
	
	/*
	 * Updates the local copy of the script to what the external file's value is (external->local)
	 */
	updateFromExternal: function() {
		
	},

	setupExternalEditing: function(item) {
		item.scriptEditingId = ++options.settings.scriptEditingId;

		//Send a message to the app to create the item with its current script and name
		this.appPort.postMessage({
			status: 'connected',
			action: 'setupScript',
			name: item.name,
			id: item.scriptEditingId,
			code: item.value.value
		});
	},

	/*
	 * Sets up the external messages sent to go this element's handler
	 */
	setupMessageHandler: function() {
		var _this = this;
		chrome.runtime.onConnectExternal.addListener(function (port) {
			console.log(port);
			if (port.sender.id === 'obnfehdnkjmbijebdllfcnccllcfceli') {
				port.onMessage.addListener(function(msg) {
					_this.messageHandler.apply(_this, [msg]);
				});
			}
		});
	},

	/*
	 * Handles any messages related to the external editing of a script
	 * 
	 * @param {object} msg The message passed along
	 */
	externalEditingMessageHandler: function(msg) {
		console.log(msg);

	},

	updatePromises: function() {
	},

	/*
	 * Takes actions based on what messages are received from the other extension
	 * 
	 * @param {object} msg The message passed along
	 */
	messageHandler: function (msg) {
		switch (msg.status) {
			case 'connected':
				this.externalEditingMessageHandler(msg);
				break;
			case 'ping':
				this.appPort.postMessage({
					status: 'ping',
					message: 'received'
				});
				break;
		}
	},

	/*
	 * Tries to establish a connection to the app (if installed)
	 */
	establishConnection: function () {
		//TODO Change ID
		var _this = this;
		this.appPort = chrome.runtime.connect('gjmgdmomggpaiecllfmfgbbfhnlpbpic'); //gbfbinhlfpjckadedmfinepfioodgcll');
		this.connection.status = 'connecting';
		this.connection.stage = 0;
		new Promise(function(resolve) {
			function promiseListener(msg) {
				console.log('msged', msg);
				if (msg.status === 'connecting' && msg.stage === 1 && msg.message === 'hey') {
					_this.appPort.onMessage.removeListener(promiseListener);
					resolve();
				}
			}

			_this.appPort.onMessage.addListener(promiseListener);
			_this.appPort.onMessage.addListener(function(msg) {
				_this.messageHandler.apply(_this, [msg]);
			});

			console.log('posting;');
			_this.appPort.postMessage({
				status: 'connecting',
				message: 'hi',
				stage: 0
			});
			

		}).then(function() {
			_this.connection.stage = 2; //We have sent confirmation that we are there
			_this.appPort.postMessage({
				status: 'connecting',
				message: 'hello',
				stage: 2
			});

			//Connection is now done
			_this.connection.connected = true;
			_this.connection.state = 'connected';
			console.log('connected');
			//TODO Move and change this
			_this.setupExternalEditing(options.settings.crm[4].children[4]);
		});
	},

	/*
	 * Makes the dialog clear itself after it closes
	 */
	ready: function() {
		window.externalEditor = this;
		this.$.externalEditorDialog.addEventListener('iron-overlay-closed ', this.clear);
		//TODO Move this from ready to on clicking the button
		this.establishConnection();
		this.init();	
	}
})