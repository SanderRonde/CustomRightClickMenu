var matched = false;
chrome.runtime.onMessage.addListener(function (message, sender, respond) {
	if (message.type === 'checkTabStatus') {
		//Code was already executed here, check if it has been matched before
		respond({
			notMatchedYet: matched
		});
		if (message.data.willBeMatched) {
			matched = true;
		}
	}
});

chrome.runtime.sendMessage({
	type: 'newTabCreated'
}, function(response) {
	if (response && response.matched) {
		matched = true;
	}
});

function generateLinkHandler(linkData) {
	return function() {
		alert('Would open links ' + linkData.map(function(link) {
			return link.url
		}).join(', ') + '.');
	}
}

function generateScriptHandler() {
	return function() {
		alert('Would run a script');
	}
}

function generateStylesheetHandler() {
	return function() {
		alert('Would run a stylesheet');
	}
}

function generateNodeData(node) {
	var data = {};
	data.name = node.name || 'name';
	if (node.children) {
		data.items = [];
		for (var i = 0; i < node.children.length; i++) {
			if (node.children[i]) {
				data.items.push(generateNodeData(node.children[i]));
			}
		}
	}
	switch (node.type) {
		case 'link':
			data.callback = generateLinkHandler(node.value);
			break;
		case 'script':
			data.callback = generateScriptHandler();
			break;
		case 'stylesheet':
			if (node.value.toggle) {
				data.type = 'checkbox';
				data.selected = toAdd.value.defaultOn;
			} else {
				data.callback = generateStylesheetHandler();
			}
			break;
		case 'divider':
			return '---------';
	}
	return data;
}

var demoId = 999;

function createDemo(element, callback) {
	var data = element.getAttribute('data-crm');
	var dataTree;
	try {
		dataTree = JSON.parse(data);
	} catch (e) {
		console.log('Could not create CRM demo because the data is not in the correct format');
		return;
	}

	//Get the data and handlers
	var nodeData = dataTree.map(function(dataBranch) {
		return generateNodeData(dataBranch);
	});
	console.log(nodeData);
	console.log(dataTree);

	var demoClass = 'CRMDemoElement' + (++demoId);
	element.classList.add(demoClass);
	var demoClassSelector = '.' + demoClass;

	//Build the HTML menu
	jQuery.contextMenu({
		selector: '.CustomRightClickMenuTryArea' + demoClassSelector + ' ,CustomRightClickMenuTryArea' + demoClassSelector,
		items: nodeData
	});

	callback();
}

function createDemoCallback(elements, index) {
	return function() {
		setTimeout(function() {
			if (elements.length !== index) {
				createDemo(elements[index], createDemoCallback(elements, index + 1));
			}
		}, 0);
	}
}

var foundDemo = false;
function findCRMDemoAreas() {
	var elements = [];
	if ((elements = document.querySelectorAll('.CustomRightClickMenuTryArea, #CustomRightClickMenuTryArea')).length > 0) {
		//Now create those demos
		createDemoCallback(elements, 0)();
	}
}

window.setTimeout(findCRMDemoAreas, 2500);