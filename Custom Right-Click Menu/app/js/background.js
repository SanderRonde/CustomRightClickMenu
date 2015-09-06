///<reference path="../../../scripts/_references.js"/>
var permissions = [
	'alarms',
	'background',
	'bookmarks',
	'browsingData',
	'clipboardRead',
	'clipboardWrite',
	'contentSettings',
	'cookies',
	'contentSettings',
	'declarativeContent',
	'desktopCapture',
	'downloads',
	'history',
	'identity',
	'idle',
	'management',
	'notifications',
	'pageCapture',
	'power',
	'printerProvider',
	'privacy',
	'sessions',
	'system.cpu',
	'system.memory',
	'system.storage',
	'topSites',
	'tabCapture',
	'tts',
	'webNavigation',
	'webRequest',
	'webRequestBlocking'
];

/*
 * Whenever a script is launched, another key is created using the secret key
 */
var secretKeys = {
	
};

var keysByPings = {};

var availablePermissions = [];
var storageSync;
var storageLocal;
var crmTree;
var crmByIdSafe = {};
var crmByIdFull = {};

function getSafeData(node) {
	var j;
	var vals = ['link', 'script', 'stylesheet', 'menu'];
	var oldVal;
	var newNode = {
		id: node.id,
		name: node.name,
		type: node.type,
		value: node.value,
		path: node.path
	};
	for (j = 0; j < 4; j++) {
		oldVal = vals + 'Val';
		if (node[oldVal]) {
			newNode[oldVal] = node[oldVal];
		}
	}
	return newNode;
}

function generateItemId(callback) {
	window.chrome.storage.local.get('latestId', function (items) {
		var id;
		if (items.latestId) {
			id = items.latestId;
		} else {
			id = 1;
			window.chrome.storage.local.set({ latestId: 1 });
		}
		callback && callback(id);
	});
}

function refreshPermissions() {
	window.chrome.permisions.getAll(function(available) {
		availablePermissions = available.permissions;
	});
}

function removeStorage(node) {
	if (node.children && node.children.length > 0) {
		for (var i = 0; i < node.children.length; i++) {
			removeStorage(node);
		}
	} else {
		delete node.storage;
	}
}

function buildCrmTree(crm) {
	var i;
	var tree = [];
	for (i = 0; i < crm.length; i++) {
		tree.push(getSafeData(crm[i]));
	}
	crmTree = tree;
}

function parseNode(node) {
	if (node.children && node.children.length > 0) {
		for (var i = 0; i < node.children.length; i++) {
			parseNode(node.children[i]);
		}
	} else {
		crmByIdSafe[node.id] = getSafeData(node);
		crmByIdFull[node.id] = node;
	}
}

function buildCrmStorages(crm) {
	for (var i = 0; i < crm.length; i++) {
		parseNode(crm);
	}
}

function updateStorage() {
	window.chrome.storage.sync.get(function (syncs) {
		storageSync = syncs;
		window.chrome.storage.local.get(function (locals) {
			storageLocal = locals;
			buildCrmTree(syncs.crm);
			buildCrmStorages(syncs.crm);
		});
	});
}

function updateHandler(message) {
	switch (message.action) {
		case 'updateStorage':
			updateStorage();
			break;
	}
}

