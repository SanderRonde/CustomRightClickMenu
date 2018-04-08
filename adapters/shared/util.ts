export interface WindowType extends Window {
	__isVirtual: boolean;
}

export function generateRandomString() {
	var length = 25 + Math.floor(Math.random() * 25);
	const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var str = [];
	for (var i = 0; i < length; i++) {
		str.push(options.charAt(Math.floor(Math.random() * options.length)));
	}
	return str.join('');
}

export function semiSandbox(code: string, codeStr: string, crmAPI?: any, window?: any, _semiSandbox?: any) {
	eval(`var ${codeStr} = (${codeStr}) => { eval(code); })`);
	code = null;
	eval('eval(codeStr())');
}