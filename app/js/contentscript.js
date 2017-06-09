(function() {
	function hacksecuteScript(script) {
		var tag = document.createElement('script');
		tag.innerHTML = script;
		document.documentElement.appendChild(tag);
		document.documentElement.removeChild(tag);
	}

	function fetchFile(file, callback) {
		//Get code
		var xhr = new XMLHttpRequest();
		xhr.open('GET', file);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					callback(xhr.responseText);
				} else {
					console.warn('Failed to run script because the CRM API could not be found');
				}
			}
		}
		xhr.send();
	}

	function runCRMAPI(callback) {
		//Get CRM API URL
		var url = chrome.runtime.getURL('/js/crmapi.js');
		fetchFile(url, function(code) {
			hacksecuteScript(code);
			callback();
		});
	}

	function executeScript(scripts, index) {
		if (scripts.length > index) {
			if (scripts[index].code) {
				hacksecuteScript(scripts[index].code);
				executeScript(scripts, index + 1);
			} else {
				var file = scripts[index].file;
				if (file.indexOf('http') !== 0) {
					file = chrome.runtime.getURL(file);
				}
				fetchFile(file, function(code) {
					hacksecuteScript(code);
					executeScript(scripts, index + 1);
				});
			}
		}
	}

	function executeScripts(scripts) {
		executeScript(scripts, 0);
	}

	var matched = false;
	var contextMenuEventKeys = ['clientX', 'clientY', 'offsetX',' offsetY', 'pageX', 'pageY', 'screenX',
		'screenY', 'which', 'x', 'y']
	var lastContextmenuCall = null;
	var contextElementId = 1;

	var crmAPIExecuted = false;
	chrome.runtime.onMessage.addListener(function (message, sender, respond) {
		switch (message.type) {
			case 'checkTabStatus':
				//Code was already executed here, check if it has been matched before
				respond({
					notMatchedYet: !matched
				});
				if (message.data.willBeMatched) {
					matched = true;
				}
				break;
			case 'getLastClickInfo':
				var responseObj = {};
				for (var key in lastContextmenuCall) {
					if (contextMenuEventKeys.indexOf(key) !== -1) {
						responseObj[key] = lastContextmenuCall[key];
					}
				}

				lastContextmenuCall.srcElement.classList.add('crm_element_identifier_' + ++contextElementId);
				responseObj.srcElement = contextElementId;
				lastContextmenuCall.target.classList.add('crm_element_identifier_' + ++contextElementId);
				responseObj.target = contextElementId;
				lastContextmenuCall.toElement.classList.add('crm_element_identifier_' + ++contextElementId);
				responseObj.toElement = contextElementId;
				respond(responseObj);
				break;
			case 'runScript':
				if (!crmAPIExecuted) {
					runCRMAPI(function() {
						executeScripts(message.data.scripts);
					});
					crmAPIExecuted = true;
				} else {
					executeScripts(message.data.scripts);
				}
				break;
		}
	});

	chrome.runtime.sendMessage({
		type: 'newTabCreated'
	}, function(response) {
		if (response && response.matched) {
			matched = true;
		}
	});

	var installURL = chrome.runtime.getURL('html/install.html');
	document.body.addEventListener('mousedown', function(e) {
		var target = e.target;
		if (target && target.href && target.href.indexOf(installURL) === -1 && target.href.match(/.+user\.js$/)) {
			var installPageURL = installURL + '?i=' + encodeURIComponent(target.href) + '&s=' +
				encodeURIComponent(location.href);
			target.href = installPageURL;
			target.target = '_blank';
		}
	});

	document.addEventListener('contextmenu', function(e) {
		lastContextmenuCall = e;
	});
})();