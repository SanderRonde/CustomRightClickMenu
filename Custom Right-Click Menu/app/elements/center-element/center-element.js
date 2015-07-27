Polymer({
	is: 'center-element',

	properties: {
		/**
		 * The width of the element
		 *
		 * @attribute width
		 * @type Number
		 * @default null
		 */
		width: {
			type: Number,
			value: null,
			observer: 'recalculateStyles'
		},
		/**
		 * The height of the element
		 *
		 * @attribute height
		 * @type Number
		 * @default null
		 */
		height: {
			type: Number,
			value: null,
			observer: 'recalculateStyles'
		},
		/**
		 * Whether the center-element should be fullscreen
		 *
		 * @attribute fullscreen
		 * @type Boolean
		 * @default false
		 */
		fullscreen: {
			type: Boolean,
			value: false,
			observer: 'recalculateStyles'
		},
		/**
		 * Whether the center-element should be an overlay-type fullscreen element
		 * 
		 * @attribute fullscreenoverlay
		 * @type Boolean
		 * @default null
		 */
		fullscreenoverlay: {
			type: Boolean,
			value: false,
			observer: 'recalculateStyles'
		},
		/**
		 * Whether the overlay should be shown
		 * 
		 * @attribute hide
		 * @type Boolean
		 * @default false
		 */
		hide: {
			type: Boolean,
			value: false,
			notify: true
		}
	},

	/*
	 * Recalculates all the styles that should be applied
	 */
	recalculateStyles: function () {
		if (this.fullscreenoverlay) {
			this.style.position = 'fixed';
			this.style.top = this.style.left = 0;
			this.style.zIndex = 9999;
			this.style.width = '100vw';
			this.style.height = '100vh';
		}
		else {
			this.style.position = 'static';
			this.style.top = this.style.left = 'auto';
			this.style.zIndex = 'auto';
			if (this.fullscreen) {
				this.style.width = '100%';
				this.style.height = '100%';
			}
			else {
				if (this.width) {
					this.style.width = this.width;
				}
				if (this.height) {
					this.style.height = this.height;
				}
			}
		}
	},

	ready: function () {
		this.recalculateStyles();
	}
});