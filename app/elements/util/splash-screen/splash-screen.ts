/// <reference path="../../elements.d.ts" />

import { WebComponentI18NManager } from '../../../modules/wclib/build/es/wclib';
import { Polymer } from '../../../../tools/definitions/polymer';

namespace SplashScreenElement {
	export const splashScreenProperties: {
		name: string;
		max: number;
		finished: boolean;
	} = {
		name: {
			type: String,
			value: '',
			notify: true
		},
		max: {
			type: Number,
			value: Infinity
		},
		finished: {
			type: Boolean,
			value: false,
			notify: true,
			observer: '_onFinish'
		}
	} as any;

	export class SS {
		static is: string = 'splash-screen';

		static properties = splashScreenProperties;

		private static _settings: {
			lastReachedProgress: number;
			max: number;
			toReach: number;
			isAnimating: boolean;
			shouldAnimate: boolean;
		};

		static done: Promise<void>;

		static _onFinish(this: SplashScreen) {
			if (this.finished) {
				this.setAttribute('invisible', 'invisible');
			} else {
				this.removeAttribute('invisible');
			}
		}

		private static _animateTo(this: SplashScreen, progress: number, scaleAfter: string) {
			return new Promise((resolve) => {
				window.setTransform(this.$.progressBar, scaleAfter);
				this.async(() => {
					this._settings.lastReachedProgress = progress;
					this._settings.isAnimating = false;
					window.setTransform(this.$.progressBar, scaleAfter);
					resolve(null);
				}, 200);
			});
		}

		private static async _animateLoadingBar(this: SplashScreen, progress: number) {
			const scaleAfter = 'scaleX(' + progress + ')';
			const isAtMax = this._settings.max === this._settings.lastReachedProgress;
			if (isAtMax || this._settings.toReach >= 1) {
				this._animateTo(progress, scaleAfter);
				return;
			}
			if (this._settings.isAnimating) {
				this._settings.toReach = progress;
				this._settings.shouldAnimate = true;
			} else {
				this._settings.isAnimating = true;
				await this._animateTo(progress, scaleAfter);
				this._animateLoadingBar(this._settings.toReach);
			}
		};

		static setProgress(this: SplashScreen, progress: number) {
			this._animateLoadingBar(Math.min(progress, 1.0));
		}

		static finish(this: SplashScreen) {
			this.finished = true;
			this._onFinish();
		}

		private static _onRegistration(this: SplashScreen, registered: number, resolve: (res: void) => void) {
			const progress = Math.round((registered / this._settings.max) * 100) / 100;
			this.setProgress(progress);

			if (registered >= this._settings.max) {
				this.async(async () => {
					await WebComponentI18NManager.langReady;
					this.finish();
					resolve(null);
				}, 500);
			}
		}

		private static _listenForRegistrations(this: SplashScreen) {
			this.done = new Promise<void>((resolve) => {
				let registeredElements = window.Polymer.telemetry.registrations.length;
				const registrationArray = Array.prototype.slice.apply(window.Polymer.telemetry.registrations);
				registrationArray.push = (...items: any[]) => {
					const element = items[0] as HTMLElement;
					Array.prototype.push.call(registrationArray, element);
					registeredElements++;
					this._onRegistration(registeredElements, resolve);
					return registeredElements;
				}

				this._onRegistration(registeredElements, resolve);

				window.Polymer.telemetry.registrations = registrationArray;
			});
		}

		static init(this: SplashScreen, max: number) {
			this._settings.max = max;
			this._listenForRegistrations();
		}

		static ready(this: SplashScreen) {
			this.$.splashContainer.setAttribute('visible', 'visible');
			this._settings = {
				lastReachedProgress: 0,
				toReach: 0,
				isAnimating: false,
				shouldAnimate: false,
				max: Infinity
			};
			window.splashScreen = this;

			if (this.max) {
				this.init(this.max);
			}
		};
	}

	if (window.objectify) {
		window.register(SS);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(SS);
		});
	}
}

export type SplashScreen = Polymer.El<'splash-screen', typeof SplashScreenElement.SS & typeof SplashScreenElement.splashScreenProperties>;