/// <reference path="../elements.d.ts" />

const centerElementProperties: {
	width: string;
	height: string;
	fullscreen: boolean;
	fullscreenoverlay: boolean;
	hide: boolean;
	requestedPermissions: Array<string>;
	otherPermissions: Array<string>;
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
	}
} as any;

type CenterElement = PolymerElement<'center-element', typeof CE & typeof centerElementProperties>;

class CE {
	static is: string = 'center-element';

	static properties = centerElementProperties;

	/*
	 * Recalculates all the styles that should be applied
	 */
	static recalculateStyles(this: CenterElement) {
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

	static ready(this: CenterElement) {
		this.recalculateStyles();
	};
}

Polymer(CE);