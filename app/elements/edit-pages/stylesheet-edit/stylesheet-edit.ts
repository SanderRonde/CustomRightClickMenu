/// <reference path="../../elements.d.ts" />

const stylesheetEditProperties: {
	item: StylesheetNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

interface StylesheetEditBehaviorProperties extends NodeEditBehaviorProperties {
	newSettings: Partial<StylesheetNode>;
}

type StylesheetEdit = PolymerElement<'stylesheet-edit', typeof STE & typeof stylesheetEditProperties>;;

class STE {
	static is: any = 'stylesheet-edit';

static behaviors = [Polymer.NodeEditBehavior, Polymer.CodeEditBehavior];

	static properties = stylesheetEditProperties;

	//#region Dialog
	static getExportData(this: NodeEditBehaviorStylesheetInstance): StylesheetNode {
		($('stylesheet-edit #exportMenu paper-menu')[0] as HTMLPaperMenuElement).selected = 0;
		var settings: StylesheetNode = {} as any;
		this.save(null, settings);
		delete settings.id;
		return settings;
	};

	static exportStylesheetAsUserstyle(this: NodeEditBehaviorStylesheetInstance) {
		window.app.editCRM.exportSingleNode(this.getExportData(), 'Userstyle');
	};

	static saveChanges(this: NodeEditBehaviorStylesheetInstance) {
		this.finishEditing();
		window.externalEditor.cancelOpenFiles();
		this.active = false;
	};
	//#endregion



	/**
	 * Reloads the editor completely (to apply new settings)
	 */
	static reloadEditor(this: NodeEditBehaviorStylesheetInstance, disable: boolean = false) {
		if (this.editor) {
			$(this.editor.display.wrapper).remove();
			this.$.editorPlaceholder.style.display = 'flex';
			this.$.editorPlaceholder.style.opacity = '1';
			this.$.editorPlaceholder.style.position = 'absolute';

			const stylesheetLines = [];
			var lines = this.editor.doc.lineCount();
			for (var i = 0; i < lines; i++) {
				stylesheetLines.push(this.editor.doc.getLine(i));
			}
			this.newSettings.value.stylesheet = stylesheetLines.join('\n');
		}
		this.editor = null;

		if (this.fullscreen) {
			this.loadEditor(window.doc.fullscreenEditorHorizontal, this.newSettings.value.stylesheet, disable);
		} else {
			this.loadEditor(this.$.editorCont, this.newSettings.value.stylesheet, disable);
		}
	};

	

	/**
	 * Triggered when the codeMirror editor has been loaded, fills it with the options and fullscreen element
	 */
	static cmLoaded(this: NodeEditBehaviorStylesheetInstance, element: CodeMirror) {
		var _this = this;
		this.editor = element;
		element.refresh();
		element.display.wrapper.classList.remove('script-edit-codeMirror');
		element.display.wrapper.classList.add('stylesheet-edit-codeMirror');
		var $buttonShadow = $('<paper-material id="buttonShadow" elevation="1"></paper-material>').insertBefore($(element.display.sizer).children().first());
		this.buttonsContainer = $('<div id="buttonsContainer"></div>').appendTo($buttonShadow)[0];
		var bubbleCont = $('<div id="bubbleCont"></div>').insertBefore($buttonShadow);
		//The bubble on settings open
		var $shadow = this.settingsShadow = $('<paper-material elevation="5" id="settingsShadow"></paper-material>').appendTo(bubbleCont);
		var $editorOptionsContainer = $('<div id="editorOptionsContainer"></div>').appendTo($shadow);
		this.editorOptions = $('<paper-material id="editorOptions" elevation="5"></paper-material>').appendTo($editorOptionsContainer);
		this.fillEditorOptions();
		this.fullscreenEl = $('<div id="editorFullScreen"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
			_this.toggleFullScreen.apply(_this);
		})[0];
		this.settingsEl = $('<div id="editorSettings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>').appendTo(this.buttonsContainer).click(function () {
			_this.toggleOptions.apply(_this);
		})[0];
		if (element.getOption('readOnly') === 'nocursor') {
			element.display.wrapper.style.backgroundColor = 'rgb(158, 158, 158)';
		}
		if (this.fullscreen) {
			element.display.wrapper.style.height = 'auto';
			this.$.editorPlaceholder.style.display = 'none';
			$buttonShadow[0].style.right = '-1px';
			$buttonShadow[0].style.position = 'absolute';
			this.fullscreenEl.children[0].innerHTML = '<path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z"/>';
		}
		else {
			this.$.editorPlaceholder.style.height = this.editorHeight + 'px';
			this.$.editorPlaceholder.style.width = this.editorWidth + 'px';
			this.$.editorPlaceholder.style.position = 'absolute';
			if (this.editorPlaceHolderAnimation) {
				this.editorPlaceHolderAnimation.play();
			}
			else {
				this.editorPlaceHolderAnimation = this.$.editorPlaceholder.animate([
					{
						opacity: 1
					}, {
						opacity: 0
					}
				], {
					duration: 300,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				});
				this.editorPlaceHolderAnimation.onfinish = function (this: Animation) {
					this.effect.target.style.display = 'none';
				};
			}
		}
	};

	/**
	 * Loads the codeMirror editor
	 */
	static loadEditor(this: NodeEditBehaviorStylesheetInstance, container: HTMLElement, content: string = this.item.value.stylesheet,
			disable: boolean = false) {
		var placeHolder = $(this.$.editorPlaceholder);
		this.editorHeight = placeHolder.height();
		this.editorWidth = placeHolder.width();
		!window.app.settings.editor && (window.app.settings.editor = {
			useTabs: true,
			theme: 'dark',
			zoom: '100',
			tabSize: '4',
			keyBindings: {
				autocomplete: window.scriptEdit.keyBindings[0].defaultKey,
				showType: window.scriptEdit.keyBindings[0].defaultKey,
				showDocs: window.scriptEdit.keyBindings[1].defaultKey,
				goToDef: window.scriptEdit.keyBindings[2].defaultKey,
				jumpBack: window.scriptEdit.keyBindings[3].defaultKey,
				rename: window.scriptEdit.keyBindings[4].defaultKey,
				selectName: window.scriptEdit.keyBindings[5].defaultKey,
			}
		});
		this.editor = window.CodeMirror(container, {
			lineNumbers: true,
			mode: 'css',
			value: content || this.item.value.stylesheet,
			scrollbarStyle: 'simple',
			lineWrapping: true,
			foldGutter: true,
			readOnly: (disable ? 'nocursor' : false),
			theme: (window.app.settings.editor.theme === 'dark' ? 'dark' : 'default'),
			indentUnit: window.app.settings.editor.tabSize,
			indentWithTabs: window.app.settings.editor.useTabs,
			messageStylesheetEdit: true,
			extraKeys: { 'Ctrl-Space': 'autocomplete' },
			gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
			lint: window.CodeMirror.lint.css
		});
	};

	static init(this: NodeEditBehaviorStylesheetInstance) {
		this.isScript = false;

		var _this = this;
		this._init();
		this.$.dropdownMenu.init();
		this.$.exportMenu.init();
		this.$.exportMenu.querySelector('#dropdownSelected').innerHTML = 'EXPORT AS';
		this.initDropdown();
		document.body.classList.remove('editingScript');
		document.body.classList.add('editingStylesheet');
		window.stylesheetEdit = this;
		this.$.editorPlaceholder.style.display = 'flex';
		this.$.editorPlaceholder.style.opacity = '1';
		if (this.editor) {
			this.editor.display.wrapper.remove();
			this.editor = null;
		}
		window.externalEditor.init();
		if (window.app.storageLocal.recoverUnsavedData) {
			chrome.storage.local.set({
				editing: {
					val: this.item.value.stylesheet,
					id: this.item.id,
					crmType: window.app.crmType
				}
			});
			this.savingInterval = window.setInterval(function() {
				if (_this.active && _this.editor) {
					//Save
					var val;
					try {
						val = _this.editor.getValue();
						chrome.storage.local.set({
							editing: {
								val: val,
								id: _this.item.id,
								crmType: window.app.crmType
							}
						});
					} catch (e) { }
				} else {
					//Stop this interval
					chrome.storage.local.set({
						editing: false
					});
					window.clearInterval(_this.savingInterval);
				}
			}, 5000);
		}
		this.active = true;
		setTimeout(function () {
			_this.loadEditor(_this.$.editorCont);
		}, 750);
	}
}

Polymer(STE);