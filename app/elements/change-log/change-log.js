/// <reference path="../../../tools/definitions/crmapp.d.ts" />
var changeLogProperties = {
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
};
var CL = (function () {
    function CL() {
    }
    /**
     * Turns the object-based changelog into an array-based changelog
     * for polymer to iterate through
     */
    CL.makeChangelogArray = function (changelog) {
        var arrayChangelog = [];
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
    ;
    /**
     * Turns a version string into 3 seperate version parts
     */
    CL.splitVersion = function (versionString) {
        var split = versionString.split('.');
        return {
            baseVersion: parseInt(split[0], 10),
            majorVersion: parseInt(split[1], 10),
            minorVersion: parseInt(split[2], 10)
        };
    };
    ;
    /**
     * Compares two versions and returns true if A is lower,
     *		false if B is lower and 0 if they are equal
     */
    CL.compareVersions = function (versionStringA, versionStringB) {
        var aSplit = this.splitVersion(versionStringA);
        var bSplit = this.splitVersion(versionStringB);
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
    ;
    /**
     * The function used in javascript's sort function
     */
    CL.sortFunction = function (a, b) {
        return window.changeLog.compareVersions(a.version, b.version);
    };
    ;
    /**
     * Sorts the changelog from highest version first to lowest last
     */
    CL.sortChangelog = function (changelog) {
        return changelog.sort(this.sortFunction);
    };
    ;
    CL.ready = function () {
        window.changeLog = this;
        this.changelog = this.sortChangelog(this.makeChangelogArray(window.changelogLog));
    };
    return CL;
}());
CL.is = 'change-log';
CL.properties = changeLogProperties;
;
Polymer(CL);
