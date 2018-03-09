"use strict";
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
exports.__esModule = true;
var CRMNodes;
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var Handler;
        (function (Handler) {
            function _genCodeOnPage(_a, _b) {
                var tab = _a.tab, key = _a.key, info = _a.info, node = _a.node, safeNode = _a.safeNode;
                var contextData = _b[0], _c = _b[1], nodeStorage = _c[0], greaseMonkeyData = _c[1], script = _c[2], indentUnit = _c[3], runAt = _c[4], tabIndex = _c[5];
                return __awaiter(this, void 0, void 0, function () {
                    var enableBackwardsCompatibility, catchErrs, supportedBrowserAPIs;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0: return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                            case 1:
                                enableBackwardsCompatibility = (_d.sent()).indexOf('/*execute locally*/') > -1 &&
                                    node.isLocal;
                                catchErrs = CRMNodes.modules.storages.storageLocal.catchErrors;
                                supportedBrowserAPIs = [];
                                if (BrowserAPI.isBrowserAPISupported('chrome')) {
                                    supportedBrowserAPIs.push('chrome');
                                }
                                if (BrowserAPI.isBrowserAPISupported('browser')) {
                                    supportedBrowserAPIs.push('browser');
                                }
                                return [2, [
                                        [
                                            "var crmAPI = new (window._crmAPIRegistry.pop())(" + [
                                                safeNode, node.id, tab, info, key, nodeStorage,
                                                contextData, greaseMonkeyData, false, (node.value && node.value.options) || {},
                                                enableBackwardsCompatibility, tabIndex, browserAPI.runtime.id, supportedBrowserAPIs.join(',')
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
            function _getScriptsToRun(code, runAt, node, usesUnsafeWindow) {
                var scripts = [];
                var globalLibraries = CRMNodes.modules.storages.storageLocal.libraries;
                var urlDataPairs = CRMNodes.modules.storages.urlDataPairs;
                for (var i = 0; i < node.value.libraries.length; i++) {
                    var lib = void 0;
                    if (globalLibraries) {
                        for (var j = 0; j < globalLibraries.length; j++) {
                            if (globalLibraries[j].name === node.value.libraries[i].name) {
                                var currentLib = globalLibraries[j];
                                if (currentLib.ts && currentLib.ts.enabled) {
                                    lib = {
                                        code: currentLib.ts.code.compiled
                                    };
                                }
                                else {
                                    lib = currentLib;
                                }
                                break;
                            }
                        }
                    }
                    if (!lib) {
                        if (!node.value.libraries[i].name) {
                            if (urlDataPairs[node.value.libraries[i].url]) {
                                lib = {
                                    code: urlDataPairs[node.value.libraries[i].url].dataString
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
                }
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
                return scripts;
            }
            function _generateMetaAccessFunction(metaData) {
                return function (key) {
                    if (metaData[key]) {
                        return metaData[key][0];
                    }
                    return undefined;
                };
            }
            function _getResourcesArrayForScript(scriptId) {
                var resourcesArray = [];
                var scriptResources = CRMNodes.modules.storages.resources[scriptId];
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
            function _ensureRunAt(id, script) {
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
                    window.log('Script with id', id, 'runAt value was changed to default, ', runAt, 'is not a valid value (use document_start, document_end or document_idle)');
                }
                return newScript;
            }
            function _executeScripts(nodeId, tabId, scripts, usesUnsafeWindow) {
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
                                        return [4, CRMNodes.modules.Util.proxyPromise(browserAPI.tabs.executeScript(tabId, _ensureRunAt(nodeId, script)), function (err) {
                                                if (err.message.indexOf('Could not establish connection') === -1 &&
                                                    err.message.indexOf('closed') === -1) {
                                                    window.log('Couldn\'t execute on tab with id', tabId, 'for node', nodeId, err);
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
                                metaString = (Script.MetaTags.getMetaLines(node.value
                                    .script) || []).join('\n');
                                metaVal = _generateMetaAccessFunction(metaData);
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
                                        resources: _getResourcesArrayForScript(node.id),
                                        "run-at": metaData['run-at'] || metaData['run_at'] || 'document_end',
                                        system: false,
                                        unwrap: true,
                                        version: metaVal('version')
                                    },
                                    scriptMetaStr: metaString
                                };
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                            case 1: return [2, (_a.info = (_b.scriptSource = _c.sent(),
                                    _b.scriptUpdateURL = metaVal('updateURL'),
                                    _b.scriptWillUpdate = true,
                                    _b.scriptHandler = 'Custom Right-Click Menu',
                                    _b.version = browserAPI.runtime.getManifest().version,
                                    _b),
                                    _a.resources = CRMNodes.modules.storages.resources[node.id] || {},
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
                CRMNodes.modules.crmValues.tabData[tabId] =
                    CRMNodes.modules.crmValues.tabData[tabId] || {
                        libraries: {},
                        nodes: {}
                    };
                CRMNodes.modules.crmValues.tabData[tabId].nodes[nodeId] =
                    CRMNodes.modules.crmValues.tabData[tabId].nodes[nodeId] || [];
                CRMNodes.modules.crmValues.tabData[tabId].nodes[nodeId].push({
                    secretKey: key,
                    usesLocalStorage: script.indexOf('localStorageProxy') > -1
                });
            }
            Handler.genTabData = genTabData;
            function createHandler(node) {
                var _this = this;
                return function (info, tab, isAutoActivate) {
                    if (isAutoActivate === void 0) { isAutoActivate = false; }
                    var key = [];
                    var err = false;
                    try {
                        key = CRMNodes.modules.Util.createSecretKey();
                    }
                    catch (e) {
                        err = e;
                    }
                    if (err) {
                        browserAPI.tabs.executeScript(tab.id, {
                            code: 'alert("Something went wrong very badly, please go to your Custom Right-Click Menu' +
                                ' options page and remove any sketchy scripts.")'
                        }).then(function () {
                            browserAPI.runtime.reload();
                        });
                    }
                    else {
                        window.Promise.all([CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
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
                            }); }), new window.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var globalNodeStorage, nodeStorage, _a, _b, tabIndex, metaData, _c, _d, runAt, _e, excludes, includes, greaseMonkeyData, indentUnit, script;
                                return __generator(this, function (_f) {
                                    switch (_f.label) {
                                        case 0:
                                            globalNodeStorage = CRMNodes.modules.storages.nodeStorage;
                                            nodeStorage = globalNodeStorage[node.id];
                                            _a = genTabData;
                                            _b = [tab.id, key, node.id];
                                            return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                        case 1:
                                            _a.apply(void 0, _b.concat([_f.sent()]));
                                            globalNodeStorage[node.id] = globalNodeStorage[node.id] || {};
                                            tabIndex = CRMNodes.modules.crmValues.tabData[tab.id].nodes[node.id].length - 1;
                                            CRMNodes.modules.Logging.Listeners.updateTabAndIdLists();
                                            _d = (_c = Script.MetaTags).getMetaTags;
                                            return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                        case 2:
                                            metaData = _d.apply(_c, [_f.sent()]);
                                            runAt = metaData['run-at'] || metaData['run_at'] || 'document_end';
                                            _e = getInExcludes(node), excludes = _e.excludes, includes = _e.includes;
                                            return [4, generateGreaseMonkeyData(metaData, node, includes, excludes, tab)];
                                        case 3:
                                            greaseMonkeyData = _f.sent();
                                            indentUnit = '	';
                                            return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                        case 4:
                                            script = (_f.sent()).split('\n').map(function (line) {
                                                return indentUnit + line;
                                            }).join('\n');
                                            resolve([nodeStorage, greaseMonkeyData, script, indentUnit, runAt, tabIndex]);
                                            return [2];
                                    }
                                });
                            }); })]).then(function (args) { return __awaiter(_this, void 0, void 0, function () {
                            var safeNode, code, usesUnsafeWindow, scripts;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        safeNode = CRMNodes.makeSafe(node);
                                        safeNode.permissions = node.permissions;
                                        return [4, _genCodeOnPage({
                                                node: node,
                                                safeNode: safeNode,
                                                tab: tab,
                                                info: info,
                                                key: key
                                            }, args)];
                                    case 1:
                                        code = _a.sent();
                                        return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                                    case 2:
                                        usesUnsafeWindow = (_a.sent()).indexOf('unsafeWindow') > -1;
                                        scripts = _getScriptsToRun(code, args[1][4], node, usesUnsafeWindow);
                                        _executeScripts(node.id, tab.id, scripts, usesUnsafeWindow);
                                        return [2];
                                }
                            });
                        }); });
                    }
                };
            }
            Handler.createHandler = createHandler;
        })(Handler = Script.Handler || (Script.Handler = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var Background;
        (function (Background) {
            function _loadBackgroundPageLibs(node) {
                var libraries = [];
                var code = [];
                var globalLibraries = CRMNodes.modules.storages.storageLocal.libraries;
                var urlDataPairs = CRMNodes.modules.storages.urlDataPairs;
                for (var i = 0; i < node.value.libraries.length; i++) {
                    var lib = void 0;
                    if (globalLibraries) {
                        for (var j = 0; j < globalLibraries.length; j++) {
                            if (globalLibraries[j].name === node.value.libraries[i].name) {
                                var currentLib = globalLibraries[j];
                                if (currentLib.ts && currentLib.ts.enabled) {
                                    lib = {
                                        code: currentLib.ts.code.compiled
                                    };
                                }
                                else {
                                    lib = currentLib;
                                }
                                break;
                            }
                            else {
                                if (node.value.libraries[i].name === null) {
                                    if (urlDataPairs[node.value.libraries[i].url]) {
                                        lib = {
                                            code: urlDataPairs[node.value.libraries[i].url].dataString
                                        };
                                    }
                                }
                            }
                        }
                    }
                    if (lib) {
                        if (lib.location) {
                            libraries.push("/js/defaultLibraries/" + lib.location);
                        }
                        else {
                            code.push(lib.code);
                        }
                    }
                }
                return {
                    libraries: libraries,
                    code: code
                };
            }
            function _genCodeBackground(code, _a) {
                var key = _a.key, node = _a.node, script = _a.script, safeNode = _a.safeNode, indentUnit = _a.indentUnit, nodeStorage = _a.nodeStorage, greaseMonkeyData = _a.greaseMonkeyData;
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
                                return [2, [
                                        code.join('\n'), [
                                            "var crmAPI = new (window._crmAPIRegistry.pop())(" + [
                                                safeNode, node.id, { id: 0 }, {}, key,
                                                nodeStorage, null,
                                                greaseMonkeyData, true, CRMNodes._fixOptionsErrors((node.value && node.value.options) || {}),
                                                enableBackwardsCompatibility, 0, browserAPI.runtime.id, supportedBrowserAPIs.join(',')
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
            function createBackgroundPage(node) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a, _b, isRestart, result, backgroundPageCode, libraries, key, err, globalNodeStorage, nodeStorage, _c, _d, _e, metaData, _f, _g, _h, excludes, includes, indentUnit_1, script, greaseMonkeyData, safeNode, code;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                _b = !node ||
                                    node.type !== 'script';
                                if (_b) return [3, 2];
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                            case 1:
                                _b = !(_j.sent());
                                _j.label = 2;
                            case 2:
                                _a = _b;
                                if (_a) return [3, 4];
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                            case 3:
                                _a = (_j.sent()) === '';
                                _j.label = 4;
                            case 4:
                                if (_a) {
                                    return [2];
                                }
                                isRestart = false;
                                if (CRMNodes.modules.background.byId[node.id]) {
                                    isRestart = true;
                                    CRMNodes.modules.Logging.backgroundPageLog(node.id, null, 'Restarting background page...');
                                    CRMNodes.modules.background.byId[node.id].terminate();
                                    CRMNodes.modules.Logging.backgroundPageLog(node.id, null, 'Terminated background page...');
                                }
                                result = _loadBackgroundPageLibs(node);
                                backgroundPageCode = result.code;
                                libraries = result.libraries;
                                key = [];
                                err = false;
                                try {
                                    key = CRMNodes.modules.Util.createSecretKey();
                                }
                                catch (e) {
                                    err = e;
                                }
                                if (!!err) return [3, 10];
                                globalNodeStorage = CRMNodes.modules.storages.nodeStorage;
                                nodeStorage = globalNodeStorage[node.id];
                                globalNodeStorage[node.id] = globalNodeStorage[node.id] || {};
                                _d = (_c = Script.Handler).genTabData;
                                _e = [0, key, node.id];
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                            case 5:
                                _d.apply(_c, _e.concat([_j.sent()]));
                                CRMNodes.modules.Logging.Listeners.updateTabAndIdLists();
                                _g = (_f = Script.MetaTags).getMetaTags;
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                            case 6:
                                metaData = _g.apply(_f, [_j.sent()]);
                                _h = Script.Handler.getInExcludes(node), excludes = _h.excludes, includes = _h.includes;
                                indentUnit_1 = '	';
                                return [4, CRMNodes.modules.Util.getScriptNodeScript(node, 'background')];
                            case 7:
                                script = (_j.sent()).split('\n').map(function (line) {
                                    return indentUnit_1 + line;
                                }).join('\n');
                                return [4, Script.Handler.generateGreaseMonkeyData(metaData, node, includes, excludes, {
                                        incognito: false
                                    })];
                            case 8:
                                greaseMonkeyData = _j.sent();
                                safeNode = CRMNodes.makeSafe(node);
                                safeNode.permissions = node.permissions;
                                return [4, _genCodeBackground(backgroundPageCode, {
                                        key: key,
                                        node: node,
                                        script: script,
                                        safeNode: safeNode,
                                        indentUnit: indentUnit_1,
                                        nodeStorage: nodeStorage,
                                        greaseMonkeyData: greaseMonkeyData
                                    })];
                            case 9:
                                code = _j.sent();
                                CRMNodes.modules.Sandbox.sandbox(node.id, code, libraries, key, function () {
                                    var instancesArr = [];
                                    var nodeInstances = CRMNodes.modules.crmValues.nodeInstances[node.id];
                                    var _loop_1 = function (instance) {
                                        if (nodeInstances.hasOwnProperty(instance) &&
                                            nodeInstances[instance]) {
                                            try {
                                                CRMNodes.modules.crmValues.tabData[instance].nodes[node.id]
                                                    .forEach(function (tabIndexInstance, index) {
                                                    CRMNodes.modules.Util.postMessage(tabIndexInstance.port, {
                                                        messageType: 'dummy'
                                                    });
                                                    instancesArr.push({
                                                        id: instance,
                                                        tabIndex: index
                                                    });
                                                });
                                            }
                                            catch (e) {
                                                delete nodeInstances[instance];
                                            }
                                        }
                                    };
                                    for (var instance in nodeInstances) {
                                        _loop_1(instance);
                                    }
                                    return instancesArr;
                                }, function (worker) {
                                    if (CRMNodes.modules.background.byId[node.id]) {
                                        CRMNodes.modules.background.byId[node.id].terminate();
                                    }
                                    CRMNodes.modules.background.byId[node.id] = worker;
                                    if (isRestart) {
                                        CRMNodes.modules.Logging.log(node.id, '*', "Background page [" + node.id + "]: ", 'Restarted background page...');
                                    }
                                });
                                return [3, 11];
                            case 10:
                                window.log('An error occurred while setting up the script for node ', node.id, err);
                                throw err;
                            case 11: return [2];
                        }
                    });
                });
            }
            Background.createBackgroundPage = createBackgroundPage;
            function createBackgroundPages() {
                return __awaiter(this, void 0, void 0, function () {
                    var _a, _b, _i, nodeId, node;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _a = [];
                                for (_b in CRMNodes.modules.crm.crmById)
                                    _a.push(_b);
                                _i = 0;
                                _c.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3, 4];
                                nodeId = _a[_i];
                                if (!CRMNodes.modules.crm.crmById.hasOwnProperty(nodeId)) return [3, 3];
                                node = CRMNodes.modules.crm.crmById[nodeId];
                                if (!(node.type === 'script')) return [3, 3];
                                window.info('Creating backgroundpage for node', node.id);
                                return [4, createBackgroundPage(node)];
                            case 2:
                                _c.sent();
                                _c.label = 3;
                            case 3:
                                _i++;
                                return [3, 1];
                            case 4: return [2];
                        }
                    });
                });
            }
            Background.createBackgroundPages = createBackgroundPages;
        })(Background = Script.Background || (Script.Background = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var MetaTags;
        (function (MetaTags) {
            function getMetaIndexes(script) {
                var metaStart = -1;
                var metaEnd = -1;
                var lines = script.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    if (metaStart !== -1) {
                        if (lines[i].indexOf('==/UserScript==') > -1) {
                            metaEnd = i;
                            break;
                        }
                    }
                    else if (lines[i].indexOf('==UserScript==') > -1) {
                        metaStart = i;
                    }
                }
                return {
                    start: metaStart,
                    end: metaEnd
                };
            }
            MetaTags.getMetaIndexes = getMetaIndexes;
            function getMetaLines(script) {
                var metaIndexes = getMetaIndexes(script);
                var metaStart = metaIndexes.start;
                var metaEnd = metaIndexes.end;
                var startPlusOne = metaStart + 1;
                var lines = script.split('\n');
                return lines.splice(startPlusOne, (metaEnd - startPlusOne));
            }
            MetaTags.getMetaLines = getMetaLines;
            function getMetaTags(script) {
                var metaLines = getMetaLines(script);
                var metaTags = {};
                var regex = /@(\w+)(\s+)(.+)/;
                for (var i = 0; i < metaLines.length; i++) {
                    var regexMatches = metaLines[i].match(regex);
                    if (regexMatches) {
                        metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
                        metaTags[regexMatches[1]].push(regexMatches[3]);
                    }
                }
                return metaTags;
            }
            MetaTags.getMetaTags = getMetaTags;
            function getlastMetaTagValue(metaTags, key) {
                return metaTags[key] && metaTags[key][metaTags[key].length - 1];
            }
            MetaTags.getlastMetaTagValue = getlastMetaTagValue;
        })(MetaTags = Script.MetaTags || (Script.MetaTags = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var Updating;
        (function (Updating) {
            function _removeOldNode(id) {
                return __awaiter(this, void 0, void 0, function () {
                    var children, i, contextMenuId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                children = CRMNodes.modules.crm.crmById[id].children;
                                if (!children) return [3, 4];
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < children.length)) return [3, 4];
                                return [4, _removeOldNode(children[i].id)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                i++;
                                return [3, 1];
                            case 4:
                                if (CRMNodes.modules.background.byId[id]) {
                                    CRMNodes.modules.background.byId[id].terminate();
                                    delete CRMNodes.modules.background.byId[id];
                                }
                                delete CRMNodes.modules.crm.crmById[id];
                                delete CRMNodes.modules.crm.crmByIdSafe[id];
                                contextMenuId = CRMNodes.modules.crmValues.contextMenuIds[id];
                                if (!(contextMenuId !== undefined && contextMenuId !== null)) return [3, 6];
                                return [4, CRMNodes.modules.Util.proxyPromise(browserAPI.contextMenus.remove(contextMenuId))];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6: return [2];
                        }
                    });
                });
            }
            function _registerNode(node, oldPath) {
                if (oldPath !== undefined && oldPath !== null) {
                    eval("globalObject.globals.storages.settingsStorage.crm[" + oldPath
                        .join('][') + "] = node");
                }
                else {
                    CRMNodes.modules.storages.settingsStorage.crm.push(node);
                }
            }
            function _deduceLaunchmode(metaTags, triggers) {
                if (Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode')) {
                    return Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_LaunchMode');
                }
                if (triggers.length === 0) {
                    return 0;
                }
                return 2;
            }
            function _createUserscriptTriggers(metaTags) {
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
                    launchMode: _deduceLaunchmode(metaTags, triggers)
                };
            }
            function _createUserscriptScriptData(metaTags, code, node) {
                node.type = 'script';
                node = node;
                var libs = [];
                if (metaTags['CRM_libraries']) {
                    metaTags['CRM_libraries'].forEach(function (item) {
                        try {
                            libs.push(JSON.parse(item));
                        }
                        catch (e) {
                        }
                    });
                }
                metaTags['CRM_libraries'] = libs;
                var requires = metaTags['require'] || [];
                var anonymousLibs = [];
                for (var i = 0; i < requires.length; i++) {
                    var skip = false;
                    for (var j = 0; j < libs.length; j++) {
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
                        scriptId: node.id
                    });
                });
                libs = libs.concat(anonymousLibs);
                node.value = CRMNodes.modules.constants.templates.getDefaultScriptValue({
                    script: code,
                    libraries: libs
                });
            }
            function _createUserscriptStylesheetData(metaTags, code, node) {
                node = node;
                node.type = 'stylesheet';
                node.value = {
                    stylesheet: code,
                    defaultOn: (metaTags['CRM_defaultOn'] =
                        Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_defaultOn') ||
                            false),
                    toggle: (metaTags['CRM_toggle'] = Script.MetaTags
                        .getlastMetaTagValue(metaTags, 'CRM_toggle') ||
                        false),
                    launchMode: 1,
                    options: {},
                    convertedStylesheet: null
                };
            }
            function _createUserscriptTypeData(metaTags, code, node) {
                if (Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_stylesheet')) {
                    _createUserscriptStylesheetData(metaTags, code, node);
                }
                else {
                    _createUserscriptScriptData(metaTags, code, node);
                }
            }
            function install(message) {
                return __awaiter(this, void 0, void 0, function () {
                    var oldTree, newScript, nodePath;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                oldTree = JSON.parse(JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm));
                                return [4, Updating.installUserscript(message.metaTags, message.script, message.downloadURL, message.allowedPermissions)];
                            case 1:
                                newScript = _a.sent();
                                if (!newScript.path) return [3, 3];
                                nodePath = newScript.path;
                                return [4, _removeOldNode(newScript.oldNodeId)];
                            case 2:
                                _a.sent();
                                _registerNode(newScript.node, nodePath);
                                return [3, 4];
                            case 3:
                                _registerNode(newScript.node);
                                _a.label = 4;
                            case 4: return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                        key: 'crm',
                                        oldValue: oldTree,
                                        newValue: CRMNodes.modules.storages.settingsStorage.crm
                                    }])];
                            case 5:
                                _a.sent();
                                return [2];
                        }
                    });
                });
            }
            Updating.install = install;
            function installUserscript(metaTags, code, downloadURL, allowedPermissions, oldNodeId) {
                return __awaiter(this, void 0, void 0, function () {
                    var node, hasOldNode, _a, launchMode, triggers, updateUrl, permissions, resources, _b, requestPermissions, allPermissions, _c, allowed, joinedPermissions, path;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                node = {};
                                hasOldNode = false;
                                if (oldNodeId !== undefined && oldNodeId !== null) {
                                    hasOldNode = true;
                                    node.id = oldNodeId;
                                }
                                else {
                                    node.id = CRMNodes.modules.Util.generateItemId();
                                }
                                node.name = Script.MetaTags.getlastMetaTagValue(metaTags, 'name') || 'name';
                                _createUserscriptTypeData(metaTags, code, node);
                                _a = _createUserscriptTriggers(metaTags), launchMode = _a.launchMode, triggers = _a.triggers;
                                node.triggers = triggers;
                                node.value.launchMode = launchMode;
                                updateUrl = Script.MetaTags.getlastMetaTagValue(metaTags, 'updateURL') ||
                                    Script.MetaTags.getlastMetaTagValue(metaTags, 'downloadURL') ||
                                    downloadURL;
                                permissions = [];
                                if (metaTags['grant']) {
                                    permissions = metaTags['grant'];
                                    permissions = permissions.splice(permissions.indexOf('none'), 1);
                                }
                                node.nodeInfo = {
                                    version: Script.MetaTags.getlastMetaTagValue(metaTags, 'version') || null,
                                    source: {
                                        updateURL: updateUrl || downloadURL,
                                        url: updateUrl || Script.MetaTags.getlastMetaTagValue(metaTags, 'namespace') ||
                                            downloadURL,
                                        author: Script.MetaTags.getlastMetaTagValue(metaTags, 'author') ||
                                            'Anonymous'
                                    },
                                    isRoot: true,
                                    permissions: permissions,
                                    lastUpdatedAt: Date.now(),
                                    installDate: new Date().toLocaleDateString()
                                };
                                if (hasOldNode) {
                                    node.nodeInfo.installDate = (CRMNodes.modules.crm.crmById[oldNodeId] &&
                                        CRMNodes.modules.crm.crmById[oldNodeId].nodeInfo &&
                                        CRMNodes.modules.crm.crmById[oldNodeId].nodeInfo.installDate) ||
                                        node.nodeInfo.installDate;
                                }
                                if (Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_contentTypes')) {
                                    try {
                                        node.onContentTypes = JSON.parse(Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_contentTypes'));
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
                            case 1:
                                _b = (_d.sent()).requestPermissions, requestPermissions = _b === void 0 ? [] : _b;
                                if (!browserAPI.permissions) return [3, 3];
                                return [4, browserAPI.permissions.getAll()];
                            case 2:
                                _c = _d.sent();
                                return [3, 4];
                            case 3:
                                _c = {
                                    permissions: []
                                };
                                _d.label = 4;
                            case 4:
                                allPermissions = _c;
                                allowed = allPermissions.permissions || [];
                                joinedPermissions = requestPermissions.concat(node.permissions).filter(function (permission) {
                                    return allowed.indexOf(permission) === -1;
                                }).filter(function (permission, index, self) {
                                    return self.indexOf(permission) === index;
                                });
                                browserAPI.storage.local.set({
                                    requestPermissions: joinedPermissions
                                }).then(function () {
                                    if (joinedPermissions.length > 0) {
                                        browserAPI.runtime.openOptionsPage();
                                    }
                                });
                                if (node.type === 'script') {
                                    node = CRMNodes.modules.constants.templates.getDefaultScriptNode(node);
                                }
                                else {
                                    node = CRMNodes.modules.constants.templates.getDefaultStylesheetNode(node);
                                }
                                if (hasOldNode) {
                                    path = CRMNodes.modules.crm.crmById[oldNodeId].path;
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
            function updateScripts(callback) {
                var checking = [];
                var updated = [];
                var oldTree = JSON.parse(JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm));
                window.info('Looking for updated scripts...');
                for (var id in CRMNodes.modules.crm.crmById) {
                    if (CRMNodes.modules.crm.crmById.hasOwnProperty(id)) {
                        var node = CRMNodes.modules.crm.crmById[id];
                        var isRoot = node.nodeInfo && node.nodeInfo.isRoot;
                        var downloadURL = node.nodeInfo &&
                            node.nodeInfo.source &&
                            typeof node.nodeInfo.source !== 'string' &&
                            (node.nodeInfo.source.downloadURL ||
                                node.nodeInfo.source.updateURL ||
                                node.nodeInfo.source.url);
                        if (downloadURL && isRoot) {
                            var checkingId = checking.length;
                            checking[checkingId] = true;
                            _checkNodeForUpdate(node, checking, checkingId, downloadURL, _genNodeUpdateOnDone(updated, oldTree, callback), updated);
                        }
                    }
                }
            }
            Updating.updateScripts = updateScripts;
            function _genNodeUpdateOnDone(updated, oldTree, callback) {
                var _this = this;
                return function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    var updatedData, updatedScripts, joinedData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                updatedData = updated.map(function (updatedScript) {
                                    var oldNode = CRMNodes.modules.crm.crmById[updatedScript.oldNodeId];
                                    return {
                                        name: updatedScript.node.name,
                                        id: updatedScript.node.id,
                                        oldVersion: (oldNode && oldNode.nodeInfo && oldNode.nodeInfo.version) ||
                                            undefined,
                                        newVersion: updatedScript.node.nodeInfo.version
                                    };
                                });
                                return [4, Promise.all(updated.map(function (updatedScript) {
                                        return CRMNodes.modules.Util.iipe(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!updatedScript.path) return [3, 2];
                                                        return [4, _removeOldNode(updatedScript.oldNodeId)];
                                                    case 1:
                                                        _a.sent();
                                                        _registerNode(updatedScript.node, updatedScript.path);
                                                        return [3, 3];
                                                    case 2:
                                                        _registerNode(updatedScript.node);
                                                        _a.label = 3;
                                                    case 3: return [2];
                                                }
                                            });
                                        }); });
                                    }))];
                            case 1:
                                _a.sent();
                                return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                            key: 'crm',
                                            oldValue: oldTree,
                                            newValue: CRMNodes.modules.storages.settingsStorage.crm
                                        }])];
                            case 2:
                                _a.sent();
                                return [4, browserAPI.storage.local.get()];
                            case 3:
                                updatedScripts = (_a.sent()).updatedScripts;
                                joinedData = updatedScripts.concat(updatedData);
                                browserAPI.storage.local.set({
                                    updatedScripts: joinedData
                                });
                                if (callback) {
                                    callback(joinedData);
                                }
                                return [2];
                        }
                    });
                }); };
            }
            function _checkNodeForUpdate(node, checking, checkingId, downloadURL, onDone, updatedScripts) {
                var _this = this;
                if (node.type === 'script' || node.type === 'stylesheet') {
                    if (downloadURL && CRMNodes.modules.Util.endsWith(downloadURL, '.user.js')) {
                        try {
                            CRMNodes.modules.Util.convertFileToDataURI(downloadURL, function (dataURI, dataString) { return __awaiter(_this, void 0, void 0, function () {
                                var metaTags, _a, addedPermissions, _b, _c, err_1;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _d.trys.push([0, 6, , 7]);
                                            metaTags = Script.MetaTags.getMetaTags(dataString);
                                            if (!CRMNodes.modules.Util.isNewer(metaTags['version'][0], node.nodeInfo.version)) return [3, 5];
                                            if (!(!CRMNodes.modules.Util.compareArray(node.nodeInfo.permissions, metaTags['grant']) &&
                                                !(metaTags['grant'].length === 0 &&
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
                                            browserAPI.runtime.openOptionsPage();
                                            _d.label = 3;
                                        case 3:
                                            _c = (_b = updatedScripts).push;
                                            return [4, installUserscript(metaTags, dataString, downloadURL, node.permissions, node.id)];
                                        case 4:
                                            _c.apply(_b, [_d.sent()]);
                                            _d.label = 5;
                                        case 5:
                                            checking[checkingId] = false;
                                            if (checking.filter(function (c) { return c; }).length === 0) {
                                                onDone();
                                            }
                                            return [3, 7];
                                        case 6:
                                            err_1 = _d.sent();
                                            window.log('Tried to update script ', node.id, ' ', node.name, ' but could not reach download URL');
                                            return [3, 7];
                                        case 7: return [2];
                                    }
                                });
                            }); }, function () {
                                checking[checkingId] = false;
                                if (checking.filter(function (c) { return c; }).length === 0) {
                                    onDone();
                                }
                            });
                        }
                        catch (e) {
                            window.log('Tried to update script ', node.id, ' ', node.name, ' but could not reach download URL');
                        }
                    }
                }
            }
        })(Updating = Script.Updating || (Script.Updating = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var Script;
    (function (Script) {
        var Running;
        (function (Running) {
            function _urlIsGlobalExcluded(url) {
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
            function executeNode(node, tab) {
                if (node.type === 'script') {
                    Script.Handler.createHandler(node)({
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
            function executeScriptsForTab(tabId, respond) {
                return __awaiter(this, void 0, void 0, function () {
                    var tab, toExecute, toExecuteNodes, nodeId, i, i, e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4, browserAPI.tabs.get(tabId)];
                            case 1:
                                tab = _a.sent();
                                if (tab.url && tab.url.indexOf('chrome') !== 0) {
                                    CRMNodes.modules.crmValues.tabData[tab.id] = {
                                        libraries: {},
                                        nodes: {}
                                    };
                                    CRMNodes.modules.Logging.Listeners.updateTabAndIdLists();
                                    if (!_urlIsGlobalExcluded(tab.url)) {
                                        toExecute = [];
                                        toExecuteNodes = CRMNodes.modules.toExecuteNodes;
                                        for (nodeId in toExecuteNodes.onUrl) {
                                            if (toExecuteNodes.onUrl[nodeId]) {
                                                if (CRMNodes.modules.URLParsing.matchesUrlSchemes(toExecuteNodes.onUrl[nodeId], tab.url)) {
                                                    toExecute.push({
                                                        node: CRMNodes.modules.crm.crmById[nodeId],
                                                        tab: tab
                                                    });
                                                }
                                            }
                                        }
                                        for (i = 0; i < toExecuteNodes.always.length; i++) {
                                            executeNode(toExecuteNodes.always[i], tab);
                                        }
                                        for (i = 0; i < toExecute.length; i++) {
                                            executeNode(toExecute[i].node, toExecute[i].tab);
                                        }
                                        respond({
                                            matched: toExecute.length > 0
                                        });
                                    }
                                }
                                return [3, 3];
                            case 2:
                                e_2 = _a.sent();
                                return [2];
                            case 3: return [2];
                        }
                    });
                });
            }
            Running.executeScriptsForTab = executeScriptsForTab;
        })(Running = Script.Running || (Script.Running = {}));
    })(Script = CRMNodes.Script || (CRMNodes.Script = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
;
(function (CRMNodes) {
    var Link;
    (function (Link) {
        function _sanitizeUrl(url) {
            if (url.indexOf('://') === -1) {
                url = "http://" + url;
            }
            return url;
        }
        function createHandler(node) {
            return function (clickData, tabInfo) {
                var finalUrl;
                for (var i = 0; i < node.value.length; i++) {
                    if (node.value[i].newTab) {
                        browserAPI.tabs.create({
                            windowId: tabInfo.windowId,
                            url: _sanitizeUrl(node.value[i].url),
                            openerTabId: tabInfo.id
                        });
                    }
                    else {
                        finalUrl = node.value[i].url;
                    }
                }
                if (finalUrl) {
                    browserAPI.tabs.update(tabInfo.id, {
                        url: _sanitizeUrl(finalUrl)
                    });
                }
            };
        }
        Link.createHandler = createHandler;
    })(Link = CRMNodes.Link || (CRMNodes.Link = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var Stylesheet;
    (function (Stylesheet) {
        var Options;
        (function (Options) {
            function _splitComments(stylesheet) {
                var lines = [{
                        isComment: false,
                        line: ''
                    }];
                var lineIndex = 0;
                for (var i = 0; i < stylesheet.length; i++) {
                    if (stylesheet[i] === '/' && stylesheet[i + 1] === '*') {
                        lineIndex++;
                        i += 1;
                        lines[lineIndex] = {
                            isComment: true,
                            line: ''
                        };
                    }
                    else if (stylesheet[i] === '*' && stylesheet[i + 1] === '/') {
                        lineIndex++;
                        i += 1;
                        lines[lineIndex] = {
                            isComment: false,
                            line: ''
                        };
                    }
                    else {
                        lines[lineIndex].line += stylesheet[i];
                    }
                }
                return lines;
            }
            function _evalOperator(left, operator, right) {
                switch (operator) {
                    case '<=':
                        return left <= right;
                    case '>=':
                        return left >= right;
                    case '<':
                        return left < right;
                    case '>':
                        return left > right;
                    case '!==':
                        return left !== right;
                    case '!=':
                        return left != right;
                    case '===':
                        return left === right;
                    case '==':
                        return left == right;
                }
                return false;
            }
            function _getOptionValue(option) {
                switch (option.type) {
                    case 'array':
                        return option.items;
                    case 'boolean':
                    case 'number':
                    case 'string':
                        return option.value;
                    case 'choice':
                        return option.values[option.selected];
                }
            }
            var _numRegex = /^(-)?(\d)+(\.(\d)+)?$/;
            var _strRegex = /^("(.*)"|'(.*)'|`(.*)`)$/;
            var _valueRegex = /^(\n|\r|\s)*("(.*)"|'(.*)'|`(.*)`|(-)?(\d)+(\.(\d)+)?|\w(\w|\d)*)(\n|\r|\s)*$/;
            var _boolExprRegex = /^(\n|\r|\s)*("(.*)"|'(.*)'|`(.*)`|(-)?(\d)+(\.(\d)+)?|\w(\w|\d)*)(\n|\r|\s)*(<=|>=|<|>|!==|!=|===|==)(\n|\r|\s)*("(.*)"|'(.*)'|`(.*)`|(-)?(\d)+|\w(\w|\d)*)(\n|\r|\s)*$/;
            function _getStringExprValue(expr, options) {
                if (expr === 'true') {
                    return true;
                }
                if (expr === 'false') {
                    return false;
                }
                if (_numRegex.exec(expr)) {
                    return parseFloat(expr);
                }
                if (_strRegex.exec(expr)) {
                    return expr.slice(1, -1);
                }
                if (options[expr]) {
                    return _getOptionValue(options[expr]);
                }
            }
            function _evaluateBoolExpr(expr, options) {
                if (expr.indexOf('||') > -1) {
                    return _evaluateBoolExpr(expr.slice(0, expr.indexOf('||')), options) ||
                        _evaluateBoolExpr(expr.slice(expr.indexOf('||') + 2), options);
                }
                if (expr.indexOf('&&') > -1) {
                    return _evaluateBoolExpr(expr.slice(0, expr.indexOf('&&')), options) &&
                        _evaluateBoolExpr(expr.slice(expr.indexOf('&&') + 2), options);
                }
                var regexEval = _boolExprRegex.exec(expr);
                if (regexEval) {
                    var leftExpr = regexEval[2];
                    var operator = regexEval[12];
                    var rightExpr = regexEval[14];
                    return _evalOperator(_getStringExprValue(leftExpr, options), operator, _getStringExprValue(rightExpr, options));
                }
                var valueRegexEval = _valueRegex.exec(expr);
                if (valueRegexEval) {
                    return !!_getStringExprValue(valueRegexEval[2], options);
                }
                return false;
            }
            function _evaluateIfStatement(line, options) {
                var statement = _ifRegex.exec(line)[2];
                return _evaluateBoolExpr(statement, options);
            }
            function _replaceVariableInstances(line, options) {
                var parts = [{
                        isVariable: false,
                        content: ''
                    }];
                var inVar = false;
                for (var i = 0; i < line.length; i++) {
                    if (line[i] === '{' && line[i + 1] === '{') {
                        if (!inVar) {
                            inVar = true;
                            parts.push({
                                isVariable: true,
                                content: ''
                            });
                        }
                        else {
                            parts[parts.length - 1].content += '{{';
                        }
                        i += 1;
                    }
                    else if (line[i] === '}' && line[i + 1] === '}') {
                        if (inVar) {
                            inVar = false;
                            parts.push({
                                isVariable: false,
                                content: ''
                            });
                        }
                        else {
                            parts[parts.length - 1].content += '}}';
                        }
                        i += 1;
                    }
                    else {
                        parts[parts.length - 1].content += line[i];
                    }
                }
                return parts.map(function (part) {
                    if (!part.isVariable) {
                        return part.content;
                    }
                    return options[part.content] && _getOptionValue(options[part.content]);
                }).join('');
            }
            function _getLastIf(ifs) {
                if (ifs.length > 0) {
                    return ifs[ifs.length - 1];
                }
                return {
                    skip: false,
                    isElse: false,
                    ignore: false
                };
            }
            var _ifRegex = /^(\n|\r|\s)*if (.+) then(\n|\r|\s)*$/;
            var _elseRegex = /^(\n|\r|\s)*else(\n|\r|\s)*$/;
            var _endifRegex = /^(\n|\r|\s)*endif(\n|\r|\s)*$/;
            var _variableRegex = /^(\n|\r|\s)*(\w|-)+:(\n|\r|\s)*(.*)\{\{\w(\w|\d)*\}\}(.*)((\n|\r|\s)*,(\n|\r|\s)*(.*)\{\{\w(\w|\d)*\}\}(.*))*$/;
            function _convertStylesheet(stylesheet, options) {
                var splitComments = _splitComments(stylesheet);
                var lines = [];
                var ifs = [];
                for (var i = 0; i < splitComments.length; i++) {
                    if (_ifRegex.exec(splitComments[i].line)) {
                        ifs.push({
                            skip: _getLastIf(ifs).skip || !_evaluateIfStatement(splitComments[i].line, options),
                            isElse: false,
                            ignore: _getLastIf(ifs).skip
                        });
                    }
                    else if (_elseRegex.exec(splitComments[i].line)) {
                        if (!_getLastIf(ifs).isElse && !_getLastIf(ifs).ignore) {
                            _getLastIf(ifs).skip = !_getLastIf(ifs).skip;
                        }
                        _getLastIf(ifs).isElse = true;
                    }
                    else if (_endifRegex.exec(splitComments[i].line)) {
                        ifs.pop();
                    }
                    else if (!_getLastIf(ifs).skip) {
                        if (!splitComments[i].isComment) {
                            lines.push(splitComments[i].line);
                        }
                        else {
                            if (_variableRegex.exec(splitComments[i].line)) {
                                lines.push(_replaceVariableInstances(splitComments[i].line, CRMNodes._fixOptionsErrors(options)));
                            }
                            else {
                                lines.push(splitComments[i].line);
                            }
                        }
                    }
                }
                return lines.join('');
            }
            function getConvertedStylesheet(node) {
                if (node.value.convertedStylesheet &&
                    node.value.convertedStylesheet.options === JSON.stringify(node.value.options)) {
                    return node.value.convertedStylesheet.stylesheet;
                }
                node.value.convertedStylesheet = {
                    options: JSON.stringify(node.value.options),
                    stylesheet: _convertStylesheet(node.value.stylesheet, typeof node.value.options === 'string' ?
                        {} : node.value.options)
                };
                return node.value.convertedStylesheet.stylesheet;
            }
            Options.getConvertedStylesheet = getConvertedStylesheet;
        })(Options = Stylesheet.Options || (Stylesheet.Options = {}));
    })(Stylesheet = CRMNodes.Stylesheet || (CRMNodes.Stylesheet = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var Stylesheet;
    (function (Stylesheet) {
        var Installing;
        (function (Installing) {
            function _triggerify(url) {
                var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
                    .exec(url);
                return [
                    match[2] || '*',
                    '://',
                    (match[4] && match[6]) ? match[4] + match[6] : '*',
                    match[7] || '/'
                ].join('');
            }
            function _extractStylesheetData(data) {
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
                        triggers.push(_triggerify(urlPrefixRule + '*'));
                    }
                });
                data.urls.forEach(function (urlRule) {
                    if (CRMNodes.modules.URLParsing.triggerMatchesScheme(urlRule)) {
                        triggers.push(urlRule);
                    }
                    else {
                        triggers.push(_triggerify(urlRule));
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
            function installStylesheet(data) {
                var stylesheetData = JSON.parse(data.code);
                stylesheetData.sections.forEach(function (section) {
                    var sectionData = _extractStylesheetData(section);
                    var node = CRMNodes.modules.constants.templates
                        .getDefaultStylesheetNode({
                        isLocal: false,
                        name: stylesheetData.name,
                        nodeInfo: {
                            version: '1',
                            source: {
                                updateURL: stylesheetData.updateUrl,
                                url: stylesheetData.url,
                                author: data.author
                            },
                            permissions: [],
                            installDate: new Date().toLocaleDateString()
                        },
                        triggers: sectionData.triggers,
                        value: {
                            launchMode: sectionData.launchMode,
                            stylesheet: sectionData.code
                        },
                        id: CRMNodes.modules.Util.generateItemId()
                    });
                    var crmFn = new CRMNodes.modules.CRMFunction.Instance(null, null);
                    crmFn.moveNode(node, {}, null);
                });
            }
            Installing.installStylesheet = installStylesheet;
        })(Installing = Stylesheet.Installing || (Stylesheet.Installing = {}));
    })(Stylesheet = CRMNodes.Stylesheet || (CRMNodes.Stylesheet = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
;
(function (CRMNodes) {
    var Stylesheet;
    (function (Stylesheet) {
        function createToggleHandler(node) {
            return function (info, tab) {
                var code;
                var className = node.id + '' + tab.id;
                if (info.wasChecked) {
                    code = [
                        "var nodes = Array.prototype.slice.apply(document.querySelectorAll(\".styleNodes" + className + "\")).forEach(function(node){",
                        'node.remove();',
                        '});'
                    ].join('');
                }
                else {
                    var css = Stylesheet.Options.getConvertedStylesheet(node).replace(/[ |\n]/g, '');
                    code = [
                        'var CRMSSInsert=document.createElement("style");',
                        "CRMSSInsert.className=\"styleNodes" + className + "\";",
                        'CRMSSInsert.type="text/css";',
                        "CRMSSInsert.appendChild(document.createTextNode(" + JSON
                            .stringify(css) + "));",
                        'document.head.appendChild(CRMSSInsert);'
                    ].join('');
                }
                CRMNodes.modules.crmValues.stylesheetNodeStatusses[node.id][tab.id] = info.checked;
                browserAPI.tabs.executeScript(tab.id, {
                    code: code,
                    allFrames: true
                });
            };
        }
        Stylesheet.createToggleHandler = createToggleHandler;
        function createClickHandler(node) {
            return function (info, tab) {
                var className = node.id + '' + tab.id;
                var css = Stylesheet.Options.getConvertedStylesheet(node).replace(/[ |\n]/g, '');
                var code = [
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
                return node.value.stylesheet;
            };
        }
        Stylesheet.createClickHandler = createClickHandler;
    })(Stylesheet = CRMNodes.Stylesheet || (CRMNodes.Stylesheet = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var NodeCreation;
    (function (NodeCreation) {
        function _getStylesheetReplacementTabs(node) {
            var replaceOnTabs = [];
            var crmNode = CRMNodes.modules.crm.crmById[node.id];
            if (CRMNodes.modules.crmValues.contextMenuIds[node.id] &&
                crmNode.type === 'stylesheet' &&
                node.type === 'stylesheet' &&
                crmNode.value.stylesheet !== node.value.stylesheet) {
                var statusses = CRMNodes.modules.crmValues.stylesheetNodeStatusses;
                for (var key in statusses[node.id]) {
                    if (statusses[node.id][key] && key !== 'defaultValue') {
                        replaceOnTabs.push({
                            id: key
                        });
                    }
                }
            }
            return replaceOnTabs;
        }
        function _pushToGlobalToExecute(node, launchMode) {
            if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
                if (launchMode === 1 ||
                    launchMode === 0) {
                    CRMNodes.modules.toExecuteNodes.always.push(node);
                }
                else if (launchMode === 2 ||
                    launchMode === 3) {
                    CRMNodes.modules.toExecuteNodes.onUrl[node.id] = node.triggers;
                }
            }
        }
        function _handleHideOnPages(node, launchMode, rightClickItemOptions) {
            if ((node['showOnSpecified'] && (node.type === 'link' || node.type === 'divider' ||
                node.type === 'menu')) ||
                launchMode === 3) {
                rightClickItemOptions.documentUrlPatterns = [];
                CRMNodes.modules.crmValues.hideNodesOnPagesData[node.id] = [];
                for (var i = 0; i < node.triggers.length; i++) {
                    var prepared = CRMNodes.modules.URLParsing.prepareTrigger(node.triggers[i].url);
                    if (prepared) {
                        if (node.triggers[i].not) {
                            CRMNodes.modules.crmValues.hideNodesOnPagesData[node.id]
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
        function _generateClickHandler(node, rightClickItemOptions) {
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
                    CRMNodes.modules.crmValues.stylesheetNodeStatusses[node.id] = {
                        defaultValue: node.value.defaultOn
                    };
                    break;
            }
        }
        function _handleContextMenuError(options, e, idHolder) {
            if (options.documentUrlPatterns) {
                console.log('An error occurred with your context menu, attempting again with no url matching.', e);
                delete options.documentUrlPatterns;
                idHolder.id = browserAPI.contextMenus.create(options, function () {
                    idHolder.id = browserAPI.contextMenus.create({
                        title: 'ERROR',
                        onclick: CRMNodes._createOptionsPageHandler()
                    });
                    window.log('Another error occured with your context menu!', e);
                });
            }
            else {
                window.log('An error occured with your context menu!', e);
            }
        }
        function _generateContextMenuItem(rightClickItemOptions, idHolder) {
            try {
                idHolder.id = browserAPI.contextMenus.create(rightClickItemOptions, function () {
                    if (window.chrome && window.chrome.runtime) {
                        var __chrome = window.chrome;
                        if (__chrome && __chrome.runtime && __chrome.runtime.lastError) {
                            _handleContextMenuError(rightClickItemOptions, __chrome.runtime.lastError, idHolder);
                        }
                    }
                    else {
                        if (browserAPI.runtime.lastError) {
                            _handleContextMenuError(rightClickItemOptions, browserAPI.runtime.lastError, idHolder);
                        }
                    }
                });
            }
            catch (e) {
                _handleContextMenuError(rightClickItemOptions, e, idHolder);
            }
        }
        function _addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder) {
            _pushToGlobalToExecute(node, launchMode);
            _handleHideOnPages(node, launchMode, rightClickItemOptions);
            _generateClickHandler(node, rightClickItemOptions);
            _generateContextMenuItem(rightClickItemOptions, idHolder);
            CRMNodes.modules.crmValues.contextMenuInfoById[idHolder.id] = {
                settings: rightClickItemOptions,
                path: node.path,
                enabled: false
            };
        }
        function _setLaunchModeData(node, rightClickItemOptions, idHolder) {
            return __awaiter(this, void 0, void 0, function () {
                var launchMode, meta, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            launchMode = ((node.type === 'script' || node.type === 'stylesheet') &&
                                node.value.launchMode) || 0;
                            if (!(launchMode === 1)) return [3, 4];
                            if (!(node.type === 'script')) return [3, 2];
                            _b = (_a = CRMNodes.Script.MetaTags).getMetaTags;
                            return [4, CRMNodes.modules.Util.getScriptNodeScript(node)];
                        case 1:
                            meta = _b.apply(_a, [_c.sent()]);
                            if (meta['run-at'] === 'document_start' || meta['run_at'] === 'document_start') {
                                CRMNodes.modules.toExecuteNodes.documentStart.push(node);
                            }
                            else {
                                CRMNodes.modules.toExecuteNodes.always.push(node);
                            }
                            return [3, 3];
                        case 2:
                            CRMNodes.modules.toExecuteNodes.always.push(node);
                            _c.label = 3;
                        case 3: return [3, 5];
                        case 4:
                            if (launchMode === 2) {
                                CRMNodes.modules.toExecuteNodes.onUrl[node.id] = node.triggers;
                            }
                            else if (launchMode !== 4) {
                                _addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder);
                            }
                            _c.label = 5;
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
                            replaceStylesheetTabs = _getStylesheetReplacementTabs(node);
                            rightClickItemOptions = {
                                title: node.name,
                                contexts: CRMNodes.getContexts(node.onContentTypes),
                                parentId: parentId
                            };
                            idHolder = { id: null };
                            return [4, _setLaunchModeData(node, rightClickItemOptions, idHolder)];
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
                                    statusses = CRMNodes.modules.crmValues.stylesheetNodeStatusses;
                                    statusses[node.id][replaceStylesheetTabs[i].id] = true;
                                }
                            }
                            return [2, id];
                    }
                });
            });
        }
        NodeCreation.createNode = createNode;
    })(NodeCreation = CRMNodes.NodeCreation || (CRMNodes.NodeCreation = {}));
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
(function (CRMNodes) {
    var TS;
    (function (TS) {
        function compileAllInTree() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, _compileTree(CRMNodes.modules.crm.crmTree)];
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
                            return [4, _compileChangedScript(node.value.script, node.value.ts.script)];
                        case 1:
                            _a.script = _c.sent();
                            _b = node.value.ts;
                            return [4, _compileChangedScript(CRMNodes.modules.Util.getScriptNodeJS(node, 'background'), node.value.ts.backgroundScript)];
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
                            return [4, _compileChangedScript(library.code, library.ts.code)];
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
        function _compileTree(tree) {
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
                            if (!(node.type === 'script')) return [3, 3];
                            return [4, compileNode(node)];
                        case 2:
                            _a.sent();
                            return [3, 5];
                        case 3:
                            if (!(node.type === 'menu')) return [3, 5];
                            return [4, _compileTree(node.children)];
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
        function _compileChangedScript(script, compilationData) {
            return __awaiter(this, void 0, void 0, function () {
                var sourceHash, scriptHash, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            sourceHash = compilationData.sourceHash;
                            scriptHash = window.md5(script);
                            if (!(scriptHash !== sourceHash)) return [3, 2];
                            _a = {};
                            return [4, _compileScript(script)];
                        case 1: return [2, (_a.compiled = _b.sent(),
                                _a.sourceHash = scriptHash,
                                _a)];
                        case 2: return [2, compilationData];
                    }
                });
            });
        }
        function _captureTSDef() {
            window.module = {
                exports: {}
            };
            return Promise.resolve(function () {
                var ts = window.module && window.module.exports;
                window.ts = window.ts || ts;
                window.module = undefined;
            });
        }
        function _compileScript(script) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2, new window.Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, window.withAsync(_captureTSDef, function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4, CRMNodes.modules.Util.execFile('js/libraries/typescript.js')];
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
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
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
                        buildPageCRM();
                        return [4, CRMNodes.modules.MessageHandling.signalNewCRM()];
                    case 3:
                        _b.sent();
                        _a = toUpdate;
                        if (!_a) return [3, 5];
                        return [4, CRMNodes.modules.Storages.checkBackgroundPagesForChange({
                                toUpdate: toUpdate
                            })];
                    case 4:
                        _a = (_b.sent());
                        _b.label = 5;
                    case 5:
                        _a;
                        return [2];
                }
            });
        });
    }
    CRMNodes.updateCrm = updateCrm;
    function updateCRMValues() {
        return __awaiter(this, void 0, void 0, function () {
            var crmBefore, match;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crmBefore = JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm);
                        CRMNodes.modules.Util.crmForEach(CRMNodes.modules.storages.settingsStorage.crm, function (node) {
                            if (!node.id && node.id !== 0) {
                                node.id = CRMNodes.modules.Util.generateItemId();
                            }
                        });
                        match = crmBefore === JSON.stringify(CRMNodes.modules.storages.settingsStorage.crm);
                        CRMNodes.modules.crm.crmTree = CRMNodes.modules.storages.settingsStorage.crm;
                        CRMNodes.modules.crm.safeTree = _buildSafeTree(CRMNodes.modules.storages.settingsStorage.crm);
                        _buildNodePaths(CRMNodes.modules.crm.crmTree, []);
                        _buildByIdObjects();
                        if (!!match) return [3, 2];
                        return [4, CRMNodes.modules.Storages.uploadChanges('settings', [{
                                    key: 'crm',
                                    newValue: JSON.parse(JSON.stringify(CRMNodes.modules.crm.crmTree)),
                                    oldValue: {}
                                }])];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2];
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
        var copy = _createCopyFunction(node, newNode);
        copy([
            'id', 'path', 'type', 'name', 'value', 'linkVal',
            'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
            'triggers', 'onContentTypes', 'showOnSpecified'
        ]);
        return newNode;
    }
    CRMNodes.makeSafe = makeSafe;
    function buildPageCRM() {
        return new Promise(function (resolve) {
            var length = CRMNodes.modules.crm.crmTree.length;
            CRMNodes.modules.crmValues.stylesheetNodeStatusses = {};
            browserAPI.contextMenus.removeAll().then(function () {
                CRMNodes.modules.crmValues.rootId = browserAPI.contextMenus.create({
                    title: CRMNodes.modules.storages.settingsStorage.rootName || 'Custom Menu',
                    contexts: ['all']
                });
                CRMNodes.modules.toExecuteNodes = {
                    onUrl: {},
                    always: [],
                    documentStart: []
                };
                CRMNodes.modules.Util.promiseChain(CRMNodes.modules.Util.createArray(length).map(function (_item, i) {
                    return function () {
                        return new Promise(function (resolveInner) {
                            _buildPageCRMTree(CRMNodes.modules.crm.crmTree[i], CRMNodes.modules.crmValues.rootId, [i], CRMNodes.modules.crmValues.contextMenuItemTree).then(function (result) {
                                if (result) {
                                    CRMNodes.modules.crmValues.contextMenuItemTree[i] = {
                                        index: i,
                                        id: result.id,
                                        enabled: true,
                                        node: CRMNodes.modules.crm.crmTree[i],
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
                    if (CRMNodes.modules.storages.storageLocal.showOptions) {
                        browserAPI.contextMenus.create({
                            type: 'separator',
                            parentId: CRMNodes.modules.crmValues.rootId
                        });
                        browserAPI.contextMenus.create({
                            title: 'Options',
                            onclick: _createOptionsPageHandler(),
                            parentId: CRMNodes.modules.crmValues.rootId
                        });
                    }
                    resolve(null);
                });
            });
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
    function converToLegacy() {
        return __awaiter(this, void 0, void 0, function () {
            var arr, res, i, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        arr = _walkCRM(CRMNodes.modules.crm.crmTree, {
                            arr: []
                        }).arr;
                        res = {};
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < arr.length)) return [3, 4];
                        _a = res;
                        _b = i;
                        return [4, _convertNodeToLegacy(arr[i])];
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
    function _fixOptionsErrors(options) {
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
    CRMNodes._fixOptionsErrors = _fixOptionsErrors;
    function _convertNodeToLegacy(node) {
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
    function _walkCRM(crm, state) {
        for (var i = 0; i < crm.length; i++) {
            var node = crm[i];
            state.arr.push(node);
            if (node.type === 'menu' && node.children) {
                _walkCRM(node.children, state);
            }
        }
        return state;
    }
    function _createCopyFunction(obj, target) {
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
    function _buildNodePaths(tree, currentPath) {
        for (var i = 0; i < tree.length; i++) {
            var childPath = currentPath.concat([i]);
            var child = tree[i];
            child.path = childPath;
            if (child.children) {
                _buildNodePaths(child.children, childPath);
            }
        }
    }
    function _createOptionsPageHandler() {
        return function () {
            browserAPI.runtime.openOptionsPage();
        };
    }
    CRMNodes._createOptionsPageHandler = _createOptionsPageHandler;
    function _buildPageCRMTree(node, parentId, path, parentTree) {
        return __awaiter(this, void 0, void 0, function () {
            var id, children, visibleIndex, i, newPath, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, CRMNodes.NodeCreation.createNode(node, parentId)];
                    case 1:
                        id = _a.sent();
                        CRMNodes.modules.crmValues.contextMenuIds[node.id] = id;
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
                        return [4, _buildPageCRMTree(node.children[i], id, newPath, children)];
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
                        CRMNodes.modules.crmValues.contextMenuInfoById[id].path = path;
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
    function _parseNode(node, isSafe) {
        if (isSafe === void 0) { isSafe = false; }
        CRMNodes.modules.crm[isSafe ? 'crmByIdSafe' : 'crmById'][node.id] = (isSafe ? makeSafe(node) : node);
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                _parseNode(node.children[i], isSafe);
            }
        }
    }
    function _buildByIdObjects() {
        CRMNodes.modules.crm.crmById = {};
        CRMNodes.modules.crm.crmByIdSafe = {};
        for (var i = 0; i < CRMNodes.modules.crm.crmTree.length; i++) {
            _parseNode(CRMNodes.modules.crm.crmTree[i]);
            _parseNode(CRMNodes.modules.crm.safeTree[i], true);
        }
    }
    function _safeTreeParse(node) {
        if (node.children) {
            var children = [];
            for (var i = 0; i < node.children.length; i++) {
                children.push(_safeTreeParse(node.children[i]));
            }
            node.children = children;
        }
        return makeSafe(node);
    }
    function _buildSafeTree(crm) {
        var treeCopy = JSON.parse(JSON.stringify(crm));
        var safeBranch = [];
        for (var i = 0; i < treeCopy.length; i++) {
            safeBranch.push(_safeTreeParse(treeCopy[i]));
        }
        return safeBranch;
    }
})(CRMNodes = exports.CRMNodes || (exports.CRMNodes = {}));
