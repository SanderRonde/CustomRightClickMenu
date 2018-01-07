/// <reference path="../../elements.d.ts" />

namespace StylesheetEditElement {
	export const stylesheetEditProperties: {
		item: CRM.StylesheetNode;
	} = {
		item: {
			type: Object,
			value: {},
			notify: true
		}
	} as any;

	export class STE {
		static is: any = 'stylesheet-edit';

		static behaviors: any = [Polymer.NodeEditBehavior, Polymer.CodeEditBehavior];

		static properties = stylesheetEditProperties;

		static editorPlaceHolderAnimation: Animation;

		private static _getExportData(this: NodeEditBehaviorStylesheetInstance): CRM.StylesheetNode {
			const settings = {};
			this.save(null, settings);
			this.$.dropdownMenu.selected = 0;
			return settings as CRM.StylesheetNode;
		};

		static exportStylesheetAsCRM(this: NodeEditBehaviorStylesheetInstance) {
			window.app.editCRM.exportSingleNode(this._getExportData(), 'CRM');
		};

		static exportStylesheetAsUserscript(this: NodeEditBehaviorStylesheetInstance) {
			window.app.editCRM.exportSingleNode(this._getExportData(), 'Userscript');
		};

		static exportStylesheetAsUserstyle(this: NodeEditBehaviorStylesheetInstance) {
			window.app.editCRM.exportSingleNode(this._getExportData(), 'Userstyle');
		};

		static cancelChanges(this: NodeEditBehaviorStylesheetInstance) {
			if (this.fullscreen) {
				this.exitFullScreen();
			}
			window.setTimeout(() => {
				this.finishEditing();
				window.externalEditor.cancelOpenFiles();
				this.active = false;
			}, this.fullscreen ? 500 : 0);
		};

		static saveChanges(this: NodeEditBehaviorStylesheetInstance) {
			this.newSettings.value.stylesheet = this.editorManager.editor.getValue();
			this.newSettings.value.launchMode = this.$.dropdownMenu.selected;
			this.finishEditing();
			window.externalEditor.cancelOpenFiles();
			this.active = false;
		};

		/**
		 * Reloads the editor completely (to apply new settings)
		 */
		static reloadEditor(this: NodeEditBehaviorStylesheetInstance, disable: boolean = false) {
			if (this.editorManager) {
				if (this.editorMode === 'main') {
					this.newSettings.value.stylesheet = this.editorManager.editor.getValue();
				} else {
					try {
						this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
					} catch(e) {
						this.newSettings.value.options = this.editorManager.editor.getValue();
					}
				}
				this.editorManager.destroy();
			}

			let value: string;
			if (this.editorMode === 'main') {
				value = this.newSettings.value.stylesheet;
			} else {
				if (typeof this.newSettings.value.options === 'string') {
					value = this.newSettings.value.options;
				} else {
					value = JSON.stringify(this.newSettings.value.options);
				}
			}
			if (this.fullscreen) {
				this.fullscreenEditorManager.reset();
				const editor = this.fullscreenEditorManager.editor;
				if (!this.fullscreenEditorManager.isDiff(editor)) {
					editor.setValue(value);
				}
			} else {
				this.editorManager.reset();
				const editor = this.editorManager.editor;
				if (!this.editorManager.isDiff(editor)) {
					editor.setValue(value);
				}
			}
		};

		/**
		 * Triggered when the monaco editor has been loaded, fills it with the options and fullscreen element
		 */
		static editorLoaded(this: NodeEditBehaviorStylesheetInstance) {
			const editorManager = this.editorManager;

			editorManager.editor.getDomNode().classList.remove('stylesheet-edit-codeMirror');
			editorManager.editor.getDomNode().classList.add('script-edit-codeMirror');
			editorManager.editor.getDomNode().classList.add('small');

			if (this.fullscreen) {
				this.$.editorFullScreen.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
			}
		};

		/**
		 * Loads the monaco editor
		 */
		private static async _loadEditor(this: NodeEditBehaviorStylesheetInstance, content: string = this.item.value.stylesheet,
			disable: boolean = false) {
			const placeHolder = $(this.$.editor);
			this.editorHeight = placeHolder.height();
			this.editorWidth = placeHolder.width();
			!window.app.settings.editor && (window.app.settings.editor = {
				theme: 'dark',
				zoom: '100',
				keyBindings: {
					goToDef: 'Ctrl-F12',
					rename: 'Ctrl-F2'
				},
				cssUnderlineDisabled: false,
				disabledMetaDataHighlight: false
			});
			this.editorManager = await this.$.editor.create(this.$.editor.EditorMode.CSS_META, {
				value: content,
				language: 'css',
				theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
				wordWrap: 'off',
				fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
				folding: true
			});
			this.editorLoaded();
		};

		static init(this: NodeEditBehaviorStylesheetInstance) {
			this._init();
			this._CEBIinit();
			this.$.dropdownMenu.init();
			this.$.exportMenu.init();
			this.$.exportMenu.$.dropdownSelected.innerText = 'EXPORT AS';
			this.initDropdown();
			this.selectorStateChange(0, this.newSettings.value.launchMode);
			document.body.classList.remove('editingScript');
			document.body.classList.add('editingStylesheet');
			window.stylesheetEdit = this;
			window.externalEditor.init();
			if (window.app.storageLocal.recoverUnsavedData) {
				chrome.storage.local.set({
					editing: {
						val: this.item.value.stylesheet,
						id: this.item.id,
						crmType: window.app.crmType
					}
				});
				this.savingInterval = window.setInterval(() => {
					if (this.active && this.editorManager) {
						//Save
						let val;
						try {
							val = this.editorManager.editor.getValue();
							chrome.storage.local.set({
								editing: {
									val: val,
									id: this.item.id,
									crmType: window.app.crmType
								}
							});
						} catch (e) { }
					} else {
						//Stop this interval
						chrome.storage.local.set({
							editing: false
						});
						window.clearInterval(this.savingInterval);
					}
				}, 5000);
			}
			this.active = true;
			setTimeout(() => {
				this._loadEditor();
			}, 750);
		}

		static changeTabEvent(this: NodeEditBehaviorStylesheetInstance, e: Polymer.ClickEvent) {
			const element = window.app.util.findElementWithClassName(e.path, 'editorTab');

			const isMain = element.classList.contains('mainEditorTab');
			if (isMain && this.editorMode !== 'main') {
				element.classList.remove('optionsEditorTab');
				try {
					this.newSettings.value.options = JSON.parse(this.editorManager.editor.getValue());
				} catch(e) {
					this.newSettings.value.options = this.editorManager.editor.getValue();
				}
				this.hideCodeOptions();
				this.editorMode = 'main';
			} else if (!isMain && this.editorMode === 'main') {
				element.classList.add('optionsEditorTab');
				this.newSettings.value.stylesheet = this.editorManager.editor.getValue();
				this.showCodeOptions();
				this.editorMode = 'options';
			}

			Array.prototype.slice.apply(window.app.shadowRoot.querySelectorAll('.editorTab')).forEach(
				function(tab: HTMLElement) {
					tab.classList.remove('active');
				});
			element.classList.add('active');
		}
	}

	if (window.objectify) {
		window.register(STE);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(STE);
		});
	}
}

type StylesheetEdit = Polymer.El<'stylesheet-edit', typeof StylesheetEditElement.STE & 
	typeof StylesheetEditElement.stylesheetEditProperties>;;