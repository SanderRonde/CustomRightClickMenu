///<reference path="../../../scripts/_references.js"/>
var permissions = [
	"http://*/",
	"alarms",
	"background",
	"bookmarks",
	"browsingData",
	"clipboardRead",
	"clipboardWrite",
	"contentSettings",
	"cookies",
	"contentSettings",
	"debugger",
	"declarativeContent",
	"desktopCapture",
	"downloads",
	"fontSettings",
	"history",
	"identity",
	"idle",
	"management",
	"notifications",
	"pageCapture",
	"power",
	"printerProvider",
	"privacy",
	"proxy",
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
var crmStorages = {};

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

function buildCrmTree(crm) {
	var tree = [];
	var crmCopy = JSON.parse(JSON.stringify(crm));
	for (var i = 0; i < crmCopy.length; i++) {
		tree.push(crmCopy[i]);
		removeStorage(crmCopy[i]);
	}
	crmTree = tree;
}

function parseNode(node) {
	if (node.children && node.children.length > 0) {
		for (var i = 0; i < node.children.length; i++) {
			parseNode(node.children[i]);
		}
	} else {
		crmStorages[node.id] = node;
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
		message.onFinish(crmStorages[message.nodeId]);
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

function crmHandler(message) {

	//TODO alles moet dus individuele permissions hebben, tuff shit, en ook global permissions dus
	//en crm permissions doen, ook rawData btw

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
	var params = '';
	for (var i = 0; i < message.args - 1; i++) {
		params.push('message.args[' + i + '], ');
	}
	params.push('message.args[' + message.args.length - 1 + ']');
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
			chromeHandler(message);
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