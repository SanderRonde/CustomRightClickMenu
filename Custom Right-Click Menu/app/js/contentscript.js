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

var installURL = chrome.runtime.getURL('html/install.html');
document.body.addEventListener('mousedown', function(e) {
	var target = e.target;
	if (target && target.href && target.href.indexOf(installURL) === -1 && target.href.match(/.+user\.js$/)) {
		target.href = installURL + '#' + target.href;
		target.target = '_blank';
	}
});