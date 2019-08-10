"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var extractZip = require('extract-zip');
var versions = require('../app/elements/util/change-log/changelog');
var chromeExtensionData = require("./UI/drivers/chrome-extension");
var chromeDriver = require("selenium-webdriver/chrome");
var webdriver = require("selenium-webdriver");
var octokit = require("@octokit/rest");
var request = require("request");
var vinyl = require("vinyl-fs");
var mkdirp = require('mkdirp');
var semver = require('semver');
var zip = require('gulp-zip');
var path = require("path");
var chai = require("chai");
var del = require('del');
var fs = require("fs");
var assert = chai.assert;
var _promise = global.Promise;
global.Promise = webdriver.promise.Promise;
var originals = {
    describe: describe,
    it: it,
    before: before,
    after: after,
    beforeEach: beforeEach,
    afterEach: afterEach
};
describe = it = before = after = beforeEach = afterEach = function () { };
var imports_1 = require("./imports");
describe = originals.describe;
it = originals.it;
before = originals.before;
after = originals.after;
beforeEach = originals.beforeEach;
afterEach = originals.afterEach;
global.Promise = _promise;
var copydir = require('copy-dir');
var github = new octokit();
if (process.env.TRAVIS) {
    github.authenticate({
        type: 'oauth',
        token: process.env.GITHUB_ACCESS_TOKEN
    });
}
var ROOT = path.join(__dirname, '../');
var ZIP_CACHE_DIR = path.join(ROOT, 'temp/migration/cached/');
var ZIP_PATH = path.join(ROOT, 'temp/migration/downloadedzip.zip');
var WAIT_ON_DONE = process.argv.indexOf("--wait-on-done") > -1;
function checkVersionArgs(fromName, toName) {
    if (process.argv.indexOf(fromName) === -1 &&
        !process.argv[process.argv.indexOf(fromName) + 1]) {
        process.stderr.write("Please provide an argument for " + fromName + "\n");
        process.exit(1);
    }
    if (process.argv.indexOf(toName) === -1 &&
        !process.argv[process.argv.indexOf(toName) + 1]) {
        process.stderr.write("Please provide an argument for " + toName + "\n");
        process.exit(1);
    }
    var fromIndex = process.argv.indexOf(fromName);
    var toIndex = process.argv.indexOf(toName);
    if ((fromIndex === -1) !== (toIndex === -1)) {
        process.stderr.write("Please provide both a " + fromName + " and a " + toName + " parameter or neither\n");
        process.exit(1);
    }
    if (fromIndex === -1 || toIndex === -1) {
        return {
            enabled: false,
            from: '',
            to: ''
        };
    }
    var from = process.argv[process.argv.indexOf(fromName) + 1];
    var to = process.argv[process.argv.indexOf(toName) + 1];
    if (!!from !== !!to) {
        process.stderr.write("Please provide both a " + fromName + " and a " + toName + " parameter\n");
        process.exit(1);
    }
    if (!from || !to) {
        return {
            enabled: false,
            from: '',
            to: ''
        };
    }
    if (semver.lt(from, '2.0.12') || (to !== 'current' && semver.lt(to, '2.0.12'))) {
        process.stderr.write('Please only test versions above 2.0.12\n');
        process.exit(1);
    }
    return {
        enabled: true,
        from: from,
        to: to
    };
}
function printHelp() {
    process.stderr.write('Please provide a from-to input method\n');
    process.stderr.write('Either provide one of these forms:\n' +
        '--from {minor} and --to {major} - For testing migration from minor to major' +
        '--from-all {version} and --to-all {version} - For testing migration for all versions ' +
        'between and including from minor to major\n' +
        '--all-to-current - For testing all versions from the first to the current build\n' +
        '--all-to-latest - For testing all versions from the first to the last release\n');
}
function getInput() {
    if (process.argv.indexOf('-h') > -1) {
        printHelp();
        process.exit(0);
    }
    var fromAllToAllInput = checkVersionArgs('--from-all', '--to-all');
    var allToCurrent = process.argv.indexOf('--all-to-current') !== -1;
    var allToLatest = process.argv.indexOf('--all-to-latest') !== -1;
    var fromToInput = checkVersionArgs('--from', '--to');
    if (!fromAllToAllInput.enabled && !allToCurrent &&
        !allToLatest && !fromToInput.enabled) {
        printHelp();
        process.exit(1);
    }
    var testRemote = process.argv.indexOf('--remote') !== -1 ||
        !!process.env.TRAVIS;
    var testLocal = !testRemote;
    return {
        isLocal: testLocal,
        fromToInput: fromToInput,
        fromAllToAllInput: fromAllToAllInput,
        allToLatest: allToLatest,
        allToCurrent: allToCurrent
    };
}
function getSortedVersions() {
    return Object.getOwnPropertyNames(versions)
        .filter(function (version) {
        return semver.gt(version, '2.0.11');
    }).sort(function (a, b) {
        if (semver.eq(a, b)) {
            return 0;
        }
        return semver.lt(a, b) ?
            -1 : 1;
    });
}
function getAllBetween(from, to) {
    var versionsBetween = [];
    var started = false;
    for (var _i = 0, _a = getSortedVersions(); _i < _a.length; _i++) {
        var version = _a[_i];
        if (!started) {
            if (semver.gte(version, from)) {
                started = true;
            }
        }
        else if (to !== 'current') {
            if (version === 'current' || semver.gt(version, to)) {
                return versionsBetween;
            }
        }
        if (started) {
            versionsBetween.push(version);
        }
    }
    if (to === 'current') {
        return versionsBetween.concat(['current']);
    }
    return versionsBetween;
}
function getFromTo(_a) {
    var fromAllToAllInput = _a.fromAllToAllInput, allToLatest = _a.allToLatest;
    if (fromAllToAllInput.enabled) {
        var from = fromAllToAllInput.from, to = fromAllToAllInput.to;
        return {
            from: from, to: to
        };
    }
    var allVersions = getSortedVersions();
    if (allToLatest) {
        return {
            from: allVersions[0],
            to: allVersions.pop()
        };
    }
    else {
        return {
            from: allVersions[0],
            to: 'current'
        };
    }
}
function getRuns(input) {
    if (input.fromToInput.enabled) {
        var _a = input.fromToInput, from_1 = _a.from, to_1 = _a.to;
        var sortedVersions = getSortedVersions().concat(['current']);
        if (sortedVersions.indexOf(from_1) === -1) {
            process.stdout.write("Version " + from_1 + " is not a valid release\n");
            process.stdout.write("Choose from:\n" + sortedVersions.map(function (version) {
                return "- " + version;
            }).join('\n') + "\n");
            process.exit(1);
        }
        if (sortedVersions.indexOf(to_1) === -1) {
            process.stdout.write("Version " + to_1 + " is not a valid release\n");
            process.stdout.write("Choose from:\n" + sortedVersions.map(function (version) {
                return "- " + version;
            }).join('\n') + "\n");
            process.exit(1);
        }
        return [{
                from: from_1, to: to_1
            }];
    }
    var runs = [];
    var _b = getFromTo(input), from = _b.from, to = _b.to;
    var between = getAllBetween(from, to);
    if (between.indexOf(from) === -1) {
        process.stdout.write("Version " + from + " is not a valid release," +
            " skipping it only\n");
    }
    if (between.indexOf(to) === -1) {
        process.stdout.write("Version " + to + " is not a valid release," +
            " skipping it only\n");
    }
    var target = process.argv.indexOf('--target') !== -1 ?
        process.argv[process.argv.indexOf('--target') + 1] :
        between[between.length - 1];
    var len = target === between[between.length - 1] ?
        between.length - 1 : between.length;
    for (var i = 0; i < len; i++) {
        runs.push({
            from: between[i],
            to: target
        });
    }
    return runs;
}
var cachedPages = {};
function getReleasesPage(page) {
    return __awaiter(this, void 0, void 0, function () {
        var releases;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cachedPages[page]) {
                        return [2, cachedPages[page]];
                    }
                    return [4, github.repos.getReleases({
                            owner: 'SanderRonde',
                            repo: 'CustomRightClickMenu',
                            page: page,
                            per_page: 100
                        })];
                case 1:
                    releases = _a.sent();
                    cachedPages[page] = releases;
                    return [2, releases];
            }
        });
    });
}
function findVersionInReleases(version, releases) {
    for (var _i = 0, releases_1 = releases; _i < releases_1.length; _i++) {
        var release = releases_1[_i];
        if (release.name.indexOf(version) > -1) {
            return release;
        }
    }
    return null;
}
function getVersionURL(version) {
    return __awaiter(this, void 0, void 0, function () {
        var releases, i, _a, _b, release;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    releases = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < 10)) return [3, 5];
                    _b = (_a = releases).concat;
                    return [4, getReleasesPage(i)];
                case 2:
                    releases = _b.apply(_a, [(_c.sent()).data]);
                    return [4, findVersionInReleases(version, releases)];
                case 3:
                    release = _c.sent();
                    if (release) {
                        return [2, release.assets[0].browser_download_url];
                    }
                    _c.label = 4;
                case 4:
                    i++;
                    return [3, 1];
                case 5: return [2, null];
            }
        });
    });
}
function assertDir(dir) {
    return new Promise(function (resolve, reject) {
        mkdirp(dir, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(null);
            }
        });
    });
}
function writeFile(filePath, data, options) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, assertDir(path.dirname(filePath))];
                case 1:
                    _a.sent();
                    if (!options) {
                        fs.writeFile(filePath, data, function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(null);
                            }
                        });
                    }
                    else {
                        fs.writeFile(filePath, data, options, function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(null);
                            }
                        });
                    }
                    return [2];
            }
        });
    }); });
}
var cachedDownloads = [];
function downloadZip(url) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        if (cachedDownloads.indexOf(url) > -1) {
            var readStream = fs.createReadStream(path.join(ZIP_CACHE_DIR, cachedDownloads.indexOf(url) + ".zip"));
            var writeStream = fs.createWriteStream(ZIP_PATH);
            readStream.pipe(writeStream).once('close', function () {
                resolve(null);
            });
        }
        else {
            request({
                url: url,
                encoding: null
            }, function (err, _resp, body) { return __awaiter(_this, void 0, void 0, function () {
                var index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (err) {
                                reject(err);
                                return [2];
                            }
                            return [4, assertDir(path.dirname(ZIP_PATH))];
                        case 1:
                            _a.sent();
                            return [4, writeFile(ZIP_PATH, body, {
                                    encoding: 'utf8'
                                })];
                        case 2:
                            _a.sent();
                            return [4, assertDir(ZIP_CACHE_DIR)];
                        case 3:
                            _a.sent();
                            index = cachedDownloads.push(url) - 1;
                            return [4, writeFile(path.join(ZIP_CACHE_DIR, index + ".zip"), body, {
                                    encoding: 'utf8'
                                })];
                        case 4:
                            _a.sent();
                            resolve(null);
                            return [2];
                    }
                });
            }); });
        }
    });
}
function unpackZip(dest) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, assertDir(path.dirname(dest))];
                case 1:
                    _a.sent();
                    extractZip(ZIP_PATH, {
                        dir: dest
                    }, function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(null);
                    });
                    return [2];
            }
        });
    }); });
}
function loadSourceCodeToDir(version, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, getVersionURL(version)];
                case 1:
                    url = _a.sent();
                    if (!url) {
                        process.stderr.write('Failed to find release\n');
                        process.exit(1);
                    }
                    return [4, downloadZip(url)];
                case 2:
                    _a.sent();
                    return [4, unpackZip(dest)];
                case 3:
                    _a.sent();
                    return [2];
            }
        });
    });
}
function createOptionsPageDriver(srcPath, isLocal) {
    return __awaiter(this, void 0, void 0, function () {
        var secrets, baseCapabilities, capabilties, _a, _b, _c, _d, _e, _f, unBuilt, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    secrets = !isLocal ? require('./UI/secrets') : {
                        user: '',
                        key: ''
                    };
                    baseCapabilities = {
                        'browserName': 'Chrome',
                        'os': 'Windows',
                        'os_version': '10',
                        'resolution': '1920x1080',
                        'browserstack.user': secrets.user,
                        'browserstack.key': secrets.key,
                        'browserstack.local': true,
                        'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
                        'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
                    };
                    _b = (_a = webdriver.Capabilities).bind;
                    _c = [{}, baseCapabilities];
                    _d = {
                        project: 'Custom Right-Click Menu'
                    };
                    return [4, imports_1.tryReadManifest('app/manifest.json')];
                case 1:
                    _e = (_j.sent());
                    if (_e) return [3, 3];
                    return [4, imports_1.tryReadManifest('app/manifest.chrome.json')];
                case 2:
                    _e = (_j.sent());
                    _j.label = 3;
                case 3:
                    _f = (_e).version + " - ";
                    return [4, imports_1.getGitHash()];
                case 4:
                    capabilties = new (_b.apply(_a, [void 0, __assign.apply(void 0, _c.concat([(_d.build = _f + (_j.sent()),
                                _d.name = 'Chrome' + " " + 'latest',
                                _d['browserstack.local'] = true,
                                _d)]))]))().merge(new chromeDriver.Options()
                        .addExtensions(srcPath)
                        .toCapabilities());
                    unBuilt = new webdriver.Builder()
                        .usingServer(isLocal ?
                        'http://localhost:9515' : 'http://hub-cloud.browserstack.com/wd/hub')
                        .withCapabilities(capabilties);
                    _g = {};
                    if (!isLocal) return [3, 6];
                    return [4, unBuilt.forBrowser('Chrome').build()];
                case 5:
                    _h = _j.sent();
                    return [3, 8];
                case 6: return [4, unBuilt.build()];
                case 7:
                    _h = _j.sent();
                    _j.label = 8;
                case 8: return [2, (_g.driver = _h,
                        _g.capabilties = baseCapabilities,
                        _g)];
            }
        });
    });
}
function setupExtensionOptionsPageInstance(srcPath, isLocal) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, driver, capabilties;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, createOptionsPageDriver(srcPath, isLocal)];
                case 1:
                    _a = _b.sent(), driver = _a.driver, capabilties = _a.capabilties;
                    imports_1.setDriver(driver);
                    return [4, chromeExtensionData.openOptionsPage(driver, capabilties)];
                case 2:
                    _b.sent();
                    return [2, {
                            driver: driver, capabilties: capabilties
                        }];
            }
        });
    });
}
function folderToCrx(folder, name, dest) {
    return new Promise(function (resolve, reject) {
        if (folder.indexOf('/') === folder.length - 1) {
            folder = folder.slice(0, -1);
        }
        vinyl.src(folder + "/**", {
            cwd: folder,
            base: folder
        })
            .pipe(zip(name))
            .pipe(vinyl.dest(dest))
            .on('end', function () {
            resolve(null);
        })
            .on('error', function (err) {
            reject(err);
        });
    });
}
function flattenPath(path) {
    var total = -1;
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var row = path_1[_i];
        total += row + 1;
    }
    return total;
}
function accessByPath(tree, path) {
    for (var i = 0; i < path.length - 1; i++) {
        var child = tree[path[i]].children;
        if (!child) {
            throw new Error('Could not find child in tree');
        }
        tree = child;
    }
    return tree[path[path.length - 1]];
}
function openDialog(driver, index) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                        [
                            window.app.editCRM &&
                                window.app.editCRM
                                    .querySelectorAll('edit-crm-item:not([root-node])'),
                            window.app.editCRM.shadowRoot &&
                                window.app.editCRM.shadowRoot
                                    .querySelectorAll('edit-crm-item:not([root-node])')
                        ].filter(function (val) { return !!val; }).map(function (selection) {
                            selection &&
                                selection[REPLACE.index] &&
                                selection[REPLACE.index].openEditPage();
                        });
                    }, {
                        index: index
                    }))];
                case 1:
                    _a.sent();
                    return [2];
            }
        });
    });
}
function doTestsFromTo(from, to, isLocal) {
    var _this = this;
    before('Clear migration directory', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, del(path.join(ROOT, 'temp/migration/'))];
                case 1:
                    _a.sent();
                    return [2];
            }
        });
    }); });
    describe('Loading source code', function () {
        var _this = this;
        this.timeout(20000);
        this.slow(20000);
        it('should be able to load the "from" version', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        global.Promise = _promise;
                        return [4, loadSourceCodeToDir(from, path.join(ROOT, 'temp/migration/from/'))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('should be able to load the "to" version', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(to === 'current')) return [3, 2];
                        return [4, new Promise(function (resolve, reject) {
                                copydir(path.join(ROOT, 'build/'), path.join(ROOT, 'temp/migration/to/'), function (err) {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                    resolve(null);
                                });
                            })];
                    case 1:
                        _a.sent();
                        return [3, 4];
                    case 2: return [4, loadSourceCodeToDir(to, path.join(ROOT, 'temp/migration/to/'))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        }); });
    });
    describe('Creating .crx files', function () {
        var _this = this;
        this.timeout(5000);
        this.slow(2000);
        it('should be possible to create a crx file from the "from" folder', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, folderToCrx(path.join(ROOT, 'temp/migration/from'), 'from.crx', path.join(ROOT, 'temp/migration/'))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        it('should be possible to create a crx file from the "to" folder', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, folderToCrx(path.join(ROOT, 'temp/migration/to'), 'to.crx', path.join(ROOT, 'temp/migration/'))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
    });
    var NODES = [
        ['link', [0]],
        ['script', [1]],
        ['divider', [2]],
        ['stylesheet', [3]],
        ['menu', [4]],
        ['link', [4, 0]]
    ];
    function forEachNode(callback) {
        for (var _i = 0, NODES_1 = NODES; _i < NODES_1.length; _i++) {
            var _a = NODES_1[_i], type = _a[0], path_2 = _a[1];
            callback(type, path_2);
        }
    }
    var driver;
    var capabilties;
    describe('Getting and setting storage', function () {
        describe('Loading page', function () {
            it('should be possible to set up "from" selenium instance', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var val;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(60000);
                                this.slow(20000);
                                return [4, setupExtensionOptionsPageInstance(path.join(ROOT, 'temp/migration/from.crx'), isLocal)];
                            case 1:
                                val = _a.sent();
                                driver = val.driver;
                                capabilties = val.capabilties;
                                return [2];
                        }
                    });
                });
            });
            it('should finish loading', function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(60000);
                                this.slow(30000);
                                imports_1.setDriver(driver);
                                return [4, imports_1.wait(1000)];
                            case 1:
                                _a.sent();
                                return [4, imports_1.waitFor(function () {
                                        return driver.executeScript(imports_1.inlineFn(function () {
                                            return window.polymerElementsLoaded;
                                        }));
                                    }, 2500, 600000).then(function () { }, function () {
                                        throw new Error('Failed to get elements loaded message, page load is failing');
                                    })];
                            case 2:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
        });
        describe('Clearing settings', function () {
            it('should be possible to clear storage', function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(60000);
                                this.slow(35000);
                                return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (done) {
                                        var global = window.browserAPI || window.chrome;
                                        if (window.browserAPI) {
                                            window.browserAPI.storage.local.clear().then(function () {
                                                window.browserAPI.storage.sync.clear().then(function () {
                                                    done(null);
                                                });
                                            });
                                        }
                                        else {
                                            global.storage.local.clear(function () {
                                                global.storage.sync.clear(function () {
                                                    done(null);
                                                });
                                            });
                                        }
                                    }))];
                            case 1:
                                _a.sent();
                                return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (done) {
                                        var global = window.browserAPI || window.chrome;
                                        if (window.browserAPI) {
                                            window.browserAPI.runtime.getBackgroundPage().then(function (backgroundPage) {
                                                backgroundPage.location.reload();
                                                done(null);
                                            });
                                        }
                                        else {
                                            global.runtime.getBackgroundPage(function (backgroundPage) {
                                                backgroundPage.location.reload();
                                                done(null);
                                            });
                                        }
                                    }))];
                            case 2:
                                _a.sent();
                                return [4, imports_1.wait(2000)];
                            case 3:
                                _a.sent();
                                return [4, driver.navigate().refresh()];
                            case 4:
                                _a.sent();
                                return [4, imports_1.wait(1000)];
                            case 5:
                                _a.sent();
                                return [4, imports_1.waitFor(function () {
                                        return driver.executeScript(imports_1.inlineFn(function () {
                                            return window.polymerElementsLoaded;
                                        }));
                                    }, 2500, 600000).then(function () { }, function () {
                                        throw new Error('Failed to get elements loaded message, page load is failing');
                                    })];
                            case 6:
                                _a.sent();
                                return [4, imports_1.wait(3000)];
                            case 7:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
        });
        describe('Creating CRM', function () {
            describe('Creating structure', function () {
                function testTypeSwitch(type, index) {
                    return __awaiter(this, void 0, void 0, function () {
                        var typesMatch;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                        [
                                            window.app.editCRM &&
                                                window.app.editCRM
                                                    .querySelectorAll('edit-crm-item:not([root-node])'),
                                            window.app.editCRM.shadowRoot &&
                                                window.app.editCRM.shadowRoot
                                                    .querySelectorAll('edit-crm-item:not([root-node])')
                                        ].filter(function (val) { return !!val; }).map(function (selection) {
                                            selection &&
                                                selection[REPLACE.index] &&
                                                selection[REPLACE.index].typeIndicatorMouseOver();
                                        });
                                    }, {
                                        index: index
                                    }))];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(300)];
                                case 2:
                                    _a.sent();
                                    return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                            [
                                                window.app.editCRM &&
                                                    window.app.editCRM
                                                        .querySelectorAll('edit-crm-item:not([root-node])'),
                                                window.app.editCRM.shadowRoot &&
                                                    window.app.editCRM.shadowRoot
                                                        .querySelectorAll('edit-crm-item:not([root-node])')
                                            ].filter(function (val) { return !!val; }).forEach(function (selection) {
                                                [
                                                    selection &&
                                                        selection[REPLACE.index] &&
                                                        selection[REPLACE.index].querySelector('type-switcher'),
                                                    selection &&
                                                        selection[REPLACE.index] &&
                                                        selection[REPLACE.index].shadowRoot &&
                                                        selection[REPLACE.index].shadowRoot.querySelector('type-switcher')
                                                ].filter(function (val) { return !!val; }).forEach(function (selection) {
                                                    selection.openTypeSwitchContainer();
                                                });
                                            });
                                        }, {
                                            index: index
                                        }))];
                                case 3:
                                    _a.sent();
                                    return [4, imports_1.wait(300)];
                                case 4:
                                    _a.sent();
                                    return [4, driver.executeScript(imports_1.inlineFn(function (REPLACE) {
                                            [
                                                window.app.editCRM &&
                                                    window.app.editCRM
                                                        .querySelectorAll('edit-crm-item:not([root-node])'),
                                                window.app.editCRM.shadowRoot &&
                                                    window.app.editCRM.shadowRoot
                                                        .querySelectorAll('edit-crm-item:not([root-node])')
                                            ].filter(function (val) { return !!val; }).forEach(function (editCrmItem) {
                                                [
                                                    editCrmItem &&
                                                        editCrmItem[REPLACE.index] &&
                                                        editCrmItem[REPLACE.index].querySelector('type-switcher'),
                                                    editCrmItem &&
                                                        editCrmItem[REPLACE.index] &&
                                                        editCrmItem[REPLACE.index].shadowRoot &&
                                                        editCrmItem[REPLACE.index].shadowRoot.querySelector('type-switcher')
                                                ].filter(function (val) { return !!val; }).forEach(function (typeSwitcher) {
                                                    switch ("REPLACE.versionFrom") {
                                                        case '2.0.15':
                                                        case '2.0.16':
                                                        case '2.0.17':
                                                            editCrmItem && editCrmItem[REPLACE.index] &&
                                                                (editCrmItem[REPLACE.index].$.typeSwitcher =
                                                                    typeSwitcher);
                                                    }
                                                    ;
                                                    [
                                                        typeSwitcher &&
                                                            typeSwitcher
                                                                .querySelector('.typeSwitchChoice[type="REPLACE.type"]'),
                                                        typeSwitcher &&
                                                            typeSwitcher.shadowRoot &&
                                                            typeSwitcher.shadowRoot
                                                                .querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                                                    ].filter(function (val) { return !!val; }).forEach(function (typeSwitchChoice) {
                                                        typeSwitchChoice.click();
                                                    });
                                                });
                                                editCrmItem && editCrmItem[REPLACE.index] &&
                                                    editCrmItem[REPLACE.index].typeIndicatorMouseLeave();
                                            });
                                            return window.app.settings.crm[REPLACE.index].type === 'REPLACE.type';
                                        }, {
                                            type: type,
                                            index: index,
                                            versionFrom: from
                                        }))];
                                case 5:
                                    typesMatch = _a.sent();
                                    assert.isTrue(typesMatch, 'new type matches expected');
                                    return [2];
                            }
                        });
                    });
                }
                it('should be possible to create a second node', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(1500);
                                    this.slow(600);
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.id('addButton'))
                                            .click()];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(100)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.className('addingItemPlaceholder'))
                                            .click()];
                                case 3:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to convert the second node to a script', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(3000);
                                    this.slow(2000);
                                    return [4, testTypeSwitch('script', 1)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to create a third node', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(1500);
                                    this.slow(1000);
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.id('addButton'))
                                            .click()];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(100)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.className('addingItemPlaceholder'))
                                            .click()];
                                case 3:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to convert the third node to a divider', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(3000);
                                    this.slow(2000);
                                    return [4, testTypeSwitch('divider', 2)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to create a fourth node', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(1500);
                                    this.slow(1000);
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.id('addButton'))
                                            .click()];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(100)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.className('addingItemPlaceholder'))
                                            .click()];
                                case 3:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to convert the fourth node to a stylesheet', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(3000);
                                    this.slow(2000);
                                    return [4, testTypeSwitch('stylesheet', 3)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to create a fifth node', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(1500);
                                    this.slow(1000);
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.id('addButton'))
                                            .click()];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(100)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.className('addingItemPlaceholder'))
                                            .click()];
                                case 3:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to convert the fifth node to a menu', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(3000);
                                    this.slow(2000);
                                    return [4, testTypeSwitch('menu', 4)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
                it('should be possible to add a child to the menu', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(1500);
                                    this.slow(1000);
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElement(webdriver.By.id('addButton'))
                                            .click()];
                                case 1:
                                    _a.sent();
                                    return [4, imports_1.wait(100)];
                                case 2:
                                    _a.sent();
                                    return [4, imports_1.findElement(webdriver.By.tagName('crm-app'))
                                            .findElement(webdriver.By.tagName('edit-crm'))
                                            .findElements(webdriver.By.className('addingItemPlaceholder'))
                                            .get(1)
                                            .click()];
                                case 3:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    });
                });
            });
            describe('Setting some values', function () {
                forEachNode(function (type, path) {
                    var index = flattenPath(path);
                    describe("Setting values for node " + index, function () {
                        var dialog;
                        before('Open dialog', function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.timeout(30000);
                                            return [4, openDialog(driver, index)];
                                        case 1:
                                            _a.sent();
                                            return [4, imports_1.wait(2000)];
                                        case 2:
                                            _a.sent();
                                            return [4, imports_1.getDialog(type)];
                                        case 3:
                                            dialog = _a.sent();
                                            return [4, imports_1.wait(2000)];
                                        case 4:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            });
                        });
                        var name;
                        describe('Setting values', function () {
                            afterEach(function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                this.timeout(10000);
                                                return [4, imports_1.wait(500)];
                                            case 1:
                                                _a.sent();
                                                return [2];
                                        }
                                    });
                                });
                            });
                            it('should be possible to set the name', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            name = "name" + index;
                                            return [4, dialog.findElement(webdriver.By.id('nameInput'))
                                                    .sendKeys(0, name)];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); });
                            it('should be possible to set the content types', function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                this.timeout(5000);
                                                this.slow(4000);
                                                return [4, dialog.findElements(webdriver.By.className('showOnContentItemCont'))
                                                        .mapWaitChain(function (element, index) {
                                                        if (index === 0) {
                                                            return imports_1.wait(250);
                                                        }
                                                        return element.findElement(webdriver.By.tagName('paper-checkbox'))
                                                            .click()
                                                            .then(function () {
                                                            return imports_1.wait(250);
                                                        });
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [2];
                                        }
                                    });
                                });
                            });
                            switch (type) {
                                case 'link':
                                case 'menu':
                                case 'divider':
                                    it('should be possible to change the showOnSpecified', function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            var triggers;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        this.timeout(5000);
                                                        this.slow(3000);
                                                        return [4, dialog.findElement(webdriver.By.id('showOnSpecified')).click()];
                                                    case 1:
                                                        _a.sent();
                                                        return [4, dialog.findElement(webdriver.By.id('addTrigger'))
                                                                .click()
                                                                .click()];
                                                    case 2:
                                                        _a.sent();
                                                        return [4, imports_1.wait(500)];
                                                    case 3:
                                                        _a.sent();
                                                        return [4, dialog
                                                                .findElements(webdriver.By.className('executionTrigger'))];
                                                    case 4:
                                                        triggers = _a.sent();
                                                        return [4, triggers[0].findElement(webdriver.By.tagName('paper-checkbox')).click()];
                                                    case 5:
                                                        _a.sent();
                                                        return [4, triggers[1].findElement(webdriver.By.tagName('paper-input'))
                                                                .sendKeys(0, 'http://www.google.com')];
                                                    case 6:
                                                        _a.sent();
                                                        return [2];
                                                }
                                            });
                                        });
                                    });
                                    break;
                                case 'script':
                                case 'stylesheet':
                                    it('should be possible to change the click triggers', function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            var options;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        this.timeout(4000);
                                                        this.slow(2000);
                                                        return [4, dialog.findElement(webdriver.By.id('dropdownMenu'))
                                                                .click()];
                                                    case 1:
                                                        _a.sent();
                                                        return [4, imports_1.wait(500)];
                                                    case 2:
                                                        _a.sent();
                                                        return [4, dialog
                                                                .findElements(webdriver.By.css('.stylesheetLaunchOption,' +
                                                                ' .scriptLaunchOption'))];
                                                    case 3:
                                                        options = _a.sent();
                                                        return [4, options[1]
                                                                .click()];
                                                    case 4:
                                                        _a.sent();
                                                        return [2];
                                                }
                                            });
                                        });
                                    });
                                    break;
                            }
                            switch (type) {
                                case 'link':
                                    it('should be possible to add links', function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            var newUrl, _a;
                                            var _this = this;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        this.timeout(8000);
                                                        this.slow(6000);
                                                        newUrl = 'www.google.com';
                                                        return [4, dialog
                                                                .findElement(webdriver.By.id('changeLink'))
                                                                .findElement(webdriver.By.tagName('paper-button'))
                                                                .click()
                                                                .click()
                                                                .click()];
                                                    case 1:
                                                        _b.sent();
                                                        return [4, imports_1.wait(500)];
                                                    case 2:
                                                        _b.sent();
                                                        _a = imports_1.forEachPromise;
                                                        return [4, dialog
                                                                .findElements(webdriver.By.className('linkChangeCont'))];
                                                    case 3: return [4, _a.apply(void 0, [_b.sent(),
                                                            function (element) {
                                                                return new webdriver.promise.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0: return [4, imports_1.wait(250)];
                                                                            case 1:
                                                                                _a.sent();
                                                                                return [4, element
                                                                                        .findElement(webdriver.By.tagName('paper-checkbox'))
                                                                                        .click()];
                                                                            case 2:
                                                                                _a.sent();
                                                                                return [4, element
                                                                                        .findElement(webdriver.By.tagName('paper-input'))
                                                                                        .sendKeys(0, newUrl)];
                                                                            case 3:
                                                                                _a.sent();
                                                                                resolve(null);
                                                                                return [2];
                                                                        }
                                                                    });
                                                                }); });
                                                            }])];
                                                    case 4:
                                                        _b.sent();
                                                        return [2];
                                                }
                                            });
                                        });
                                    });
                                    break;
                                case 'script':
                                    it('should be possible to change the contents of the ' +
                                        'script, backgroundscript and options', function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                                            var node = window.scriptEdit.newSettings;
                                                            node.value.script = 'script0script1script2';
                                                            node.value.backgroundScript =
                                                                'console.log("backgroundscript0backgroundscript1' +
                                                                    'backgroundscript2")';
                                                            node.value.options = {
                                                                value: {
                                                                    type: 'number',
                                                                    value: 1
                                                                }
                                                            };
                                                        }))];
                                                    case 1:
                                                        _a.sent();
                                                        return [2];
                                                }
                                            });
                                        });
                                    });
                                    break;
                                case 'stylesheet':
                                    it('should be possible to change the contents of the ' +
                                        'stylesheet and options', function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                                                            var node = window.stylesheetEdit.newSettings;
                                                            node.value.stylesheet =
                                                                'stylesheet0stylesheet1stylesheet2';
                                                            node.value.options = {
                                                                value: {
                                                                    type: 'number',
                                                                    value: 1
                                                                }
                                                            };
                                                        }))];
                                                    case 1:
                                                        _a.sent();
                                                        return [2];
                                                }
                                            });
                                        });
                                    });
                                    it('should be possible to toggle the sliders', function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        this.timeout(500);
                                                        this.slow(200);
                                                        return [4, dialog.findElement(webdriver.By.id('isTogglableButton'))
                                                                .click()];
                                                    case 1:
                                                        _a.sent();
                                                        return [4, dialog.findElement(webdriver.By.id('isDefaultOnButton'))
                                                                .click()];
                                                    case 2:
                                                        _a.sent();
                                                        return [2];
                                                }
                                            });
                                        });
                                    });
                                    break;
                            }
                        });
                        var crm;
                        describe('Saving the values', function () {
                            it('should be possible to save the dialog', function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                this.timeout(10000);
                                                this.slow(9000);
                                                return [4, imports_1.wait(2000)];
                                            case 1:
                                                _a.sent();
                                                return [4, imports_1.saveDialog(dialog)];
                                            case 2:
                                                _a.sent();
                                                return [4, imports_1.wait(1500)];
                                            case 3:
                                                _a.sent();
                                                return [4, imports_1.getCRM()];
                                            case 4:
                                                crm = _a.sent();
                                                return [2];
                                        }
                                    });
                                });
                            });
                        });
                        describe('Testing set values', function () {
                            it('has changed the name', function () {
                                assert.strictEqual(accessByPath(crm, path).name, name, 'name has been saved');
                            });
                            if (type !== 'script' && type !== 'stylesheet') {
                                it('has changed the content types', function () {
                                    assert.isFalse(accessByPath(crm, path).onContentTypes[1], 'content types that were on were switched off');
                                    assert.isTrue(accessByPath(crm, path).onContentTypes[4], 'content types that were off were switched on');
                                    var newContentTypes = [
                                        true, true, true, false, false, false
                                    ].map(function (contentType) { return !contentType; });
                                    newContentTypes[0] = true;
                                    assert.deepEqual(accessByPath(crm, path).onContentTypes, newContentTypes, 'all content types were toggled');
                                });
                            }
                            switch (type) {
                                case 'link':
                                case 'menu':
                                case 'divider':
                                    it('should have changed the triggers', function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                assert.lengthOf(accessByPath(crm, path).triggers, 3, 'trigger has been added');
                                                assert.isTrue(accessByPath(crm, path).triggers[0].not, 'first trigger is NOT');
                                                assert.isFalse(accessByPath(crm, path).triggers[1].not, 'second trigger is not NOT');
                                                assert.strictEqual(accessByPath(crm, path).triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                                assert.strictEqual(accessByPath(crm, path).triggers[1].url, 'http://www.google.com', 'second trigger url changed');
                                                return [2];
                                            });
                                        });
                                    });
                                    break;
                                case 'script':
                                case 'stylesheet':
                                    it('should have changed the launch modes', function () {
                                        assert.strictEqual(accessByPath(crm, path).value.launchMode, 1, 'launchmode is the same as expected');
                                    });
                                    break;
                            }
                            switch (type) {
                                case 'link':
                                    it('should have added the links', function () {
                                        var newUrl = 'www.google.com';
                                        var newValue = {
                                            newTab: true,
                                            url: newUrl
                                        };
                                        assert.lengthOf(accessByPath(crm, path).value, 4, 'node has 4 links now');
                                        var newLinks = Array.apply(null, Array(4))
                                            .map(function () { return JSON.parse(JSON.stringify(newValue)); });
                                        newLinks[3].newTab = false;
                                        assert.deepEqual(accessByPath(crm, path).value, newLinks, 'new links match changed link value');
                                    });
                                    break;
                                case 'stylesheet':
                                    it('should have toggled the sliders', function () {
                                        assert.isTrue(accessByPath(crm, path).value.toggle, 'toggle option is set to on');
                                        assert.isTrue(accessByPath(crm, path).value.toggle, 'toggle option is set to true');
                                        assert.isTrue(accessByPath(crm, path).value.defaultOn, 'defaultOn is set to true');
                                    });
                                    break;
                            }
                        });
                    });
                });
            });
        });
        var storageData = null;
        describe('Saving settings', function () {
            it('should be able to save the storage settings', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (done) {
                                var global = window.browserAPI || window.chrome;
                                if (window.browserAPI) {
                                    window.browserAPI.storage.local.get().then(function (local) {
                                        window.browserAPI.storage.sync.get().then(function (sync) {
                                            done({ local: local, sync: sync });
                                        });
                                    });
                                }
                                else {
                                    global.storage.local.get(function (local) {
                                        global.storage.sync.get(function (sync) {
                                            done({ local: local, sync: sync });
                                        });
                                    });
                                }
                            }))];
                        case 1:
                            storageData = _a.sent();
                            return [2];
                    }
                });
            }); });
            it('should be possible to quit the selenium instance', function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(60000);
                                this.slow(10000);
                                return [4, driver.quit()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
        });
        describe('Loading "to" version', function () {
            it('should be possible to set up "to" selenium instance', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var val;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(60000);
                                this.slow(250000);
                                return [4, setupExtensionOptionsPageInstance(path.join(ROOT, 'temp/migration/to.crx'), isLocal)];
                            case 1:
                                val = _a.sent();
                                driver = val.driver;
                                capabilties = val.capabilties;
                                return [2];
                        }
                    });
                });
            });
            it('should finish loading', function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(60000);
                                this.slow(15000);
                                imports_1.setDriver(driver);
                                return [4, imports_1.wait(1000)];
                            case 1:
                                _a.sent();
                                return [4, imports_1.waitFor(function () {
                                        return driver.executeScript(imports_1.inlineFn(function () {
                                            return window.polymerElementsLoaded;
                                        }));
                                    }, 2500, 600000).then(function () { }, function () {
                                        throw new Error('Failed to get elements loaded message, page load is failing');
                                    })];
                            case 2:
                                _a.sent();
                                return [4, imports_1.wait(5000)];
                            case 3:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
            it('should be able to set the storage settings', function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(10000);
                                assert.lengthOf(storageData.sync.indexes, 1, 'there\'s only one index');
                                return [4, imports_1.executeAsyncScript(imports_1.inlineAsyncFn(function (done) {
                                        var data = {
                                            local: JSON.parse('REPLACE.storageLocal'),
                                            sync: {
                                                indexes: JSON.parse('REPLACE.indexes'),
                                                section0: 'REPLACE.section0'
                                            }
                                        };
                                        var global = window.browserAPI || window.chrome;
                                        if (window.browserAPI) {
                                            window.browserAPI.storage.local.set(data.local).then(function () {
                                                window.browserAPI.storage.sync.set(data.sync).then(function () {
                                                    done(null);
                                                });
                                            });
                                        }
                                        else {
                                            global.storage.local.set(data.local).then(function () {
                                                global.storage.sync.set(data.sync).then(function () {
                                                    done(null);
                                                });
                                            });
                                        }
                                    }, {
                                        storageLocal: JSON.stringify(storageData.local),
                                        indexes: JSON.stringify(storageData.sync.indexes),
                                        section0: storageData.sync.section0
                                    }))];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
        });
    });
    describe('Testing page', function () {
        it('should be possible to reload the background page', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(60000);
                            this.slow(25000);
                            return [4, imports_1.wait(20000)];
                        case 1:
                            _a.sent();
                            return [4, chromeExtensionData.reloadBackgroundPage(driver, capabilties)];
                        case 2:
                            _a.sent();
                            return [4, imports_1.wait(10000)];
                        case 3:
                            _a.sent();
                            return [4, chromeExtensionData.openOptionsPage(driver, capabilties)];
                        case 4:
                            _a.sent();
                            return [4, imports_1.wait(1000)];
                        case 5:
                            _a.sent();
                            return [2];
                    }
                });
            });
        });
        it('should finish loading', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(60000);
                            this.slow(15000);
                            return [4, imports_1.waitFor(function () {
                                    return driver.executeScript(imports_1.inlineFn(function () {
                                        return window.polymerElementsLoaded;
                                    }));
                                }, 2500, 600000).then(function () { }, function () {
                                    throw new Error('Failed to get elements loaded message, page load is failing');
                                })];
                        case 1:
                            _a.sent();
                            return [4, imports_1.wait(6000)];
                        case 2:
                            _a.sent();
                            return [2];
                    }
                });
            });
        });
        it('should not have thrown any errors', function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                            return window.errorReportingTool.lastErrors;
                        }))];
                    case 1:
                        result = _a.sent();
                        assert.lengthOf(result, 0, 'no errors should have been thrown');
                        return [2];
                }
            });
        }); });
        it('should have loaded the CRM', function () { return __awaiter(_this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, driver.executeScript(imports_1.inlineFn(function () {
                            for (var _i = 0, _a = [
                                window.app.editCRM &&
                                    window.app.editCRM
                                        .querySelectorAll('edit-crm-item:not([root-node])'),
                                window.app.editCRM.shadowRoot &&
                                    window.app.editCRM.shadowRoot
                                        .querySelectorAll('edit-crm-item:not([root-node])')
                            ].filter(function (val) { return !!val; }); _i < _a.length; _i++) {
                                var selection = _a[_i];
                                if (selection && selection[0]) {
                                    return selection;
                                }
                            }
                            return null;
                        }))];
                    case 1:
                        item = _a.sent();
                        assert.exists(item, 'edit-crm-item exists');
                        return [2];
                }
            });
        }); });
        forEachNode(function (type, path) {
            var index = flattenPath(path);
            it("should be possible to open the dialog at index " + index + " without errors", function () {
                return __awaiter(this, void 0, void 0, function () {
                    var dialog, errors;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(20000);
                                this.slow(15000);
                                return [4, openDialog(driver, index)];
                            case 1:
                                _a.sent();
                                return [4, imports_1.wait(2000)];
                            case 2:
                                _a.sent();
                                return [4, imports_1.getDialog(type)];
                            case 3:
                                dialog = _a.sent();
                                return [4, driver.executeScript(imports_1.inlineFn(function () {
                                        return window.errorReportingTool.lastErrors;
                                    }))];
                            case 4:
                                errors = _a.sent();
                                assert.lengthOf(errors, 0, 'no errors should have been thrown');
                                return [4, imports_1.wait(2000)];
                            case 5:
                                _a.sent();
                                return [4, imports_1.saveDialog(dialog)];
                            case 6:
                                _a.sent();
                                return [4, imports_1.wait(1500)];
                            case 7:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            });
            var crm;
            it('should be possible to load the CRM', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, imports_1.getCRM()];
                        case 1:
                            crm = _a.sent();
                            assert.exists(crm, 'loaded crm exists');
                            return [2];
                    }
                });
            }); });
            describe("Tests for index " + index, function () {
                it('has changed the name', function () {
                    assert.strictEqual(accessByPath(crm, path).name, "name" + index, 'name has been saved');
                });
                if (type !== 'script' && type !== 'stylesheet') {
                    it('has changed the content types', function () {
                        assert.isFalse(accessByPath(crm, path).onContentTypes[1], 'content types that were on were switched off');
                        assert.isTrue(accessByPath(crm, path).onContentTypes[4], 'content types that were off were switched on');
                        var newContentTypes = [
                            true, true, true, false, false, false
                        ].map(function (contentType) { return !contentType; });
                        newContentTypes[0] = true;
                        assert.deepEqual(accessByPath(crm, path).onContentTypes, newContentTypes, 'all content types were toggled');
                    });
                }
                switch (type) {
                    case 'link':
                    case 'menu':
                    case 'divider':
                        it('should have changed the triggers', function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    assert.lengthOf(accessByPath(crm, path).triggers, 3, 'trigger has been added');
                                    assert.isTrue(accessByPath(crm, path).triggers[0].not, 'first trigger is NOT');
                                    assert.isFalse(accessByPath(crm, path).triggers[1].not, 'second trigger is not NOT');
                                    assert.strictEqual(accessByPath(crm, path).triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                    assert.strictEqual(accessByPath(crm, path).triggers[1].url, 'http://www.google.com', 'second trigger url changed');
                                    return [2];
                                });
                            });
                        });
                        break;
                    case 'script':
                    case 'stylesheet':
                        it('should have changed the launch modes', function () {
                            assert.strictEqual(accessByPath(crm, path).value.launchMode, 1, 'launchmode is the same as expected');
                        });
                        break;
                }
                switch (type) {
                    case 'link':
                        it('should have added the links', function () {
                            var newUrl = 'www.google.com';
                            var newValue = {
                                newTab: true,
                                url: newUrl
                            };
                            assert.lengthOf(accessByPath(crm, path).value, 4, 'node has 4 links now');
                            var newLinks = Array.apply(null, Array(4))
                                .map(function () { return JSON.parse(JSON.stringify(newValue)); });
                            newLinks[3].newTab = false;
                            assert.deepEqual(accessByPath(crm, path).value, newLinks, 'new links match changed link value');
                        });
                        break;
                    case 'stylesheet':
                        it('should have toggled the sliders', function () {
                            assert.isTrue(accessByPath(crm, path).value.toggle, 'toggle option is set to on');
                            assert.isTrue(accessByPath(crm, path).value.toggle, 'toggle option is set to true');
                            assert.isTrue(accessByPath(crm, path).value.defaultOn, 'defaultOn is set to true');
                        });
                        break;
                }
            });
        });
    });
    after('Quit driver', function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.timeout(60000);
                        this.slow(10000);
                        if (!!WAIT_ON_DONE) return [3, 2];
                        return [4, driver.quit()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    });
}
(function () {
    var input = getInput();
    var isLocal = input.isLocal;
    var runs = getRuns(input);
    runs.forEach(function (_a) {
        var from = _a.from, to = _a.to;
        describe("Migrating from " + from + " to " + to, function () {
            this.retries(2);
            doTestsFromTo(from, to, isLocal);
        });
    });
})();
