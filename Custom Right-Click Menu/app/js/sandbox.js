(function () {
	self.log = function() {
		self.postMessage({
			type: 'log',
			data: JSON.stringify(Array.from(arguments))
		});
	}

	self.console = {
		log: self.log
	};

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

	self.addEventListener('message', function(e) {
		var data = e.data;
		switch (data.type) {
			case 'init':
				data.libraries.forEach(function(library) {
					importScripts(library);
				});
				returnHandshake = function() {
					return null;
				}
				(function (script, log) {
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
	});

	self.onerror = function(error) {
		self.log(error.name + ' occurred in background page', error.message, error.stack);
	}
}());