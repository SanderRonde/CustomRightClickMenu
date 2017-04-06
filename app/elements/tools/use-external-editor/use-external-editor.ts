/// <reference path="../../elements.d.ts" />

type UseExternalEditor = Polymer.El<'use-external-editor', typeof UEE>;

type ListeningHTMLElement = HTMLElement & {
	listeners: Array<() => void>
};

interface SetupConnectionMessage {
	status: 'connecting';
	stage: 1;
	message: 'hey';
	connectionId: number;
}

interface PingMessage {
	status: 'ping';
	message: 'hello?';
	connectionId: number;
}

interface ChooseFileMessage {
	status: 'connected';
	action: 'chooseFile';
	local: string;
	external: string;
	connectionId: number;
}

interface SetupExistingFileMessage {
	status: 'connected';
	action: 'setupStylesheet'|'setupScript';
	existed: true;
	path: string;
	connectionId: number;
}

interface SetupNewFileMessage {
	status: 'connected';
	action: 'setupStylesheet'|'setupScript';
	existed: false;
	id: number;
	path: string;
	connectionId: number;
}

interface UpdateFromAppMessage {
	status: 'connected';
	action: 'updateFromApp';
	connectionId: number;
	code: string;
}

type ConnectedEditorMessage = ChooseFileMessage|SetupExistingFileMessage|SetupNewFileMessage|
	UpdateFromAppMessage;

type ExternalEditorMessage = SetupConnectionMessage|PingMessage|ConnectedEditorMessage;

type ChooseFileDialog = PaperDialogBase & {
	init(local: string, file: string, callback: (result: string|false) => void): void;
	local: string;
	file: string;
	callback(result: string|false): void;
};

class UEE {
	static is: string = 'use-external-editor';

	/**
	 * The port at which the app is located
	 */
	private static appPort: chrome.runtime.Port = null;

	/**
	 * The connection to the app and its status
	 */
	private static connection: {
		status: string;
		state?: string;
		connected: boolean;
		id?: number;
		filePath?: string;
		fileConnected?: boolean;
		stage?: number;
	} = {
		status: 'no connection',
		connected: false
	};

	/**
	 * The choose-script show animation for the main div
	 */
	private static dialogMainDivAnimationShow: Animation = null;

	/**
	 * The choose-script hide animation for the main div
	 */
	private static dialogMainDivAnimationHide: Animation = null;

	/**
	 * The choose-script show animation for the comparison div
	 */
	private static dialogComparisonDivAnimationShow: Animation = null;

	/**
	 * The choose-script hide animation for the comparison div
	 */
	private static dialogComparisonDivAnimationHide: Animation = null;

	/**
	 * The animation for expanding the dialog
	 */
	private static dialogExpansionAnimation: Animation = null;

	/**
	 * The animation for contracting the dialog
	 */
	private static dialogContractionAniation: Animation = null;

	/**
	 * The CodeMirror editor used to merge your code
	 */
	private static editor: MergeViewCodeMirrorInstance = null;

	/**
	 * The animation that fades in the editor
	 */
	private static editorFadeInAnimation: Animation = null;

	/**
	 * The style properties of the dialog before expanding
	 */
	private static dialogStyleProperties: ClientRect;

	/**
	 * The node that is currently being edited
	 */
	static editingCRMItem: (CRM.ScriptNode|CRM.StylesheetNode) & {
		file: {
			id: number;
			path: string;
		}
	};

	/**
	 * Initialize for use
	 */
	static init(this: UseExternalEditor) {
		window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
		window.doc.externalEditorDialogTrigger.classList.remove('disabled');
		window.doc.externalEditorDialogTrigger.disabled = false;
	};

	/**
	 * Notifies the user if something went wrong
	 *
	 * @param {string} error - What went wrong
	 */
	private static errorHandler(this: UseExternalEditor, error: string = 'Something went wrong') {
		const toast = window.doc.externalEditorErrorToast;
		toast.text = error;
		toast.show();
	};

	private static postMessage(this: UseExternalEditor, msg: any) {
		try {
			this.appPort.postMessage(msg);
		} catch (e) {
			//Closed connection
		}
	};


