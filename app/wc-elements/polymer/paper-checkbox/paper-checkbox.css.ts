import { TemplateFn, CHANGE_TYPE } from '../../../modules/wclib/build/es/wclib.js';
import { render } from '../../../modules/lit-html/lit-html.js';
import { PaperCheckbox } from './paper-checkbox.js';

export const PaperCheckboxCSS = new TemplateFn<PaperCheckbox>(function (html) {
	return html`<style>
		:host {
			display: inline-block;
			white-space: nowrap;
			cursor: pointer;
			--calculated-paper-checkbox-size: var(--paper-checkbox-size, 18px);
			/* -1px is a sentinel for the default and is replaced in \`attached\`. */
			--calculated-paper-checkbox-ink-size: var(--paper-checkbox-ink-size, -1px);
			@apply --paper-font-common-base;
			line-height: 0;
			-webkit-tap-highlight-color: transparent;
		}

		:host([hidden]) {
			display: none !important;
		}

		:host(:focus) {
			outline: none;
		}

		.hidden {
			display: none;
		}

		#checkboxContainer {
			display: inline-block;
			position: relative;
			width: var(--calculated-paper-checkbox-size);
			height: var(--calculated-paper-checkbox-size);
			min-width: var(--calculated-paper-checkbox-size);
			margin: var(--paper-checkbox-margin, initial);
			vertical-align: var(--paper-checkbox-vertical-align, middle);
			background-color: var(--paper-checkbox-unchecked-background-color, transparent);
		}

		#ink {
			position: absolute;

			/* Center the ripple in the checkbox by negative offsetting it by
			* (inkWidth - rippleWidth) / 2 */
			top: calc(0px - (var(--calculated-paper-checkbox-ink-size) - var(--calculated-paper-checkbox-size)) / 2);
			left: calc(0px - (var(--calculated-paper-checkbox-ink-size) - var(--calculated-paper-checkbox-size)) / 2);
			width: var(--calculated-paper-checkbox-ink-size);
			height: var(--calculated-paper-checkbox-ink-size);
			color: var(--paper-checkbox-unchecked-ink-color, var(--primary-text-color));
			opacity: 0.6;
			pointer-events: none;
		}

		#ink:dir(rtl) {
			right: calc(0px - (var(--calculated-paper-checkbox-ink-size) - var(--calculated-paper-checkbox-size)) / 2);
			left: auto;
		}

		#ink[checked] {
			color: var(--paper-checkbox-checked-ink-color, var(--primary-color));
		}

		#checkbox {
			position: relative;
			box-sizing: border-box;
			height: 100%;
			border: solid 2px;
			border-color: var(--paper-checkbox-unchecked-color, var(--primary-text-color));
			border-radius: 2px;
			pointer-events: none;
			-webkit-transition: background-color 140ms, border-color 140ms;
			transition: background-color 140ms, border-color 140ms;

			-webkit-transition-duration: var(--paper-checkbox-animation-duration, 140ms);
			transition-duration: var(--paper-checkbox-animation-duration, 140ms);
		}

		/* checkbox checked animations */
		#checkbox.checked #checkmark {
			-webkit-animation: checkmark-expand 140ms ease-out forwards;
			animation: checkmark-expand 140ms ease-out forwards;

			-webkit-animation-duration: var(--paper-checkbox-animation-duration, 140ms);
			animation-duration: var(--paper-checkbox-animation-duration, 140ms);
		}

		@-webkit-keyframes checkmark-expand {
			0% {
			-webkit-transform: scale(0, 0) rotate(45deg);
			}
			100% {
			-webkit-transform: scale(1, 1) rotate(45deg);
			}
		}

		@keyframes checkmark-expand {
			0% {
			transform: scale(0, 0) rotate(45deg);
			}
			100% {
			transform: scale(1, 1) rotate(45deg);
			}
		}

		#checkbox.checked {
			background-color: var(--paper-checkbox-checked-color, var(--primary-color));
			border-color: var(--paper-checkbox-checked-color, var(--primary-color));
		}

		#checkmark {
			position: absolute;
			width: 36%;
			height: 70%;
			border-style: solid;
			border-top: none;
			border-left: none;
			border-right-width: calc(2/15 * var(--calculated-paper-checkbox-size));
			border-bottom-width: calc(2/15 * var(--calculated-paper-checkbox-size));
			border-color: var(--paper-checkbox-checkmark-color, white);
			-webkit-transform-origin: 97% 86%;
			transform-origin: 97% 86%;
			box-sizing: content-box; /* protect against page-level box-sizing */
		}

		#checkmark:dir(rtl) {
			-webkit-transform-origin: 50% 14%;
			transform-origin: 50% 14%;
		}

		/* label */
		#checkboxLabel {
			position: relative;
			display: inline-block;
			vertical-align: middle;
			padding-left: var(--paper-checkbox-label-spacing, 8px);
			white-space: normal;
			line-height: normal;
			color: var(--paper-checkbox-label-color, var(--primary-text-color));
			@apply --paper-checkbox-label;
		}

		:host([checked]) #checkboxLabel {
			color: var(--paper-checkbox-label-checked-color, var(--paper-checkbox-label-color, var(--primary-text-color)));
			@apply --paper-checkbox-label-checked;
		}

		#checkboxLabel:dir(rtl) {
			padding-right: var(--paper-checkbox-label-spacing, 8px);
			padding-left: 0;
		}

		#checkboxLabel[hidden] {
			display: none;
		}

		/* disabled state */

		:host([disabled]) #checkbox {
			opacity: 0.5;
			border-color: var(--paper-checkbox-unchecked-color, var(--primary-text-color));
		}

		:host([disabled][checked]) #checkbox {
			background-color: var(--paper-checkbox-unchecked-color, var(--primary-text-color));
			opacity: 0.5;
		}

		:host([disabled]) #checkboxLabel  {
			opacity: 0.65;
		}

		/* invalid state */
		#checkbox.invalid:not(.checked) {
			border-color: var(--paper-checkbox-error-color, var(--error-color));
		}
	</style>`;
}, CHANGE_TYPE.THEME, render);