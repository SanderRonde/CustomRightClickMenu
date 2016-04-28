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
	},
	function(response) {
		if (response.matched) {
			matched = true;
		}
	});