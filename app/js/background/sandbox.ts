declare const window: BackgroundpageWindow;

interface SandboxWorkerMessage {
	data: {
		type: 'log';
		lineNo: number;
		data: EncodedString<Array<any>>
	}|{
		type: 'handshake';
		key: Array<number>;
		data: EncodedString<{
			id: number;
			key: Array<number>;
			tabId: number;
		}>;
	}|{
		type: 'crmapi';
		key: Array<number>;
		data: EncodedString<CRMAPIMessage>;
	}
}

export class SandboxWorker {
	worker: Worker = new Worker('/js/sandbox.js');
	_callbacks: Array<Function> = [];
	_verified: boolean = false;
	_handler = window.createHandlerFunction({
		postMessage: this._postMessage.bind(this)
	});

	constructor(public id: number, public script: string, libraries: Array<string>,
		public secretKey: Array<number>, private _getInstances: () => Array<{
			id: string;
			tabIndex: number;
		}>) {
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
						instances: this._getInstances()
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
		key: Array<number>;
		data: EncodedString<{
			id: number;
			key: Array<number>;
			tabId: number;
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
	export function sandbox(id: number, script: string, libraries: Array<string>,
		secretKey: Array<number>, getInstances: () => Array<{
			id: string;
			tabIndex: number;
		}>,
		callback: (worker: SandboxWorker) => void) {
			callback(new SandboxWorker(id, script, libraries, secretKey, getInstances));
		}

	function _sandboxChromeFunction(window: void, sandboxes: void, chrome: void, browser: void, fn: Function, context: any, args: Array<any>) {
		return fn.apply(context, args);
	}

	export function sandboxChrome(api: string, base: 'chrome'|'browser', args: Array<any>) {
		let context = {};
		let fn = (window as any)[base];
		const apiSplit = api.split('.');
		for (let i = 0; i < apiSplit.length; i++) {
			context = fn;
			fn = (fn as any)[apiSplit[i]];
		}
		return _sandboxChromeFunction(null, null, null, null, (fn as any) as Function, context, args);
	};
}