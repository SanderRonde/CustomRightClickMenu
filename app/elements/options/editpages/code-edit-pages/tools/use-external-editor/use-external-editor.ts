/// <reference path="../../../../../elements.d.ts" />

import { MonacoEditor } from '../../../monaco-editor/monaco-editor';
import { Polymer } from '../../../../../../../tools/definitions/polymer';

const EXTERNAL_EDITOR_APP_ID = 'hkjjmhkhhlmkflpihbikfpcojeofbjgn';
declare const browserAPI: browserAPI;
declare const BrowserAPI: BrowserAPI;

declare global {
	type ChooseFileDialog = PaperDialogBase & {
		init(local: string, file: string, callback: (result: string|false) => void, isUpdate?: boolean,
			updateErrors?: {
				parseError?: boolean;
				generalError?: boolean;
				newScript: CursorPosition[];
				oldScript: CursorPosition[];
			}): void;
		local: string;
		file: string;
		callback(result: string|false): void;
	};
}

namespace UseExternalEditorElement {
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

	export class UEE {
		static is: string = 'use-external-editor';

		/**
		 * The port at which the app is located
		 */
		private static appPort: _browser.runtime.Port = null;

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
		 * The choose-script hide animation for the main div
		 */
		private static dialogMainDivAnimationHide: Animation = null;

		/**
		 * The choose-script show animation for the comparison div
		 */
		private static dialogComparisonDivAnimationShow: Animation = null;

		/**
		 * The animation for expanding the dialog
		 */
		private static dialogExpansionAnimation: Animation = null;

		/**
		 * The CodeMirror editor used to merge your code
		 */
		private static editorManager: MonacoEditor = null;

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
		static async init(this: UseExternalEditor) {
			await window.onExists('app');
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
					window.scriptEdit.editorManager.setValue(msg.code);
				} else {
					window.stylesheetEdit.newSettings.value.stylesheet = msg.code;
					window.stylesheetEdit.editorManager.setValue(msg.code);
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
			} catch (e) { }
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

