/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import '@polymer/polymer/polymer-legacy.js';
import '@polymer/paper-styles/default-theme.js';

import {PaperCheckedElementBehavior} from '@polymer/paper-behaviors/paper-checked-element-behavior.js';
import {PaperInkyFocusBehaviorImpl} from '@polymer/paper-behaviors/paper-inky-focus-behavior.js';
import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import { ConfigurableWebComponent, config, Props, PROP_TYPE } from '../../../modules/wclib/build/es/wclib';
import { PaperCheckboxCSS } from './paper-checkbox.css';
import { PaperCheckboxHTML } from './paper-checkbox.html';



@config({
	is: 'paper-checkbox',
	css: PaperCheckboxCSS,
	html: PaperCheckboxHTML
})
export class PaperCheckbox extends ConfigurableWebComponent<{
	IDS: PaperCheckboxIDMap;
	CLASSES: PaperCheckboxClassMap;
}, {

}> {
	props = Props.define(this, {
		priv: {
			ariaActiveAttribute: {
				type: PROP_TYPE.STRING,
				value: 'aria-checked'
			}
		},
		reflect: {
			checked: {
				type: PROP_TYPE.BOOL,
				value: false
			},
			invalid: {
				type: PROP_TYPE.BOOL,
				value: false
			}
		}
	});

	mounted() {
		this.setAttribute('role', 'checkbox');
		this.setAttribute('aria-checked', 'false');
		this.setAttribute('tabindex', '0');

		// Wait until styles have resolved to check for the default sentinel.
		// See polymer#4009 for more details.
		var inkSize = this.getComputedStyleValue('--calculated-paper-checkbox-ink-size')
			.trim();
		// If unset, compute and set the default `--paper-checkbox-ink-size`.
		if (inkSize === '-1px') {
			var checkboxSizeText =
				this.getComputedStyleValue('--calculated-paper-checkbox-size')
					.trim();

			var units = 'px';
			var unitsMatches = checkboxSizeText.match(/[A-Za-z]+$/);
			if (unitsMatches !== null) {
				units = unitsMatches[0];
			}

			var checkboxSize = parseFloat(checkboxSizeText);
			var defaultInkSize = (8 / 3) * checkboxSize;

			if (units === 'px') {
				defaultInkSize = Math.floor(defaultInkSize);

				// The checkbox and ripple need to have the same parity so that their
				// centers align.
				if (defaultInkSize % 2 !== checkboxSize % 2) {
				defaultInkSize++;
				}
			}

			this.updateStyles({
				'--paper-checkbox-ink-size': defaultInkSize + units,
			});
		}
	}
	
	  // create ripple inside the checkboxContainer
	_createRipple() {
		this._rippleContainer = this.$.checkboxContainer;
		return PaperInkyFocusBehaviorImpl._createRipple.call(this);
	}
}