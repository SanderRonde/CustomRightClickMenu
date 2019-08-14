import { ConfigurableWebComponent, Props, PROP_TYPE, config, DefineMetadata } from '../../../modules/wc-lib/build/es/wc-lib.js';
import { SplashScreenSelectorMap } from './splash-screen-querymap';
import { SplashScreenHTML } from './splash-screen.html.js';
import { SplashScreenCSS } from './splash-screen.css.js';
import { setTransform } from '../../../js/shared.js';

@config({
	is: 'splash-screen',
	css: SplashScreenCSS,
	html: SplashScreenHTML
})
export class SplashScreen extends ConfigurableWebComponent<{
	selectors: SplashScreenSelectorMap;
}> {
	private _settings: {
		lastReachedProgress: number;
		max: number;
		toReach: number;
		isAnimating: boolean;
		shouldAnimate: boolean;
	};

	done: Promise<void>;

	props = Props.define(this, {
		reflect: {
			name: {
				type: PROP_TYPE.STRING,
				defaultValue: '',
				coerce: true
			},
			max: {
				type: PROP_TYPE.NUMBER,
				defaultValue: Infinity
			},
			finished: {
				type: PROP_TYPE.BOOL,
				defaultValue: false
			}
		},
		priv: {
			visible: {
				type: PROP_TYPE.BOOL,
				defaultValue: false
			}
		}
	});

	_onFinish() {
		if (this.props.finished) {
			this.setAttribute('invisible', 'invisible');
		} else {
			this.removeAttribute('invisible');
		}
	}

	private _animateTo(progress: number, scaleAfter: string) {
		return new Promise((resolve) => {
			setTransform(this.$.progressBar, scaleAfter);
			window.setTimeout(() => {
				this._settings.lastReachedProgress = progress;
				this._settings.isAnimating = false;
				setTransform(this.$.progressBar, scaleAfter);
				resolve(null);
			}, 200);
		});
	}

	private async _animateLoadingBar(progress: number) {
		const scaleAfter = `scaleX(${progress})`;
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

	setProgress(progress: number) {
		this._animateLoadingBar(Math.min(progress, 1.0));
	}

	finish() {
		this.props.finished = true;
		this._onFinish();
	}

	private _onRegistration(registered: number, resolve: (res: void) => void) {
		const progress = Math.round((registered / this._settings.max) * 100) / 100;
		this.setProgress(progress);

		if (registered >= this._settings.max) {
			window.setTimeout(() => {
				this.finish();
				resolve(null);
			}, 500);
		}
	}

	private _listenForRegistrations() {
		this.done = new Promise<void>((resolve) => {
			this._onRegistration(DefineMetadata.defined, resolve);
			DefineMetadata.onDefine((amount) => {
				this._onRegistration(amount, resolve);
			});
		});
	}

	init(max: number) {
		this._settings.max = max;
		this._listenForRegistrations();
	}

	firstRender() {
		this._settings = {
			lastReachedProgress: 0,
			toReach: 0,
			isAnimating: false,
			shouldAnimate: false,
			max: Infinity
		};
		this.props.visible = true;

		if (this.props.max) {
			this.init(this.props.max);
		}
	};
}