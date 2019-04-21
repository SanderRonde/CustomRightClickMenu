import { BackgroundpageWindow } from './sharedTypes';
import { I18NKeys } from "../../_locales/i18n-keys";
import { ModuleData } from "./moduleTypes";

declare const browserAPI: browserAPI;
declare const window: BackgroundpageWindow;

export namespace Resources.Resource {
	export function handle(message: {
		type: string;
		name: string;
		url: string;
		scriptId: CRM.NodeId<CRM.ScriptNode>;
	}) {
		Resources.handle(message, message.name);
	}
}

export namespace Resources.Anonymous {
	export function handle(message: {
		type: string;
		name: string;
		url: string;
		scriptId: CRM.NodeId<CRM.ScriptNode>;
	}) {
		Resources.handle(message, message.url);
	}
}

export namespace Resources {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export function handle(message: {
		type: string;
		name: string;
		url: string;
		scriptId: CRM.NodeId<CRM.ScriptNode>;
	}, name: string) {
		switch (message.type) {
			case 'register':
				registerResource(name, message.url, message.scriptId);
				break;
			case 'remove':
				removeResource(name, message.scriptId);
				break;
		}
	}

	export function updateResourceValues() {
		const resourceKeys = modules.storages.resourceKeys;
		for (let i = 0; i < resourceKeys.length; i++) {
			setTimeout(generateUpdateCallback(resourceKeys[i]), (i * 1000));
		}
	}

