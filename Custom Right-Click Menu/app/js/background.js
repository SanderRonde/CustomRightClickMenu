///<reference path="../../../scripts/_references.js"/>
///<reference path="e.js"/>
/*#region Handling of crmapi.js*/
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
var safeTree;
var crmByIdSafe = {};
var crmById = {};

function safe(node) {
	return crmByIdSafe[node.id];
}

function pushIntoArray(toPush, position, target) {
	var length = target.length + 1;
	var temp1 = target[position];
	var temp2 = toPush;
	for (var i = position; i < length; i++) {
		target[i] = temp2;
		temp2 = temp1;
		temp1 = target[i + 1];
	}
	return target;
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

function lookup(path, data, hold) {
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

function makeSafe(node) {
	var newNode = {
		id: node.id,
		path: node.path,
		type: node.type,
		name: node.name,
		value: node.value,
		linkVal: node.linkVal,
		menuVal: node.menuVal,
		children: node.children,
		scriptVal: node.scriptVal,
		stylesheetval: node.stylesheetVal
	};
	return newNode;
}

function parseNode(node, isSafe) {
	if (node.children && node.children.length > 0) {
		for (var i = 0; i < node.children.length; i++) {
			parseNode(node.children[i], safe);
		}
	} else {
		if (isSafe) {
			crmByIdSafe[node.id] = safe(node);
		} else {
			crmById[node.id] = node;
		}
	}
}

function buildByIdObjects(crm) {
	for (var i = 0; i < crm.length; i++) {
		parseNode(crm);
		parseNode(safeTree, true);
	}
}

function safeTreeParse(node) {
	if (node.children) {
		var children = [];
		for (var i = 0; i < node.children.length; i++) {
			children.push(safeTreeParse(node.children[i]));
		}
		node.children = children;
	}
	return makeSafe(node);
}

function buildSafeTree(crm) {
	var treeCopy = JSON.parse(JSON.stringify(crm));
	var safeTree = [];
	for (var i = 0; i < treeCopy.length; i++) {
		safeTree.push(safeTreeParse(treeCopy[i]));
	}
	return safeTree;
}

function updateStorage() {
	window.chrome.storage.sync.get(function(data) {
		storageSync = data;
		window.chrome.storage.local.get(function (locals) {
			storageLocal = locals;
			crmTree = data.crm;
			safeTree = buildSafeTree(data.crm);
			buildByIdObjects(data.crm);
		});
	});
}

function updateCrm() {
	window.chrome.storage.sync.set({
		crm: crmTree
	});
	updateStorage();
}

function updateNodeStorage(message) {
	crmById[message.id].storage = message.storage;
	updateStorage();
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
		return true;
	};

	this.respondError = function(error) {
		this.message.onFinish('error', error);
		return true;
	};

	this.lookup = function(path, data, hold) {
		return lookup(path, data, hold);
	};

	this.checkType = function(toCheck, type, name, optional, ifndef, array, ifdef) {
		if (!toCheck) {
			if (optional) {
				ifndef && ifndef();
				return true;
			} else {
				if (array) {
					_this.respondError('Not all values for ' + name + ' are defined');
				} else {
					_this.respondError('Value for ' + name + ' is not defined');
				}
				return false;
			}
		} else {
			if (type === 'array') {
				if (typeof toCheck !== 'object' || toCheck.length === undefined) {
					if (array) {
						_this.respondError('Not all values for ' + name + ' are of type ' + type);
					} else {
						_this.respondError('Value for ' + name + ' is not of type ' + type);
					}
					return false;
				}
			}
			if (typeof toCheck !== type) {
				if (array) {
					_this.respondError('Not all values for ' + name + ' are of type ' + type);
				} else {
					_this.respondError('Value for ' + name + ' is not of type ' + type);
				}
				return false;
			}
		}
		ifdef && ifdef();
		return true;
	};

	this.moveNode = function(node, position) {
		var relativeNode;
		var parentChildren;
		if (position) {
			if (!_this.checkType(position, 'object', 'position')) {
				return false;
			}
			if (!_this.checkType(position.node, 'number', 'node', true, function() {
				relativeNode = crmTree;
			})) {
				return false;
			}
			if (!_this.checkType(position.relation, 'string', 'relation', true, function() {
				position.relation = 'firstSibling';
				relativeNode = crmTree;
			})) {
				return false;
			}
			relativeNode = relativeNode || _this.getNodeFromId(_this.message.options.node, false, true);
			if (relativeNode === false) {
				return false;
			}
			switch (position.relation) {
			case 'before':
				if (relativeNode) {
					parentChildren = _this.lookup(relativeNode.path, crmTree, true);
					if (relativeNode.path.length > 0) {
						pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
					} else {
						_this.respondError('Suppplied node is the root of the crm tree, supply no node to append to root');
					}
					break;
				}
			case 'firstSibling':
				if (relativeNode) {
					parentChildren = _this.lookup(relativeNode.path, crmTree, true);
					pushIntoArray(node, 0, parentChildren);
					break;
				}
			case 'firstChild':
				if (relativeNode) {
					if (relativeNode.type !== 'menu') {
						_this.respondError('Supplied node is not of type "menu"');
						return false;
					}
					pushIntoArray(node, 0, relativeNode.children);
				} else {
					pushIntoArray(node, 0, crmTree);
				}
				break;
			case 'after':
				if (relativeNode) {
					parentChildren = _this.lookup(relativeNode.path, crmTree, true);
					if (relativeNode.path.length > 0) {
						pushIntoArray(node, relativeNode.path[relativeNode.path.length + 1] + 1, parentChildren);
					} else {
						_this.respondError('Suppplied node is the root of the crm tree, supply no node to append to root');
					}
					break;
				}
			case 'lastSibling':
				if (relativeNode) {
					parentChildren = _this.lookup(relativeNode.path, crmTree, true);
					pushIntoArray(node, parentChildren.length - 1, parentChildren);
					break;
				}
				break;
			case 'lastChild':
				if (relativeNode) {
					if (relativeNode.type !== 'menu') {
						_this.respondError('Supplied node is not of type "menu"');
						return false;
					}
					pushIntoArray(node, relativeNode.children.length - 1, relativeNode.children);
				} else {
					pushIntoArray(node, relativeNode.children.length - 1, crmTree);
				}
				break;
			}
		} else {
			//Place in default position, firstChild of root
			pushIntoArray(node, 0, crmTree);
		}
		return true;
	};

	this.getNodeFromId = function(id, safe, noCallback) {
		var node = (safe ? crmByIdSafe : crmById)[id];
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

	this.checkPermissions = function (permissions, callbackOrOptional, callback) {
		var optional = [];
		if (callbackOrOptional !== undefined && callbackOrOptional !== null && typeof callbackOrOptional === 'object') {
			optional = callbackOrOptional;
		} else {
			callback = callbackOrOptional;
		}
		var permitted = true;
		var notPermitted = [];
		var node = _this.getNodeFromId(message.id, false, true);
		if (node.isLocal) {
			callback && callback(optional);
		} else {
			var i;
			for (i = 0; i < permissions.length; i++) {
				if (node.permissions.indexOf(permissions[i]) === -1) {
					permitted = false;
					notPermitted.push(permissions[i]);
				}
			}

			if (!permitted) {
				_this.respondError('Permission' + (notPermitted.length === 1 ? ' ' + notPermitted[0] : 's ' + notPermitted.join(', ')) + ' are not available to this script.');
			} else {
				var length = optional.length;
				for (i = 0; i < length; i++) {
					if (node.permissions.indexOf(optional[i]) === -1) {
						optional.splice(i, 1);
						length--;
						i--;
					}
				}
				callback && callback(optional);
			}
		}
	};

	this.crmFunctions = {
		getTree: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.respondSuccess(safeTree);
			});
		},
		getSubTree: function(id) {
			_this.checkPermissions(['crmGet'], function() {
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
			});
		},
		getNode: function() {
			this.getSubTree();
		},
		getNodeIdFromPath: function(path) {
			_this.checkPermissions(['crmGet'], function() {
				var pathToSearch = path || _this.message.path;
				var lookedUp = lookup(pathToSearch, safeTree, false);
				if (lookedUp === true) {
					return false;
				} else if (lookedUp === false) {
					_this.respondError('Path does not return a valid value');
					return false;
				} else {
					_this.respondSuccess(lookedUp.id);
					return lookedUp.id;
				}
			});
		},
		queryCrm: function() {
			_this.checkPermissions(['crmGet'], function() {
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

				var searchScope = safeTree;
				if (!_this.checkType(_this.message.query, 'object', 'query')) {
					return false;
				}
				if (_this.message.query.inSubTree) {
					searchScope = _this.getNodeFromId(_this.message.query.inSubTree, false, true);
				}

				//Convert to array
				if (!_this.checkType(_this.message.query.type, 'string', 'type', true)) {
					return false;
				}
				findType(searchScope, _this.message.query.type);

				if (!_this.checkType(_this.message.query.name, 'string', 'name', true)) {
					return false;
				}
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
				return true;

			});
		},
		getParentNode: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					var pathToSearch = JSON.parse(JSON.stringify(node.path));
					pathToSearch.pop();
					var parentId = this.getNodeIdFromPath(pathToSearch);
					if (parentId !== false) {
						_this.respondSuccess(_this.getNodeFromId(parentId, true, true));
					}
				});
			});
		},
		getChildren: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					_this.respondSuccess(node.children || []);
				});
			});
		},
		getNodeType: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					_this.respondSuccess(node.type);
				});
			});
		},
		getNodeValue: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					_this.respondSuccess(node.value);
				});
			});
		},
		createNode: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
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
					if (_this.getNodeFromId(_this.message.id, false, true).local === true) {
						node.local = true;
					}
					if (type === 'link') {
						if (_this.message.options.linkData) {
							node.value = [];
							if (!_this.checkType(_this.message.options.linkData, 'array', 'linkData')) {
								return false;
							}
							for (i = 0; i < _this.message.options.linkData.length; i++) {
								if (!_this.checkType(_this.message.options.linkData[i], 'object', 'linkData', false, null, true)) {
									return false;
								}
								if (!_this.checkType(_this.message.options.linkData[i].url, 'string', 'linkData.url', false, null, true)) {
									return false;
								}
								if (!_this.checkType(_this.message.options.linkData[i].newTab, 'boolean', 'linkData.newTab', true)) {
									return false;
								}
							}
							for (i = 0; i < _this.message.options.linkData.length; i++) {
								node.value.push({
									url: _this.message.options.linkData[i].url,
									newTab: (_this.message.options.linkData[i].newTab === false ? false : true)
								});
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
						if (!_this.checkType(_this.message.options.scriptData, 'object', 'scriptData')) {
							return false;
						}
						node.value = {};
						if (!_this.checkType(_this.message.options.scriptData.script, 'string', 'scriptData.script')) {
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

						if (!_this.checkType(_this.message.options.scriptData.triggers, 'array', 'scriptData.triggers', true)) {
							return false;
						}
						for (i = 0; i < _this.message.options.scriptData.triggers.length; i++) {
							if (!_this.checkType(_this.message.options.scriptData.triggers[i].url, 'string', 'scriptData.triggers.url', false, null, true)) {
								return false;
							}
						}
						node.value.triggers = _this.message.options.scriptData.triggers || [];

						if (!_this.checkType(_this.message.options.scriptData.libraries, 'array', 'scriptData.libraries', true)) {
							return false;
						}
						for (i = 0; i < _this.message.options.scriptData.libraries.length; i++) {
							if (!_this.checkType(_this.message.options.scriptData.libraries.name, 'string', 'scriptData.libraries.name', false, null, true)) {
								return false;
							}
						}
						node.value.libraries = _this.message.options.scriptData.libraries || [];
					} else if (type === 'stylesheet') {
						if (!_this.checkType(_this.message.options.stylesheetData, 'object', 'stylesheetData')) {
							return false;
						}
						node.value = {};

						if (!_this.checkType(_this.message.options.scriptData.stylesheet, 'string', 'stylesheetData.stylesheet')) {
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

						if (!_this.checkType(_this.message.options.stylesheetData.triggers, 'array', 'stylesheetData.triggers', true)) {
							return false;
						}
						for (i = 0; i < _this.message.options.stylesheetData.triggers.length; i++) {
							if (!_this.checkType(_this.message.options.stylesheetData.triggers[i].url, 'string', 'stylesheetData.triggers.url', false, null, true)) {
								return false;
							}
						}
						node.value.triggers = _this.message.options.stylesheetData.triggers || [];

						if (!_this.checkType(_this.message.options.stylesheetData.toggle, 'boolean', 'stylesheetData.toggle', true)) {
							return false;
						}
						node.value.toggle = (_this.message.options.stylesheetData.toggle === false ? false : true);

						if (!_this.checkType(_this.message.options.stylesheetData.defaultOn, 'boolean', 'stylesheetData.defaultOn', true)) {
							return false;
						}
						node.value.toggle = (_this.message.options.stylesheetData.toggle === false ? false : true);

						node.value.libraries = _this.message.options.scriptData.libraries || [];
					} else {
						node.value = {};
					}

					if (moveNode(node, _this.message.options.position)) {
						updateCrm();
						_this.respondSuccess(node);
					} else {

						return false;
					}
					return true;
				});
			});
		},
		copyNode: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					if (!_this.checkType(_this.message.options, 'object', 'options')) {
						return false;
					}
					var newNode = JSON.parse(JSON.stringify(node));
					generateItemId(function(id) {
						newNode.id = id;
						if (_this.getNodeFromId(_this.message.id, false, true).local === true && node.local === true) {
							newNode.local = true;
						}
						delete newNode.storage;
						delete newNode.file;
						if (!_this.checkType(_this.message.options.name, 'string', 'options.name', true, null, false, function() {
							newNode.name = name;
						})) {
							return false;
						}
						if (moveNode(newNode, _this.message.options.position)) {
							updateCrm();
							_this.respondSuccess(newNode);
						}
						return true;
					});
					return true;
				});

			});
			return true;
		},
		moveNode: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (moveNode(node, _this.message.options.position)) {
						updateCrm();
						_this.respondSuccess(safe(node));
					}
				});

			});
		},
		deleteNode: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					var parentChildren = _this.lookup(node.path, crmTree, true);
					parentChildren.splice(node.path[node.path.length - 1], 1);
					_this.respondSuccess(true);
					updateCrm();
				});

			});
		},
		editNode: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.options, 'object', 'options')) {
						return false;
					}
					if (!_this.checkType(_this.message.options.name, 'string', 'options.name', true)) {
						return false;
					}
					if (!_this.checkType(_this.message.options.type, 'string', 'options.type', true, null, false, function() {
						if (_this.message.options.type !== 'link' &&
							_this.message.options.type !== 'script' &&
							_this.message.options.type !== 'stylesheet' &&
							_this.message.options.type !== 'menu' &&
							_this.message.options.type !== 'divider') {
							_this.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
							return false;
						} else {
							node.type = _this.message.options.type;
						}
						return true;
					})) {
						return false;
					}
					if (_this.message.options.name) {
						node.name = _this.message.options.name;
					}
					updateCrm();
					_this.respondSuccess(safe(node));
					return true;
				});

			});
		},
		linkGetLinks: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					if (node.type === 'link') {
						_this.respondSuccess(node.value);
					} else {
						_this.respondSuccess(node.linkval);
					}
					return true;
				});

			});
		},
		linkPush: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (typeof _this.message.items !== 'object') {
						_this.respondError('Given items parameter is not of type object or array');
						return false;
					}
					if (_this.message.items.length !== undefined) { //Array
						for (var i = 0; i < _this.message.items.length; i++) {
							if (_this.message.items[i].newTab !== undefined) {
								if (typeof _this.message.items[i].newTab !== 'boolean') {
									_this.respondError('The newtab property of one or more items are not of type boolean');
									return false;
								}
							}
							if (!_this.message.items[i].url) {
								_this.respondError('The URL property is not defined in all given items');
								return false;
							}
						}
						if (node.type === 'link') {
							node.value.push(_this.message.items);
						} else {
							node.linkVal.push = node.linkVal.push || [];
							node.linkVal.push(_this.message.items);
						}
					} else { //Object
						if (_this.message.items.newTab !== undefined) {
							if (typeof _this.message.items.newTab !== 'boolean') {
								_this.respondError('The newtab property in given item is not of type boolean');
								return false;
							}
						}
						if (!_this.message.items.url) {
							_this.respondError('The URL property is not defined in the given item');
							return false;
						}
						if (node.type === 'link') {
							node.value.push(_this.message.items);
						} else {
							node.linkVal.push = node.linkVal.push || [];
							node.linkVal.push(_this.message.items);
						}
					}
					updateCrm();
					if (node.type === 'link') {
						_this.respondSuccess(safe(node).value);
					} else {
						_this.respondSuccess(safe(node).linkVal);
					}
					return true;
				});

			});
		},
		linkSplice: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.start, 'number', 'start')) {
						return false;
					}
					if (!_this.checkType(_this.message.amount, 'number', 'amount')) {
						return false;
					}
					var spliced;
					if (node.type === 'link') {
						spliced = node.value.splice(_this.message.start, _this.message.amount);
						updateCrm();
						_this.respondSuccess(spliced, safe(node).value);
					} else {
						node.linkVal = node.linkVal || [];
						spliced = node.linkVal.splice(_this.message.start, _this.message.amount);
						updateCrm();
						_this.respondSuccess(spliced, safe(node).linkVal);
					}
					return true;
				});

			});
		},
		linkForEach: function() {
			_this.checkPermissions(['crmGet'], ['crmWrite'], function(permitted) {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.process, 'function', 'process')) {
						return false;
					}
					var i;
					if (node.type === 'link') {
						if (permitted.length === 1) {
							for (i = 0; i < node.value.length; i++) {
								_this.message.process(node.value.length[i], i);
							}
						} else {
							node.value.forEach(_this.message.process);
						}
						updateCrm();
						_this.respondSuccess(safe(node).value);
					} else {
						node.linkVal = node.linkVal || [];
						if (permitted.length === 1) {
							for (i = 0; i < node.value.length; i++) {
								_this.message.process(node.linkVal.length[i], i);
							}
						} else {
							node.linkVal.forEach(_this.message.process);
						}
						updateCrm();
						_this.respondSuccess(node.linkVal);
					}
					return true;
				});

			});
		},
		setScriptLaunchMode: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					_this.checkType(_this.message.launchMode, 'number', 'launchMode', false, null, false, function() {
						if (_this.message.launchMode < 0 || _this.message.launchMode > 2) {
							return false;
						}
						if (node.type === 'script') {
							node.value.launchMode = _this.message.launchMode;
						} else {
							node.scriptVal = node.scriptVal || {};
							node.scriptVal.launchMode = _this.message.launchMode;
						}
						updateCrm();
						_this.respondSuccess(safe(node));
						return true;
					});
				});

			});
		},
		getScriptLaunchMode: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (node.type === 'script') {
						_this.respondSuccess(node.value.launchMode);
					} else {
						(node.scriptVal && _this.respondSuccess(node.scriptVal.launchMode)) || _this.respondSuccess(undefined);
					}
				});

			});
		},
		registerLibrary: function() {
			_this.checkPermissions(['registerLibrary'], function() {
				window.chrome.storage.local.get('libraries', function(items) {
					var libraries = items.libraries;
					if (!_this.checkType(_this.message.name, 'string', 'name')) {
						return false;
					}
					var newLibrary = {
						name: _this.message.name
					};
					if (_this.message.url) {
						if (_this.message.url.indexOf('.js') === _this.message.url.length - 3) {
							//Use URL
							var done = false;
							var xhr = new XMLHttpRequest();
							xhr.open('GET', _this.message.url, true);
							xhr.onreadystatechange = function() {
								if (xhr.readyState === 4 && xhr.status === 200) {
									done = true;
									newLibrary.code = xhr.responseText;
									newLibrary.url = _this.message.url;
									libraries.push(newLibrary);
									window.chrome.storage.local.set({
										libraries: libraries
									});
									_this.respondSuccess(newLibrary);
								}
							};
							setTimeout(function() {
								if (!done) {
									_this.respondError('Request timed out');
								}
							}, 5000);
							xhr.send();
						} else {
							_this.respondError('No valid URL given');
							return false;
						}
					} else if (_this.message.code) {
						if (typeof _this.message.code === 'string') {
							newLibrary.code = _this.message.code;
							libraries.push(newLibrary);
							window.chrome.storage.local.set({
								libraries: libraries
							});
							_this.respondSuccess(newLibrary);
						} else {
							_this.respondError('Code parameter given is not of type string');
							return false;
						}
					} else {
						_this.respondError('No URL or code given');
						return false;
					}
					return true;
				});

			});
		}, //TODO also different section in crmapi.js - registerLibrary
		scriptLibraryPush: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.libraries, 'object', 'libraries')) {
						return false;
					}
					if (_this.message.libraries.length !== undefined) { //Array
						for (var i = 0; i < _this.message.libraries.length; i++) {
							if (!_this.checkType(_this.message.libraries[i].name, 'string', 'libraries.name', false, null, true)) {
								return false;
							}
							if (node.type === 'script') {
								node.value.libraries.push(_this.message.libraries);
							} else {
								node.scriptVal = node.scriptVal || {};
								node.scriptVal.libraries = node.scriptVal.libraries || [];
								node.scriptVal.libraries.push(_this.message.libraries);
							}
						}
					} else { //Object
						if (!_this.checkType(_this.message.libraries.name, 'stirng', 'libraries.name', false, null, true)) {
							return false;
						}
						if (node.type === 'script') {
							node.value.libraries.push(_this.message.libraries);
						} else {
							node.scriptVal = node.scriptVal || {};
							node.scriptVal.libraries = node.scriptVal.libraries || [];
							node.scriptVal.libraries.push(_this.message.libraries);
						}
					}
					updateCrm();
					if (node.type === 'script') {
						_this.respondSuccess(safe(node).value.libraries);
					} else {
						_this.respondSuccess(node.scriptVal.libraries);
					}
					return true;
				});

			});
		},
		scriptLibrarySplice: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.start, 'number', 'start')) {
						return false;
					}
					if (!_this.checkType(_this.message.amount, 'number', 'amount')) {
						return false;
					}
					var spliced;
					if (node.type === 'script') {
						spliced = safe(node).value.libraries.splice(_this.message.start, _this.message.amount);
						updateCrm();
						_this.respondSuccess(spliced, safe(node).value.libraries);
					} else {
						node.scriptVal = node.scriptVal || {};
						node.scriptVal.libraries = node.scriptVal.libraries || [];
						spliced = node.scriptVal.libraries.splice(_this.message.start, _this.message.amount);
						updateCrm();
						_this.respondSuccess(spliced, node.scriptVal.libraries);
					}
					return true;
				});

			});
		},
		setScriptValue: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.script, 'string', 'script')) {
						return false;
					}
					if (node.type === 'script') {
						node.value.script = script;
					} else {
						node.scriptVal = node.scriptVal || {};
						node.scriptVal.script = script;
					}
					updateCrm();
					_this.respondSuccess(safe(node));
					return true;
				});

			});
		},
		getScriptValue: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					if (node.type === 'script') {
						_this.respondSuccess(node.value.script);
					} else {
						(node.scriptVal && _this.respondSuccess(node.scriptVal.script)) || _this.respondSuccess(undefined);
					}
				});

			});
		},
		getMenuChildren: function() {
			_this.checkPermissions(['crmGet'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					if (node.type === 'menu') {
						_this.respondSuccess(node.children);
					} else {
						_this.respondSuccess(node.menuVal);
					}
				});

			});
		},
		setMenuChildren: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId, true).run(function(node) {
					if (!_this.checkType(_this.message.childrenIds, 'array', 'childrenIds')) {
						return false;
					}
					var i;
					for (i = 0; i < _this.message.childrenIds.length; i++) {
						if (!_this.checkType(_this.message.childrenIds[i], 'number', 'childrenIds', false, null, true)) {
							return false;
						}
					}
					var children = [];
					for (i = 0; i < _this.message.childrenIds.length; i++) {
						children.push(_this.getNodeFromId(_this.message.childrenIds[i], true, true));
					}
					if (node.type === 'menu') {
						node.children = children;
					} else {
						node.menuVal = children;
					}
					updateCrm();
					_this.respondSuccess(safe(node));
					return true;
				});

			});
		},
		pushMenuChildren: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.childrenIds, 'array', 'childrenIds')) {
						return false;
					}
					var i;
					for (i = 0; i < _this.message.childrenIds.length; i++) {
						if (!_this.checkType(_this.message.childrenIds[i], 'number', 'childrenId', false, null, true)) {
							return false;
						}
					}
					var children = [];
					for (i = 0; i < _this.message.childrenIds.length; i++) {
						children[i] = _this.getNodeFromId(_this.message.childrenIds[i], false, true);
					}
					if (node.type === 'menu') {
						node.children.push(children);
					} else {
						node.menuVal.push(children);
					}
					updateCrm();
					_this.respondSuccess(safe(node));
					return true;
				});

			});
		},
		spliceMenuChildren: function() {
			_this.checkPermissions(['crmGet', 'crmWrite'], function() {
				_this.getNodeFromId(_this.message.nodeId).run(function(node) {
					if (!_this.checkType(_this.message.start, 'number', 'start')) {
						return false;
					}
					if (!_this.checkType(_this.message.amount, 'number', 'amount')) {
						return false;
					}
					var spliced = (node.type === 'menu' ? node.children : node.menuVal).splice(_this.message.start, _this.message.amount);
					updateCrm();
					_this.respondSuccess(spliced, (node.type === 'menu' ? safe(node).children : safe(node).menuVal));
					return true;
				});

			});
		}
	};

	this.crmFunctions[this.toRun] && this.crmFunctions[this.toRun]();
}

