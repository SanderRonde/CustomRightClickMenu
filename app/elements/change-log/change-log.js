"use strict";
var changeLogProperties = {
    changelog: {
        type: Array,
        value: [],
        notify: true
    }
};
var CL = (function () {
    function CL() {
    }
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
    CL.splitVersion = function (versionString) {
        var split = versionString.split('.');
        return {
            baseVersion: parseInt(split[0], 10),
            majorVersion: parseInt(split[1], 10),
            minorVersion: parseInt(split[2], 10)
        };
    };
    ;
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
    CL.sortFunction = function (a, b) {
        return window.changeLog.compareVersions(a.version, b.version);
    };
    ;
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
