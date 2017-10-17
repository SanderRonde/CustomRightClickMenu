/// <reference path="../elements.d.ts" />

const centerElementProperties: {
	width: string;
	height: string;
	fullscreen: boolean;
	fullscreenoverlay: boolean;
	hide: boolean;
	requestedPermissions: Array<string>;
	otherPermissions: Array<string>;
	nostyle: boolean;
} = {
	/**
	 * The width of the element
	 *
	 * @attribute width
	 * @type String
	 * @default null
	 */
	width: {
		type: String,
		value: null,
		observer: 'recalculateStyles'
	},
	/**
	 * The height of the element
	 *
	 * @attribute height
	 * @type String
	 * @default null
	 */
	height: {
		type: String,
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
	},
	/**
	 * The requested permissions, only used by one overlay but it has to be specified here
	 * 
	 * @attribute requestedPermissions
	 * @type Array
	 * @default []
	 */
	requestedPermissions: {
		type: Array,
		value: [],
		notify: true
	},
	/**
	 * The other permissions, only used by one overlay but it has to be specified here
	 * 
	 * @attribute otherPermissions
	 * @type Array
	 * @default []
	 */
	otherPermissions: {
		type: Array,
		value: [],
		notify: true
	},
	/**
	 * Prevent the element from styling itself
	 * 
	 * @attribute nostyle
	 * @type Boolean
	 * @default false
	 */
	nostyle: {
		type: Boolean,
		value: false,
		notify: true
	}
} as any;

class CE {
	static is: string = 'center-element';

	static properties = centerElementProperties;

	private static isReady: boolean = false;

	/**
	 * Recalculates all the styles that should be applied
	 */
	private static recalculateStyles(this: CenterElement) {
		if (this.nostyle || !this.isReady) {
			return;
		}
		if (this.fullscreenoverlay) {
			this.style.position = 'fixed';
			this.style.top = this.style.left = '0';
			this.style.zIndex = '9999';
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
	};

	static show(this: CenterElement) {
		console.log('Showing');
		this.hide = false;
	}

	static close(this: CenterElement) {
		console.log('closing');
		this.hide = true;
	}

	static overrideHideShow(this: CenterElement) {
		const child = this.shadowRoot
			.querySelector('slot')
			.assignedNodes({
				flatten: true
			})
			.filter(n => n.nodeType === Node.ELEMENT_NODE)[0];

		if ('show' in child && 'close' in child) {
			const showable = child as HTMLElement & {
				show(): void;
				close(): void;
				opened?: boolean;
			}
			const originalShow = showable.show;
			const originalClose = showable.close;

			showable.show = () => {
				this.show();
				originalShow();
			}
			showable.close = () => {
				this.close();
				originalClose();
			}

			if ('opened' in showable) {
				if (showable.opened) {
					this.show();
				} else {
					this.close();
				}
			}
		}
	}

	static ready(this: CenterElement) {
		this.isReady = true;
		this.overrideHideShow();
		this.recalculateStyles();
	};
}

type CenterElement = Polymer.El<'center-element', typeof CE & typeof centerElementProperties>;

if (window.objectify) {
	Polymer(window.objectify(CE));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(CE));
	});
}