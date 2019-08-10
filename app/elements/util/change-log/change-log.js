var ChangeLogElement;
(function (ChangeLogElement) {
    ChangeLogElement.changeLogProperties = {
        changelog: {
            type: Array,
            value: [],
            notify: true
        }
    };
    var CL = (function () {
        function CL() {
        }
        CL._makeLink = function (name, url) {
            return "<a target=\"_blank\" rel=\"noopener\" href=\"" + url + "\" title=\"" + name + "\">" + name + "</a>";
        };
        CL._stringSplice = function (str, startIndex, endIndex, newContents) {
            return str.slice(0, startIndex) + newContents + str.slice(endIndex);
        };
        CL._convertLinks = function (change) {
            var state = {
                startIndex: -1,
                inBlock: false,
                inBrackets: false,
                blockContents: null
            };
            var buf = '';
            for (var i = 0; i < change.length; i++) {
                var char = change[i];
                if (char === '[') {
                    state.startIndex = i;
                    state.inBlock = true;
                    buf = '';
                }
                else if (char === ']') {
                    state.inBlock = false;
                    state.blockContents = buf;
                    buf = '';
                }
                else if (char === '(') {
                    buf = '';
                    state.inBrackets = true;
                }
                else if (char === ')') {
                    state.inBrackets = false;
                    if (state.blockContents) {
                        return this._convertLinks(this._stringSplice(change, state.startIndex, i + 1, this._makeLink(state.blockContents, buf)));
                    }
                }
                else if (state.inBlock || state.inBrackets) {
                    buf += char;
                }
                else {
                    state.blockContents = null;
                    state.inBlock = false;
                    state.inBrackets = false;
                }
            }
            return change;
        };
        CL._makeChangelogArray = function (changelog) {
            var _this = this;
            var arrayChangelog = [];
            for (var versionEntry in changelog) {
                if (changelog.hasOwnProperty(versionEntry)) {
                    arrayChangelog.push({
                        version: versionEntry,
                        changes: changelog[versionEntry].map(function (change) { return _this._convertLinks(change); })
                    });
                }
            }
            return arrayChangelog;
        };
        ;
        CL._splitVersion = function (versionString) {
            var split = versionString.split('.');
            return {
                baseVersion: parseInt(split[0], 10),
                majorVersion: parseInt(split[1], 10),
                minorVersion: parseInt(split[2], 10)
            };
        };
        ;
        CL._compareVersions = function (versionStringA, versionStringB) {
            var aSplit = this._splitVersion(versionStringA);
            var bSplit = this._splitVersion(versionStringB);
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
        CL._sortFunction = function (a, b) {
            return window.changeLog._compareVersions(a.version, b.version);
        };
        ;
        CL._sortChangelog = function (changelog) {
            return changelog.sort(this._sortFunction).reverse();
        };
        ;
        CL.ready = function () {
            window.changeLog = this;
            this.changelog = this._sortChangelog(this._makeChangelogArray(window.changelogLog));
        };
        CL.is = 'change-log';
        CL.properties = ChangeLogElement.changeLogProperties;
        return CL;
    }());
    ChangeLogElement.CL = CL;
    ;
    if (window.objectify) {
        window.register(CL);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(CL);
        });
    }
})(ChangeLogElement || (ChangeLogElement = {}));
