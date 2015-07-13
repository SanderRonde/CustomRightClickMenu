Polymer({
	is: 'script-edit',

	/**
	* The editor
	* 
	* @attribute editor
	* @type Object
	* @default {}
	*/
	editor: {},

	/**
     * Whether the vertical scrollbar is already shown
     * 
     * @attribute verticalVisible
     * @type Boolean
     * @default false
     */
	verticalVisible: false,

	/**
     * Whether the horizontal scrollbar is already shown
     * 
     * @attribute horizontalVisible
     * @type Boolean
     * @default false
     */
	horizontalVisible: false,

	/**
     * The settings element on the top-right of the editor
     * 
     * @attribute settingsEl
     * @type Element
     * @default null
     */
	settingsEl: null,

	/**
     * The fullscreen element on the bottom-right of the editor
     * 
     * @attribute fullscreenEL
     * @type Element
     * @default null
     */
	fullscreenEL: null,


	clearTrigger: function(e) {
		
	},

	scrollbarsUpdate: function (vertical, horizontal) {
		if (vertical !== this.verticalVisible) {
			if (vertical) {
				this.settingsEl.style.right = '30px';
				this.fullscreenEl.style.right = '28px';
			}
			else {
				this.settingsEl.style.right = '13px';
				this.fullscreenEl.style.right = '11px';
			}
			this.verticalVisible = !this.verticalVisible;
		}
		if (horizontal !== this.horizontalVisible) {
			(horizontal ? this.fullscreenEl.style.bottom = '72px' : this.fullscreenEl.style.bottom = '55px');
			this.horizontalVisible = !this.horizontalVisible;
		}
	},

	cmLoaded: function(element) {
		this.settingsEl = $('<div id="editorSettings"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><path d="M38.86 25.95c.08-.64.14-1.29.14-1.95s-.06-1.31-.14-1.95l4.23-3.31c.38-.3.49-.84.24-1.28l-4-6.93c-.25-.43-.77-.61-1.22-.43l-4.98 2.01c-1.03-.79-2.16-1.46-3.38-1.97L29 4.84c-.09-.47-.5-.84-1-.84h-8c-.5 0-.91.37-.99.84l-.75 5.3c-1.22.51-2.35 1.17-3.38 1.97L9.9 10.1c-.45-.17-.97 0-1.22.43l-4 6.93c-.25.43-.14.97.24 1.28l4.22 3.31C9.06 22.69 9 23.34 9 24s.06 1.31.14 1.95l-4.22 3.31c-.38.3-.49.84-.24 1.28l4 6.93c.25.43.77.61 1.22.43l4.98-2.01c1.03.79 2.16 1.46 3.38 1.97l.75 5.3c.08.47.49.84.99.84h8c.5 0 .91-.37.99-.84l.75-5.3c1.22-.51 2.35-1.17 3.38-1.97l4.98 2.01c.45.17.97 0 1.22-.43l4-6.93c.25-.43.14-.97-.24-1.28l-4.22-3.31zM24 31c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></div>').insertBefore(element.display.sizer)[0];

		this.fullscreenEl = $('<div id="editorFullScreen"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z"/></svg></div>').insertBefore(element.display.sizer)[0];

		element.display.scroller.addEventListener('scroll', function(e) {
			console.log(e);
			console.log('scroll');
			e.stopPropagation();
		});
		this.$.editorPlaceHolder.remove();
	},

	ready: function () {
		window.scriptEdit = this;

		console.log(this.item.value.theme);
		var el = this;
		setTimeout(function() {
			el.editor = new CodeMirror(el.$.editorCont, {
				lineNumbers: true,
				value: el.item.value.value,
				theme: (el.item.value.theme === 'dark' ? 'dark' : 'default'),
				indentUnit: el.item.value.tabSize,
				indentWithTabs: true
			});
		}, 2000);
	}
});