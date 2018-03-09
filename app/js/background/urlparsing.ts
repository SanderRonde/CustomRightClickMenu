import { ModuleData } from "./moduleTypes.js";

export interface MatchPattern {
	scheme: string;
	host: string;
	path: string;
	invalid?: boolean;
}

export namespace URLParsing {
	export let modules: ModuleData;

	export function initModule(_modules: ModuleData) {
		modules = _modules;
	}
	
	export function triggerMatchesScheme(trigger: string): boolean {
		const reg =
			/(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;
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
			urlPattern = _parsePattern(url);
		} catch (e) {
			return false;
		}

		if (urlPattern === '<all_urls>') {
			return true;
		}
		const matchPattern = urlPattern as MatchPattern;
		return (_matchesScheme(pattern.scheme, matchPattern.scheme) &&
			_matchesHost(pattern.host, matchPattern.host) &&
			_matchesPath(pattern.path, matchPattern.path));
	}
	export function validatePatternUrl(url: string): MatchPattern | void {
		if (!url || typeof url !== 'string') {
			return null;
		}
		url = url.trim();
		const pattern = _parsePattern(url);
		if (pattern === '<all_urls>') {
			return {
				scheme: '*',
				host: '*',
				path: '*'
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
	export function matchesUrlSchemes(matchPatterns: Array<{
		not: boolean;
		url: string;
	}>, url: string) {
		let matches = false;
		for (let i = 0; i < matchPatterns.length; i++) {
			const not = matchPatterns[i].not;
			const matchPattern = matchPatterns[i].url;

			if (matchPattern.indexOf('/') === 0 &&
				modules.Util.endsWith(matchPattern, '/')) {
				//It's regular expression
				if (new RegExp(matchPattern.slice(1, matchPattern.length - 1))
					.test(url)) {
					if (not) {
						return false;
					} else {
						matches = true;
					}
				}
			} else {
				if (new RegExp(`^${matchPattern.replace(/\*/g, '(.+)')}$`).test(url)) {
					if (not) {
						return false;
					} else {
						matches = true;
					}
				}
			}
		}
		return matches;
	}

	function _parsePattern(url: string): MatchPattern | '<all_urls>' {
		if (url === '<all_urls>') {
			return '<all_urls>';
		}

		try {
			const [scheme, hostAndPath] = url.split('://');
			const [host, ...path] = hostAndPath.split('/');

			return {
				scheme: scheme,
				host: host,
				path: path.join('/')
			};
		} catch (e) {
			return {
				scheme: '*',
				host: '*',
				path: '*',
				invalid: true
			};
		}
	}
	function _matchesScheme(scheme1: string, scheme2: string): boolean {
		if (scheme1 === '*') {
			return true;
		}
		return scheme1 === scheme2;
	}
	function _matchesHost(host1: string, host2: string): boolean {
		if (host1 === '*') {
			return true;
		}

		if (host1[0] === '*') {
			const host1Split = host1.slice(2);
			const index = host2.indexOf(host1Split);
			return index === host2.length - host1Split.length;
		}

		return (host1 === host2);
	}
	function _matchesPath(path1: string, path2: string): boolean {
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