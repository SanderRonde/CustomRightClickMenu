import { BackgroundpageWindow } from './sharedTypes';

declare const window: BackgroundpageWindow;

export namespace Info {
	export function init() {
		if (typeof location === 'undefined' || typeof location.host === 'undefined') {
			// Running in node
			window.log = () => { };
			window.logAsync = () => { };
			window.info = () => { };
			window.infoAsync = () => { };
			window.testLog = console.log.bind(console);
			window.Promise = Promise;
		} else {
			// Running in the browser
			window.log = console.log.bind(console);
			window.logAsync = async (...args: any[]) => {
				console.log.apply(console, await Promise.all(args));
			}
			if (window.location && window.location.hash && window.location.hash.indexOf('noBackgroundInfo')) {
				window.info = () => { };
				window.infoAsync = () => { };
			} else {
				window.info = console.log.bind(console);
				window.infoAsync = async (...args: any[]) => {
					console.log.apply(console, await Promise.all(args));
				}
			}
		}
	}
}