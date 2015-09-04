///<reference path="../../../scripts/_references.js"/>
var permissions = [
	"alarms",
	"background",
	"bookmarks",
	"browsingData",
	"clipboardRead",
	"clipboardWrite",
	"contentSettings",
	"cookies",
	"contentSettings",
	"declarativeContent",
	"desktopCapture",
	"downloads",
	"history",
	"identity",
	"idle",
	"management",
	"notifications",
	"pageCapture",
	"power",
	"printerProvider",
	"privacy",
	"sessions",
	"system.cpu",
	"system.memory",
	"system.storage",
	"topSites",
	"tabCapture",
	"tts",
	"webNavigation",
	"webRequest",
	"webRequestBlocking"
];

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
		value: node.value
	};
	for (j = 0; j < 4; j++) {
		oldVal = vals + 'Val';
		if (node[oldVal]) {
			newNode[oldVal] = node[oldVal];
		}
	}
	return newNode;
}

function refreshPermissions() {
	chrome.permisions.getAll(function(available) {
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

function buildCrmTree() {
	var i;
	var tree = [];
	for (i = 0; i < crmCopy.length; i++) {
		tree.push(getSafeData(crmCopy[i]));
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
	chrome.storage.sync.get(function (syncs) {
		storageSync = syncs;
		chrome.storage.local.get(function (locals) {
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

function lookup(path, data, hold) {
	checkType(path, 'array', 'path');
	checkType(data, 'Object', 'data');
	var length = path.length;
	hold && length--;
	for (var i = 0; i < length; i++) {
		data = data[path[i]];
	}
	return data;
}

var crmFunctions = {
	getRawCrm: function (message) {
		chrome.storage.sync.get(function(crm) {
			message.onFinish(crmTree);
		});
	},
	getTree: function (message) {
		message.onFinish(crmTree);
	},
	getSubTree: function(message) {
		message.onFinish(crmById[message.nodeId]);
	},
	getNode: function(message) {
		this.getSubTree(message);
	},
	getNodeIdFromPath: function(message) {
		message.onFinish(lookup(message.path, crmTree).id);
	},
	queryCrm: function(message) {
		var searchScope = crmTree;
		if (message.inSubTree !== undefined) {
			searchScope = getSubTree(message.inSubTree);
		}
	}
};

//TODO if an item is added using a "local" script, also make that item "local"

function crmHandler(message) {
	var toExecute = crmFunctions[message.action];
	toExecute && toExecute(message);

	function onFinish(status, messageOrParams) {
		if (status === 'error') {
			throw new Error(messageOrParams);
		} else {
			callback.apply(_this, messageOrParams);
		}
	}

	var messageContent = params || {};
	messageContent.type = 'crm';
	messageContent.id = id;
	messageContent.action = action;
	messageContent.crmPath = item.path;
	messageContent.onFinish = onFinish;
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
				chrome.storage.sync.get('requestPermissions', function(keys) {
					var perms = keys.requestPermissions || [api];
					chrome.storage.sync.set({
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

function handleMessage(message, respond) {
	switch (message.type) {
		case 'update':
			updateHandler(message);
			break;
		case 'crm':
			crmHandler(message, respond);
			break;
		case 'chrome':
			chromeHandler(message, respond);
			break;
	}
}

function handleTask(task) {
	var params = [];
	for (var i = 1; i < arguments.length; i++) {
		params.push(arguments[i]);
	}
	if (working) {
		queue.push({
			task: task,
			params: params
		});
	} else {
		task.call(window, params);
	}
}

function main() {
	chrome.storage.sync.get(function(syncs) {
		storageSync = syncs;
		chrome.storage.local.get(function(locals) {
			storageLocal = locals;
			buildCrmTree(syncs.crm);
			buildCrmStorages(syncs.crm);
			chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
				handleMessage(message, sendResponse);
			});
		});
	});
}

chrome.permisions.getAll(function (available) {
	availablePermissions = available.permissions;
	main();
});