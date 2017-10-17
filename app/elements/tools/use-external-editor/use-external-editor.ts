/// <reference path="../../elements.d.ts" />

const EXTERNAL_EDITOR_APP_ID = 'hkjjmhkhhlmkflpihbikfpcojeofbjgn';

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
	init(local: string, file: string, callback: (result: string|false) => void, isUpdate?: boolean,
		updateErrors?: {
			parseError?: boolean;
			generalError?: boolean;
			newScript: Array<CursorPosition>;
			oldScript: Array<CursorPosition>;
		}): void;
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

	private static EditingOverlay =  class EditingOverlay {
		private static createToolsCont(): HTMLElement {
			const toolsCont = window.app.util.createElement('div', {
				id: 'externalEditingTools'
			});
			toolsCont.appendChild(window.app.util.createElement('div', {
				id: 'externalEditingToolsTitle'
			}, ['Using external editor']));
			return toolsCont;
		}

		private static createDisconnect(): HTMLElement {
			const el = window.app.util.createElement('div', {
				id: 'externalEditingToolsDisconnect'
			}, [
				window.app.util.createElement('paper-material', {
					props: {
						elevation: '1'
					}
				}, [
					window.app.util.createElement('paper-ripple', {}),
					window.app.util.createElement('svg', {
						props: {
							xmlns: 'http://www.w3.org/2000/svg',
							height: '70',
							width: '70',
							viewBox: '0 0 24 24'
						}
					}, [
						window.app.util.createElement('path', {
							props: {
								d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17' + 
									'.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
							}
						}),
						window.app.util.createElement('path', {
							props: {
								d: 'M0 0h24v24H0z',
								fill: 'none'
							}
						})
					]),
					window.app.util.createElement('div', {
						classes: ['externalEditingToolText']
					}, ['Stop'])
				])
			]);
			el.addEventListener('click', () => {
				this.parent().cancelOpenFiles.apply(this, []);
			});
			return el;
		}

		private static createShowLocation() {
			const el = window.app.util.createElement('div', {
				id: 'externalEditingToolsShowLocation'
			}, [
				window.app.util.createElement('paper-material', {
					props: {
						elevation: '1'
					}
				}, [
					window.app.util.createElement('paper-ripple', {}),
					window.app.util.createElement('svg', {
						props: {
							height: '70',
							viewBox: '0 0 24 24',
							width: '70',
							xmlns: 'http://www.w3.org/2000/svg'
						}
					}, [
						window.app.util.createElement('path', {
							props: {
								d: 'M0 0h24v24H0z',
								fill: 'none'
							}
						}),
						window.app.util.createElement('path', {
							props: {
								d: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 ' + 
									'18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0' + 
									'-1.1-.9-2-2-2zm0 12H4V8h16v10z'
							}
						})
					])
				]),
				window.app.util.createElement('div', {
					classes: ['externalEditingToolText']
				}, ['Location'])
			]);
			el.addEventListener('click', () => {
				//Show location toast
				let location = this.parent().connection.filePath;
				location = location.replace(/\\/g, '/');
				window.doc.externalEditoOpenLocationInBrowser.setAttribute('href', 'file:///' + location);
				const externalEditorLocationToast = window.doc.externalEditorLocationToast;
				externalEditorLocationToast.text = 'File is located at: ' + location;
				externalEditorLocationToast.show();
			});
			return el;
		}

		private static createNewFile() {
			window.app.util.createElement('div', {
				id: 'externalEditingToolsCreateNewFile'
			}, [
				window.app.util.createElement('paper-material', {
					props: {
						elevation: '1'
					}
				}, [
					window.app.util.createElement('paper-ripple', {}),
					window.app.util.createElement('svg', {
						props: {
							height: '70',
							width: '70',
							xmlns: 'http://www.w3.org/2000/svg',
							viewBox: '0 0 24 24'
						}
					}, [
						window.app.util.createElement('path', {
							props: {
								d: 'M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1' + 
									'.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6' +
									'-6H6zm7 7V3.5L18.5 9H13z'
							}
						}),
						window.app.util.createElement('path', {
							props: {
								d: 'M0 0h24v24H0z',
								fill: 'none'
							}
						})
					])
				]),
				window.app.util.createElement('div', {
					classes: ['externalEditingToolText']
				}, ['Move'])
			]).addEventListener('click', () => {
				this.parent().postMessage({
					status: 'connected',
					action: 'createNewFile',
					isCss: (!!window.scriptEdit),
					name: this.parent().editingCRMItem.name
				});
			});
		}

		private static createUpdate() {
			const el = window.app.util.createElement('div', {
				id: 'externalEditingToolsUpdate'
			}, [
				window.app.util.createElement('paper-material', {
					props: {
						elevation: '1'
					}
				}, [
					window.app.util.createElement('paper-ripple', {}),
					window.app.util.createElement('svg', {
						props: {
							height: '70',
							width: '70',
							xmlns: 'http://www.w3.org/2000/svg',
							viewBox: '0 0 24 24'
						}
					}, [
						window.app.util.createElement('path', {
							props: {
								d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58' +
									'-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.0' + 
									'8c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6' +
									' 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
							}
						}),
						window.app.util.createElement('path', {
							props: {
								d: 'M0 0h24v24H0z',
								fill: 'none'
							}
						})
					])
				]),
				window.app.util.createElement('div', {
					classes: ['externalEditingToolText']
				}, ['Refresh'])
			]);
			el.addEventListener('click', () => {
				this.parent().postMessage({
					status: 'connected',
					action: 'refreshFromApp'
				});
			});
			return el;
		}

		private static createCont(toolsCont: HTMLElement) {
			const cont = toolsCont.appendChild(window.app.util.createElement('div', {
				id: 'externalEditingToolsButtonsCont'
			}));
			cont.appendChild(this.createDisconnect())
			cont.appendChild(this.createShowLocation());
			this.createNewFile();
			cont.appendChild(this.createUpdate());
		}

		private static appendWrapper(toolsCont: HTMLElement) {
			$((window.scriptEdit && window.scriptEdit.active ?
			window.scriptEdit.editor.display.wrapper :
			window.stylesheetEdit.editor.display.wrapper))
				.find('.CodeMirror-scroll')[0].appendChild(toolsCont);
		}

		static generateOverlay() {
			const toolsCont = this.createToolsCont();
			this.createCont(toolsCont)
			this.appendWrapper(toolsCont);
		}

		static parent() {
			return window.externalEditor;
		}
	}

	private static createEditingOverlay(this: UseExternalEditor) {
		window.doc.externalEditorDialogTrigger.style.color = 'rgb(175, 175, 175)';
		window.doc.externalEditorDialogTrigger.disabled = true;
		window.doc.externalEditorDialogTrigger.classList.add('disabled');

		this.EditingOverlay.generateOverlay()
				
		$((window.scriptEdit && window.scriptEdit.active ?
			window.scriptEdit.editor.display.wrapper : window.stylesheetEdit.editor.display.wrapper))
				.find('.CodeMirror-scroll')[0]
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
		const _this = this;
		if (this.connection.connected) {
			const item = this.editingCRMItem;
			const tempListener = function (msg: SetupExistingFileMessage | SetupNewFileMessage) {
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
		const _this = this;
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
				const _this = this;
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
		const _this = this;
		if (!this.appPort) {
			this.appPort = chrome.runtime.connect(EXTERNAL_EDITOR_APP_ID);
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
		const placeHolderRect = window.doc.chooseFileMergerPlaceholder.getBoundingClientRect();
		window.doc.chooseFileMergerPlaceholder.style.width = placeHolderRect.width + 'px';
		window.doc.chooseFileMergerPlaceholder.style.height = placeHolderRect.height + 'px';
		window.doc.chooseFileMergerPlaceholder.style.position = 'absolute';
		window.doc.chooseFileMergerPlaceholder.style.display = 'flex';
		this.playIfExists(this.editorFadeInAnimation) ||
			(this.editorFadeInAnimation = window.doc.chooseFileMergerPlaceholder.animate([
				{
					opacity: 1
				}, {
					opacity: 0
				}
			], {
				duration: 350,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}));
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
	};

	static applyProps<T extends {
		[key: string]: string|number;
	}>(source: T, target: any, props: Array<keyof T>) {
		for (let i = 0; i < props.length; i++) {
			target[props[i]] = source[props[i]] + '';
		}
	}

	static doCSSAnimation(element: HTMLElement, [before, after] : [{
		[key: string]: string|number;
	}, {
		[key: string]: string|number;
	}], duration: number, callback?: () => void): Animation {
		const animation = element.animate([before, after], {
			duration,
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		});
		animation.onfinish = () => {
			this.applyProps(after, element.style, Object.getOwnPropertyNames(after));
			callback && callback();	
		};
		return animation;
	}

	static initEditor(_this: UseExternalEditor, oldScript: string, newScript: string) {
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
	}

	private static playIfExists(animation: Animation|void): boolean {
		if (animation) {
			animation.play();
			return true;
		}
		return false;
	}

	static onDialogMainDivAnimationHideEnd(__this: UseExternalEditor, dialogRect: ClientRect, dialogStyle: CSSStyleDeclaration,
		oldScript: string, newScript: string) {
			window.doc.chooseFileMainDialog.style.display = 'none';
			window.doc.chooseFileMainDialog.style.marginTop = '0';
			window.doc.chooseFileMainDialog.style.opacity = '1';

			this.playIfExists(__this.dialogExpansionAnimation) ||
				(__this.dialogExpansionAnimation = __this.doCSSAnimation(window.doc.externalEditorChooseFile, [{
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
				}], 400, () => {
					window.doc.chooseFileMerger.style.display = 'flex';
					this.playIfExists(__this.dialogComparisonDivAnimationShow) || 
						(__this.dialogComparisonDivAnimationShow = __this.doCSSAnimation(window.doc.chooseFileMerger, [{
							marginTop: '70px',
							opacity: 0
						}, {
							marginTop: '0px',
							opacity: 1
						}], 250, () => {
							if (!__this.editor) {
								setTimeout(function () {
									__this.initEditor(__this, oldScript, newScript);
								}, 150);
							}
						}));
				}));
		}

	static showMergeDialog(_this: UseExternalEditor, oldScript: string, newScript: string) {
		//Animate the comparison in
		const dialogRect = window.doc.externalEditorChooseFile.getBoundingClientRect();
		const dialogStyle = window.doc.externalEditorChooseFile.style;

		_this.dialogStyleProperties = dialogRect;

		dialogStyle.maxWidth = '100vw';
		dialogStyle.width = dialogRect.width + 'px';
		dialogStyle.height = dialogRect.height + 'px';
		document.body.style.overflow = 'hidden';
		window.doc.chooseFileMainDialog.style.position = 'absolute';

		_this.playIfExists(_this.dialogMainDivAnimationHide) || 
			(_this.dialogMainDivAnimationHide = window.doc.chooseFileMainDialog.animate([
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
			}));
		_this.dialogMainDivAnimationHide.onfinish = function() {
			_this.onDialogMainDivAnimationHideEnd(_this, dialogRect, dialogStyle, oldScript, newScript)
		};
	};

	static findChildWithClass(this: UseExternalEditor, div: HTMLElement, classToFind: string): HTMLElement {
		for (var i = 0; i < div.children.length; i++) {
			if (div.children[i].classList.contains(classToFind)) {
				return div.children[i] as HTMLElement;
			}
		}
		return null;
	};

	static findChildWithTag(this: UseExternalEditor, div: HTMLElement, tag: string): HTMLElement {
		for (var i = 0; i < div.children.length; i++) {
			if (div.children[i].tagName.toLowerCase() === tag) {
				return div.children[i] as HTMLElement;
			}
		}
		return null;
	};

	static findReverseLineTranslation(_this: UseExternalEditor, line: number, editor: CodeMirrorInstance & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			}
		}) {
		var i;
		var offset = 0;
		var lineDivs = editor.display.lineDiv.children;
		var lineWidget, seperator;
		var lineHeight = _this.findChildWithTag(lineDivs[0] as HTMLElement, 'pre').getBoundingClientRect().height;
		for (i = 0; i < lineDivs.length; i++) {
			if ((lineWidget = _this.findChildWithClass(lineDivs[i] as HTMLElement, 'CodeMirror-linewidget')) &&
				(seperator = _this.findChildWithClass(lineWidget, 'CodeMirror-merge-spacer'))) {
				offset += Math.round(parseInt(seperator.style.height.split('px')[0], 10) / lineHeight);
			}
			if (i + offset >= line) {
				return i;
			}
		}
		return i;
	};

	static containEachother(this: UseExternalEditor, line1: string, line2: string): boolean {
		return !!(line1.indexOf(line2) > -1 ? true : line2.indexOf(line1));
	};

	static generateIncrementFunction(this: UseExternalEditor, errors: Array<CursorPosition>) {
		var len = errors.length;
		return function(index: number) {
			if (++index === len) {
				index = 0;
			}
			return index;
		};
	};

	static generateLineIndexTranslationArray(_this: UseExternalEditor, editor: CodeMirrorInstance & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			}
		}): Array<number> {
		var result = [];

		var offset = 0;
		var lineDivs = editor.display.lineDiv.children;
		var lineWidget, seperator;
		var lineHeight = _this.findChildWithTag(lineDivs[0] as HTMLElement, 'pre').getBoundingClientRect().height;
		for (var i = 0; i < lineDivs.length; i++) {
			if ((lineWidget = _this.findChildWithClass(lineDivs[i] as HTMLElement, 'CodeMirror-linewidget')) &&
				(seperator = _this.findChildWithClass(lineWidget, 'CodeMirror-merge-spacer'))) {
				offset += Math.round(parseInt(seperator.style.height.split('px')[0], 10) / lineHeight);
			}
			result[i] = i + offset;
		}

		return result;
	};


	static generateNextErrorFinder(this: UseExternalEditor, isLeftEditor: boolean, errors: Array<CursorPosition>) {
		var i;
		var _this = this;
		var sideEditor: CodeMirrorInstance & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			}
		} = null;
		var mainEditor: CodeMirrorInstance & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			}
		} = null;
		var errorIndex = 0;
		var sideEditorLineTranslationArray: Array<number>;
		var incrementFunction = _this.generateIncrementFunction(errors);
		return function () {
			if (!sideEditor) {
				mainEditor = window.externalEditor.editor.edit;
				sideEditor = window.externalEditor.editor[(isLeftEditor ? 'left' : 'right')].orig;
				sideEditorLineTranslationArray = _this.generateLineIndexTranslationArray(_this, sideEditor);
			}
			var error = null;

			//For all errors, check if the main editor contains that line at the line it's supposed to contain it,
			//if not, try a different error, else just show the toast
			for (i = errorIndex, errorIndex = incrementFunction(errorIndex) ; i !== errorIndex; errorIndex = incrementFunction(errorIndex)) {
				var sideEditorLine = sideEditorLineTranslationArray[errors[errorIndex].from.line];
				var mainEditorLine = _this.findReverseLineTranslation(_this, sideEditorLine, mainEditor);
				if (_this.containEachother(mainEditor.getLine(mainEditorLine), sideEditor.getLine(errors[errorIndex].from.line))) {
					error = errors[errorIndex];
					break;
				}
			}
			errorIndex = incrementFunction(i);

			if (error) {
				//Scroll cursor to this line
				$('.errorHighlight').each(function(this: HTMLElement) {
					this.classList.remove('errorHighlight');
				});
				mainEditor.markText(error.from, error.to, {
					className: 'errorHighlight',
					clearOnEnter: true,
					inclusiveLeft: false,
					inclusiveRight: false
				});
			} else {
				//No errors were found, show the toast
				window.doc.noErrorsFound.show();
			}
		};
	};

	private static clearElementListeners(element: ListeningHTMLElement) {
		var element = window.doc.updateMergeLeftNextError;
		element.listeners = element.listeners || [];
		for (let i = 0; i < element.listeners.length; i++) {
			element.removeEventListener('click', element.listeners[i]);
		}
		element.listeners = [];
	}

	private static markErrors(errors: Array<CursorPosition>, editor: {
		orig: CodeMirrorInstance & {
			display: HTMLElement & {
				lineDiv: HTMLElement;
				wrapper: HTMLElement;
				sizer: HTMLElement;
			};
		};
	}) {
		for (let i = 0; i < errors.length; i++) {
			editor.orig.markText(errors[i].from, errors[i].to, {
				className: 'updateError',
				inclusiveLeft: false,
				inclusiveRight: false
			});
		}
	}

	private static resetStyles(target: CSSStyleDeclaration, source: ClientRect) {
		target.width = source.width + 'px';
		target.height = source.height + 'px';
		target.top = source.top + 'px';
		target.left = source.left + 'px';
	}

	private static initFileDialogText(isUpdate: boolean, chooseFileDialog: ChooseFileDialog) {
		window.doc.chooseFileCurrentTxt.innerText = (isUpdate ? 'Old' : 'CRM Editor');
		window.doc.chooseFileNewTxt.innerText = (isUpdate ? 'New' : 'File');
		window.doc.chooseFileTitleTxt.innerText = (isUpdate ? 'Change the script to how you want it' : 'Merge the file to how you want it');
		window.doc.chooseFileStopMerging.style.display = (isUpdate ? 'none' : 'block');
		chooseFileDialog.classList[(isUpdate ? 'add' : 'remove')]('updateMerge');
	}

	private static markerFn(_this: UseExternalEditor, data: {
		updateErrors: {
			parseError: boolean;
			newScript: CursorPosition[];
			oldScript: CursorPosition[];
		};
		chooseFileDialog: ChooseFileDialog;
	}) {
		const {
			updateErrors,
			chooseFileDialog
		} = data;
		setTimeout(function() {
			//Mark left part
			_this.markErrors(updateErrors.oldScript, window.externalEditor.editor.left)
			_this.markErrors(updateErrors.oldScript, window.externalEditor.editor.right)
			chooseFileDialog.removeEventListener('iron-overlay-opened', () => {
				_this.markerFn(_this, data);
			});
		}, 2000);
	}

	private static handleUpdateErrors(_this: UseExternalEditor, updateErrors: {
		parseError: boolean;
		newScript: CursorPosition[];
		oldScript: CursorPosition[];
	},
	[leftErrorButton, rightErrorButton, chooseFileDialog]:
	[ListeningHTMLElement, ListeningHTMLElement, ChooseFileDialog]) {
		window.doc.updateMergerCont.style.display = 'block';
		var errorsNumber = (updateErrors.parseError ? '1' : updateErrors.oldScript.length);
		window.doc.updateMergerTxt.innerText = 'A total of ' + errorsNumber + ' errors have occurred in updating this script.';
		if (!updateErrors.parseError) {
			leftErrorButton.style.display = rightErrorButton.style.display = window.doc.updateMergePlaceholderBr.style.display = 'block';
			var listenerLeft = _this.generateNextErrorFinder(true, updateErrors.oldScript);
			var listenerRight = _this.generateNextErrorFinder(false, updateErrors.newScript);
			leftErrorButton.addEventListener('click', listenerLeft);
			rightErrorButton.addEventListener('click', listenerRight);
			leftErrorButton.listeners.push(listenerLeft);
			rightErrorButton.listeners.push(listenerRight);

			chooseFileDialog.addEventListener('iron-overlay-opened', () => {
				_this.markerFn(_this, {
					updateErrors,
					chooseFileDialog
				});
			});
		} else {
			leftErrorButton.style.display = rightErrorButton.style.display = window.doc.updateMergePlaceholderBr.style.display = 'none';
		}
	}

	private static chooseFileDialog(this: UseExternalEditor, chooseFileDialog: ChooseFileDialog): (local: string, file: string, callback: (result: string|false) => void,
		isUpdate?: boolean, updateErrors?: {
			parseError: boolean;
			newScript: Array<CursorPosition>;
			oldScript: Array<CursorPosition>;
		}) => void {
			const _this = this
			return (local, file, callback, isUpdate, updateErrors) => {
				_this.initFileDialogText(isUpdate, chooseFileDialog);

				const leftErrorButton = window.doc.updateMergeLeftNextError
				const rightErrorButton = window.doc.updateMergeRightNextError
				_this.clearElementListeners(leftErrorButton)
				_this.clearElementListeners(rightErrorButton)

				if (updateErrors) {
					_this.handleUpdateErrors(_this, updateErrors, [leftErrorButton, rightErrorButton, chooseFileDialog])
				} else {
					window.doc.updateMergerCont.style.display = 'none';
				}

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
					_this.resetStyles(chooseFileDialog.style, _this.dialogStyleProperties)
				}
			}
		}

	private static stopMerging(this: UseExternalEditor, chooseFileDialog: ChooseFileDialog) {
		const _this = this
		_this.playIfExists(_this.dialogComparisonDivAnimationHide) ||
			(_this.dialogComparisonDivAnimationHide = window.doc.chooseFileMerger.animate([
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
			}));
		_this.dialogComparisonDivAnimationHide.onfinish = function() {
			window.doc.chooseFileMerger.style.display = 'none';

			_this.playIfExists(_this.dialogContractionAniation) || 
				(_this.dialogContractionAniation = _this.doCSSAnimation(chooseFileDialog, [{
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
				}], 250, () => {
					document.body.style.overflow = 'auto';
					window.doc.chooseFileMainDialog.style.position = 'static';

					window.doc.chooseFileMainDialog.style.display = 'block';
					_this.playIfExists(_this.dialogMainDivAnimationShow) || (
						_this.dialogMainDivAnimationShow = _this.doCSSAnimation(window.doc.chooseFileMainDialog, [{
							marginTop: '100px',
							opacity: 0
						}, {
							marginTop: '20px',
							opacity: 1
						}], 250));
				}));
		};
	}

	/**
	 * Makes the dialog clear itself after it closes
	 */
	static ready(this: UseExternalEditor) {
		window.onExists('app', () => {
			const __this = this;
			window.externalEditor = this;
			this.establishConnection();
			this.init();
			window.onfocus = function() {
				if (__this.connection.fileConnected) {
					//File is connected, ask for an update
					__this.postMessage({
						status: 'connected',
						action: 'refreshFromApp'
					});
				}
			};
			const chooseFileDialog = window.doc.externalEditorChooseFile as ChooseFileDialog;
			chooseFileDialog.init = this.chooseFileDialog(chooseFileDialog)
			window.doc.externalEditorTryAgainButton.addEventListener('click', function() {
				__this.establishConnection(true);
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
				chooseFileDialog.callback(__this.editor.edit.getValue());
			});
			$('.closeChooseFileDialog').click(function() {
				chooseFileDialog.callback(false);
			});
			window.doc.chooseFileMerge.addEventListener('click', function() {
				__this.showMergeDialog(__this, chooseFileDialog.local, chooseFileDialog.file);
			});
			window.doc.chooseFileStopMerging.addEventListener('click', function() {
				__this.stopMerging(chooseFileDialog)
			});
		});
	}
}

type UseExternalEditor = Polymer.El<'use-external-editor', typeof UEE>;

if (window.objectify) {
	Polymer(window.objectify(UEE));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(UEE));
	});
}