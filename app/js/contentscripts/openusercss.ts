/**
 * Copied from https://github.com/openstyles/stylus. For this file the following
 * license applies:
 * 
 * Copyright (C) 2005-2014 Jason Barnabe jason.barnabe@gmail.com
 *
 * Copyright (C) 2017 Stylus Team
 * 
 * This program is free software: you can redistribute it and/or modify it under 
 * the terms of the GNU General Public License as published by the Free Software 
 * Foundation, either version 3 of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for 
 * more details.
 */

'use strict';	

(async () => {
	if (!(await browserAPI.storage.local.get()).useAsUserstylesInstaller) {
		return;
	}
  	const manifest = await browserAPI.runtime.getManifest();
  	const allowedOrigins = [
    	'https://openusercss.org',
    	'https://openusercss.com'
  	];

  	const sendPostMessage = (message: any) => {
    	if (allowedOrigins.indexOf(location.origin) !== -1) {
      		window.postMessage(message, location.origin);
    	}
  	};

  	const askHandshake = () => {
		// Tell the page that we exist and that it should send the handshake
		sendPostMessage({
			type: 'ouc-begin-handshake'
		});
  	};

  // Listen for queries by the site and respond with a callback object
	const sendInstalledCallback = (styleData: {
		installed: boolean;
		enabled: boolean;
		name: string;
		namespace: string;
	}) => {
		sendPostMessage({
			type: 'ouc-is-installed-response',
			style: styleData
		});
	};

	const installedHandler = (event: Event & {
		data: {
			type: string;
			name: string;
			namespace: string;
		}
		origin: string;
	}) => {
		if (event.data && 
			event.data.type === 'ouc-is-installed' && 
			allowedOrigins.indexOf(event.origin) !== -1) {
				browserAPI.runtime.sendMessage({
					method: 'getStyles',
					data: {
						url: (
							document.querySelector('a[href^="https://api.openusercss.org"]') as 
								HTMLAnchorElement).href
					}
				}, (response: {
					node: CRM.StylesheetNode;
					state: 'installed'|'updatable';
				}[]) => {
					const firstNode = response[0];
					const installed = !!firstNode;
					const enabled = installed && firstNode.node.value.launchMode !==
						CRMLaunchModes.DISABLED;
					const { data } = event;
					const callbackObject = {
						installed,
						enabled,
						name: data.name,
						namespace: data.namespace
					};

					sendInstalledCallback(callbackObject);
				});
		}
	};

  	const attachInstalledListeners = () => {
    	window.addEventListener('message', installedHandler);
  	};

	const doHandshake = (event: Event & {
		data: {
			featuresList: {
				required: string[];
				optional: string[];
			}
			key: string;
		}
	}) => {
		// This is a representation of features that Stylus is capable of
		const implementedFeatures = [
			'install-usercss',
			'event:install-usercss',
			'event:is-installed',
			'configure-after-install',
			'builtin-editor',
			'create-usercss',
			'edit-usercss',
			'import-moz-export',
			'export-moz-export',
			'update-manual',
			'update-auto',
			'export-json-backups',
			'import-json-backups',
			'manage-local'
		];
		const reportedFeatures: string[] = [];

		// The handshake question includes a list of required and optional features
		// we match them with features we have implemented, and build a union array.
		event.data.featuresList.required.forEach(feature => {
			if (implementedFeatures.indexOf(feature) !== -1) {
				reportedFeatures.push(feature);
			}
		});

		event.data.featuresList.optional.forEach(feature => {
			if (implementedFeatures.indexOf(feature) !== -1) {
				reportedFeatures.push(feature);
			}
		});

		// We send the handshake response, which includes the key we got, plus some
		// additional metadata
		sendPostMessage({
			type: 'ouc-handshake-response',
			key: event.data.key,
			extension: {
				name: manifest.name,
				capabilities: reportedFeatures
			}
		});
	};

	const handshakeHandler = (event: Event & {
		data: {
			featuresList: {
				required: string[];
				optional: string[];
			}
			key: string;
			type: string;
		}
		origin: string;
	}) => {
		if (event.data && 
			event.data.type === 'ouc-handshake-question' && 
			allowedOrigins.indexOf(event.origin) !== -1) {
				doHandshake(event);
			}
	};

	const attachHandshakeListeners = () => {
		// Wait for the handshake request, then start it
		window.addEventListener('message', handshakeHandler);
	};

	const sendInstallCallback = (data: {
		key: string;
		enabled: boolean;
	}) => {
		// Send an install callback to the site in order to let it know
		// we were able to install the theme and it may display a success message
		sendPostMessage({
			type: 'ouc-install-callback',
			key: data.key
		});
	};

	const installHandler = async (event: Event & {
		origin: string;
		data: {
			type: string;
			title: string;
			code: string;
			key: string;
		}
	}) => {
		if (event.data && 
			event.data.type === 'ouc-install-usercss' && 
			allowedOrigins.indexOf(event.origin) !== -1) {
				await browserAPI.runtime.sendMessage({
					type: 'styleInstall',
					data: {
						code: event.data.code,
						name: event.data.title,
						downloadURL: (document.querySelector('a[href^="https://api.openusercss.org"]') as 
							HTMLAnchorElement).href
					}
				}, () => {
					sendInstallCallback({
						enabled: true,
						key: event.data.key
					});
				});
			}
	};

	const attachInstallListeners = () => {
		// Wait for an install event, then save the theme
		window.addEventListener('message', installHandler);
	};

	attachHandshakeListeners();
	attachInstallListeners();
	attachInstalledListeners();
	askHandshake();
})();