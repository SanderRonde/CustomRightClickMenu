importScripts('crmapi.js');

interface SandboxWindow extends Window {
	log(...args: any[]): void;
	logNoStack(...args: any[]): void;	
}

const _self = self as SandboxWindow;

(() => {

	function log(args: any[], lineNo?: string) {
		(self.postMessage as any)({
			type: 'log',
			data: JSON.stringify(args),
			lineNo: lineNo
		});
	}

	_self.log = (...args: any[]) => {
		let err = (new Error()).stack.split('\n')[1];
		if (err.indexOf('eval') > -1) {
			err = (new Error()).stack.split('\n')[2];
			if (!err) {
				err = (new Error()).stack.split('\n')[1];
			}
		}
		const errSplit = err.split('at');
		log(args, errSplit.slice(1, errSplit.length).join('at'));
	};

	_self.logNoStack = (...args: any[]) => {
		log(args);
	};

	(_self as any).console = {
		log: _self.log
	};

	_self.onerror = function (_name, _source, _lineNo, _colNo, error) {
		_self.log(error.name + ' occurred in background page', error.stack);
	}

	var handshakeData: {
		id: CRM.GenericNodeId;
		secretKey: number[];
		handler: any;
	} = null;

	var handshake = function(id: CRM.GenericNodeId, secretKey: number[], 
		handler: (message: any) => void) {
			handshakeData = {
				id: id,
				secretKey: secretKey,
				handler: handler
			};
			(_self.postMessage as any)({
				type: 'handshake',
				data: JSON.stringify({
					id: id,
					key: secretKey,
					tabId: 0
				}),
				key: secretKey
			});
			handshake = null;
			return {
				postMessage: function(data: any) {
					(_self.postMessage as any)({
						type: 'crmapi',
						data: JSON.stringify(data),
						key: secretKey
					});
				}
			};
		};

	Object.defineProperty(self, 'handshake', {
		get: () => {
			return handshake;
		}
	});

	function verifyKey(key: string): boolean {
		return key === handshakeData.secretKey.join('') +
			handshakeData.id + 'verified';
	}

	_self.addEventListener('message', function (e) {
		var data = e.data as {
			type: 'init';
			id: CRM.GenericNodeId;
			script: string;
			libraries: string[];
		}|{
			type: 'verify';
			instances: {
				id: string;
				tabIndex: TabIndex;
			}[];
			key: string;
			message: any;
		}|{
			type: 'message';
			message: any;
			key: string;
		};
		switch (data.type) {
			case 'init':
				var loadedLibraries = true;
				(() => {
					//@ts-ignore
					var window = _self;
					data.libraries.forEach(function(library) {
						try {
							importScripts(library);
						} catch (error) {
							loadedLibraries = false;
							_self.logNoStack([
								error.name,
								' occurred in loading library ',
								library.split(/(\/|\\)/).pop(),
								'\n',
								'Message: '].join(''),
								error.message, 
								'.\nStack:', 
								error.stack);
						}
					});
				})();
				if (!loadedLibraries) {
					return;
				}
				((script, log) => {
					try {
						eval(['(function(window) {', script, '}(typeof window === \'undefined\' ? self : window));'].join(''));
						log('Succesfully launched script');
					} catch (error) {
						_self.logNoStack([
							error.name,
							' occurred in executing background script',
							'\n',
							'Message: '].join(''),
							error.message, 
							'.\nStack:', 
							error.stack);
						log('Script boot failed, call window.debugBackgroundScript(node id) to' + 
							' restart and debug it');
					}
				})(data.script, _self.log);
				break;
			case 'verify':
			case 'message':
				if (verifyKey(data.key)) {
					handshakeData.handler(JSON.parse(data.message));
				}
				break;
		}
	});
})();