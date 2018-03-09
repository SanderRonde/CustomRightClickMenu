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

		window.isDev = browserAPI.runtime.getManifest().short_name.indexOf('dev') > -1;
		if (typeof module === 'undefined') {
			window.log('If you\'re here to check out your background script,' +
				' get its ID (you can type getID("name") to find the ID),' +
				' and type filter(id, [optional tabId]) to show only those messages.' +
				' You can also visit the logging page for even better logging over at ',
				browserAPI.runtime.getURL('html/logging.html'));
		}
	}
}