function crmFunction(message, toRun) {
	var _this = this;
	this.toRun = toRun;
	this.message = message;

	this.respondSuccess = function() {
		var args = [];
		for (var i = 0; i < Arguments.length; i++) {
			args.push(Arguments[i]);
		}
		this.message.onFinish('success', args);
	};

	this.respondError = function(error) {
		this.message.onFinish('error', error);
	};

	this.lookup = function(path, data, hold) {
		if (path === null || typeof path !== 'object' || path.length === undefined) {
			this.respondError('Supplied path is not of type array');
			return true;
		}
		var length = path.length;
		hold && length--;
		for (var i = 0; i < length; i++) {
			if (data) {
				data = data[path[i]];
			} else {
				return false;
			}
		}
		if (data === undefined) {
			return false;
		}
		return data;
	}

	this.getNodeFromId = function(id, full, noCallback) {
		var node = (full ? crmByIdFull : crmByIdSafe)[id];
		if (node) {
			if (noCallback) {
				return node;
			}
			return {
				run: function(callback) {
					callback(node);
				}
			};
		} else {
			_this.respondError('There is no node with the id you supplied (' + id + ')');
			if (noCallback) {
				return false;
			}
			return {
				run: function () {}
			};
		}
	};

	this.crmFunctions = {
		getTree: function() {
			_this.respondSuccess(crmTree);
		},
		getSubTree: function(id) {
			if (id || (_this.message.nodeId && typeof _this.message.nodeId === 'number')) {
				var node = crmByIdSafe[id || _this.message.nodeId];
				if (node) {
					_this.respondSuccess(node);
				} else {
					_this.respondError('There is no node with id ' + (id || _this.message.nodeId));
				}
			} else {
				_this.respondError('No nodeId supplied');
			}
		},
		getNode: function() {
			this.getSubTree();
		},
		getNodeIdFromPath: function(path) {
			var pathToSearch = path || _this.message.path;
			var lookedUp = lookup(pathToSearch, crmTree, false);
			if (lookedUp === true) {
				return false;
			} else if (lookedUp === false) {
				_this.respondError('Path does not return a valid value');
				return false;
			} else {
				_this.respondSuccess(lookedUp.id);
				return lookedUp.id;
			}
		},
		queryCrm: function() {
			var i;
			var searchScopeArray = [];

			function findType(tree, type) {
				if (tree.children) {
					for (i = 0; i < tree.children.length; i++) {
						findType(tree.children[i], type);
					}
				} else {
					if (type) {
						if (tree.type === type) {
							searchScopeArray.push(tree);
						}
					} else {
						searchScopeArray.push(tree);
					}
				}
			}

			var searchScope = crmTree;
			if (_this.message.query.inSubTree) {
				searchScope = this.getSubTree(_this.message.query.inSubTree);
			}

			//Convert to array
			findType(searchScope, _this.message.query.type);

			if (_this.message.query.name) {
				var length = searchScopeArray.length;
				for (i = 0; i < length; i++) {
					if (searchScopeArray[i].name !== _this.message.query.name) {
						searchScopeArray.splice(i, 1);
						length--;
						i--;
					}
				}
			}

			_this.respondSuccess(searchScopeArray);
		},
		getParentNode: function() {
			_this.getNodeFromId(_this.message.nodeId).run(function(node) {
				var pathToSearch = JSON.parse(JSON.stringify(node.path));
				pathToSearch.pop();
				var parentId = this.getNodeIdFromPath(pathToSearch);
				if (parentId !== false) {
					_this.respondSuccess(parentId);
				}
			});
		},
		getChildren: function() {
			_this.getNodeFromId(_this.message.nodeId).run(function(node) {
				_this.respondSuccess(node.children || []);
			});
		},
		getNodeType: function() {
			_this.getNodeFromId(_this.message.nodeId).run(function(node) {
				_this.respondSuccess(node.type);
			});
		},
		getNodeValue: function() {
			_this.getNodeFromId(_this.message.nodeId).run(function(node) {
				_this.respondSuccess(node.value);
			});
		},
		createNode: function() {
			generateItemId(function(id) {
				var i;
				var type = (_this.message.options.type === 'link' ||
					_this.message.options.type === 'script' ||
					_this.message.options.type === 'stylesheet' ||
					_this.message.options.type === 'menu' ||
					_this.message.options.type === 'divider' ? _this.message.options.type : 'link');
				var node = {
					type: type,
					name: _this.message.options.name || 'name',
					id: id,
					children: []
				};
				if (type === 'link') {
					if (_this.message.options.linkData) {
						node.value = [];
						if (typeof _this.message.options.linkData === 'object' && _this.message.options.linkData.length !== undefined) {
							for (i = 0; i < _this.message.options.linkData.length; i++) {
								if (typeof _this.message.options.linkData[i] !== 'object') {
									_this.respondError('Not all data in the linkData array you supplied is of type object');
									return false;
								} else {
									if (!_this.message.options.linkData[i].url) {
										_this.respondError('Not all the data supplied in linkData has a url, this is required');
										return false;
									}
									if (_this.message.options.linkData[i].url !== 'string') {
										_this.respondError('Not all the urls supplied in linkData is of type string');
										return false;
									}
									if (_this.message.options.linkData[i].newTab !== undefined && typeof _this.message.options.linkData[i].newTab !== 'boolean') {
										_this.respondError('Not all the newTab properties in linkData are of type boolean');
										return false;
									}
								}
							}
							for (i = 0; i < _this.message.options.linkData.length; i++) {
								node.value.push({
									url: _this.message.options.linkData[i].url,
									newTab: (_this.message.options.linkData[i].newTab === false ? false : true)
								});
							}
						} else {
							_this.respondError('The linkData you supplied is not of type array');
							return false;
						}
					} else {
						node.value = [
							{
								url: 'http://example.com',
								newTab: true
							}
						];
					}
				} else if (type === 'script') {
					if (!_this.message.options.scriptData) {
						_this.respondError('No SciptData option provided');
						return false;
					}
					if (typeof _this.message.options.scriptData !== 'object') {
						_this.respondError('SciptData specified is not of type object');
						return false;
					}
					node.value = {};
					if (!_this.message.options.scriptData.script) {
						_this.respondError('No script specified in scriptData');
						return false;
					}
					if (typeof _this.message.options.scriptData.script === 'string') {
						_this.respondError('Script specified in scriptData is not of type string');
						return false;
					}
					node.value.script = _this.message.options.scriptData.script;

					if (_this.message.options.scriptData.launchMode !== undefined) {
						if (typeof _this.message.options.scriptData.launchMode !== 'number') {
							_this.respondError('LaunchMode specified in scriptData is not of type number (0,1,2 are possible)');
							return false;
						}
						if (_this.message.options.scriptData.launchMode < 0 || _this.message.options.scriptData.launchMode > 2) {
							_this.respondError('Launchmode specified in scriptData is not 0, 1 or 2 but instead ' + _this.message.options.scriptData.launchMode + '.');
							return false;
						}
					}
					node.value.launchMode = (_this.message.options.scriptData.launchMode !== undefined ? _this.message.options.scriptData.launchMode : 0);

					if (_this.message.options.scriptData.triggers !== undefined) {
						if (typeof _this.message.options.scriptData.triggers !== 'object' || _this.message.options.scriptData.triggers.length === undefined) {
							_this.respondError('Triggers specified in scriptData are not of type array');
							return false;
						}
						for (i = 0; i < _this.message.options.scriptData.triggers.length; i++) {
							if (!_this.message.options.scriptData.triggers.url) {
								_this.respondError('Not all triggers in the triggers array have a "url" property');
								return false;
							}
							if (typeof _this.message.options.scriptData.triggers !== 'string') {
								_this.respondError('Not all urls in the triggers array are of type string');
								return false;
							}
						}
					}
					node.value.triggers = _this.message.options.scriptData.triggers || [];

					if (_this.message.options.scriptData.libraries !== undefined) {
						if (typeof _this.message.options.scriptData.libraries !== 'object' || _this.message.options.scriptData.libraries.length === undefined) {
							_this.respondError('Libraries specified in scriptData are not of type array');
							return false;
						}
						for (i = 0; i < _this.message.options.scriptData.libraries.length; i++) {
							if (!_this.message.options.scriptData.libraries.name) {
								_this.respondError('Not all libraries in the libraries array have a "name" property');
								return false;
							}
							if (typeof _this.message.options.scriptData.libraries !== 'string') {
								_this.respondError('Not all library names in the libraries array are of type string');
								return false;
							}
						}
					}
					node.value.libraries = _this.message.options.scriptData.libraries || [];
				} else if (type === 'stylesheet') {
					if (!_this.message.options.stylesheetData) {
						_this.respondError('No stylesheetData option provided');
						return false;
					}
					if (typeof _this.message.options.stylesheetData !== 'object') {
						_this.respondError('StylesheetData specified is not of type object');
						return false;
					}
					node.value = {};
					if (!_this.message.options.stylesheetData.stylesheet) {
						_this.respondError('No stylesheet specified in stylesheetData');
						return false;
					}
					if (typeof _this.message.options.stylesheetData.stylesheet === 'string') {
						_this.respondError('Stylesheet specified in stylesheetData is not of type string');
						return false;
					}
					node.value.stylesheet = _this.message.options.stylesheetData.stylesheet;

					if (_this.message.options.stylesheetData.launchMode !== undefined) {
						if (typeof _this.message.options.stylesheetData.launchMode !== 'number') {
							_this.respondError('LaunchMode specified in stylesheetData is not of type number (0,1,2 are possible)');
							return false;
						}
						if (_this.message.options.stylesheetData.launchMode < 0 || _this.message.options.stylesheetData.launchMode > 2) {
							_this.respondError('Launchmode specified in stylesheetData is not 0, 1 or 2 but instead ' + _this.message.options.stylesheetData.launchMode + '.');
							return false;
						}
					}
					node.value.launchMode = (_this.message.options.stylesheetData.launchMode !== undefined ? _this.message.options.stylesheetData.launchMode : 0);

					if (_this.message.options.stylesheetData.triggers !== undefined) {
						if (typeof _this.message.options.stylesheetData.triggers !== 'object' || _this.message.options.stylesheetData.triggers.length === undefined) {
							_this.respondError('Triggers specified in stylesheetData are not of type array');
							return false;
						}
						for (i = 0; i < _this.message.options.stylesheetData.triggers.length; i++) {
							if (!_this.message.options.stylesheetData.triggers.url) {
								_this.respondError('Not all triggers in the triggers array have a "url" property');
								return false;
							}
							if (typeof _this.message.options.stylesheetData.triggers !== 'string') {
								_this.respondError('Not all urls in the triggers array are of type string');
								return false;
							}
						}
					}
					node.value.triggers = _this.message.options.stylesheetData.triggers || [];

					if (_this.message.options.stylesheetData.toggle !== undefined) {
						if (typeof _this.message.options.stylesheetData.toggle !== 'boolean') {
							_this.respondError('Toggle option specified in stylesheetData is not of type boolean');
							return false;
						}
					}
					node.value.toggle = (_this.message.options.stylesheetData.toggle === false ? false : true);

					if (_this.message.options.stylesheetData.defaultOn !== undefined) {
						if (typeof _this.message.options.stylesheetData.defaultOn !== 'boolean') {
							_this.respondError('DefaultOn option specified in stylesheetData is not of type boolean');
							return false;
						}
					}
					node.value.toggle = (_this.message.options.stylesheetData.toggle === false ? false : true);

					node.value.libraries = _this.message.options.scriptData.libraries || [];
				} else {
					node.value = {};
				}

				//Path
				if (_this.message.options.position) {
					if (typeof _this.message.options.position !== 'object') {
						_this.respondError('Position supplied is not of type object');
						return false;
					}
					if (typeof _this.message.options.position.relation !== 'string') {
						_this.respondError('"Position" specified in position is not of type string');
						return false;
					}
					if (typeof _this.message.options.node !== 'number') {
						_this.respondError('Supplied node in position is not of type number');
						return false;
					}
					var relativeNode = _this.getNodeFromId(_this.message.options.node, false, true);
					if (relativeNode === false) {
						return false;
					}

					//Fix that someone can basically just send a message to the background page, fake an ID and still get their shit executed with extra privilege
				}


				return true;
			});
		}
	};
	/**
	 * Creates a node with the given options
	 * 	 
	 * @param {number} [options.position.node] - The other node, if not given, it becomes a sibling to the CRM's root regardless of "relation"
	 * @param {string} [options.position.relation] - The position relative to the other node, possibilities are:
	 *		firstChild: becomes the first child of given node, throws an error if given node is not of type menu
	 *		firstSibling: first of the subtree that given node is in
	 *		lastChild: becomes the last child of given node, throws an error if given ndoe is not of type menu
	 *		lastSibling: last of the subtree that given node is in
	 *		before: before given node
	 *		after: after the given node
	 * @param {CrmAPIInit~crmCallback} callback - A callback given the new node as an argument
	 */

	this.crmFunctions[this.toRun] && this.crmFunctions[this.toRun]();
}

