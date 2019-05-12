import { TemplateFn, CHANGE_TYPE } from '../../../modules/wclib/build/es/wclib.js';
import { render } from '../../../modules/lit-html/lit-html.js';

/**
 * Largely taken from polymer/paper-styles/element-styles/paper-material-styles.html (see license)
 */
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

export const PaperMaterialStyles = new TemplateFn<any>((html) => {
	return html`<style>
		:host(.paper-material), .paper-material {
			display: block;
          	position: relative;
		}
		:host(.paper-material[elevation="1"]), .paper-material[elevation="1"] {
			box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
				0 1px 5px 0 rgba(0, 0, 0, 0.12),
				0 3px 1px -2px rgba(0, 0, 0, 0.2);
		}
		:host(.paper-material[elevation="2"]), .paper-material[elevation="2"] {
			box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
				0 1px 10px 0 rgba(0, 0, 0, 0.12),
				0 2px 4px -1px rgba(0, 0, 0, 0.4);
		}
		:host(.paper-material[elevation="3"]), .paper-material[elevation="3"] {
			box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
				0 1px 18px 0 rgba(0, 0, 0, 0.12),
				0 3px 5px -1px rgba(0, 0, 0, 0.4);
		}
		:host(.paper-material[elevation="4"]), .paper-material[elevation="4"] {
			box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
				0 3px 14px 2px rgba(0, 0, 0, 0.12),
				0 5px 5px -3px rgba(0, 0, 0, 0.4);
		}
		:host(.paper-material[elevation="5"]), .paper-material[elevation="5"] {
			box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
				0  6px 30px 5px rgba(0, 0, 0, 0.12),
				0  8px 10px -5px rgba(0, 0, 0, 0.4);
		}
	</style>`;
}, CHANGE_TYPE.NEVER, render);