	function getUrlData(scriptId: CRM.NodeId<CRM.ScriptNode>, url: string, callback: (dataURI: string,
		dataString: string) => void) {
		//First check if the data has already been fetched
		if (modules.storages.urlDataPairs.get(url)) {
			const dataPairs = modules.storages.urlDataPairs.get(url);
			if (dataPairs.refs.indexOf(scriptId) === -1) {
				dataPairs.refs.push(scriptId);
			}
			callback(dataPairs.dataURI, dataPairs.dataString);
		} else {
			modules.Util.convertFileToDataURI(url, (dataURI, dataString) => {
				//Write the data away to the url-data-pairs object
				modules.storages.urlDataPairs.set(url, {
					dataURI: dataURI,
					dataString: dataString,
					refs: [scriptId]
				});
				callback(dataURI, dataString);
			});
		}
	}
	function getHashes(url: string): {
		algorithm: string;
		hash: string;
	}[] {
		const hashes: {
			algorithm: string;
			hash: string;
		}[] = [];
		const hashString = url.split('#')[1];
		if (!hashString) {
			return [];
		}

		const hashStrings = hashString.split(/[,|;]/g);
		hashStrings.forEach((hash) => {
			const split = hash.split('=');
			hashes.push({
				algorithm: split[0],
				hash: split[1]
			});
		});
		return hashes;
	}
	function doAlgorithm(name: string, data: any, lastMatchingHash: {
		algorithm: string;
		hash: string;
	}) {
		window.crypto.subtle.digest(name, data).then((hash) => {
			return String.fromCharCode.apply(null, hash) === lastMatchingHash.hash;
		});
	}
	function algorithmNameToFnName(name: string): string {
		let numIndex = 0;
		for (let i = 0; i < name.length; i++) {
			if (name.charCodeAt(i) >= 48 && name.charCodeAt(i) <= 57) {
				numIndex = i;
				break;
			}
		}

		return name.slice(0, numIndex).toUpperCase() + '-' + name.slice(numIndex);
	}
	function matchesHashes(hashes: {
		algorithm: string;
		hash: string;
	}[], data: string) {
		if (hashes.length === 0) {
			return true;
		}

		let lastMatchingHash: {
			algorithm: string;
			hash: string;
		} = null;
		hashes = hashes.reverse();
		for (const { algorithm, hash } of hashes) {
			const lowerCase = algorithm.toLowerCase();
			if (modules.constants.supportedHashes.indexOf(lowerCase) !== -1) {
				lastMatchingHash = {
					algorithm: lowerCase,
					hash: hash
				};
				break;
			}
		}

		if (lastMatchingHash === null) {
			return false;
		}

		const arrayBuffer = new window.TextEncoder('utf-8').encode(data);
		switch (lastMatchingHash.algorithm) {
			case 'md5':
				return window.md5(data) === lastMatchingHash.hash;
			case 'sha1':
			case 'sha384':
			case 'sha512':
				doAlgorithm(algorithmNameToFnName(lastMatchingHash.algorithm),
					arrayBuffer, lastMatchingHash);
				break;

		}
		return false;
	}
	function registerResource(name: string, url: string, scriptId: CRM.NodeId<CRM.ScriptNode>) {
		const registerHashes = getHashes(url);
		if (window.navigator.onLine) {
			getUrlData(scriptId, url, (dataURI, dataString) => {
				const resources = modules.storages.resources;
				modules.Util.setMapDefault(resources, scriptId, {});
				resources.get(scriptId)[name] = {
					name: name,
					sourceUrl: url,
					dataURI: dataURI,
					dataString: dataString,
					hashes: registerHashes,
					matchesHashes: matchesHashes(registerHashes, dataString),
					crmUrl: `https://www.localhost.io/resource/${scriptId}/${name}`
				};
				browserAPI.storage.local.set({
					resources: modules.Util.fromMap(resources),
					urlDataPairs: modules.Util.fromMap(modules.storages.urlDataPairs)
				});
			});
		}

		const resourceKeys = modules.storages.resourceKeys;
		for (const resourceKey of resourceKeys) {
			if (resourceKey.name === name && 
				resourceKey.scriptId === scriptId) {
					return;
				}
		}
		resourceKeys.push({
			name: name,
			sourceUrl: url,
			hashes: registerHashes,
			scriptId: scriptId
		});
		browserAPI.storage.local.set({
			resourceKeys: resourceKeys
		});
	}
	function removeResource(name: string, scriptId: CRM.NodeId<CRM.ScriptNode>) {
		for (let i = 0; i < modules.storages.resourceKeys.length; i++) {
			if (modules.storages.resourceKeys[i].name === name &&
				modules.storages.resourceKeys[i].scriptId === scriptId) {
					modules.storages.resourceKeys.splice(i, 1);
					break;
				}
		}
		if (!modules.storages.resources.has(scriptId) ||
			!modules.storages.resources.get(scriptId)[name] ||
			!modules.storages.resources.get(scriptId)[name].sourceUrl) {
				//It's already been removed, skip
				return;
			}
		const { sourceUrl } = modules.storages.resources.get(scriptId)[name];
		const urlDataLink = modules.storages.urlDataPairs.get(sourceUrl);
		if (urlDataLink) {
			urlDataLink.refs.splice(urlDataLink.refs.indexOf(scriptId), 1);
			if (urlDataLink.refs.length === 0) {
				//No more refs, clear it
				modules.storages.urlDataPairs.delete(sourceUrl);
			}
		}
		if (modules.storages.resources &&
			modules.storages.resources.has(scriptId) &&
			modules.storages.resources.get(scriptId)[name]) {
				delete modules.storages.resources.get(scriptId)[name];
			}

		browserAPI.storage.local.set({
			resourceKeys: modules.storages.resourceKeys,
			resources: modules.Util.fromMap(modules.storages.resources),
			urlDataPairs: modules.Util.fromMap(modules.storages.urlDataPairs)
		});
	}
	function compareResource(key: {
		name: string;
		sourceUrl: string;
		hashes: {
			algorithm: string;
			hash: string;
		}[];
		scriptId: CRM.NodeId<CRM.ScriptNode>;
	}) {
		const resources = modules.storages.resources;
		modules.Util.convertFileToDataURI(key.sourceUrl, (dataURI, dataString) => {
			if (!(resources.has(key.scriptId) && resources.get(key.scriptId)[key.name]) ||
				resources.get(key.scriptId)[key.name].dataURI !== dataURI) {
					//Check if the hashes still match, if they don't, reject it
					const resourceData = resources.get(key.scriptId)[key.name];
					if (matchesHashes(resourceData.hashes, dataString)) {
						//Data URIs do not match, just update the url ref
						const data = modules.storages.urlDataPairs.get(key.sourceUrl);
						data.dataURI = dataURI;
						data.dataString = dataString;

						browserAPI.storage.local.set({
							resources: modules.Util.fromMap(resources),
							urlDataPairs: modules.Util.fromMap(modules.storages.urlDataPairs)
						});
					}
				}
		});
	}
	function generateUpdateCallback(resourceKey: {
		name: string;
		sourceUrl: string;
		hashes: {
			algorithm: string;
			hash: string;
		}[];
		scriptId: CRM.NodeId<CRM.ScriptNode>;
	}) {
		return async () => {
			window.info(await window.__(I18NKeys.background.init.resourceUpdate));
			compareResource(resourceKey);
		};
	}
}