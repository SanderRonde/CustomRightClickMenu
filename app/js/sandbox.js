importScripts('crmapi.js');

(function () {
	function log(args, lineNo) {
		self.postMessage({
			type: 'log',
			data: JSON.stringify(args),
			lineNo: lineNo
		});
	}

	self.log = function () {
		var args = Array.prototype.slice.apply(arguments);
		var err = (new Error()).stack.split('\n')[2];
		if (err.indexOf('eval') > -1) {
			err = (new Error()).stack.split('\n')[3];
		}
		var errSplit = err.split('at');
		log(args, errSplit.slice(1, errSplit.length).join('at'));
	};

	self.logNoStack = function() {
		log(Array.prototype.slice.apply(arguments));
	};

	self.console = {
		log: self.log
	};

	self.onerror = function (name, source, lineNo, colNo, error) {
		self.log(error.name + ' occurred in background page', message, error.stack);
		error.preventDefault();
	}

	var handshakeData = null;

	var handshake = function(id, secretKey, handler) {
		handshakeData = {
			id: id,
			secretKey: secretKey,
			handler: handler
		};
		self.postMessage({
			type: 'handshake',
			data: JSON.stringify({
				id: id,
				key: secretKey,
				tabId: 0
			}),
			key: secretKey
		});
		return {
			postMessage: function(data) {
				self.postMessage({
					type: 'crmapi',
					data: JSON.stringify(data),
					key: secretKey
				});
			}
		};
	};

	var returnHandshake = function() {
		return handshake;
	}

	Object.defineProperty(self, 'handshake', {
		get: returnHandshake
	});

	function verifyKey(key) {
		return key === handshakeData.secretKey.join('') +
			handshakeData.id + 'verified';
	}

	self.addEventListener('message', function (e) {
		var data = e.data;
		switch (data.type) {
		case 'init':
			var loadedLibraries = true;
			(function() {
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
			}());
			returnHandshake = function() {
				return null;
			};
			if (!loadedLibraries) {
				return;
			}
			(function(script, log) {
				try {
					eval(['(function(window) {', script, '}(typeof window === \'undefined\' ? self : window));'].join(''));
					log('Succesfully launched sript');
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
			}(data.script, self.log));
			break;
		case 'verifiy':
		case 'message':
			if (verifyKey(data.key)) {
				handshakeData.handler(JSON.parse(data.message));
			}
			break;
		}
	});
}());