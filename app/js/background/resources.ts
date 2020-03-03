import { ModuleData } from "./moduleTypes";
import { BackgroundpageWindow } from './sharedTypes';

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
		return () => {
			window.info('Attempting resource update');
			compareResource(resourceKey);
		};
	}
}