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
	 * The choose-script show animation for the main div
	 * 
	 * @attribute dialogMainDivAnimationShow
	 * @type Object
	 * @default null
	 */
	dialogMainDivAnimationShow: null,

	/*
	 * The choose-script hide animation for the main div
	 * 
	 * @attribute dialogMainDivAnimationHide
	 * @type Object
	 * @default null
	 */
	dialogMainDivAnimationHide: null,

	/*
	 * The choose-script show animation for the comparison div
	 * 
	 * @attribute dialogComparisonDivAnimationShow
	 * @type Object
	 * @default null
	 */
	dialogComparisonDivAnimationShow: null,

	/*
	 * The choose-script hide animation for the comparison div
	 * 
	 * @attribute dialogComparisonDivAnimationHide
	 * @type Object
	 * @default null
	 */
	dialogComparisonDivAnimationHide: null,

	/*
	 * The animation for expanding the dialog
	 * 
	 * @attribute dialogExpansionAnimation
	 * @type Object
	 * @default null
	 */
	dialogExpansionAnimation: null,

	/*
	 * The animation for contracting the dialog
	 * 
	 * @attribute dialogContractionAniation
	 * @type Object
	 * @default null
	 */
	dialogContractionAniation: null,

	/*
	 * Whether the chooseScript animation is showing the comparison dialog
	 * 
	 * @attribute chooseScriptShowingComparison
	 * @type Boolean
	 * @default true
	 */
	chooseScriptShowingComparison: true,

	/*
	 * The CodeMirror editor used to merge your code
	 * 
	 * @attribute editor
	 * @type Object
	 * @default null
	 */
	editor: null,

	/*
	 * The animation that fades in the editor
	 * 
	 * @attribute editorFadeInAnimation
	 * @type Object
	 * @default null
	 */
	editorFadeInAnimation: null,

	/*
	 * The style properties of the dialog before expanding
	 * 
	 * @attribute dialogStyleProperties
	 * @type Object
	 * @default {}
	 */
	dialogStyleProperties: {},
	
	/*
	 * Initialize for use
	 */
	init: function() {
		window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
		window.doc.externalEditorDialogTrigger.classList.remove('disabled');
	},
	
	/*
	 * Notifies the user if something went wrong
	 *
	 * @param {string} error What went wrong
	 */
	errorHandler: function () {
		window.doc.externalEditorErrorToast.show();
	},

	postMessage: function(msg) {
		try {
			this.appPort.postMessage(msg);
		} catch (e) {
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
			window.scriptEdit.newSettings.value.value = msg.code;
			window.scriptEdit.editor.setValue(msg.code);
		}
	},

	cancelOpenFiles: function () {
		console.log('called');
		window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
		window.doc.externalEditorDialogTrigger.classList.remove('disabled');

		try {
			this.appPort.postMessage({
				status: 'connected',
				action: 'disconnect'
			});
		} catch (e) { }
		this.appPort = null;
		window.scriptEdit.reloadEditor();
	},

	createEditingOverlay: function () {
		var _this = this;
		window.doc.externalEditorDialogTrigger.style.color = 'rgb(175, 175, 175)';
		window.doc.externalEditorDialogTrigger.disabled = true;
		window.doc.externalEditorDialogTrigger.classList.add('disabled');
		var $toolsCont = $('<div id="externalEditingTools"></div>');
		$('<div id="externalEditingToolsTitle">Using external editor</div>').appendTo($toolsCont);
		var $cont = $('<div id="externalEditingToolsButtonsCont"></div>').appendTo($toolsCont);

		$('<div id="externalEditingToolsDisconnect">' +
				'<paper-material elevation="1">' +
				'<paper-ripple></paper-ripple>' +
				'<svg height="70" viewBox="0 0 24 24" width="70" xmlns="http://www.w3.org/2000/svg">' +
				'<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>' +
				'<path d="M0 0h24v24H0z" fill="none"/>' +
				'</svg>' +
				'</paper-material>' +
				'<div class="externalEditingToolText">' +
				'Stop' +
				'</div>' +
				'</div>')
			.click(function() {
				console.log('call');
				_this.cancelOpenFiles.apply(_this, []);
			})
			.appendTo($cont);
		$('<div id="externalEditingToolsShowLocation">' +
				'<paper-material elevation="1">' +
				'<paper-ripple></paper-ripple>' +
				'<svg height="70" viewBox="0 0 24 24" width="70" xmlns="http://www.w3.org/2000/svg">' +
				'<path d="M0 0h24v24H0z" fill="none"/>' +
				'<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>' +
				'</svg>' +
				'</paper-material>' +
				'<div class="externalEditingToolText">' +
				'Location' +
				'</div>' +
				'</div>')
			.click(function() {
				//Show location toast
				var location = _this.connection.filePath;
				location = location.split('\\');
				if (typeof location === 'string') {
					location = location.split('/');
				}
				location.pop();
				location.push('');
				location = location.join('/');
				window.doc.externalEditoOpenLocationInBrowser.setAttribute('href', 'file:///' + location);
				window.doc.externalEditorLocationToast.text = 'yolo ' + location;
				window.doc.externalEditorLocationToast.show();
			})
			.appendTo($cont);
		$('<div id="externalEditingToolsCreateNewFile">' +
			'<paper-material elevation="1">' +
			'<paper-ripple></paper-ripple>' +
			'<svg height="70" viewBox="0 0 24 24" width="70" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>' +
			'<path d="M0 0h24v24H0z" fill="none"/>' +
			'</svg>' +
			'</paper-material>' +
			'<div class="externalEditingToolText">' +
			'Move' +
			'</div>' +
			'</div>').appendTo($cont);
		$('<div id="externalEditingToolsUpdate">' +
			'<paper-material elevation="1">' +
			'<paper-ripple></paper-ripple>' +
			'<svg height="70" viewBox="0 0 24 24" width="70" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/>' +
			'</svg>' +
			'</paper-material>' +
			'<div class="externalEditingToolText">' +
			'Refresh' +
			'</div>' +
			'</div>').appendTo($cont);

		console.log($toolsCont);
		$toolsCont.appendTo($(window.scriptEdit.editor.display.wrapper).find('.CodeMirror-scroll'))[0].animate([
			{
				bottom: '-152px',
				right: '-350px'
			}, {
				bottom: 0,
				right: 0
			}
		], {
			duration: 300,
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}).onfinish = function() {
			this.effect.target.style.bottom = 0;
			this.effect.target.style.right = 0;
		};
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
					console.log(msg.path);
					_this.connection.filePath = msg.path;
					options.upload();
					_this.connection.fileConnected = true;
					window.scriptEdit.reloadEditor(true);
					_this.createEditingOverlay();
					_this.appPort.onMessage.removeListener(tempListener);
				}
			}
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
			_this.errorHandler();
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

	appMessageHandler: function(msg) {
		switch (msg.action) {
		case 'chooseScript':
			var _this = this;
			window.doc.externalEditorChooseScript.init(msg.local, msg.external, function (result) {
				console.log(result);
				if (result !== false) {
					window.scriptEdit.newSettings.value.value = result;
					window.scriptEdit.editor.setValue(result);
					_this.appPort.postMessage({
						status: 'connected',
						action: 'chooseScript',
						code: result
					});
				}
			});
			window.doc.externalEditorChooseScript.open();
			break;
		case 'updateFromApp':
			this.updateFromExternal(msg);
			break;
		}
	},

	/*
	 * Takes actions based on what messages are received from the other extension
	 * 
	 * @param {object} msg The message passed along
	 */
	messageHandler: function (msg) {
		switch (msg.status) {
			case 'connected':
				this.appMessageHandler(msg);
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
	establishConnection: function (retry) {
		//TODO Change ID
		var _this = this;
		this.appPort = chrome.runtime.connect('gbfbinhlfpjckadedmfinepfioodgcll'); //gjmgdmomggpaiecllfmfgbbfhnlpbpic');
		this.connection.status = 'connecting';
		this.connection.stage = 0;
		this.connection.fileConnected = false;
		this.connectionPromise = new Promise(function(resolve, reject) {
			function promiseListener(msg) {
				console.log('msged', msg);
				if (msg.status === 'connecting' && msg.stage === 1 && msg.message === 'hey') {
					_this.appPort.onMessage.removeListener(promiseListener);
					resolve(msg);
				}
			}

			if (retry) {
				setTimeout(function() {
					reject();
				}, 5000);
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
		}).catch(function() {
			_this.errorHandler();
		});
	},

	cmLoaded: function () {
		setTimeout(function() {
			window.externalEditor.editor.edit.refresh();
		}, 0);
		var placeHolderRect = window.doc.chooseScriptMergerPlaceholder.getBoundingClientRect();
		window.doc.chooseScriptMergerPlaceholder.style.width = placeHolderRect.width + 'px';
		window.doc.chooseScriptMergerPlaceholder.style.height = placeHolderRect.height + 'px';
		window.doc.chooseScriptMergerPlaceholder.style.position = 'absolute';
		window.doc.chooseScriptmergerContainer.style.display = 'flex';
		if (this.editorFadeInAnimation) {
			this.editorFadeInAnimation.play();
		} else {
			this.editorFadeInAnimation = window.doc.chooseScriptMergerPlaceholder.animate([
				{
					opacity: 1
				}, {
					opacity: 0
				}
			], {
				duration: 350,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			});
			this.editorFadeInAnimation.onfinish = function() {
				window.doc.chooseScriptMergerPlaceholder.style.display = 'none';
				window.doc.chooseScriptMergerPlaceholder.style.position = 'initial';
				window.doc.chooseScriptMergerPlaceholder.style.width = 'auto';
				window.doc.chooseScriptMergerPlaceholder.style.height = 'auto';
			}
		}
	},

	/*
	 * Makes the dialog clear itself after it closes
	 */
	ready: function () {
		var _this = this;
		window.externalEditor = this;
		//TODO Move this from ready to on clicking the button
		this.establishConnection();
		this.init();
		window.onfocus = function() {
			if (_this.connection.fileConnected) {
				//File is connected, ask for an update
				_this.appPort.postMessage({
					status: 'connected',
					action: 'refreshFromApp'
				});
			}
		}
		window.doc.externalEditorChooseScript.init = function(local, file, callback) {
			window.doc.externalEditorChooseScript.local = local;
			window.doc.externalEditorChooseScript.file = file;
			window.doc.externalEditorChooseScript.callback = callback;
			_this.editor = null;
			window.doc.chooseScriptmergerContainer.innerHTML = '';
			document.body.style.overflow = 'auto';
			window.doc.chooseScriptMainDialog.style.position = 'static';
			window.doc.chooseScriptMainDialog.style.display = 'block';
			window.doc.chooseScriptMerger.style.display = 'none';

			if (_this.dialogStyleProperties) {
				window.doc.externalEditorChooseScript.style.width = _this.dialogStyleProperties.width + 'px';
				window.doc.externalEditorChooseScript.style.height = _this.dialogStyleProperties.height + 'px';
				window.doc.externalEditorChooseScript.style.top = _this.dialogStyleProperties.top + 'px';
				window.doc.externalEditorChooseScript.style.left = _this.dialogStyleProperties.left + 'px';
			}
		}
		window.doc.externalEditorTryAgainButton.addEventListener('click', function() {
			_this.establishConnection();
			window.doc.externalEditorErrorToast.hide();
		});
		window.doc.chooseScriptChooseFirst.addEventListener('click', function () {
			if (window.doc.chooseScriptRadioGroup.selected === 'local') {
				window.doc.externalEditorChooseScript.callback(window.doc.externalEditorChooseScript.local);
			} else {
				window.doc.externalEditorChooseScript.callback(window.doc.externalEditorChooseScript.file);
			}
		});
		window.doc.chooseScriptChooseMerge.addEventListener('click', function() {
			window.doc.externalEditorChooseScript.callback(_this.editor.edit.getValue());
		});
		$('.closeChooseScriptDialog').click(function() {
			window.doc.externalEditorChooseScript.callback(false);
		});
		window.doc.chooseScriptMerge.addEventListener('click', function () {
			//Animate the comparison in google-style
			var dialogRect = window.doc.externalEditorChooseScript.getBoundingClientRect();
			var dialogStyle = window.doc.externalEditorChooseScript.style;

			_this.dialogStyleProperties = dialogRect;

			dialogStyle.maxWidth = '100vw';
			dialogStyle.width = dialogRect.width + 'px';
			dialogStyle.height = dialogRect.height + 'px';
			document.body.style.overflow = 'hidden';
			window.doc.chooseScriptMainDialog.style.position = 'absolute';

			if (_this.dialogMainDivAnimationHide) {
				_this.dialogMainDivAnimationHide.play();
			} else {
				_this.dialogMainDivAnimationHide = window.doc.chooseScriptMainDialog.animate([
					{
						marginTop: '20px',
						opacity: 1
					}, {
						marginTop: '100',
						opacity: 0
					}
				], {
					duration: 240,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				});
				_this.dialogMainDivAnimationHide.onfinish = function() {
					window.doc.chooseScriptMainDialog.style.display = 'none';
					window.doc.chooseScriptMainDialog.style.marginTop = 0;
					window.doc.chooseScriptMainDialog.style.opacity = 1;

					if (_this.dialogExpansionAnimation) {
						_this.dialogExpansionAnimation.play();
					} else {
						_this.dialogExpansionAnimation = window.doc.externalEditorChooseScript.animate([
							{
								width: dialogRect.width,
								height: dialogRect.height,
								marginTop: '24px',
								marginLeft: '40px',
								marginBottom: '24px',
								marginRight: '40px',
								top: dialogStyle.top,
								left: dialogStyle.left
							}, {
								width: '100vw',
								height: '100vh',
								marginTop: 0,
								marginLeft: 0,
								marginBottom: 0,
								marginRight: 0,
								top: 0,
								left: 0
							}
						], {
							duration: 400,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						});
						_this.dialogExpansionAnimation.onfinish = function() {
							dialogStyle.width = '100vw';
							dialogStyle.height = '100vh';
							dialogStyle.top = 0;
							dialogStyle.left = 0;
							dialogStyle.margin = 0;

							window.doc.chooseScriptMerger.style.display = 'flex';
							if (_this.dialogComparisonDivAnimationShow) {
								_this.dialogComparisonDivAnimationShow.play();
							} else {
								_this.dialogComparisonDivAnimationShow = window.doc.chooseScriptMerger.animate([
								{
									marginTop: '70px',
									opacity: 0
								}, {
									marginTop: 0,
									opacity: 1
								}], {
									duration: 250,
									esing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
								});
								_this.dialogComparisonDivAnimationShow.onfinish = function() {
									window.doc.chooseScriptMerger.style.marginTop = 0;
									window.doc.chooseScriptMerger.style.opacity = 1;

									if (!_this.editor) {
										setTimeout(function() {
											_this.editor = new window.CodeMirror.MergeView(window.doc.chooseScriptmergerContainer, {
												lineNumbers: true,
												scrollbarStyle: 'simple',
												lineWrapping: true,
												theme: (window.options.settings.editor.theme === 'dark' ? 'dark' : 'default'),
												indentUnit: window.options.settings.editor.tabSize,
												indentWithTabs: window.options.settings.editor.useTabs,
												value: window.doc.externalEditorChooseScript.local,
												origLeft: window.doc.externalEditorChooseScript.local,
												origRight: window.doc.externalEditorChooseScript.file,
												connect: 'connect',
												messageExternal: true
											});
										}, 150);
									}
								}
							}
						};
					}
				};
			}
		});
		window.doc.chooseScriptStopMerging.addEventListener('click', function() {
			if (_this.dialogComparisonDivAnimationHide) {
				_this.dialogComparisonDivAnimationHide.play();
			} else {
				_this.dialogComparisonDivAnimationHide = window.doc.chooseScriptMerger.animate([
					{
						marginTop: 0,
						opacity: 1
					}, {
						marginTop: 70,
						opacity: 0
					}
				], {
					duration: 250,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				});
				_this.dialogComparisonDivAnimationHide.onfinish = function () {
					window.doc.chooseScriptMerger.style.display = 'none';

					if (_this.dialogContractionAniation) {
						_this.dialogContractionAniation.play();
					} else {
						_this.dialogContractionAniation = window.doc.externalEditorChooseScript.animate([
						{
							width: '100vw',
							height: '100vh',
							top: 0,
							left: 0,
							margin: 0
						}, {
								width: _this.dialogStyleProperties.width + 'px',
								height: _this.dialogStyleProperties.height + 'px',
								top: _this.dialogStyleProperties.top + 'px',
								left: _this.dialogStyleProperties.left + 'px',
								margin: '40px 24px'
							}
						], {
							duration: 250,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						});
						_this.dialogContractionAniation.onfinish = function() {
							window.doc.externalEditorChooseScript.style.width = _this.dialogStyleProperties.width + 'px';
							window.doc.externalEditorChooseScript.style.height = _this.dialogStyleProperties.height + 'px';
							window.doc.externalEditorChooseScript.style.top = _this.dialogStyleProperties.top + 'px';
							window.doc.externalEditorChooseScript.style.left = _this.dialogStyleProperties.left + 'px';

							document.body.style.overflow = 'auto';
							window.doc.chooseScriptMainDialog.style.position = 'static';

							window.doc.chooseScriptMainDialog.style.display = 'block';
							if (_this.dialogMainDivAnimationShow) {
								_this.dialogMainDivAnimationShow.play();
							} else {
								_this.dialogMainDivAnimationShow = window.doc.chooseScriptMainDialog.animate([
									{
										marginTop: '100px',
										opacity: 0
									}, {
										marginTop: '20px',
										opacity: 1
									}
								], {
									duration: 250,
									easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
								});
								_this.dialogMainDivAnimationShow.onfinish = function() {
									window.doc.chooseScriptMainDialog.style.marginTop = '20px';
									window.doc.chooseScriptMainDialog.style.opacity = 1;
								};
							};
						}
					}
				};
			}
		});
	}
})