(function () {
	function log(args) {
		//self.log(err);
		self.postMessage({
			type: 'log',
			data: JSON.stringify(args)
		});
	}

	self.log = function () {
		var args = Array.from(arguments);
		var err = (new Error()).stack.split('\n')[2];
		if (err.indexOf('eval') > -1) {
			err = (new Error()).stack.split('\n')[3];
		}
		log(args.concat(['				at', err.split('at')[1]]));
	}

	self.logNoStack = function() {
		log(Array.from(arguments));
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
		try {
			var data = e.data;
			switch (data.type) {
			case 'init':
				data.libraries.forEach(function(library) {
					importScripts(library);
				});
				returnHandshake = function() {
					return null;
				}
				(function(script, log) {
					eval(script);
				}(data.script, log));
				break;
			case 'verifiy':
			case 'message':
				if (verifyKey(data.key)) {
					handshakeData.handler(JSON.parse(data.message));
				}
				break;
			}
		} catch (error) {
			self.logNoStack(error.name + ' occurred in background page.\nMessage: ', error.message, '.\nStack:', error.stack.split('\n'));
		}
	});
}());