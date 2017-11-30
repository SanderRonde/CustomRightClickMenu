type CodeEditBehaviorScriptInstanceAdditions = ScriptEdit & {
	isScript: true;
};
type CodeEditBehaviorScriptInstance = CodeEditBehavior<CodeEditBehaviorScriptInstanceAdditions>;

type CodeEditBehaviorStylesheetInstanceAdditions = StylesheetEdit & {
	isScript: false;
};
type CodeEditBehaviorStylesheetInstance = CodeEditBehavior<CodeEditBehaviorStylesheetInstanceAdditions>;

type CodeEditBehaviorInstance = NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance;

class CEB {	
	static properties = {};

	/**
	 * An interval to save any work not discarder or saved (say if your browser/pc crashes)
	 */
	static savingInterval: number = 0;

	/**
	 * Whether this dialog is active
	 */
	static active: boolean = false;

	/**
	 * The editor
	 */
	static editorManager: MonacoEditor = null;

	/**
	 * The editor manager for the fullscreen editor
	 */
	static fullscreenEditorManager: MonacoEditor = null;

	/**
	 * Whether the vertical scrollbar is already shown
	 */
	static verticalVisible: boolean = false;

	/**
	 * Whether the horizontal scrollbar is already shown
	 */
	static horizontalVisible: boolean = false;

	/**
	 * The settings element on the top-right of the editor
	 */
	static settingsEl: HTMLElement = null;

	/**
	 * The container of the fullscreen and settings buttons
	 */
	static buttonsContainer: HTMLElement = null;

	/**
	 * The editor's starting height
	 */
	static editorHeight: number = 0;

	/**
	 * The editor's starting width
	 */
	static editorWidth: number = 0;

	/**
	 * Whether to show the trigger editing section
	 */
	static showTriggers: boolean = false;

	/**
	 * Whether to show the section that allows you to choose on which content to show this
	 */
	static showContentTypeChooser: boolean = false;

	/**
	 * Whether the options are shown
	 */
	static optionsShown: boolean = false;

	/**
	 * Whether the editor is in fullscreen mode
	 */
	static fullscreen: boolean = false;

	/**
	 * The editor's settings before going to the settings page
	 */
	static unchangedEditorSettings: CRM.EditorSettings;

	/**
	 * The editor's dimensions before it goes fullscreen
	 */
	static preFullscreenEditorDimensions: {
		width?: string;
		height?: string;
		marginTop?: string;
		marginLeft?: string;
	} = {};

	/**
	 * The mode the editor is in (main or background)
	 */
	static editorMode: 'main'|'background'|'options' = 'main';

	static editorPlaceHolderAnimation: Animation;

	static otherDoc: CodeMirrorDocInstance = null;

	static setThemeWhite(this: NodeEditBehaviorScriptInstance) {
		this.$.editorThemeSettingWhite.classList.add('currentTheme');
		this.$.editorThemeSettingDark.classList.remove('currentTheme');
		window.app.settings.editor.theme = 'white';
		window.app.upload();
	}

	static setThemeDark(this: NodeEditBehaviorScriptInstance) {
		this.$.editorThemeSettingWhite.classList.remove('currentTheme');
		this.$.editorThemeSettingDark.classList.add('currentTheme');
		window.app.settings.editor.theme = 'dark';
		window.app.upload();
	}

	static fontSizeChange(this: NodeEditBehaviorScriptInstance) {
		window.app.settings.editor.zoom = this.$.editorThemeFontSizeInput.value + '';
		window.app.upload();
	}

	static jsLintGlobalsChange(this: NodeEditBehaviorScriptInstance) {
		this.async(() => {
			const globals = this.$.editorJSLintGlobalsInput.value.split(',').map(global => global.trim());
			chrome.storage.local.set({
				jsLintGlobals: globals
			});
			window.app.jsLintGlobals = globals;
		}, 0);
	}

	static finishEditing(this: CodeEditBehaviorInstance) {
		if (window.app.storageLocal.recoverUnsavedData) {
			chrome.storage.local.set({
				editing: null
			});
		}
		window.useOptionsCompletions = false;
		this.hideCodeOptions();
		Array.prototype.slice.apply(this.$$('.editorTab')).forEach(
			function(tab: HTMLElement) {
				tab.classList.remove('active');
			});
		this.$$('.mainEditorTab').classList.add('active');
	};
	