			private static createDisconnect() {
				const onDc = {
					fn: () => {}
				}
				const el = window.app.util.createElement('div', {
					id: 'externalEditingToolsDisconnect'
				}, [
					window.app.util.createElement('div', {
						classes: ['paper-material'],
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
					onDc.fn && onDc.fn();
				});
				return {
					el, onDc
				}
			}

			private static createShowLocation() {
				const el = window.app.util.createElement('div', {
					id: 'externalEditingToolsShowLocation'
				}, [
					window.app.util.createElement('div', {
						classes: ['paper-material'],
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
					window.app.util.createElement('div', {
						classes: ['paper-material'],
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
					window.app.util.createElement('div', {
						classes: ['paper-material'],
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
				const { el, onDc } = this.createDisconnect();
				cont.appendChild(el)
				cont.appendChild(this.createShowLocation());
				this.createNewFile();
				cont.appendChild(this.createUpdate());
				return onDc;
			}

			private static appendWrapper(toolsCont: HTMLElement) {
				const editorManager = window.codeEditBehavior.getEditor();
				const editor = editorManager.editor as monaco.editor.IStandaloneCodeEditor|monaco.editor.IDiffEditor;
				if (editorManager.isDiff(editor)) {
					return null;
				}
				const widget = {
					getDomNode() {
						return toolsCont;
					},
					getId() {
						return 'external.editor.overlay';
					},
					getPosition() {
						return {
							preference: monaco.editor.OverlayWidgetPositionPreference.TOP_RIGHT_CORNER
						};
					}
				};
				editor.addOverlayWidget(widget);
				return {
					editor,
					widget
				};
			}

			private static linkDisconnect(onDc: {
				fn: () => void;
			}, editorData: {
				widget: monaco.editor.IOverlayWidget;
				editor: monaco.editor.ICodeEditor;
			}) {
				const { widget, editor } = editorData;
				onDc.fn = () => {
					editor.removeOverlayWidget(widget);
				}
			}

			static generateOverlay() {
				const toolsCont = this.createToolsCont();
				const onDc = this.createCont(toolsCont)
				const editorData = this.appendWrapper(toolsCont);
				this.linkDisconnect(onDc, editorData);
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
		};

		static setupExternalEditing(this: UseExternalEditor) {
			//Send a message to the app to create the item with its current script and name
			const _this = this;

			if (BrowserAPI.getBrowser() !== 'chrome') {
				window.app.util.showToast('This feature is only available in chrome' + 
					' (until google removes chrome apps)');
				return;
			}

			const manager = window.codeEditBehavior.getEditor();
			if (manager.isTextarea(manager.getEditorAsMonaco())) {
				window.app.util.showToast('Please update your chrome (at least chrome 30) to use this feature');
				return;
			}

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
						(window.scriptEdit && window.scriptEdit.active ? window.scriptEdit.reloadEditor() : window.stylesheetEdit.reloadEditor());
						_this.createEditingOverlay();
						_this.appPort.onMessage.removeListener();
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
			browserAPI.runtime.onConnectExternal.addListener((port) => {
				if (port.sender.id === 'obnfehdnkjmbijebdllfcnccllcfceli') {
					port.onMessage.addListener((msg: any) => {
						this.messageHandler(msg);
					});
				}
			});
		};

		private static appMessageHandler(this: UseExternalEditor, msg: ConnectedEditorMessage) {
			switch (msg.action) {
				case 'chooseFile':
					const chooseFileDialog = window.doc.externalEditorChooseFile;
					chooseFileDialog.init(msg.local, msg.external, (result) => {
						if (result !== false) {
							const editor = window.codeEditBehavior.getEditor();
							editor.setValue(result);
							this.appPort.postMessage({
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
		private static establishConnection(this: UseExternalEditor) {
			if (!this.appPort) {
				this.appPort = browserAPI.runtime.connect(EXTERNAL_EDITOR_APP_ID);
				this.connection.status = 'connecting';
				this.connection.stage = 0;
				this.connection.fileConnected = false;
				Promise.race([
					new Promise<ExternalEditorMessage|false>((resolve) => {
						let connected: boolean = false;
						this.appPort.onMessage.addListener((msg: any) => {
							if (!connected && msg.status === 'connecting' && 
								msg.stage === 1 && msg.message === 'hey') {
									resolve(msg);
								}
							this.messageHandler(msg);
						});

						this.appPort.postMessage({
							status: 'connecting',
							message: 'hi',
							stage: 0
						});
					}),
					new Promise<ExternalEditorMessage|false>((resolve) => {
						window.setTimeout(() => {
							resolve(false);
						}, 5000);
					})
				]).then((res) => {
					if (res === false) {
						this.errorHandler();
					} else {
						this.connection.stage = 2; //We have sent confirmation that we are there
						this.appPort.postMessage({
							status: 'connecting',
							message: 'hello',
							stage: 2
						});

						//Connection is now done
						this.connection.connected = true;
						this.connection.state = 'connected';
						this.connection.id = res.connectionId;	
					}
				});
			}
		};

		static applyProps<T extends {
			[key: string]: string|number;
		}>(source: T, target: any, props: (keyof T)[]) {
			for (let i = 0; i < props.length; i++) {
				target[props[i]] = source[props[i]] + '';
			}
		}

		static doCSSAnimation(element: {
			animate: Function;
			style: CSSStyleDeclaration;
		}, [before, after] : [{
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

		static async initEditor(this: UseExternalEditor, oldScript: string, newScript: string) {
			const mode = window.stylesheetEdit && window.stylesheetEdit.active ? 
				window.doc.chooseFileMerger.EditorMode.CSS_META : (
					window.scriptEdit.isTsEnabled() ? 
						window.doc.chooseFileMerger.EditorMode.TS_META :
						window.doc.chooseFileMerger.EditorMode.JS_META
				)
			this.editorManager = await window.doc.chooseFileMerger.createDiff([oldScript, newScript], mode, {
				wordWrap: 'off',
				fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
				folding: true
			});
		}

		private static playIfExists(animation: Animation|void): boolean {
			if (animation && animation.play) {
				animation.play();
				return true;
			}
			return false;
		}

		static onDialogMainDivAnimationHideEnd(this: UseExternalEditor, dialogRect: ClientRect, dialogStyle: CSSStyleDeclaration,
			oldScript: string, newScript: string) {
				window.doc.chooseFileMainDialog.style.display = 'none';
				window.doc.chooseFileMainDialog.style.marginTop = '0';
				window.doc.chooseFileMainDialog.style.opacity = '1';

				this.playIfExists(this.dialogExpansionAnimation) ||
					(this.dialogExpansionAnimation = this.doCSSAnimation(window.doc.externalEditorChooseFile, [{
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
						window.setDisplayFlex(window.doc.chooseFileMerger);
						this.playIfExists(this.dialogComparisonDivAnimationShow) || 
							(this.dialogComparisonDivAnimationShow = this.doCSSAnimation(window.doc.chooseFileMerger, [{
								marginTop: '70px',
								opacity: 0
							}, {
								marginTop: '0px',
								opacity: 1
							}], 250, () => {
								if (!this.editorManager) {
									setTimeout(() => {
										this.initEditor(oldScript, newScript);
									}, 150);
								}
							}));
					}));
			}

		static showMergeDialog(this: UseExternalEditor, oldScript: string, newScript: string) {
			//Animate the comparison in
			const dialogRect = window.doc.externalEditorChooseFile.getBoundingClientRect();
			const dialogStyle = window.doc.externalEditorChooseFile.style;

			this.dialogStyleProperties = dialogRect;

			dialogStyle.maxWidth = '100vw';
			dialogStyle.width = dialogRect.width + 'px';
			dialogStyle.height = dialogRect.height + 'px';
			document.body.style.overflow = 'hidden';
			window.doc.chooseFileMainDialog.style.position = 'absolute';

			this.playIfExists(this.dialogMainDivAnimationHide) || 
				(this.dialogMainDivAnimationHide = window.doc.chooseFileMainDialog.animate([
					{
						marginTop: '20px',
						opacity: '1'
					}, {
						marginTop: '100px',
						opacity: '0'
					}
				], {
					duration: 240,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}));
			this.dialogMainDivAnimationHide.onfinish = () => {
				this.onDialogMainDivAnimationHideEnd(dialogRect, dialogStyle, oldScript, newScript)
			};
		};

		private static resetStyles(target: CSSStyleDeclaration, source: ClientRect) {
			target.width = source.width + 'px';
			target.height = source.height + 'px';
			target.top = source.top + 'px';
			target.left = source.left + 'px';
		}

		private static chooseFileDialog(this: UseExternalEditor, chooseFileDialog: ChooseFileDialog): (local: string, file: string, callback: (result: string|false) => void,
			isUpdate?: boolean, updateErrors?: {
				parseError: boolean;
				newScript: CursorPosition[];
				oldScript: CursorPosition[];
			}) => void {
				const _this = this
				return (local, file, callback) => {
					chooseFileDialog.local = local;
					chooseFileDialog.file = file;
					chooseFileDialog.callback = callback;
					_this.editorManager = null;
					document.body.style.overflow = 'auto';
					window.doc.chooseFileMainDialog.style.position = 'static';
					window.doc.chooseFileMainDialog.style.display = 'block';
					window.doc.chooseFileMerger.destroy();

					if (_this.dialogStyleProperties) {
						_this.resetStyles(chooseFileDialog.style, _this.dialogStyleProperties)
					}
				}
			}

		/**
		 * Makes the dialog clear itself after it closes
		 */
		static async ready(this: UseExternalEditor) {
			window.externalEditor = this;
			window.onfocus = () => {
				if (this.connection.fileConnected) {
					//File is connected, ask for an update
					this.postMessage({
						status: 'connected',
						action: 'refreshFromApp'
					});
				}
			};
			await window.onExists('app');
			const chooseFileDialog = window.doc.externalEditorChooseFile as ChooseFileDialog;
			chooseFileDialog.init = this.chooseFileDialog(chooseFileDialog)
			window.doc.externalEditorTryAgainButton.addEventListener('click', () => {
				this.establishConnection();
				window.doc.externalEditorErrorToast.hide();
			});
			window.doc.chooseFileChooseCRM.addEventListener('click', () => {
				const editor = this.editorManager.editor;
				if (this.editorManager.isDiff(editor)) {
					chooseFileDialog.callback(editor.getModel().original.getValue());
				}
			});
			window.doc.chooseFileChooseDisk.addEventListener('click', () => {
				const editor = this.editorManager.editor;
				if (this.editorManager.isDiff(editor)) {
					chooseFileDialog.callback(editor.getModel().modified.getValue());
				}
			});
			$('.closeChooseFileDialog').click(() => {
				chooseFileDialog.callback(false);
			});
		}
	}

	if (window.register) {
		window.register(UEE);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(UEE);
		});
	}
}

export type UseExternalEditor = Polymer.El<'use-external-editor', typeof UseExternalEditorElement.UEE>;
