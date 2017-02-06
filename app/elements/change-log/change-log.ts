/// <reference path="../../../tools/definitions/crmapp.d.ts" />

const changeLogProperties: {
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

type ChangeLog = PolymerElement<typeof CL & typeof changeLogProperties>;

class CL {
	static is: string = 'change-log';

	static properties = changeLogProperties;

	/**
	 * Turns the object-based changelog into an array-based changelog 
	 * for polymer to iterate through
	 */
	static makeChangelogArray(changelog: {
		[key: string]: Array<string>;
	}): Array<{
		version: string;
		changes: Array<string>;	
	}> {
		var arrayChangelog: Array<{
			version: string;
			changes: Array<string>;	
		}> = [];
		for (var versionEntry in changelog) {
			if (changelog.hasOwnProperty(versionEntry)) {
				arrayChangelog.push({
					version: versionEntry,
					changes: changelog[versionEntry]
				});
			}
		}
		return arrayChangelog;
	};

	/**
	 * Turns a version string into 3 seperate version parts
	 */
	static splitVersion(versionString: string): Version {
		var split = versionString.split('.');
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
	static compareVersions(versionStringA: string, versionStringB: string): number {
		const aSplit = this.splitVersion(versionStringA);
		const bSplit = this.splitVersion(versionStringB);

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
	static sortFunction(a: {
		version: string;
		changes: Array<string>;
	}, b: {
		version: string;
		changes: Array<string>;
	}): number {
		return window.changeLog.compareVersions(a.version, b.version);
	};

	/**
	 * Sorts the changelog from highest version first to lowest last
	 */
	static sortChangelog(changelog: Array<{
		version: string;
		changes: Array<string>;
	}>): Array<{
		version: string;
		changes: Array<string>;
	}> {
		return changelog.sort(this.sortFunction);
	};

	static ready(this: ChangeLog) {
		window.changeLog = this;
		this.changelog = this.sortChangelog(this.makeChangelogArray((window as any).changelogLog));
	}
};

Polymer(CL);