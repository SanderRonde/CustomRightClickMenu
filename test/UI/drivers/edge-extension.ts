import { TypedWebdriver } from "../../UITest";

function throwErr(): never {
	console.error('Edge extension testing is not supported, please try' +
		' another browser or remove the --extensions flag');
	process.exit(1);
	throw new Error('Edge extension testing is not supported, please try' +
		' another browser or remove the --extensions flag');
}

export function getCapabilities(): never {
	return throwErr();
}

export async function openOptionsPage(_driver: TypedWebdriver) {
	return throwErr();
}