	/**
	 * Updates the local copy of the script to what the external file's value is (external->local)
	 */
	private static updateFromExternal(this: UseExternalEditor, msg: UpdateFromAppMessage) {
		if (this.connection.id === msg.connectionId) {
			if (window.scriptEdit && window.scriptEdit.active) {
				window.scriptEdit.editor.setValue(msg.code);
			} else {
				window.stylesheetEdit.newSettings.value.stylesheet = msg.code;
				window.stylesheetEdit.editor.setValue(msg.code);
			}
		}
	};

	static cancelOpenFiles(this: UseExternalEditor) {
		window.doc.externalEditorDialogTrigger.style.color = 'rgb(38, 153, 244)';
		window.doc.externalEditorDialogTrigger.classList.remove('disabled');
		window.doc.externalEditorDialogTrigger.disabled = false;

		try {
			this.appPort.postMessage({
				status: 'connected',
				action: 'disconnect'
			});
		} catch (e) {
		}
		if (window.scriptEdit && window.scriptEdit.active) {
			window.scriptEdit.reloadEditor();
		} else if (window.stylesheetEdit && window.stylesheetEdit.active) {
			window.stylesheetEdit.reloadEditor();
		}
	};

	private static createEditingOverlay(this: UseExternalEditor) {
		var _this = this;
		window.doc.externalEditorDialogTrigger.style.color = 'rgb(175, 175, 175)';
		window.doc.externalEditorDialogTrigger.disabled = true;
		window.doc.externalEditorDialogTrigger.classList.add('disabled');
		var toolsCont = window.app.createElement('div', {
			id: 'externalEditingTools'
		});
		toolsCont.appendChild(window.app.createElement('div', {
			id: 'externalEditingToolsTitle'
		}, ['Using external editor']));
		var cont = toolsCont.appendChild(window.app.createElement('div', {
			id: 'externalEditingToolsButtonsCont'
		}));

		cont.appendChild(window.app.createElement('div', {
			id: 'externalEditingToolsDisconnect'
		}, [
			window.app.createElement('paper-material', {
				props: {
					elevation: '1'
				}
			}, [
				window.app.createElement('paper-ripple', {}),
				window.app.createElement('svg', {
					props: {
						xmlns: 'http://www.w3.org/2000/svg',
						height: '70',
						width: '70',
						viewBox: '0 0 24 24'
					}
				}, [
					window.app.createElement('path', {
						props: {
							d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17' + 
								'.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
						}
					}),
					window.app.createElement('path', {
						props: {
							d: 'M0 0h24v24H0z',
							fill: 'none'
						}
					})
				]),
				window.app.createElement('div', {
					classes: ['externalEditingToolText']
				}, ['Stop'])
			])
		])).addEventListener('click', () => {
			_this.cancelOpenFiles.apply(_this, []);
		});

		cont.appendChild(window.app.createElement('div', {
			id: 'externalEditingToolsShowLocation'
		}, [
			window.app.createElement('paper-material', {
				props: {
					elevation: '1'
				}
			}, [
				window.app.createElement('paper-ripple', {}),
				window.app.createElement('svg', {
					props: {
						height: '70',
						viewBox: '0 0 24 24',
						width: '70',
						xmlns: 'http://www.w3.org/2000/svg'
					}
				}, [
					window.app.createElement('path', {
						props: {
							d: 'M0 0h24v24H0z',
							fill: 'none'
						}
					}),
					window.app.createElement('path', {
						props: {
							d: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 ' + 
								'18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0' + 
								'-1.1-.9-2-2-2zm0 12H4V8h16v10z'
						}
					})
				])
			]),
			window.app.createElement('div', {
				classes: ['externalEditingToolText']
			}, ['Location'])
		])).addEventListener('click', () => {
			//Show location toast
			var location = _this.connection.filePath;
			location = location.replace(/\\/g, '/');
			window.doc.externalEditoOpenLocationInBrowser.setAttribute('href', 'file:///' + location);
			const externalEditorLocationToast = window.doc.externalEditorLocationToast;
			externalEditorLocationToast.text = 'File is located at: ' + location;
			externalEditorLocationToast.show();
		});

		window.app.createElement('div', {
			id: 'externalEditingToolsCreateNewFile'
		}, [
			window.app.createElement('paper-material', {
				props: {
					elevation: '1'
				}
			}, [
				window.app.createElement('paper-ripple', {}),
				window.app.createElement('svg', {
					props: {
						height: '70',
						width: '70',
						xmlns: 'http://www.w3.org/2000/svg',
						viewBox: '0 0 24 24'
					}
				}, [
					window.app.createElement('path', {
						props: {
							d: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1' + 
								'.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6' +
								'-6H6zm7 7V3.5L18.5 9H13z'
						}
					}),
					window.app.createElement('path', {
						props: {
							d: 'M0 0h24v24H0z',
							fill: 'none'
						}
					})
				])
			]),
			window.app.createElement('div', {
				classes: ['externalEditingToolText']
			}, ['Move'])
		]).addEventListener('click', () => {
			_this.postMessage({
				status: 'connected',
				action: 'createNewFile',
				isCss: (!!window.scriptEdit),
				name: _this.editingCRMItem.name
			});
		});

		cont.appendChild(window.app.createElement('div', {
			id: 'externalEditingToolsUpdate'
		}, [
			window.app.createElement('paper-material', {
				props: {
					elevation: '1'
				}
			}, [
				window.app.createElement('paper-ripple', {}),
				window.app.createElement('svg', {
					props: {
						height: '70',
						width: '70',
						xmlns: 'http://www.w3.org/2000/svg',
						viewBox: '0 0 24 24'
					}
				}, [
					window.app.createElement('path', {
						props: {
							d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58' +
								'-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.0' + 
								'8c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6' +
								' 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
						}
					}),
					window.app.createElement('path', {
						props: {
							d: 'M0 0h24v24H0z',
							fill: 'none'
						}
					})
				])
			]),
			window.app.createElement('div', {
				classes: ['externalEditingToolText']
			}, ['Refresh'])
		])).addEventListener('click', () => {
			_this.postMessage({
				status: 'connected',
				action: 'refreshFromApp'
			});
		});

		$((window.scriptEdit && window.scriptEdit.active ?
			window.scriptEdit.editor.display.wrapper :
			window.stylesheetEdit.editor.display.wrapper))
				.find('.CodeMirror-scroll')
		toolsCont.appendTo(
			$((window.scriptEdit && window.scriptEdit.active ? window.scriptEdit.editor.display.wrapper : window.stylesheetEdit.editor.display.wrapper))
				.find('.CodeMirror-scroll'))[0]
				.animate([
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
				}).onfinish = function(this: Animation) {
					this.effect.target.style.bottom = '0';
					this.effect.target.style.right = '0';
				};
	};

