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
export var CRMNodes;
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var Handler;
        (function (Handler) {
            function genCodeOnPage(_a) {
                var tab = _a.tab, key = _a.key, info = _a.info, node = _a.node, script = _a.script, tabIndex = _a.tabIndex, safeNode = _a.safeNode, indentUnit = _a.indentUnit, contextData = _a.contextData, greaseMonkeyData = _a.greaseMonkeyData;
                return __awaiter(this, void 0, void 0, function () {
                    var enableBackwardsCompatibility, catchErrs, supportedBrowserAPIs, doDebug;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                            case 1:
                                enableBackwardsCompatibility = (_b.sent()).indexOf('/*execute locally*/') > -1 &&
                                    node.isLocal;
                                catchErrs = CRMNodes.modules.storages.storageLocal.catchErrors;
                                supportedBrowserAPIs = [];
                                if (BrowserAPI.isBrowserAPISupported('chrome')) {
                                    supportedBrowserAPIs.push('chrome');
                                }
                                if (BrowserAPI.isBrowserAPISupported('browser')) {
                                    supportedBrowserAPIs.push('browser');
                                }
                                doDebug = CRMNodes.modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(node.id) > -1;
                                if (doDebug) {
                                    CRMNodes.modules.globalObject.globals.eventListeners.scriptDebugListeners
                                        .splice(CRMNodes.modules.globalObject.globals.eventListeners.scriptDebugListeners.indexOf(node.id), 1);
                                }
                                CRMNodes.modules.Util.setMapDefault(CRMNodes.modules.storages.nodeStorage, node.id, {});
                                CRMNodes.modules.Util.setMapDefault(CRMNodes.modules.storages.nodeStorageSync, node.id, {});
                                return [2, [
                                        [
                                            "var crmAPI = new (window._crmAPIRegistry.pop())(" + [
                                                safeNode, node.id, tab, info, key,
                                                CRMNodes.modules.storages.nodeStorage.get(node.id),
                                                contextData, greaseMonkeyData, false, (node.value && node.value.options) || {},
                                                enableBackwardsCompatibility, tabIndex, browserAPI.runtime.id, supportedBrowserAPIs.join(','),
                                                CRMNodes.modules.storages.nodeStorageSync.get(node.id)
                                            ].map(function (param) {
                                                if (param === void 0) {
                                                    return JSON.stringify(null);
                                                }
                                                return JSON.stringify(param);
                                            }).join(', ') + ");"
                                        ].join(', '),
                                        CRMNodes.modules.constants.templates.globalObjectWrapperCode('window', 'windowWrapper', node.isLocal && BrowserAPI.isBrowserAPISupported('chrome') ? 'chrome' : 'void 0', node.isLocal && BrowserAPI.isBrowserAPISupported('browser') ? 'browser' : 'void 0'),
                                        "" + (catchErrs ? 'try {' : ''),
                                        'function main(crmAPI, window, chrome, browser, menuitemid, parentmenuitemid, mediatype,' +
                                            'linkurl, srcurl, pageurl, frameurl, frameid,' +
                                            'selectiontext, editable, waschecked, checked) {',
                                        doDebug ? 'debugger;' : '',
                                        script,
                                        '}',
                                        "crmAPI.onReady(function() {main.apply(this, [crmAPI, windowWrapper, " + (node.isLocal && BrowserAPI.isBrowserAPISupported('chrome') ? 'chrome' : 'void 0') + ", " + (node.isLocal && BrowserAPI.isBrowserAPISupported('browser') ? 'browser' : 'void 0') + "].concat(" + JSON.stringify([
                                            info.menuItemId, info.parentMenuItemId, info.mediaType,
                                            info.linkUrl, info.srcUrl, info.pageUrl, info.frameUrl,
                                            info.frameId, info.selectionText,
                                            info.editable, info.wasChecked, info.checked
                                        ]) + "))})",
                                        "" + (catchErrs ? [
                                            "} catch (error) {",
                                            indentUnit + "if (crmAPI.debugOnError) {",
                                            "" + indentUnit + indentUnit + "debugger;",
                                            indentUnit + "}",
                                            indentUnit + "throw error;",
                                            "}"
                                        ].join('\n') : '')
                                    ].join('\n')];
                        }
                    });
                });
            }
            function getScriptsToRun(code, runAt, node, usesUnsafeWindow) {
                return __awaiter(this, void 0, void 0, function () {
                    var scripts, globalLibraries, urlDataPairs, i, lib, j, currentLib, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                scripts = [];
                                globalLibraries = CRMNodes.modules.storages.storageLocal.libraries;
                                urlDataPairs = CRMNodes.modules.storages.urlDataPairs;
                                i = 0;
                                _b.label = 1;
                            case 1:
                                if (!(i < node.value.libraries.length)) return [3, 9];
                                lib = void 0;
                                if (!globalLibraries) return [3, 7];
                                j = 0;
                                _b.label = 2;
                            case 2:
                                if (!(j < globalLibraries.length)) return [3, 7];
                                if (!(globalLibraries[j].name === node.value.libraries[i].name)) return [3, 6];
                                currentLib = globalLibraries[j];
                                if (!(currentLib.ts && currentLib.ts.enabled)) return [3, 4];
                                _a = {};
                                return [4, CRMNodes.modules.Util.getLibraryCode(currentLib)];
                            case 3:
                                lib = (_a.code = _b.sent(),
                                    _a);
                                return [3, 5];
                            case 4:
                                lib = currentLib;
                                _b.label = 5;
                            case 5: return [3, 7];
                            case 6:
                                j++;
                                return [3, 2];
                            case 7:
                                if (!lib) {
                                    if (!node.value.libraries[i].name) {
                                        if (urlDataPairs.get(node.value.libraries[i].url)) {
                                            lib = {
                                                code: urlDataPairs.get(node.value.libraries[i].url).dataString
                                            };
                                        }
                                    }
                                }
                                if (lib) {
                                    scripts.push({
                                        code: lib.code,
                                        runAt: runAt
                                    });
                                }
                                _b.label = 8;
                            case 8:
                                i++;
                                return [3, 1];
                            case 9:
                                if (!usesUnsafeWindow) {
                                    scripts.push({
                                        file: '/js/crmapi.js',
                                        runAt: runAt
                                    });
                                }
                                scripts.push({
                                    code: code,
                                    runAt: runAt
                                });
                                return [2, scripts];
                        }
                    });
                });
            }
            function generateMetaAccessFunction(metaData) {
                return function (key) {
                    if (metaData[key]) {
                        return metaData[key][0];
                    }
                    return undefined;
                };
            }
            function getResourcesArrayForScript(scriptId) {
                var resourcesArray = [];
                var scriptResources = CRMNodes.modules.storages.resources.get(scriptId);
                if (!scriptResources) {
                    return [];
                }
                for (var resourceName in scriptResources) {
                    if (scriptResources.hasOwnProperty(resourceName)) {
                        resourcesArray.push(scriptResources[resourceName]);
                    }
                }
                return resourcesArray;
            }
            function ensureRunAt(id, script) {
                var newScript = {
                    code: script.code,
                    file: script.file,
                    runAt: 'document_idle'
                };
                var runAt = script.runAt;
                if (runAt === 'document_start' ||
                    runAt === 'document_end' ||
                    runAt === 'document_idle') {
                    newScript.runAt = runAt;
                }
                else {
                    window.logAsync(window.__("background_crm_invalidRunat", id + '', runAt));
                }
                return newScript;
            }
            function executeScripts(nodeId, tabId, scripts, usesUnsafeWindow) {
                var _this = this;
                if (usesUnsafeWindow) {
                    browserAPI.tabs.sendMessage(tabId, {
                        type: 'runScript',
                        data: {
                            scripts: scripts
                        }
                    });
                }
                else {
                    CRMNodes.modules.Util.promiseChain(scripts.map(function (script) {
                        return function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4, browserAPI.tabs.executeScript(tabId, ensureRunAt(nodeId, script))["catch"](function (err) {
                                                if (err.message.indexOf('Could not establish connection') === -1 &&
                                                    err.message.indexOf('closed') === -1) {
                                                    window.logAsync(window.__("background_crm_executionFailed", tabId, nodeId), err);
                                                }
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3, 3];
                                    case 2:
                                        e_1 = _a.sent();
                                        return [3, 3];
                                    case 3: return [2];
                                }
                            });
                        }); };
                    }));
                }
            }
            function generateGreaseMonkeyData(metaData, node, includes, excludes, tab) {
                return __awaiter(this, void 0, void 0, function () {
                    var metaString, metaVal, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                metaString = (CRMNodes.MetaTags.getMetaLines(node.value
                                    .script) || []).join('\n');
                                metaVal = generateMetaAccessFunction(metaData);
                                _a = {};
                                _b = {
                                    script: {
                                        author: metaVal('author') || '',
                                        copyright: metaVal('copyright'),
                                        description: metaVal('description'),
                                        excludes: metaData['excludes'],
                                        homepage: metaVal('homepage'),
                                        icon: metaVal('icon'),
                                        icon64: metaVal('icon64'),
                                        includes: (metaData['includes'] || []).concat(metaData['include']),
                                        lastUpdated: 0,
                                        matches: metaData['matches'],
                                        isIncognito: tab.incognito,
                                        downloadMode: 'browser',
                                        name: node.name,
                                        namespace: metaVal('namespace'),
                                        options: {
                                            awareOfChrome: true,
                                            compat_arrayleft: false,
                                            compat_foreach: false,
                                            compat_forvarin: false,
                                            compat_metadata: false,
                                            compat_prototypes: false,
                                            compat_uW_gmonkey: false,
                                            noframes: metaVal('noframes'),
                                            override: {
                                                excludes: true,
                                                includes: true,
                                                orig_excludes: metaData['excludes'],
                                                orig_includes: (metaData['includes'] || []).concat(metaData['include']),
                                                use_excludes: excludes,
                                                use_includes: includes
                                            }
                                        },
                                        position: 1,
                                        resources: getResourcesArrayForScript(node.id),
                                        "run-at": metaData['run-at'] || metaData['run_at'] || 'document_end',
                                        system: false,
                                        unwrap: true,
                                        version: metaVal('version')
                                    },
                                    scriptMetaStr: metaString
                                };
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                            case 1:
                                _b.scriptSource = _c.sent(),
                                    _b.scriptUpdateURL = metaVal('updateURL'),
                                    _b.scriptWillUpdate = true,
                                    _b.scriptHandler = 'Custom Right-Click Menu';
                                return [4, browserAPI.runtime.getManifest()];
                            case 2: return [2, (_a.info = (_b.version = (_c.sent()).version,
                                    _b),
                                    _a.resources = CRMNodes.modules.storages.resources.get(node.id) || {},
                                    _a)];
                        }
                    });
                });
            }
            Handler.generateGreaseMonkeyData = generateGreaseMonkeyData;
            function getInExcludes(node) {
                var excludes = [];
                var includes = [];
                if (node.triggers) {
                    for (var i = 0; i < node.triggers.length; i++) {
                        if (node.triggers[i].not) {
                            excludes.push(node.triggers[i].url);
                        }
                        else {
                            includes.push(node.triggers[i].url);
                        }
                    }
                }
                return {
                    excludes: excludes,
                    includes: includes
                };
            }
            Handler.getInExcludes = getInExcludes;
            function genTabData(tabId, key, nodeId, script) {
                CRMNodes.modules.Util.setMapDefault(CRMNodes.modules.crmValues.tabData, tabId, {
                    libraries: new window.Map(),
                    nodes: new window.Map()
                });
                CRMNodes.modules.Util.setMapDefault(CRMNodes.modules.crmValues.tabData.get(tabId).nodes, nodeId, []);
                CRMNodes.modules.crmValues.tabData.get(tabId).nodes.get(nodeId).push({
                    secretKey: key,
                    usesLocalStorage: script.indexOf('localStorageProxy') > -1
                });
            }
            Handler.genTabData = genTabData;
            function createHandler(node) {
                var _this = this;
                return function (info, tab, isAutoActivate) {
                    if (isAutoActivate === void 0) { isAutoActivate = false; }
                    return __awaiter(_this, void 0, void 0, function () {
                        var key, err, indentUnit_1, _a, contextData, _b, greaseMonkeyData, runAt, script, tabIndex, safeNode, code, usesUnsafeWindow, scripts;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    key = [];
                                    err = false;
                                    try {
                                        key = CRMNodes.modules.Util.createSecretKey();
                                    }
                                    catch (e) {
                                        err = e;
                                    }
                                    if (!err) return [3, 1];
                                    browserAPI.tabs.executeScript(tab.id, {
                                        code: 'alert("Something went wrong very badly, please go to your Custom Right-Click Menu' +
                                            ' options page and remove any sketchy scripts.")'
                                    }).then(function () {
                                        browserAPI.runtime.reload();
                                    });
                                    return [3, 6];
                                case 1:
                                    indentUnit_1 = '	';
                                    return [4, window.Promise.all([
                                            CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                                var response;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!isAutoActivate) return [3, 1];
                                                            return [2, null];
                                                        case 1: return [4, browserAPI.tabs.sendMessage(tab.id, {
                                                                type: 'getLastClickInfo'
                                                            })];
                                                        case 2:
                                                            response = _a.sent();
                                                            return [2, response];
                                                    }
                                                });
                                            }); }),
                                            CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                                var metaData, _a, _b, runAt, _c, excludes, includes, _d;
                                                return __generator(this, function (_e) {
                                                    switch (_e.label) {
                                                        case 0:
                                                            _b = (_a = CRMNodes.MetaTags).getMetaTags;
                                                            return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                                        case 1:
                                                            metaData = _b.apply(_a, [_e.sent()]);
                                                            runAt = metaData['run-at'] || metaData['run_at'] || 'document_end';
                                                            if (runAt && Array.isArray(runAt)) {
                                                                runAt = runAt[0];
                                                            }
                                                            _c = getInExcludes(node), excludes = _c.excludes, includes = _c.includes;
                                                            _d = {};
                                                            return [4, generateGreaseMonkeyData(metaData, node, includes, excludes, tab)];
                                                        case 2: return [2, (_d.greaseMonkeyData = _e.sent(),
                                                                _d.runAt = runAt,
                                                                _d)];
                                                    }
                                                });
                                            }); }),
                                            CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                                        case 1: return [2, (_a.sent()).split('\n').map(function (line) {
                                                                return indentUnit_1 + line;
                                                            }).join('\n')];
                                                    }
                                                });
                                            }); }),
                                            CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                                var _a, _b, tabIndex;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            _a = genTabData;
                                                            _b = [tab.id, key, node.id];
                                                            return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                                        case 1:
                                                            _a.apply(void 0, _b.concat([_c.sent()]));
                                                            tabIndex = CRMNodes.modules.crmValues.tabData
                                                                .get(tab.id).nodes
                                                                .get(node.id).length - 1;
                                                            CRMNodes.modules.Logging.Listeners.updateTabAndIdLists();
                                                            return [2, tabIndex];
                                                    }
                                                });
                                            }); })
                                        ])];
                                case 2:
                                    _a = _c.sent(), contextData = _a[0], _b = _a[1], greaseMonkeyData = _b.greaseMonkeyData, runAt = _b.runAt, script = _a[2], tabIndex = _a[3];
                                    safeNode = CRMNodes.makeSafe(node);
                                    safeNode.permissions = node.permissions;
                                    return [4, genCodeOnPage({
                                            node: node,
                                            safeNode: safeNode,
                                            tab: tab,
                                            info: info,
                                            key: key,
                                            contextData: contextData,
                                            greaseMonkeyData: greaseMonkeyData,
                                            indentUnit: indentUnit_1,
                                            script: script,
                                            tabIndex: tabIndex
                                        })];
                                case 3:
                                    code = _c.sent();
                                    return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                case 4:
                                    usesUnsafeWindow = (_c.sent()).indexOf('unsafeWindow') > -1;
                                    return [4, getScriptsToRun(code, runAt, node, usesUnsafeWindow)];
                                case 5:
                                    scripts = _c.sent();
                                    executeScripts(node.id, tab.id, scripts, usesUnsafeWindow);
                                    _c.label = 6;
                                case 6: return [2];
                            }
                        });
                    });
                };
            }
            Handler.createHandler = createHandler;
        })(Handler = Script.Handler || (Script.Handler = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var Background;
        (function (Background) {
            function loadBackgroundPageLibs(node) {
                return __awaiter(this, void 0, void 0, function () {
                    var libraries, code, globalLibraries, urlDataPairs, i, lib, j, currentLib, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                libraries = [];
                                code = [];
                                globalLibraries = CRMNodes.modules.storages.storageLocal.libraries;
                                urlDataPairs = CRMNodes.modules.storages.urlDataPairs;
                                i = 0;
                                _b.label = 1;
                            case 1:
                                if (!(i < node.value.libraries.length)) return [3, 10];
                                lib = void 0;
                                if (!globalLibraries) return [3, 8];
                                j = 0;
                                _b.label = 2;
                            case 2:
                                if (!(j < globalLibraries.length)) return [3, 8];
                                if (!(globalLibraries[j].name === node.value.libraries[i].name)) return [3, 6];
                                currentLib = globalLibraries[j];
                                if (!(currentLib.ts && currentLib.ts.enabled)) return [3, 4];
                                _a = {};
                                return [4, CRMNodes.modules.Util.getLibraryCode(currentLib)];
                            case 3:
                                lib = (_a.code = _b.sent(),
                                    _a);
                                return [3, 5];
                            case 4:
                                lib = currentLib;
                                _b.label = 5;
                            case 5: return [3, 8];
                            case 6:
                                if (node.value.libraries[i].name === null) {
                                    if (urlDataPairs.get(node.value.libraries[i].url)) {
                                        lib = {
                                            code: urlDataPairs.get(node.value.libraries[i].url).dataString
                                        };
                                    }
                                }
                                _b.label = 7;
                            case 7:
                                j++;
                                return [3, 2];
                            case 8:
                                if (lib) {
                                    if (lib.location) {
                                        libraries.push("/js/defaultLibraries/" + lib.location);
                                    }
                                    else {
                                        code.push(lib.code);
                                    }
                                }
                                _b.label = 9;
                            case 9:
                                i++;
                                return [3, 1];
                            case 10: return [2, {
                                    libraries: libraries,
                                    code: code
                                }];
                        }
                    });
                });
            }
            function genCodeBackground(code, _a, doDebug) {
                var key = _a.key, node = _a.node, script = _a.script, safeNode = _a.safeNode, indentUnit = _a.indentUnit, greaseMonkeyData = _a.greaseMonkeyData;
                return __awaiter(this, void 0, void 0, function () {
                    var enableBackwardsCompatibility, catchErrs, supportedBrowserAPIs;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                            case 1:
                                enableBackwardsCompatibility = (_b.sent()).indexOf('/*execute locally*/') > -1 &&
                                    node.isLocal;
                                catchErrs = CRMNodes.modules.storages.storageLocal.catchErrors;
                                supportedBrowserAPIs = [];
                                if (BrowserAPI.isBrowserAPISupported('chrome')) {
                                    supportedBrowserAPIs.push('chrome');
                                }
                                if (BrowserAPI.isBrowserAPISupported('browser')) {
                                    supportedBrowserAPIs.push('browser');
                                }
                                CRMNodes.modules.Util.setMapDefault(CRMNodes.modules.storages.nodeStorage, node.id, {});
                                CRMNodes.modules.Util.setMapDefault(CRMNodes.modules.storages.nodeStorageSync, node.id, {});
                                return [2, [
                                        code.join('\n'), [
                                            "var crmAPI = new (window._crmAPIRegistry.pop())(" + [
                                                safeNode, node.id, { id: 0 }, {}, key,
                                                CRMNodes.modules.storages.nodeStorage.get(node.id), null,
                                                greaseMonkeyData, true, CRMNodes.fixOptionsErrors((node.value && node.value.options) || {}),
                                                enableBackwardsCompatibility, 0, browserAPI.runtime.id, supportedBrowserAPIs.join(','),
                                                CRMNodes.modules.storages.nodeStorageSync.get(node.id)
                                            ]
                                                .map(function (param) {
                                                if (param === void 0) {
                                                    return JSON.stringify(null);
                                                }
                                                return JSON.stringify(param);
                                            }).join(', ') + ");"
                                        ].join(', '),
                                        CRMNodes.modules.constants.templates.globalObjectWrapperCode('self', 'selfWrapper', void 0, void 0),
                                        "" + (catchErrs ? 'try {' : ''),
                                        'function main(crmAPI, self, menuitemid, parentmenuitemid, mediatype,' +
                                            (indentUnit + "linkurl, srcurl, pageurl, frameurl, frameid,") +
                                            (indentUnit + "selectiontext, editable, waschecked, checked) {"),
                                        doDebug ? 'debugger;' : '',
                                        script,
                                        '}',
                                        "window.crmAPI = self.crmAPI = crmAPI",
                                        "crmAPI.onReady(function() {main(crmAPI, selfWrapper)});",
                                        "" + (catchErrs ? [
                                            "} catch (error) {",
                                            indentUnit + "if (crmAPI.debugOnError) {",
                                            "" + indentUnit + indentUnit + "debugger;",
                                            indentUnit + "}",
                                            indentUnit + "throw error;",
                                            "}"
                                        ].join('\n') : '')
                                    ].join('\n')];
                        }
                    });
                });
            }
            function isValidBackgroundPage(node) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _b = !node || node.type !== 'script';
                                if (_b) return [3, 2];
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                            case 1:
                                _b = !(_c.sent());
                                _c.label = 2;
                            case 2:
                                _a = _b;
                                if (_a) return [3, 4];
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                            case 3:
                                _a = (_c.sent()) === '';
                                _c.label = 4;
                            case 4:
                                if (_a) {
                                    return [2, false];
                                }
                                return [2, true];
                        }
                    });
                });
            }
            function createBackgroundPage(node, doDebug) {
                if (doDebug === void 0) { doDebug = false; }
                return __awaiter(this, void 0, void 0, function () {
                    var isRestart, _a, _b, _c, _d, _e, _f, key, err, indentUnit, _g, _h, backgroundPageCode, libraries, script, greaseMonkeyData, safeNode, code;
                    var _this = this;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0: return [4, isValidBackgroundPage(node)];
                            case 1:
                                if (!(_j.sent())) {
                                    return [2];
                                }
                                isRestart = false;
                                if (!CRMNodes.modules.background.byId.has(node.id)) return [3, 5];
                                isRestart = true;
                                _b = (_a = CRMNodes.modules.Logging).backgroundPageLog;
                                _c = [node.id, null];
                                return [4, window.__("background_crm_restartingBackgroundPage")];
                            case 2: return [4, _b.apply(_a, _c.concat([_j.sent()]))];
                            case 3:
                                _j.sent();
                                CRMNodes.modules.background.byId.get(node.id).terminate();
                                _e = (_d = CRMNodes.modules.Logging).backgroundPageLog;
                                _f = [node.id, null];
                                return [4, window.__("background_crm_terminatedBackgroundPage")];
                            case 4:
                                _e.apply(_d, _f.concat([_j.sent()]));
                                _j.label = 5;
                            case 5:
                                if (CRMNodes.modules.background.byId.has(node.id)) {
                                    CRMNodes.modules.background.byId.get(node.id).terminate();
                                }
                                if (CRMNodes.modules.crmValues.tabData.has(0) &&
                                    CRMNodes.modules.crmValues.tabData.get(0).nodes.has(node.id)) {
                                    CRMNodes.modules.crmValues.tabData.get(0).nodes["delete"](node.id);
                                }
                                key = [];
                                err = false;
                                try {
                                    key = CRMNodes.modules.Util.createSecretKey();
                                }
                                catch (e) {
                                    err = e;
                                }
                                if (err) {
                                    window.logAsync(window.__("background_crm_setupError", node.id), err);
                                    throw err;
                                }
                                indentUnit = '	';
                                return [4, window.Promise.all([
                                        CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, loadBackgroundPageLibs(node)];
                                                    case 1: return [2, _a.sent()];
                                                }
                                            });
                                        }); }),
                                        CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                                                    case 1: return [2, (_a.sent()).split('\n').map(function (line) {
                                                            return indentUnit + line;
                                                        }).join('\n')];
                                                }
                                            });
                                        }); }),
                                        CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var metaData, _a, _b, _c, excludes, includes;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        _b = (_a = CRMNodes.MetaTags).getMetaTags;
                                                        return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                                    case 1:
                                                        metaData = _b.apply(_a, [_d.sent()]);
                                                        _c = Script.Handler.getInExcludes(node), excludes = _c.excludes, includes = _c.includes;
                                                        return [4, Script.Handler.generateGreaseMonkeyData(metaData, node, includes, excludes, {
                                                                incognito: false
                                                            })];
                                                    case 2: return [2, _d.sent()];
                                                }
                                            });
                                        }); }),
                                        CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var _a, _b, _c;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        _b = (_a = Script.Handler).genTabData;
                                                        _c = [0, key, node.id];
                                                        return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                                                    case 1:
                                                        _b.apply(_a, _c.concat([_d.sent()]));
                                                        CRMNodes.modules.Logging.Listeners.updateTabAndIdLists();
                                                        return [2];
                                                }
                                            });
                                        }); })
                                    ])];
                            case 6:
                                _g = _j.sent(), _h = _g[0], backgroundPageCode = _h.code, libraries = _h.libraries, script = _g[1], greaseMonkeyData = _g[2];
                                safeNode = CRMNodes.makeSafe(node);
                                safeNode.permissions = node.permissions;
                                return [4, genCodeBackground(backgroundPageCode, {
                                        key: key,
                                        node: node,
                                        script: script,
                                        safeNode: safeNode,
                                        indentUnit: indentUnit,
                                        greaseMonkeyData: greaseMonkeyData
                                    }, doDebug)];
                            case 7:
                                code = _j.sent();
                                CRMNodes.modules.Sandbox.sandbox(node.id, code, libraries, key, function () {
                                    var instancesArr = [];
                                    var allInstances = CRMNodes.modules.crmValues.nodeInstances;
                                    CRMNodes.modules.Util.setMapDefault(allInstances, node.id, new window.Map());
                                    var nodeInstances = allInstances.get(node.id);
                                    CRMNodes.modules.Util.iterateMap(nodeInstances, function (tabId) {
                                        try {
                                            CRMNodes.modules.crmValues.tabData.get(tabId).nodes.get(node.id)
                                                .forEach(function (tabIndexInstance, index) {
                                                CRMNodes.modules.Util.postMessage(tabIndexInstance.port, {
                                                    messageType: 'dummy'
                                                });
                                                instancesArr.push({
                                                    id: tabId,
                                                    tabIndex: index
                                                });
                                            });
                                        }
                                        catch (e) {
                                            nodeInstances["delete"](tabId);
                                        }
                                    });
                                    return instancesArr;
                                }, function (worker) {
                                    CRMNodes.modules.background.byId.set(node.id, worker);
                                    if (isRestart) {
                                        CRMNodes.modules.Logging.log(node.id, '*', "Background page [" + node.id + "]: ", 'Restarted background page...');
                                    }
                                });
                                return [2];
                        }
                    });
                });
            }
            Background.createBackgroundPage = createBackgroundPage;
            function createBackgroundPages() {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        CRMNodes.modules.Util.asyncIterateMap(CRMNodes.modules.crm.crmById, function (_nodeId, node) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!(node.type === 'script' && node.value.backgroundScript.length > 0)) return [3, 4];
                                        if (!isValidBackgroundPage(node)) return [3, 2];
                                        _b = (_a = window).info;
                                        return [4, window.__("background_crm_createdBackgroundPage", node.id)];
                                    case 1:
                                        _b.apply(_a, [_c.sent()]);
                                        _c.label = 2;
                                    case 2: return [4, createBackgroundPage(node)];
                                    case 3:
                                        _c.sent();
                                        _c.label = 4;
                                    case 4: return [2];
                                }
                            });
                        }); });
                        return [2];
                    });
                });
            }
            Background.createBackgroundPages = createBackgroundPages;
        })(Background = Script.Background || (Script.Background = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var MetaTags;
    (function (MetaTags) {
        function getMetaIndexes(code) {
            var indexes = [];
            var metaStart = -1;
            var metaEnd = -1;
            var lines = code.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (metaStart !== -1) {
                    if (lines[i].indexOf('==/UserScript==') > -1 ||
                        lines[i].indexOf('==/UserStyle==') > -1) {
                        metaEnd = i;
                        indexes.push({
                            start: metaStart,
                            end: metaEnd
                        });
                        metaStart = -1;
                        metaEnd = -1;
                    }
                }
                else if (lines[i].indexOf('==UserScript==') > -1 ||
                    lines[i].indexOf('==UserStyle==') > -1) {
                    metaStart = i;
                }
            }
            return indexes;
        }
        MetaTags.getMetaIndexes = getMetaIndexes;
        function getMetaLines(code, fromCache) {
            if (fromCache === void 0) { fromCache = true; }
            if (fromCache) {
                return CRMNodes.modules.Caches.cacheCall(getMetaLines, arguments, true);
            }
            var metaIndexes = getMetaIndexes(code);
            var metaLines = [];
            var lines = code.split('\n');
            for (var _i = 0, metaIndexes_1 = metaIndexes; _i < metaIndexes_1.length; _i++) {
                var _a = metaIndexes_1[_i], start = _a.start, end = _a.end;
                for (var i = start + 1; i < end; i++) {
                    metaLines.push(lines[i]);
                }
            }
            return metaLines;
        }
        MetaTags.getMetaLines = getMetaLines;
        var cachedData = new window.Map();
        function getMetaTags(code) {
            var hash = window.md5(code);
            if (cachedData.has(hash)) {
                return cachedData.get(hash);
            }
            var metaLines = getMetaLines(code);
            var metaTags = {};
            var currentMatch = null;
            var regex = /@(\w+)(\s+)(.+)/;
            for (var i = 0; i < metaLines.length; i++) {
                var regexMatches = metaLines[i].match(regex);
                if (regexMatches) {
                    if (currentMatch) {
                        var key = currentMatch.key, value = currentMatch.value;
                        metaTags[key] = metaTags[key] || [];
                        metaTags[key].push(value);
                    }
                    currentMatch = {
                        key: regexMatches[1],
                        value: regexMatches[3]
                    };
                }
                else {
                    currentMatch.value += ('\n' + metaLines[i]);
                }
            }
            if (currentMatch) {
                var key = currentMatch.key, value = currentMatch.value;
                metaTags[key] = metaTags[key] || [];
                metaTags[key].push(value);
            }
            cachedData.set(hash, metaTags);
            return metaTags;
        }
        MetaTags.getMetaTags = getMetaTags;
        function getMetaTag(metaTags, tag) {
            if (tag in metaTags) {
                if (Array.isArray(metaTags[tag])) {
                    return metaTags[tag][0];
                }
                return metaTags[tag];
            }
            return undefined;
        }
        MetaTags.getMetaTag = getMetaTag;
        function getlastMetaTagValue(metaTags, key) {
            return metaTags[key] && metaTags[key][metaTags[key].length - 1];
        }
        MetaTags.getlastMetaTagValue = getlastMetaTagValue;
    })(MetaTags = CRMNodes.MetaTags || (CRMNodes.MetaTags = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var Updating;
        (function (Updating) {
            function removeOldNode(id) {
                return __awaiter(this, void 0, void 0, function () {
                    var children, i, contextMenuId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                children = CRMNodes.modules.crm.crmById.get(id).children;
                                if (!children) return [3, 4];
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < children.length)) return [3, 4];
                                return [4, removeOldNode(children[i].id)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                i++;
                                return [3, 1];
                            case 4:
                                if (CRMNodes.modules.background.byId.has(id)) {
                                    CRMNodes.modules.background.byId.get(id).terminate();
                                    CRMNodes.modules.background.byId["delete"](id);
                                }
                                CRMNodes.modules.crm.crmById["delete"](id);
                                CRMNodes.modules.crm.crmByIdSafe["delete"](id);
                                contextMenuId = CRMNodes.modules.crmValues.contextMenuIds.get(id);
                                if (!(contextMenuId !== undefined && contextMenuId !== null)) return [3, 6];
                                return [4, browserAPI.contextMenus.remove(contextMenuId)["catch"](function () { })];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6: return [2];
                        }
                    });
                });
            }
            Updating.removeOldNode = removeOldNode;
            function registerNode(node, oldPath) {
                if (oldPath !== undefined && oldPath !== null) {
                    var currentTree = CRMNodes.modules.storages.settingsStorage.crm;
                    for (var _i = 0, _a = oldPath.slice(0, -1); _i < _a.length; _i++) {
                        var index = _a[_i];
                        var children = currentTree[index].children;
                        if (!children) {
                            return;
                        }
                        currentTree = children;
                    }
                    currentTree[CRMNodes.modules.Util.getLastItem(oldPath)] = node;
                }
                else {
                    CRMNodes.modules.storages.settingsStorage.crm.push(node);
                }
            }
            Updating.registerNode = registerNode;
            function deduceLaunchmode(metaTags, triggers) {
                if (CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode')) {
                    return CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode');
                }
                if (triggers.length === 0) {
                    return 0;
                }
                return 2;
            }
            function createUserscriptTriggers(metaTags) {
                var triggers = [];
                var includes = (metaTags['includes'] || []).concat(metaTags['include']);
                if (includes) {
                    triggers = triggers.concat(includes.map(function (include) { return ({
                        url: include,
                        not: false
                    }); }).filter(function (include) { return (!!include.url); }));
                }
                var matches = metaTags['match'];
                if (matches) {
                    triggers = triggers.concat(matches.map(function (match) { return ({
                        url: match,
                        not: false
                    }); }).filter(function (match) { return (!!match.url); }));
                }
                var excludes = metaTags['exclude'];
                if (excludes) {
                    triggers = triggers.concat(excludes.map(function (exclude) { return ({
                        url: exclude,
                        not: false
                    }); }).filter(function (exclude) { return (!!exclude.url); }));
                }
                triggers = triggers.filter(function (trigger, index) { return (triggers.indexOf(trigger) === index); });
                return {
                    triggers: triggers,
                    launchMode: deduceLaunchmode(metaTags, triggers)
                };
            }
            function createUserscriptScriptData(metaTags, code, node) {
                return __awaiter(this, void 0, void 0, function () {
                    var scriptNode, libs, requires, anonymousLibs, i, skip, j, libraries, newLibs, _a, _b;
                    var _this = this;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                node.type = 'script';
                                scriptNode = node;
                                libs = [];
                                if (metaTags['CRM_libraries']) {
                                    metaTags['CRM_libraries'].forEach(function (item) {
                                        try {
                                            libs.push(JSON.parse(item));
                                        }
                                        catch (e) { }
                                    });
                                }
                                requires = metaTags['require'] || [];
                                anonymousLibs = [];
                                for (i = 0; i < requires.length; i++) {
                                    skip = false;
                                    for (j = 0; j < libs.length; j++) {
                                        if (libs[j].url === requires[i]) {
                                            skip = true;
                                            break;
                                        }
                                    }
                                    if (skip) {
                                        continue;
                                    }
                                    anonymousLibs.push({
                                        url: requires[i],
                                        name: null
                                    });
                                }
                                anonymousLibs.forEach(function (anonymousLib) {
                                    CRMNodes.modules.Resources.Anonymous.handle({
                                        type: 'register',
                                        name: anonymousLib.url,
                                        url: anonymousLib.url,
                                        scriptId: scriptNode.id
                                    });
                                });
                                return [4, browserAPI.storage.local.get('libraries')];
                            case 1:
                                libraries = (_c.sent()).libraries;
                                _b = (_a = libraries).concat;
                                return [4, Promise.all(libs.map(function (_a) {
                                        var name = _a.name, url = _a.url;
                                        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                            var code;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, CRMNodes.modules.Util.xhr(url)["catch"](function () {
                                                            resolve(null);
                                                        })];
                                                    case 1:
                                                        code = _a.sent();
                                                        if (!code) {
                                                            resolve(null);
                                                        }
                                                        resolve({
                                                            name: name, code: code, url: url,
                                                            ts: {
                                                                enabled: false,
                                                                code: {}
                                                            }
                                                        });
                                                        return [2];
                                                }
                                            });
                                        }); });
                                    }))];
                            case 2:
                                newLibs = _b.apply(_a, [(_c.sent()).filter(function (val) { return !!val; })]);
                                return [4, browserAPI.storage.local.set({
                                        libraries: newLibs
                                    })];
                            case 3:
                                _c.sent();
                                return [4, CRMNodes.modules.Storages.applyChanges({
                                        type: 'libraries',
                                        libraries: newLibs
                                    })];
                            case 4:
                                _c.sent();
                                libs = libs.concat(anonymousLibs);
                                scriptNode.value = CRMNodes.modules.constants.templates.getDefaultScriptValue({
                                    script: code,
                                    libraries: libs
                                });
                                return [2];
                        }
                    });
                });
            }
            function createUserscriptStylesheetData(metaTags, code, node) {
                node = node;
                node.type = 'stylesheet';
                node.value = {
                    stylesheet: code,
                    defaultOn: (metaTags['CRM_defaultOn'] =
                        CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'CRM_defaultOn') ||
                            false),
                    toggle: (metaTags['CRM_toggle'] = CRMNodes.MetaTags
                        .getlastMetaTagValue(metaTags, 'CRM_toggle') ||
                        false),
                    launchMode: 1,
                    options: {},
                    convertedStylesheet: null
                };
            }
            function createUserscriptTypeData(metaTags, code, node) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'CRM_stylesheet')) return [3, 1];
                                createUserscriptStylesheetData(metaTags, code, node);
                                return [3, 3];
                            case 1: return [4, createUserscriptScriptData(metaTags, code, node)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3: return [2];
                        }
                    });
                });
            }
            function install(message) {
                return __awaiter(this, void 0, void 0, function () {
                    var oldTree, _a, path, oldNodeId, node, nodePath;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                oldTree = JSON.parse(JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm));
                                return [4, Updating.installUserscript(message.metaTags, message.script, message.downloadURL, message.allowedPermissions)];
                            case 1:
                                _a = _b.sent(), path = _a.path, oldNodeId = _a.oldNodeId, node = _a.node;
                                if (!path) return [3, 3];
                                nodePath = path;
                                return [4, removeOldNode(oldNodeId)];
                            case 2:
                                _b.sent();
                                registerNode(node, nodePath);
                                return [3, 4];
                            case 3:
                                registerNode(node);
                                _b.label = 4;
                            case 4: return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                        key: 'crm',
                                        oldValue: oldTree,
                                        newValue: CRMNodes.modules.storages.settingsStorage.crm
                                    }])];
                            case 5:
                                _b.sent();
                                return [2];
                        }
                    });
                });
            }
            Updating.install = install;
            function installUserscript(metaTags, code, downloadURL, allowedPermissions, oldNodeId) {
                return __awaiter(this, void 0, void 0, function () {
                    var node, hasOldNode, _a, _b, launchMode, triggers, updateUrl, permissions, resources, _c, requestPermissions, allPermissions, _d, allowed, joinedPermissions, path;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                node = {};
                                hasOldNode = false;
                                if (!(oldNodeId !== undefined && oldNodeId !== null)) return [3, 1];
                                hasOldNode = true;
                                node.id = oldNodeId;
                                return [3, 3];
                            case 1:
                                _a = node;
                                return [4, CRMNodes.modules.Util.generateItemId()];
                            case 2:
                                _a.id = (_e.sent());
                                _e.label = 3;
                            case 3:
                                if (Object.getOwnPropertyNames(metaTags).length === 0) {
                                    metaTags = CRMNodes.MetaTags.getMetaTags(code);
                                }
                                node.name = CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'name') || 'name';
                                return [4, createUserscriptTypeData(metaTags, code, node)];
                            case 4:
                                _e.sent();
                                _b = createUserscriptTriggers(metaTags), launchMode = _b.launchMode, triggers = _b.triggers;
                                node.triggers = triggers;
                                node.value.launchMode = launchMode;
                                updateUrl = CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'updateURL') ||
                                    CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'downloadURL') ||
                                    downloadURL;
                                permissions = [];
                                if (metaTags['grant']) {
                                    permissions = metaTags['grant'];
                                    permissions = permissions.splice(permissions.indexOf('none'), 1);
                                }
                                node.nodeInfo = {
                                    version: CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'version') || null,
                                    source: {
                                        updateURL: updateUrl || downloadURL,
                                        url: updateUrl || CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'namespace') ||
                                            downloadURL,
                                        author: CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'author') ||
                                            'Anonymous',
                                        autoUpdate: true
                                    },
                                    isRoot: true,
                                    permissions: permissions,
                                    lastUpdatedAt: Date.now(),
                                    installDate: new Date().toLocaleDateString()
                                };
                                if (hasOldNode) {
                                    node.nodeInfo.installDate = CRMNodes.modules.Util.accessPath(CRMNodes.modules.crm.crmById.get(oldNodeId), 'nodeInfo', 'installDate') || node.nodeInfo.installDate;
                                }
                                if (CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'CRM_contentTypes')) {
                                    try {
                                        node.onContentTypes = JSON.parse(CRMNodes.MetaTags.getlastMetaTagValue(metaTags, 'CRM_contentTypes'));
                                    }
                                    catch (e) {
                                    }
                                }
                                if (!node.onContentTypes) {
                                    node.onContentTypes = [true, true, true, true, true, true];
                                }
                                node.permissions = allowedPermissions || [];
                                if (metaTags['resource']) {
                                    resources = metaTags['resource'];
                                    resources.forEach(function (resource) {
                                        var resourceSplit = resource.split(/(\s*)/);
                                        var resourceName = resourceSplit[0], resourceUrl = resourceSplit[1];
                                        CRMNodes.modules.Resources.Resource.handle({
                                            type: 'register',
                                            name: resourceName,
                                            url: resourceUrl,
                                            scriptId: node.id
                                        });
                                    });
                                }
                                return [4, browserAPI.storage.local.get()];
                            case 5:
                                _c = (_e.sent()).requestPermissions, requestPermissions = _c === void 0 ? [] : _c;
                                if (!browserAPI.permissions) return [3, 7];
                                return [4, browserAPI.permissions.getAll()];
                            case 6:
                                _d = _e.sent();
                                return [3, 8];
                            case 7:
                                _d = {
                                    permissions: []
                                };
                                _e.label = 8;
                            case 8:
                                allPermissions = _d;
                                allowed = allPermissions.permissions || [];
                                joinedPermissions = requestPermissions.concat(node.permissions).filter(function (permission) {
                                    return allowed.indexOf(permission) === -1;
                                }).filter(function (permission, index, self) {
                                    return self.indexOf(permission) === index;
                                });
                                browserAPI.storage.local.set({
                                    requestPermissions: joinedPermissions
                                });
                                if (node.type === 'script') {
                                    node = CRMNodes.modules.constants.templates.getDefaultScriptNode(node);
                                }
                                else {
                                    node = CRMNodes.modules.constants.templates.getDefaultStylesheetNode(node);
                                }
                                if (hasOldNode) {
                                    path = CRMNodes.modules.crm.crmById.get(oldNodeId).path;
                                    return [2, {
                                            node: node,
                                            path: path,
                                            oldNodeId: oldNodeId
                                        }];
                                }
                                else {
                                    return [2, {
                                            node: node,
                                            path: null,
                                            oldNodeId: null
                                        }];
                                }
                                return [2];
                        }
                    });
                });
            }
            Updating.installUserscript = installUserscript;
            function getDownloadURL(_a) {
                var nodeInfo = _a.nodeInfo;
                return nodeInfo && nodeInfo.source &&
                    typeof nodeInfo.source !== 'string' &&
                    (nodeInfo.source.downloadURL ||
                        nodeInfo.source.updateURL ||
                        nodeInfo.source.url);
            }
            function updateScripts() {
                return __awaiter(this, void 0, void 0, function () {
                    var updated, oldTree;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                updated = [];
                                oldTree = JSON.parse(JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm));
                                return [4, Promise.all(CRMNodes.modules.Util.mapToArr(CRMNodes.modules.crm.crmById).map(function (_a) {
                                        var _id = _a[0], node = _a[1];
                                        return __awaiter(_this, void 0, void 0, function () {
                                            var isRoot, downloadURL;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        if (node.type !== 'script') {
                                                            return [2];
                                                        }
                                                        isRoot = node.nodeInfo && node.nodeInfo.isRoot;
                                                        downloadURL = getDownloadURL(node);
                                                        if (!(downloadURL && isRoot && node.nodeInfo.source !== 'local' &&
                                                            node.nodeInfo.source.autoUpdate)) return [3, 2];
                                                        return [4, checkNodeForUpdate(node, downloadURL, updated)];
                                                    case 1:
                                                        _b.sent();
                                                        _b.label = 2;
                                                    case 2: return [2];
                                                }
                                            });
                                        });
                                    }))];
                            case 1:
                                _a.sent();
                                return [4, onNodeUpdateDone(updated, oldTree)];
                            case 2:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            }
            Updating.updateScripts = updateScripts;
            function onNodeUpdateDone(updated, oldTree) {
                return __awaiter(this, void 0, void 0, function () {
                    var updatedData, _a, updatedNodes, joinedData;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                updatedData = updated.map(function (_a) {
                                    var _b = _a.node, id = _b.id, name = _b.name, nodeInfo = _b.nodeInfo;
                                    var oldNode = CRMNodes.modules.Storages.findNodeWithId(oldTree, id);
                                    return {
                                        name: name,
                                        id: id,
                                        oldVersion: (oldNode && oldNode.nodeInfo && oldNode.nodeInfo.version) ||
                                            '',
                                        newVersion: nodeInfo.version || ''
                                    };
                                });
                                return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                            key: 'crm',
                                            oldValue: oldTree,
                                            newValue: CRMNodes.modules.storages.settingsStorage.crm
                                        }])];
                            case 1:
                                _b.sent();
                                return [4, browserAPI.storage.local.get()];
                            case 2:
                                _a = (_b.sent()).updatedNodes, updatedNodes = _a === void 0 ? [] : _a;
                                joinedData = updatedNodes.concat(updatedData);
                                browserAPI.storage.local.set({
                                    updatedScripts: joinedData
                                });
                                return [2, joinedData];
                        }
                    });
                });
            }
            function checkNodeForUpdate(node, downloadURL, updatedScripts) {
                var _this = this;
                return new Promise(function (resolve) {
                    if (downloadURL && CRMNodes.modules.Util.endsWith(downloadURL, '.user.js')) {
                        try {
                            CRMNodes.modules.Util.convertFileToDataURI(downloadURL, function (_dataURI, dataString) { return __awaiter(_this, void 0, void 0, function () {
                                var metaTags, _a, addedPermissions, _b, _c, err_1;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _d.trys.push([0, 6, , 7]);
                                            metaTags = CRMNodes.MetaTags.getMetaTags(dataString);
                                            if (!CRMNodes.modules.Util.isNewer(metaTags['version'][0], node.nodeInfo.version)) return [3, 5];
                                            if (!(!CRMNodes.modules.Util.compareArray(node.nodeInfo.permissions, metaTags['grant']) &&
                                                !(metaTags['grant'].length === 1 &&
                                                    metaTags['grant'][0] === 'none'))) return [3, 3];
                                            return [4, browserAPI.storage.local.get()];
                                        case 1:
                                            _a = (_d.sent()).addedPermissions, addedPermissions = _a === void 0 ? [] : _a;
                                            addedPermissions.push({
                                                node: node.id,
                                                permissions: metaTags['grant'].filter(function (newPermission) {
                                                    return node.nodeInfo.permissions.indexOf(newPermission) === -1;
                                                })
                                            });
                                            return [4, browserAPI.storage.local.set({
                                                    addedPermissions: addedPermissions
                                                })];
                                        case 2:
                                            _d.sent();
                                            _d.label = 3;
                                        case 3:
                                            _c = (_b = updatedScripts).push;
                                            return [4, installUserscript(metaTags, dataString, downloadURL, node.permissions, node.id)];
                                        case 4:
                                            _c.apply(_b, [_d.sent()]);
                                            _d.label = 5;
                                        case 5: return [3, 7];
                                        case 6:
                                            err_1 = _d.sent();
                                            window.logAsync(window.__("background_crm_updateDownload404", 'script', node.id, node.name));
                                            return [3, 7];
                                        case 7:
                                            resolve(null);
                                            return [2];
                                    }
                                });
                            }); }, function () {
                                window.logAsync(window.__("background_crm_updateDownload404", 'script', node.id, node.name));
                                resolve(null);
                            });
                        }
                        catch (e) {
                            window.logAsync(window.__("background_crm_updateDownload404", 'script', node.id, node.name));
                            resolve(null);
                        }
                    }
                });
            }
        })(Updating = Script.Updating || (Script.Updating = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var Running;
    (function (Running) {
        function urlIsGlobalExcluded(url) {
            if (CRMNodes.modules.storages.globalExcludes.indexOf('<all_urls>') > -1) {
                return true;
            }
            for (var i = 0; i < CRMNodes.modules.storages.globalExcludes.length; i++) {
                var pattern = CRMNodes.modules.storages.globalExcludes[i];
                if (pattern && CRMNodes.modules.URLParsing.urlMatchesPattern(pattern, url)) {
                    return true;
                }
            }
            return false;
        }
        Running.urlIsGlobalExcluded = urlIsGlobalExcluded;
        function executeNode(node, tab) {
            if (node.type === 'script') {
                CRMNodes.Script.Handler.createHandler(node)({
                    pageUrl: tab.url,
                    menuItemId: 0,
                    editable: false,
                    modifiers: []
                }, tab, true);
            }
            else if (node.type === 'stylesheet') {
                CRMNodes.Stylesheet.createClickHandler(node)({
                    pageUrl: tab.url,
                    menuItemId: 0,
                    editable: false,
                    modifiers: []
                }, tab);
            }
            else if (node.type === 'link') {
                CRMNodes.Link.createHandler(node)({
                    pageUrl: tab.url,
                    menuItemId: 0,
                    editable: false,
                    modifiers: []
                }, tab);
            }
        }
        Running.executeNode = executeNode;
        function executeScriptsForTab(tabId, isReload) {
            return __awaiter(this, void 0, void 0, function () {
                var tab_1, toExecuteNodes, toExecute, _i, _a, id, e_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4, browserAPI.tabs.get(tabId)];
                        case 1:
                            tab_1 = _b.sent();
                            if (tab_1.url && CRMNodes.modules.Util.canRunOnUrl(tab_1.url)) {
                                CRMNodes.modules.crmValues.tabData.set(tab_1.id, {
                                    libraries: new window.Map(),
                                    nodes: new window.Map()
                                });
                                CRMNodes.modules.Logging.Listeners.updateTabAndIdLists();
                                if (isReload) {
                                    CRMNodes.modules.GlobalDeclarations.runAlwaysRunNodes(tab_1);
                                }
                                if (!urlIsGlobalExcluded(tab_1.url)) {
                                    toExecuteNodes = CRMNodes.modules.toExecuteNodes;
                                    toExecute = toExecuteNodes.onUrl.documentEnd.filter(function (_a) {
                                        var triggers = _a.triggers;
                                        return CRMNodes.modules.URLParsing.matchesUrlSchemes(triggers, tab_1.url);
                                    });
                                    for (_i = 0, _a = toExecuteNodes.always.documentEnd.concat(toExecute); _i < _a.length; _i++) {
                                        id = _a[_i].id;
                                        executeNode(CRMNodes.modules.crm.crmById.get(id), tab_1);
                                    }
                                    return [2, {
                                            matched: toExecute.length > 0
                                        }];
                                }
                            }
                            return [3, 3];
                        case 2:
                            e_2 = _b.sent();
                            console.log('Error while executing scripts for tab', e_2);
                            return [3, 3];
                        case 3: return [2, {
                                matched: false
                            }];
                    }
                });
            });
        }
        Running.executeScriptsForTab = executeScriptsForTab;
    })(Running = CRMNodes.Running || (CRMNodes.Running = {}));
})(CRMNodes || (CRMNodes = {}));
;
(function (CRMNodes) {
    var Link;
    (function (Link) {
        function sanitizeUrl(url) {
            if (url.indexOf('://') === -1) {
                url = "http://" + url;
            }
            return url;
        }
        function substituteSearch(url, clickData) {
            return url.replace(/%s/g, clickData.selectionText || '');
        }
        function createHandler(node) {
            return function (clickData, tabInfo) {
                var finalUrl;
                for (var i = 0; i < node.value.length; i++) {
                    if (node.value[i].newTab) {
                        browserAPI.tabs.create({
                            windowId: tabInfo.windowId,
                            url: substituteSearch(sanitizeUrl(node.value[i].url), clickData),
                            openerTabId: tabInfo.id
                        });
                    }
                    else {
                        finalUrl = node.value[i].url;
                    }
                }
                if (finalUrl) {
                    browserAPI.tabs.update(tabInfo.id, {
                        url: substituteSearch(sanitizeUrl(finalUrl), clickData)
                    });
                }
            };
        }
        Link.createHandler = createHandler;
    })(Link = CRMNodes.Link || (CRMNodes.Link = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var Stylesheet;
    (function (Stylesheet) {
        var Updating;
        (function (Updating) {
            function getDownloadURL(_a) {
                var nodeInfo = _a.nodeInfo;
                return nodeInfo && nodeInfo.source &&
                    typeof nodeInfo.source !== 'string' &&
                    (nodeInfo.source.downloadURL ||
                        nodeInfo.source.updateURL ||
                        nodeInfo.source.url);
            }
            Updating.getDownloadURL = getDownloadURL;
            function updateStylesheet(nodeId) {
                return __awaiter(this, void 0, void 0, function () {
                    var node, url, updateData, launchData, oldTree;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                node = CRMNodes.modules.crm.crmById.get(nodeId);
                                url = getDownloadURL(node);
                                return [4, CRMNodes.Stylesheet.Installing.getUserstyleMeta(url)];
                            case 1:
                                updateData = (_a.sent())
                                    .sections[node.nodeInfo.source !== 'local' && node.nodeInfo.source.sectionIndex];
                                launchData = CRMNodes.Stylesheet.Installing.extractStylesheetData(updateData);
                                oldTree = JSON.parse(JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm));
                                node.value.launchMode = launchData.launchMode;
                                node.triggers = JSON.parse(JSON.stringify(launchData.triggers));
                                node.value.stylesheet = launchData.code;
                                return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                            key: 'crm',
                                            oldValue: oldTree,
                                            newValue: CRMNodes.modules.storages.settingsStorage.crm
                                        }])];
                            case 2:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            }
            Updating.updateStylesheet = updateStylesheet;
            function updateStylesheets() {
                return __awaiter(this, void 0, void 0, function () {
                    var updated, oldTree;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                updated = [];
                                oldTree = JSON.parse(JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm));
                                return [4, Promise.all(CRMNodes.modules.Util.mapToArr(CRMNodes.modules.crm.crmById).map(function (_a) {
                                        var _id = _a[0], node = _a[1];
                                        return __awaiter(_this, void 0, void 0, function () {
                                            var isRoot, downloadURL;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        if (node.type !== 'stylesheet') {
                                                            return [2];
                                                        }
                                                        isRoot = node.nodeInfo && node.nodeInfo.isRoot;
                                                        downloadURL = getDownloadURL(node);
                                                        if (!(downloadURL && isRoot && node.nodeInfo.source !== 'local' &&
                                                            node.nodeInfo.source.autoUpdate)) return [3, 2];
                                                        return [4, checkNodeForUpdate(node, downloadURL, updated)];
                                                    case 1:
                                                        _b.sent();
                                                        _b.label = 2;
                                                    case 2: return [2];
                                                }
                                            });
                                        });
                                    }))];
                            case 1:
                                _a.sent();
                                return [4, onNodeUpdateDone(updated, oldTree)];
                            case 2:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            }
            Updating.updateStylesheets = updateStylesheets;
            function checkNodeForUpdate(node, downloadURL, updatedScripts) {
                var _this = this;
                return new Promise(function (resolve) {
                    CRMNodes.modules.Util.convertFileToDataURI(downloadURL, function (_, dataString) { return __awaiter(_this, void 0, void 0, function () {
                        var parsed, i, section, launchData, wasUpdated;
                        return __generator(this, function (_a) {
                            try {
                                parsed = Stylesheet.Installing.getUserstyleMeta(dataString);
                                for (i = 0; i < parsed.sections.length; i++) {
                                    section = parsed.sections[i];
                                    launchData = CRMNodes.Stylesheet.Installing.extractStylesheetData(section);
                                    wasUpdated = false;
                                    if (node.nodeInfo.source !== 'local' &&
                                        node.nodeInfo.source.sectionIndex !== i) {
                                        continue;
                                    }
                                    if (node.value.launchMode !== launchData.launchMode) {
                                        node.value.launchMode = launchData.launchMode;
                                        wasUpdated = true;
                                    }
                                    if (!CRMNodes.modules.Util.compareArray(node.triggers, launchData.triggers)) {
                                        node.triggers = JSON.parse(JSON.stringify(launchData.triggers));
                                        wasUpdated = true;
                                    }
                                    if (node.value.stylesheet !== launchData.code) {
                                        node.value.stylesheet = launchData.code;
                                        wasUpdated = true;
                                    }
                                    if (wasUpdated) {
                                        updatedScripts.push({
                                            node: node
                                        });
                                    }
                                }
                                resolve(null);
                            }
                            catch (e) {
                                resolve(null);
                            }
                            return [2];
                        });
                    }); }, function () {
                        window.logAsync(window.__("background_crm_updateDownload404", 'stylesheet', node.id, node.name));
                        resolve(null);
                    });
                });
            }
            function onNodeUpdateDone(updated, oldTree) {
                return __awaiter(this, void 0, void 0, function () {
                    var updatedData, _a, updatedNodes, joinedData;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                updatedData = updated.map(function (_a) {
                                    var _b = _a.node, id = _b.id, name = _b.name, nodeInfo = _b.nodeInfo;
                                    var oldNode = CRMNodes.modules.Storages.findNodeWithId(oldTree, id);
                                    return {
                                        name: name,
                                        id: id,
                                        oldVersion: CRMNodes.modules.Util.accessPath(oldNode, 'nodeInfo', 'version') || undefined,
                                        newVersion: nodeInfo.version
                                    };
                                });
                                return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                            key: 'crm',
                                            oldValue: oldTree,
                                            newValue: CRMNodes.modules.storages.settingsStorage.crm
                                        }])];
                            case 1:
                                _b.sent();
                                return [4, browserAPI.storage.local.get()];
                            case 2:
                                _a = (_b.sent()).updatedNodes, updatedNodes = _a === void 0 ? [] : _a;
                                joinedData = updatedNodes.concat(updatedData);
                                browserAPI.storage.local.set({
                                    updatedScripts: joinedData
                                });
                                return [2, joinedData];
                        }
                    });
                });
            }
        })(Updating = Stylesheet.Updating || (Stylesheet.Updating = {}));
    })(Stylesheet = CRMNodes.Stylesheet || (CRMNodes.Stylesheet = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var Stylesheet;
    (function (Stylesheet) {
        var Options;
        (function (Options) {
            function getOptionValue(option) {
                switch (option.type) {
                    case 'array':
                        return option.items;
                    case 'boolean':
                    case 'number':
                    case 'string':
                    case 'color':
                        return option.value;
                    case 'choice':
                        return option.values[option.selected];
                }
            }
            var _variableRegex = /\/\*\[\[((.)+)\]\]\*\//;
            function preprocessUSO(id, stylesheet, options) {
                var match;
                while ((match = _variableRegex.exec(stylesheet))) {
                    var name_1 = match[1];
                    if (!(name_1 in options)) {
                        window.logAsync(window.__("background_crm_optionNotFound", name_1, id));
                        stylesheet = stylesheet.replace(_variableRegex, "/*[" + name_1 + "]*/");
                    }
                    else {
                        var value = getOptionValue(options[name_1]);
                        stylesheet = stylesheet.replace(_variableRegex, value);
                    }
                }
                return stylesheet;
            }
            function parseVar(value) {
                var _a = value.replace(/\n/g, '').split(' '), type = _a[0], name = _a[1], rest = _a.slice(2);
                var joined = rest.join(' ').trim();
                var label;
                var lastLabelChar;
                if (joined.indexOf('"') === 0 || joined.indexOf("'") === 0) {
                    var strChar = joined[0];
                    label = joined.slice(1, 1 + joined.slice(1).indexOf(strChar));
                }
                else {
                    label = rest[0];
                }
                lastLabelChar = type.length + 1 + name.length + 1 +
                    label.length + 2;
                var defaultValue = value.replace(/\n/g, '').slice(lastLabelChar).trim();
                return {
                    type: type,
                    name: name,
                    label: label,
                    defaultValue: defaultValue
                };
            }
            function metaTagVarTypeToCodeOptionType(type) {
                switch (type) {
                    case 'text':
                        return 'string';
                    case 'color':
                        return 'color';
                    case 'checkbox':
                        return 'boolean';
                    case 'select':
                        return 'choice';
                }
                return '?';
            }
            function metaTagVarsToCodeOptions(stylesheet, options) {
                var metaTags = CRMNodes.MetaTags.getMetaTags(stylesheet);
                var vars = (metaTags['var'] || []).concat((metaTags['advanced'] || []));
                if (vars.length === 0) {
                    return null;
                }
                else {
                    var obj_1 = {};
                    var option_1;
                    vars.forEach(function (value) {
                        var _a = parseVar(value), type = _a.type, name = _a.name, label = _a.label, defaultValue = _a.defaultValue;
                        var descriptor = __assign({}, (typeof options !== 'string' && options[name] || {}), {
                            type: metaTagVarTypeToCodeOptionType(type),
                            descr: label
                        });
                        switch (type) {
                            case 'text':
                            case 'color':
                            case 'checkbox':
                                option_1 = typeof options !== 'string' && options[name];
                                if (option_1 && option_1.value === null) {
                                    descriptor
                                        .value = defaultValue;
                                }
                                break;
                            case 'select':
                                try {
                                    var parsed_1 = JSON.parse(defaultValue);
                                    if (Array.isArray(defaultValue)) {
                                        obj_1[name] = __assign({}, descriptor, {
                                            values: defaultValue.map(function (value) {
                                                if (value.indexOf(':') > -1) {
                                                    return value.split(':')[0];
                                                }
                                                else {
                                                    return value;
                                                }
                                            }),
                                            selected: 0
                                        });
                                    }
                                    else {
                                        obj_1[name] = __assign({}, descriptor, {
                                            values: Object.getOwnPropertyNames(parsed_1).map(function (name) {
                                                return parsed_1[name];
                                            }),
                                            selected: 0
                                        });
                                    }
                                }
                                catch (e) {
                                    obj_1[name] = __assign({}, descriptor, {
                                        values: [],
                                        selected: 0
                                    });
                                    break;
                                }
                        }
                        obj_1[name] = descriptor;
                    });
                    return obj_1;
                }
            }
            function getPreprocessorFormat(preprocessor, options) {
                if (preprocessor === 'less' || preprocessor === 'stylus') {
                    return CRMNodes.modules.Util.toArray(options || {}).map(function (_a) {
                        var key = _a[0], value = _a[1];
                        switch (value.type) {
                            case 'string':
                            case 'color':
                            case 'number':
                                return {
                                    key: key,
                                    value: (value.value === null ?
                                        value.defaultValue : value.value) + ''
                                };
                            case 'boolean':
                                return {
                                    key: key,
                                    value: value.value ? 'true' : 'false'
                                };
                            case 'array':
                                return {
                                    key: key,
                                    value: (value.value === null ?
                                        value.defaultValue : value.value).join(' ')
                                };
                            case 'choice':
                                return {
                                    key: key,
                                    value: value.values[value.selected || 0] + ''
                                };
                        }
                    });
                }
                else if (preprocessor === 'default') {
                    CRMNodes.modules.Util.toArray(options || {}).map(function (_a) {
                        var key = _a[0], value = _a[1];
                        switch (value.type) {
                            case 'string':
                            case 'color':
                            case 'number':
                            case 'boolean':
                                return {
                                    key: key,
                                    value: (value.value === null ?
                                        value.defaultValue : value.value) + ''
                                };
                            case 'array':
                                return {
                                    key: key,
                                    value: (value.value === null ?
                                        value.defaultValue : value.value).join(' ')
                                };
                            case 'choice':
                                return {
                                    key: key,
                                    value: (value.values[value.selected || 0]) + ''
                                };
                        }
                    });
                }
                else if (preprocessor === 'uso') {
                    return [];
                }
                return [];
            }
            function compileVars(stylesheet, options, preprocessor) {
                var codeOptions = metaTagVarsToCodeOptions(stylesheet, options);
                var format = getPreprocessorFormat(preprocessor, codeOptions);
                if (preprocessor === 'less') {
                    return format.map(function (_a) {
                        var key = _a.key, value = _a.value;
                        return "@" + key + ":\t" + value;
                    }).join('\n') + "\n" + stylesheet;
                }
                else if (preprocessor === 'stylus') {
                    return format.map(function (_a) {
                        var key = _a.key, value = _a.value;
                        return key + " = " + value + ";";
                    }).join('\n') + "\n" + stylesheet;
                }
                else if (preprocessor === 'default') {
                    return ":root {\n" + format.map(function (_a) {
                        var key = _a.key, value = _a.value;
                        return "\t--" + key + ": " + value;
                    }).join('\n') + "\n}\n" + stylesheet;
                }
                else {
                    return stylesheet;
                }
            }
            function compileLess(stylesheet, id) {
                return new Promise(function (resolve) {
                    window.less.Parser().parse(stylesheet, function (err, result) {
                        if (!err) {
                            resolve(result.toCSS());
                        }
                        else {
                            window.logAsync(window.__("background_crm_cssCompileError", 'less', id) + ":", err.name, err.message);
                            resolve(stylesheet);
                            ;
                        }
                    });
                });
            }
            function compileStylus(stylesheet, id) {
                return new Promise(function (resolve) {
                    window.stylus(stylesheet).render(function (err, result) {
                        if (!err) {
                            resolve(result.trim());
                        }
                        else {
                            window.logAsync(window.__("background_crm_cssCompileError", 'stylus', id) + ":", err.name, err.message);
                            resolve(stylesheet);
                            ;
                        }
                    });
                });
            }
            function applyPreprocessor(stylesheet, id, preprocessor, options) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(preprocessor === 'less')) return [3, 3];
                                return [4, CRMNodes.modules.Util.execFile('js/libraries/less.js', 'less')];
                            case 1:
                                _a.sent();
                                return [4, compileLess(stylesheet, id)];
                            case 2: return [2, _a.sent()];
                            case 3:
                                if (!(preprocessor === 'stylus')) return [3, 6];
                                return [4, CRMNodes.modules.Util.execFile('js/libraries/stylus.js', 'stylus')];
                            case 4:
                                _a.sent();
                                return [4, compileStylus(stylesheet, id)];
                            case 5: return [2, _a.sent()];
                            case 6:
                                if (preprocessor === 'uso') {
                                    return [2, preprocessUSO(id, stylesheet, options)];
                                }
                                else {
                                    return [2, stylesheet];
                                }
                                _a.label = 7;
                            case 7: return [2];
                        }
                    });
                });
            }
            function convertStylesheet(id, stylesheet, options) {
                return __awaiter(this, void 0, void 0, function () {
                    var meta, vars, preprocessor;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                meta = CRMNodes.MetaTags.getMetaTags(stylesheet);
                                vars = (meta['var'] || []).concat((meta['advanced'] || []));
                                preprocessor = (meta['preprocessor'] && meta['preprocessor'][0]) ||
                                    (vars.length ? 'uso' : 'default');
                                return [4, applyPreprocessor(compileVars(stylesheet, options, preprocessor), id, preprocessor, options)];
                            case 1: return [2, _a.sent()];
                        }
                    });
                });
            }
            function getConvertedStylesheet(node) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (node.value.convertedStylesheet &&
                                    node.value.convertedStylesheet.options === JSON.stringify(node.value.options)) {
                                    return [2, node.value.convertedStylesheet.stylesheet];
                                }
                                _a = node.value;
                                _b = {
                                    options: JSON.stringify(node.value.options)
                                };
                                return [4, convertStylesheet(node.id, node.value.stylesheet, typeof node.value.options === 'string' ?
                                        {} : node.value.options)];
                            case 1:
                                _a.convertedStylesheet = (_b.stylesheet = _c.sent(),
                                    _b);
                                return [2, node.value.convertedStylesheet.stylesheet];
                        }
                    });
                });
            }
            Options.getConvertedStylesheet = getConvertedStylesheet;
        })(Options = Stylesheet.Options || (Stylesheet.Options = {}));
    })(Stylesheet = CRMNodes.Stylesheet || (CRMNodes.Stylesheet = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var Stylesheet;
    (function (Stylesheet) {
        var Installing;
        (function (Installing) {
            function triggerify(url) {
                var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
                    .exec(url);
                return [
                    match[2] || '*',
                    '://',
                    (match[4] && match[6]) ? match[4] + match[6] : '*',
                    match[7] || '/'
                ].join('');
            }
            function extractStylesheetData(data) {
                if (data.domains.length === 0 &&
                    data.regexps.length === 0 &&
                    data.urlPrefixes.length &&
                    data.urls.length === 0) {
                    return {
                        launchMode: 1,
                        triggers: [],
                        code: data.code
                    };
                }
                var triggers = [];
                data.domains.forEach(function (domainRule) {
                    triggers.push("*://" + domainRule + "/*");
                });
                data.regexps.forEach(function (regexpRule) {
                    var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
                        .exec(regexpRule);
                    triggers.push([
                        (match[2] ?
                            (match[2].indexOf('*') > -1 ?
                                '*' : match[2]) : '*'), '://',
                        ((match[4] && match[6]) ?
                            ((match[4].indexOf('*') > -1 || match[6].indexOf('*') > -1) ?
                                '*' : match[4] + match[6]) : '*'),
                        (match[7] ?
                            (match[7].indexOf('*') > -1 ?
                                '*' : match[7]) : '*')
                    ].join(''));
                });
                data.urlPrefixes.forEach(function (urlPrefixRule) {
                    if (CRMNodes.modules.URLParsing.triggerMatchesScheme(urlPrefixRule)) {
                        triggers.push(urlPrefixRule + '*');
                    }
                    else {
                        triggers.push(triggerify(urlPrefixRule + '*'));
                    }
                });
                data.urls.forEach(function (urlRule) {
                    if (CRMNodes.modules.URLParsing.triggerMatchesScheme(urlRule)) {
                        triggers.push(urlRule);
                    }
                    else {
                        triggers.push(triggerify(urlRule));
                    }
                });
                return {
                    launchMode: 2,
                    triggers: triggers.map(function (trigger) {
                        return {
                            url: trigger,
                            not: false
                        };
                    }),
                    code: data.code
                };
            }
            Installing.extractStylesheetData = extractStylesheetData;
            function canBeUpdated(node, data) {
                if (data.version && node.nodeInfo.version) {
                    return CRMNodes.modules.Storages.getVersionDiff(node.nodeInfo.version, data.version) === 1;
                }
                for (var i = 0; i < data.sections.length; i++) {
                    var section = data.sections[i];
                    var launchData = CRMNodes.Stylesheet.Installing.extractStylesheetData(section);
                    if (node.nodeInfo.source !== 'local' &&
                        node.nodeInfo.source.sectionIndex !== i) {
                        continue;
                    }
                    if (node.value.launchMode !== launchData.launchMode ||
                        !CRMNodes.modules.Util.compareArray(node.triggers, launchData.triggers) ||
                        node.value.stylesheet !== launchData.code) {
                        return true;
                    }
                }
                return false;
            }
            function getInstalledStatus(url) {
                return __awaiter(this, void 0, void 0, function () {
                    var results, code, e_3, data;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                results = [];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4, CRMNodes.modules.Util.xhr(url)];
                            case 2:
                                code = _a.sent();
                                return [3, 4];
                            case 3:
                                e_3 = _a.sent();
                                return [2, []];
                            case 4: return [4, getUserstyleMeta(code)];
                            case 5:
                                data = _a.sent();
                                return [4, CRMNodes.modules.Util.crmForEachAsync(CRMNodes.modules.crm.crmTree, function (node) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            if (node.type !== 'stylesheet') {
                                                return [2];
                                            }
                                            if (node.nodeInfo && node.nodeInfo.source &&
                                                node.nodeInfo.source !== 'local' &&
                                                (node.nodeInfo.source.updateURL === url ||
                                                    node.nodeInfo.source.downloadURL === url)) {
                                                if (canBeUpdated(node, data)) {
                                                    results.push({
                                                        node: node,
                                                        state: 'updatable'
                                                    });
                                                }
                                                else {
                                                    results.push({
                                                        node: node,
                                                        state: 'installed'
                                                    });
                                                }
                                            }
                                            return [2];
                                        });
                                    }); })];
                            case 6:
                                _a.sent();
                                return [2, results];
                        }
                    });
                });
            }
            Installing.getInstalledStatus = getInstalledStatus;
            function stringStartsFromHere(haystack, index, needle) {
                for (var i = 0; i < needle.length; i++) {
                    if (haystack[index + i] !== needle[i]) {
                        return false;
                    }
                }
                return true;
            }
            function findDocDeclarations(code) {
                var declarations = [];
                var end = -1;
                var start = -1;
                var firstBracket = -1;
                var openBrackets = 0;
                var waitingForOpenBracket = true;
                for (var i = 0; i < code.length; i++) {
                    var char = code[i];
                    if (stringStartsFromHere(code, i, '@-moz-document') ||
                        stringStartsFromHere(code, i, '@document')) {
                        if (start !== -1) {
                            end = i - 1;
                            declarations.push({
                                start: start, end: end, firstBracket: firstBracket
                            });
                            start = end = firstBracket = -1;
                        }
                        openBrackets = 0;
                        waitingForOpenBracket = true;
                        if (code[i + 1] === '-') {
                            i += '@-moz-document'.length;
                        }
                        else {
                            i += '@document'.length;
                        }
                        start = i;
                    }
                    if (openBrackets === 0 && waitingForOpenBracket === false) {
                        end = i;
                        waitingForOpenBracket = true;
                        declarations.push({
                            start: start, end: end, firstBracket: firstBracket
                        });
                        start = end = firstBracket = -1;
                    }
                    if (char === '{') {
                        waitingForOpenBracket = false;
                        if (firstBracket === -1) {
                            firstBracket = i;
                        }
                        openBrackets += 1;
                    }
                    else if (char === '}') {
                        openBrackets -= 1;
                    }
                }
                return declarations;
            }
            function getMetaFunction(str) {
                var exec = /(.*)\(['"](.*)['"]\)/.exec(str);
                if (!exec) {
                    return {
                        fn: null,
                        url: null
                    };
                }
                return {
                    fn: exec[1],
                    url: exec[2]
                };
            }
            function getUrls(code) {
                var metaLines = CRMNodes.MetaTags.getMetaLines(code);
                return findDocDeclarations(code).map(function (_a) {
                    var start = _a.start, end = _a.end, firstBracket = _a.firstBracket;
                    var meta = code.slice(start, firstBracket);
                    var metaPrefix = metaLines.length > 0 ? "/* ==UserStyle==\n" + metaLines.map(function (line) {
                        return "" + line;
                    }).join('\n') + "\n==/UserStyle==*/" : '';
                    var metaData = {
                        code: metaPrefix + "\n" + code.slice(firstBracket + 1, end - 1),
                        domains: [],
                        regexps: [],
                        urlPrefixes: [],
                        urls: []
                    };
                    var metaDeclarations = meta.split(',').map(function (str) { return str.trim(); }).map(function (str) {
                        return getMetaFunction(str);
                    });
                    for (var _i = 0, metaDeclarations_1 = metaDeclarations; _i < metaDeclarations_1.length; _i++) {
                        var _b = metaDeclarations_1[_i], fn = _b.fn, url = _b.url;
                        switch (fn) {
                            case 'url':
                                metaData.urls.push(url);
                                break;
                            case 'url-prefix':
                                metaData.urlPrefixes.push(url);
                                break;
                            case 'domain':
                                metaData.domains.push(url);
                                break;
                            case 'regexp':
                                metaData.regexps.push(url);
                                break;
                        }
                    }
                    return metaData;
                });
            }
            function getUserstyleMeta(code) {
                var parsable = false;
                try {
                    JSON.parse(code);
                    parsable = true;
                }
                catch (e) { }
                if (parsable) {
                    return JSON.parse(code);
                }
                else {
                    var metaTags = CRMNodes.MetaTags.getMetaTags(code);
                    return {
                        sections: getUrls(code),
                        md5Url: window.md5(code),
                        name: CRMNodes.MetaTags.getMetaTag(metaTags, 'name') || 'Userstyle',
                        originalMd5: window.md5(code),
                        updateUrl: CRMNodes.MetaTags.getMetaTag(metaTags, 'updateURL') ||
                            CRMNodes.MetaTags.getMetaTag(metaTags, 'homepageURL') || undefined,
                        url: CRMNodes.MetaTags.getMetaTag(metaTags, 'homepageURL'),
                        version: CRMNodes.MetaTags.getMetaTag(metaTags, 'version'),
                        author: CRMNodes.MetaTags.getMetaTag(metaTags, 'author')
                    };
                }
            }
            Installing.getUserstyleMeta = getUserstyleMeta;
            function installStylesheet(data) {
                return __awaiter(this, void 0, void 0, function () {
                    var stylesheetData, ids;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                stylesheetData = getUserstyleMeta(data.code);
                                return [4, getInstalledStatus(data.downloadURL)];
                            case 1:
                                if ((_a.sent()).length > 0) {
                                    return [2];
                                }
                                return [4, CRMNodes.modules.Util.getMultipleItemIds(stylesheetData.sections.length)];
                            case 2:
                                ids = _a.sent();
                                return [4, CRMNodes.modules.Util.promiseChain(stylesheetData.sections.map(function (section, index) {
                                        return function () { return __awaiter(_this, void 0, void 0, function () {
                                            var sectionData, node, crmFn;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        sectionData = extractStylesheetData(section);
                                                        node = CRMNodes.modules.constants.templates
                                                            .getDefaultStylesheetNode({
                                                            isLocal: false,
                                                            name: data.name || stylesheetData.name,
                                                            nodeInfo: {
                                                                version: '1.0.0',
                                                                source: {
                                                                    updateURL: stylesheetData.updateUrl,
                                                                    url: stylesheetData.url,
                                                                    author: stylesheetData.author || data.author,
                                                                    sectionIndex: index,
                                                                    downloadURL: data.downloadURL,
                                                                    autoUpdate: true
                                                                },
                                                                permissions: [],
                                                                installDate: new Date().toLocaleDateString()
                                                            },
                                                            triggers: sectionData.triggers,
                                                            value: {
                                                                launchMode: sectionData.launchMode,
                                                                stylesheet: sectionData.code
                                                            },
                                                            id: ids[index]
                                                        });
                                                        crmFn = new CRMNodes.modules.CRMAPICall.Instance(null, null);
                                                        return [4, crmFn.moveNode(node, {})];
                                                    case 1:
                                                        _a.sent();
                                                        return [2];
                                                }
                                            });
                                        }); };
                                    }))];
                            case 3:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            }
            Installing.installStylesheet = installStylesheet;
        })(Installing = Stylesheet.Installing || (Stylesheet.Installing = {}));
    })(Stylesheet = CRMNodes.Stylesheet || (CRMNodes.Stylesheet = {}));
})(CRMNodes || (CRMNodes = {}));
;
(function (CRMNodes) {
    var Stylesheet;
    (function (Stylesheet) {
        function createToggleHandler(node) {
            var _this = this;
            return function (info, tab) { return __awaiter(_this, void 0, void 0, function () {
                var code, className, css;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            className = node.id + '' + tab.id;
                            if (!info.wasChecked) return [3, 1];
                            code = [
                                "var nodes = Array.prototype.slice.apply(document.querySelectorAll(\".styleNodes" + className + "\")).forEach(function(node){",
                                'node.remove();',
                                '});'
                            ].join('');
                            return [3, 3];
                        case 1: return [4, Stylesheet.Options.getConvertedStylesheet(node)];
                        case 2:
                            css = (_a.sent()).replace(/[ |\n]/g, '');
                            code = [
                                'var CRMSSInsert=document.createElement("style");',
                                "CRMSSInsert.className=\"styleNodes" + className + "\";",
                                'CRMSSInsert.type="text/css";',
                                "CRMSSInsert.appendChild(document.createTextNode(" + JSON
                                    .stringify(css) + "));",
                                'document.head.appendChild(CRMSSInsert);'
                            ].join('');
                            _a.label = 3;
                        case 3:
                            if (!CRMNodes.modules.crmValues.nodeTabStatuses.get(node.id).tabs.has(tab.id)) {
                                CRMNodes.modules.crmValues.nodeTabStatuses.get(node.id).tabs.set(tab.id, {});
                            }
                            CRMNodes.modules.crmValues.nodeTabStatuses.get(node.id).tabs.get(tab.id).checked = info.checked;
                            browserAPI.tabs.executeScript(tab.id, {
                                code: code,
                                allFrames: true
                            });
                            return [2];
                    }
                });
            }); };
        }
        Stylesheet.createToggleHandler = createToggleHandler;
        function createClickHandler(node) {
            var _this = this;
            return function (_info, tab) { return __awaiter(_this, void 0, void 0, function () {
                var className, css, code;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            className = node.id + '' + tab.id;
                            return [4, Stylesheet.Options.getConvertedStylesheet(node)];
                        case 1:
                            css = (_a.sent()).replace(/[ |\n]/g, '');
                            code = [
                                '(function() {',
                                "if (document.querySelector(\".styleNodes" + className + "\")) {",
                                'return false;',
                                '}',
                                'var CRMSSInsert=document.createElement("style");',
                                "CRMSSInsert.classList.add(\"styleNodes" + className + "\");",
                                'CRMSSInsert.type="text/css";',
                                "CRMSSInsert.appendChild(document.createTextNode(" + JSON.stringify(css) + "));",
                                'document.head.appendChild(CRMSSInsert);',
                                '}());'
                            ].join('');
                            browserAPI.tabs.executeScript(tab.id, {
                                code: code,
                                allFrames: true
                            });
                            return [2, node.value.stylesheet];
                    }
                });
            }); };
        }
        Stylesheet.createClickHandler = createClickHandler;
    })(Stylesheet = CRMNodes.Stylesheet || (CRMNodes.Stylesheet = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var NodeCreation;
    (function (NodeCreation) {
        function getStylesheetReplacementTabs(node) {
            var replaceOnTabs = [];
            var crmNode = CRMNodes.modules.crm.crmById.get(node.id);
            if (CRMNodes.modules.crmValues.contextMenuIds.get(node.id) &&
                crmNode.type === 'stylesheet' &&
                node.type === 'stylesheet' &&
                crmNode.value.stylesheet !== node.value.stylesheet) {
                var statusses = CRMNodes.modules.crmValues.nodeTabStatuses;
                CRMNodes.modules.Util.iterateMap(statusses.get(node.id).tabs, function (tabId) {
                    replaceOnTabs.push({
                        id: tabId
                    });
                });
            }
            return replaceOnTabs;
        }
        function extractToExecuteNode(node) {
            var triggers = node.triggers, id = node.id;
            return { triggers: triggers, id: id };
        }
        function pushToGlobalToExecute(node, launchMode) {
            if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
                if (launchMode === 1 ||
                    launchMode === 0) {
                    CRMNodes.modules.toExecuteNodes.always.documentEnd.push(extractToExecuteNode(node));
                }
                else if (launchMode === 2 ||
                    launchMode === 3) {
                    CRMNodes.modules.toExecuteNodes.onUrl.documentEnd.push(extractToExecuteNode(node));
                }
            }
        }
        function handleHideOnPages(node, launchMode, rightClickItemOptions) {
            if ((node['showOnSpecified'] && (node.type === 'link' || node.type === 'divider' ||
                node.type === 'menu')) ||
                launchMode === 3) {
                rightClickItemOptions.documentUrlPatterns = [];
                CRMNodes.modules.crmValues.hideNodesOnPagesData.set(node.id, []);
                for (var i = 0; i < node.triggers.length; i++) {
                    var prepared = CRMNodes.modules.URLParsing.prepareTrigger(node.triggers[i].url);
                    if (prepared) {
                        if (node.triggers[i].not) {
                            CRMNodes.modules.crmValues.hideNodesOnPagesData.get(node.id)
                                .push({
                                not: false,
                                url: prepared
                            });
                        }
                        else {
                            rightClickItemOptions.documentUrlPatterns.push(prepared);
                        }
                    }
                }
            }
        }
        function generateClickHandler(node, rightClickItemOptions) {
            switch (node.type) {
                case 'divider':
                    rightClickItemOptions.type = 'separator';
                    break;
                case 'link':
                    rightClickItemOptions.onclick = CRMNodes.Link.createHandler(node);
                    break;
                case 'script':
                    rightClickItemOptions.onclick = CRMNodes.Script.Handler.createHandler(node);
                    break;
                case 'stylesheet':
                    if (node.value.toggle) {
                        rightClickItemOptions.type = 'checkbox';
                        rightClickItemOptions.onclick =
                            CRMNodes.Stylesheet.createToggleHandler(node);
                        rightClickItemOptions.checked = node.value.defaultOn;
                    }
                    else {
                        rightClickItemOptions.onclick =
                            CRMNodes.Stylesheet.createClickHandler(node);
                    }
                    CRMNodes.modules.crmValues.nodeTabStatuses.set(node.id, {
                        defaultCheckedValue: node.value.defaultOn,
                        tabs: new window.Map()
                    });
                    break;
            }
        }
        function handleContextMenuError(options, e, idHolder) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!options.documentUrlPatterns) return [3, 2];
                            window.logAsync(window.__("background_crm_contextmenuErrorRetry"), e);
                            delete options.documentUrlPatterns;
                            _a = idHolder;
                            return [4, browserAPI.contextMenus.create(options, function () { return __awaiter(_this, void 0, void 0, function () {
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                _a = idHolder;
                                                return [4, browserAPI.contextMenus.create({
                                                        title: 'ERROR',
                                                        onclick: CRMNodes.createOptionsPageHandler()
                                                    })];
                                            case 1:
                                                _a.id = _b.sent();
                                                window.logAsync(window.__("background_crm_contextmenuError"), e);
                                                return [2];
                                        }
                                    });
                                }); })];
                        case 1:
                            _a.id = _b.sent();
                            return [3, 3];
                        case 2:
                            window.logAsync(window.__("background_crm_contextmenuError"), e);
                            _b.label = 3;
                        case 3: return [2];
                    }
                });
            });
        }
        function generateContextMenuItem(rightClickItemOptions, idHolder) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, e_4;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 4]);
                            _a = idHolder;
                            return [4, browserAPI.contextMenus.create(rightClickItemOptions, function () { return __awaiter(_this, void 0, void 0, function () {
                                    var __chrome;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!(window.chrome && window.chrome.runtime)) return [3, 3];
                                                __chrome = window.chrome;
                                                if (!(__chrome && __chrome.runtime && __chrome.runtime.lastError)) return [3, 2];
                                                return [4, handleContextMenuError(rightClickItemOptions, __chrome.runtime.lastError, idHolder)];
                                            case 1:
                                                _a.sent();
                                                _a.label = 2;
                                            case 2: return [3, 5];
                                            case 3:
                                                if (!browserAPI.runtime.lastError) return [3, 5];
                                                return [4, handleContextMenuError(rightClickItemOptions, browserAPI.runtime.lastError, idHolder)];
                                            case 4:
                                                _a.sent();
                                                _a.label = 5;
                                            case 5: return [2];
                                        }
                                    });
                                }); })];
                        case 1:
                            _a.id = _b.sent();
                            return [3, 4];
                        case 2:
                            e_4 = _b.sent();
                            return [4, handleContextMenuError(rightClickItemOptions, e_4, idHolder)];
                        case 3:
                            _b.sent();
                            return [3, 4];
                        case 4: return [2];
                    }
                });
            });
        }
        function getContextmenuGlobalOverrides(node) {
            return CRMNodes.modules.crmValues.contextMenuGlobalOverrides.get(node.id);
        }
        function addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            pushToGlobalToExecute(node, launchMode);
                            handleHideOnPages(node, launchMode, rightClickItemOptions);
                            generateClickHandler(node, rightClickItemOptions);
                            CRMNodes.modules.Util.applyContextmenuOverride(rightClickItemOptions, getContextmenuGlobalOverrides(node));
                            return [4, generateContextMenuItem(rightClickItemOptions, idHolder)];
                        case 1:
                            _a.sent();
                            CRMNodes.modules.crmValues.contextMenuInfoById.set(idHolder.id, {
                                settings: rightClickItemOptions,
                                path: node.path,
                                enabled: false
                            });
                            return [2];
                    }
                });
            });
        }
        function pushToToExecute(node, always, onDocumentStart) {
            var toExecute = extractToExecuteNode(node);
            if (always) {
                if (onDocumentStart) {
                    CRMNodes.modules.toExecuteNodes.always.documentStart.push(toExecute);
                }
                else {
                    CRMNodes.modules.toExecuteNodes.always.documentEnd.push(toExecute);
                }
            }
            else {
                if (onDocumentStart) {
                    CRMNodes.modules.toExecuteNodes.onUrl.documentStart.push(toExecute);
                }
                else {
                    CRMNodes.modules.toExecuteNodes.onUrl.documentEnd.push(toExecute);
                }
            }
        }
        function hasDocumentStartMetaTag(node) {
            return __awaiter(this, void 0, void 0, function () {
                var meta, _a, _b, runAtTag;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(node.type === 'script')) return [3, 2];
                            _b = (_a = CRMNodes.MetaTags).getMetaTags;
                            return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                        case 1:
                            meta = _b.apply(_a, [_c.sent()]);
                            runAtTag = meta['run-at'] || meta['run_at'];
                            if (!Array.isArray(runAtTag)) {
                                runAtTag = [runAtTag];
                            }
                            return [2, runAtTag[0] === 'document_start'];
                        case 2: return [2, false];
                    }
                });
            });
        }
        function setupUserInteraction(node, rightClickItemOptions, idHolder) {
            return __awaiter(this, void 0, void 0, function () {
                var launchMode, _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            launchMode = ((node.type === 'script' || node.type === 'stylesheet') &&
                                node.value.launchMode) || 0;
                            if (!(launchMode === 1 || launchMode === 2)) return [3, 3];
                            _a = pushToToExecute;
                            _b = [node, launchMode === 1];
                            _c = node.type === 'stylesheet';
                            if (_c) return [3, 2];
                            return [4, hasDocumentStartMetaTag(node)];
                        case 1:
                            _c = (_d.sent());
                            _d.label = 2;
                        case 2:
                            _a.apply(void 0, _b.concat([_c]));
                            return [3, 5];
                        case 3:
                            if (!(launchMode !== 4)) return [3, 5];
                            return [4, addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder)];
                        case 4:
                            _d.sent();
                            _d.label = 5;
                        case 5: return [2];
                    }
                });
            });
        }
        function createNode(node, parentId) {
            return __awaiter(this, void 0, void 0, function () {
                var replaceStylesheetTabs, rightClickItemOptions, idHolder, id, i, className, code, css, statusses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            replaceStylesheetTabs = getStylesheetReplacementTabs(node);
                            rightClickItemOptions = {
                                title: node.name,
                                contexts: CRMNodes.getContexts(node.onContentTypes),
                                parentId: parentId
                            };
                            idHolder = { id: null };
                            return [4, setupUserInteraction(node, rightClickItemOptions, idHolder)];
                        case 1:
                            _a.sent();
                            id = idHolder.id;
                            if (replaceStylesheetTabs.length !== 0) {
                                node = node;
                                for (i = 0; i < replaceStylesheetTabs.length; i++) {
                                    className = node.id + '' + replaceStylesheetTabs[i].id;
                                    code = "var nodes = document.querySelectorAll(\".styleNodes" + className + "\");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}";
                                    css = node.value.stylesheet.replace(/[ |\n]/g, '');
                                    code +=
                                        "var CRMSSInsert=document.createElement(\"style\");CRMSSInsert.className=\"styleNodes" + className + "\";CRMSSInsert.type=\"text/css\";CRMSSInsert.appendChild(document.createTextNode(" + JSON.stringify(css) + "));document.head.appendChild(CRMSSInsert);";
                                    browserAPI.tabs.executeScript(replaceStylesheetTabs[i].id, {
                                        code: code,
                                        allFrames: true
                                    });
                                    statusses = CRMNodes.modules.crmValues.nodeTabStatuses;
                                    statusses.get(node.id).tabs.get(replaceStylesheetTabs[i].id).checked = true;
                                }
                            }
                            return [2, id];
                    }
                });
            });
        }
        NodeCreation.createNode = createNode;
    })(NodeCreation = CRMNodes.NodeCreation || (CRMNodes.NodeCreation = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    var TS;
    (function (TS) {
        function compileAllInTree() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, compileTree(CRMNodes.modules.crm.crmTree)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        }
        TS.compileAllInTree = compileAllInTree;
        function compileNode(node) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(node.value.ts && node.value.ts.enabled)) return [3, 3];
                            _a = node.value.ts;
                            return [4, compileChangedScript(node.value.script, node.value.ts.script)];
                        case 1:
                            _a.script = _c.sent();
                            _b = node.value.ts;
                            return [4, compileChangedScript(CRMNodes.modules.Util.getScriptNodeJS(node, 'background'), node.value.ts.backgroundScript)];
                        case 2:
                            _b.backgroundScript = _c.sent();
                            _c.label = 3;
                        case 3: return [2];
                    }
                });
            });
        }
        TS.compileNode = compileNode;
        function compileLibrary(library) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(library.ts && library.ts.enabled)) return [3, 2];
                            _a = library.ts;
                            return [4, compileChangedScript(library.code, library.ts.code)];
                        case 1:
                            _a.code = _b.sent();
                            _b.label = 2;
                        case 2: return [2, library];
                    }
                });
            });
        }
        TS.compileLibrary = compileLibrary;
        function compileAllLibraries(libraries) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, libraries_1, library;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, libraries_1 = libraries;
                            _a.label = 1;
                        case 1:
                            if (!(_i < libraries_1.length)) return [3, 4];
                            library = libraries_1[_i];
                            return [4, compileLibrary(library)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2, libraries];
                    }
                });
            });
        }
        TS.compileAllLibraries = compileAllLibraries;
        function compileTree(tree) {
            return __awaiter(this, void 0, void 0, function () {
                var length, i, node;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            length = tree.length;
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < length)) return [3, 6];
                            node = tree[i];
                            if (!node) {
                                return [3, 5];
                            }
                            if (!(node.type === 'script')) return [3, 3];
                            return [4, compileNode(node)];
                        case 2:
                            _a.sent();
                            return [3, 5];
                        case 3:
                            if (!(node.type === 'menu')) return [3, 5];
                            return [4, compileTree(node.children)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            i++;
                            return [3, 1];
                        case 6: return [2];
                    }
                });
            });
        }
        function compileChangedScript(script, compilationData) {
            return __awaiter(this, void 0, void 0, function () {
                var sourceHash, scriptHash, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            sourceHash = compilationData.sourceHash;
                            scriptHash = window.md5(script);
                            if (!(scriptHash !== sourceHash)) return [3, 2];
                            _a = {};
                            return [4, compileScript(script)];
                        case 1: return [2, (_a.compiled = _b.sent(),
                                _a.sourceHash = scriptHash,
                                _a)];
                        case 2: return [2, compilationData];
                    }
                });
            });
        }
        function captureTSDef() {
            window.module = {
                exports: {}
            };
            return Promise.resolve(function () {
                var ts = window.module && window.module.exports;
                window.ts = window.ts || ts;
                window.module = undefined;
            });
        }
        function compileScript(script) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2, new window.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, window.withAsync(captureTSDef, function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, CRMNodes.modules.Util.execFile('js/libraries/typescript.js', 'ts')];
                                                    case 1:
                                                        _a.sent();
                                                        return [2];
                                                }
                                            });
                                        }); })];
                                    case 1:
                                        _a.sent();
                                        resolve(window.ts.transpile(script, {
                                            module: window.ts.ModuleKind.None,
                                            target: 0,
                                            noLib: true,
                                            noResolve: true,
                                            suppressOutputPathCheck: true
                                        }));
                                        return [2];
                                }
                            });
                        }); })];
                });
            });
        }
    })(TS = CRMNodes.TS || (CRMNodes.TS = {}));
})(CRMNodes || (CRMNodes = {}));
(function (CRMNodes) {
    function initModule(_modules) {
        CRMNodes.modules = _modules;
    }
    CRMNodes.initModule = initModule;
    function updateCrm(toUpdate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                key: 'crm',
                                newValue: JSON.parse(JSON.stringify(CRMNodes.modules.crm.crmTree)),
                                oldValue: {}
                            }])];
                    case 1:
                        _b.sent();
                        CRMNodes.TS.compileAllInTree();
                        return [4, updateCRMValues()];
                    case 2:
                        _b.sent();
                        return [4, buildPageCRM()];
                    case 3:
                        _b.sent();
                        return [4, CRMNodes.modules.MessageHandling.signalNewCRM()];
                    case 4:
                        _b.sent();
                        _a = toUpdate;
                        if (!_a) return [3, 6];
                        return [4, CRMNodes.modules.Storages.checkBackgroundPagesForChange({
                                toUpdate: toUpdate
                            })];
                    case 5:
                        _a = (_b.sent());
                        _b.label = 6;
                    case 6:
                        _a;
                        return [2];
                }
            });
        });
    }
    CRMNodes.updateCrm = updateCrm;
    function _assertItemIds() {
        return __awaiter(this, void 0, void 0, function () {
            var crmBefore;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crmBefore = JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm);
                        return [4, CRMNodes.modules.Util.crmForEachAsync(CRMNodes.modules.storages.settingsStorage.crm, function (node) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!(!node.id && node.id !== 0)) return [3, 2];
                                            _a = node;
                                            return [4, CRMNodes.modules.Util.generateItemId()];
                                        case 1:
                                            _a.id = _b.sent();
                                            _b.label = 2;
                                        case 2: return [2];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2, crmBefore !== JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm)];
                }
            });
        });
    }
    function _assertCRMNodeShape(node) {
        var changed = false;
        if (node.type !== 'menu') {
            return false;
        }
        if (!node.children) {
            node.children = [];
            changed = true;
        }
        for (var i = node.children.length - 1; i >= 0; i--) {
            if (!node.children[i]) {
                node.children.splice(i, 1);
                changed = true;
            }
        }
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            changed = _assertCRMNodeShape(child) || changed;
        }
        return changed;
    }
    function _assertCRMShape(crm) {
        var changed = false;
        for (var i = 0; i < crm.length; i++) {
            changed = _assertCRMNodeShape(crm[i]) || changed;
        }
        return changed;
    }
    function updateCRMValues() {
        return __awaiter(this, void 0, void 0, function () {
            var changed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, _assertItemIds()];
                    case 1:
                        changed = _a.sent();
                        changed = _assertCRMShape(CRMNodes.modules.storages.settingsStorage.crm) || changed;
                        CRMNodes.modules.crm.crmTree = CRMNodes.modules.storages.settingsStorage.crm;
                        CRMNodes.modules.crm.safeTree = buildSafeTree(CRMNodes.modules.storages.settingsStorage.crm);
                        buildNodePaths(CRMNodes.modules.crm.crmTree);
                        buildByIdObjects();
                        if (!changed) return [3, 3];
                        return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                    key: 'crm',
                                    newValue: JSON.parse(JSON.stringify(CRMNodes.modules.crm.crmTree)),
                                    oldValue: {}
                                }])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    }
    CRMNodes.updateCRMValues = updateCRMValues;
    function makeSafe(node) {
        var newNode = {};
        if (node.children) {
            var menuNode = newNode;
            menuNode.children = [];
            for (var i = 0; i < node.children.length; i++) {
                menuNode.children[i] = makeSafe(node.children[i]);
            }
            newNode = menuNode;
        }
        var copy = createCopyFunction(node, newNode);
        copy([
            'id', 'path', 'type', 'name', 'value', 'linkVal',
            'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
            'triggers', 'onContentTypes', 'showOnSpecified'
        ]);
        return newNode;
    }
    CRMNodes.makeSafe = makeSafe;
    function handleUserAddedContextMenuErrors() {
        var __window = window;
        if (__window.chrome && __window.chrome.runtime) {
            var __chrome = __window.chrome;
            if (__chrome && __chrome.runtime && __chrome.runtime.lastError) {
                window.logAsync(window.__("background_crm_userContextmenuError"), __chrome.runtime.lastError);
            }
        }
        else {
            if (browserAPI.runtime.lastError) {
                window.logAsync(window.__("background_crm_userContextmenuError"), browserAPI.runtime.lastError);
            }
        }
    }
    CRMNodes.handleUserAddedContextMenuErrors = handleUserAddedContextMenuErrors;
    function createUserContextMenuTree(tree) {
        return __awaiter(this, void 0, void 0, function () {
            var byId, _i, tree_1, menu, children, createProperties, parentId, actualId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        byId = CRMNodes.modules.crmValues.userAddedContextMenusById;
                        _i = 0, tree_1 = tree;
                        _a.label = 1;
                    case 1:
                        if (!(_i < tree_1.length)) return [3, 4];
                        menu = tree_1[_i];
                        children = menu.children, createProperties = menu.createProperties;
                        parentId = createProperties.parentId;
                        if (parentId && byId.get(parentId)) {
                            createProperties.parentId = byId.get(parentId).actualId;
                        }
                        return [4, browserAPI.contextMenus.create(createProperties, handleUserAddedContextMenuErrors)];
                    case 2:
                        actualId = _a.sent();
                        menu.actualId = actualId;
                        createUserContextMenuTree(children);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    }
    function addUserAddedContextMenuItems() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                createUserContextMenuTree(CRMNodes.modules.crmValues.userAddedContextMenus);
                return [2];
            });
        });
    }
    CRMNodes.addUserAddedContextMenuItems = addUserAddedContextMenuItems;
    function buildPageCRM() {
        var _this = this;
        return new Promise(function (resolve) {
            CRMNodes.modules.crmValues.nodeTabStatuses = new window.Map();
            browserAPI.contextMenus.removeAll().then(function () { return __awaiter(_this, void 0, void 0, function () {
                var contexts, done, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            contexts = [];
                            CRMNodes.modules.Util.crmForEach(CRMNodes.modules.crm.crmTree, function (node) {
                                contexts.push(node.onContentTypes || [false, false, false, false, false, false]);
                            });
                            return [4, CRMNodes.modules.Util.lock(0)];
                        case 1:
                            done = _b.sent();
                            _a = CRMNodes.modules.crmValues;
                            return [4, browserAPI.contextMenus.create({
                                    title: CRMNodes.modules.storages.settingsStorage.rootName || 'Custom Menu',
                                    contexts: CRMNodes.getJoinedContexts(contexts)
                                })];
                        case 2:
                            _a.rootId = _b.sent();
                            done();
                            CRMNodes.modules.toExecuteNodes = {
                                onUrl: {
                                    documentStart: [],
                                    documentEnd: []
                                },
                                always: {
                                    documentStart: [],
                                    documentEnd: []
                                }
                            };
                            CRMNodes.modules.Util.promiseChain(CRMNodes.modules.crm.crmTree.map(function (node, index) {
                                return function () {
                                    return new Promise(function (resolveInner) {
                                        buildPageCRMTree(node, CRMNodes.modules.crmValues.rootId, [index], CRMNodes.modules.crmValues.contextMenuItemTree).then(function (result) {
                                            if (result) {
                                                CRMNodes.modules.crmValues.contextMenuItemTree[index] = {
                                                    index: index, node: node,
                                                    id: result.id,
                                                    enabled: true,
                                                    parentId: CRMNodes.modules.crmValues.rootId,
                                                    children: result.children,
                                                    parentTree: CRMNodes.modules.crmValues.contextMenuItemTree
                                                };
                                            }
                                            resolveInner(null);
                                        });
                                    });
                                };
                            })).then(function () {
                                addUserAddedContextMenuItems().then(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var tree, index, _a, _b, _c, _d, _e, _f;
                                    return __generator(this, function (_g) {
                                        switch (_g.label) {
                                            case 0:
                                                if (!CRMNodes.modules.storages.storageLocal.showOptions) return [3, 3];
                                                tree = CRMNodes.modules.crmValues.contextMenuItemTree;
                                                index = tree.length;
                                                _a = tree;
                                                _b = index;
                                                _c = {
                                                    index: index
                                                };
                                                return [4, browserAPI.contextMenus.create({
                                                        type: 'separator',
                                                        parentId: CRMNodes.modules.crmValues.rootId
                                                    })];
                                            case 1:
                                                _a[_b] = (_c.id = _g.sent(),
                                                    _c.enabled = true,
                                                    _c.node = null,
                                                    _c.parentId = CRMNodes.modules.crmValues.rootId,
                                                    _c.children = [],
                                                    _c.parentTree = tree,
                                                    _c);
                                                _d = tree;
                                                _e = index + 1;
                                                _f = {
                                                    index: index + 1
                                                };
                                                return [4, browserAPI.contextMenus.create({
                                                        title: 'Options',
                                                        onclick: createOptionsPageHandler(),
                                                        parentId: CRMNodes.modules.crmValues.rootId
                                                    })];
                                            case 2:
                                                _d[_e] = (_f.id = _g.sent(),
                                                    _f.enabled = true,
                                                    _f.node = null,
                                                    _f.parentId = CRMNodes.modules.crmValues.rootId,
                                                    _f.children = [],
                                                    _f.parentTree = tree,
                                                    _f);
                                                _g.label = 3;
                                            case 3:
                                                resolve(null);
                                                return [2];
                                        }
                                    });
                                }); });
                            });
                            return [2];
                    }
                });
            }); });
        });
    }
    CRMNodes.buildPageCRM = buildPageCRM;
    function getContexts(contexts) {
        var newContexts = ['browser_action'];
        var textContexts = CRMNodes.modules.constants.contexts;
        for (var i = 0; i < 6; i++) {
            if (contexts[i]) {
                newContexts.push(textContexts[i]);
            }
        }
        if (contexts[0]) {
            newContexts.push('editable');
        }
        return newContexts;
    }
    CRMNodes.getContexts = getContexts;
    function getJoinedContexts(contexts) {
        var newContexts = {};
        newContexts['browser_action'] = true;
        var textContexts = CRMNodes.modules.constants.contexts;
        for (var _i = 0, contexts_1 = contexts; _i < contexts_1.length; _i++) {
            var context_1 = contexts_1[_i];
            for (var i = 0; i < 6; i++) {
                if (context_1[i]) {
                    newContexts[textContexts[i]] = true;
                }
            }
            if (context_1[0]) {
                newContexts['editable'] = true;
            }
        }
        return Object.getOwnPropertyNames(newContexts);
    }
    CRMNodes.getJoinedContexts = getJoinedContexts;
    function converToLegacy() {
        return __awaiter(this, void 0, void 0, function () {
            var arr, res, i, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        arr = walkCRM(CRMNodes.modules.crm.crmTree, {
                            arr: []
                        }).arr;
                        res = {};
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < arr.length)) return [3, 4];
                        _a = res;
                        _b = i;
                        return [4, convertNodeToLegacy(arr[i])];
                    case 2:
                        _a[_b] = _c.sent();
                        _c.label = 3;
                    case 3:
                        i++;
                        return [3, 1];
                    case 4:
                        res.customcolors = '0';
                        res.firsttime = 'no';
                        res.noBeatAnnouncement = 'true';
                        res.numberofrows = arr.length + '';
                        res.optionson = CRMNodes.modules.storages.storageLocal.showOptions.toString();
                        res.scriptoptions = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
                        res.waitforsearch = 'false';
                        res.whatpage = 'false';
                        res.indexIds = JSON.stringify(arr.map(function (node) {
                            return node.id;
                        }));
                        return [2, res];
                }
            });
        });
    }
    CRMNodes.converToLegacy = converToLegacy;
    function fixOptionsErrors(options) {
        if (typeof options === 'string') {
            return options;
        }
        for (var key in options) {
            var value = options[key];
            if (value.type === 'choice') {
                var choice = value;
                if (typeof choice.selected !== 'number' ||
                    choice.selected > choice.values.length ||
                    choice.selected < 0) {
                    choice.selected = 0;
                }
            }
            options[key] = value;
        }
        return options;
    }
    CRMNodes.fixOptionsErrors = fixOptionsErrors;
    function convertNodeToLegacy(node) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = node.type;
                        switch (_a) {
                            case 'divider': return [3, 1];
                            case 'link': return [3, 2];
                            case 'menu': return [3, 3];
                            case 'script': return [3, 4];
                            case 'stylesheet': return [3, 6];
                        }
                        return [3, 7];
                    case 1: return [2, [node.name, 'Divider', ''].join('%123')];
                    case 2: return [2, [node.name, 'Link', node.value.map(function (val) {
                                return val.url;
                            }).join(',')].join('%123')];
                    case 3: return [2, [node.name, 'Menu', node.children.length].join('%123')];
                    case 4:
                        _b = [node.name,
                            'Script'];
                        _c = [node.value.launchMode];
                        return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                    case 5: return [2, _b.concat([
                            _c.concat([
                                _d.sent()
                            ]).join('%124')
                        ]).join('%123')];
                    case 6: return [2, [
                            node.name,
                            'Script',
                            [
                                node.value.launchMode,
                                node.value.stylesheet
                            ].join('%124')
                        ].join('%123')];
                    case 7: return [2];
                }
            });
        });
    }
    function walkCRM(crm, state) {
        for (var i = 0; i < crm.length; i++) {
            var node = crm[i];
            state.arr.push(node);
            if (node.type === 'menu' && node.children) {
                walkCRM(node.children, state);
            }
        }
        return state;
    }
    function createCopyFunction(obj, target) {
        return function (props) {
            props.forEach(function (prop) {
                if (prop in obj) {
                    if (typeof obj[prop] === 'object') {
                        target[prop] = JSON.parse(JSON.stringify(obj[prop]));
                    }
                    else {
                        target[prop] = obj[prop];
                    }
                }
            });
        };
    }
    function buildNodePaths(tree, currentPath) {
        if (currentPath === void 0) { currentPath = []; }
        for (var i = 0; i < tree.length; i++) {
            var childPath = currentPath.concat([i]);
            var child = tree[i];
            child.path = childPath;
            if (child.children) {
                buildNodePaths(child.children, childPath);
            }
        }
    }
    CRMNodes.buildNodePaths = buildNodePaths;
    function createOptionsPageHandler() {
        return function () {
            browserAPI.runtime.openOptionsPage();
        };
    }
    CRMNodes.createOptionsPageHandler = createOptionsPageHandler;
    function buildPageCRMTree(node, parentId, path, parentTree) {
        return __awaiter(this, void 0, void 0, function () {
            var id, children, visibleIndex, i, newPath, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, CRMNodes.NodeCreation.createNode(node, parentId)];
                    case 1:
                        id = _a.sent();
                        CRMNodes.modules.crmValues.contextMenuIds.set(node.id, id);
                        if (!(id !== null)) return [3, 6];
                        children = [];
                        if (!node.children) return [3, 5];
                        visibleIndex = 0;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < node.children.length)) return [3, 5];
                        newPath = JSON.parse(JSON.stringify(path));
                        newPath.push(visibleIndex);
                        return [4, buildPageCRMTree(node.children[i], id, newPath, children)];
                    case 3:
                        result = _a.sent();
                        if (result) {
                            visibleIndex++;
                            result.index = i;
                            result.parentId = id;
                            result.node = node.children[i];
                            result.parentTree = parentTree;
                            children.push(result);
                        }
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3, 2];
                    case 5:
                        CRMNodes.modules.crmValues.contextMenuInfoById.get(id).path = path;
                        return [2, {
                                id: id,
                                path: path,
                                enabled: true,
                                children: children
                            }];
                    case 6: return [2, null];
                }
            });
        });
    }
    function parseNode(node, isSafe) {
        if (isSafe === void 0) { isSafe = false; }
        if (isSafe) {
            CRMNodes.modules.crm.crmByIdSafe.set(node.id, makeSafe(node));
        }
        else {
            CRMNodes.modules.crm.crmById.set(node.id, node);
        }
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                parseNode(node.children[i], isSafe);
            }
        }
    }
    function buildByIdObjects() {
        CRMNodes.modules.crm.crmById = new window.Map();
        CRMNodes.modules.crm.crmByIdSafe = new window.Map();
        for (var i = 0; i < CRMNodes.modules.crm.crmTree.length; i++) {
            parseNode(CRMNodes.modules.crm.crmTree[i]);
            parseNode(CRMNodes.modules.crm.safeTree[i], true);
        }
    }
    function safeTreeParse(node) {
        if (node.children) {
            var children = [];
            for (var i = 0; i < node.children.length; i++) {
                children.push(safeTreeParse(node.children[i]));
            }
            node.children = children;
        }
        return makeSafe(node);
    }
    function buildSafeTree(crm) {
        var treeCopy = JSON.parse(JSON.stringify(crm));
        var safeBranch = [];
        for (var i = 0; i < treeCopy.length; i++) {
            safeBranch.push(safeTreeParse(treeCopy[i]));
        }
        return safeBranch;
    }
})(CRMNodes || (CRMNodes = {}));