function crmHandler(message) {
	crmFunction(message, message.action);
}

function chromeHandler(message, respond) {
	var node = crmById[message.id];
	var apiPermission = message.api.split(',').split('.')[0];
	var chromeFound = (node.permissions.indexOf('chrome') > 1);
	var apiFound = (node.permissions.indexOf(apiPermission) > 1);
	if (!chromeFound && !apiFound) {
		respond({
			error: 'Both permissions chrome and ' + apiPermission + ' not available to this script'
		});
	}
	else if (!chromeFound) {
		respond({
			error: 'Permission chrome not available to this script'
		});
	}
	else if (!apiFound) {
		respond({
			error: 'Permission ' + apiPermission + ' not avilable to this script'
		});
	} else {
		//Check permissions
		var api = message.api;
		api = api.split(',')[0];

		var params = '';
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
						error: 'Permissions ' + api + ' not available to the extension, visit options page'
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
				error: 'Permissions ' + api + ' is not available for use'
			});
		}
	}
}

function pingHandler(message, messageSender) {
	secretKeys[messageSender.tab.id][message.id].alive = true;
}

function handleMessage(message, messageSender, respond) {
	var result = de(message.msg, secretKeys[messageSender.tab.id][message.id].secretKey);
	if (result !== false) {
		message = result;

		switch (message.type) {
		case 'updateStorage':
			updateNodeStorage(message);
			break;
		case 'crm':
			crmHandler(message);
			break;
		case 'chrome':
			chromeHandler(message, respond);
			break;
		case 'ping':
			pingHandler(message, messageSender);
			break;
		}
	}
	//Fail silently
}