	static setupExternalEditing(this: UseExternalEditor) {
		//Send a message to the app to create the item with its current script and name
		var _this = this;
		if (this.connection.connected) {
			var item = this.editingCRMItem;
			var tempListener = function(msg: SetupExistingFileMessage|SetupNewFileMessage) {
				if (msg.status === 'connected' && (msg.action === 'setupScript' || msg.action === 'setupStylesheet') && msg.connectionId === _this.connection.id) {
					if (msg.existed === false) {
						item.file = {
							id: msg.id,
							path: msg.path
						};
					}
					_this.connection.filePath = msg.path;
					window.app.upload();
					_this.connection.fileConnected = true;
					(window.scriptEdit && window.scriptEdit.active ? window.scriptEdit.reloadEditor(true) : window.stylesheetEdit.reloadEditor(true));
					_this.createEditingOverlay();
					_this.appPort.onMessage.removeListener(tempListener);
				}
			};
			this.appPort.onMessage.addListener(tempListener);
			if (item.file) {
				this.appPort.postMessage({
					status: 'connected',
					action: (window.scriptEdit && window.scriptEdit.active ? 'setupScript' : 'setupStylesheet'),
					name: item.name,
					code: (window.scriptEdit && window.scriptEdit.active ? 
						(item as CRM.ScriptNode).value.script : (item as CRM.StylesheetNode).value.stylesheet),
					id: item.file.id
				});
			} else {
				this.appPort.postMessage({
					status: 'connected',
					action: (window.scriptEdit && window.scriptEdit.active ? 'setupScript' : 'setupStylesheet'),
					name: item.name,
					code: (window.scriptEdit && window.scriptEdit.active ? 
						(item as CRM.ScriptNode).value.script : (item as CRM.StylesheetNode).value.stylesheet),
				});
			}
		} else {
			_this.errorHandler('Could not establish connection');
		}
	};

