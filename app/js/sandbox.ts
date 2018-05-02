importScripts('crmapi.js');

interface Window {
	log(...args: any[]): void;
	logNoStack(...args: any[]): void;	
	console: {
		log(...args: any[]): void;
	}
}

(() => {

	function log(args: any[], lineNo?: string) {
		(self.postMessage as any)({
			type: 'log',
			data: JSON.stringify(args),
			lineNo: lineNo
		});
	}

	self.log = (...args: any[]) => {
		let err = (new Error()).stack.split('\n')[2];
		if (err.indexOf('eval') > -1) {
			err = (new Error()).stack.split('\n')[3];
		}
		const errSplit = err.split('at');
		log(args, errSplit.slice(1, errSplit.length).join('at'));
	};

	self.logNoStack = (...args: any[]) => {
		log(args);
	};

	self.console = {
		log: self.log
	};

	self.onerror = function (name, source, lineNo, colNo, error) {
		self.log(error.name + ' occurred in background page', error.stack);
	}

	var handshakeData: {
		id: number;
		secretKey: number[];
		handler: any;
	} = null;

	var handshake = function(id: number, secretKey: number[], 
		handler: (message: any) => void) {
			handshakeData = {
				id: id,
				secretKey: secretKey,
				handler: handler
			};
			(self.postMessage as any)({
				type: 'handshake',
				data: JSON.stringify({
					id: id,
					key: secretKey,
					tabId: 0
				}),
				key: secretKey
			});
			return {
				postMessage: function(data: any) {
					(self.postMessage as any)({
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

	self.addEventListener('message', function (e) {
		var data = e.data as {
			type: 'init';
			id: number;
			script: string;
			libraries: string[];
		}|{
			type: 'verify';
			instances: {
				id: string;
				tabIndex: number;
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
					var window = self;
					data.libraries.forEach(function(library) {
						try {
							importScripts(library);
						} catch (error) {
							loadedLibraries = false;
							self.logNoStack([
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
				handshake = null;
				if (!loadedLibraries) {
					return;
				}
				((script, log) => {
					try {
						eval(['(function(window) {', script, '}(typeof window === \'undefined\' ? self : window));'].join(''));
						log('Succesfully launched script');
					} catch (error) {
						self.logNoStack([
							error.name,
							' occurred in executing background script',
							'\n',
							'Message: '].join(''),
							error.message, 
							'.\nStack:', 
							error.stack);
						log('Script boot failed');
					}
				})(data.script, self.log);
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