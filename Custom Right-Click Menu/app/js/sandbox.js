(function () {
	function log(args) {
		self.postMessage({
			type: 'log',
			data: JSON.stringify(args)
		});
	}

	self.log = function () {
		var args = Array.prototype.slice.apply(arguments);
		var err = (new Error()).stack.split('\n')[2];
		if (err.indexOf('eval') > -1) {
			err = (new Error()).stack.split('\n')[3];
		}
		var errSplit = err.split('at');
		log(args.concat(['				at', errSplit.slice(1, errSplit.length).join('at')]));
	}

	self.logNoStack = function() {
		log(Array.prototype.slice.apply(arguments));
	}

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
		}
	}

	function returnHandshake() {
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
			}
			if (!loadedLibraries) {
				return;
			}
			console.log('Loaded libraries, launching script');
			(function(script, log) {
				try {
					eval(['(function(window) {', script, '}(typeof window === \'undefined\' ? self : window));'].join(''));
				} catch (error) {
					self.logNoStack([
						error.name,
						' occurred in executing background script',
						'\n',
						'Message: '].join(''),
						error.message, 
						'.\nStack:', 
						error.stack);
				}
				log('Succesfully launched sript');
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