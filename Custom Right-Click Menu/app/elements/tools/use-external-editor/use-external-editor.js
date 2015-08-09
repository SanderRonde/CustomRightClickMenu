Polymer({
	is: 'use-external-editor',
	
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
	 * Initialize for use
	 */
	init: function() {
		
	},
	
	/*
	 * Notifies the user if something went wrong
	 *
	 * @param {string} error What went wrong
	 */
	errorHandler: function (error) {
	//TODO ERROR TOAST
		console.log(error);
		//TODO show something went wrong message
	},

	postMessage: function(msg) {
		try {
			this.appPort.postMessage(msg);
		} catch (e) {
			//Connection is no longer live, show error
			this.errorHandler(e);
			//Close connection
			this.connection.connected = false;
			this.connection.fileConnected = false;
		}
	},


	/*
	 * Updates the local copy of the script to what the external file's value is (external->local)
	 */
	updateFromExternal: function(msg) {
		if (this.connection.id === msg.connectionId) {
			console.log('update');
			window.scriptEdit.newSettings.value = msg.code;
			window.scriptEdit.editor.setValue(msg.code);
		}
	},

	setupExternalEditing: function() {
		//Send a message to the app to create the item with its current script and name
		var _this = this;
		if (this.connection.connected) {
			var item = this.editingCRMItem;
			var tempListener = function(msg) {
				if (msg.status === 'connected' && msg.action === 'setupScript' && msg.connectionId === _this.connection.id) {
					if (!msg.existed) {
						item.file = {
							id: msg.id,
							path: msg.path
						}
					}
					options.upload();
					_this.connection.fileConnected = true;
					_this.appPort.onMessage.removeListener(tempListener);
				}
			}
			console.log(item.name);
			this.appPort.onMessage.addListener(tempListener);
			if (item.file) {
				this.appPort.postMessage({
					status: 'connected',
					action: 'setupScript',
					name: item.name,
					code: item.value.value,
					id: item.file.id
				});
			} else {
				this.appPort.postMessage({
					status: 'connected',
					action: 'setupScript',
					name: item.name,
					code: item.value.value
				});
			}
		} else {
			//We are not connected, tell the user to get the app or retry
			//TODO toast
		}
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
	 * Takes actions based on what messages are received from the other extension
	 * 
	 * @param {object} msg The message passed along
	 */
	messageHandler: function (msg) {
		switch (msg.status) {
			case 'connected':
				if (msg.action === 'updateFromApp') {
					this.updateFromExternal(msg);
				}
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
		this.appPort = chrome.runtime.connect('gbfbinhlfpjckadedmfinepfioodgcll'); //gjmgdmomggpaiecllfmfgbbfhnlpbpic');
		this.connection.status = 'connecting';
		this.connection.stage = 0;
		this.connection.fileConnected = false;
		new Promise(function(resolve) {
			function promiseListener(msg) {
				console.log('msged', msg);
				if (msg.status === 'connecting' && msg.stage === 1 && msg.message === 'hey') {
					_this.appPort.onMessage.removeListener(promiseListener);
					resolve(msg);
				}
			}

			_this.appPort.onMessage.addListener(promiseListener);
			_this.appPort.onMessage.addListener(function(msg) {
				_this.messageHandler.apply(_this, [msg]);
			});

			_this.appPort.postMessage({
				status: 'connecting',
				message: 'hi',
				stage: 0
			});
		}).then(function(msg) {
			_this.connection.stage = 2; //We have sent confirmation that we are there
			_this.appPort.postMessage({
				status: 'connecting',
				message: 'hello',
				stage: 2
			});

			//Connection is now done
			_this.connection.connected = true;
			_this.connection.state = 'connected';
			_this.connection.id = msg.connectionId;
			console.log('connected');
		});
	},

	/*
	 * Makes the dialog clear itself after it closes
	 */
	ready: function() {
		window.externalEditor = this;
		//TODO Move this from ready to on clicking the button
		this.establishConnection();
		this.init();
		window.onfocus = function() {
			if (window.externalEditor.connection.fileConnected) {
				//File is connected, ask for an update
				window.externalEditor.appPort.postMessage({
					status: 'connected',
					action: 'refreshFromApp'
				});
			}
		}
	}
})