function checkAlive() {
	var tab;
	var script;
	var children;
	for (tab in secretKeys) {
		if (secretKeys.hasOwnProperty(tab)) {
			children = 0;
			for (script in secretKeys[tab]) {
				if (tab.hasOwnProperty(secretKeys[tab][script])) {
					children++;
					if (secretKeys[tab][script].alive === undefined) {
						//Still setting up for the first ping, give it a second
						secretKeys[tab][script].alive = false;
					}
					else if (secretKeys[tab][script].alive === false) {
						delete secretKeys[tab][script];
					}
				}
			}
			if (children === 0) {
				//Delete empty tabs
				delete secretKeys[tab];
			}
		}
	}
}

var pingInterval = window.setInterval(checkAlive, 30000);

function main() {
	window.chrome.storage.sync.get(function (data) {
		storageSync = data;
		window.chrome.storage.local.get(function (locals) {
			storageLocal = locals;
			crmTree = data.crm;
			safeTree = buildSafeTree(data.crm);
			buildByIdObjects(data.crm);
			var bgPageUrl = window.chrome.runtime.getURL('_generated_background_page.html');
			window.chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
				if (bgPageUrl !== sender.url) { //Don't talk to yourself
					handleMessage(message, sendResponse);
				}
			});
		});
	});
}

window.chrome.permissions.getAll(function (available) {
	availablePermissions = available.permissions;
	main();
});
/*#endregion*/

/*#region Right-Click Menu Handling*/

/*#endregion*/