	/**
	 * Inserts given snippet of code into the editor
	 */
	static insertSnippet(__this: CodeEditBehaviorInstance, snippet: string, noReplace: boolean = false) {
		const commands = __this.editorManager.editor.getSelections().map((selection) => {
			const content = noReplace ? snippet : snippet.replace(/%s/g, selection.toString());
			return window.monacoCommands.createReplaceCommand(selection.cloneRange(), content);
		});
		__this.editorManager.editor.executeCommands('snippet', commands);
	};

	
	/**
	 * Pops out only the tools ribbon
	 */
	static popOutToolsRibbon(this: CodeEditBehaviorInstance) {
		window.doc.editorToolsRibbonContainer.animate([
			{
				marginLeft: 0
			}, {
				marginLeft: '-200px'
			}
		], {
			duration: 800,
			easing: 'bez'
		}).onfinish = function (this: Animation) {
			window.doc.editorToolsRibbonContainer.style.marginLeft = '-200px';
			window.doc.editorToolsRibbonContainer.classList.remove('visible');
		};
	};

	/**
	 * Toggles fullscreen mode for the editor
	 */
	static toggleFullScreen(this: CodeEditBehaviorInstance) {
		(this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
	};

	/**
	 * Whether this instance is fullscreen
	 */
	static isFullscreen(this: CodeEditBehaviorInstance) {
		return this.fullscreen;
	}

	/**
	 * Toggles the editor's options
	 */
	static toggleOptions(this: CodeEditBehaviorInstance) {
		(this.optionsShown ? this.hideOptions() : this.showOptions());
	};

	/**
	 * Returns the value of a key binding
	 */
	static getKeyBindingValue(this: CodeEditBehaviorInstance, keyBinding: {
		name: string;
		defaultKey: string;
		storageKey: "goToDef" | "rename";
		fn(cm: CodeMirrorInstance): void;
	}) {
		return (window.app.settings && window.app.settings.editor.keyBindings[keyBinding.storageKey] ||
			keyBinding.defaultKey) || '';
	}

	/**
	 * Triggered when the scrollbars get updated (hidden or showed) and adapts the
	 * icons' positions
	 */
	static scrollbarsUpdate(this: CodeEditBehaviorInstance, vertical: boolean) {
		if (vertical !== this.verticalVisible) {
			if (vertical) {
				this.buttonsContainer.style.right = '29px';
			} else {
				this.buttonsContainer.style.right = '11px';
			}
			this.verticalVisible = !this.verticalVisible;
		}
	};

	static getEditorInstance(this: CodeEditBehaviorInstance): MonacoEditor {
		if (this.item.type === 'script') {
			if (window.scriptEdit.fullscreenEditorManager) {
				return window.scriptEdit.fullscreenEditorManager;
			}
			return window.scriptEdit.editorManager;
		}
		if (window.stylesheetEdit.fullscreenEditorManager) {
			return window.stylesheetEdit.fullscreenEditorManager;
		}
		return window.stylesheetEdit.editorManager;
	}

	static showCodeOptions(this: CodeEditBehaviorInstance) {
		window.useOptionsCompletions = true;
		if (!this.otherDoc) {
			const doc = new window.CodeMirror.Doc(typeof this.item.value.options === 'string' ?
				this.item.value.options : JSON.stringify(this.item.value.options, null, '\t'), {
				name: 'javascript',
				json: true
			});
			this.otherDoc = this.getEditorInstance().swapDoc(doc);
		} else {
			this.otherDoc = this.getEditorInstance().swapDoc(this.otherDoc);
		}
		this.getEditorInstance().performLint();
	}

	static hideCodeOptions(this: CodeEditBehaviorInstance) {
		if (!window.useOptionsCompletions) {
			return;
		}
		window.useOptionsCompletions = false;
		this.otherDoc = this.getEditorInstance().swapDoc(this.otherDoc);
		this.getEditorInstance().performLint();
	}
}

type CodeEditBehaviorBase = Polymer.El<'code-edit-behavior', typeof CEB>;

type CodeEditBehavior<T = CodeEditBehaviorScriptInstanceAdditions|CodeEditBehaviorStylesheetInstanceAdditions> = 
	NodeEditBehavior<CodeEditBehaviorBase & T>;

Polymer.CodeEditBehavior = Polymer.CodeEditBehavior || CEB as CodeEditBehaviorBase;