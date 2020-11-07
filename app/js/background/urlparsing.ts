import { ModuleData } from './moduleTypes';
import { MatchPattern } from './sharedTypes';

export namespace URLParsing {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}

	export function triggerMatchesScheme(trigger: string): boolean {
		const reg = /(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;
		return reg.test(trigger);
	}
	export function prepareTrigger(trigger: string): string {
		if (trigger === '<all_urls>') {
			return trigger;
		}
		if (trigger.replace(/\s/g, '') === '') {
			return null;
		}
		let newTrigger: string;

		const triggerSplit = trigger.split('//');
		if (triggerSplit.length === 1) {
			newTrigger = `http://${trigger}`;
			triggerSplit[1] = triggerSplit[0];
		}
		if (triggerSplit[1].indexOf('/') === -1) {
			newTrigger = `${trigger}/`;
		} else {
			newTrigger = trigger;
		}
		return newTrigger;
	}
	export function urlMatchesPattern(pattern: MatchPattern, url: string) {
		let urlPattern: MatchPattern | '<all_urls>';
		try {
			urlPattern = parsePattern(url);
		} catch (e) {
			return false;
		}

		if (urlPattern === '<all_urls>') {
			return true;
		}
		const matchPattern = urlPattern as MatchPattern;
		return (
			matchesScheme(pattern.scheme, matchPattern.scheme) &&
			matchesHost(pattern.host, matchPattern.host) &&
			matchesPath(pattern.path, matchPattern.path)
		);
	}
	export function validatePatternUrl(url: string): MatchPattern | void {
		if (!url || typeof url !== 'string') {
			return null;
		}
		url = url.trim();
		const pattern = parsePattern(url);
		if (pattern === '<all_urls>') {
			return {
				scheme: '*',
				host: '*',
				path: '*',
			};
		}
		const matchPattern = pattern as MatchPattern;
		if (matchPattern.invalid) {
			return null;
		}
		const schemes = modules.constants.validSchemes;
		const index = schemes.indexOf(matchPattern.scheme);
		if (index === -1) {
			return null;
		}

		const wildcardIndex = matchPattern.host.indexOf('*');
		if (wildcardIndex > -1) {
			if (matchPattern.host.split('*').length > 2) {
				return null;
			}
			if (wildcardIndex === 0 && matchPattern.host[1] === '.') {
				if (matchPattern.host.slice(2).split('/').length > 1) {
					return null;
				}
			} else {
				return null;
			}
		}

		return matchPattern;
	}
	export function matchesUrlSchemes(
		matchPatterns: {
			not: boolean;
			url: string;
		}[],
		url: string
	) {
		let matches = false;
		for (const { not, url: matchURL } of matchPatterns) {
			if (
				matchURL.indexOf('/') === 0 &&
				modules.Util.endsWith(matchURL, '/')
			) {
				//It's regular expression
				if (
					new RegExp(matchURL.slice(1, matchURL.length - 1)).test(url)
				) {
					if (not) {
						return false;
					} else {
						matches = true;
					}
				}
			} else {
				try {
					const matchPattern = parsePattern(matchURL);
					if (matchPattern === '<all_urls>') {
						if (not) {
							return false;
						} else {
							matches = true;
							continue;
						}
					}

					const urlPattern = parsePattern(url) as MatchPattern;
					if (matchPattern.invalid || urlPattern.invalid) {
						throw new Error('nomatch');
					}
					if (
						matchPattern.scheme !== '*' &&
						matchPattern.scheme !== urlPattern.scheme
					) {
						throw new Error('nomatch');
					}

					if (
						matchPattern.host.split('.').length > 2 ||
						matchPattern.host.indexOf('*.') === 0
					) {
						let host = urlPattern.host;
						if (host.indexOf('www.') === 0) {
							host = host.slice(4);
						}
						if (matchPattern.host.indexOf('*.') === 0) {
							matchPattern.host = matchPattern.host.slice(2);
							host = host.split('.').slice(-2).join('.');
						}
						if (
							matchPattern.host !== '*' &&
							matchPattern.host !== host
						) {
							throw new Error('nomatch');
						}
					} else if (
						matchPattern.host !== '*' &&
						matchPattern.host !==
							urlPattern.host.split('.').slice(-2).join('.')
					) {
						// something.com matching about.something.com, allow
						throw new Error('nomatch');
					}
					if (
						matchPattern.path !== '*' &&
						!new RegExp(
							`^${matchPattern.path.replace(/\*/g, '(.*)')}$`
						).test(urlPattern.path)
					) {
						throw new Error('nomatch');
					}
					if (not) {
						return false;
					} else {
						matches = true;
					}
				} catch (e) {
					if (
						new RegExp(`^${matchURL.replace(/\*/g, '(.*)')}$`).test(
							url
						)
					) {
						if (not) {
							return false;
						} else {
							matches = true;
						}
					}
				}
			}
		}
		return matches;
	}

	function parsePattern(url: string): MatchPattern | '<all_urls>' {
		if (url === '<all_urls>') {
			return '<all_urls>';
		}

		try {
			const [scheme, hostAndPath] = url.split('://');
			const [host, ...path] = hostAndPath.split('/');

			return {
				scheme: scheme,
				host: host,
				path: path.join('/'),
			};
		} catch (e) {
			return {
				scheme: '*',
				host: '*',
				path: '*',
				invalid: true,
			};
		}
	}
	function matchesScheme(scheme1: string, scheme2: string): boolean {
		if (scheme1 === '*') {
			return true;
		}
		return scheme1 === scheme2;
	}
	function matchesHost(host1: string, host2: string): boolean {
		if (host1 === '*') {
			return true;
		}

		if (host1[0] === '*') {
			const host1Split = host1.slice(2);
			const index = host2.indexOf(host1Split);
			return index === host2.length - host1Split.length;
		}

		return host1 === host2;
	}
	function matchesPath(path1: string, path2: string): boolean {
		const path1Split = path1.split('*');
		const path1Length = path1Split.length;
		const wildcards = path1Length - 1;

		if (wildcards === 0) {
			return path1 === path2;
		}

		if (path2.indexOf(path1Split[0]) !== 0) {
			return false;
		}

		path2 = path2.slice(path1Split[0].length);
		for (let i = 1; i < path1Length; i++) {
			if (path2.indexOf(path1Split[i]) === -1) {
				return false;
			}
			path2 = path2.slice(path1Split[i].length);
		}
		return true;
	}
}
