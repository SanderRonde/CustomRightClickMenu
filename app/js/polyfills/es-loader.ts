(() => {
	const CHROME_ES3 = 26;

	const chromeVersion = ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0];
	const tag = document.createElement('script');
	if (chromeVersion > CHROME_ES3) {
		//Load es5/6
		tag.src = 'options.js';
	} else {
		//Load es3 instead
		tag.src = 'options.es3.js';
	}

	document.addEventListener('DOMContentLoaded', () => {
		document.body.appendChild(tag);
	});
})();