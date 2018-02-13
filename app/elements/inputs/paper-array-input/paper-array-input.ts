/// <reference path="../../elements.d.ts" />

namespace PaperArrayInputElement {
	export const paperArrayInputProperties: {
		values: Array<any>;
		max: number;
		title: string;
		type: CRM.OptionArray['items'];
		subtext: string;
	} = {
		values: {
			type: Array,
			value: [],
			notify: true
		},
		max: {
			type: Number,
			value: -1
		},
		title: {
			type: String,
			value: '',
			notify: true
		},
		type: {
			type: String,
			value: 'string'
		},
		subtext: {
			type: String,
			value: ''
		}
	} as any;

	export class PAI {
		static is: string = 'paper-array-input';

		static properties = paperArrayInputProperties;

		static _maxReachedTimeout: number = -1;

		static _hasItems<T extends Array<S>, S>(arr: T): boolean {
			return arr && arr.length > 0;
		}

		static _stringIsSet(str: string): boolean {
			return str && str !== '';
		}

		static saveSettings(this: PaperArrayInput) {
			this.values = Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.arrayInputLine'))
				.map((element: HTMLElement) => {
					return element.querySelector('paper-input').value;
				});
		}

		static addLine(this: PaperArrayInput) {
			this.saveSettings();

			if (this.max !== -1 && (this.values && this.values.length >= this.max)) {
				this.$.maxElementsReachedMessage.classList.add('visible');
				let timer = window.setTimeout(() => {
					if (this._maxReachedTimeout === timer) {
						this.$.maxElementsReachedMessage.classList.remove('visible');
					}
				}, 5000);
				this._maxReachedTimeout = timer;
				return;
			}
			if (!this.values) {
				this.values = [];
			}
			const newVal = JSON.parse(JSON.stringify(this.values));
			newVal.push('');
			this.values = newVal;
			this.notifyPath('values', this.values;)
		}

		static clearLine(this: PaperArrayInput, e: Polymer.ClickEvent) {
			this.async(() => {
				this.saveSettings();
				const iconButton = window.app.util.findElementWithTagname(e.path, 'paper-icon-button');
				this.splice('values', Array.prototype.slice.apply(this.querySelectorAll('.arrayInputLine'))
					.indexOf(iconButton.parentElement.parentElement), 1);
			}, 50);
		}

		static ready(this: PaperArrayInput) {
			this.values = this.values || [];
			if (this.max === undefined) {
				this.max = -1;
			}
		}
	}

	if (window.objectify) {
		window.register(PAI);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(PAI);
		});
	}
}

type PaperArrayInput = Polymer.El<'paper-array-input',
	typeof PaperArrayInputElement.PAI & typeof PaperArrayInputElement.paperArrayInputProperties>;