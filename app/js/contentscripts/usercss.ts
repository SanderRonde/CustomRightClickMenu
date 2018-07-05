/**
 * Copied from https://github.com/openstyles/stylus. For this file the following
 * license applies:
 * 
 * Copyright (C) 2005-2014 Jason Barnabe jason.barnabe@gmail.com
 *
 * Copyright (C) 2017 Stylus Team
 * 
 * This program is free software: you can redistribute it and/or modify it under 
 * the terms of the GNU General Public License as published by the Free Software 
 * Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for 
 * more details.
 */

interface Window {
	initUsercssInstall?: Function;
}

interface Document {
	contentType: string;
}

function xhr(url: string): Promise<string> {
	return new Promise((resolve) => {
		if (!url) {
			resolve(null);
			return;
		}
		const xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if (xhr.readyState == 4) {
				if (xhr.status >= 400) {
					resolve(null);
				} else {
					resolve(xhr.responseText);
				}
			}
		};
		xhr.open("GET", url, true);
		xhr.send();
	});
}

(async () => {
	// some weird bug in new Chrome: the content script gets injected multiple times
	if (typeof window.initUsercssInstall === 'function') return;
	if (!/text\/(css|plain)/.test(document.contentType) ||
		!/==userstyle==/i.test(document.body.textContent)) {
		return;
	}
	window.initUsercssInstall = () => {};

	await browserAPI.runtime.sendMessage({
		type: 'styleInstall',
		data: {
			code: await xhr(location.href)
		}
	});
})();