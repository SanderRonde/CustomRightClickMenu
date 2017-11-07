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
	static editor: CodeMirrorInstance = null;

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
	 * The fullscreen element on the bottom-right of the editor
	 */
	static fullscreenEl: HTMLElement = null;

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
	 * The element that contains the editor's options
	 */
	static editorOptions: HTMLElement = null;

	/**
	 * The settings shadow element which is the circle on options
	 */
	static settingsShadow: HTMLElement = null;

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

	static _updateZoomEl: () => void;

	static _updateTabSizeEl: () => void;

	static editorPlaceHolderAnimation: Animation;

	static otherDoc: CodeMirrorDocInstance = null;

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
	static insertSnippet(_this: CodeEditBehaviorInstance, snippet: string, noReplace: boolean = false) {
		this.editor.doc.replaceSelection(noReplace ?
												snippet :
												snippet.replace('%s', this.editor.doc
													.getSelection())
		);
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
	 * Toggles the editor's options
	 */
	static toggleOptions(this: CodeEditBehaviorInstance) {
		(this.optionsShown ? this.hideOptions() : this.showOptions());
	};

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

	static getCmInstance(this: CodeEditBehaviorInstance): CodeMirrorInstance {
		if (this.item.type === 'script') {
			return window.scriptEdit.editor;
		}
		return window.stylesheetEdit.editor;
	}

	static showCodeOptions(this: CodeEditBehaviorInstance) {
		window.useOptionsCompletions = true;
		if (!this.otherDoc) {
			const doc = new window.CodeMirror.Doc(typeof this.item.value.options === 'string' ?
				this.item.value.options : JSON.stringify(this.item.value.options, null, '\t'), {
				name: 'javascript',
				json: true
			});
			this.otherDoc = this.getCmInstance().swapDoc(doc);
		} else {
			this.otherDoc = this.getCmInstance().swapDoc(this.otherDoc);
		}
		this.getCmInstance().performLint();
	}

	static hideCodeOptions(this: CodeEditBehaviorInstance) {
		if (!window.useOptionsCompletions) {
			return;
		}
		window.useOptionsCompletions = false;
		this.otherDoc = this.getCmInstance().swapDoc(this.otherDoc);
		this.getCmInstance().performLint();
	}
}

type CodeEditBehaviorBase = Polymer.El<'code-edit-behavior', typeof CEB>;

type CodeEditBehavior<T = CodeEditBehaviorScriptInstanceAdditions|CodeEditBehaviorStylesheetInstanceAdditions> = 
	NodeEditBehavior<CodeEditBehaviorBase & T>;

Polymer.CodeEditBehavior = Polymer.CodeEditBehavior || CEB as CodeEditBehaviorBase;