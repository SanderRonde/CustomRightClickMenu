function getStylesheetData(selector: string, callback?: Function) {
	var metaData = document.querySelector('link[rel="' + selector + '"]').getAttribute('href');
	if (!metaData) {
		return;
	}

	if (metaData.indexOf('#') === 0) {
		callback(document.getElementById(metaData.slice(1)).innerText);
	} else {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && callback) {
				if (xhr.status >= 400) {
					callback(null);
				} else {
					callback(xhr.responseText);
				}
			}
		};
		if (metaData.length > 2000) {
			var parts = metaData.split("?");
			xhr.open("POST", parts[0], true);
			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xhr.send(parts[1]);
		} else {
			xhr.open("GET", metaData, true);
			xhr.send();
		}
	}
}

let activeNodes: {
	node: CRM.StylesheetNode;
	state: 'installed'|'updatable';
}[];
document.addEventListener('stylishUpdateChrome', () => {
	if (!activeNodes) {
		return;
	}
	browserAPI.runtime.sendMessage({
		type: 'updateStylesheet',
		data: {
			nodeId: activeNodes[0].node.id
		}
	});
	sendEvent('styleInstalledChrome');
});

document.addEventListener("stylishInstallChrome", async () => {
	const data = await getResource(getMeta('stylish-code-chrome'));
	try {
		const parsed: {
			md5Url :string;
			name: string;
			originalMd5: string;
			updateUrl: string;
			url: string;
			sections: {
				domains: string[];
				regexps: string[];
				urlPrefixes: string[];
				urls: string[];
				code: string;
			}[];
		} = JSON.parse(data);
		
		var author = document.querySelector('#style_author a');
		let authorName = author ? author.innerText : 'anonymous';

		browserAPI.runtime.sendMessage({
			type: 'styleInstall',
			data: {
				code: JSON.stringify(parsed),
				author: authorName
			}
		});

		getStylesheetData('stylish-install-ping-url-chrome');
		sendEvent('styleInstalledChrome');
	} catch(e) {}
});

function sendEvent(type: string, data: any = null) {
	var stylishEvent = new CustomEvent(type, {detail: data});
	document.dispatchEvent(stylishEvent);
}

function getResource(url: string): Promise<string> {
	return new Promise((resolve) => {
		if (!url) {
			resolve(null);
			return;
		}
		if (url.indexOf("#") == 0) {
			resolve(document.getElementById(url.substring(1)).innerText);
			return;
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status >= 400) {
					resolve(null);
				} else {
					resolve(xhr.responseText);
				}
			}
		};
		if (url.length > 2000) {
			var parts = url.split("?");
			xhr.open("POST", parts[0], true);
			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xhr.send(parts[1]);
		} else {
			xhr.open("GET", url, true);
			xhr.send();
		}
	});
}

function getMeta(name: string) {
	var e = document.querySelector("link[rel='" + name + "']");
	return e ? e.getAttribute("href") : null;
}

(() => {
	(async () => {
		const url = getMeta('stylish-id-url') || location.href;
		browserAPI.runtime.sendMessage({
			type: 'getStyles',
			data: {
				url
			}
		}, (response: {
			node: CRM.StylesheetNode;
			state: 'installed'|'updatable';
		}[]) => {
			activeNodes = response;
			if (response.length !== 0) {
				const firstNode = response[0];
				if (firstNode.state === 'updatable') {
					sendEvent('styleCanBeUpdatedChrome', {
						updateUrl: firstNode.node.nodeInfo.source !== 'local' &&
							firstNode.node.nodeInfo.source.updateURL
					});
				} else {
					sendEvent('styleAlreadyInstalledChrome', {
						updateUrl: firstNode.node.nodeInfo.source !== 'local' &&
							firstNode.node.nodeInfo.source.updateURL
					});
				}
			}
		});
	})();

	//Give the code a while to run and register the listener
	window.setTimeout(function() {
		sendEvent('styleCanBeInstalledChrome');
	}, 50);
})();