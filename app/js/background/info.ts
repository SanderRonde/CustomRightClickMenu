declare const window: BackgroundpageWindow;

export namespace Info {
	export function init() {
		if (typeof module === 'undefined') {
			// Running in the browser
			window.log = console.log.bind(console);
			if (window.location && window.location.hash && window.location.hash.indexOf('noBackgroundInfo')) {
				window.info = () => { };
			} else {
				window.info = console.log.bind(console);
			}
		} else {
			// Running in node
			window.log = () => { };
			window.info = () => { };
			window.testLog = console.log.bind(console);
			window.Promise = Promise;
		}
	}
}