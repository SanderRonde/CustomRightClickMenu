declare const browserAPI: browserAPI;

(() => {
	function hacksecuteScript(script: string) {
		const tag = document.createElement('script');
		tag.innerHTML = script;
		document.documentElement.appendChild(tag);
		document.documentElement.removeChild(tag);
	}

	function fetchFile(file: string) {
		return new Promise<string>((resolve) => {
			//Get code
			const xhr = new XMLHttpRequest();
			xhr.open('GET', file);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
						console.warn(
							'Failed to run script because the CRM API could not be found'
						);
					}
				}
			};
			xhr.send();
		});
	}

	async function runCRMAPI() {
		//Get CRM API URL
		const url = browserAPI.runtime.getURL('/js/crmapi.js');
		const code = await fetchFile(url);
		hacksecuteScript(code);
	}

	async function executeScript(
		scripts: {
			code?: string;
			file?: string;
		}[],
		index: number = 0
	) {
		if (scripts.length > index) {
			if (scripts[index].code) {
				hacksecuteScript(scripts[index].code);
				await executeScript(scripts, index + 1);
			} else {
				let file = scripts[index].file;
				if (file.indexOf('http') !== 0) {
					file = browserAPI.runtime.getURL(file);
				}
				const code = await fetchFile(file);
				hacksecuteScript(code);
				await executeScript(scripts, index + 1);
			}
		}
	}

	type Writable<T> = {
		-readonly [P in keyof T]: T[P];
	};

	const CONTEXT_MENU_EVENT_KEYS = [
		'clientX',
		'clientY',
		'offsetX',
		'offsetY',
		'pageX',
		'pageY',
		'screenX',
		'screenY',
		'which',
		'x',
		'y',
	];

	let matched = false;
	let contextElementId = 1;
	let crmAPIExecuted = false;
	let lastContextmenuCall: MouseEvent = null;

	type ContentMessage =
		| {
				type: 'checkTabStatus';
				data: {
					willBeMatched: boolean;
				};
		  }
		| {
				type: 'getLastClickInfo';
		  }
		| {
				type: 'runScript';
				data: {
					scripts: {
						code?: string;
						file?: string;
					}[];
				};
		  };

	browserAPI.runtime.onMessage.addListener(function (
		message: ContentMessage,
		_sender: _browser.runtime.MessageSender,
		respond: (response: any) => Promise<void>
	) {
		switch (message.type) {
			case 'checkTabStatus':
				//Code was already executed here, check if it has been matched before
				respond({
					notMatchedYet: !matched,
				});
				if (message.data.willBeMatched) {
					matched = true;
				}
				break;
			case 'getLastClickInfo':
				const responseObj = ({} as Partial<MouseEvent>) as Writable<
					MouseEvent
				> & {
					srcElement: number;
					target: number;
					toElement: number;
				};
				for (const key in lastContextmenuCall) {
					if (CONTEXT_MENU_EVENT_KEYS.indexOf(key) !== -1) {
						const pointerKey = key as keyof MouseEvent;
						if (pointerKey !== 'button') {
							(responseObj[
								pointerKey
							] as any) = lastContextmenuCall[pointerKey];
						}
					}
				}

				if (lastContextmenuCall === null) {
					respond(null);
				} else {
					lastContextmenuCall.srcElement &&
						(lastContextmenuCall.srcElement as any).classList.add(
							'crm_element_identifier_' + ++contextElementId
						);
					responseObj.srcElement = contextElementId as Element &
						number;
					(lastContextmenuCall.target as HTMLElement).classList.add(
						'crm_element_identifier_' + ++contextElementId
					);
					responseObj.target = contextElementId as Element & number;
					if (
						'toElement' in lastContextmenuCall &&
						(lastContextmenuCall as any).toElement
					) {
						(lastContextmenuCall as any).toElement.classList.add(
							'crm_element_identifier_' + ++contextElementId
						);
					}
					responseObj.toElement = contextElementId as Element &
						number;
					respond(responseObj);
				}
				break;
			case 'runScript':
				if (!crmAPIExecuted) {
					//Don't disturb the instantly-returning nature of this handler
					(async () => {
						await runCRMAPI();
						executeScript(message.data.scripts);
						crmAPIExecuted = true;
					})();
				} else {
					executeScript(message.data.scripts);
				}
				break;
		}
	});

	browserAPI.runtime
		.sendMessage({
			type: 'newTabCreated',
		})
		.then((response: { matched?: boolean }) => {
			if (response && response.matched) {
				matched = true;
			}
		});

	browserAPI.storage.local.get().then((result) => {
		if (result.useAsUserscriptInstaller) {
			const installURL = browserAPI.runtime.getURL('html/install.html');
			document.body.addEventListener('mousedown', (e) => {
				const target = e.target as HTMLAnchorElement;
				const isValidTarget =
					target &&
					target.href &&
					target.href.indexOf(installURL) === -1;
				if (isValidTarget) {
					if (
						result.useAsUserscriptInstaller &&
						target.href.match(/.+user\.js$/)
					) {
						const installPageURL = `${installURL}?i=${encodeURIComponent(
							target.href
						)}&s=${encodeURIComponent(location.href)}`;
						target.href = installPageURL;
						target.target = '_blank';
					}
				}
			});
		}
	});

	document.addEventListener('contextmenu', (e) => {
		lastContextmenuCall = e;
	});
})();
