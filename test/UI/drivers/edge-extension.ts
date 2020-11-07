import { TypedWebdriver, BrowserstackCapabilities } from "../../imports";

function throwErr(): never {
	console.error('Edge extension testing is not supported, please try' +
		' another browser or remove the --test-extension flag');
	process.exit(1);
	throw new Error('Edge extension testing is not supported, please try' +
		' another browser or remove the --test-extension flag');
}

export async function getExtensionURLPrefix(_driver: TypedWebdriver, _capabilities: BrowserstackCapabilities) {
	return throwErr();
}

export function getCapabilities(): never {
	return throwErr();
}

export async function openOptionsPage(_driver: TypedWebdriver, _capabilities: BrowserstackCapabilities) {
	return throwErr();
}

export async function reloadBackgroundPage(_driver: TypedWebdriver, _capabilities: BrowserstackCapabilities) { 
	return throwErr();
}