	/**
	 * Sets up the external messages sent to go this element's handler
	 */
	static setupMessageHandler(this: UseExternalEditor) {
		var _this = this;
		chrome.runtime.onConnectExternal.addListener(function(port) {
			if (port.sender.id === 'obnfehdnkjmbijebdllfcnccllcfceli') {
				port.onMessage.addListener(function(msg) {
					_this.messageHandler.apply(_this, [msg]);
				});
			}
		});
	};

	private static appMessageHandler(this: UseExternalEditor, msg: ConnectedEditorMessage) {
		switch (msg.action) {
			case 'chooseFile':
				var _this = this;
				const chooseFileDialog = window.doc.externalEditorChooseFile;
				chooseFileDialog.init(msg.local, msg.external, function(result) {
					if (result !== false) {
						if (window.scriptEdit && window.scriptEdit.active) {
							window.scriptEdit.editor.setValue(result);
						} else {
							window.stylesheetEdit.newSettings.value.stylesheet = result;
							window.stylesheetEdit.editor.setValue(result);
						}
						_this.appPort.postMessage({
							status: 'connected',
							action: 'chooseFile',
							code: result
						});
					} else {
						chooseFileDialog.close();
					}
				});
				chooseFileDialog.open();
				break;
			case 'updateFromApp':
				this.updateFromExternal(msg);
				break;
		}
	};

	/**
	 * Takes actions based on what messages are received from the other extension
	 */
	private static messageHandler(this: UseExternalEditor, msg: ExternalEditorMessage) {
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
	};

