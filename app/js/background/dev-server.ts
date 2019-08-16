import { browserAPI } from '../polyfills/browser.js';

export namespace DevServer {
	export namespace Imports {
		const IMPORT_REGEX = 
			/import([\n\s])*(\{(([^\}]|[\n\s])*?)\}[\n\s]*from)?([\n\s]*)((['"])([^\.].*)\7)/g;

		function repeat(text: string, amount: number) {
			let str = '';
			for (let i = 0; i < amount; i++) {
				str += text;
			}
			return str;
		}

		function resolveBasePath({ url }: Request) {
			const fromRoot = url.split('://')[1].split('/').slice(1).join('/');
			const subdirs = fromRoot.split('/').length - 1;
			return repeat('../', subdirs);
		}

		function resolveModuleImportFile(importName: string) {
			// If module contains no slashes, change the name
			if (importName.indexOf('/') === -1) {
				switch (importName) {
					case 'wc-lib':
					case 'wclib':
						return 'wc-lib/build/es/wc-lib.js';
					case 'lit-html':
						return 'lit-html/lit-html.js';
					default:
						return `${importName}/index.js`;
				}
			}

			// If import has no extension, add .js
			if (importName.split('/').pop().indexOf('.') === -1) {
				return `${importName}.js`;
			}
			return importName;
		}

		function insertPolymerCompat(request: Request, importName: string|undefined, source: string|undefined,
			space1: string, space2: string, contents: string, quote: string): string|null {
				if (request.url.indexOf('polymer-compat') > -1) return null;
				if (!importName || !source) return null;

				if (importName.trim() === 'html') {
					if (source.indexOf('@polymer/polymer/polymer-legacy') === -1 &&
						source.indexOf('@polymer/polymer/lib/utils/html-tag') === -1) {
							return null;
						}
				} else if (importName.trim() === 'Polymer') {
					if (source.indexOf('@polymer/polymer/lib/legacy/polymer-fn') === -1) {
						return null;
					}
				} else {
					return null;
				}

				return `import${space1}${contents || ''}${
						space2 || ''
					}${quote}${
						resolveBasePath(request)
					}js/polyfills/polymer-compat.js${quote}`;
			}

		function replaceImports(request: Request, script: string) {
			return script.replace(IMPORT_REGEX, 
				(_full, space1, contents, importName, _innerSpacing, space2,
					_fullSource, quote, source) => {
						const polymerReplacedValue = insertPolymerCompat(request, importName,
							source, space1, space2, contents, quote);
						if (polymerReplacedValue) return polymerReplacedValue;

						return `import${space1}${contents || ''}${
							space2 || ''
						}${quote}${
							resolveBasePath(request)
						}modules/${
							resolveModuleImportFile(source)
						}${quote}`;
					});
		}

		export function replace(request: Request, script: string): string {
			return replaceImports(request, script);
		}
	}

	interface InterceptedRequest {
		frameId: string;
		request: Request;
		requestId: string;
		resouceType: string;
	}

	const seenIds: Set<string> = new Set();

	function shouldInterceptRequest(_request: InterceptedRequest) {
		// True for everything as of now
		return true;
	}

	async function resumeRequest(source: _chrome._debugger.Debuggee, data: InterceptedRequest) {
		console.log('Cancelling', data.requestId);
		await browserAPI.debugger.sendCommand(source, 
			'Fetch.continueRequest', {
				requestId: data.requestId
			});
	}

	async function respondModifiedRequest(source: _chrome._debugger.Debuggee, data: InterceptedRequest,
		newBody: string) {
			const encoded = btoa(newBody);
			await browserAPI.debugger.sendCommand(source, 
				'Fetch.fulfillRequest', {
					requestId: data.requestId,
					responseCode: 200,
					responseHeaders: [{
						name: 'Content-Type',
						value: 'text/javascript'
					}, {
						name: 'Content-Length',
						value: encoded.length + ''
					}],
					body: encoded
				});
		}

	async function onRequestPaused(source: _chrome._debugger.Debuggee, data: InterceptedRequest) {
		if (seenIds.has(data.requestId)) return;
		seenIds.add(data.requestId);

		if (!shouldInterceptRequest(data)) {
			return await resumeRequest(source, data);
		}

		// Get response data
		const response = await browserAPI.debugger.sendCommand(source, 
			'Fetch.getResponseBody', {
				requestId: data.requestId
			}) as {
				base64Encoded: boolean;
				body: string;
			}
		const responseText = response.base64Encoded ?
			atob(response.body) : response.body;
		await respondModifiedRequest(source, data,
			Imports.replace(data.request, responseText));
	}

	async function onWatchedTabCreated(debuggee: _chrome._debugger.Debuggee) {
		await browserAPI.debugger.attach(debuggee, '1.2');
		browserAPI.debugger.onEvent.addListener(async (source, method, params) => {
			switch (method) {
				case 'Fetch.requestPaused':
					await onRequestPaused(source, params);
					break;
				default:
					console.log('?', method, params);
					break;
			}
		});
		await browserAPI.debugger.sendCommand(debuggee, 
			'Fetch.enable', {
				patterns: [{
					urlPattern: 'chrome-extension://*',
					requestStage: 'Response',
					resourceType: 'Script'
				}]
			});
	}

	function attachListeners() {
		browserAPI.tabs.onUpdated.addListener((_id, changeInfo, tab) => {
			if (changeInfo.status && changeInfo.status === 'loading' &&
				changeInfo.url && changeInfo.url.indexOf('chrome-extension://') === 0 &&
				changeInfo.url.indexOf('entrypoints/options.html') > -1) {
					onWatchedTabCreated({
						tabId: tab.id
					});	
				}
		});
	}

	export function init() {
		attachListeners();
	}
}