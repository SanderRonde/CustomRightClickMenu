export function registerAnimatePolyfill() {
	const animateExists = !!document.createElement('div').animate;
	const animatePolyFill = function (this: HTMLElement, properties: {
		[key: string]: any;
	}[], options: {
		duration?: number;
		easing?: string | 'bez';
		fill?: 'forwards' | 'backwards' | 'both';
	}): Animation {
		if (!properties[1]) {
			var skippedAnimation: Animation = {
				currentTime: null,
				play: function () { },
				reverse: function () { },
				cancel: function () { },
				finish: function () { },
				pause: function () { },
				updatePlaybackRate(_playbackRate: number) { },
				addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) { },
				removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) { },
				dispatchEvent(_event: Event) { return true; },
				effect: null,
				finished: Promise.resolve(skippedAnimation),
				pending: false,
				startTime: Date.now(),
				id: '',
				ready: Promise.resolve(skippedAnimation),
				playState: 'finished',
				playbackRate: 1.0,
				timeline: {
					currentTime: Date.now()
				},
				oncancel: null,
				onfinish: null
			};
			return skippedAnimation;
		}
		const element = this;
		let direction: 'forwards' | 'backwards' = 'forwards';
		const state: {
			isPaused: boolean;
			currentProgress: number;
			msRemaining: number;
			finishedPromise: Promise<Animation>;
			finishPromise: (animation: Animation) => void;
			playbackRate: number;
			playState: 'idle' | 'running' | 'paused' | 'finished';
			iterations: number;
		} = {
			isPaused: false,
			currentProgress: 0,
			msRemaining: 0,
			finishedPromise: null,
			finishPromise: null,
			playbackRate: 1.0,
			playState: 'idle',
			iterations: 0
		};
		var returnVal: Animation = {
			play() {
				state.playState = 'running';
				state.iterations++;
				state.finishedPromise = new Promise<Animation>((resolve) => {
					state.finishPromise = resolve;
				});
				let duration = (options && options.duration) || 500;
				if (state.isPaused) {
					duration = state.msRemaining;
				}
				duration = duration / state.playbackRate;
				$(element).stop().animate(properties[~~(direction === 'forwards')], {
					duration: duration,
					complete() {
						state.playState = 'finished';
						state.isPaused = false;
						state.finishPromise && state.finishPromise(returnVal);
						if (returnVal.onfinish) {
							returnVal.onfinish.apply(returnVal, [{
								currentTime: Date.now(),
								timelineTime: null
							} as any]);
						}
					},
					progress(_animation, progress, remainingMs) {
						state.currentProgress = progress;
						state.msRemaining = remainingMs;
					}
				});
				state.isPaused = false;
			},
			reverse() {
				direction = 'backwards';
				this.play();
			},
			cancel() {
				state.playState = 'idle';
				$(element).stop();
				state.isPaused = false;
				//Reset to start
				const props = properties[~~(direction !== 'forwards')];
				for (const prop in props) {
					element.style[prop as any] = props[prop];
				}
				returnVal.oncancel && returnVal.oncancel.apply(returnVal, [{
					currentTime: Date.now(),
					timelineTime: null
				} as any]);
			},
			finish() {
				state.isPaused = false;
				$(element).stop().animate(properties[~~(direction === 'forwards')], {
					duration: 0,
					complete() {
						state.playState = 'finished';
						state.finishPromise && state.finishPromise(returnVal);
						if (returnVal.onfinish) {
							returnVal.onfinish.apply(returnVal, [{
								currentTime: Date.now(),
								timelineTime: null
							} as any]);
						}
					}
				});
			},
			pause() {
				state.playState = 'paused';
				$(element).stop();
				state.isPaused = true;
			},
			id: '',
			pending: false,
			currentTime: null,
			effect: {
				getTiming(): EffectTiming {
					const duration = ((options && options.duration) || 500) / state.playbackRate;
					return {
						delay: 0,
						direction: direction === 'forwards' ?
							'normal' : 'reverse',
						duration: duration,
						easing: options.easing,
						fill: options.fill
					};
				},
				updateTiming(_timing?: OptionalEffectTiming) {
				},
				getComputedTiming() {
					const duration = ((options && options.duration) || 500) / state.playbackRate;
					return {
						endTime: duration,
						activeDuration: duration,
						localTime: state.playState === 'running' ?
							duration - state.msRemaining : null,
						progress: state.playState === 'running' ?
							state.currentProgress : null,
						currentIteration: state.playState === 'running' ?
							state.iterations : null
					};
				}
			},
			updatePlaybackRate(_playbackRate: number) { },
			addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) { },
			removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) { },
			dispatchEvent(_event: Event) { return true; },
			timeline: {
				currentTime: null
			},
			startTime: Date.now(),
			ready: Promise.resolve(returnVal),
			playbackRate: null,
			playState: null,
			finished: null,
			oncancel: null,
			onfinish: null
		};
		Object.defineProperty(returnVal.timeline, 'currentTime', {
			get() {
				return Date.now();
			}
		});
		Object.defineProperties(returnVal, {
			playbackRate: {
				get() {
					return state.playbackRate;
				}
			},
			playState: {
				get() {
					return state.playState;
				}
			},
			finished: {
				get() {
					return state.finishedPromise;
				}
			}
		});
		$(this).animate(properties[1], options.duration, function () {
			if (returnVal.onfinish) {
				(returnVal.onfinish as any).apply({
					effect: {
						target: element
					}
				});
			}
		});
		return returnVal;
	};
	if (!animateExists) {
		HTMLElement.prototype.animate = animatePolyFill as any;
		HTMLElement.prototype.__isAnimationJqueryPolyfill = true;
	}
}