	/**
	 * Tries to establish a connection to the app (if installed)
	 */
	private static establishConnection(this: UseExternalEditor, retry: boolean = false) {
		var _this = this;
		if (!this.appPort) {
			this.appPort = chrome.runtime.connect('hkjjmhkhhlmkflpihbikfpcojeofbjgn');
			this.connection.status = 'connecting';
			this.connection.stage = 0;
			this.connection.fileConnected = false;
			(function(resolve, reject) {
				function promiseListener(msg: ExternalEditorMessage) {
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
			}(function(msg: ExternalEditorMessage) {
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
			}, function() {
				_this.errorHandler();
			}));
		}
	};

	static cmLoaded(this: UseExternalEditor) {
		var placeHolderRect = window.doc.chooseFileMergerPlaceholder.getBoundingClientRect();
		window.doc.chooseFileMergerPlaceholder.style.width = placeHolderRect.width + 'px';
		window.doc.chooseFileMergerPlaceholder.style.height = placeHolderRect.height + 'px';
		window.doc.chooseFileMergerPlaceholder.style.position = 'absolute';
		window.doc.chooseFileMergerPlaceholder.style.display = 'flex';
		if (this.editorFadeInAnimation) {
			this.editorFadeInAnimation.play();
		} else {
			this.editorFadeInAnimation = window.doc.chooseFileMergerPlaceholder.animate([
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
				window.doc.chooseFileMergerPlaceholder.style.display = 'none';
				window.doc.chooseFileMergerPlaceholder.style.position = 'initial';
				window.doc.chooseFileMergerPlaceholder.style.width = 'auto';
				window.doc.chooseFileMergerPlaceholder.style.height = 'auto';

				window.doc.chooseFilemergerContainer.style.opacity = '0';
				window.doc.chooseFilemergerContainer.style.display = 'block';
				window.doc.chooseFilemergerContainer.animate([
					{
						opacity: 0
					}, {
						opacity: 1
					}
				], {
					duration: 350,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}).onfinish = function() {
					window.doc.chooseFilemergerContainer.style.opacity = '1';
					window.externalEditor.editor.edit.refresh();
					window.externalEditor.editor.left.orig.refresh();
					window.externalEditor.editor.right.orig.refresh();
				};
			};
		}
	};

	private static showMergeDialog(_this: UseExternalEditor, oldScript: string, newScript: string) {
		//Animate the comparison in
		var dialogRect = window.doc.externalEditorChooseFile.getBoundingClientRect();
		var dialogStyle = window.doc.externalEditorChooseFile.style;

		_this.dialogStyleProperties = dialogRect;

		dialogStyle.maxWidth = '100vw';
		dialogStyle.width = dialogRect.width + 'px';
		dialogStyle.height = dialogRect.height + 'px';
		document.body.style.overflow = 'hidden';
		window.doc.chooseFileMainDialog.style.position = 'absolute';

		if (_this.dialogMainDivAnimationHide) {
			_this.dialogMainDivAnimationHide.play();
		} else {
			_this.dialogMainDivAnimationHide = window.doc.chooseFileMainDialog.animate([
				{
					marginTop: '20px',
					opacity: 1
				}, {
					marginTop: '100px',
					opacity: 0
				}
			], {
				duration: 240,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			});
			_this.dialogMainDivAnimationHide.onfinish = function() {
				window.doc.chooseFileMainDialog.style.display = 'none';
				window.doc.chooseFileMainDialog.style.marginTop = '0';
				window.doc.chooseFileMainDialog.style.opacity = '1';

				if (_this.dialogExpansionAnimation) {
					_this.dialogExpansionAnimation.play();
				} else {
					console.log([
						{
							width: dialogRect.width,
							height: dialogRect.height,
							marginTop: '24px',
							marginLeft: '40px',
							marginBottom: '24px',
							marginRight: '40px',
							top: (dialogStyle.top || '0px'),
							left: (dialogStyle.left || '0px')
						}, {
							width: '100vw',
							height: '100vh',
							marginTop: '0px',
							marginLeft: '0px',
							marginBottom: '0px',
							marginRight: '0px',
							top: '0px',
							left: '0px'
						}
					]);
					_this.dialogExpansionAnimation = window.doc.externalEditorChooseFile.animate([
						{
							width: dialogRect.width,
							height: dialogRect.height,
							marginTop: '24px',
							marginLeft: '40px',
							marginBottom: '24px',
							marginRight: '40px',
							top: (dialogStyle.top || '0px'),
							left: (dialogStyle.left || '0px')
						}, {
							width: '100vw',
							height: '100vh',
							marginTop: '0px',
							marginLeft: '0px',
							marginBottom: '0px',
							marginRight: '0px',
							top: '0px',
							left: '0px'
						}
					], {
						duration: 400,
						easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
					});
					_this.dialogExpansionAnimation.onfinish = function() {
						dialogStyle.width = '100vw';
						dialogStyle.height = '100vh';
						dialogStyle.top = '0';
						dialogStyle.left = '0';
						dialogStyle.margin = '0';

						window.doc.chooseFileMerger.style.display = 'flex';
						if (_this.dialogComparisonDivAnimationShow) {
							_this.dialogComparisonDivAnimationShow.play();
						} else {
							_this.dialogComparisonDivAnimationShow = window.doc.chooseFileMerger.animate([
								{
									marginTop: '70px',
									opacity: 0
								}, {
									marginTop: '0px',
									opacity: 1
								}
							], {
								duration: 250,
								easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
							});
							_this.dialogComparisonDivAnimationShow.onfinish = function() {
								window.doc.chooseFileMerger.style.marginTop = '0';
								window.doc.chooseFileMerger.style.opacity = '1';

								if (!_this.editor) {
									setTimeout(function () {
										_this.editor = new window.CodeMirror.MergeView(window.doc.chooseFilemergerContainer, {
											lineNumbers: true,
											scrollbarStyle: 'simple',
											lineWrapping: true,
											mode: 'javascript',
											foldGutter: true,
											theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
											indentUnit: window.app.settings.editor.tabSize,
											indentWithTabs: window.app.settings.editor.useTabs,
											value: oldScript,
											origLeft: oldScript,
											origRight: newScript,
											connect: 'align',
											messageExternal: true
										});
									}, 150);
								}
							};
						}
					};
				}
			};
		}
	};

	/**
	 * Makes the dialog clear itself after it closes
	 */
	static ready(this: UseExternalEditor) {
		var _this = this;
		window.externalEditor = this;
		this.establishConnection();
		this.init();
		window.onfocus = function() {
			if (_this.connection.fileConnected) {
				//File is connected, ask for an update
				_this.postMessage({
					status: 'connected',
					action: 'refreshFromApp'
				});
			}
		};
		const chooseFileDialog = window.doc.externalEditorChooseFile as ChooseFileDialog;
		chooseFileDialog.init = function (local: string, file: string, callback: (result: string|false) => void) {
			var i;
			var leftErrorButton = window.doc.updateMergeLeftNextError;
			leftErrorButton.listeners = leftErrorButton.listeners || [];
			for (i = 0; i < leftErrorButton.listeners.length; i++) {
				leftErrorButton.removeEventListener('click', leftErrorButton.listeners[i]);
			}
			leftErrorButton.listeners = [];

			var rightErrorButton = window.doc.updateMergeRightNextError;
			rightErrorButton.listeners = rightErrorButton.listeners || [];
			for (i = 0; i < rightErrorButton.listeners.length; i++) {
				rightErrorButton.removeEventListener('click', rightErrorButton.listeners[i]);
			}
			rightErrorButton.listeners = [];

			window.doc.updateMergerCont.style.display = 'none';

			chooseFileDialog.local = local;
			chooseFileDialog.file = file;
			chooseFileDialog.callback = callback;
			_this.editor = null;
			window.doc.chooseFilemergerContainer.innerHTML = '';
			document.body.style.overflow = 'auto';
			window.doc.chooseFileMainDialog.style.position = 'static';
			window.doc.chooseFileMainDialog.style.display = 'block';
			window.doc.chooseFileMerger.style.display = 'none';

			if (_this.dialogStyleProperties) {
				chooseFileDialog.style.width = _this.dialogStyleProperties.width + 'px';
				chooseFileDialog.style.height = _this.dialogStyleProperties.height + 'px';
				chooseFileDialog.style.top = _this.dialogStyleProperties.top + 'px';
				chooseFileDialog.style.left = _this.dialogStyleProperties.left + 'px';
			}
		};
		window.doc.externalEditorTryAgainButton.addEventListener('click', function() {
			_this.establishConnection(true);
			window.doc.externalEditorErrorToast.hide();
		});
		window.doc.chooseFileChooseFirst.addEventListener('click', function() {
			if (window.doc.chooseFileRadioGroup.selected === 'local') {
				chooseFileDialog.callback(chooseFileDialog.local);
			} else {
				chooseFileDialog.callback(chooseFileDialog.file);
			}
		});
		window.doc.chooseFileChooseMerge.addEventListener('click', function() {
			chooseFileDialog.callback(_this.editor.edit.getValue());
		});
		$('.closeChooseFileDialog').click(function() {
			chooseFileDialog.callback(false);
		});
		window.doc.chooseFileMerge.addEventListener('click', function() {
			_this.showMergeDialog(_this, chooseFileDialog.local, chooseFileDialog.file);
		});
		window.doc.chooseFileStopMerging.addEventListener('click', function() {
			if (_this.dialogComparisonDivAnimationHide) {
				_this.dialogComparisonDivAnimationHide.play();
			} else {
				_this.dialogComparisonDivAnimationHide = window.doc.chooseFileMerger.animate([
					{
						marginTop: '0px',
						opacity: 1
					}, {
						marginTop: '70px',
						opacity: 0
					}
				], {
					duration: 250,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				});
				_this.dialogComparisonDivAnimationHide.onfinish = function() {
					window.doc.chooseFileMerger.style.display = 'none';

					if (_this.dialogContractionAniation) {
						_this.dialogContractionAniation.play();
					} else {
						_this.dialogContractionAniation = chooseFileDialog.animate([
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
							chooseFileDialog.style.width = _this.dialogStyleProperties.width + 'px';
							chooseFileDialog.style.height = _this.dialogStyleProperties.height + 'px';
							chooseFileDialog.style.top = _this.dialogStyleProperties.top + 'px';
							chooseFileDialog.style.left = _this.dialogStyleProperties.left + 'px';

							document.body.style.overflow = 'auto';
							window.doc.chooseFileMainDialog.style.position = 'static';

							window.doc.chooseFileMainDialog.style.display = 'block';
							if (_this.dialogMainDivAnimationShow) {
								_this.dialogMainDivAnimationShow.play();
							} else {
								_this.dialogMainDivAnimationShow = window.doc.chooseFileMainDialog.animate([
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
									window.doc.chooseFileMainDialog.style.marginTop = '20px';
									window.doc.chooseFileMainDialog.style.opacity = '1';
								};
							}
						};
					}
				};
			}
		});
	}
}

Polymer(UEE);