//TODO if an item is added using a "local" script, also make that item "local"

function crmHandler(message) {
	crmFunction(message, message.action);
}

function chromeHandler(message, respond) {
	//Check permissions
	var api = message.api;
	api = api.split(',')[0];

	var params = '';
	var node = crmByIdFull[message.id];
	var allowedPermissions = (node.isLocal ? '*' : node.permissions || []);
	if (permissions.indexOf(api) > -1) {
		if (allowedPermissions === '*' || allowedPermissions.indexOf(api) > -1) {
			if (availablePermissions.indexOf(api) > -1) {
				for (var i = 0; i < message.args - 1; i++) {
					params.push(message.args[i] + ', ');
				}
				params.push(message.args[message.args.length - 1]);
				try {
					eval('var result = chrome.' + message.api + '(' + params + ')');
					if (message.onFinish) {
						message.onFinish(result);
					}
				} catch (e) {
					respond({
						error: e
					});
				}
			} else {
				respond({
					error: 'Permissions ' + api + ' not available to the extension, visit options page',
					requestPermission: api
				});
				window.chrome.storage.sync.get('requestPermissions', function(keys) {
					var perms = keys.requestPermissions || [api];
					window.chrome.storage.sync.set({
						requestPermissions: perms
					});
				});
			}
		} else {
			respond({
				error: 'Permission ' + api + ' not requested'
			});
		}
	} else {
		respond({
			error: 'Permissions ' + api + ' is not available for use',
			params: [permissions]
		});
	}
}

function establishConnection(message, respond, messageSender) {
	var pingKey = generateRandomKey();
	secretKeys[messageSender.tab.id][message.id].pingKey = pingKey;
	respond({
		type: 'pingKey',
		pingKey: pingKey,
		tabId: messageSender.tab.id
	});
	keysByPings[pingKey] = {
		id: message.id,
		tabId: messageSender.tab.id
	};
}

function handleMessage(message, messageSender, respond) {
	//Check secret key
	
	switch (message.type) {
		case 'update':
			updateHandler(message);
			break;
		case 'crm':
			crmHandler(message);
			break;
		case 'chrome':
			chromeHandler(message, respond);
			break;
		case 'establishConnection':
			establishConnection(message, respond, messageSender);
			break;
	}
}

function main() {
	window.chrome.storage.sync.get(function(syncs) {
		storageSync = syncs;
		window.chrome.storage.local.get(function(locals) {
			storageLocal = locals;
			buildCrmTree(syncs.crm);
			buildCrmStorages(syncs.crm);
			window.chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
				handleMessage(message, sendResponse);
			});
		});
	});
}

window.chrome.permisions.getAll(function (available) {
	availablePermissions = available.permissions;
	main();
});