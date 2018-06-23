/// <reference path="../../../tools/definitions/crmapi.d.ts" />

declare const window: BackgroundpageWindow;

interface SandboxWorkerMessage {
	data: {
		type: 'log';
		lineNo: number;
		data: EncodedString<any[]>
	}|{
		type: 'handshake';
		key: number[];
		data: EncodedString<{
			id: CRM.GenericNodeId;
			key: number[];
			tabId: TabId;
		}>;
	}|{
		type: 'crmapi';
		key: number[];
		data: EncodedString<CRMAPIMessage>;
	}
}

export class SandboxWorker implements SandboxWorkerInterface {
	worker: Worker = new Worker('/js/sandbox.js');
	_callbacks: Function[] = [];
	_verified: boolean = false;
	_handler = window.createHandlerFunction({
		postMessage: this._postMessage.bind(this)
	});

	constructor(public id: CRM.GenericNodeId, public script: string, libraries: string[],
		public secretKey: number[], private _getInstances: () => {
			id: string|TabId;
			tabIndex: TabIndex;
		}[]) {
			this.worker.addEventListener('message', (e: SandboxWorkerMessage) => {
				this._onMessage(e);
			}, false);

			this.worker.postMessage({
				type: 'init',
				id: id,
				script: script,
				libraries: libraries
			});
		}

	post(message: any) {
		this.worker.postMessage(message);
	};

	listen(callback: Function) {
		this._callbacks.push(callback);
	};

	terminate() {
		this.worker.terminate();
	}

	private _onMessage(e: SandboxWorkerMessage) {	
		const data = e.data;
		switch (data.type) {
			case 'handshake':
			case 'crmapi':
				if (!this._verified) {
					window.backgroundPageLog(this.id, null,
						'Ininitialized background page');

					this.worker.postMessage({
						type: 'verify',
						message: JSON.stringify({
							instances: this._getInstances(),
							currentInstance: null,
						}),
						key: this.secretKey.join('') + this.id + 'verified'
					});
					this._verified = true;
				}
				this._verifyKey(data, this._handler);
				break;
			case 'log':
				window.backgroundPageLog.apply(window,
					[this.id, [data.lineNo, -1]].concat(JSON
						.parse(data.data)));
				break;
		}
		if (this._callbacks) {
			this._callbacks.forEach(callback => {
				callback(data);
			});
			this._callbacks = [];
		}
	}

	private _postMessage(message: any) {
		this.worker.postMessage({
			type: 'message',
			message: JSON.stringify(message),
			key: this.secretKey.join('') + this.id + 'verified'
		});
	};

	private _verifyKey(message: {
		key: number[];
		data: EncodedString<{
			id: CRM.GenericNodeId;
			key: number[];
			tabId: TabIndex;
		}>|EncodedString<CRMAPIMessage>;
	}, callback: (data: any, port?: any) => void) {
		if (message.key.join('') === this.secretKey.join('')) {
			callback(JSON.parse(message.data));
		} else {
			window.backgroundPageLog(this.id, null,
				'Tried to send an unauthenticated message');
		}
	}
}

export namespace Sandbox {
	export function sandbox(id: CRM.GenericNodeId, script: string, libraries: string[],
		secretKey: number[], getInstances: () => {
			id: TabId|string;
			tabIndex: TabIndex;
		}[],
		callback: (worker: SandboxWorker) => void) {
			callback(new SandboxWorker(id, script, libraries, secretKey, getInstances));
		}

	function sandboxChromeFunction(fn: Function, context: any, args: any[], 
		window?: void, sandboxes?: void, chrome?: void, browser?: void,
		sandboxChromeFunction?: void, sandbox?: void, sandboxChrome?: any) {
			return fn.apply(context, args);
		}

	export function sandboxVirtualChromeFunction(api: string, base: 'chrome'|'browser', args: {
		type: 'fn' | 'return' | 'arg';
		isPersistent?: boolean;
		val: any;
	}[]) {
		return new Promise<{
			success: boolean;
			result: any;
		}>((resolve) => {
			//window.chrome or window.browser does not exist
			if (base === 'chrome') {
				try {
					let obj = crmAPI.chrome(api);
					obj.onError = () => {
						resolve({
							success: false,
							result: null
						});
					};
					for (const arg of args) {
						switch (arg.type) {
							case 'fn':
								obj = obj.persistent(arg.val);
								break;
							case 'arg':
								obj = obj.args(arg.val);
								break;
							case 'return':
								obj = obj.return(arg.val);
								break;
						}
					}
					obj.return((returnVal) => {
						resolve({
							success: true,
							result: returnVal
						});
					}).send();
				} catch(e) {
					resolve({
						success: false,
						result: null
					});
				}
			} else if (base === 'browser') {
				try {
					let obj: any = crmAPI.browser;
					const apiParts = api.split('.');
					for (const part of apiParts) {
						obj = obj[part as keyof typeof obj];
					}
					let call = obj as CRM.CRMAPI.BrowserRequestReturn;
					for (const arg of args) {
						switch (arg.type) {
							case 'fn':
								call = call.persistent(arg.val);
								break;
							case 'arg':
								call = call.args(arg.val);
								break;
						}
					}
					call.send().then((result) => {
						resolve({
							success: true,
							result
						});
					}, () => {
						resolve({
							success: false,
							result: null
						})
					});
				} catch(e) {
					resolve({
						success: false,
						result: null
					});
				}
			}
		});
	}

	export function sandboxChrome(api: string, base: 'chrome'|'browser', args: any[]) {
		let context = {};
		let fn: any;
		if (base === 'browser') {
			fn = window.browserAPI;
		} else {
			fn = (window as any).chrome;
		}
		const apiSplit = api.split('.');
		try {
			for (let i = 0; i < apiSplit.length; i++) {
				context = fn;
				fn = (fn as any)[apiSplit[i]];
			}
		} catch(e) {
			return {
				success: false,
				result: null
			}
		}
		if (!fn || typeof fn !== 'function') {
			return {
				success: false,
				result: null
			}
		}

		if ('crmAPI' in window && window.crmAPI && '__isVirtual' in window) {
			return {
				success: true,
				result: sandboxVirtualChromeFunction(api, base, args)
			}
		}

		return {
			success: true,
			result: sandboxChromeFunction((fn as any) as Function, context, args)
		}
	};
}