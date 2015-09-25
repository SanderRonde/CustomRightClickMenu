var pageUrl = document.url;

chrome.runtime.sendMessage({
	action: 'pageCreated',
	url: pageUrl
}, function (message) {
	var i;
	var scriptsLength = message.scripts.length;
	var scriptsToRun = [];
	var stylesheetsToRun = [];
	var scriptsRunOnClick = [];
	var stylesheetsToggledOff = [];

	for (i = 0; i < scriptsLength; i++) {
		if (message.scripts[i].value.launchMode !== 0) {
			scriptsToRun.push(message.scripts[i]);
		} else {
			
		}
	}
});