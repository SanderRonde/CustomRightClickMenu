/// <reference path="../../tools/definitions/chrome.d.ts"/>
/// <reference path="../../tools/definitions/specialJSON.d.ts" />
/// <reference path="../../tools/definitions/crm.d.ts" />
/// <reference path="../../node_modules/@types/node/index.d.ts" />
;
window.isDev = chrome.runtime.getManifest().short_name.indexOf('dev') > -1;
(function (extensionId, globalObject, sandboxes) {
    //#region Global Variables
    globalObject.globals = {
        latestId: 0,
        storages: {
            settingsStorage: null,
            globalExcludes: null,
            resourceKeys: null,
            urlDataPairs: null,
            storageLocal: null,
            nodeStorage: null,
            resources: null
        },
        background: {
            workers: [],
            byId: {}
        },
        crm: {
            crmTree: [],
            crmById: {},
            safeTree: [],
            crmByIdSafe: {}
        },
        keys: {},
        availablePermissions: [],
        crmValues: {
            tabData: {
                0: {
                    nodes: {},
                    libraries: {}
                }
            },
            rootId: null,
            contextMenuIds: {},
            nodeInstances: {},
            contextMenuInfoById: {},
            contextMenuItemTree: [],
            hideNodesOnPagesData: {},
            stylesheetNodeStatusses: {}
        },
        toExecuteNodes: {
            onUrl: {},
            always: []
        },
        sendCallbackMessage: function (tabId, id, data) {
            var message = {
                type: (data.err ? 'error' : 'success'),
                data: (data.err ? data.errorMessage : data.args),
                callbackId: data.callbackId,
                messageType: 'callback'
            };
            try {
                globalObject.globals.crmValues.tabData[tabId].nodes[id].port
                    .postMessage(message);
            }
            catch (e) {
                if (e.message === 'Converting circular structure to JSON') {
                    message.data =
                        'Converting circular structure to JSON, getting a response from this API will not work';
                    message.type = 'error';
                    globalObject.globals.crmValues.tabData[tabId].nodes[id].port
                        .postMessage(message);
                }
                else {
                    throw e;
                }
            }
        },
        notificationListeners: {},
        scriptInstallListeners: {},
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
                        source: {
                            author: (globalObject.globals.storages.storageLocal &&
                                globalObject.globals.storages.storageLocal.authorName) || 'anonymous'
                        },
                    };
                    return this.mergeObjects(defaultNodeInfo, options);
                },
                getDefaultLinkNode: function (options) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: 'name',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'link',
                        showOnSpecified: false,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        triggers: [
                            {
                                url: '*://*.example.com/*',
                                not: false
                            }
                        ],
                        isLocal: true,
                        value: [
                            {
                                newTab: true,
                                url: 'https://www.example.com'
                            }
                        ]
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                getDefaultStylesheetValue: function (options) {
                    if (options === void 0) { options = {}; }
                    var value = {
                        stylesheet: [
                            '// ==UserScript==',
                            '// @name	name',
                            '// @CRM_contentTypes	[true, true, true, false, false, false]',
                            '// @CRM_launchMode	0',
                            '// @CRM_stylesheet	true',
                            '// @grant	none',
                            '// @match	*://*.example.com/*',
                            '// ==/UserScript=='
                        ].join('\n'),
                        launchMode: 1 /* ALWAYS_RUN */,
                        toggle: false,
                        defaultOn: false
                    };
                    return this.mergeObjects(value, options);
                },
                getDefaultScriptValue: function (options) {
                    if (options === void 0) { options = {}; }
                    var value = {
                        launchMode: 1 /* ALWAYS_RUN */,
                        backgroundLibraries: [],
                        libraries: [],
                        script: [
                            '// ==UserScript==',
                            '// @name	name',
                            '// @CRM_contentTypes	[true, true, true, false, false, false]',
                            '// @CRM_launchMode	0',
                            '// @grant	none',
                            '// @match	*://*.example.com/*',
                            '// ==/UserScript=='
                        ].join('\n'),
                        backgroundScript: '',
                        metaTags: {}
                    };
                    return this.mergeObjects(value, options);
                },
                getDefaultScriptNode: function (options) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: 'name',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'script',
                        isLocal: true,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        triggers: [
                            {
                                url: '*://*.example.com/*',
                                not: false
                            }
                        ],
                        value: this.getDefaultScriptValue(options.value)
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                getDefaultStylesheetNode: function (options) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: 'name',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'stylesheet',
                        isLocal: true,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        triggers: [
                            {
                                url: '*://*.example.com/*',
                                not: false
                            }
                        ],
                        value: this.getDefaultStylesheetValue(options.value)
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                getDefaultDividerOrMenuNode: function (options, type) {
                    if (options === void 0) { options = {}; }
                    var defaultNode = {
                        name: 'name',
                        type: type,
                        nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
                        onContentTypes: [true, true, true, false, false, false],
                        isLocal: true,
                        value: null
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
                                        return new Function(fnRegexed[1].split(','), fnRegexed[6]);
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
                                    //Filler
                                    refData.refs.push(null);
                                    refData.paths[index] = path;
                                    var newData = _this._toJSON(copyTarget[key], element, path.concat(key), refData);
                                    refData.refs[index] = newData.data;
                                    refData.originalValues[index] = element;
                                }
                                return "__$" + index + "$__";
                            }
                        });
                        return {
                            refs: refData.refs,
                            data: copyTarget,
                            rootType: Array.isArray(data) ? 'array' : 'object'
                        };
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
                                    //Filler
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
                'background',
                'bookmarks',
                'browsingData',
                'clipboardRead',
                'clipboardWrite',
                'contentSettings',
                'cookies',
                'contentSettings',
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
                'topSites',
                'tabCapture',
                'tts',
                'webNavigation',
                'webRequest',
                'webRequestBlocking'
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
    window.logging = globalObject.globals.logging;
    var Helpers = (function () {
        function Helpers() {
        }
        Helpers.compareArray = function (firstArray, secondArray) {
            if (!firstArray && !secondArray) {
                return false;
            }
            else if (!firstArray || !secondArray) {
                return true;
            }
            var firstLength = firstArray.length;
            if (firstLength !== secondArray.length) {
                return false;
            }
            for (var i = 0; i < firstLength; i++) {
                if (typeof firstArray[i] === 'object') {
                    if (typeof secondArray[i] !== 'object') {
                        return false;
                    }
                    if (Array.isArray(firstArray[i])) {
                        if (!Array.isArray(secondArray[i])) {
                            return false;
                        }
                        if (!this.compareArray(firstArray[i], secondArray[i])) {
                            return false;
                        }
                    }
                    else if (!this._compareObj(firstArray[i], secondArray[i])) {
                        return false;
                    }
                }
                else if (firstArray[i] !== secondArray[i]) {
                    return false;
                }
            }
            return true;
        };
        Helpers.safe = function (node) {
            return globalObject.globals.crm.crmByIdSafe[node.id];
        };
        Helpers.createSecretKey = function () {
            var key = [];
            for (var i = 0; i < 25; i++) {
                key[i] = Math.round(Math.random() * 100);
            }
            if (!globalObject.globals.keys[key.join(',')]) {
                globalObject.globals.keys[key.join(',')] = true;
                return key;
            }
            else {
                return this.createSecretKey();
            }
        };
        Helpers.generateItemId = function () {
            globalObject.globals.latestId = globalObject.globals.latestId || 0;
            globalObject.globals.latestId++;
            chrome.storage.local.set({
                latestId: globalObject.globals.latestId
            });
            return globalObject.globals.latestId;
        };
        Helpers.convertFileToDataURI = function (url, callback, onError) {
            var xhr = new window.XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function () {
                var readerResults = [null, null];
                var blobReader = new FileReader();
                blobReader.onloadend = function () {
                    readerResults[0] = blobReader.result;
                    if (readerResults[1]) {
                        callback(readerResults[0], readerResults[1]);
                    }
                };
                blobReader.readAsDataURL(xhr.response);
                var textReader = new FileReader();
                textReader.onloadend = function () {
                    readerResults[1] = textReader.result;
                    if (readerResults[0]) {
                        callback(readerResults[0], readerResults[1]);
                    }
                };
                textReader.readAsText(xhr.response);
            };
            if (onError) {
                xhr.onerror = onError;
            }
            xhr.open('GET', url);
            xhr.send();
        };
        Helpers.isNewer = function (newVersion, oldVersion) {
            var newSplit = newVersion.split('.');
            var oldSplit = oldVersion.split('.');
            var longest = (newSplit.length > oldSplit.length ?
                newSplit.length :
                oldSplit.length);
            for (var i = 0; i < longest; i++) {
                var newNum = ~~newSplit[i];
                var oldNum = ~~oldSplit[i];
                if (newNum > oldNum) {
                    return true;
                }
                else if (newNum < oldNum) {
                    return false;
                }
            }
            return false;
        };
        Helpers.pushIntoArray = function (toPush, position, target) {
            if (position === target.length) {
                target[position] = toPush;
            }
            else {
                var length_1 = target.length + 1;
                var temp1 = target[position];
                var temp2 = toPush;
                for (var i = position; i < length_1; i++) {
                    target[i] = temp2;
                    temp2 = temp1;
                    temp1 = target[i + 1];
                }
            }
            return target;
        };
        Helpers.flattenCrm = function (searchScope, obj) {
            searchScope.push(obj);
            if (obj.type === 'menu' && obj.children) {
                obj.children.forEach(function (child) {
                    this.flattenCrm(searchScope, child);
                });
            }
        };
        Helpers.checkForChromeErrors = function (log) {
            if (chrome.runtime.lastError && log) {
                console.log('chrome runtime error', chrome.runtime.lastError);
            }
        };
        Helpers.removeTab = function (tabId) {
            var nodeStatusses = globalObject.globals.crmValues.stylesheetNodeStatusses;
            for (var nodeId in nodeStatusses) {
                if (nodeStatusses.hasOwnProperty(nodeId)) {
                    if (nodeStatusses[nodeId][tabId]) {
                        delete nodeStatusses[nodeId][tabId];
                    }
                }
            }
            delete globalObject.globals.crmValues.tabData[tabId];
        };
        Helpers._compareObj = function (firstObj, secondObj) {
            for (var key in firstObj) {
                if (firstObj.hasOwnProperty(key) && firstObj[key] !== undefined) {
                    if (typeof firstObj[key] === 'object') {
                        if (typeof secondObj[key] !== 'object') {
                            return false;
                        }
                        if (Array.isArray(firstObj[key])) {
                            if (!Array.isArray(secondObj[key])) {
                                return false;
                            }
                            if (!this.compareArray(firstObj[key], secondObj[key])) {
                                return false;
                            }
                        }
                        else if (!this._compareObj(firstObj[key], secondObj[key])) {
                            return false;
                        }
                    }
                    else if (firstObj[key] !== secondObj[key]) {
                        return false;
                    }
                }
            }
            return true;
        };
        return Helpers;
    }());
    /**
     * JSONfn - javascript (both node.js and browser) plugin to stringify,
     *          parse and clone objects with Functions, Regexp and Date.
     *
     * Version - 0.60.00
     * Copyright (c) 2012 - 2014 Vadim Kiryukhin
     * vkiryukhin @ gmail.com
     * http://www.eslinstructor.net/jsonfn/
     *
     * Licensed under the MIT license ( http://www.opensource.org/licenses/mit-license.php )
     */
    Helpers.jsonFn = {
        stringify: function (obj) {
            return JSON.stringify(obj, function (key, value) {
                if (value instanceof Function || typeof value === 'function') {
                    return value.toString();
                }
                if (value instanceof RegExp) {
                    return '_PxEgEr_' + value;
                }
                return value;
            });
        },
        parse: function (str, date2Obj) {
            var iso8061 = date2Obj ?
                /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ :
                false;
            return JSON.parse(str, function (key, value) {
                if (typeof value !== 'string') {
                    return value;
                }
                if (value.length < 8) {
                    return value;
                }
                var prefix = value.substring(0, 8);
                if (iso8061 && value.match(iso8061)) {
                    return new Date(value);
                }
                if (prefix === 'function') {
                    return eval("(" + value + ")");
                }
                if (prefix === '_PxEgEr_') {
                    return eval(value.slice(8));
                }
                return value;
            });
        }
    };
    var GlobalDeclarations = (function () {
        function GlobalDeclarations() {
        }
        GlobalDeclarations.initGlobalFunctions = function () {
            window.getID = function (name) {
                name = name.toLocaleLowerCase();
                var matches = [];
                for (var id in globalObject.globals.crm.crmById) {
                    if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
                        var node = globalObject.globals.crm.crmById[id];
                        var nodeName = node.name;
                        if (node.type === 'script' &&
                            typeof nodeName === 'string' &&
                            name === nodeName.toLocaleLowerCase()) {
                            matches.push({
                                id: id,
                                node: node
                            });
                        }
                    }
                }
                if (matches.length === 0) {
                    console.log('Unfortunately no matches were found, please try again');
                }
                else if (matches.length === 1) {
                    console.log('One match was found, the id is ', matches[0].id, ' and the script is ', matches[0].node);
                }
                else {
                    console.log('Found multipe matches, here they are:');
                    matches.forEach(function (match) {
                        console.log('Id is', match.id, ', script is', match.node);
                    });
                }
            };
            window.filter = function (nodeId, tabId) {
                globalObject.globals.logging.filter = {
                    id: ~~nodeId,
                    tabId: tabId !== undefined ? ~~tabId : null
                };
            };
            window._listenIds = function (listener) {
                listener(Logging.Listeners.updateTabAndIdLists(true).ids);
                globalObject.globals.listeners.ids.push(listener);
            };
            window._listenTabs = function (listener) {
                listener(Logging.Listeners.updateTabAndIdLists(true).tabs);
                globalObject.globals.listeners.tabs.push(listener);
            };
            function sortMessages(messages) {
                return messages.sort(function (a, b) {
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                });
            }
            function filterMessageText(messages, filter) {
                if (filter === '') {
                    return messages;
                }
                var filterRegex = new RegExp(filter);
                return messages.filter(function (message) {
                    for (var i = 0; i < message.data.length; i++) {
                        if (typeof message.data[i] !== 'function' &&
                            typeof message.data[i] !== 'object') {
                            if (filterRegex.test(String(message.data[i]))) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
            }
            function getLog(id, tab, text) {
                var messages = [];
                if (id === 'all') {
                    for (var nodeId in globalObject.globals.logging) {
                        if (globalObject.globals.logging.hasOwnProperty(nodeId) &&
                            nodeId !== 'filter') {
                            messages = messages.concat(globalObject.globals.logging[nodeId].logMessages);
                        }
                    }
                }
                else {
                    messages = globalObject.globals.logging[id].logMessages || [];
                }
                if (tab === 'all') {
                    return sortMessages(filterMessageText(messages, text));
                }
                else {
                    return sortMessages(filterMessageText(messages.filter(function (message) {
                        return message.tabId === tab;
                    }), text));
                }
            }
            function updateLog(id, tab, textFilter) {
                if (id === 'ALL' || id === 0) {
                    this.id = 'all';
                }
                else {
                    this.id = id;
                }
                if (tab === 'ALL' || tab === 0) {
                    this.tab = 'all';
                }
                else if (typeof tab === 'string' && tab.toLowerCase() === 'background') {
                    this.tab = 0;
                }
                else {
                    this.tab = tab;
                }
                if (!textFilter) {
                    this.text = '';
                }
                else {
                    this.text = textFilter;
                }
                return getLog(this.id, this.tab, this.text);
            }
            window._listenLog = function (listener, callback) {
                var filterObj = {
                    id: 'all',
                    tab: 'all',
                    text: '',
                    listener: listener,
                    update: function (id, tab, textFilter) {
                        return updateLog.apply(this, [id, tab, textFilter]);
                    },
                    index: globalObject.globals.listeners.log.length
                };
                callback(filterObj);
                globalObject.globals.listeners.log.push(filterObj);
                return getLog('all', 'all', '');
            };
            function checkJobs(jobs, oldResults, onDone) {
                if (jobs[0].finished) {
                    return;
                }
                for (var i = 0; i < jobs.length; i++) {
                    if (jobs[i].done === false) {
                        return;
                    }
                }
                jobs[0].finished = true;
                var newResults = jobs
                    .map(function (job) { return job.result; })
                    .filter(function (jobResult) { return !!jobResult; });
                //Preserve === equality if nothing changed
                if (JSON.stringify(newResults) === JSON.stringify(oldResults)) {
                    onDone(oldResults);
                }
                else {
                    onDone(newResults);
                }
            }
            window._getIdCurrentTabs = function (id, currentTabs, callback) {
                var jobs = [];
                var tabData = globalObject.globals.crmValues.tabData;
                var _loop_1 = function (tabId) {
                    if (tabData.hasOwnProperty(tabId)) {
                        if (tabData[tabId].nodes[id] || id === 0) {
                            if (tabId === '0') {
                                jobs.push({
                                    done: true,
                                    result: {
                                        id: 'background',
                                        title: 'background'
                                    }
                                });
                            }
                            else {
                                var index_1 = jobs.length;
                                jobs.push({
                                    done: false
                                });
                                chrome.tabs.get(~~tabId, function (tab) {
                                    if (chrome.runtime.lastError) {
                                        //Tab does not exist, remove it from tabData
                                        Helpers.removeTab(~~tabId);
                                        return;
                                    }
                                    jobs[index_1].done = true;
                                    jobs[index_1].result = ({
                                        id: ~~tabId,
                                        title: tab.title
                                    });
                                    checkJobs(jobs, currentTabs, callback);
                                });
                            }
                        }
                    }
                };
                for (var tabId in tabData) {
                    _loop_1(tabId);
                }
                checkJobs(jobs, currentTabs, callback);
            };
        };
        GlobalDeclarations.refreshPermissions = function () {
            chrome.permissions.getAll(function (available) {
                globalObject.globals.availablePermissions = available.permissions;
            });
        };
        GlobalDeclarations.setHandlerFunction = function () {
            window.createHandlerFunction = function (port) {
                return function (message) {
                    var tabNodeData = globalObject.globals.crmValues.tabData[message.tabId]
                        .nodes[message.id];
                    if (!tabNodeData.port) {
                        if (Helpers.compareArray(tabNodeData.secretKey, message.key)) {
                            delete tabNodeData.secretKey;
                            tabNodeData.port = port;
                            if (!globalObject.globals.crmValues.nodeInstances[message.id]) {
                                globalObject.globals.crmValues.nodeInstances[message.id] = {};
                            }
                            var instancesArr = [];
                            for (var instance in globalObject.globals.crmValues.nodeInstances[message
                                .id]) {
                                if (globalObject.globals.crmValues.nodeInstances[message.id]
                                    .hasOwnProperty(instance) &&
                                    globalObject.globals.crmValues.nodeInstances[message.id][instance]) {
                                    try {
                                        globalObject.globals.crmValues.tabData[instance].nodes[message.id].port
                                            .postMessage({
                                            change: {
                                                type: 'added',
                                                value: message.tabId
                                            },
                                            messageType: 'instancesUpdate'
                                        });
                                        instancesArr.push(instance);
                                    }
                                    catch (e) {
                                        delete globalObject.globals.crmValues.nodeInstances[message
                                            .id][instance];
                                    }
                                }
                            }
                            globalObject.globals.crmValues.nodeInstances[message.id][message
                                .tabId] = {
                                hasHandler: false
                            };
                            port.postMessage({
                                data: 'connected',
                                instances: instancesArr
                            });
                        }
                    }
                    else {
                        MessageHandling.handleCrmAPIMessage(message);
                    }
                };
            };
        };
        GlobalDeclarations.init = function () {
            var _this = this;
            function removeNode(node) {
                chrome.contextMenus.remove(node.id, function () {
                    Helpers.checkForChromeErrors(false);
                });
            }
            function setStatusForTree(tree, enabled) {
                for (var i = 0; i < tree.length; i++) {
                    tree[i].enabled = enabled;
                    if (tree[i].children) {
                        setStatusForTree(tree[i].children, enabled);
                    }
                }
            }
            function getFirstRowChange(row, changes) {
                for (var i = 0; i < row.length; i++) {
                    if (row[i] && changes[row[i].id]) {
                        return i;
                    }
                }
                return Infinity;
            }
            function reCreateNode(parentId, node, changes) {
                var oldId = node.id;
                node.enabled = true;
                var settings = globalObject.globals.crmValues.contextMenuInfoById[node
                    .id]
                    .settings;
                if (node.node.type === 'stylesheet' && node.node.value.toggle) {
                    settings.checked = node.node.value.defaultOn;
                }
                settings.parentId = parentId;
                //This is added by chrome to the object during/after creation so delete it manually
                delete settings.generatedId;
                var id = chrome.contextMenus.create(settings);
                //Update ID
                node.id = id;
                globalObject.globals.crmValues.contextMenuIds[node.node.id] = id;
                globalObject.globals.crmValues.contextMenuInfoById[id] = globalObject
                    .globals
                    .crmValues.contextMenuInfoById[oldId];
                globalObject.globals.crmValues.contextMenuInfoById[oldId] = undefined;
                globalObject.globals.crmValues.contextMenuInfoById[id].enabled = true;
                if (node.children) {
                    buildSubTreeFromNothing(id, node.children, changes);
                }
            }
            function buildSubTreeFromNothing(parentId, tree, changes) {
                for (var i = 0; i < tree.length; i++) {
                    if ((changes[tree[i].id] && changes[tree[i].id].type === 'show') ||
                        !changes[tree[i].id]) {
                        reCreateNode(parentId, tree[i], changes);
                    }
                    else {
                        globalObject.globals.crmValues.contextMenuInfoById[tree[i].id]
                            .enabled = false;
                    }
                }
            }
            function applyNodeChangesOntree(parentId, tree, changes) {
                //Remove all nodes below it and re-enable them and its children
                //Remove all nodes below it and store them
                var firstChangeIndex = getFirstRowChange(tree, changes);
                if (firstChangeIndex < tree.length) {
                    for (var i = 0; i < firstChangeIndex; i++) {
                        //Normally check its children
                        if (tree[i].children && tree[i].children.length > 0) {
                            applyNodeChangesOntree(tree[i].id, tree[i].children, changes);
                        }
                    }
                }
                for (var i = firstChangeIndex; i < tree.length; i++) {
                    if (changes[tree[i].id]) {
                        if (changes[tree[i].id].type === 'hide') {
                            //Don't check its children, just remove it
                            removeNode(tree[i]);
                            //Set it and its children's status to hidden
                            tree[i].enabled = false;
                            if (tree[i].children) {
                                setStatusForTree(tree[i].children, false);
                            }
                        }
                        else {
                            //Remove every node after it and show them again
                            var enableAfter = [tree[i]];
                            for (var j = i + 1; j < tree.length; j++) {
                                if (changes[tree[j].id]) {
                                    if (changes[tree[j].id].type === 'hide') {
                                        removeNode(tree[j]);
                                        globalObject.globals.crmValues.contextMenuItemTree[tree[j].id]
                                            .enabled = false;
                                    }
                                    else {
                                        enableAfter.push(tree[j]);
                                    }
                                }
                                else if (tree[j].enabled) {
                                    enableAfter.push(tree[j]);
                                    removeNode(tree[j]);
                                }
                            }
                            for (var j = 0; j < enableAfter.length; j++) {
                                reCreateNode(parentId, enableAfter[j], changes);
                            }
                        }
                    }
                }
            }
            function getNodeStatusses(subtree, hiddenNodes, shownNodes) {
                for (var i = 0; i < subtree.length; i++) {
                    if (subtree[i]) {
                        (subtree[i].enabled ? shownNodes : hiddenNodes).push(subtree[i]);
                        getNodeStatusses(subtree[i].children, hiddenNodes, shownNodes);
                    }
                }
            }
            function tabChangeListener(changeInfo) {
                //Horrible workaround that allows the hiding of nodes on certain url's that
                //	surprisingly only takes ~1-2ms per tab switch.
                var currentTabId = changeInfo.tabIds[changeInfo.tabIds.length - 1];
                chrome.tabs.get(currentTabId, function (tab) {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError.message);
                        return;
                    }
                    //Show/remove nodes based on current URL
                    var toHide = [];
                    var toEnable = [];
                    var changes = {};
                    var shownNodes = [];
                    var hiddenNodes = [];
                    getNodeStatusses(globalObject.globals.crmValues.contextMenuItemTree, hiddenNodes, shownNodes);
                    //Find nodes to enable
                    var hideOn;
                    for (var i = 0; i < hiddenNodes.length; i++) {
                        hideOn = globalObject.globals.crmValues
                            .hideNodesOnPagesData[hiddenNodes[i]
                            .node.id];
                        if (!hideOn || !URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
                            //Don't hide on current url
                            toEnable.push({
                                node: hiddenNodes[i].node,
                                id: hiddenNodes[i].id
                            });
                        }
                    }
                    //Find nodes to hide
                    for (var i = 0; i < shownNodes.length; i++) {
                        hideOn = globalObject.globals.crmValues
                            .hideNodesOnPagesData[shownNodes[i]
                            .node.id];
                        if (hideOn) {
                            if (URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
                                //Don't hide on current url
                                toHide.push({
                                    node: shownNodes[i].node,
                                    id: shownNodes[i].id
                                });
                            }
                        }
                    }
                    //Re-check if the toEnable nodes might be disabled after all
                    var length = toEnable.length;
                    for (var i = 0; i < length; i++) {
                        hideOn = globalObject.globals.crmValues.hideNodesOnPagesData[toEnable[i]
                            .node.id];
                        if (hideOn) {
                            if (URLParsing.matchesUrlSchemes(hideOn, tab.url)) {
                                //Don't hide on current url
                                toEnable.splice(i, 1);
                                length--;
                                i--;
                            }
                        }
                    }
                    for (var i = 0; i < toHide.length; i++) {
                        changes[toHide[i].id] = {
                            node: toHide[i].node,
                            type: 'hide'
                        };
                    }
                    for (var i = 0; i < toEnable.length; i++) {
                        changes[toEnable[i].id] = {
                            node: toEnable[i].node,
                            type: 'show'
                        };
                    }
                    //Apply changes
                    applyNodeChangesOntree(globalObject.globals.crmValues.rootId, globalObject
                        .globals.crmValues.contextMenuItemTree, changes);
                });
                var statuses = globalObject.globals.crmValues.stylesheetNodeStatusses;
                function checkForRuntimeErrors() {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError);
                    }
                }
                for (var nodeId in statuses) {
                    if (statuses.hasOwnProperty(nodeId) && statuses[nodeId]) {
                        chrome.contextMenus.update(globalObject.globals.crmValues
                            .contextMenuIds[nodeId], {
                            checked: typeof statuses[nodeId][currentTabId] !== 'boolean' ?
                                statuses[nodeId].defaultValue :
                                statuses[nodeId][currentTabId]
                        }, checkForRuntimeErrors);
                    }
                }
            }
            chrome.tabs.onHighlighted.addListener(tabChangeListener);
            chrome.storage.local.get(function (storageLocal) {
                globalObject.globals.latestId = storageLocal['latestId'] || 0;
            });
            chrome.storage.onChanged.addListener(function (changes, areaName) {
                if (areaName === 'local' && changes['latestId']) {
                    var highest = changes['latestId']
                        .newValue >
                        changes['latestId'].oldValue ?
                        changes['latestId'].newValue :
                        changes['latestId'].oldValue;
                    globalObject.globals.latestId = highest;
                }
            });
            chrome.webRequest.onBeforeRequest.addListener(function (details) {
                var split = details.url
                    .split("chrome-extension://" + extensionId + "/resource/")[1].split('/');
                var name = split[0];
                var scriptId = ~~split[1];
                return {
                    redirectUrl: _this.getResourceData(name, scriptId)
                };
            }, {
                urls: ["chrome-extension://" + extensionId + "/resource/*"]
            }, ['blocking']);
            chrome.tabs.onRemoved.addListener(function (tabId) {
                //Delete all data for this tabId
                for (var node in globalObject.globals.crmValues.stylesheetNodeStatusses) {
                    if (globalObject.globals.crmValues.stylesheetNodeStatusses
                        .hasOwnProperty(node) &&
                        globalObject.globals.crmValues.stylesheetNodeStatusses[node]) {
                        globalObject.globals.crmValues
                            .stylesheetNodeStatusses[node][tabId] = undefined;
                    }
                }
                //Delete this instance if it exists
                var deleted = [];
                for (var node in globalObject.globals.crmValues.nodeInstances) {
                    if (globalObject.globals.crmValues.nodeInstances.hasOwnProperty(node) &&
                        globalObject.globals.crmValues.nodeInstances[node]) {
                        if (globalObject.globals.crmValues.nodeInstances[node][tabId]) {
                            deleted.push(node);
                            globalObject.globals.crmValues.nodeInstances[node][tabId] = undefined;
                        }
                    }
                }
                for (var i = 0; i < deleted.length; i++) {
                    if (deleted[i].node && deleted[i].node.id !== undefined) {
                        globalObject.globals.crmValues.tabData[tabId].nodes[deleted[i].node.id]
                            .port
                            .postMessage({
                            change: {
                                type: 'removed',
                                value: tabId
                            },
                            messageType: 'instancesUpdate'
                        });
                    }
                }
                delete globalObject.globals.crmValues.tabData[tabId];
                Logging.Listeners.updateTabAndIdLists();
            });
            if (chrome.notifications) {
                chrome.notifications.onClicked.addListener(function (notificationId) {
                    var notification = globalObject.globals
                        .notificationListeners[notificationId];
                    if (notification && notification.onClick !== undefined) {
                        globalObject.globals.sendCallbackMessage(notification.tabId, notification.id, {
                            err: false,
                            args: [notificationId],
                            callbackId: notification.onClick
                        });
                    }
                });
                chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
                    var notification = globalObject.globals
                        .notificationListeners[notificationId];
                    if (notification && notification.onDone !== undefined) {
                        globalObject.globals.sendCallbackMessage(notification.tabId, notification
                            .id, {
                            err: false,
                            args: [notificationId, byUser],
                            callbackId: notification.onClick
                        });
                    }
                    delete globalObject.globals.notificationListeners[notificationId];
                });
            }
        };
        GlobalDeclarations.getResourceData = function (name, scriptId) {
            if (globalObject.globals.storages.resources[scriptId][name] &&
                globalObject.globals.storages.resources[scriptId][name].matchesHashes) {
                return globalObject.globals.storages.urlDataPairs[globalObject.globals
                    .storages.resources[scriptId][name].sourceUrl].dataURI;
            }
            return null;
        };
        return GlobalDeclarations;
    }());
    ;
    var Logging = (function () {
        function Logging() {
        }
        Logging.log = function (nodeId, tabId) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (globalObject.globals.logging.filter.id !== null) {
                if (nodeId === globalObject.globals.logging.filter.id) {
                    if (globalObject.globals.logging.filter.tabId !== null) {
                        if (tabId === '*' ||
                            tabId === globalObject.globals.logging.filter.tabId) {
                            console.log.apply(console, args);
                        }
                    }
                    else {
                        console.log.apply(console, args);
                    }
                }
            }
            else {
                console.log.apply(console, args);
            }
        };
        Logging.backgroundPageLog = function (id, sourceData) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            sourceData = sourceData || [undefined, undefined];
            var srcObj = {
                id: id
            };
            var logArgs = [
                'Background page [', srcObj, ']: '
            ].concat(args);
            Logging.log.bind(globalObject, id, 'background')
                .apply(globalObject, logArgs);
            var srcObjDetails = {
                tabId: 'background',
                nodeTitle: globalObject.globals.crm.crmById[id].name,
                tabTitle: 'Background Page',
                value: args,
                lineNumber: sourceData[0],
                logId: sourceData[1],
                timestamp: new Date().toLocaleString()
            };
            for (var key in srcObjDetails) {
                if (srcObjDetails.hasOwnProperty(key)) {
                    srcObj[key] = srcObjDetails[key];
                }
            }
            globalObject.globals.logging[id] = globalObject.globals.logging[id] || {
                logMessages: []
            };
            globalObject.globals.logging[id].logMessages.push(srcObj);
            Logging._updateLogs(srcObj);
        };
        Logging.logHandler = function (message) {
            this._prepareLog(message.id, message.tabId);
            switch (message.type) {
                case 'evalResult':
                    chrome.tabs.get(message.tabId, function (tab) {
                        globalObject.globals.listeners.log[message.callbackIndex].listener({
                            id: message.id,
                            tabId: message.tabId,
                            nodeTitle: globalObject.globals.crm.crmById[message.id].name,
                            tabTitle: tab.title,
                            type: 'evalResult',
                            lineNumber: message.lineNumber,
                            timestamp: message.timestamp,
                            val: (message.value.type === 'success') ?
                                {
                                    type: 'success',
                                    result: globalObject.globals.constants.specialJSON.fromJSON(message.value.result)
                                } : message.value
                        });
                    });
                    break;
                case 'log':
                default:
                    this._logHandlerLog({
                        type: message.type,
                        id: message.id,
                        data: message.data,
                        lineNumber: message.lineNumber,
                        tabId: message.tabId,
                        logId: message.logId,
                        callbackIndex: message.callbackIndex,
                        timestamp: message.type
                    });
                    break;
            }
        };
        Logging._prepareLog = function (nodeId, tabId) {
            if (globalObject.globals.logging[nodeId]) {
                if (!globalObject.globals.logging[nodeId][tabId]) {
                    globalObject.globals.logging[nodeId][tabId] = {};
                }
            }
            else {
                var idObj = {
                    values: [],
                    logMessages: []
                };
                idObj[tabId] = {};
                globalObject.globals.logging[nodeId] = idObj;
            }
        };
        Logging._updateLogs = function (newLog) {
            globalObject.globals.listeners.log.forEach(function (logListener) {
                var idMatches = logListener.id === 'all' || ~~logListener.id === ~~newLog.id;
                var tabMatches = logListener.tab === 'all' ||
                    (logListener.tab === 'background' && logListener.tab === newLog.tabId) ||
                    (logListener.tab !== 'background' && ~~logListener.tab === ~~newLog.tabId);
                if (idMatches && tabMatches) {
                    logListener.listener(newLog);
                }
            });
        };
        Logging._logHandlerLog = function (message) {
            var _this = this;
            var srcObj = {};
            var args = [
                'Log[src:',
                srcObj,
                ']: '
            ];
            var logValue = {
                id: message.id,
                tabId: message.tabId,
                logId: message.logId,
                lineNumber: message.lineNumber || '?',
                timestamp: new Date().toLocaleString()
            };
            chrome.tabs.get(message.tabId, function (tab) {
                var data = globalObject.globals.constants.specialJSON
                    .fromJSON(message.data);
                args = args.concat(data);
                _this.log.bind(globalObject, message.id, message.tabId)
                    .apply(globalObject, args);
                srcObj.id = message.id;
                srcObj.tabId = message.tabId;
                srcObj.tab = tab;
                srcObj.url = tab.url;
                srcObj.tabTitle = tab.title;
                srcObj.node = globalObject.globals.crm.crmById[message.id];
                srcObj.nodeName = srcObj.node.name;
                logValue.tabTitle = tab.title;
                logValue.nodeTitle = srcObj.nodeName;
                logValue.data = data;
                globalObject.globals.logging[message.id].logMessages.push(logValue);
                _this._updateLogs(logValue);
            });
        };
        return Logging;
    }());
    Logging.LogExecution = (_a = (function () {
            function LogExecution() {
            }
            LogExecution.executeCRMCode = function (message, type) {
                //Get the port
                if (!globalObject.globals.crmValues.tabData[message.tab]) {
                    return;
                }
                globalObject.globals.crmValues.tabData[message.tab].nodes[message.id].port
                    .postMessage({
                    messageType: type,
                    code: message.code,
                    logCallbackIndex: message.logListener.index
                });
            };
            LogExecution.displayHints = function (message) {
                globalObject.globals.listeners.log[message.data.callbackIndex].listener({
                    id: message.id,
                    tabId: message.tabId,
                    type: 'hints',
                    suggestions: message.data.hints
                });
            };
            return LogExecution;
        }()),
        _a.parent = Logging,
        _a);
    Logging.Listeners = (_b = (function () {
            function Listeners() {
            }
            Listeners.updateTabAndIdLists = function (force) {
                //Make sure anybody is listening
                var listeners = globalObject.globals.listeners;
                if (!force && listeners.ids.length === 0 && listeners.tabs.length === 0) {
                    return {
                        ids: [],
                        tabs: []
                    };
                }
                var ids = {};
                var tabIds = {};
                var tabData = globalObject.globals.crmValues.tabData;
                for (var tabId in tabData) {
                    if (tabData.hasOwnProperty(tabId)) {
                        if (tabId === '0') {
                            tabIds['background'] = true;
                        }
                        else {
                            tabIds[tabId] = true;
                        }
                        var nodes = tabData[tabId].nodes;
                        for (var nodeId in nodes) {
                            if (nodes.hasOwnProperty(nodeId)) {
                                ids[nodeId] = true;
                            }
                        }
                    }
                }
                var idArr = [];
                for (var id in ids) {
                    if (ids.hasOwnProperty(id)) {
                        idArr.push(id);
                    }
                }
                var tabArr = [];
                for (var tabId in tabIds) {
                    if (tabIds.hasOwnProperty(tabId)) {
                        tabArr.push(tabId);
                    }
                }
                idArr = idArr.sort(function (a, b) {
                    return a - b;
                });
                tabArr = tabArr.sort(function (a, b) {
                    return a - b;
                });
                var idPairs = idArr.map(function (id) {
                    return {
                        id: id,
                        title: globalObject.globals.crm.crmById[id].name
                    };
                });
                if (!Helpers.compareArray(idArr, listeners.idVals)) {
                    listeners.ids.forEach(function (idListener) {
                        idListener(idPairs);
                    });
                    listeners.idVals = idArr;
                }
                if (!Helpers.compareArray(tabArr, listeners.tabVals)) {
                    listeners.tabs.forEach(function (tabListener) {
                        tabListener(tabArr);
                    });
                    listeners.tabVals = tabArr;
                }
                return {
                    ids: idPairs,
                    tabs: tabArr
                };
            };
            return Listeners;
        }()),
        _b.parent = Logging,
        _b);
    window.backgroundPageLog = Logging.backgroundPageLog;
    var CRMFunctions = (function () {
        function CRMFunctions() {
        }
        CRMFunctions.getTree = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.respondSuccess(globalObject.globals.crm.safeTree);
            });
        };
        CRMFunctions.getSubTree = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                var nodeId = _this.message.nodeId;
                if (typeof nodeId === 'number') {
                    var node = globalObject.globals.crm.crmByIdSafe[nodeId];
                    if (node) {
                        _this.respondSuccess([node]);
                    }
                    else {
                        _this.respondError("There is no node with id " + nodeId);
                    }
                }
                else {
                    _this.respondError('No nodeId supplied');
                }
            });
        };
        CRMFunctions.getNode = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                var nodeId = _this.message.nodeId;
                if (typeof nodeId === 'number') {
                    var node = globalObject.globals.crm.crmByIdSafe[nodeId];
                    if (node) {
                        _this.respondSuccess(node);
                    }
                    else {
                        _this.respondError("There is no node with id " + nodeId);
                    }
                }
                else {
                    _this.respondError('No nodeId supplied');
                }
            });
        };
        CRMFunctions.getNodeIdFromPath = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                var pathToSearch = _this.message['path'];
                var lookedUp = _this.lookup(pathToSearch, globalObject.globals.crm
                    .safeTree, false);
                if (lookedUp === true) {
                    return false;
                }
                else if (lookedUp === false) {
                    _this.respondError('Path does not return a valid value');
                    return false;
                }
                else {
                    var lookedUpNode = lookedUp;
                    _this.respondSuccess(lookedUpNode.id);
                    return lookedUpNode.id;
                }
            });
        };
        CRMFunctions.queryCrm = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.typeCheck([
                    {
                        val: 'query',
                        type: 'object'
                    }, {
                        val: 'query.type',
                        type: 'string',
                        optional: true
                    }, {
                        val: 'query.inSubTree',
                        type: 'number',
                        optional: true
                    }, {
                        val: 'query.name',
                        type: 'string',
                        optional: true
                    }
                ], function (optionals) {
                    var crmArray = [];
                    for (var id in globalObject.globals.crm.crmById) {
                        if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
                            crmArray.push(globalObject.globals.crm.crmByIdSafe[id]);
                        }
                    }
                    var searchScope = null;
                    if (optionals['query.inSubTree']) {
                        var searchScopeObj = _this.getNodeFromId(_this.message['query']
                            .inSubTree, true, true);
                        var searchScopeObjChildren = [];
                        if (searchScopeObj) {
                            var menuSearchScopeObj = searchScopeObj;
                            searchScopeObjChildren = menuSearchScopeObj.children;
                        }
                        searchScope = [];
                        searchScopeObjChildren.forEach(function (child) {
                            Helpers.flattenCrm(searchScope, child);
                        });
                    }
                    searchScope = searchScope || crmArray;
                    var searchScopeArr = searchScope;
                    if (optionals['query.type']) {
                        searchScopeArr = searchScopeArr.filter(function (candidate) {
                            return candidate.type === _this.message['query'].type;
                        });
                    }
                    if (optionals['query.name']) {
                        searchScopeArr = searchScopeArr.filter(function (candidate) {
                            return candidate.name === _this.message['query'].name;
                        });
                    }
                    //Filter out all nulls
                    searchScopeArr = searchScopeArr.filter(function (result) {
                        return result !== null;
                    });
                    _this.respondSuccess(searchScopeArr);
                });
            });
        };
        CRMFunctions.getParentNode = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    var pathToSearch = JSON.parse(JSON.stringify(node.path));
                    pathToSearch.pop();
                    if (pathToSearch.length === 0) {
                        _this.respondSuccess(globalObject.globals.crm.safeTree);
                    }
                    else {
                        var lookedUp = _this.lookup(pathToSearch, globalObject.globals.crm
                            .safeTree, false);
                        _this.respondSuccess(lookedUp);
                    }
                });
            });
        };
        CRMFunctions.getNodeType = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                    _this.respondSuccess(node.type);
                });
            });
        };
        CRMFunctions.getNodeValue = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                    _this.respondSuccess(node.value);
                });
            });
        };
        CRMFunctions.createNode = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'options',
                        type: 'object'
                    }, {
                        val: 'options.usesTriggers',
                        type: 'boolean',
                        optional: true
                    }, {
                        val: 'options.triggers',
                        type: 'array',
                        forChildren: [
                            {
                                val: 'url',
                                type: 'string'
                            }
                        ],
                        optional: true
                    }, {
                        val: 'options.linkData',
                        type: 'array',
                        forChildren: [
                            {
                                val: 'url',
                                type: 'string'
                            }, {
                                val: 'newTab',
                                type: 'boolean',
                                optional: true
                            }
                        ],
                        optional: true
                    }, {
                        val: 'options.scriptData',
                        type: 'object',
                        optional: true
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.script',
                        type: 'string'
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.launchMode',
                        type: 'number',
                        optional: true,
                        min: 0,
                        max: 3
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.triggers',
                        type: 'array',
                        optional: true,
                        forChildren: [
                            {
                                val: 'url',
                                type: 'string'
                            }
                        ]
                    }, {
                        dependency: 'options.scriptData',
                        val: 'options.scriptData.libraries',
                        type: 'array',
                        optional: true,
                        forChildren: [
                            {
                                val: 'name',
                                type: 'string'
                            }
                        ]
                    }, {
                        val: 'options.stylesheetData',
                        type: 'object',
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.launchMode',
                        type: 'number',
                        min: 0,
                        max: 3,
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.triggers',
                        type: 'array',
                        forChildren: [
                            {
                                val: 'url',
                                type: 'string'
                            }
                        ],
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.toggle',
                        type: 'boolean',
                        optional: true
                    }, {
                        dependency: 'options.stylesheetData',
                        val: 'options.stylesheetData.defaultOn',
                        type: 'boolean',
                        optional: true
                    }
                ], function (optionals) {
                    var id = Helpers.generateItemId();
                    var node = _this.message.options;
                    node = CRM.makeSafe(node);
                    node.id = id;
                    node.nodeInfo = _this.getNodeFromId(_this.message.id, false, true)
                        .nodeInfo;
                    if (_this.getNodeFromId(_this.message.id, false, true).local) {
                        node.local = true;
                    }
                    var newNode;
                    switch (_this.message.options.type) {
                        case 'script':
                            newNode = globalObject.globals.constants.templates
                                .getDefaultLinkNode(node);
                            newNode.type = 'script';
                            break;
                        case 'stylesheet':
                            newNode = globalObject.globals.constants.templates
                                .getDefaultLinkNode(node);
                            newNode.type = 'stylesheet';
                            break;
                        case 'menu':
                            newNode = globalObject.globals.constants.templates
                                .getDefaultLinkNode(node);
                            newNode.type = 'menu';
                            break;
                        case 'divider':
                            newNode = globalObject.globals.constants.templates
                                .getDefaultLinkNode(node);
                            newNode.type = 'divider';
                            break;
                        default:
                        case 'link':
                            newNode = globalObject.globals.constants.templates
                                .getDefaultLinkNode(node);
                            newNode.type = 'link';
                            break;
                    }
                    if ((newNode = _this.moveNode(newNode, _this.message.options.position))) {
                        CRM.updateCrm([newNode.id]);
                        _this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
                    }
                    else {
                        _this.respondError('Failed to place node');
                    }
                    return true;
                });
            });
        };
        CRMFunctions.copyNode = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'options',
                        type: 'object'
                    }, {
                        val: 'options.name',
                        type: 'string',
                        optional: true
                    }
                ], function (optionals) {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        var newNode = JSON.parse(JSON.stringify(node));
                        var id = Helpers.generateItemId();
                        newNode.id = id;
                        if (_this.getNodeFromId(_this.message.id, false, true).local === true &&
                            node.isLocal === true) {
                            newNode.isLocal = true;
                        }
                        newNode.nodeInfo = _this.getNodeFromId(_this.message.id, false, true)
                            .nodeInfo;
                        delete newNode.storage;
                        delete newNode.file;
                        if (optionals['options.name']) {
                            newNode.name = _this.message.options.name;
                        }
                        if ((newNode = _this.moveNode(newNode, _this.message.options
                            .position))) {
                            CRM.updateCrm([newNode.id]);
                            _this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
                        }
                        return true;
                    });
                    return true;
                });
            });
            return true;
        };
        CRMFunctions.moveNode = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    //Remove original from CRM
                    var parentChildren = _this.lookup(node.path, globalObject.globals.crm
                        .crmTree, true);
                    //parentChildren.splice(node.path[node.path.length - 1], 1);
                    if ((node = _this.moveNode(node, _this.message['position'], {
                        children: parentChildren,
                        index: node.path[node.path.length - 1]
                    }))) {
                        CRM.updateCrm();
                        _this.respondSuccess(_this.getNodeFromId(node.id, true, true));
                    }
                });
            });
        };
        CRMFunctions.deleteNode = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    var parentChildren = _this.lookup(node.path, globalObject.globals.crm
                        .crmTree, true);
                    parentChildren.splice(node.path[node.path.length - 1], 1);
                    if (globalObject.globals.crmValues.contextMenuIds[node
                        .id] !==
                        undefined) {
                        chrome.contextMenus.remove(globalObject.globals.crmValues
                            .contextMenuIds[node.id], function () {
                            CRM.updateCrm([_this.message.nodeId]);
                            _this.respondSuccess(true);
                        });
                    }
                    else {
                        CRM.updateCrm([_this.message.nodeId]);
                        _this.respondSuccess(true);
                    }
                });
            });
        };
        CRMFunctions.editNode = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'options',
                        type: 'object'
                    }, {
                        val: 'options.name',
                        type: 'string',
                        optional: true
                    }, {
                        val: 'options.type',
                        type: 'string',
                        optional: true
                    }
                ], function (optionals) {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (optionals['options.type']) {
                            if (_this.message.options.type !== 'link' &&
                                _this.message.options.type !== 'script' &&
                                _this.message.options.type !== 'stylesheet' &&
                                _this.message.options.type !== 'menu' &&
                                _this.message.options.type !== 'divider') {
                                _this
                                    .respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
                                return false;
                            }
                            else {
                                var oldType = node.type.toLowerCase();
                                node.type = _this.message.options.type;
                                if (oldType === 'menu') {
                                    node.menuVal = node.children;
                                    node.value = node[_this.message.options.type + 'Val'] || {};
                                }
                                else {
                                    node[oldType + 'Val'] = node.value;
                                    node.value = node[_this.message.options.type + 'Val'] || {};
                                }
                                if (node.type === 'menu') {
                                    node.children = node.value || [];
                                    node.value = null;
                                }
                            }
                        }
                        if (optionals['options.name']) {
                            node.name = _this.message.options.name;
                        }
                        CRM.updateCrm([_this.message.id]);
                        _this.respondSuccess(Helpers.safe(node));
                        return true;
                    });
                });
            });
        };
        CRMFunctions.getTriggers = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    _this.respondSuccess(node.triggers);
                });
            });
        };
        CRMFunctions.setTriggers = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'triggers',
                        type: 'array',
                        forChildren: [
                            {
                                val: 'url',
                                type: 'string'
                            }
                        ]
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        var triggers = _this.message['triggers'];
                        node['showOnSpecified'] = true;
                        CRM.updateCrm();
                        var matchPatterns = [];
                        globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
                        if ((node.type === 'script' || node.type === 'stylesheet') &&
                            node.value.launchMode === 2 /* RUN_ON_SPECIFIED */) {
                            for (var i = 0; i < triggers.length; i++) {
                                var pattern = URLParsing.validatePatternUrl(triggers[i].url);
                                if (!pattern) {
                                    _this.respondSuccess('Triggers don\'t match URL scheme');
                                    return false;
                                }
                            }
                        }
                        else {
                            var isShowOnSpecified = ((node.type === 'script' || node.type === 'stylesheet') &&
                                node.value.launchMode === 2 /* RUN_ON_SPECIFIED */);
                            for (var i = 0; i < triggers.length; i++) {
                                if (!URLParsing.triggerMatchesScheme(triggers[i].url)) {
                                    _this.respondError('Triggers don\'t match URL scheme');
                                    return false;
                                }
                                triggers[i].url = URLParsing.prepareTrigger(triggers[i].url);
                                if (isShowOnSpecified) {
                                    if (triggers[i].not) {
                                        globalObject.globals.crmValues.hideNodesOnPagesData[node.id].push({
                                            not: false,
                                            url: triggers[i].url
                                        });
                                    }
                                    else {
                                        matchPatterns.push(triggers[i].url);
                                    }
                                }
                            }
                        }
                        node.triggers = triggers;
                        if (matchPatterns.length === 0) {
                            matchPatterns[0] = '<all_urls>';
                        }
                        chrome.contextMenus.update(globalObject.globals.crmValues
                            .contextMenuIds[node.id], {
                            documentUrlPatterns: matchPatterns
                        }, function () {
                            CRM.updateCrm();
                            _this.respondSuccess(Helpers.safe(node));
                        });
                    });
                });
            });
        };
        CRMFunctions.getTriggerUsage = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    if (node.type === 'menu' ||
                        node.type === 'link' ||
                        node.type === 'divider') {
                        _this.respondSuccess(node['showOnSpecified']);
                    }
                    else {
                        _this
                            .respondError('Node is not of right type, can only be menu, link or divider');
                    }
                });
            });
        };
        CRMFunctions.setTriggerUsage = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'useTriggers',
                        type: 'boolean'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type === 'menu' ||
                            node.type === 'link' ||
                            node.type === 'divider') {
                            node['showOnSpecified'] = _this.message['useTriggers'];
                            CRM.updateCrm();
                            chrome.contextMenus.update(globalObject.globals.crmValues
                                .contextMenuIds[node.id], {
                                documentUrlPatterns: ['<all_urls>']
                            }, function () {
                                CRM.updateCrm();
                                _this.respondSuccess(Helpers.safe(node));
                            });
                        }
                        else {
                            _this
                                .respondError('Node is not of right type, can only be menu, link or divider');
                        }
                    });
                });
            });
        };
        CRMFunctions.getContentTypes = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    _this.respondSuccess(node.onContentTypes);
                });
            });
        };
        CRMFunctions.setContentType = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'index',
                        type: 'number',
                        min: 0,
                        max: 5
                    }, {
                        val: 'value',
                        type: 'boolean'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        node.onContentTypes[_this.message['index']] = _this.message['value'];
                        CRM.updateCrm();
                        chrome.contextMenus.update(globalObject.globals.crmValues
                            .contextMenuIds[node.id], {
                            contexts: CRM.getContexts(node.onContentTypes)
                        }, function () {
                            CRM.updateCrm();
                            _this.respondSuccess(node.onContentTypes);
                        });
                    });
                });
            });
        };
        CRMFunctions.setContentTypes = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'contentTypes',
                        type: 'array'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        var i;
                        for (i = 0; i < _this.message['contentTypes'].length; i++) {
                            if (typeof _this.message['contentTypes'][i] !== 'string') {
                                _this
                                    .respondError('Not all values in array contentTypes are of type string');
                                return false;
                            }
                        }
                        var matches = 0;
                        var hasContentType;
                        var contentTypes = [];
                        var contentTypeStrings = [
                            'page', 'link', 'selection', 'image', 'video', 'audio'
                        ];
                        for (i = 0; i < _this.message['contentTypes'].length; i++) {
                            hasContentType = _this.message['contentTypes']
                                .indexOf(contentTypeStrings[i]) >
                                -1;
                            if (hasContentType) {
                                matches++;
                            }
                            contentTypes[i] = hasContentType;
                        }
                        if (!matches) {
                            contentTypes = [true, true, true, true, true, true];
                        }
                        node['onContentTypes'] = contentTypes;
                        chrome.contextMenus.update(globalObject.globals.crmValues
                            .contextMenuIds[node.id], {
                            contexts: CRM.getContexts(node.onContentTypes)
                        }, function () {
                            CRM.updateCrm();
                            _this.respondSuccess(Helpers.safe(node));
                        });
                        return true;
                    });
                });
            });
        };
        CRMFunctions.linkGetLinks = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    if (node.type === 'link') {
                        _this.respondSuccess(node.value);
                    }
                    else {
                        _this.respondSuccess(node['linkVal']);
                    }
                    return true;
                });
            });
        };
        CRMFunctions.linkPush = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'items',
                        type: 'object|array',
                        forChildren: [
                            {
                                val: 'newTab',
                                type: 'boolean',
                                optional: true
                            }, {
                                val: 'url',
                                type: 'string'
                            }
                        ]
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (Array.isArray(_this.message['items'])) {
                            if (node.type !== 'link') {
                                node['linkVal'] = node['linkVal'] || [];
                            }
                            for (var i = 0; i < _this.message['items'].length; i++) {
                                _this.message['items'][i].newTab = !!_this.message['items'][i].newTab;
                                if (node.type === 'link') {
                                    node.value.push(_this.message['items'][i]);
                                }
                                else {
                                    node.linkVal = node.linkVal || [];
                                    node.linkVal.push(_this.message['items'][i]);
                                }
                            }
                        }
                        else {
                            _this.message['items'].newTab = !!_this.message['items'].newTab;
                            if (!_this.message['items'].url) {
                                _this
                                    .respondError('For not all values in the array items is the property url defined');
                                return false;
                            }
                            if (node.type === 'link') {
                                node.value.push(_this.message['items']);
                            }
                            else {
                                node.linkVal = node.linkVal || [];
                                node.linkVal.push(_this.message['items']);
                            }
                        }
                        CRM.updateCrm();
                        if (node.type === 'link') {
                            _this.respondSuccess(Helpers.safe(node).value);
                        }
                        else {
                            _this.respondSuccess(Helpers.safe(node)['linkVal']);
                        }
                        return true;
                    });
                });
            });
        };
        CRMFunctions.linkSplice = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    _this.typeCheck([
                        {
                            val: 'start',
                            type: 'number'
                        }, {
                            val: 'amount',
                            type: 'number'
                        }
                    ], function () {
                        var spliced;
                        if (node.type === 'link') {
                            spliced = node.value.splice(_this.message['start'], _this
                                .message['amount']);
                            CRM.updateCrm();
                            _this.respondSuccess(spliced, Helpers.safe(node).value);
                        }
                        else {
                            node.linkVal = node.linkVal || [];
                            spliced = node.linkVal.splice(_this.message['start'], _this.message['amount']);
                            CRM.updateCrm();
                            _this.respondSuccess(spliced, Helpers.safe(node)['linkVal']);
                        }
                    });
                });
            });
        };
        CRMFunctions.setLaunchMode = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'launchMode',
                        type: 'number',
                        min: 0,
                        max: 4
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type === 'script' || node.type === 'stylesheet') {
                            node.value.launchMode = _this.message['launchMode'];
                        }
                        else {
                            _this.respondError('Node is not of type script or stylesheet');
                            return false;
                        }
                        CRM.updateCrm();
                        _this.respondSuccess(Helpers.safe(node));
                        return true;
                    });
                });
            });
        };
        CRMFunctions.getLaunchMode = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                    if (node.type === 'script' || node.type === 'stylesheet') {
                        _this.respondSuccess(node.value.launchMode);
                    }
                    else {
                        _this.respondError('Node is not of type script or stylesheet');
                    }
                });
            });
        };
        CRMFunctions.registerLibrary = function (_this) {
            _this.checkPermissions(['crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'name',
                        type: 'string'
                    }, {
                        val: 'url',
                        type: 'string',
                        optional: true
                    }, {
                        val: 'code',
                        type: 'string',
                        optional: true
                    }
                ], function (optionals) {
                    var newLibrary;
                    if (optionals['url']) {
                        if (_this.message['url'].indexOf('.js') ===
                            _this.message['url'].length - 3) {
                            //Use URL
                            var done = false;
                            var xhr = new window.XMLHttpRequest();
                            xhr.open('GET', _this.message['url'], true);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4 && xhr.status === 200) {
                                    done = true;
                                    newLibrary = {
                                        name: _this.message['name'],
                                        code: xhr.responseText,
                                        url: _this.message['url']
                                    };
                                    globalObject.globals.storages.storageLocal.libraries.push(newLibrary);
                                    chrome.storage.local.set({
                                        libraries: globalObject.globals.storages.storageLocal.libraries
                                    });
                                    _this.respondSuccess(newLibrary);
                                }
                            };
                            setTimeout(function () {
                                if (!done) {
                                    _this.respondError('Request timed out');
                                }
                            }, 5000);
                            xhr.send();
                        }
                        else {
                            _this.respondError('No valid URL given');
                            return false;
                        }
                    }
                    else if (optionals['code']) {
                        newLibrary = {
                            name: _this.message['name'],
                            code: _this.message['code']
                        };
                        globalObject.globals.storages.storageLocal.libraries.push(newLibrary);
                        chrome.storage.local.set({
                            libraries: globalObject.globals.storages.storageLocal.libraries
                        });
                        _this.respondSuccess(newLibrary);
                    }
                    else {
                        _this.respondError('No URL or code given');
                        return false;
                    }
                    return true;
                });
            });
        };
        CRMFunctions.scriptLibraryPush = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'libraries',
                        type: 'object|array',
                        forChildren: [
                            {
                                val: 'name',
                                type: 'string'
                            }
                        ]
                    }, {
                        val: 'libraries.name',
                        type: 'string',
                        optional: true
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        function doesLibraryExist(lib) {
                            for (var i = 0; i < globalObject.globals.storages.storageLocal.libraries.length; i++) {
                                if (globalObject.globals.storages.storageLocal.libraries[i].name
                                    .toLowerCase() ===
                                    lib.name.toLowerCase()) {
                                    return globalObject.globals.storages.storageLocal.libraries[i].name;
                                }
                            }
                            return false;
                        }
                        function isAlreadyUsed(script, lib) {
                            for (var i = 0; i < script.value.libraries.length; i++) {
                                if (script.value.libraries[i].name === lib.name) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        if (node.type !== 'script') {
                            _this.respondError('Node is not of type script');
                            return false;
                        }
                        if (Array.isArray(_this.message['libraries'])) {
                            for (var i = 0; i < _this.message['libraries'].length; i++) {
                                var originalName = _this.message['libraries'][i].name;
                                if (!(_this.message['libraries'][i].name = doesLibraryExist(_this
                                    .message['libraries'][i]))) {
                                    _this.respondError('Library ' + originalName + ' is not registered');
                                    return false;
                                }
                                if (!isAlreadyUsed(node, _this.message['libraries'][i])) {
                                    node.value.libraries.push(_this.message['libraries'][i]);
                                }
                            }
                        }
                        else {
                            var name = _this.message['libraries'].name;
                            if (!(_this.message['libraries'].name = doesLibraryExist(_this
                                .message['libraries']))) {
                                _this.respondError('Library ' + name + ' is not registered');
                                return false;
                            }
                            if (!isAlreadyUsed(node, _this.message['libraries'])) {
                                node.value.libraries.push(_this.message['libraries']);
                            }
                        }
                        CRM.updateCrm();
                        _this.respondSuccess(Helpers.safe(node).value.libraries);
                        return true;
                    });
                });
            });
        };
        CRMFunctions.scriptLibrarySplice = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'start',
                        type: 'number'
                    }, {
                        val: 'amount',
                        type: 'number'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        var spliced;
                        if (node.type === 'script') {
                            spliced = Helpers.safe(node).value.libraries.splice(_this
                                .message['start'], _this
                                .message['amount']);
                            CRM.updateCrm();
                            _this.respondSuccess(spliced, Helpers.safe(node).value.libraries);
                        }
                        else {
                            _this.respondError('Node is not of type script');
                        }
                        return true;
                    });
                });
            });
        };
        CRMFunctions.scriptBackgroundLibraryPush = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'libraries',
                        type: 'object|array',
                        forChildren: [
                            {
                                val: 'name',
                                type: 'string'
                            }
                        ]
                    }, {
                        val: 'libraries.name',
                        type: 'string',
                        optional: true
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        function doesLibraryExist(lib) {
                            for (var i = 0; i < globalObject.globals.storages.storageLocal.libraries.length; i++) {
                                if (globalObject.globals.storages.storageLocal.libraries[i].name
                                    .toLowerCase() ===
                                    lib.name.toLowerCase()) {
                                    return globalObject.globals.storages.storageLocal.libraries[i].name;
                                }
                            }
                            return false;
                        }
                        function isAlreadyUsed(script, lib) {
                            for (var i = 0; i < script.value.backgroundLibraries.length; i++) {
                                if (script.value.backgroundLibraries[i].name === lib.name) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        if (node.type !== 'script') {
                            _this.respondError('Node is not of type script');
                            return false;
                        }
                        if (Array.isArray(_this.message['libraries'])) {
                            for (var i = 0; i < _this.message['libraries'].length; i++) {
                                var originalName = _this.message['libraries'][i].name;
                                if (!(_this.message['libraries'][i].name = doesLibraryExist(_this
                                    .message['libraries'][i]))) {
                                    _this.respondError('Library ' + originalName + ' is not registered');
                                    return false;
                                }
                                if (!isAlreadyUsed(node, _this.message['libraries'][i])) {
                                    node.value.backgroundLibraries.push(_this.message['libraries'][i]);
                                }
                            }
                        }
                        else {
                            var name = _this.message['libraries'].name;
                            if (!(_this.message['libraries'].name = doesLibraryExist(_this
                                .message['libraries']))) {
                                _this.respondError('Library ' + name + ' is not registered');
                                return false;
                            }
                            if (!isAlreadyUsed(node, _this.message['libraries'])) {
                                node.value.backgroundLibraries.push(_this.message['libraries']);
                            }
                        }
                        CRM.updateCrm();
                        _this.respondSuccess(Helpers.safe(node).value.backgroundLibraries);
                        return true;
                    });
                });
            });
        };
        CRMFunctions.scriptBackgroundLibrarySplice = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'start',
                        type: 'number'
                    }, {
                        val: 'amount',
                        type: 'number'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        var spliced;
                        if (node.type === 'script') {
                            spliced = Helpers.safe(node).value.backgroundLibraries.splice(_this
                                .message['start'], _this.message['amount']);
                            CRM.updateCrm([_this.message.nodeId]);
                            _this.respondSuccess(spliced, Helpers.safe(node).value
                                .backgroundLibraries);
                        }
                        else {
                            node.scriptVal = node.scriptVal ||
                                globalObject.globals.constants.templates.getDefaultScriptValue();
                            node.scriptVal.backgroundLibraries = node.scriptVal.backgroundLibraries || [];
                            spliced = node.scriptVal.backgroundLibraries.splice(_this.message['start'], _this.message['amount']);
                            CRM.updateCrm([_this.message.nodeId]);
                            _this.respondSuccess(spliced, node.scriptVal.backgroundLibraries);
                        }
                        return true;
                    });
                });
            });
        };
        CRMFunctions.setScriptValue = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'script',
                        type: 'string'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type === 'script') {
                            node.value.script = _this.message['script'];
                        }
                        else {
                            node.scriptVal = node.scriptVal ||
                                globalObject.globals.constants.templates.getDefaultScriptValue();
                            node.scriptVal.script = _this.message['script'];
                        }
                        CRM.updateCrm();
                        _this.respondSuccess(Helpers.safe(node));
                        return true;
                    });
                });
            });
        };
        CRMFunctions.getScriptValue = function (__this) {
            __this.checkPermissions(['crmGet'], function () {
                __this.getNodeFromId(__this.message.nodeId, true).run(function (node) {
                    if (node.type === 'script') {
                        __this.respondSuccess(node.value.script);
                    }
                    else {
                        if (node.scriptVal) {
                            __this.respondSuccess(node.scriptVal.script);
                        }
                        else {
                            __this.respondSuccess(undefined);
                        }
                    }
                });
            });
        };
        CRMFunctions.setStylesheetValue = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'stylesheet',
                        type: 'string'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type === 'stylesheet') {
                            node.value.stylesheet = _this.message['stylesheet'];
                        }
                        else {
                            node.stylesheetVal = node.stylesheetVal ||
                                globalObject.globals.constants.templates.getDefaultStylesheetValue();
                            node.stylesheetVal.stylesheet = _this.message['stylesheet'];
                        }
                        CRM.updateCrm();
                        _this.respondSuccess(Helpers.safe(node));
                        return true;
                    });
                });
            });
        };
        CRMFunctions.getStylesheetValue = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                    if (node.type === 'stylesheet') {
                        _this.respondSuccess(node.value.stylesheet);
                    }
                    else {
                        if (node.stylesheetVal) {
                            _this.respondSuccess(node.stylesheetVal.stylesheet);
                        }
                        else {
                            _this.respondSuccess(undefined);
                        }
                    }
                });
            });
        };
        CRMFunctions.setBackgroundScriptValue = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'script',
                        type: 'string'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type === 'script') {
                            node.value.backgroundScript = _this.message['script'];
                        }
                        else {
                            node.scriptVal = node.scriptVal ||
                                globalObject.globals.constants.templates.getDefaultScriptValue();
                            node.scriptVal.backgroundScript = _this.message['script'];
                        }
                        CRM.updateCrm([_this.message.nodeId]);
                        _this.respondSuccess(Helpers.safe(node));
                        return true;
                    });
                });
            });
        };
        CRMFunctions.getBackgroundScriptValue = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                    if (node.type === 'script') {
                        _this.respondSuccess(node.value.backgroundScript);
                    }
                    else {
                        if (node.scriptVal) {
                            _this.respondSuccess(node.scriptVal.backgroundScript);
                        }
                        else {
                            _this.respondSuccess(undefined);
                        }
                    }
                });
            });
        };
        CRMFunctions.getMenuChildren = function (_this) {
            _this.checkPermissions(['crmGet'], function () {
                _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                    if (node.type === 'menu') {
                        _this.respondSuccess(node.children);
                    }
                    else {
                        _this.respondError('Node is not of type menu');
                    }
                });
            });
        };
        CRMFunctions.setMenuChildren = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'childrenIds',
                        type: 'array'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        if (node.type !== 'menu') {
                            _this.respondError('Node is not of type menu');
                            return false;
                        }
                        var i;
                        for (i = 0; i < _this.message['childrenIds'].length; i++) {
                            if (typeof _this.message['childrenIds'][i] !== 'number') {
                                _this
                                    .respondError('Not all values in array childrenIds are of type number');
                                return false;
                            }
                        }
                        var oldLength = node.children.length;
                        for (i = 0; i < _this.message['childrenIds'].length; i++) {
                            var toMove = _this.getNodeFromId(_this.message['childrenIds'][i], false, true);
                            _this.moveNode(toMove, {
                                relation: 'lastChild',
                                node: _this.message.nodeId
                            }, {
                                children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree, true),
                                index: toMove.path[toMove.path.length - 1]
                            });
                        }
                        _this.getNodeFromId(node.id, false, true).children.splice(0, oldLength);
                        CRM.updateCrm();
                        _this.respondSuccess(_this.getNodeFromId(node.id, true, true));
                        return true;
                    });
                });
            });
        };
        CRMFunctions.pushMenuChildren = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'childrenIds',
                        type: 'array'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        if (node.type !== 'menu') {
                            _this.respondError('Node is not of type menu');
                        }
                        var i;
                        for (i = 0; i < _this.message['childrenIds'].length; i++) {
                            if (typeof _this.message['childrenIds'][i] !== 'number') {
                                _this
                                    .respondError('Not all values in array childrenIds are of type number');
                                return false;
                            }
                        }
                        for (i = 0; i < _this.message['childrenIds'].length; i++) {
                            var toMove = _this.getNodeFromId(_this.message['childrenIds'][i], false, true);
                            _this.moveNode(toMove, {
                                relation: 'lastChild',
                                node: _this.message.nodeId
                            }, {
                                children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree, true),
                                index: toMove.path[toMove.path.length - 1]
                            });
                        }
                        CRM.updateCrm();
                        _this.respondSuccess(_this.getNodeFromId(node.id, true, true));
                        return true;
                    });
                });
            });
        };
        CRMFunctions.spliceMenuChildren = function (_this) {
            _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                _this.typeCheck([
                    {
                        val: 'start',
                        type: 'number'
                    }, {
                        val: 'amount',
                        type: 'number'
                    }
                ], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type !== 'menu') {
                            _this.respondError('Node is not of type menu');
                            return false;
                        }
                        var spliced = node.children.splice(_this.message['start'], _this.message['amount']);
                        CRM.updateCrm();
                        _this.respondSuccess(spliced.map(function (splicedNode) {
                            return CRM.makeSafe(splicedNode);
                        }), _this.getNodeFromId(node.id, true, true).children);
                        return true;
                    });
                });
            });
        };
        return CRMFunctions;
    }());
    ;
    var APIMessaging = (function () {
        function APIMessaging() {
        }
        APIMessaging.createReturn = function (message, callbackIndex) {
            var _this = this;
            return function (result) {
                _this.CRMMessage.respond(message, 'success', {
                    callbackId: callbackIndex,
                    params: [result]
                });
            };
        };
        APIMessaging.sendThroughComm = function (message) {
            var instancesObj = globalObject.globals.crmValues.nodeInstances[message.id];
            var instancesArr = [];
            for (var tabInstance in instancesObj) {
                if (instancesObj.hasOwnProperty(tabInstance)) {
                    instancesArr.push({
                        id: tabInstance,
                        instance: instancesObj[tabInstance]
                    });
                }
            }
            var args = [];
            var fns = [];
            for (var i = 0; i < message.args.length; i++) {
                if (message.args[i].type === 'fn') {
                    fns.push(message.args[i]);
                }
                else if (message.args[i].type === 'arg') {
                    if (args.length > 2 && typeof args[0] === 'string') {
                        args = args.slice(1);
                    }
                    args.push(message.args[i]);
                }
            }
            if (fns.length > 0) {
                console.warn('Message responseCallbacks are not supported');
            }
            for (var i = 0; i < instancesArr.length; i++) {
                globalObject.globals.crmValues.tabData[instancesArr[i].id].nodes[message
                    .id]
                    .port.postMessage({
                    messageType: 'instanceMessage',
                    message: args[0]
                });
            }
        };
        return APIMessaging;
    }());
    APIMessaging.CRMMessage = (function () {
        function CRMMessage() {
        }
        CRMMessage.respond = function (message, type, data, stackTrace) {
            var msg = {
                type: type,
                callbackId: message.onFinish,
                messageType: 'callback'
            };
            msg.data = (type === 'error' || type === 'chromeError' ?
                {
                    error: data,
                    stackTrace: stackTrace,
                    lineNumber: message.lineNumber
                } :
                data);
            try {
                globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id]
                    .port
                    .postMessage(msg);
            }
            catch (e) {
                if (e.message === 'Converting circular structure to JSON') {
                    APIMessaging.CRMMessage.respond(message, 'error', 'Converting circular structure to JSON, this API will not work');
                }
                else {
                    throw e;
                }
            }
        };
        return CRMMessage;
    }());
    APIMessaging.ChromeMessage = (function () {
        function ChromeMessage() {
        }
        ChromeMessage.throwError = function (message, error, stackTrace) {
            console.warn('Error:', error);
            if (stackTrace) {
                var stacktraceSplit = stackTrace.split('\n');
                stacktraceSplit.forEach(function (line) {
                    console.warn(line);
                });
            }
            APIMessaging.CRMMessage.respond(message, 'chromeError', error, stackTrace);
        };
        return ChromeMessage;
    }());
    ;
    var CRMFunction = (function () {
        function CRMFunction(message, action) {
            this.message = message;
            this.action = action;
            CRMFunctions[action](this);
        }
        CRMFunction.prototype.respondSuccess = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            APIMessaging.CRMMessage.respond(this.message, 'success', args);
            return true;
        };
        CRMFunction.prototype.respondError = function (error) {
            APIMessaging.CRMMessage.respond(this.message, 'error', error);
        };
        CRMFunction.prototype.lookup = function (path, data, hold) {
            if (hold === void 0) { hold = false; }
            if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
                this.respondError('Supplied path is not of type array');
                return true;
            }
            var length = path.length - 1;
            for (var i = 0; i < length; i++) {
                var next = data[path[i]];
                if (data && next && next.children) {
                    data = next.children;
                }
                else {
                    return false;
                }
            }
            return (hold ? data : data[path[length]]) || false;
        };
        CRMFunction.prototype.checkType = function (toCheck, type, name, optional, ifndef, isArray, ifdef) {
            if (optional === void 0) { optional = 0 /* REQUIRED */; }
            if (isArray === void 0) { isArray = false; }
            if (toCheck === undefined || toCheck === null) {
                if (optional) {
                    if (ifndef) {
                        ifndef();
                    }
                    return true;
                }
                else {
                    if (isArray) {
                        this.respondError("Not all values for " + name + " are defined");
                    }
                    else {
                        this.respondError("Value for " + name + " is not defined");
                    }
                    return false;
                }
            }
            else {
                if (type === 'array') {
                    if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
                        if (isArray) {
                            this.respondError("Not all values for " + name + " are of type " + type + "," +
                                (" they are instead of type " + typeof toCheck));
                        }
                        else {
                            this.respondError("Value for " + name + " is not of type " + type + "," +
                                (" it is instead of type " + typeof toCheck));
                        }
                        return false;
                    }
                }
                if (typeof toCheck !== type) {
                    if (isArray) {
                        this.respondError("Not all values for " + name + " are of type " + type + "," +
                            (" they are instead of type " + typeof toCheck));
                    }
                    else {
                        this.respondError("Value for " + name + " is not of type " + type + "," +
                            (" it is instead of type " + typeof toCheck));
                    }
                    return false;
                }
            }
            if (ifdef) {
                ifdef();
            }
            return true;
        };
        CRMFunction.prototype.moveNode = function (node, position, removeOld) {
            if (removeOld === void 0) { removeOld = false; }
            var crmFunction = this;
            //Capture old CRM tree
            var oldCrmTree = JSON.parse(JSON.stringify(globalObject.globals.crm
                .crmTree));
            //Put the node in the tree
            var relativeNode;
            var parentChildren;
            position = position || {};
            if (!this.checkType(position, 'object', 'position')) {
                return false;
            }
            if (!this.checkType(position.node, 'number', 'node', 1 /* OPTIONAL */, null, false, function () {
                if (!(relativeNode = crmFunction.getNodeFromId(position.node, false, true))) {
                    return false;
                }
            })) {
                return false;
            }
            if (!this.checkType(position.relation, 'string', 'relation', 1 /* OPTIONAL */)) {
                return false;
            }
            relativeNode = relativeNode || globalObject.globals.crm.crmTree;
            var isRoot = relativeNode === globalObject.globals.crm.crmTree;
            switch (position.relation) {
                case 'before':
                    if (isRoot) {
                        Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
                        if (removeOld && globalObject.globals.crm.crmTree === removeOld.children) {
                            removeOld.index++;
                        }
                    }
                    else {
                        parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
                            .crmTree, true);
                        Helpers.pushIntoArray(node, relativeNode
                            .path[relativeNode.path.length - 1], parentChildren);
                        if (removeOld && parentChildren === removeOld.children) {
                            removeOld.index++;
                        }
                    }
                    break;
                case 'firstSibling':
                    if (isRoot) {
                        Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
                        if (removeOld && globalObject.globals.crm.crmTree === removeOld.children) {
                            removeOld.index++;
                        }
                    }
                    else {
                        parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
                            .crmTree, true);
                        Helpers.pushIntoArray(node, 0, parentChildren);
                        if (removeOld && parentChildren === removeOld.children) {
                            removeOld.index++;
                        }
                    }
                    break;
                case 'after':
                    if (isRoot) {
                        Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length, globalObject
                            .globals.crm.crmTree);
                    }
                    else {
                        parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
                            .crmTree, true);
                        if (relativeNode.path.length > 0) {
                            Helpers.pushIntoArray(node, relativeNode
                                .path[relativeNode.path.length - 1] +
                                1, parentChildren);
                        }
                    }
                    break;
                case 'lastSibling':
                    if (isRoot) {
                        Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length, globalObject
                            .globals.crm.crmTree);
                    }
                    else {
                        parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm
                            .crmTree, true);
                        Helpers.pushIntoArray(node, parentChildren.length, parentChildren);
                    }
                    break;
                case 'firstChild':
                    if (isRoot) {
                        Helpers.pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
                        if (removeOld && globalObject.globals.crm.crmTree === removeOld.children) {
                            removeOld.index++;
                        }
                    }
                    else if (relativeNode.type === 'menu') {
                        Helpers.pushIntoArray(node, 0, relativeNode.children);
                        if (removeOld && relativeNode.children === removeOld.children) {
                            removeOld.index++;
                        }
                    }
                    else {
                        this.respondError('Supplied node is not of type "menu"');
                        return false;
                    }
                    break;
                default:
                case 'lastChild':
                    if (isRoot) {
                        Helpers.pushIntoArray(node, globalObject.globals.crm.crmTree.length, globalObject
                            .globals.crm.crmTree);
                    }
                    else if (relativeNode.type === 'menu') {
                        Helpers.pushIntoArray(node, relativeNode.children.length, relativeNode
                            .children);
                    }
                    else {
                        this.respondError('Supplied node is not of type "menu"');
                        return false;
                    }
                    break;
            }
            if (removeOld) {
                removeOld.children.splice(removeOld.index, 1);
            }
            //Update settings
            Storages.applyChanges({
                type: 'optionsPage',
                settingsChanges: [
                    {
                        key: 'crm',
                        oldValue: oldCrmTree,
                        newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree))
                    }
                ]
            });
            return node;
        };
        CRMFunction.prototype.getNodeFromId = function (id, makeSafe, synchronous) {
            if (makeSafe === void 0) { makeSafe = false; }
            if (synchronous === void 0) { synchronous = false; }
            var node = (makeSafe ?
                globalObject.globals.crm.crmByIdSafe :
                globalObject.globals.crm.crmById)[id];
            if (node) {
                if (synchronous) {
                    return node;
                }
                return {
                    run: function (callback) {
                        callback(node);
                    }
                };
            }
            else {
                this.respondError("There is no node with the id you supplied (" + id + ")");
                if (synchronous) {
                    return false;
                }
                return {
                    run: function () { }
                };
            }
        };
        ;
        CRMFunction.prototype.typeCheck = function (toCheck, callback) {
            var typesMatch;
            var toCheckName;
            var matchingType;
            var toCheckTypes;
            var toCheckValue;
            var toCheckIsArray;
            var optionals = {};
            var toCheckChildrenName;
            var toCheckChildrenType;
            var toCheckChildrenValue;
            var toCheckChildrenTypes;
            for (var i = 0; i < toCheck.length; i++) {
                toCheckName = toCheck[i].val;
                if (toCheck[i].dependency) {
                    if (!optionals[toCheck[i].dependency]) {
                        optionals[toCheckName] = false;
                        continue;
                    }
                }
                toCheckTypes = toCheck[i].type.split('|');
                toCheckValue = eval("this.message." + toCheckName + ";");
                if (toCheckValue === undefined || toCheckValue === null) {
                    if (toCheck[i].optional) {
                        optionals[toCheckName] = false;
                        continue;
                    }
                    else {
                        this.respondError("Value for " + toCheckName + " is not set");
                        return false;
                    }
                }
                else {
                    toCheckIsArray = Array.isArray(toCheckValue);
                    typesMatch = false;
                    matchingType = false;
                    for (var j = 0; j < toCheckTypes.length; j++) {
                        if (toCheckTypes[j] === 'array') {
                            if (typeof toCheckValue === 'object' && Array.isArray(toCheckValue)) {
                                matchingType = toCheckTypes[j];
                                typesMatch = true;
                                break;
                            }
                        }
                        else if (typeof toCheckValue === toCheckTypes[j]) {
                            matchingType = toCheckTypes[j];
                            typesMatch = true;
                            break;
                        }
                    }
                    if (!typesMatch) {
                        this.respondError("Value for " + toCheckName + " is not of type " + toCheckTypes
                            .join(' or '));
                        return false;
                    }
                    optionals[toCheckName] = true;
                    if (toCheck[i].min !== undefined && typeof toCheckValue === 'number') {
                        if (toCheck[i].min > toCheckValue) {
                            this.respondError("Value for " + toCheckName + " is smaller than " + toCheck[i]
                                .min);
                            return false;
                        }
                    }
                    if (toCheck[i].max !== undefined && typeof toCheckValue === 'number') {
                        if (toCheck[i].max < toCheckValue) {
                            this.respondError("Value for " + toCheckName + " is bigger than " + toCheck[i]
                                .max);
                            return false;
                        }
                    }
                    if (toCheckIsArray &&
                        toCheckTypes.indexOf('array') &&
                        toCheck[i].forChildren) {
                        for (var j = 0; j < toCheckValue.length; j++) {
                            for (var k = 0; k < toCheck[i].forChildren.length; k++) {
                                toCheckChildrenName = toCheck[i].forChildren[k].val;
                                toCheckChildrenValue = toCheckValue[j][toCheckChildrenName];
                                if (toCheckChildrenValue === undefined || toCheckChildrenValue === null) {
                                    if (!toCheck[i].forChildren[k].optional) {
                                        this
                                            .respondError("For not all values in the array " + toCheckName + " is the property " + toCheckChildrenName + " defined");
                                        return false;
                                    }
                                }
                                else {
                                    toCheckChildrenType = toCheck[i].forChildren[k].type;
                                    toCheckChildrenTypes = toCheckChildrenType.split('|');
                                    typesMatch = false;
                                    for (var l = 0; l < toCheckChildrenTypes.length; l++) {
                                        if (toCheckChildrenTypes[l] === 'array') {
                                            if (typeof toCheckChildrenValue === 'object' &&
                                                Array.isArray(toCheckChildrenValue) !== undefined) {
                                                typesMatch = true;
                                                break;
                                            }
                                        }
                                        else if (typeof toCheckChildrenValue === toCheckChildrenTypes[l]) {
                                            typesMatch = true;
                                            break;
                                        }
                                    }
                                    if (!typesMatch) {
                                        this
                                            .respondError("For not all values in the array " + toCheckName + " is the property " + toCheckChildrenName + " of type " + toCheckChildrenTypes.join(' or '));
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            callback(optionals);
            return true;
        };
        ;
        CRMFunction.prototype.checkPermissions = function (toCheck, callback) {
            var optional = [];
            var permitted = true;
            var node;
            if (!(node = globalObject.globals.crm.crmById[this.message.id])) {
                this
                    .respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
                return false;
            }
            if (node.isLocal) {
                if (callback) {
                    callback(optional);
                }
            }
            else {
                var notPermitted = [];
                if (!node.permissions || Helpers.compareArray(node.permissions, [])) {
                    if (toCheck.length > 0) {
                        permitted = false;
                        notPermitted = toCheck;
                    }
                }
                else {
                    for (var i = 0; i < toCheck.length; i++) {
                        if (node.permissions.indexOf(toCheck[i]) === -1) {
                            permitted = false;
                            notPermitted.push(toCheck[i]);
                        }
                    }
                }
                if (!permitted) {
                    this.respondError("Permission" + (notPermitted.length === 1 ?
                        " " + notPermitted[0] :
                        "s " + notPermitted
                            .join(', ')) + " are not available to this script.");
                }
                else {
                    var length_2 = optional.length;
                    for (var i = 0; i < length_2; i++) {
                        if (node.permissions.indexOf(optional[i]) === -1) {
                            optional.splice(i, 1);
                            length_2--;
                            i--;
                        }
                    }
                    if (callback) {
                        callback(optional);
                    }
                }
            }
            return true;
        };
        ;
        return CRMFunction;
    }());
    var ChromeHandler = (function () {
        function ChromeHandler() {
        }
        ChromeHandler.handle = function (message) {
            var node = globalObject.globals.crm.crmById[message.id];
            if (!/[a-z|A-Z|0-9]*/.test(message.api)) {
                APIMessaging.ChromeMessage.throwError(message, "Passed API \"" + message
                    .api + "\" is not alphanumeric.");
                return false;
            }
            else if (this._checkForRuntimeMessages(message)) {
                return false;
            }
            else if (message.api === 'runtime.sendMessage') {
                console
                    .warn('The chrome.runtime.sendMessage API is not meant to be used, use ' +
                    'crmAPI.comm instead');
                APIMessaging.sendThroughComm(message);
                return false;
            }
            var apiPermission = message
                .requestType ||
                message.api.split('.')[0];
            if (!node.isLocal) {
                var apiFound;
                var chromeFound = (node.permissions.indexOf('chrome') !== -1);
                apiFound = (node.permissions.indexOf(apiPermission) !== -1);
                if (!chromeFound && !apiFound) {
                    APIMessaging.ChromeMessage.throwError(message, "Both permissions chrome and " + apiPermission + " not available to this script");
                    return false;
                }
                else if (!chromeFound) {
                    APIMessaging.ChromeMessage.throwError(message, 'Permission chrome not available to this script');
                    return false;
                }
                else if (!apiFound) {
                    APIMessaging.ChromeMessage.throwError(message, "Permission " + apiPermission + " not avilable to this script");
                    return false;
                }
            }
            if (globalObject.globals.constants.permissions
                .indexOf(apiPermission) ===
                -1) {
                APIMessaging.ChromeMessage.throwError(message, "Permissions " + apiPermission + " is not available for use or does not exist.");
                return false;
            }
            if (globalObject.globals.availablePermissions
                .indexOf(apiPermission) ===
                -1) {
                APIMessaging.ChromeMessage.throwError(message, "Permissions " + apiPermission + " not available to the extension, visit options page");
                chrome.storage.local.get('requestPermissions', function (storageData) {
                    var perms = storageData['requestPermissions'] || [apiPermission];
                    chrome.storage.local.set({
                        requestPermissions: perms
                    });
                });
                return false;
            }
            var i;
            var params = [];
            var returnFunctions = [];
            for (i = 0; i < message.args.length; i++) {
                switch (message.args[i].type) {
                    case 'arg':
                        params.push(Helpers.jsonFn.parse(message.args[i].val));
                        break;
                    case 'fn':
                        params.push(this._createChromeFnCallbackHandler(message, message.args[i].val));
                        break;
                    case 'return':
                        returnFunctions.push(APIMessaging.createReturn(message, message.args[i]
                            .val));
                        break;
                }
            }
            var result;
            try {
                result = sandboxes.sandboxChrome(message.api, params);
                for (i = 0; i < returnFunctions.length; i++) {
                    returnFunctions[i](result);
                }
            }
            catch (e) {
                APIMessaging.ChromeMessage.throwError(message, e.message, e.stack);
                return false;
            }
            return true;
        };
        ChromeHandler._checkForRuntimeMessages = function (message) {
            var api = message.api.split('.').slice(1).join('.');
            if (message.api.split('.')[0] !== 'runtime') {
                return false;
            }
            var args = [];
            var fns = [];
            var returns = [];
            switch (api) {
                case 'getBackgroundPage':
                    console
                        .warn('The chrome.runtime.getBackgroundPage API should not be used');
                    if (!message.args[0] || message.args[0].type !== 'fn') {
                        APIMessaging.ChromeMessage.throwError(message, 'First argument of getBackgroundPage should be a function');
                        return true;
                    }
                    APIMessaging.CRMMessage.respond(message, 'success', {
                        callbackId: message.args[0].val,
                        params: [{}]
                    });
                    return true;
                case 'openOptionsPage':
                    if (message.args[0] && message.args[0].type !== 'fn') {
                        APIMessaging.ChromeMessage.throwError(message, 'First argument of openOptionsPage should be a function');
                        return true;
                    }
                    chrome.runtime.openOptionsPage(function () {
                        if (message.args[0]) {
                            APIMessaging.CRMMessage.respond(message, 'success', {
                                callbackId: message.args[0].val,
                                params: []
                            });
                        }
                    });
                    return true;
                case 'getManifest':
                    if (!message.args[0] || message.args[0].type !== 'return') {
                        APIMessaging.ChromeMessage.throwError(message, 'getManifest should have a function to return to');
                        return true;
                    }
                    APIMessaging.createReturn(message, message.args[0].val)(chrome.runtime
                        .getManifest());
                    return true;
                case 'getURL':
                    for (var i = 0; i < message.args.length; i++) {
                        if (message.args[i].type === 'return') {
                            returns.push(message.args[i].val);
                        }
                        else if (message.args[i].type === 'arg') {
                            args.push(message.args[i].val);
                        }
                        else {
                            APIMessaging.ChromeMessage.throwError(message, 'getURL should not have a function as an argument');
                            return true;
                        }
                    }
                    if (returns.length === 0 || args.length === 0) {
                        APIMessaging.ChromeMessage.throwError(message, 'getURL should be a return function with at least one argument');
                    }
                    APIMessaging.createReturn(message, returns[0])(chrome.runtime
                        .getURL(args[0]));
                    return true;
                case 'connect':
                case 'connectNative':
                case 'setUninstallURL':
                case 'sendNativeMessage':
                case 'requestUpdateCheck':
                    APIMessaging.ChromeMessage.throwError(message, 'This API should not be accessed');
                    return true;
                case 'reload':
                    chrome.runtime.reload();
                    return true;
                case 'restart':
                    chrome.runtime.restart();
                    return true;
                case 'restartAfterDelay':
                    for (var i = 0; i < message.args.length; i++) {
                        if (message.args[i].type === 'fn') {
                            fns.push(message.args[i].val);
                        }
                        else if (message.args[i].type === 'arg') {
                            args.push(message.args[i].val);
                        }
                        else {
                            APIMessaging.ChromeMessage.throwError(message, 'restartAfterDelay should not have a return as an argument');
                            return true;
                        }
                    }
                    chrome.runtime.restartAfterDelay(args[0], function () {
                        APIMessaging.CRMMessage.respond(message, 'success', {
                            callbackId: fns[0],
                            params: []
                        });
                    });
                    return true;
                case 'getPlatformInfo':
                    if (message.args[0] && message.args[0].type !== 'fn') {
                        APIMessaging.ChromeMessage.throwError(message, 'First argument of getPlatformInfo should be a function');
                        return true;
                    }
                    chrome.runtime.getPlatformInfo(function (platformInfo) {
                        if (message.args[0]) {
                            APIMessaging.CRMMessage.respond(message, 'success', {
                                callbackId: message.args[0].val,
                                params: [platformInfo]
                            });
                        }
                    });
                    return true;
                case 'getPackageDirectoryEntry':
                    if (message.args[0] && message.args[0].type !== 'fn') {
                        APIMessaging.ChromeMessage.throwError(message, 'First argument of getPackageDirectoryEntry should be a function');
                        return true;
                    }
                    chrome.runtime.getPackageDirectoryEntry(function (directoryInfo) {
                        if (message.args[0]) {
                            APIMessaging.CRMMessage.respond(message, 'success', {
                                callbackId: message.args[0].val,
                                params: [directoryInfo]
                            });
                        }
                    });
                    return true;
            }
            if (api.split('.').length > 1) {
                if (!message.args[0] || message.args[0].type !== 'fn') {
                    APIMessaging.ChromeMessage.throwError(message, 'First argument should be a function');
                }
                var allowedTargets = [
                    'onStartup',
                    'onInstalled',
                    'onSuspend',
                    'onSuspendCanceled',
                    'onUpdateAvailable',
                    'onRestartRequired'
                ];
                var listenerTarget = api.split('.')[0];
                if (allowedTargets.indexOf(listenerTarget) > -1) {
                    chrome.runtime[listenerTarget].addListener(function () {
                        var listenerArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            listenerArgs[_i] = arguments[_i];
                        }
                        var params = Array.prototype.slice.apply(listenerArgs);
                        APIMessaging.CRMMessage.respond(message, 'success', {
                            callbackId: message.args[0].val,
                            params: params
                        });
                    });
                    return true;
                }
                else if (listenerTarget === 'onMessage') {
                    APIMessaging.ChromeMessage.throwError(message, 'This method of listening to messages is not allowed,' +
                        ' use crmAPI.comm instead');
                    return true;
                }
                else {
                    APIMessaging.ChromeMessage.throwError(message, 'You are not allowed to listen to given event');
                    return true;
                }
            }
            return false;
        };
        ChromeHandler._createChromeFnCallbackHandler = function (message, callbackIndex) {
            return function () {
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                APIMessaging.CRMMessage.respond(message, 'success', {
                    callbackId: callbackIndex,
                    params: params
                });
            };
        };
        return ChromeHandler;
    }());
    var Resources = (function () {
        function Resources() {
        }
        Resources.checkIfResourcesAreUsed = function () {
            var resourceNames = [];
            for (var resourceForScript in globalObject.globals.storages.resources) {
                if (globalObject.globals.storages.resources
                    .hasOwnProperty(resourceForScript) &&
                    globalObject.globals.storages.resources[resourceForScript]) {
                    var scriptResources = globalObject.globals.storages
                        .resources[resourceForScript];
                    for (var resourceName in scriptResources) {
                        if (scriptResources.hasOwnProperty(resourceName) &&
                            scriptResources[resourceName]) {
                            resourceNames.push(scriptResources[resourceName].name);
                        }
                    }
                }
            }
            for (var id in globalObject.globals.crm.crmById) {
                var node = void 0;
                if (globalObject.globals.crm.crmById.hasOwnProperty(id) &&
                    (node = globalObject.globals.crm.crmById[id])) {
                    if (node.type === 'script') {
                        if (node.value.script) {
                            var resourceObj = {};
                            var metaTags = CRM.Script.MetaTags.getMetaTags(globalObject.globals
                                .crm.crmById[id].value.script);
                            var resources = metaTags['resource'];
                            var libs = node.value.libraries;
                            for (var i = 0; i < libs.length; i++) {
                                if (libs[i] === null) {
                                    resourceObj[libs[i].url] = true;
                                }
                            }
                            for (var i = 0; i < resources; i++) {
                                resourceObj[resources[i]] = true;
                            }
                            for (var i = 0; i < resourceNames.length; i++) {
                                if (!resourceObj[resourceNames[i]]) {
                                    this._removeResource(resourceNames[i], ~~id);
                                }
                            }
                        }
                    }
                }
            }
        };
        Resources.updateResourceValues = function () {
            for (var i = 0; i < globalObject.globals.storages.resourceKeys.length; i++) {
                setTimeout(this._generateUpdateCallback(globalObject.globals.storages
                    .resourceKeys[i]), (i * 1000));
            }
        };
        Resources._getUrlData = function (scriptId, url, callback) {
            //First check if the data has already been fetched
            if (globalObject.globals.storages.urlDataPairs[url]) {
                if (globalObject.globals.storages.urlDataPairs[url].refs
                    .indexOf(scriptId) ===
                    -1) {
                    globalObject.globals.storages.urlDataPairs[url].refs.push(scriptId);
                }
                callback(globalObject.globals.storages.urlDataPairs[url].dataURI, globalObject.globals.storages.urlDataPairs[url].dataString);
            }
            else {
                Helpers.convertFileToDataURI(url, function (dataURI, dataString) {
                    //Write the data away to the url-data-pairs object
                    globalObject.globals.storages.urlDataPairs[url] = {
                        dataURI: dataURI,
                        dataString: dataString,
                        refs: [scriptId]
                    };
                    callback(dataURI, dataString);
                });
            }
        };
        Resources._getHashes = function (url) {
            var hashes = [];
            var hashString = url.split('#')[1];
            var hashStrings = hashString.split(/[,|;]/g);
            hashStrings.forEach(function (hash) {
                var split = hash.split('=');
                hashes.push({
                    algorithm: split[0],
                    hash: split[1]
                });
            });
            return hashes;
        };
        Resources._matchesHashes = function (hashes, data) {
            var lastMatchingHash = null;
            hashes = hashes.reverse();
            for (var i = 0; i < hashes.length; i++) {
                var lowerCase = hashes[i].algorithm.toLowerCase;
                if (globalObject.globals.constants.supportedHashes.indexOf(lowerCase()) !==
                    -1) {
                    lastMatchingHash = {
                        algorithm: lowerCase,
                        hash: hashes[i].hash
                    };
                    break;
                }
            }
            if (lastMatchingHash === null) {
                return false;
            }
            var arrayBuffer = new window.TextEncoder('utf-8').encode(data);
            switch (lastMatchingHash.algorithm) {
                case 'md5':
                    return window.md5(data) === lastMatchingHash.hash;
                case 'sha1':
                    window.crypto.subtle.digest('SHA-1', arrayBuffer).then(function (hash) {
                        return hash === lastMatchingHash.hash;
                    });
                    break;
                case 'sha384':
                    window.crypto.subtle.digest('SHA-384', arrayBuffer).then(function (hash) {
                        return hash === lastMatchingHash.hash;
                    });
                    break;
                case 'sha512':
                    window.crypto.subtle.digest('SHA-512', arrayBuffer).then(function (hash) {
                        return hash === lastMatchingHash.hash;
                    });
                    break;
            }
            return false;
        };
        Resources._registerResource = function (name, url, scriptId) {
            var _this = this;
            var registerHashes = this._getHashes(url);
            if (window.navigator.onLine) {
                this._getUrlData(scriptId, url, function (dataURI, dataString) {
                    var resources = globalObject.globals.storages.resources;
                    resources[scriptId] = resources[scriptId] || {};
                    resources[scriptId][name] = {
                        name: name,
                        sourceUrl: url,
                        dataURI: dataURI,
                        matchesHashes: _this._matchesHashes(registerHashes, dataString),
                        crmUrl: "chrome-extension://" + extensionId + "/resource/" + scriptId + "/" + name
                    };
                    chrome.storage.local.set({
                        resources: resources,
                        urlDataPairs: globalObject.globals.storages.urlDataPairs
                    });
                });
            }
            var resourceKeys = globalObject.globals.storages.resourceKeys;
            for (var i = 0; i < resourceKeys.length; i++) {
                if (resourceKeys[i]
                    .name ===
                    name &&
                    resourceKeys[i].scriptId === scriptId) {
                    return;
                }
            }
            resourceKeys.push({
                name: name,
                sourceUrl: url,
                hashes: registerHashes,
                scriptId: scriptId
            });
            chrome.storage.local.set({
                resourceKeys: resourceKeys
            });
        };
        Resources._removeResource = function (name, scriptId) {
            for (var i = 0; i < globalObject.globals.storages.resourceKeys.length; i++) {
                if (globalObject.globals.storages.resourceKeys[i].name === name &&
                    globalObject.globals.storages.resourceKeys[i].scriptId === scriptId) {
                    globalObject.globals.storages.resourceKeys.splice(i, 1);
                    break;
                }
            }
            var urlDataLink = globalObject.globals.storages.urlDataPairs[globalObject.globals.storages.resources[scriptId][name].sourceUrl];
            if (urlDataLink) {
                urlDataLink.refs.splice(urlDataLink.refs.indexOf(scriptId), 1);
                if (urlDataLink.refs.length === 0) {
                    //No more refs, clear it
                    delete globalObject.globals.storages.urlDataPairs[globalObject.globals
                        .storages.resources[scriptId][name].sourceUrl];
                }
            }
            if (globalObject.globals.storages.resources &&
                globalObject.globals.storages.resources[scriptId] &&
                globalObject.globals.storages.resources[scriptId][name]) {
                delete globalObject.globals.storages.resources[scriptId][name];
            }
            chrome.storage.local.set({
                resourceKeys: globalObject.globals.storages.resourceKeys,
                resources: globalObject.globals.storages.resources,
                urlDataPairs: globalObject.globals.storages.urlDataPairs
            });
        };
        Resources._compareResource = function (key) {
            var resources = globalObject.globals.storages.resources;
            Helpers.convertFileToDataURI(key.sourceUrl, function (dataURI, dataString) {
                if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) ||
                    resources[key.scriptId][key.name].dataURI !== dataURI) {
                    //Data URIs do not match, just update the url ref
                    globalObject.globals.storages.urlDataPairs[key.sourceUrl]
                        .dataURI = dataURI;
                    globalObject.globals.storages.urlDataPairs[key.sourceUrl]
                        .dataString = dataString;
                    chrome.storage.local.set({
                        resources: resources,
                        urlDataPairs: globalObject.globals.storages.urlDataPairs
                    });
                }
            });
        };
        Resources._generateUpdateCallback = function (resourceKey) {
            var _this = this;
            return function () {
                _this._compareResource(resourceKey);
            };
        };
        return Resources;
    }());
    Resources.Resource = (function () {
        function Resource() {
        }
        Resource.handle = function (message) {
            switch (message.type) {
                case 'register':
                    Resources._registerResource(message.name, message.url, message.scriptId);
                    break;
                case 'remove':
                    Resources._removeResource(message.name, message.scriptId);
                    break;
            }
        };
        return Resource;
    }());
    Resources.Anonymous = (function () {
        function Anonymous() {
        }
        Anonymous.handle = function (message) {
            switch (message.type) {
                case 'register':
                    Resources._registerResource(message.url, message.url, message.scriptId);
                    break;
                case 'remove':
                    Resources._removeResource(message.url, message.scriptId);
                    break;
            }
        };
        return Anonymous;
    }());
    var MessageHandling = (function () {
        function MessageHandling() {
        }
        MessageHandling.handleRuntimeMessage = function (message, messageSender, respond) {
            switch (message.type) {
                case 'executeCRMCode':
                case 'getCRMHints':
                case 'createLocalLogVariable':
                    Logging.LogExecution.executeCRMCode(message.data, message.type);
                    break;
                case 'displayHints':
                    Logging.LogExecution.displayHints(message);
                    break;
                case 'logCrmAPIValue':
                    Logging.logHandler(message.data);
                    break;
                case 'resource':
                    Resources.Resource.handle(message.data);
                    break;
                case 'anonymousLibrary':
                    Resources.Anonymous.handle(message.data);
                    break;
                case 'updateStorage':
                    Storages.applyChanges(message.data);
                    break;
                case 'sendInstanceMessage':
                    this.Instances.sendMessage(message);
                    break;
                case 'sendBackgroundpageMessage':
                    this.BackgroundPageMessage.send(message.data);
                    break;
                case 'respondToBackgroundMessage':
                    this.Instances.respond({
                        onFinish: message.data.response,
                        id: message.data.id,
                        tabId: message.data.tabId
                    }, 'success', message.data.message);
                    break;
                case 'changeInstanceHandlerStatus':
                    this.Instances.changeStatus(message);
                    break;
                case 'addNotificationListener':
                    this.NotificationListener.listen(message);
                    break;
                case 'newTabCreated':
                    if (messageSender && respond) {
                        CRM.Script.Running.executeScriptsForTab(messageSender.tab.id, respond);
                    }
                    break;
                case 'styleInstall':
                    CRM.Stylesheet.Installing.installStylesheet(message.data);
                    break;
                case 'updateScripts':
                    CRM.Script.Updating.updateScripts(function (updated) {
                        if (respond) {
                            respond(updated);
                        }
                    });
                    break;
                case 'installUserScript':
                    CRM.Script.Updating.install(message.data);
                    break;
            }
        };
        MessageHandling.handleCrmAPIMessage = function (message) {
            switch (message.type) {
                case 'crm':
                    new CRMFunction(message, message.action);
                    break;
                case 'chrome':
                    ChromeHandler.handle(message);
                    break;
                default:
                    this.handleRuntimeMessage(message);
                    break;
            }
        };
        return MessageHandling;
    }());
    MessageHandling.Instances = (function () {
        function Instances() {
        }
        Instances.respond = function (message, status, data) {
            var msg = {
                type: status,
                callbackId: message.onFinish,
                messageType: 'callback',
                data: data
            };
            try {
                globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id]
                    .port
                    .postMessage(msg);
            }
            catch (e) {
                if (e.message === 'Converting circular structure to JSON') {
                    this.respond(message, 'error', 'Converting circular structure to JSON, getting a response from this API will not work');
                }
                else {
                    throw e;
                }
            }
        };
        Instances.sendMessage = function (message) {
            var data = message.data;
            var tabData = globalObject.globals.crmValues.tabData;
            if (globalObject.globals.crmValues.nodeInstances[data.id][data
                .toInstanceId] &&
                tabData[data.toInstanceId] &&
                tabData[data.toInstanceId].nodes[data.id]) {
                if (globalObject.globals.crmValues.nodeInstances[data.id][data
                    .toInstanceId]
                    .hasHandler) {
                    tabData[data.toInstanceId].nodes[data.id].port.postMessage({
                        messageType: 'instanceMessage',
                        message: data.message
                    });
                    this.respond(message, 'success');
                }
                else {
                    this.respond(message, 'error', 'no listener exists');
                }
            }
            else {
                this.respond(message, 'error', 'instance no longer exists');
            }
        };
        Instances.changeStatus = function (message) {
            globalObject.globals.crmValues.nodeInstances[message.id][message.tabId]
                .hasHandler = message.data.hasHandler;
        };
        return Instances;
    }());
    MessageHandling.BackgroundPageMessage = (function () {
        function BackgroundPageMessage() {
        }
        BackgroundPageMessage.send = function (message) {
            var msg = message.message;
            var cb = message.response;
            globalObject.globals.background.byId[message.id].post({
                type: 'comm',
                message: {
                    type: 'backgroundMessage',
                    message: msg,
                    respond: cb,
                    tabId: message.tabId
                }
            });
        };
        return BackgroundPageMessage;
    }());
    MessageHandling.NotificationListener = (function () {
        function NotificationListener() {
        }
        NotificationListener.listen = function (message) {
            var data = message.data;
            globalObject.globals.notificationListeners[data.notificationId] = {
                id: data.id,
                tabId: data.tabId,
                notificationId: data.notificationId,
                onDone: data.onDone,
                onClick: data.onClick
            };
        };
        return NotificationListener;
    }());
    var CRM = (function () {
        function CRM() {
        }
        CRM.updateCrm = function (toUpdate) {
            Storages.uploadChanges('settings', [
                {
                    key: 'crm',
                    newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree)),
                    oldValue: {}
                }
            ]);
            CRM.updateCRMValues();
            CRM.buildPageCRM();
            if (toUpdate) {
                Storages.checkBackgroundPagesForChange([], toUpdate);
            }
        };
        CRM.updateCRMValues = function () {
            globalObject.globals.crm.crmTree = globalObject.globals.storages
                .settingsStorage.crm;
            globalObject.globals.crm.safeTree = this._buildSafeTree(globalObject.globals
                .storages.settingsStorage.crm);
            this._buildNodePaths(globalObject.globals.crm.crmTree, []);
            this._buildByIdObjects();
        };
        CRM.makeSafe = function (node) {
            var newNode = {};
            if (node.children) {
                var menuNode = newNode;
                menuNode.children = [];
                for (var i = 0; i < node.children.length; i++) {
                    menuNode.children[i] = this.makeSafe(node.children[i]);
                }
                newNode = menuNode;
            }
            var copy = this._createCopyFunction(node, newNode);
            copy([
                'id', 'path', 'type', 'name', 'value', 'linkVal',
                'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
                'triggers', 'onContentTypes', 'showOnSpecified'
            ]);
            return newNode;
        };
        CRM.buildPageCRM = function () {
            var length = globalObject.globals.crm.crmTree.length;
            globalObject.globals.crmValues.stylesheetNodeStatusses = {};
            chrome.contextMenus.removeAll();
            globalObject.globals.crmValues.rootId = chrome.contextMenus.create({
                title: 'Custom Menu',
                contexts: ['page', 'selection', 'link', 'image', 'video', 'audio']
            });
            globalObject.globals.toExecuteNodes = {
                onUrl: [],
                always: []
            };
            for (var i = 0; i < length; i++) {
                var result = this._buildPageCRMTree(globalObject.globals.crm.crmTree[i], globalObject.globals.crmValues.rootId, [i], globalObject.globals.crmValues
                    .contextMenuItemTree);
                if (result) {
                    globalObject.globals.crmValues.contextMenuItemTree[i] = {
                        index: i,
                        id: result.id,
                        enabled: true,
                        node: globalObject.globals.crm.crmTree[i],
                        parentId: globalObject.globals.crmValues.rootId,
                        children: result.children,
                        parentTree: globalObject.globals.crmValues.contextMenuItemTree
                    };
                }
            }
            if (globalObject.globals.storages.storageLocal.showOptions) {
                chrome.contextMenus.create({
                    type: 'separator',
                    parentId: globalObject.globals.crmValues.rootId
                });
                chrome.contextMenus.create({
                    title: 'Options',
                    onclick: this._createOptionsPageHandler(),
                    parentId: globalObject.globals.crmValues.rootId
                });
            }
        };
        CRM.getContexts = function (contexts) {
            var newContexts = [];
            var textContexts = globalObject.globals.constants.contexts;
            for (var i = 0; i < 6; i++) {
                if (contexts[i]) {
                    newContexts.push(textContexts[i]);
                }
            }
            return newContexts;
        };
        CRM._createCopyFunction = function (obj, target) {
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
        };
        CRM._buildNodePaths = function (tree, currentPath) {
            for (var i = 0; i < tree.length; i++) {
                var childPath = currentPath.concat([i]);
                var child = tree[i];
                child.path = childPath;
                if (child.children) {
                    this._buildNodePaths(child.children, childPath);
                }
            }
        };
        CRM._createOptionsPageHandler = function () {
            return function () {
                chrome.runtime.openOptionsPage();
            };
        };
        CRM._buildPageCRMTree = function (node, parentId, path, parentTree) {
            var id = this.NodeCreation.createNode(node, parentId);
            globalObject.globals.crmValues.contextMenuIds[node.id] = id;
            if (id !== null) {
                var children = [];
                if (node.children) {
                    var visibleIndex = 0;
                    for (var i = 0; i < node.children.length; i++) {
                        var newPath = JSON.parse(JSON.stringify(path));
                        newPath.push(visibleIndex);
                        var result = this._buildPageCRMTree(node.children[i], id, newPath, children);
                        if (result) {
                            visibleIndex++;
                            result.index = i;
                            result.parentId = id;
                            result.node = node.children[i];
                            result.parentTree = parentTree;
                            children.push(result);
                        }
                    }
                }
                globalObject.globals.crmValues.contextMenuInfoById[id].path = path;
                return {
                    id: id,
                    path: path,
                    enabled: true,
                    children: children
                };
            }
            return null;
        };
        CRM._parseNode = function (node, isSafe) {
            if (isSafe === void 0) { isSafe = false; }
            globalObject.globals.crm[isSafe ? 'crmByIdSafe' : 'crmById'][node.id] = (isSafe ? this.makeSafe(node) : node);
            if (node.children && node.children.length > 0) {
                for (var i = 0; i < node.children.length; i++) {
                    this._parseNode(node.children[i], isSafe);
                }
            }
        };
        CRM._buildByIdObjects = function () {
            globalObject.globals.crm.crmById = {};
            globalObject.globals.crm.crmByIdSafe = {};
            for (var i = 0; i < globalObject.globals.crm.crmTree.length; i++) {
                this._parseNode(globalObject.globals.crm.crmTree[i]);
                this._parseNode(globalObject.globals.crm.safeTree[i], true);
            }
        };
        CRM._safeTreeParse = function (node) {
            if (node.children) {
                var children = [];
                for (var i = 0; i < node.children.length; i++) {
                    children.push(this._safeTreeParse(node.children[i]));
                }
                node.children = children;
            }
            return this.makeSafe(node);
        };
        CRM._buildSafeTree = function (crm) {
            var treeCopy = JSON.parse(JSON.stringify(crm));
            var safeBranch = [];
            for (var i = 0; i < treeCopy.length; i++) {
                safeBranch.push(this._safeTreeParse(treeCopy[i]));
            }
            return safeBranch;
        };
        return CRM;
    }());
    CRM.Script = (_c = (function () {
            function Script() {
            }
            Script._generateMetaAccessFunction = function (metaData) {
                return function (key) {
                    if (metaData[key]) {
                        return metaData[key][0];
                    }
                    return undefined;
                };
            };
            Script._getResourcesArrayForScript = function (scriptId) {
                var resourcesArray = [];
                var scriptResources = globalObject.globals.storages.resources[scriptId];
                if (!scriptResources) {
                    return [];
                }
                for (var resourceName in scriptResources) {
                    if (scriptResources.hasOwnProperty(resourceName)) {
                        resourcesArray.push(scriptResources[resourceName]);
                    }
                }
                return resourcesArray;
            };
            Script._executeScript = function (tabId, scripts, i) {
                var _this = this;
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                    return function () { };
                }
                return function () {
                    if (scripts.length > i) {
                        try {
                            chrome.tabs.executeScript(tabId, scripts[i], _this._executeScript(tabId, scripts, i + 1));
                        }
                        catch (e) {
                        }
                    }
                };
            };
            Script._executeScripts = function (tabId, scripts) {
                this._executeScript(tabId, scripts, 0)();
            };
            Script.createHandler = function (node) {
                var _this = this;
                return function (info, tab) {
                    var key = [];
                    var err = false;
                    try {
                        key = Helpers.createSecretKey();
                    }
                    catch (e) {
                        //There somehow was a stack overflow
                        err = e;
                    }
                    if (err) {
                        chrome.tabs.executeScript(tab.id, {
                            code: 'alert("Something went wrong very badly, please go to your Custom Right-Click Menu options page and remove any sketchy scripts.")'
                        }, function () {
                            chrome.runtime.reload();
                        });
                    }
                    else {
                        var i;
                        globalObject.globals.crmValues.tabData[tab.id] = globalObject.globals
                            .crmValues.tabData[tab.id] ||
                            {
                                libraries: {},
                                nodes: {}
                            };
                        globalObject.globals.crmValues.tabData[tab.id].nodes[node.id] = {
                            secretKey: key
                        };
                        Logging.Listeners.updateTabAndIdLists();
                        var metaData = CRM.Script.MetaTags.getMetaTags(node.value.script);
                        var metaString = CRM.Script.MetaTags.getMetaLines(node.value
                            .script) ||
                            undefined;
                        var runAt = metaData['run-at'] || 'document_end';
                        var excludes = [];
                        var includes = [];
                        if (node.triggers) {
                            for (i = 0; i < node.triggers.length; i++) {
                                if (node.triggers[i].not) {
                                    excludes.push(node.triggers[i].url);
                                }
                                else {
                                    includes.push(node.triggers[i].url);
                                }
                            }
                        }
                        var metaVal = CRM.Script._generateMetaAccessFunction(metaData);
                        var greaseMonkeyData = {
                            info: {
                                script: {
                                    author: metaVal('author') || '',
                                    copyright: metaVal('copyright'),
                                    description: metaVal('description'),
                                    excludes: metaData['excludes'],
                                    homepage: metaVal('homepage'),
                                    icon: metaVal('icon'),
                                    icon64: metaVal('icon64'),
                                    includes: metaData['includes'],
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
                                            orig_includes: metaData['includes'],
                                            use_excludes: excludes,
                                            use_includes: includes
                                        }
                                    },
                                    position: 1,
                                    resources: CRM.Script._getResourcesArrayForScript(node.id),
                                    "run-at": runAt,
                                    system: false,
                                    unwrap: true,
                                    version: metaVal('version')
                                },
                                scriptMetaStr: metaString,
                                scriptSource: node.value.script,
                                scriptUpdateURL: metaVal('updateURL'),
                                scriptWillUpdate: true,
                                scriptHandler: 'Custom Right-Click Menu',
                                version: chrome.runtime.getManifest().version
                            },
                            resources: globalObject.globals.storages.resources[node.id] || {}
                        };
                        globalObject.globals.storages.nodeStorage[node
                            .id] = globalObject.globals.storages.nodeStorage[node.id] || {};
                        var nodeStorage = globalObject.globals.storages.nodeStorage[node.id];
                        var indentUnit;
                        if (globalObject.globals.storages.settingsStorage.editor.useTabs) {
                            indentUnit = '	';
                        }
                        else {
                            indentUnit = new Array([
                                globalObject.globals.storages.settingsStorage.editor.tabSize || 2
                            ]).join(' ');
                        }
                        var script = node.value.script.split('\n').map(function (line) {
                            return indentUnit + line;
                        }).join('\n');
                        var code = [
                            [
                                "var crmAPI = new CrmAPIInit(" + [
                                    CRM.makeSafe(node), node.id, tab, info, key, nodeStorage,
                                    greaseMonkeyData
                                ]
                                    .map(function (param) {
                                    return JSON.stringify(param);
                                }).join(', ') + ");"
                            ].join(', '),
                            'try {',
                            script,
                            '} catch (error) {',
                            indentUnit + 'if (crmAPI.debugOnError) {',
                            indentUnit + indentUnit + 'debugger;',
                            indentUnit + '}',
                            indentUnit + 'throw error;',
                            '}'
                        ].join('\n');
                        var scripts = [];
                        for (i = 0; i < node.value.libraries.length; i++) {
                            var lib;
                            if (globalObject.globals.storages.storageLocal.libraries) {
                                for (var j = 0; j < globalObject.globals.storages.storageLocal.libraries.length; j++) {
                                    if (globalObject.globals.storages.storageLocal.libraries[j].name ===
                                        node.value.libraries[i].name) {
                                        lib = globalObject.globals.storages.storageLocal.libraries[j];
                                        break;
                                    }
                                    else {
                                        //Resource hasn't been registered with its name, try if it's an anonymous one
                                        if (node.value.libraries[i].name === null) {
                                            //Check if the value has been registered as a resource
                                            if (globalObject.globals.storages.urlDataPairs[node.value
                                                .libraries[i]
                                                .url]) {
                                                lib = {
                                                    code: globalObject.globals.storages.urlDataPairs[node.value
                                                        .libraries[i].url].dataString
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                            if (lib) {
                                if (lib.location) {
                                    scripts.push({
                                        file: "/js/defaultLibraries/" + lib.location,
                                        runAt: runAt
                                    });
                                }
                                else {
                                    scripts.push({
                                        code: lib.code,
                                        runAt: runAt
                                    });
                                }
                            }
                        }
                        scripts.push({
                            file: '/js/crmapi.js',
                            runAt: runAt
                        });
                        scripts.push({
                            code: code,
                            runAt: runAt
                        });
                        _this._executeScripts(tab.id, scripts);
                    }
                };
            };
            return Script;
        }()),
        _c.Running = (function () {
            function Running() {
            }
            Running._urlIsGlobalExcluded = function (url) {
                if (globalObject.globals.storages.globalExcludes.indexOf('<all_urls>') >
                    -1) {
                    return true;
                }
                for (var i = 0; i < globalObject.globals.storages.globalExcludes.length; i++) {
                    var pattern = globalObject.globals.storages
                        .globalExcludes[i];
                    if (pattern && URLParsing.urlMatchesPattern(pattern, url)) {
                        return true;
                    }
                }
                return false;
            };
            Running._executeNode = function (node, tab) {
                if (node.type === 'script') {
                    CRM.Script.createHandler(node)({
                        pageUrl: tab.url,
                        menuItemId: 0,
                        editable: false
                    }, tab);
                }
                else if (node.type === 'stylesheet') {
                    CRM.Stylesheet.createClickHandler(node)({
                        pageUrl: tab.url,
                        menuItemId: 0,
                        editable: false
                    }, tab);
                }
                else if (node.type === 'link') {
                    CRM.Link.createHandler(node)({
                        pageUrl: tab.url,
                        menuItemId: 0,
                        editable: false
                    }, tab);
                }
            };
            Running.executeScriptsForTab = function (tabId, respond) {
                var _this = this;
                chrome.tabs.get(tabId, function (tab) {
                    if (tab.url.indexOf('chrome') !== 0) {
                        globalObject.globals.crmValues.tabData[tab.id] = {
                            libraries: {},
                            nodes: {}
                        };
                        Logging.Listeners.updateTabAndIdLists();
                        if (!_this._urlIsGlobalExcluded(tab.url)) {
                            var toExecute = [];
                            for (var nodeId in globalObject.globals.toExecuteNodes.onUrl) {
                                if (globalObject.globals.toExecuteNodes.onUrl
                                    .hasOwnProperty(nodeId) &&
                                    globalObject.globals.toExecuteNodes.onUrl[nodeId]) {
                                    if (URLParsing.matchesUrlSchemes(globalObject.globals
                                        .toExecuteNodes.onUrl[nodeId], tab.url)) {
                                        toExecute.push({
                                            node: globalObject.globals.crm.crmById[nodeId],
                                            tab: tab
                                        });
                                    }
                                }
                            }
                            for (var i = 0; i < globalObject.globals.toExecuteNodes.always.length; i++) {
                                _this._executeNode(globalObject.globals.toExecuteNodes.always[i], tab);
                            }
                            for (var i = 0; i < toExecute.length; i++) {
                                _this._executeNode(toExecute[i].node, toExecute[i].tab);
                            }
                            respond({
                                matched: toExecute.length > 0
                            });
                        }
                    }
                });
            };
            return Running;
        }()),
        _c.Updating = (function () {
            function Updating() {
            }
            Updating._removeOldNode = function (id) {
                var children = globalObject.globals.crm.crmById[id].children;
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        this._removeOldNode(children[i].id);
                    }
                }
                if (globalObject.globals.background.byId[id]) {
                    globalObject.globals.background.byId[id].worker.terminate();
                    delete globalObject.globals.background.byId[id];
                }
                delete globalObject.globals.crm.crmById[id];
                delete globalObject.globals.crm.crmByIdSafe[id];
                var contextMenuId = globalObject.globals.crmValues.contextMenuIds[id];
                if (contextMenuId !== undefined && contextMenuId !== null) {
                    chrome.contextMenus.remove(contextMenuId, function () {
                        Helpers.checkForChromeErrors(false);
                    });
                }
            };
            Updating._registerNode = function (node, oldPath) {
                //Update it in CRM tree
                if (oldPath !== undefined && oldPath !== null) {
                    eval("globalObject.globals.storages.settingsStorage.crm[" + oldPath
                        .join('][') + "] = node");
                }
                else {
                    globalObject.globals.storages.settingsStorage.crm.push(node);
                }
            };
            Updating._getURL = function (url) {
                var anchor = document.createElement('a');
                anchor.href = url;
                return anchor;
            };
            Updating._updateCRMNode = function (node, allowedPermissions, downloadURL, oldNodeId) {
                var hasOldNode = false;
                if (oldNodeId !== undefined && oldNodeId !== null) {
                    hasOldNode = true;
                }
                var templates = globalObject.globals.constants.templates;
                switch (node.type) {
                    case 'script':
                        node = templates.getDefaultScriptNode(node);
                        break;
                    case 'stylesheet':
                        node = templates.getDefaultStylesheetNode(node);
                        break;
                    case 'menu':
                        node = templates.getDefaultMenuNode(node);
                        break;
                    case 'divider':
                        node = templates.getDefaultDividerNode(node);
                        break;
                    case 'link':
                        node = templates.getDefaultLinkNode(node);
                        break;
                }
                node.nodeInfo.downloadURL = downloadURL;
                node.permissions = allowedPermissions;
                if (hasOldNode) {
                    var path = globalObject.globals.crm.crmById[oldNodeId].path;
                    return {
                        node: node,
                        path: path,
                        oldNodeId: oldNodeId
                    };
                }
                else {
                    return {
                        node: node
                    };
                }
            };
            Updating._createUserscriptTriggers = function (metaTags) {
                var triggers = [];
                var includes = metaTags['includes'];
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
                triggers = triggers.map(function (trigger, index) { return (triggers.indexOf(trigger) === index); });
                return triggers;
            };
            Updating._createUserscriptTypeData = function (metaTags, code, node) {
                var launchMode;
                if (CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_stylesheet')) {
                    node = node;
                    node.type = 'stylesheet';
                    launchMode = CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_launchMode') ||
                        2 /* RUN_ON_SPECIFIED */;
                    launchMode = metaTags['CRM_launchMode'] = ~~launchMode;
                    node.value = {
                        stylesheet: code,
                        defaultOn: (metaTags['CRM_defaultOn'] =
                            CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_defaultOn') ||
                                false),
                        toggle: (metaTags['CRM_toggle'] = CRM.Script.MetaTags
                            .getlastMetaTagValue(metaTags, 'CRM_toggle') ||
                            false),
                        launchMode: launchMode
                    };
                }
                else {
                    node.type = 'script';
                    node = node;
                    //Libraries
                    var libs = [];
                    if (metaTags['CRM_libraries']) {
                        metaTags['CRM_libraries'].forEach(function (item) {
                            try {
                                libs.push(JSON.stringify(item));
                            }
                            catch (e) {
                            }
                        });
                    }
                    metaTags['CRM_libraries'] = libs;
                    var anonymousLibs = metaTags['require'] || [];
                    if (metaTags['require']) {
                        for (var i = 0; i < anonymousLibs.length; i++) {
                            var skip = false;
                            for (var j = 0; j < libs.length; j++) {
                                if (libs[j].url === anonymousLibs[i]) {
                                    skip = true;
                                    break;
                                }
                            }
                            if (skip) {
                                continue;
                            }
                            anonymousLibs[i] = {
                                url: anonymousLibs[i],
                                name: null
                            };
                        }
                    }
                    anonymousLibs.forEach(function (anonymousLib) {
                        Resources.Anonymous.handle({
                            type: 'register',
                            name: anonymousLib.url,
                            url: anonymousLib.url,
                            scriptId: node.id
                        });
                    });
                    for (var i = 0; i < anonymousLibs.length; i++) {
                        libs.push(anonymousLibs[i].url);
                    }
                    launchMode = CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_launchMode') ||
                        0;
                    launchMode = metaTags['CRM_launchMode'] = ~~launchMode;
                    node.value = globalObject.globals.constants.templates.getDefaultScriptValue({
                        script: code,
                        launchMode: launchMode,
                        libraries: libs
                    });
                }
            };
            Updating._applyMetaTags = function (code, metaTags, node) {
                var metaTagsArr = [];
                var metaValue;
                var tags = metaTags;
                for (var metaKey in tags) {
                    if (tags.hasOwnProperty(metaKey)) {
                        metaValue = tags[metaKey];
                        var value = void 0;
                        if (metaKey === 'CRM_contentTypes') {
                            value = JSON.stringify(metaValue);
                            metaTagsArr.push("// @" + metaKey + "\t" + value);
                        }
                        else {
                            for (var i = 0; i < metaValue.length; i++) {
                                value = metaValue[i];
                                metaTagsArr.push("// @" + metaKey + "\t" + value);
                            }
                        }
                    }
                }
                var scriptSplit = (node.type === 'script' ?
                    node.value.script :
                    node.value.stylesheet).split('\n');
                var finalMetaTags;
                var beforeMetaTags;
                var metaIndexes = CRM.Script.MetaTags.getMetaIndexes(code);
                if (metaIndexes && metaIndexes.start !== undefined) {
                    beforeMetaTags = scriptSplit.splice(0, metaIndexes.start + 1);
                    scriptSplit.splice(metaIndexes.start, (metaIndexes.end - metaIndexes.start) - 1);
                }
                else {
                    beforeMetaTags = [];
                }
                var afterMetaTags = scriptSplit;
                finalMetaTags = beforeMetaTags;
                finalMetaTags = finalMetaTags.concat(metaTagsArr);
                finalMetaTags = finalMetaTags.concat(afterMetaTags);
                node.value[node.type] = finalMetaTags.join('\n');
            };
            Updating.install = function (message) {
                var oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages
                    .settingsStorage.crm));
                var newScript = CRM.Script.Updating.installUserscript(message
                    .metaTags, message.script, message.downloadURL, message.allowedPermissions);
                if (newScript.path) {
                    var nodePath = newScript.path;
                    this._removeOldNode(newScript.oldNodeId);
                    this._registerNode(newScript.node, nodePath);
                }
                else {
                    this._registerNode(newScript.node);
                }
                Storages.uploadChanges('settings', [
                    {
                        key: 'crm',
                        oldValue: oldTree,
                        newValue: globalObject.globals.storages.settingsStorage.crm
                    }
                ]);
            };
            Updating.installUserscript = function (metaTags, code, downloadURL, allowedPermissions, oldNodeId) {
                var node = {};
                var hasOldNode = false;
                if (oldNodeId !== undefined && oldNodeId !== null) {
                    hasOldNode = true;
                    node.id = oldNodeId;
                }
                else {
                    node.id = Helpers.generateItemId();
                }
                node.name = (metaTags['name'] = [
                    CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'name') || 'name'
                ])[0];
                node.triggers = this._createUserscriptTriggers(metaTags);
                this._createUserscriptTypeData(metaTags, code, node);
                var updateUrl = CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'updateURL') ||
                    CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'downloadURL') ||
                    downloadURL;
                //Requested permissions
                var permissions = [];
                if (metaTags['grant']) {
                    permissions = metaTags['grant'];
                    permissions = permissions.splice(permissions.indexOf('none'), 1);
                    metaTags['grant'] = permissions;
                }
                //NodeInfo
                node.nodeInfo = {
                    version: CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'version') ||
                        null,
                    source: {
                        updateURL: updateUrl || downloadURL,
                        url: updateUrl ||
                            CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'namespace') ||
                            downloadURL,
                        author: CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'author') ||
                            null
                    },
                    isRoot: true,
                    permissions: permissions,
                    lastUpdatedAt: new Date().toLocaleDateString(),
                    installDate: new Date().toLocaleDateString()
                };
                if (hasOldNode) {
                    node.nodeInfo.installDate = (globalObject.globals.crm
                        .crmById[oldNodeId] &&
                        globalObject.globals.crm.crmById[oldNodeId].nodeInfo &&
                        globalObject.globals.crm.crmById[oldNodeId].nodeInfo.installDate) ||
                        node.nodeInfo.installDate;
                }
                //Content types
                if (CRM.Script.MetaTags.getlastMetaTagValue(metaTags, 'CRM_contentTypes')) {
                    try {
                        node.onContentTypes = JSON.parse(CRM.Script.MetaTags
                            .getlastMetaTagValue(metaTags, 'CRM_contentTypes'));
                    }
                    catch (e) {
                    }
                }
                if (!node.onContentTypes) {
                    node.onContentTypes = [true, true, true, true, true, true];
                }
                metaTags['CRM_contentTypes'] = node.onContentTypes;
                //Allowed permissions
                node.permissions = allowedPermissions || [];
                //Resources
                if (metaTags['resource']) {
                    //Register resources
                    var resources = metaTags['resource'];
                    resources.forEach(function (resource) {
                        var resourceSplit = resource.split(/(\s*)/);
                        var resourceName = resourceSplit[0], resourceUrl = resourceSplit[1];
                        Resources.Resource.handle({
                            type: 'register',
                            name: resourceName,
                            url: resourceUrl,
                            scriptId: node.id
                        });
                    });
                }
                //Uploading
                this._applyMetaTags(code, metaTags, node);
                chrome.storage.local.get('requestPermissions', function (keys) {
                    chrome.permissions.getAll(function (allowed) {
                        var requestPermissionsAllowed = allowed.permissions || [];
                        var requestPermissions = keys['requestPermissions'] || [];
                        requestPermissions = requestPermissions.concat(node.permissions
                            .filter(function (nodePermission) { return (requestPermissionsAllowed
                            .indexOf(nodePermission) ===
                            -1); }));
                        requestPermissions = requestPermissions.filter(function (nodePermission, index) { return (requestPermissions.indexOf(nodePermission) === index); });
                        chrome.storage.local.set({
                            requestPermissions: requestPermissions
                        }, function () {
                            if (requestPermissions.length > 0) {
                                chrome.runtime.openOptionsPage();
                            }
                        });
                    });
                });
                if (node.type === 'script') {
                    node = globalObject.globals.constants.templates
                        .getDefaultScriptNode(node);
                }
                else {
                    node = globalObject.globals.constants.templates
                        .getDefaultStylesheetNode(node);
                }
                if (hasOldNode) {
                    var path = globalObject.globals.crm.crmById[oldNodeId].path;
                    return {
                        node: node,
                        path: path,
                        oldNodeId: oldNodeId
                    };
                }
                else {
                    return {
                        node: node,
                        path: null,
                        oldNodeId: null
                    };
                }
            };
            Updating.updateScripts = function (callback) {
                var checking = [];
                var updatedScripts = [];
                var oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages
                    .settingsStorage.crm));
                function onDone() {
                    var _this = this;
                    var updatedData = updatedScripts.map(function (updatedScript) {
                        var oldNode = globalObject.globals.crm.crmById[updatedScript
                            .oldNodeId];
                        return {
                            name: updatedScript.node.name,
                            id: updatedScript.node.id,
                            oldVersion: (oldNode && oldNode.nodeInfo && oldNode.nodeInfo.version) ||
                                undefined,
                            newVersion: updatedScript.node.nodeInfo.version
                        };
                    });
                    updatedScripts.forEach(function (updatedScript) {
                        if (updatedScript.path) {
                            _this._removeOldNode(updatedScript.oldNodeId);
                            _this._registerNode(updatedScript.node, updatedScript.path);
                        }
                        else {
                            _this._registerNode(updatedScript.node);
                        }
                    });
                    Storages.uploadChanges('settings', [
                        {
                            key: 'crm',
                            oldValue: oldTree,
                            newValue: globalObject.globals.storages.settingsStorage.crm
                        }
                    ]);
                    chrome.storage.local.get('updatedScripts', function (storage) {
                        updatedScripts = storage['updatedScripts'] || [];
                        updatedScripts = updatedScripts.concat(updatedData);
                        chrome.storage.local.set({
                            updatedScripts: updatedScripts
                        });
                    });
                    if (callback) {
                        callback(updatedData);
                    }
                }
                for (var id in globalObject.globals.crm.crmById) {
                    if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
                        var node = globalObject.globals.crm.crmById[id];
                        var isRoot = node.nodeInfo && node.nodeInfo.isRoot;
                        var downloadURL = node.nodeInfo &&
                            node.nodeInfo.source &&
                            (node.nodeInfo.source.url ||
                                node.nodeInfo.source.updateURL ||
                                node.nodeInfo.source.downloadURL);
                        if (downloadURL && isRoot) {
                            var checkingId = checking.length;
                            checking[checkingId] = true;
                            this._checkNodeForUpdate(node, checking, checkingId, downloadURL, onDone, updatedScripts);
                        }
                    }
                }
            };
            Updating._checkNodeForUpdate = function (node, checking, checkingId, downloadURL, onDone, updatedScripts) {
                var _this = this;
                if (this._getURL(downloadURL).hostname === undefined &&
                    (node.type === 'script' ||
                        node.type === 'stylesheet' ||
                        node.type === 'menu')) {
                    try {
                        Helpers.convertFileToDataURI("example.com/isUpdated/" + downloadURL.split('/').pop()
                            .split('.user.js')[0] + "/" + node.nodeInfo.version, function (dataURI, dataString) {
                            try {
                                var resultParsed = JSON.parse(dataString);
                                if (resultParsed.updated) {
                                    if (!Helpers.compareArray(node.nodeInfo.permissions, resultParsed
                                        .metaTags
                                        .grant) &&
                                        !(resultParsed.metaTags.grant.length === 0 &&
                                            resultParsed.metaTags.grant[0] === 'none')) {
                                        //New permissions were added, notify user
                                        chrome.storage.local.get('addedPermissions', function (data) {
                                            var addedPermissions = data['addedPermissions'] || [];
                                            addedPermissions.push({
                                                node: node.id,
                                                permissions: resultParsed.metaTags.grant
                                                    .filter(function (newPermission) {
                                                    return node.nodeInfo.permissions
                                                        .indexOf(newPermission) ===
                                                        -1;
                                                })
                                            });
                                            chrome.storage.local.set({
                                                addedPermissions: addedPermissions
                                            });
                                            chrome.runtime.openOptionsPage();
                                        });
                                    }
                                    updatedScripts.push(_this._updateCRMNode(resultParsed.node, node.nodeInfo.permissions, downloadURL, node.id));
                                }
                                checking[checkingId] = false;
                                if (checking.filter(function (c) { return c; }).length === 0) {
                                    onDone();
                                }
                            }
                            catch (err) {
                                console.log('Tried to update script ', node.id, ' ', node.name, ' but could not reach download URL');
                            }
                        }, function () {
                            checking[checkingId] = false;
                            if (checking.filter(function (c) { return c; }).length === 0) {
                                onDone();
                            }
                        });
                    }
                    catch (e) {
                        console.log('Tried to update script ', node.id, ' ', node.name, ' but could not reach download URL');
                    }
                }
                else {
                    if (node.type === 'script' || node.type === 'stylesheet') {
                        //Do a request to get that script from its download URL
                        if (downloadURL) {
                            try {
                                Helpers.convertFileToDataURI(downloadURL, function (dataURI, dataString) {
                                    //Get the meta tags
                                    try {
                                        var metaTags = CRM.Script.MetaTags
                                            .getMetaTags(dataString);
                                        if (Helpers.isNewer(metaTags['version'][0], node.nodeInfo
                                            .version)) {
                                            if (!Helpers.compareArray(node.nodeInfo.permissions, metaTags['grant']) &&
                                                !(metaTags['grant']
                                                    .length ===
                                                    0 &&
                                                    metaTags['grant'][0] === 'none')) {
                                                //New permissions were added, notify user
                                                chrome.storage.local.get('addedPermissions', function (data) {
                                                    var addedPermissions = data['addedPermissions'] || [];
                                                    addedPermissions.push({
                                                        node: node.id,
                                                        permissions: metaTags['grant'].filter(function (newPermission) {
                                                            return node.nodeInfo.permissions
                                                                .indexOf(newPermission) ===
                                                                -1;
                                                        })
                                                    });
                                                    chrome.storage.local.set({
                                                        addedPermissions: addedPermissions
                                                    });
                                                    chrome.runtime.openOptionsPage();
                                                });
                                            }
                                            updatedScripts.push(_this.installUserscript(metaTags, dataString, downloadURL, node.permissions, node.id));
                                        }
                                        checking[checkingId] = false;
                                        if (checking.filter(function (c) { return c; }).length === 0) {
                                            onDone();
                                        }
                                    }
                                    catch (err) {
                                        console.log(err);
                                        console.log('Tried to update script ', node.id, ' ', node.name, ' but could not reach download URL');
                                    }
                                }, function () {
                                    checking[checkingId] = false;
                                    if (checking.filter(function (c) { return c; }).length === 0) {
                                        onDone();
                                    }
                                });
                            }
                            catch (e) {
                                console.log('Tried to update script ', node.id, ' ', node.name, ' but could not reach download URL');
                            }
                        }
                    }
                }
            };
            return Updating;
        }()),
        _c.MetaTags = (function () {
            function MetaTags() {
            }
            MetaTags.getMetaIndexes = function (script) {
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
            };
            MetaTags.getMetaLines = function (script) {
                var metaIndexes = this.getMetaIndexes(script);
                var metaStart = metaIndexes.start;
                var metaEnd = metaIndexes.end;
                var startPlusOne = metaStart + 1;
                var lines = script.split('\n');
                var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
                return metaLines;
            };
            MetaTags.getMetaTags = function (script) {
                var metaLines = this.getMetaLines(script);
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
            };
            MetaTags.getlastMetaTagValue = function (metaTags, key) {
                return metaTags[key] && metaTags[key][metaTags[key].length - 1];
            };
            return MetaTags;
        }()),
        _c.Background = (function () {
            function Background() {
            }
            Background._loadBackgroundPageLibs = function (node) {
                var libraries = [];
                var code = [];
                for (var i = 0; i < node.value.libraries.length; i++) {
                    var lib = void 0;
                    if (globalObject.globals.storages.storageLocal.libraries) {
                        for (var j = 0; j < globalObject.globals.storages.storageLocal.libraries.length; j++) {
                            if (globalObject.globals.storages.storageLocal.libraries[j].name ===
                                node.value
                                    .libraries[i].name) {
                                lib = globalObject.globals.storages.storageLocal.libraries[j];
                                break;
                            }
                            else {
                                //Resource hasn't been registered with its name, try if it's an anonymous one
                                if (node.value.libraries[i].name === null) {
                                    //Check if the value has been registered as a resource
                                    if (globalObject.globals.storages.urlDataPairs[node.value
                                        .libraries[i].url]) {
                                        lib = {
                                            code: globalObject.globals.storages.urlDataPairs[node.value
                                                .libraries[i].url]
                                                .dataString
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
            };
            Background.createBackgroundPage = function (node) {
                if (!node ||
                    node.type !== 'script' ||
                    !node.value.backgroundScript ||
                    node.value.backgroundScript === '') {
                    return;
                }
                var isRestart = false;
                if (globalObject.globals.background.byId[node.id]) {
                    isRestart = true;
                    Logging.backgroundPageLog(node.id, null, 'Restarting background page...');
                    globalObject.globals.background.byId[node.id].worker.terminate();
                    Logging.backgroundPageLog(node.id, null, 'Terminated background page...');
                }
                var result = this._loadBackgroundPageLibs(node);
                var code = result.code;
                var libraries = result.libraries;
                var key = [];
                var err = false;
                try {
                    key = Helpers.createSecretKey();
                }
                catch (e) {
                    //There somehow was a stack overflow
                    err = e;
                }
                if (!err) {
                    globalObject.globals.crmValues.tabData[0] = globalObject.globals
                        .crmValues
                        .tabData[0] ||
                        {
                            libraries: {},
                            nodes: {}
                        };
                    globalObject.globals.crmValues.tabData[0].nodes[node.id] = {
                        secretKey: key
                    };
                    Logging.Listeners.updateTabAndIdLists();
                    var metaData = CRM.Script.MetaTags.getMetaTags(node.value
                        .script);
                    var metaString = CRM.Script.MetaTags.getMetaLines(node.value
                        .script) ||
                        undefined;
                    var runAt = metaData['run-at'] || 'document_end';
                    var excludes = [];
                    var includes = [];
                    for (var i = 0; i < node.triggers.length; i++) {
                        if (node.triggers[i].not) {
                            excludes.push(node.triggers[i].url);
                        }
                        else {
                            includes.push(node.triggers[i].url);
                        }
                    }
                    var indentUnit;
                    if (globalObject.globals.storages.settingsStorage.editor.useTabs) {
                        indentUnit = '	';
                    }
                    else {
                        indentUnit = new Array(globalObject.globals.storages.settingsStorage
                            .editor.tabSize ||
                            2).join('');
                    }
                    var script = node.value.backgroundScript.split('\n').map(function (line) {
                        return indentUnit + line;
                    }).join('\n');
                    var metaVal = CRM.Script._generateMetaAccessFunction(metaData);
                    var greaseMonkeyData = {
                        info: {
                            script: {
                                author: metaVal('author') || '',
                                copyright: metaVal('copyright'),
                                description: metaVal('description'),
                                excludes: metaData['excludes'],
                                homepage: metaVal('homepage'),
                                icon: metaVal('icon'),
                                icon64: metaVal('icon64'),
                                includes: metaData['includes'],
                                lastUpdated: 0,
                                matches: metaData['matches'],
                                isIncognito: false,
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
                                        orig_includes: metaData['includes'],
                                        use_excludes: excludes,
                                        use_includes: includes
                                    }
                                },
                                position: 1,
                                resources: CRM.Script._getResourcesArrayForScript(node.id),
                                "run-at": runAt,
                                system: false,
                                unwrap: true,
                                version: metaVal('version')
                            },
                            scriptMetaStr: metaString,
                            scriptSource: script,
                            scriptUpdateURL: metaVal('updateURL'),
                            scriptWillUpdate: true,
                            scriptHandler: 'Custom Right-Click Menu',
                            version: chrome.runtime.getManifest().version
                        },
                        resources: {}
                    };
                    globalObject.globals.storages.nodeStorage[node
                        .id] = globalObject.globals.storages.nodeStorage[node.id] || {};
                    var nodeStorage = globalObject.globals.storages.nodeStorage[node.id];
                    libraries.push('/js/crmapi.js');
                    code = [
                        code.join('\n'), [
                            "var crmAPI = new CrmAPIInit(" + [
                                CRM.makeSafe(node), node.id, { id: 0 }, {}, key,
                                nodeStorage,
                                greaseMonkeyData, true
                            ]
                                .map(function (param) {
                                return JSON.stringify(param);
                            }).join(', ') + ");"
                        ].join(', '),
                        'try {',
                        script,
                        '} catch (error) {',
                        indentUnit + 'if (crmAPI.debugOnError) {',
                        indentUnit + indentUnit + 'debugger;',
                        indentUnit + '}',
                        indentUnit + 'throw error;',
                        '}'
                    ];
                    sandboxes.sandbox(node.id, code.join('\n'), libraries, key, function () {
                        var instancesArr = [];
                        var nodeInstances = globalObject.globals.crmValues
                            .nodeInstances[node.id];
                        for (var instance in nodeInstances) {
                            if (nodeInstances.hasOwnProperty(instance) &&
                                nodeInstances[instance]) {
                                try {
                                    globalObject.globals.crmValues.tabData[instance]
                                        .nodes[node.id]
                                        .port.postMessage({
                                        messageType: 'dummy'
                                    });
                                    instancesArr.push(instance);
                                }
                                catch (e) {
                                    delete nodeInstances[instance];
                                }
                            }
                        }
                        return instancesArr;
                    }, function (worker) {
                        globalObject.globals.background.workers.push(worker);
                        globalObject.globals.background.byId[node.id] = worker;
                        if (isRestart) {
                            Logging.log(node.id, '*', "Background page [" + node.id + "]: ", 'Restarted background page...');
                        }
                    });
                }
                else {
                    console.log('An error occurred while setting up the script for node ', node
                        .id, err);
                    throw err;
                }
            };
            Background.createBackgroundPages = function () {
                //Iterate through every node
                for (var nodeId in globalObject.globals.crm.crmById) {
                    if (globalObject.globals.crm.crmById.hasOwnProperty(nodeId)) {
                        var node = globalObject.globals.crm.crmById[nodeId];
                        if (node.type === 'script') {
                            this.createBackgroundPage(node);
                        }
                    }
                }
            };
            return Background;
        }()),
        _c);
    CRM.Link = (function () {
        function Link() {
        }
        Link._sanitizeUrl = function (url) {
            if (url.indexOf('://') === -1) {
                url = "http://" + url;
            }
            return url;
        };
        Link.createHandler = function (node) {
            var _this = this;
            return function (clickData, tabInfo) {
                var finalUrl;
                for (var i = 0; i < node.value.length; i++) {
                    if (node.value[i].newTab) {
                        chrome.tabs.create({
                            windowId: tabInfo.windowId,
                            url: _this._sanitizeUrl(node.value[i].url),
                            openerTabId: tabInfo.id
                        });
                    }
                    else {
                        finalUrl = node.value[i].url;
                    }
                }
                if (finalUrl) {
                    chrome.tabs.update(tabInfo.id, {
                        url: _this._sanitizeUrl(finalUrl)
                    });
                }
            };
        };
        return Link;
    }());
    CRM.Stylesheet = (_d = (function () {
            function Stylesheet() {
            }
            Stylesheet.createToggleHandler = function (node) {
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
                        var css = node.value.stylesheet.replace(/[ |\n]/g, '');
                        code = [
                            'var CRMSSInsert=document.createElement("style");',
                            "CRMSSInsert.className=\"styleNodes" + className + "\";",
                            'CRMSSInsert.type="text/css";',
                            "CRMSSInsert.appendChild(document.createTextNode(" + JSON
                                .stringify(css) + "));",
                            'document.head.appendChild(CRMSSInsert);'
                        ].join('');
                    }
                    globalObject.globals.crmValues
                        .stylesheetNodeStatusses[node.id][tab.id] = info.checked;
                    chrome.tabs.executeScript(tab.id, {
                        code: code,
                        allFrames: true
                    });
                };
            };
            Stylesheet.createClickHandler = function (node) {
                return function (info, tab) {
                    var className = node.id + '' + tab.id;
                    var code = [
                        '(function() {',
                        "if (document.querySelector(\".styleNodes" + className + "\")) {",
                        'return false;',
                        '}',
                        'var CRMSSInsert=document.createElement("style");',
                        "CRMSSInsert.classList.add(\"styleNodes" + className + "\");",
                        'CRMSSInsert.type="text/css";',
                        "CRMSSInsert.appendChild(document.createTextNode(" + JSON.stringify(node
                            .value.stylesheet) + "));",
                        'document.head.appendChild(CRMSSInsert);',
                        '}());'
                    ].join('');
                    chrome.tabs.executeScript(tab.id, {
                        code: code,
                        allFrames: true
                    });
                };
            };
            return Stylesheet;
        }()),
        _d.Installing = (function () {
            function Installing() {
            }
            Installing._triggerify = function (url) {
                var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g
                    .exec(url);
                return [
                    match[2] || '*',
                    '://',
                    (match[4] && match[6]) ? match[4] + match[6] : '*',
                    match[7] || '/'
                ].join('');
            };
            Installing._extractStylesheetData = function (data) {
                var _this = this;
                //Get the @document declaration
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
                                '*' :
                                match[2]) :
                            '*'),
                        '://',
                        ((match[4] && match[6]) ?
                            ((match[4].indexOf('*') > -1 || match[6].indexOf('*') > -1) ?
                                '*' :
                                match[4] + match[6]) :
                            '*'),
                        (match[7] ?
                            (match[7].indexOf('*') > -1 ?
                                '*' :
                                match[7]) :
                            '*')
                    ].join(''));
                });
                data.urlPrefixes.forEach(function (urlPrefixRule) {
                    if (URLParsing.triggerMatchesScheme(urlPrefixRule)) {
                        triggers.push(urlPrefixRule + '*');
                    }
                    else {
                        triggers.push(_this._triggerify(urlPrefixRule + '*'));
                    }
                });
                data.urls.forEach(function (urlRule) {
                    if (URLParsing.triggerMatchesScheme(urlRule)) {
                        triggers.push(urlRule);
                    }
                    else {
                        triggers.push(_this._triggerify(urlRule));
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
            };
            Installing.installStylesheet = function (data) {
                var _this = this;
                var stylesheetData = JSON.parse(data.code);
                stylesheetData.sections.forEach(function (section) {
                    var sectionData = _this._extractStylesheetData(section);
                    var node = globalObject.globals.constants.templates
                        .getDefaultStylesheetNode({
                        isLocal: false,
                        name: stylesheetData.name,
                        nodeInfo: {
                            version: 1,
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
                        id: Helpers.generateItemId()
                    });
                    var crmFn = new CRMFunction(null, 'null');
                    crmFn.moveNode(node, {}, null);
                });
            };
            return Installing;
        }()),
        _d);
    CRM.NodeCreation = (function () {
        function NodeCreation() {
        }
        NodeCreation._getStylesheetReplacementTabs = function (node) {
            var replaceOnTabs = [];
            var crmNode = globalObject.globals.crm.crmById[node.id];
            if (globalObject.globals.crmValues.contextMenuIds[node.id] &&
                crmNode.type === 'stylesheet' &&
                node.type === 'stylesheet' &&
                crmNode.value.stylesheet !== node.value.stylesheet) {
                //Update after creating a new node
                for (var key in globalObject.globals.crmValues
                    .stylesheetNodeStatusses[node
                    .id]) {
                    if (globalObject.globals.crmValues.stylesheetNodeStatusses
                        .hasOwnProperty(key) &&
                        globalObject.globals.crmValues.stylesheetNodeStatusses[key]) {
                        if (globalObject.globals.crmValues.stylesheetNodeStatusses[node
                            .id][key] &&
                            key !== 'defaultValue') {
                            replaceOnTabs.push({
                                id: key
                            });
                        }
                    }
                }
            }
            return replaceOnTabs;
        };
        NodeCreation._addRightClickItemClick = function (node, launchMode, rightClickItemOptions, idHolder) {
            //On by default
            if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
                if (launchMode === 1 /* ALWAYS_RUN */ ||
                    launchMode === 0 /* RUN_ON_CLICKING */) {
                    globalObject.globals.toExecuteNodes.always.push(node);
                }
                else if (launchMode === 2 /* RUN_ON_SPECIFIED */ ||
                    launchMode === 3 /* SHOW_ON_SPECIFIED */) {
                    globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
                }
            }
            if ((node['showOnSpecified'] && (node.type === 'link' || node.type === 'divider' ||
                node.type === 'menu')) ||
                launchMode === 3 /* SHOW_ON_SPECIFIED */) {
                rightClickItemOptions.documentUrlPatterns = [];
                globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
                for (var i = 0; i < node.triggers.length; i++) {
                    var prepared = URLParsing.prepareTrigger(node.triggers[i].url);
                    if (prepared) {
                        if (node.triggers[i].not) {
                            globalObject.globals.crmValues.hideNodesOnPagesData[node.id]
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
            //It requires a click handler
            switch (node.type) {
                case 'divider':
                    rightClickItemOptions.type = 'separator';
                    break;
                case 'link':
                    rightClickItemOptions.onclick = CRM.Link.createHandler(node);
                    break;
                case 'script':
                    rightClickItemOptions.onclick = CRM.Script.createHandler(node);
                    break;
                case 'stylesheet':
                    if (node.value.toggle) {
                        rightClickItemOptions.type = 'checkbox';
                        rightClickItemOptions.onclick = CRM.Stylesheet
                            .createToggleHandler(node);
                        rightClickItemOptions.checked = node.value.defaultOn;
                    }
                    else {
                        rightClickItemOptions.onclick = CRM.Stylesheet
                            .createClickHandler(node);
                    }
                    globalObject.globals.crmValues.stylesheetNodeStatusses[node.id] = {
                        defaultValue: node.value.defaultOn
                    };
                    break;
            }
            var id = chrome.contextMenus.create(rightClickItemOptions, function () {
                if (chrome.runtime.lastError) {
                    if (rightClickItemOptions.documentUrlPatterns) {
                        console
                            .log('An error occurred with your context menu, attempting again with no url matching.', chrome.runtime.lastError);
                        delete rightClickItemOptions.documentUrlPatterns;
                        id = chrome.contextMenus.create(rightClickItemOptions, function () {
                            id = chrome.contextMenus.create({
                                title: 'ERROR',
                                onclick: CRM._createOptionsPageHandler()
                            });
                            console.log('Another error occured with your context menu!', chrome
                                .runtime.lastError);
                        });
                    }
                    else {
                        console.log('An error occured with your context menu!', chrome.runtime
                            .lastError);
                    }
                }
            });
            globalObject.globals.crmValues.contextMenuInfoById[id] = {
                settings: rightClickItemOptions,
                path: node.path,
                enabled: false
            };
            idHolder.id = id;
        };
        NodeCreation._setLaunchModeData = function (node, rightClickItemOptions, idHolder) {
            var launchMode = ((node.type === 'script' || node.type === 'stylesheet') &&
                node.value.launchMode) || 0 /* RUN_ON_CLICKING */;
            if (launchMode === 1 /* ALWAYS_RUN */) {
                globalObject.globals.toExecuteNodes.always.push(node);
            }
            else if (launchMode === 2 /* RUN_ON_SPECIFIED */) {
                globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
            }
            else if (launchMode !== 4 /* DISABLED */) {
                this._addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder);
            }
        };
        NodeCreation.createNode = function (node, parentId) {
            var replaceStylesheetTabs = this._getStylesheetReplacementTabs(node);
            var rightClickItemOptions = {
                title: node.name,
                contexts: CRM.getContexts(node.onContentTypes),
                parentId: parentId
            };
            var idHolder = { id: null };
            this._setLaunchModeData(node, rightClickItemOptions, idHolder);
            var id = idHolder.id;
            if (replaceStylesheetTabs.length !== 0) {
                node = node;
                for (var i = 0; i < replaceStylesheetTabs.length; i++) {
                    var className = node.id + '' + replaceStylesheetTabs[i].id;
                    var code = "var nodes = document.querySelectorAll(\".styleNodes" + className + "\");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}";
                    var css = node.value.stylesheet.replace(/[ |\n]/g, '');
                    code +=
                        "var CRMSSInsert=document.createElement(\"style\");CRMSSInsert.className=\"styleNodes" + className + "\";CRMSSInsert.type=\"text/css\";CRMSSInsert.appendChild(document.createTextNode(" + JSON.stringify(css) + "));document.head.appendChild(CRMSSInsert);";
                    chrome.tabs.executeScript(replaceStylesheetTabs[i].id, {
                        code: code,
                        allFrames: true
                    });
                    globalObject.globals.crmValues.stylesheetNodeStatusses[node
                        .id][replaceStylesheetTabs[i].id] = true;
                }
            }
            return id;
        };
        return NodeCreation;
    }());
    var URLParsing = (function () {
        function URLParsing() {
        }
        URLParsing.triggerMatchesScheme = function (trigger) {
            var reg = /(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;
            return reg.test(trigger);
        };
        URLParsing.prepareTrigger = function (trigger) {
            if (trigger === '<all_urls>') {
                return trigger;
            }
            if (trigger.replace(/\s/g, '') === '') {
                return null;
            }
            var newTrigger;
            var triggerSplit = trigger.split('//');
            if (triggerSplit.length === 1) {
                newTrigger = "http://" + trigger;
                triggerSplit[1] = triggerSplit[0];
            }
            if (triggerSplit[1].indexOf('/') === -1) {
                newTrigger = trigger + "/";
            }
            else {
                newTrigger = trigger;
            }
            return newTrigger;
        };
        URLParsing.urlMatchesPattern = function (pattern, url) {
            var urlPattern;
            try {
                urlPattern = this._parsePattern(url);
            }
            catch (e) {
                return false;
            }
            if (urlPattern === '<all_urls>') {
                return true;
            }
            var matchPattern = urlPattern;
            return (this._matchesScheme(pattern.scheme, matchPattern.scheme) &&
                this._matchesHost(pattern.host, matchPattern.host) &&
                this._matchesPath(pattern.path, matchPattern.path));
        };
        URLParsing.validatePatternUrl = function (url) {
            if (!url || typeof url !== 'string') {
                return null;
            }
            url = url.trim();
            var pattern = this._parsePattern(url);
            if (pattern === '<all_urls>') {
                return {
                    scheme: '*',
                    host: '*',
                    path: '*'
                };
            }
            var matchPattern = pattern;
            if (matchPattern.invalid) {
                return null;
            }
            if (globalObject.globals.constants.validSchemes.indexOf(matchPattern
                .scheme) ===
                -1) {
                return null;
            }
            var wildcardIndex = matchPattern.host.indexOf('*');
            if (wildcardIndex > -1) {
                if (matchPattern.host.split('*').length > 2) {
                    return null;
                }
                if (wildcardIndex === 0 && matchPattern.host[1] === '.') {
                    if (matchPattern.host.slice(2).split('/').length > 1) {
                        return null;
                    }
                }
                else {
                    return null;
                }
            }
            return matchPattern;
        };
        URLParsing.matchesUrlSchemes = function (matchPatterns, url) {
            var matches = false;
            for (var i = 0; i < matchPatterns.length; i++) {
                var not = matchPatterns[i].not;
                var matchPattern = matchPatterns[i].url;
                if (matchPattern.indexOf('/') === 0 &&
                    matchPattern.split('').reverse().join('').indexOf('/') === 0) {
                    //It's regular expression
                    if (new RegExp(matchPattern.slice(1, matchPattern.length - 1))
                        .test(url)) {
                        if (not) {
                            return false;
                        }
                        else {
                            matches = true;
                        }
                    }
                }
                else {
                    if (new RegExp("^" + matchPattern.replace(/\*/g, '(.+)') + "$").test(url)) {
                        if (not) {
                            return false;
                        }
                        else {
                            matches = true;
                        }
                    }
                }
            }
            return matches;
        };
        URLParsing._parsePattern = function (url) {
            if (url === '<all_urls>') {
                return '<all_urls>';
            }
            try {
                var _a = url.split('://'), scheme = _a[0], hostAndPath = _a[1];
                var _b = hostAndPath.split('/'), host = _b[0], path = _b.slice(1);
                return {
                    scheme: scheme,
                    host: host,
                    path: path.join('/')
                };
            }
            catch (e) {
                return {
                    scheme: '*',
                    host: '*',
                    path: '*',
                    invalid: true
                };
            }
        };
        URLParsing._matchesScheme = function (scheme1, scheme2) {
            if (scheme1 === '*') {
                return true;
            }
            return scheme1 === scheme2;
        };
        URLParsing._matchesHost = function (host1, host2) {
            if (host1 === '*') {
                return true;
            }
            if (host1[0] === '*') {
                var host1Split = host1.slice(2);
                var index = host2.indexOf(host1Split);
                if (index === host2.length - host1Split.length) {
                    return true;
                }
                else {
                    return false;
                }
            }
            return (host1 === host2);
        };
        URLParsing._matchesPath = function (path1, path2) {
            var path1Split = path1.split('*');
            var path1Length = path1Split.length;
            var wildcards = path1Length - 1;
            if (wildcards === 0) {
                return path1 === path2;
            }
            if (path2.indexOf(path1Split[0]) !== 0) {
                return false;
            }
            path2 = path2.slice(path1Split[0].length);
            for (var i = 1; i < path1Length; i++) {
                if (path2.indexOf(path1Split[i]) === -1) {
                    return false;
                }
                path2 = path2.slice(path1Split[i].length);
            }
            return true;
        };
        return URLParsing;
    }());
    var Storages = (function () {
        function Storages() {
        }
        Storages.checkBackgroundPagesForChange = function (changes, toUpdate) {
            if (toUpdate === void 0) { toUpdate = []; }
            toUpdate.forEach(function (id) {
                CRM.Script.Background.createBackgroundPage(globalObject.globals.crm.crmById[id]);
            });
            //Check if any background page updates occurred
            for (var i = 0; i < changes.length; i++) {
                if (changes[i].key === 'crm') {
                    var ordered = {};
                    this._orderBackgroundPagesById(changes[i].newValue, ordered);
                    for (var id in ordered) {
                        if (ordered.hasOwnProperty(id)) {
                            var node = globalObject.globals.crm.crmById[id];
                            if (node.type === 'script' && (!node || node.value.script !== ordered[id])) {
                                CRM.Script.Background.createBackgroundPage(node);
                            }
                        }
                    }
                }
            }
        };
        Storages.uploadChanges = function (type, changes, useStorageSync) {
            var _this = this;
            if (useStorageSync === void 0) { useStorageSync = null; }
            switch (type) {
                case 'local':
                    chrome.storage.local.set(globalObject.globals.storages.storageLocal);
                    for (var i = 0; i < changes.length; i++) {
                        if (changes[i].key === 'useStorageSync') {
                            this.uploadChanges('settings', [], changes[i].newValue);
                        }
                    }
                    break;
                case 'settings':
                    if (useStorageSync !== null) {
                        globalObject.globals.storages.storageLocal
                            .useStorageSync = useStorageSync;
                    }
                    var settingsJson = JSON.stringify(globalObject.globals.storages
                        .settingsStorage);
                    if (!globalObject.globals.storages.storageLocal.useStorageSync) {
                        chrome.storage.local.set({
                            settings: globalObject.globals.storages.settingsStorage
                        }, function () {
                            if (chrome.runtime.lastError) {
                                console.log('Error on uploading to chrome.storage.local ', chrome
                                    .runtime
                                    .lastError);
                            }
                            else {
                                for (var i = 0; i < changes.length; i++) {
                                    if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
                                        CRM.updateCRMValues();
                                        Storages.checkBackgroundPagesForChange(changes);
                                        CRM.buildPageCRM();
                                        break;
                                    }
                                }
                            }
                        });
                        chrome.storage.sync.set({
                            indexes: null
                        });
                    }
                    else {
                        //Using chrome.storage.sync
                        if (settingsJson.length >= 101400) {
                            chrome.storage.local.set({
                                useStorageSync: false
                            }, function () {
                                _this.uploadChanges('settings', changes);
                            });
                        }
                        else {
                            //Cut up all data into smaller JSON
                            var obj = this.cutData(settingsJson);
                            chrome.storage.sync.set(obj, function () {
                                if (chrome.runtime.lastError) {
                                    //Switch to local storage
                                    console.log('Error on uploading to chrome.storage.sync ', chrome
                                        .runtime
                                        .lastError);
                                    chrome.storage.local.set({
                                        useStorageSync: false
                                    }, function () {
                                        _this.uploadChanges('settings', changes);
                                    });
                                }
                                else {
                                    for (var i = 0; i < changes.length; i++) {
                                        if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
                                            CRM.updateCRMValues();
                                            Storages.checkBackgroundPagesForChange(changes);
                                            CRM.buildPageCRM();
                                            break;
                                        }
                                    }
                                    chrome.storage.local.set({
                                        settings: null
                                    });
                                }
                            });
                        }
                    }
                    break;
                case 'libraries':
                    chrome.storage.local.set({
                        libraries: changes
                    });
                    break;
            }
        };
        Storages.applyChanges = function (data) {
            switch (data.type) {
                case 'optionsPage':
                    if (data.localChanges) {
                        this._applyChangeForStorageType(globalObject.globals.storages.storageLocal, data
                            .localChanges);
                        this.uploadChanges('local', data.localChanges);
                    }
                    if (data.settingsChanges) {
                        this._applyChangeForStorageType(globalObject.globals.storages.settingsStorage, data.settingsChanges);
                        this.uploadChanges('settings', data.settingsChanges);
                    }
                    break;
                case 'libraries':
                    this._applyChangeForStorageType(globalObject.globals.storages.storageLocal, [
                        {
                            key: 'libraries',
                            newValue: data.libraries,
                            oldValue: globalObject.globals.storages.storageLocal.libraries
                        }
                    ]);
                    break;
                case 'nodeStorage':
                    globalObject.globals.storages.nodeStorage[data
                        .id] = globalObject.globals.storages.nodeStorage[data.id] || {};
                    this._applyChangeForStorageType(globalObject.globals.storages.nodeStorage[data
                        .id], data.nodeStorageChanges);
                    this._notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges);
                    break;
            }
        };
        Storages.setStorages = function (storageLocalCopy, settingsStorage, chromeStorageLocal, callback) {
            globalObject.globals.storages.storageLocal = storageLocalCopy;
            globalObject.globals.storages.settingsStorage = settingsStorage;
            globalObject.globals.storages
                .globalExcludes = this._setIfNotSet(chromeStorageLocal, 'globalExcludes', []).map(URLParsing.validatePatternUrl)
                .filter(function (pattern) {
                return pattern !== null;
            });
            globalObject.globals.storages.resources = this._setIfNotSet(chromeStorageLocal, 'resources', []);
            globalObject.globals.storages.nodeStorage = this._setIfNotSet(chromeStorageLocal, 'nodeStorage', {});
            globalObject.globals.storages.resourceKeys = this._setIfNotSet(chromeStorageLocal, 'resourceKeys', []);
            globalObject.globals.storages.urlDataPairs = this._setIfNotSet(chromeStorageLocal, 'urlDataPairs', {});
            CRM.updateCRMValues();
            if (callback) {
                callback();
            }
        };
        Storages.cutData = function (data) {
            var obj = {};
            var indexes = [];
            var splitJson = data.match(/[\s\S]{1,5000}/g);
            splitJson.forEach(function (section) {
                var arrLength = indexes.length;
                var sectionKey = "section" + arrLength;
                obj[sectionKey] = section;
                indexes[arrLength] = sectionKey;
            });
            obj.indexes = indexes;
            return obj;
        };
        Storages.loadStorages = function (callback) {
            var _this = this;
            chrome.storage.sync.get(function (chromeStorageSync) {
                chrome.storage.local.get(function (chromeStorageLocal) {
                    var result;
                    if ((result = _this._isFirstTime(chromeStorageLocal))) {
                        var resultFn = result;
                        resultFn(function (data) {
                            _this.setStorages(data.storageLocalCopy, data.settingsStorage, data
                                .chromeStorageLocal, callback);
                        });
                    }
                    else {
                        var storageLocalCopy = JSON.parse(JSON.stringify(chromeStorageLocal));
                        delete storageLocalCopy.resources;
                        delete storageLocalCopy.nodeStorage;
                        delete storageLocalCopy.urlDataPairs;
                        delete storageLocalCopy.resourceKeys;
                        delete storageLocalCopy.globalExcludes;
                        var settingsStorage = void 0;
                        if (chromeStorageLocal['useStorageSync']) {
                            //Parse the data before sending it to the callback
                            var indexes = chromeStorageSync['indexes'];
                            if (!indexes) {
                                chrome.storage.local.set({
                                    useStorageSync: false
                                });
                                settingsStorage = chromeStorageLocal['settings'];
                            }
                            else {
                                var settingsJsonArray_1 = [];
                                indexes.forEach(function (index) {
                                    settingsJsonArray_1.push(chromeStorageSync[index]);
                                });
                                var jsonString = settingsJsonArray_1.join('');
                                settingsStorage = JSON.parse(jsonString);
                            }
                        }
                        else {
                            //Send the "settings" object on the storage.local to the callback
                            if (!chromeStorageLocal['settings']) {
                                chrome.storage.local.set({
                                    useStorageSync: true
                                });
                                var indexes = chromeStorageSync['indexes'];
                                var settingsJsonArray_2 = [];
                                indexes.forEach(function (index) {
                                    settingsJsonArray_2.push(chromeStorageSync[index]);
                                });
                                var jsonString = settingsJsonArray_2.join('');
                                var settings = JSON.parse(jsonString);
                                settingsStorage = settings;
                            }
                            else {
                                delete storageLocalCopy.settings;
                                settingsStorage = chromeStorageLocal['settings'];
                            }
                        }
                        _this.setStorages(storageLocalCopy, settingsStorage, chromeStorageLocal, callback);
                    }
                });
            });
        };
        Storages._setIfNotSet = function (obj, key, defaultValue) {
            if (obj[key]) {
                return obj[key];
            }
            chrome.storage.local.set({
                key: defaultValue
            });
            return defaultValue;
        };
        Storages._applyChangeForStorageType = function (storageObj, changes) {
            for (var i = 0; i < changes.length; i++) {
                storageObj[changes[i].key] = changes[i].newValue;
            }
        };
        Storages._notifyNodeStorageChanges = function (id, tabId, changes) {
            //Update in storage
            globalObject.globals.crm.crmById[id].storage = globalObject.globals.storages
                .nodeStorage[id];
            chrome.storage.local.set({
                nodeStorage: globalObject.globals.storages.nodeStorage
            });
            //Notify all pages running that node
            var tabData = globalObject.globals.crmValues.tabData;
            for (var tab in tabData) {
                if (tabData.hasOwnProperty(tab) && tabData[tab]) {
                    if (~~tab !== tabId) {
                        var nodes = tabData[tab].nodes;
                        if (nodes[id]) {
                            nodes[id].port.postMessage({
                                changes: changes,
                                messageType: 'storageUpdate'
                            });
                        }
                    }
                }
            }
        };
        Storages._orderBackgroundPagesById = function (tree, obj) {
            for (var i = 0; i < tree.length; i++) {
                var child = tree[i];
                if (child.type === 'script') {
                    obj[child.id] = child.value.backgroundScript;
                }
                else if (child.type === 'menu' && child.children) {
                    this._orderBackgroundPagesById(child.children, obj);
                }
            }
        };
        Storages._upgradeVersion = function (oldVersion, newVersion) {
            //No changes yet
        };
        Storages._isFirstTime = function (storageLocal) {
            var currentVersion = chrome.runtime.getManifest().version;
            if (storageLocal.lastUpdatedAt === currentVersion) {
                return false;
            }
            else {
                if (storageLocal.lastUpdatedAt) {
                    this._upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
                    return false;
                }
                //Determine if it's a transfer from CRM version 1.*
                if (!window.localStorage.getItem('transferred')) {
                    return this.SetupHandling.handleTransfer();
                }
                else {
                    var firstRunResult = this.SetupHandling.handleFirstRun();
                    return function (resolve) {
                        resolve(firstRunResult);
                    };
                }
            }
        };
        return Storages;
    }());
    Storages.SetupHandling = (_e = (function () {
            function SetupHandling() {
            }
            SetupHandling.handleFirstRun = function (crm) {
                window.localStorage.setItem('transferred', 'true');
                //Save local storage
                chrome.storage.local.set(this._defaultLocalStorage);
                //Save sync storage
                this._uploadStorageSyncData(this._defaultSyncStorage);
                if (crm) {
                    this._defaultSyncStorage.crm = crm;
                }
                var storageLocal = this._defaultLocalStorage;
                var storageLocalCopy = JSON.parse(JSON.stringify(this._defaultLocalStorage));
                return {
                    settingsStorage: this._defaultSyncStorage,
                    storageLocalCopy: storageLocalCopy,
                    chromeStorageLocal: storageLocal
                };
            };
            SetupHandling.handleTransfer = function () {
                var _this = this;
                window.localStorage.setItem('transferred', 'true');
                return function (resolve) {
                    if (!window.CodeMirror.TernServer) {
                        //Wait until TernServer is loaded
                        window.setTimeout(function () {
                            _this.handleTransfer()(function (data) {
                                resolve(data);
                            });
                        }, 200);
                    }
                    else {
                        var result = _this.handleFirstRun(_this.TransferFromOld.transferCRMFromOld(window.localStorage.getItem('whatpage')));
                        resolve(result);
                    }
                };
            };
            SetupHandling._uploadStorageSyncData = function (data) {
                var _this = this;
                var settingsJson = JSON.stringify(data);
                //Using chrome.storage.sync
                if (settingsJson.length >= 101400) {
                    chrome.storage.local.set({
                        useStorageSync: false
                    }, function () {
                        _this._uploadStorageSyncData(data);
                    });
                }
                else {
                    //Cut up all data into smaller JSON
                    var obj = Storages.cutData(settingsJson);
                    chrome.storage.sync.set(obj, function () {
                        if (chrome.runtime.lastError) {
                            //Switch to local storage
                            console.log('Error on uploading to chrome.storage.sync ', chrome.runtime
                                .lastError);
                            chrome.storage.local.set({
                                useStorageSync: false
                            }, function () {
                                _this._uploadStorageSyncData(data);
                            });
                        }
                        else {
                            chrome.storage.local.set({
                                settings: null
                            });
                        }
                    });
                }
            };
            return SetupHandling;
        }()),
        _e.TransferFromOld = (_f = (function () {
                function TransferFromOld() {
                }
                TransferFromOld.transferCRMFromOld = function (openInNewTab) {
                    var amount = parseInt(window.localStorage.getItem('numberofrows'), 10) + 1;
                    var nodes = [];
                    for (var i = 1; i < amount; i++) {
                        nodes.push(this._parseOldCRMNode(window.localStorage.getItem(String(i)), openInNewTab));
                    }
                    //Structure nodes with children etc
                    var crm = [];
                    this._assignParents(crm, nodes, 0, nodes.length);
                    return crm;
                };
                TransferFromOld._parseOldCRMNode = function (string, openInNewTab) {
                    var node = {};
                    var _a = string.split('%123'), name = _a[0], type = _a[1], nodeData = _a[2];
                    switch (type.toLowerCase()) {
                        //Stylesheets don't exist yet so don't implement those
                        case 'link':
                            node = globalObject.globals.constants.templates.getDefaultLinkNode({
                                name: name,
                                id: Helpers.generateItemId(),
                                value: [
                                    {
                                        newTab: openInNewTab,
                                        url: nodeData
                                    }
                                ]
                            });
                            break;
                        case 'divider':
                            node = globalObject.globals.constants.templates.getDefaultDividerNode({
                                name: name,
                                id: Helpers.generateItemId()
                            });
                            break;
                        case 'menu':
                            node = globalObject.globals.constants.templates.getDefaultMenuNode({
                                name: name,
                                id: Helpers.generateItemId(),
                                children: nodeData
                            });
                            break;
                        case 'script':
                            var _b = nodeData.split('%124'), scriptLaunchMode = _b[0], scriptData = _b[1];
                            var triggers = void 0;
                            var launchModeString = scriptLaunchMode + '';
                            if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
                                triggers = launchModeString.split('1,')[1].split(',').map(function (item) {
                                    return {
                                        not: false,
                                        url: item.trim()
                                    };
                                }).filter(function (item) {
                                    return item.url !== '';
                                });
                                scriptLaunchMode = '2';
                            }
                            var id = Helpers.generateItemId();
                            node = globalObject.globals.constants.templates.getDefaultScriptNode({
                                name: name,
                                id: id,
                                value: {
                                    launchMode: parseInt(scriptLaunchMode, 10),
                                    updateNotice: true,
                                    oldScript: scriptData,
                                    script: Storages.SetupHandling.TransferFromOld.LegacyScriptReplace
                                        .convertScriptFromLegacy(scriptData, function (oldScriptErrors, newScriptErrors, parseError) {
                                        chrome.storage.local.get(function (keys) {
                                            keys['upgradeErrors'] = keys['upgradeErrors'] || {};
                                            keys['upgradeErrors'][id] = {
                                                oldScript: oldScriptErrors,
                                                newScript: newScriptErrors,
                                                parseError: parseError
                                            };
                                            chrome.storage.local.set({ upgradeErrors: keys['upgradeErrors'] });
                                        });
                                    })
                                }
                            });
                            if (triggers) {
                                node.triggers = triggers;
                            }
                            break;
                    }
                    return node;
                };
                TransferFromOld._assignParents = function (parent, nodes, startIndex, endIndex) {
                    for (var i = startIndex; i < endIndex; i++) {
                        var currentIndex = i;
                        if (nodes[i].type === 'menu') {
                            var menuNode = nodes[i];
                            var start = i + 1;
                            //The amount of children it has
                            i += parseInt(menuNode.children, 10);
                            var end = i + 1;
                            var children = [];
                            this._assignParents(children, nodes, start, end);
                        }
                        parent.push(nodes[currentIndex]);
                    }
                };
                return TransferFromOld;
            }()),
            _f.LegacyScriptReplace = (function () {
                function LegacyScriptReplace() {
                }
                LegacyScriptReplace.isProperty = function (toCheck, prop) {
                    if (toCheck === prop) {
                        return true;
                    }
                    return toCheck.replace(/['|"|`]/g, '') === prop;
                };
                LegacyScriptReplace.getCallLines = function (lines, lineSeperators, start, end) {
                    var line = {};
                    for (var i = 0; i < lineSeperators.length; i++) {
                        var sep = lineSeperators[i];
                        if (sep.start <= start) {
                            line.from = {
                                index: sep.start,
                                line: i
                            };
                        }
                        if (sep.end >= end) {
                            line.to = {
                                index: sep.end,
                                line: i
                            };
                            break;
                        }
                    }
                    return line;
                };
                LegacyScriptReplace.getFunctionCallExpressions = function (data) {
                    //Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
                    var index = data.parentExpressions.length - 1;
                    var expr = data.parentExpressions[index];
                    while (expr && expr.type !== 'CallExpression') {
                        expr = data.parentExpressions[--index];
                    }
                    return data.parentExpressions[index];
                };
                LegacyScriptReplace.getChromeAPI = function (expr, data) {
                    data.functionCall = data.functionCall.map(function (prop) {
                        return prop.replace(/['|"|`]/g, '');
                    });
                    var functionCall = data.functionCall;
                    functionCall = functionCall.reverse();
                    if (functionCall[0] === 'chrome') {
                        functionCall.splice(0, 1);
                    }
                    var argsStart = expr.callee.end;
                    var argsEnd = expr.end;
                    var args = data.persistent.script.slice(argsStart, argsEnd);
                    return {
                        call: functionCall.join('.'),
                        args: args
                    };
                };
                LegacyScriptReplace.getLineIndexFromTotalIndex = function (lines, line, index) {
                    for (var i = 0; i < line; i++) {
                        index -= lines[i].length + 1;
                    }
                    return index;
                };
                LegacyScriptReplace.replaceChromeFunction = function (data, expr, callLine) {
                    if (data.isReturn && !data.isValidReturn) {
                        return;
                    }
                    var lines = data.persistent.lines;
                    //Get chrome API
                    var chromeAPI = this.getChromeAPI(expr, data);
                    var firstLine = data.persistent.lines[callLine.from.line];
                    var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
                        expr.callee.start));
                    var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, expr.callee.end);
                    var newLine = firstLine.slice(0, lineExprStart) +
                        'window.crmAPI.chrome(\'' +
                        chromeAPI.call +
                        '\')' +
                        firstLine.slice(lineExprEnd);
                    if (newLine[newLine.length - 1] === ';') {
                        newLine = newLine.slice(0, newLine.length - 1);
                    }
                    if (data.isReturn) {
                        newLine += ".return(function(" + data.returnName + ") {";
                        var usesTabs = true;
                        var spacesAmount = 0;
                        //Find out if the writer uses tabs or spaces
                        for (var i = 0; i < data.persistent.lines.length; i++) {
                            if (data.persistent.lines[i].indexOf('	') === 0) {
                                usesTabs = true;
                                break;
                            }
                            else if (data.persistent.lines[i].indexOf('  ') === 0) {
                                var split = data.persistent.lines[i].split(' ');
                                for (var j = 0; j < split.length; j++) {
                                    if (split[j] === ' ') {
                                        spacesAmount++;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                usesTabs = false;
                                break;
                            }
                        }
                        var indent = void 0;
                        if (usesTabs) {
                            indent = '	';
                        }
                        else {
                            indent = new Array(spacesAmount).join(' ');
                        }
                        for (var i = callLine.to
                            .line +
                            1; i < data.persistent.lines.length; i++) {
                            data.persistent.lines[i] = indent + data.persistent.lines[i];
                        }
                        data.persistent.lines.push('}).send();');
                    }
                    else {
                        newLine += '.send();';
                    }
                    lines[callLine.from.line] = newLine;
                    return;
                };
                LegacyScriptReplace.callsChromeFunction = function (callee, data, onError) {
                    data.parentExpressions.push(callee);
                    //Check if the function has any arguments and check those first
                    if (callee.arguments && callee.arguments.length > 0) {
                        for (var i = 0; i < callee.arguments.length; i++) {
                            if (this.findChromeExpression(callee.arguments[i], this
                                .removeObjLink(data), onError)) {
                                return true;
                            }
                        }
                    }
                    if (callee.type !== 'MemberExpression') {
                        //This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
                        return this.findChromeExpression(callee, this.removeObjLink(data), onError);
                    }
                    //Continue checking the call itself
                    if (callee.property) {
                        data.functionCall = data.functionCall || [];
                        data.functionCall.push(callee.property.name || callee.property.raw);
                    }
                    if (callee.object && callee.object.name) {
                        //First object
                        var isWindowCall = (this.isProperty(callee.object.name, 'window') &&
                            this.isProperty(callee.property.name || callee.property.raw, 'chrome'));
                        if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
                            data.expression = callee;
                            var expr = this.getFunctionCallExpressions(data);
                            var callLines = this.getCallLines(data.persistent.lines, data
                                .persistent
                                .lineSeperators, expr.start, expr.end);
                            if (data.isReturn && !data.isValidReturn) {
                                callLines.from.index = this.getLineIndexFromTotalIndex(data.persistent
                                    .lines, callLines.from.line, callLines.from.index);
                                callLines.to.index = this.getLineIndexFromTotalIndex(data.persistent
                                    .lines, callLines.to.line, callLines.to.index);
                                onError(callLines, data.persistent.passes);
                                return false;
                            }
                            if (!data.persistent.diagnostic) {
                                this.replaceChromeFunction(data, expr, callLines);
                            }
                            return true;
                        }
                    }
                    else if (callee.object) {
                        return this.callsChromeFunction(callee.object, data, onError);
                    }
                    return false;
                };
                LegacyScriptReplace.removeObjLink = function (data) {
                    var parentExpressions = data.parentExpressions || [];
                    var newObj = {};
                    for (var key in data) {
                        if (data.hasOwnProperty(key) &&
                            key !== 'parentExpressions' &&
                            key !== 'persistent') {
                            newObj[key] = data[key];
                        }
                    }
                    var newParentExpressions = [];
                    for (var i = 0; i < parentExpressions.length; i++) {
                        newParentExpressions.push(parentExpressions[i]);
                    }
                    newObj.persistent = data.persistent;
                    newObj.parentExpressions = newParentExpressions;
                    return newObj;
                };
                LegacyScriptReplace.findChromeExpression = function (expression, data, onError) {
                    data.parentExpressions = data.parentExpressions || [];
                    data.parentExpressions.push(expression);
                    switch (expression.type) {
                        case 'VariableDeclaration':
                            data.isValidReturn = expression.declarations.length === 1;
                            for (var i = 0; i < expression.declarations.length; i++) {
                                //Check if it's an actual chrome assignment
                                var declaration = expression.declarations[i];
                                if (declaration.init) {
                                    var decData = this.removeObjLink(data);
                                    var returnName = declaration.id.name;
                                    decData.isReturn = true;
                                    decData.returnExpr = expression;
                                    decData.returnName = returnName;
                                    if (this.findChromeExpression(declaration.init, decData, onError)) {
                                        return true;
                                    }
                                }
                            }
                            break;
                        case 'CallExpression':
                        case 'MemberExpression':
                            if (expression.arguments && expression.arguments.length > 0) {
                                for (var i = 0; i < expression.arguments.length; i++) {
                                    if (this.findChromeExpression(expression.arguments[i], this
                                        .removeObjLink(data), onError)) {
                                        return true;
                                    }
                                }
                            }
                            data.functionCall = [];
                            return this.callsChromeFunction(expression.callee, data, onError);
                        case 'AssignmentExpression':
                            data.isReturn = true;
                            data.returnExpr = expression;
                            data.returnName = expression.left.name;
                            return this.findChromeExpression(expression.right, data, onError);
                        case 'FunctionExpression':
                        case 'FunctionDeclaration':
                            data.isReturn = false;
                            for (var i = 0; i < expression.body.body.length; i++) {
                                if (this.findChromeExpression(expression.body.body[i], this
                                    .removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                        case 'ExpressionStatement':
                            return this.findChromeExpression(expression.expression, data, onError);
                        case 'SequenceExpression':
                            data.isReturn = false;
                            var lastExpression = expression.expressions.length - 1;
                            for (var i = 0; i < expression.expressions.length; i++) {
                                if (i === lastExpression) {
                                    data.isReturn = true;
                                }
                                if (this.findChromeExpression(expression.expressions[i], this
                                    .removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                        case 'UnaryExpression':
                        case 'ConditionalExpression':
                            data.isValidReturn = false;
                            data.isReturn = true;
                            if (this.findChromeExpression(expression.consequent, this
                                .removeObjLink(data), onError)) {
                                return true;
                            }
                            if (this.findChromeExpression(expression.alternate, this
                                .removeObjLink(data), onError)) {
                                return true;
                            }
                            break;
                        case 'IfStatement':
                            data.isReturn = false;
                            if (this.findChromeExpression(expression.consequent, this
                                .removeObjLink(data), onError)) {
                                return true;
                            }
                            if (expression.alternate &&
                                this.findChromeExpression(expression.alternate, this
                                    .removeObjLink(data), onError)) {
                                return true;
                            }
                            break;
                        case 'LogicalExpression':
                            data.isReturn = true;
                            data.isValidReturn = false;
                            if (this.findChromeExpression(expression.left, this.removeObjLink(data), onError)) {
                                return true;
                            }
                            if (this.findChromeExpression(expression.right, this
                                .removeObjLink(data), onError)) {
                                return true;
                            }
                            break;
                        case 'BlockStatement':
                            data.isReturn = false;
                            for (var i = 0; i < expression.body.length; i++) {
                                if (this.findChromeExpression(expression.body[i], this
                                    .removeObjLink(data), onError)) {
                                    return true;
                                }
                            }
                            break;
                        case 'ReturnStatement':
                            data.isReturn = true;
                            data.returnExpr = expression;
                            data.isValidReturn = false;
                            return this.findChromeExpression(expression.argument, data, onError);
                    }
                    return false;
                };
                LegacyScriptReplace.generateOnError = function (container) {
                    return function (position, passes) {
                        if (!container[passes]) {
                            container[passes] = [position];
                        }
                        else {
                            container[passes].push(position);
                        }
                    };
                };
                LegacyScriptReplace.replaceChromeCalls = function (lines, passes, onError) {
                    //Analyze the file
                    var file = new window.TernFile('[doc]');
                    file.text = lines.join('\n');
                    var srv = new window.CodeMirror.TernServer({
                        defs: [window.ecma5, window.ecma6, window.jqueryDefs, window.browserDefs]
                    });
                    window.tern.withContext(srv.cx, function () {
                        file.ast = window.tern.parse(file.text, srv.passes, {
                            directSourceFile: file,
                            allowReturnOutsideFunction: true,
                            allowImportExportEverywhere: true,
                            ecmaVersion: srv.ecmaVersion
                        });
                    });
                    var scriptExpressions = file.ast.body;
                    var index = 0;
                    var lineSeperators = [];
                    for (var i = 0; i < lines.length; i++) {
                        lineSeperators.push({
                            start: index,
                            end: index += lines[i].length + 1
                        });
                    }
                    var script = file.text;
                    //Check all expressions for chrome calls
                    var persistentData = {
                        lines: lines,
                        lineSeperators: lineSeperators,
                        script: script,
                        passes: passes
                    };
                    var expression;
                    if (passes === 0) {
                        //Do one check, not replacing anything, to find any possible errors already
                        persistentData.diagnostic = true;
                        for (var i = 0; i < scriptExpressions.length; i++) {
                            expression = scriptExpressions[i];
                            this.findChromeExpression(expression, {
                                persistent: persistentData
                            }, onError);
                        }
                        persistentData.diagnostic = false;
                    }
                    for (var i = 0; i < scriptExpressions.length; i++) {
                        expression = scriptExpressions[i];
                        if (this.findChromeExpression(expression, {
                            persistent: persistentData
                        }, onError)) {
                            script = this.replaceChromeCalls(persistentData.lines.join('\n')
                                .split('\n'), passes + 1, onError);
                            break;
                        }
                    }
                    return script;
                };
                LegacyScriptReplace.removePositionDuplicates = function (arr) {
                    var jsonArr = [];
                    arr.forEach(function (item, index) {
                        jsonArr[index] = JSON.stringify(item);
                    });
                    jsonArr = jsonArr.filter(function (item, pos) {
                        return jsonArr.indexOf(item) === pos;
                    });
                    return jsonArr.map(function (item) {
                        return JSON.parse(item);
                    });
                };
                LegacyScriptReplace.convertScriptFromLegacy = function (script, onError) {
                    //Remove execute locally
                    var lineIndex = script.indexOf('/*execute locally*/');
                    if (lineIndex !== -1) {
                        script = script.replace('/*execute locally*/\n', '');
                        if (lineIndex === script.indexOf('/*execute locally*/')) {
                            script = script.replace('/*execute locally*/', '');
                        }
                    }
                    var errors = [];
                    try {
                        script = this.replaceChromeCalls(script.split('\n'), 0, this.generateOnError(errors));
                    }
                    catch (e) {
                        onError(null, null, true);
                    }
                    var firstPassErrors = errors[0];
                    var finalPassErrors = errors[errors.length - 1];
                    if (finalPassErrors) {
                        onError(this.removePositionDuplicates(firstPassErrors), this.removePositionDuplicates(finalPassErrors));
                    }
                    return script;
                };
                return LegacyScriptReplace;
            }()),
            _f),
        //Local storage
        _e._defaultLocalStorage = {
            requestPermissions: [],
            editing: null,
            selectedCrmType: 0,
            jsLintGlobals: ['window', '$', 'jQuery', 'crmAPI'],
            globalExcludes: [''],
            latestId: 0,
            useStorageSync: true,
            notFirstTime: true,
            lastUpdatedAt: chrome.runtime.getManifest().version,
            authorName: 'anonymous',
            showOptions: true,
            recoverUnsavedData: false,
            CRMOnPage: ~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]
                .split('.')[0] > 34,
            editCRMInRM: false,
            hideToolsRibbon: false,
            shrinkTitleRibbon: false,
            libraries: [
                { "location": 'jQuery.js', "name": 'jQuery' },
                { "location": 'mooTools.js', "name": 'mooTools' },
                { "location": 'YUI.js', "name": 'YUI' },
                { "location": 'Angular.js', "name": 'Angular' },
                { "location": 'jqlite.js', "name": 'jqlite' }
            ]
        },
        //Sync storage
        _e._defaultSyncStorage = {
            editor: {
                keyBindings: {
                    autocomplete: 'Ctrl-Space',
                    showType: 'Ctrl-I',
                    showDocs: 'Ctrl-O',
                    goToDef: 'Alt-.',
                    rename: 'Ctrl-Q',
                    selectName: 'Ctrl-.'
                },
                tabSize: '4',
                theme: 'dark',
                useTabs: true,
                zoom: '100'
            },
            crm: [
                globalObject.globals.constants.templates.getDefaultLinkNode({
                    id: Helpers.generateItemId()
                })
            ]
        },
        _e);
    ;
    (function () {
        Storages.loadStorages(function () {
            try {
                GlobalDeclarations.refreshPermissions();
                GlobalDeclarations.setHandlerFunction();
                chrome.runtime.onConnect.addListener(function (port) {
                    port.onMessage.addListener(window.createHandlerFunction(port));
                });
                chrome.runtime.onMessage.addListener(MessageHandling.handleRuntimeMessage);
                CRM.buildPageCRM();
                CRM.Script.Background.createBackgroundPages();
                GlobalDeclarations.init();
                //Checks if all values are still correct
                Resources.checkIfResourcesAreUsed();
                Resources.updateResourceValues();
                CRM.Script.Updating.updateScripts();
                window.setInterval(function () {
                    CRM.Script.Updating.updateScripts();
                }, 6 * 60 * 60 * 1000);
                GlobalDeclarations.initGlobalFunctions();
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    })();
    var _a, _b, _c, _d, _e, _f;
    //#endregion
})(chrome.runtime.getURL('').split('://')[1]
    .split('/')[0], 
//Gets the extension's URL through a blocking instead of a callback function
typeof module !== 'undefined' || window.isDev ? window : {}, (function (sandboxes) {
    function sandboxChromeFunction(window, sandboxes, chrome, fn, context, args) {
        return fn.apply(context, args);
    }
    sandboxes.sandboxChrome = function (api, args) {
        var context = {};
        var fn = window.chrome;
        var apiSplit = api.split('.');
        for (var i = 0; i < apiSplit.length; i++) {
            context = fn;
            fn = fn[apiSplit[i]];
        }
        var result = sandboxChromeFunction(null, null, null, fn, context, args);
        return result;
    };
    return sandboxes;
})((function () {
    var sandboxes = {};
    function SandboxWorker(id, script, libraries, secretKey, getInstances) {
        this.script = script;
        var worker = this.worker = new Worker('/js/sandbox.js');
        this.id = id;
        this.post = function (message) {
            worker.postMessage(message);
        };
        var callbacks = [];
        this.listen = function (callback) {
            callbacks.push(callback);
        };
        function postMessage(message) {
            worker.postMessage({
                type: 'message',
                message: JSON.stringify(message),
                key: secretKey.join('') + id + 'verified'
            });
        }
        var handler = window.createHandlerFunction({
            postMessage: postMessage
        });
        function verifyKey(message, callback) {
            if (message.key.join('') === secretKey.join('')) {
                callback(JSON.parse(message.data));
            }
            else {
                window.backgroundPageLog(id, null, 'Tried to send an unauthenticated message');
            }
        }
        var verified = false;
        worker.addEventListener('message', function (e) {
            var data = e.data;
            switch (data.type) {
                case 'handshake':
                case 'crmapi':
                    if (!verified) {
                        window.backgroundPageLog(id, null, 'Ininitialized background page');
                        worker.postMessage({
                            type: 'verify',
                            instances: getInstances()
                        });
                        verified = true;
                    }
                    verifyKey(data, handler);
                    break;
                case 'log':
                    window.backgroundPageLog.apply(window, [id, [data.lineNo, data.logId]].concat(JSON
                        .parse(data.data)));
                    break;
            }
            if (callbacks) {
                callbacks.forEach(function (callback) {
                    callback(data);
                });
                callbacks = [];
            }
        }, false);
        worker.postMessage({
            type: 'init',
            id: id,
            script: script,
            libraries: libraries
        });
    }
    sandboxes.sandbox = function (id, script, libraries, secretKey, getInstances, callback) {
        callback(new SandboxWorker(id, script, libraries, secretKey, getInstances));
    };
    return sandboxes;
})()));
if (typeof module === 'undefined') {
    console.log('If you\'re here to check out your background script,' +
        ' get its ID (you can type getID("name") to find the ID),' +
        ' and type filter(id, [optional tabId]) to show only those messages.' +
        ' You can also visit the logging page for even better logging over at ', chrome.runtime.getURL('html/logging.html'));
}
