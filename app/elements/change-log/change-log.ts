/// <reference path="../elements.d.ts" />

namespace ChangeLogElement {
	export const changeLogProperties: {
		changelog: Array<{
			version: string;
			changes: Array<string>;
		}>;
	} = {
		/**
		 * The changelog that is displayed
		 * 
		 * @attribute changelog
		 * @type Array
		 * @value []
		 */
		changelog: {
			type: Array,
			value: [],
			notify: true
		}
	} as any;

	interface Version {
		baseVersion: number;
		majorVersion: number;
		minorVersion: number;
	}

	export class CL {
		static is: string = 'change-log';

		static properties = changeLogProperties;

		private static _makeLink(name: string, url: string): string {
			return `<a target="_blank" rel="noopener" href="${url}" title="${name}">${name}</a>`;
		}

		private static _stringSplice(str: string, startIndex: number, endIndex: number, 
			newContents: string): string {
				return str.slice(0, startIndex) + newContents + str.slice(endIndex);
			}

		private static _convertLinks(change: string): string {
			const state: {
				startIndex: number,
				inBlock: boolean;
				inBrackets: boolean;
				blockContents: string|void;
			} = {
				startIndex: -1,
				inBlock: false,
				inBrackets: false,
				blockContents: null
			}

			let buf = '';
			for (let i = 0; i < change.length; i++) {
				const char = change[i];
				if (char === '[') {
					state.startIndex = i;
					state.inBlock = true;
					buf = '';
					continue;
				} else if (char === ']') {
					state.inBlock = false;
					state.blockContents = buf;
					buf = '';
				} else if (char === '(') {
					buf = '';
					state.inBrackets = true;
					continue;
				} else if (char === ')') {
					state.inBrackets = false;
					if (state.blockContents) {
						return this._convertLinks(this._stringSplice(change, state.startIndex,
							i, this._makeLink(state.blockContents, buf)));
					}
				} else if (state.inBlock || state.inBrackets) {
					buf += char;
				} else {
					state.blockContents = null;
					state.inBlock = false;
					state.inBrackets = false;
				}
			}

			return change;
		}

		/**
		 * Turns the object-based changelog into an array-based changelog 
		 * for polymer to iterate through
		 */
		private static _makeChangelogArray(changelog: {
			[key: string]: Array<string>;
		}): Array<{
			version: string;
			changes: Array<string>;	
		}> {
			const arrayChangelog: Array<{
				version: string;
				changes: Array<string>;	
			}> = [];
			for (let versionEntry in changelog) {
				if (changelog.hasOwnProperty(versionEntry)) {
					arrayChangelog.push({
						version: versionEntry,
						changes: changelog[versionEntry].map(change => this._convertLinks(change))
					});
				}
			}
			return arrayChangelog;
		};

		/**
		 * Turns a version string into 3 seperate version parts
		 */
		private static _splitVersion(versionString: string): Version {
			const split = versionString.split('.');
			return {
				baseVersion: parseInt(split[0], 10),
				majorVersion: parseInt(split[1], 10),
				minorVersion: parseInt(split[2], 10)
			};
		};

		/**
		 * Compares two versions and returns true if A is lower,
		 *		false if B is lower and 0 if they are equal
		*/
		private static _compareVersions(versionStringA: string, versionStringB: string): number {
			const aSplit = this._splitVersion(versionStringA);
			const bSplit = this._splitVersion(versionStringB);

			if (aSplit.baseVersion !== bSplit.baseVersion) {
				return aSplit.baseVersion < bSplit.baseVersion ? -1 : 1;
			}

			if (aSplit.majorVersion !== bSplit.majorVersion) {
				return aSplit.majorVersion < bSplit.majorVersion ? -1 : 1;
			}

			if (aSplit.minorVersion !== bSplit.minorVersion) {
				return aSplit.minorVersion < bSplit.minorVersion ? -1 : 1;
			}

			return 0;
		};

		/**
		 * The function used in javascript's sort function
		 */
		private static _sortFunction(a: {
			version: string;
			changes: Array<string>;
		}, b: {
			version: string;
			changes: Array<string>;
		}): number {
			return window.changeLog._compareVersions(a.version, b.version);
		};

		/**
		 * Sorts the changelog from highest version first to lowest last
		 */
		private static _sortChangelog(changelog: Array<{
			version: string;
			changes: Array<string>;
		}>): Array<{
			version: string;
			changes: Array<string>;
		}> {
			return changelog.sort(this._sortFunction).reverse();
		};

		static ready(this: ChangeLog) {
			window.changeLog = this;
			this.changelog = this._sortChangelog(this._makeChangelogArray((window as any).changelogLog));
		}
	};

	if (window.objectify) {
		window.register(CL);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(CL);
		});
	}
}

type ChangeLog = Polymer.El<'change-log', typeof ChangeLogElement.CL & typeof ChangeLogElement.changeLogProperties>;