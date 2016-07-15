function getStylesheetData(selector, callback) {
	var metaData = document.querySelector('link[rel="' + selector + '"]').getAttribute('href');
	if (!metaData) {
		return;
	}

	if (metaData.indexOf('#') === 0) {
		callback(document.getElementById(metaData.slice(1)).innerText);
	} else {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && callback) {
				if (xhr.status >= 400) {
					callback(null);
				} else {
					callback(xhr.responseText);
				}
			}
		}
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

document.addEventListener("stylishInstallChrome", function() {
	getStylesheetData('stylish-description', function() {
		getStylesheetData('stylish-description', function(name) {
			getStylesheetData('stylish-code-chrome', function(code) {
				var author = document.querySelector('a[rel="author dct:creator"]');
				if (author) {
					author = author.innerText;
				} else {
					author = 'anonymous';
				}

				if (window.confirm('Do you want to install "' + name + '" as a stylesheet to CRM?')) {
					chrome.runtime.sendMessage({
						type: 'styleInstall',
						data: {
							code: code,
							author: author
						}
					});

					getStylesheetData('stylish-install-ping-url-chrome');
					alert('installed');
				}
			});
		});
	});
}, false);

var button = document.getElementById('stylish-installed-style-not-installed-chrome');
if (button) {
	button.childNodes && button.childNodes[2] && (button.childNodes[2].nodeValue = 'Install with CRM')
}

//Give the code a while to run and register the listener
window.setTimeout(function() {
	var canBeInstalledEvent = new CustomEvent('styleCanBeInstalledChrome', {
		detail: null
	});
	document.dispatchEvent(canBeInstalledEvent);
}, 50);