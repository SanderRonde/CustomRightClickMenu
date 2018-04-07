function semiSandbox(code: string, codeStr: string, crmAPI?: any, window?: any) {
	eval(`var ${codeStr} = code`);
	code = null;
	eval('eval(codeStr)');
}

(() => {
	function generateRandomString(noDot: boolean = false) {
		var length = 25 + Math.floor(Math.random() * 25);
		const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var str = [];
		for (var i = 0; i < length; i++) {
			str.push(options.charAt(Math.floor(Math.random() * options.length)));
		}
		return str.join('');
	}

	crmAPI.comm.addListener((message) => {
		if (message.channel === 'tabs.executeScript' && 
			message.tabId === crmAPI.tabId) {
				const code = message.code;
				semiSandbox(code, generateRandomString(true));
			}
	});
})();