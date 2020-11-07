/// <reference path="../../elements.d.ts" />

import { Polymer } from '../../../../tools/definitions/polymer';

namespace CenterElementElement {
	export const centerElementProperties: {
		width: string;
		height: string;
		fill: boolean;
		fullscreenoverlay: boolean;
		hide: boolean;
		requestedPermissions: string[];
		otherPermissions: string[];
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
			observer: 'recalculateStyles',
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
			observer: 'recalculateStyles',
		},
		/**
		 * Whether the center-element should fill its parent
		 *
		 * @attribute fill
		 * @type Boolean
		 * @default false
		 */
		fill: {
			type: Boolean,
			value: false,
			observer: 'recalculateStyles',
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
			observer: 'recalculateStyles',
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
			notify: true,
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
			notify: true,
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
			notify: true,
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
			notify: true,
		},
	} as any;

	export class CE {
		static is: string = 'center-element';

		static properties = centerElementProperties;

		private static _isReady: boolean = false;

		/**
		 * Recalculates all the styles that should be applied
		 */
		static recalculateStyles(this: CenterElement) {
			if (this.nostyle || !this._isReady) {
				return;
			}
			if (this.fullscreenoverlay) {
				this.style.position = 'fixed';
				this.style.top = this.style.left = '0';
				this.style.zIndex = '9999';
				this.style.width = '100vw';
				this.style.height = '100vh';
			} else {
				this.style.position = 'static';
				this.style.top = this.style.left = 'auto';
				this.style.zIndex = 'auto';
				if (this.fill) {
					this.style.width = '100%';
					this.style.height = '100%';
				} else {
					if (this.width) {
						this.style.width = this.width;
					}
					if (this.height) {
						this.style.height = this.height;
					}
				}
			}
		}

		static ready(this: CenterElement) {
			this._isReady = true;
			this.recalculateStyles();
		}
	}

	if (window.objectify) {
		window.register(CE);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(CE);
		});
	}
}

export type CenterElement = Polymer.El<
	'center-element',
	typeof CenterElementElement.CE &
		typeof CenterElementElement.centerElementProperties
>;
