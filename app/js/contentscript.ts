(() => {
	function hacksecuteScript(script: string) {
		var tag = document.createElement('script');
		tag.innerHTML = script;
		document.documentElement.appendChild(tag);
		document.documentElement.removeChild(tag);
	}

	function fetchFile(file: string, callback: (response: string) => void) {
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

	function runCRMAPI(callback: () => void) {
		//Get CRM API URL
		var url = browserAPI.runtime.getURL('/js/crmapi.js');
		fetchFile(url, function(code) {
			hacksecuteScript(code);
			callback();
		});
	}

	function executeScript(scripts: {
		code?: string;
		file?: string;
	}[], index: number = 0) {
		if (scripts.length > index) {
			if (scripts[index].code) {
				hacksecuteScript(scripts[index].code);
				executeScript(scripts, index + 1);
			} else {
				var file = scripts[index].file;
				if (file.indexOf('http') !== 0) {
					file = browserAPI.runtime.getURL(file);
				}
				fetchFile(file, function(code) {
					hacksecuteScript(code);
					executeScript(scripts, index + 1);
				});
			}
		}
	}

	type Writable<T> = {
		-readonly [P in keyof T]: T[P];
	}

	var matched = false;
	var contextMenuEventKeys = ['clientX', 'clientY', 'offsetX',' offsetY', 'pageX', 'pageY', 'screenX',
		'screenY', 'which', 'x', 'y']
	var lastContextmenuCall: PointerEvent = null;
	var contextElementId = 1;

	var crmAPIExecuted = false;
	browserAPI.runtime.onMessage.addListener(function (message: {
		type: 'checkTabStatus';
		data: {
			willBeMatched: boolean;
		}
	} & {
		type: 'getLastClickInfo';	
	} & {
		type: 'runScript';
		data: {
			scripts: {
				code?: string;
				file?: string;
			}[];
		}	
	}, sender: _browser.runtime.MessageSender, respond: (response: any) => Promise<void>) {
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
				var responseObj = ({} as Partial<PointerEvent>) as Writable<PointerEvent> & {
					srcElement: number;
					target: number;
					toElement: number;
				}
				for (var key in lastContextmenuCall) {
					if (contextMenuEventKeys.indexOf(key) !== -1) {
						const pointerKey = key as keyof PointerEvent;
						if (pointerKey !== 'button') {
							responseObj[pointerKey] = lastContextmenuCall[pointerKey];
						}
					}
				}

				if (lastContextmenuCall === null) {
					respond(null);
				} else {
					lastContextmenuCall.srcElement.classList.add('crm_element_identifier_' + ++contextElementId);
					responseObj.srcElement = contextElementId as Element & number;
					(lastContextmenuCall.target as HTMLElement).classList.add('crm_element_identifier_' + ++contextElementId);
					responseObj.target = contextElementId as Element & number;
					lastContextmenuCall.toElement.classList.add('crm_element_identifier_' + ++contextElementId);
					responseObj.toElement = contextElementId as Element & number;
					respond(responseObj);
				}
				break;
			case 'runScript':
				if (!crmAPIExecuted) {
					runCRMAPI(function() {
						executeScript(message.data.scripts);
					});
					crmAPIExecuted = true;
				} else {
					executeScript(message.data.scripts);
				}
				break;
		}
	});

	browserAPI.runtime.sendMessage({
		type: 'newTabCreated'
	}).then(function(response: {
		matched?: boolean;
	}) {
		if (response && response.matched) {
			matched = true;
		}
	});

	browserAPI.storage.local.get('useAsUserscriptInstaller').then(function(result) {
		if (result.useAsUserscriptInstaller) {
			var installURL = browserAPI.runtime.getURL('html/install.html');
			document.body.addEventListener('mousedown', function(e) {
				var target = e.target as HTMLAnchorElement;
				if (target && target.href && target.href.indexOf(installURL) === -1 && target.href.match(/.+user\.js$/)) {
					var installPageURL = installURL + '?i=' + encodeURIComponent(target.href) + '&s=' +
						encodeURIComponent(location.href);
					target.href = installPageURL;
					target.target = '_blank';
				}
			});
		}
	});

	document.addEventListener('contextmenu', function(e) {
		lastContextmenuCall = e;
	});
})();