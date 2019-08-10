export var Global;
(function (Global) {
    function initModule(_modules) {
        Global.modules = _modules;
    }
    Global.initModule = initModule;
    Global.globals = {
        latestId: 0,
        storages: {
            insufficientPermissions: [],
            settingsStorage: null,
            nodeStorageSync: null,
            globalExcludes: null,
            resourceKeys: null,
            urlDataPairs: null,
            storageLocal: null,
            failedLookups: [],
            nodeStorage: null,
            resources: null
        },
        background: {
            byId: new window.Map()
        },
        crm: {
            crmTree: [],
            crmById: new window.Map(),
            safeTree: [],
            crmByIdSafe: new window.Map()
        },
        availablePermissions: [],
        crmValues: {
            tabData: new window.Map([[0, {
                        nodes: new window.Map(),
                        libraries: new window.Map()
                    }]]),
            rootId: null,
            contextMenuIds: new window.Map(),
            nodeInstances: new window.Map(),
            contextMenuInfoById: new window.Map(),
            contextMenuItemTree: [],
            userAddedContextMenus: [],
            userAddedContextMenusById: new window.Map(),
            contextMenuGlobalOverrides: new window.Map(),
            hideNodesOnPagesData: new window.Map(),
            nodeTabStatuses: new window.Map()
        },
        toExecuteNodes: {
            onUrl: {
                documentStart: [],
                documentEnd: []
            },
            always: {
                documentStart: [],
                documentEnd: []
            }
        },
        sendCallbackMessage: function (tabId, tabIndex, id, data) {
            var message = {
                type: (data.err ? 'error' : 'success'),
                data: (data.err ? data.errorMessage : data.args),
                callbackId: data.callbackId,
                messageType: 'callback'
            };
            var tabData = Global.globals.crmValues.tabData;
            try {
                Global.modules.Util.postMessage(tabData.get(tabId).nodes.get(id)[tabIndex].port, message);
            }
            catch (e) {
                if (e.message === 'Converting circular structure to JSON') {
                    message.data = 'Converting circular structure to JSON, ' +
                        'getting a response from this API will not work';
                    message.type = 'error';
                    Global.modules.Util.postMessage(tabData.get(tabId).nodes.get(id)[tabIndex].port, message);
                }
                else {
                    throw e;
                }
            }
        },
        eventListeners: {
            notificationListeners: new window.Map(),
            shortcutListeners: new window.Map(),
            scriptDebugListeners: []
        },
        logging: {
            filter: {
                id: null,
                tabId: null
            }
        },
        constants: {
            supportedHashes: ['sha1', 'sha256', 'sha384', 'sha512', 'md5'],
            validSchemes: ['http', 'https', 'file', 'ftp', '*'],
            templates: {
                mergeArrays: function (mainArray, additionArray) {
                    for (var i = 0; i < additionArray.length; i++) {
                        if (mainArray[i] &&
                            typeof additionArray[i] === 'object' &&
                            typeof mainArray[i] === 'object' &&
                            mainArray[i] !== undefined &&
                            mainArray[i] !== null) {
                            if (Array.isArray(additionArray[i])) {
                                mainArray[i] = this.mergeArrays(mainArray[i], additionArray[i]);
                            }
                            else {
                                mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
                            }
                        }
                        else {
                            mainArray[i] = additionArray[i];
                        }
                    }
                    return mainArray;
                },
                mergeObjects: function (mainObject, additions) {
                    for (var key in additions) {
                        if (additions.hasOwnProperty(key)) {
                            if (typeof additions[key] === 'object' &&
                                typeof mainObject[key] === 'object' &&
                                mainObject[key] !== undefined &&
                                mainObject[key] !== null) {
                                if (Array.isArray(additions[key])) {
                                    mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
                                }
                                else {
                                    mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
                                }
                            }
                            else {
                                mainObject[key] = additions[key];
                            }
                        }
                    }
                    return mainObject;
                },
                getDefaultNodeInfo: function (options) {
                    if (options === void 0) { options = {}; }
                    var defaultNodeInfo = {
                        permissions: [],
                        installDate: new Date().toLocaleDateString(),
                        lastUpdatedAt: Date.now(),
                        version: '1.0',
                        isRoot: false,
                        source: 'local'
                    };
                    return this.mergeObjects(defaultNodeInfo, options);
                },
                getDefaultLinkNode: function (options) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: 'My Link',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'link',
                        showOnSpecified: false,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        triggers: [{
                                url: '*://*.example.com/*',
                                not: false
                            }],
                        isLocal: false,
                        value: [{
                                newTab: true,
                                url: 'https://www.example.com'
                            }]
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                getDefaultStylesheetValue: function (options) {
                    if (options === void 0) { options = {}; }
                    var value = {
                        stylesheet: [].join('\n'),
                        launchMode: 0,
                        toggle: false,
                        defaultOn: false,
                        options: {},
                        convertedStylesheet: null
                    };
                    return this.mergeObjects(value, options);
                },
                getDefaultScriptValue: function (options) {
                    if (options === void 0) { options = {}; }
                    var value = {
                        launchMode: 0,
                        backgroundLibraries: [],
                        libraries: [],
                        script: [].join('\n'),
                        backgroundScript: '',
                        metaTags: {},
                        options: {},
                        ts: {
                            enabled: false,
                            backgroundScript: {},
                            script: {}
                        }
                    };
                    return this.mergeObjects(value, options);
                },
                getDefaultScriptNode: function (options) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: 'My Script',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'script',
                        isLocal: false,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        triggers: [{
                                url: '*://*.example.com/*',
                                not: false
                            }],
                        value: this.getDefaultScriptValue(options.value)
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                getDefaultStylesheetNode: function (options) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: 'My Stylesheet',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'stylesheet',
                        isLocal: true,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        triggers: [{
                                url: '*://*.example.com/*',
                                not: false
                            }],
                        value: this.getDefaultStylesheetValue(options.value)
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                getDefaultDividerOrMenuNode: function (options, type) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: "My " + (type[0].toUpperCase() + type.slice(1)),
                        type: type,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        onContentTypes: [true, true, true, false, false, false],
                        isLocal: true,
                        value: null,
                        showOnSpecified: true,
                        children: type === 'menu' ? [] : null,
                        permissions: []
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                getDefaultDividerNode: function (options) {
                    if (options === void 0) { options = {}; }
                    return this.getDefaultDividerOrMenuNode(options, 'divider');
                },
                getDefaultMenuNode: function (options) {
                    if (options === void 0) { options = {}; }
                    return this.getDefaultDividerOrMenuNode(options, 'menu');
                },
                globalObjectWrapperCode: function (name, wrapperName, chromeVal, browserVal, fromCache) {
                    if (fromCache === void 0) { fromCache = true; }
                    if (fromCache) {
                        return Global.modules.Caches.cacheCall(this.globalObjectWrapperCode, arguments);
                    }
                    return ("var " + wrapperName + " = (" + (function (REPLACE) {
                        var REPLACEWrapperName;
                        return (REPLACEWrapperName = (function () {
                            var tempWrapper = {};
                            var original = REPLACE.REPLACEName;
                            for (var prop in original) {
                                (function (prop) {
                                    if (prop !== 'webkitStorageInfo' && typeof original[prop] === 'function') {
                                        tempWrapper[prop] = function () {
                                            return original[prop].apply(original, arguments);
                                        };
                                    }
                                    else {
                                        Object.defineProperty(tempWrapper, prop, {
                                            get: function () {
                                                if (original[prop] === original) {
                                                    return tempWrapper;
                                                }
                                                else if (prop === 'crmAPI') {
                                                    return REPLACE.REPLACECrmAPI;
                                                }
                                                else if (prop === 'browser') {
                                                    return REPLACE.REPLACEBrowserVal;
                                                }
                                                else if (prop === 'chrome') {
                                                    return REPLACE.REPLACEChromeVal;
                                                }
                                                else {
                                                    return original[prop];
                                                }
                                            },
                                            set: function (value) {
                                                tempWrapper[prop] = value;
                                            }
                                        });
                                    }
                                })(prop);
                            }
                            return tempWrapper;
                        })());
                    }).toString()
                        .replace(/\w+.REPLACEName/g, name)
                        .replace(/\w+.REPLACEChromeVal/g, chromeVal)
                        .replace(/\w+.REPLACEBrowserVal/g, browserVal)
                        .replace(/\w+.REPLACECrmAPI/g, 'crmAPI')
                        .replace(/\var\s\w+;/g, "var " + wrapperName + ";")
                        .replace(/return \(\w+ = \(/g, "return (" + wrapperName + " = (") + ")()")
                        .replace(/\n/g, '');
                }
            },
            specialJSON: {
                _regexFlagNames: ['global', 'multiline', 'sticky', 'unicode', 'ignoreCase'],
                _getRegexFlags: function (expr) {
                    var flags = [];
                    this._regexFlagNames.forEach(function (flagName) {
                        if (expr[flagName]) {
                            if (flagName === 'sticky') {
                                flags.push('y');
                            }
                            else {
                                flags.push(flagName[0]);
                            }
                        }
                    });
                    return flags;
                },
                _stringifyNonObject: function (data) {
                    if (typeof data === 'function') {
                        var fn = data.toString();
                        var match = this._fnRegex.exec(fn);
                        data = "__fn$" + ("(" + match[2] + "){" + match[10] + "}") + "$fn__";
                    }
                    else if (data instanceof RegExp) {
                        data = "__regexp$" + JSON.stringify({
                            regexp: data.source,
                            flags: this._getRegexFlags(data)
                        }) + "$regexp__";
                    }
                    else if (data instanceof Date) {
                        data = "__date$" + (data + '') + "$date__";
                    }
                    else if (typeof data === 'string') {
                        data = data.replace(/\$/g, '\\$');
                    }
                    return JSON.stringify(data);
                },
                _fnRegex: /^(.|\s)*\(((\w+((\s*),?(\s*)))*)\)(\s*)(=>)?(\s*)\{((.|\n|\r)+)\}$/,
                _specialStringRegex: /^__(fn|regexp|date)\$((.|\n)+)\$\1__$/,
                _fnCommRegex: /^\(((\w+((\s*),?(\s*)))*)\)\{((.|\n|\r)+)\}$/,
                _parseNonObject: function (data) {
                    var dataParsed = JSON.parse(data);
                    if (typeof dataParsed === 'string') {
                        var matchedData = void 0;
                        if ((matchedData = this._specialStringRegex.exec(dataParsed))) {
                            var dataContent = matchedData[2];
                            switch (matchedData[1]) {
                                case 'fn':
                                    var fnRegexed = this._fnCommRegex.exec(dataContent);
                                    if (fnRegexed[1].trim() !== '') {
                                        return Function.apply(void 0, fnRegexed[1].split(',').concat([fnRegexed[6]]));
                                    }
                                    else {
                                        return new Function(fnRegexed[6]);
                                    }
                                case 'regexp':
                                    var regExpParsed = JSON.parse(dataContent);
                                    return new RegExp(regExpParsed.regexp, regExpParsed.flags.join(''));
                                case 'date':
                                    return new Date();
                            }
                        }
                        else {
                            return dataParsed.replace(/\\\$/g, '$');
                        }
                    }
                    return dataParsed;
                },
                _iterate: function (copyTarget, iterable, fn) {
                    if (Array.isArray(iterable)) {
                        copyTarget = copyTarget || [];
                        iterable.forEach(function (data, key, container) {
                            copyTarget[key] = fn(data, key, container);
                        });
                    }
                    else {
                        copyTarget = copyTarget || {};
                        Object.getOwnPropertyNames(iterable).forEach(function (key) {
                            copyTarget[key] = fn(iterable[key], key, iterable);
                        });
                    }
                    return copyTarget;
                },
                _isObject: function (data) {
                    if (data instanceof Date || data instanceof RegExp || data instanceof Function) {
                        return false;
                    }
                    return typeof data === 'object' && !Array.isArray(data);
                },
                _toJSON: function (copyTarget, data, path, refData) {
                    var _this = this;
                    if (!(this._isObject(data) || Array.isArray(data))) {
                        return {
                            refs: [],
                            data: this._stringifyNonObject(data),
                            rootType: 'normal'
                        };
                    }
                    else {
                        if (refData.originalValues.indexOf(data) === -1) {
                            var index = refData.refs.length;
                            refData.refs[index] = copyTarget;
                            refData.paths[index] = path;
                            refData.originalValues[index] = data;
                        }
                        copyTarget = this._iterate(copyTarget, data, function (element, key) {
                            if (!(_this._isObject(element) || Array.isArray(element))) {
                                return _this._stringifyNonObject(element);
                            }
                            else {
                                var index = void 0;
                                if ((index = refData.originalValues.indexOf(element)) === -1) {
                                    index = refData.refs.length;
                                    copyTarget = (Array.isArray(element) ? [] : {});
                                    refData.refs.push(null);
                                    refData.paths[index] = path;
                                    var newData = _this._toJSON(copyTarget[key], element, path.concat(key), refData);
                                    refData.refs[index] = newData.data;
                                    refData.originalValues[index] = element;
                                }
                                return "__$" + index + "$__";
                            }
                        });
                        var isArr = Array.isArray(data);
                        if (isArr) {
                            return {
                                refs: refData.refs,
                                data: copyTarget,
                                rootType: 'array'
                            };
                        }
                        else {
                            return {
                                refs: refData.refs,
                                data: copyTarget,
                                rootType: 'object'
                            };
                        }
                    }
                },
                toJSON: function (data, refs) {
                    var _this = this;
                    if (refs === void 0) { refs = []; }
                    var paths = [[]];
                    var originalValues = [data];
                    if (!(this._isObject(data) || Array.isArray(data))) {
                        return JSON.stringify({
                            refs: [],
                            data: this._stringifyNonObject(data),
                            rootType: 'normal',
                            paths: []
                        });
                    }
                    else {
                        var copyTarget_1 = (Array.isArray(data) ? [] : {});
                        refs.push(copyTarget_1);
                        copyTarget_1 = this._iterate(copyTarget_1, data, function (element, key) {
                            if (!(_this._isObject(element) || Array.isArray(element))) {
                                return _this._stringifyNonObject(element);
                            }
                            else {
                                var index = void 0;
                                if ((index = originalValues.indexOf(element)) === -1) {
                                    index = refs.length;
                                    refs.push(null);
                                    var newData = _this._toJSON(copyTarget_1[key], element, [key], {
                                        refs: refs,
                                        paths: paths,
                                        originalValues: originalValues
                                    }).data;
                                    originalValues[index] = element;
                                    paths[index] = [key];
                                    refs[index] = newData;
                                }
                                return "__$" + index + "$__";
                            }
                        });
                        return JSON.stringify({
                            refs: refs,
                            data: copyTarget_1,
                            rootType: Array.isArray(data) ? 'array' : 'object',
                            paths: paths
                        });
                    }
                },
                _refRegex: /^__\$(\d+)\$__$/,
                _replaceRefs: function (data, refs) {
                    var _this = this;
                    this._iterate(data, data, function (element) {
                        var match;
                        if ((match = _this._refRegex.exec(element))) {
                            var refNumber = match[1];
                            var ref = refs[~~refNumber];
                            if (ref.parsed) {
                                return ref.ref;
                            }
                            ref.parsed = true;
                            return _this._replaceRefs(ref.ref, refs);
                        }
                        else {
                            return _this._parseNonObject(element);
                        }
                    });
                    return data;
                },
                fromJSON: function (str) {
                    var parsed = JSON.parse(str);
                    parsed.refs = parsed.refs.map(function (ref) {
                        return {
                            ref: ref,
                            parsed: false
                        };
                    });
                    var refs = parsed.refs;
                    if (parsed.rootType === 'normal') {
                        return JSON.parse(parsed.data);
                    }
                    refs[0].parsed = true;
                    return this._replaceRefs(refs[0].ref, refs);
                }
            },
            contexts: ['page', 'link', 'selection', 'image', 'video', 'audio'],
            permissions: [
                'alarms',
                'activeTab',
                'background',
                'bookmarks',
                'browsingData',
                'clipboardRead',
                'clipboardWrite',
                'contentSettings',
                'cookies',
                'contentSettings',
                'contextMenus',
                'declarativeContent',
                'desktopCapture',
                'downloads',
                'history',
                'identity',
                'idle',
                'management',
                'notifications',
                'pageCapture',
                'power',
                'printerProvider',
                'privacy',
                'sessions',
                'system.cpu',
                'system.memory',
                'system.storage',
                'tabs',
                'topSites',
                'tabCapture',
                'tts',
                'webNavigation',
                'webRequest',
                'webRequestBlocking'
            ],
            tamperMonkeyExtensions: [
                'gcalenpjmijncebpfijmoaglllgpjagf',
                'dhdgffkkebhmkfjojejmpbldmpobfkfo',
                'a1ec3820-68cb-430c-8870-2c07ecc68ff6',
                '7b7e1485-191d-4cb7-91d9-b6121c1157fe',
                '23c311a8-060b-422e-a46e-80dd73308a3b'
            ],
            stylishExtensions: [
                'fjnbnpbmkenffdnngjfgmeleoegfcffe',
                '220fd736-2425-4d0a-aa36-6015937215f1'
            ]
        },
        listeners: {
            idVals: [],
            tabVals: [],
            ids: [],
            tabs: [],
            log: []
        }
    };
})(Global || (Global = {}));
;
