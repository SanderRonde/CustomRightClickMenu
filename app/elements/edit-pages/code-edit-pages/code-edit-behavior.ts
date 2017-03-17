type CodeEditBehaviorBase = typeof CEB;

type CodeEditBehaviorIntanceBase = CodeEditBehaviorBase;

type CodeEditBehaviorScriptInstance = CodeEditBehaviorIntanceBase & 
	ScriptEdit & {
		isScript: true;
	}

type CodeEditBehaviorStylesheetInstance = CodeEditBehaviorIntanceBase & 
	StylesheetEdit & {
		isScript: false;
	};

type CodeEditBehavior = NodeEditBehaviorScriptInstance|
	NodeEditBehaviorStylesheetInstance;

type CodeNode = ScriptNode|StylesheetNode;

class CEB {
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
	static editorOptions: JQuery = null;

	/**
	 * The settings shadow element which is the circle on options
	 */
	static settingsShadow: JQuery = null;

	/**
	 * The editor's settings before going to the settings page
	 */
	static unchangedEditorSettings: CRMEditorSettings;

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
	 * Prevent the codemirror editor from signalling again for a while
	 */
	static preventNotification: boolean = false;

	/**
	 * The timeout that resets the preventNotification bool
	 */
	static preventNotificationTimeout: number = null;

	/**
	 * The mode the editor is in (main or background)
	 */
	static editorMode: 'main'|'background'|'options' = 'main';

	static _updateZoomEl: () => void;

	static _updateTabSizeEl: () => void;

	/**
	 * The fullscreen animation
	 */
	static fullscreenAnimation: Animation = null;

	/**
	 * The show options animation player
	 */
	static optionsAnimations: Array<Animation> = [];

	static editorPlaceHolderAnimation: Animation;

	static otherDoc: CodeMirrorDocInstance = null;

	static finishEditing(this: CodeEditBehavior) {
		if (window.app.storageLocal.recoverUnsavedData) {
			chrome.storage.local.set({
				editing: null
			});
		}
	};

		/**
	 * Inserts given snippet of code into the editor
	 */
	static insertSnippet(_this: CodeEditBehavior, snippet: string, noReplace: boolean = false) {
		this.editor.doc.replaceSelection(noReplace ?
												snippet :
												snippet.replace('%s', this.editor.doc
													.getSelection())
		);
	};

	
	/**
	 * Pops out only the tools ribbon
	 */
	static popOutToolsRibbon(this: CodeEditBehavior) {
		window.doc.editorToolsRibbonContainer.animate([
			{
				marginLeft: 0
			}, {
				marginLeft: '-200px'
			}
		], {
			duration: 800,
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}).onfinish = function (this: Animation) {
			this.effect.target.style.marginLeft = '-200px';
			this.effect.target.classList.remove('visible');
		};
	};

		/**
	 * Toggles fullscreen mode for the editor
	 */
	static toggleFullScreen(this: CodeEditBehavior) {
		(this.fullscreen ? this.exitFullScreen() : this.enterFullScreen());
		this.fullscreen = !this.fullscreen;
	};

		/**
	 * Toggles the editor's options
	 */
	static toggleOptions(this: CodeEditBehavior) {
		(this.optionsShown ? this.hideOptions() : this.showOptions());
		this.optionsShown = !this.optionsShown;
	};

	/**
	 * Triggered when the scrollbars get updated (hidden or showed) and adapts the
	 * icons' positions
	 */
	static scrollbarsUpdate(this: CodeEditBehavior, vertical: boolean) {
		if (vertical !== this.verticalVisible) {
			if (vertical) {
				this.buttonsContainer.style.right = '29px';
			} else {
				this.buttonsContainer.style.right = '11px';
			}
			this.verticalVisible = !this.verticalVisible;
		}
	};

	static getCmInstance(this: CodeEditBehavior): CodeMirrorInstance {
		if (this.item.type === 'script') {
			return window.scriptEdit.editor;
		}
		return window.stylesheetEdit.editor;
	}

	static showCodeOptions(this: CodeEditBehavior) {
		window.useOptionsCompletions = true;
		const doc = new window.CodeMirror.Doc(JSON.stringify(this.item.value.options, null, '\t'), {
			name: 'javascript',
			json: true
		});
		this.otherDoc = this.getCmInstance().swapDoc(doc);
		this.getCmInstance().performLint();
	}

	static hideCodeOptions(this: CodeEditBehavior) {
		window.useOptionsCompletions = false;
	}
}

Polymer.CodeEditBehavior = CEB as CodeEditBehavior;