var matched = false;
var contextMenuEventKeys = ['clientX', 'clientY', 'offsetX',' offsetY', 'pageX', 'pageY', 'screenX',
	'screenY', 'which', 'x', 'y']
var lastContextmenuCall = null;
var contextElementId = 1;
chrome.runtime.onMessage.addListener(function (message, sender, respond) {
	switch (message.type) {
		case 'checkTabStatus':
			//Code was already executed here, check if it has been matched before
			respond({
				notMatchedYet: !matched
			});
			if (message.data.willBeMatched) {
				matched = true;
			}
			break;
		case 'getLastClickInfo':
			var responseObj = {};
			for (var key in lastContextmenuCall) {
				if (contextMenuEventKeys.indexOf(key) !== -1) {
					responseObj[key] = lastContextmenuCall[key];
				}
			}

			lastContextmenuCall.srcElement.classList.add('crm_element_identifier_' + ++contextElementId);
			responseObj.srcElement = contextElementId;
			lastContextmenuCall.target.classList.add('crm_element_identifier_' + ++contextElementId);
			responseObj.target = contextElementId;
			lastContextmenuCall.toElement.classList.add('crm_element_identifier_' + ++contextElementId);
			responseObj.toElement = contextElementId;
			respond(responseObj);
			break;
	}
});

chrome.runtime.sendMessage({
	type: 'newTabCreated'
}, function(response) {
	if (response && response.matched) {
		matched = true;
	}
});

var installURL = chrome.runtime.getURL('html/install.html');
document.body.addEventListener('mousedown', function(e) {
	var target = e.target;
	if (target && target.href && target.href.indexOf(installURL) === -1 && target.href.match(/.+user\.js$/)) {
		target.href = installURL + '#' + target.href;
		target.target = '_blank';
	}
});

document.addEventListener('contextmenu', function(e) {
	lastContextmenuCall = e;
});