"use strict";
var storageListeners = [];
var StorageGenerator = (function () {
    function StorageGenerator(_storageType) {
        this._storageType = _storageType;
        this._container = JSON.parse(localStorage.getItem(_storageType)) || {};
    }
    StorageGenerator.prototype._syncToLocalStorage = function () {
        localStorage.setItem(this._storageType, JSON.stringify(this._container));
    };
    StorageGenerator.prototype.get = function (keyOrCallback, callback) {
        var _a;
        var key;
        if (typeof keyOrCallback === 'function') {
            callback = keyOrCallback;
            key = void 0;
        }
        else {
            key = keyOrCallback;
        }
        TypeChecking.typeCheck({
            key: key,
            callback: callback
        }, [{
                val: 'key',
                type: 'string',
                optional: true
            }, {
                val: 'callback',
                type: 'function'
            }]);
        callback(!key ? this._container : (_a = {},
            _a[key] = this._container[key],
            _a));
    };
    StorageGenerator.prototype.set = function (data, callback) {
        var _a;
        checkOnlyCallback(callback, true);
        for (var key in data) {
            var oldData = this._container[key];
            this._container[key] = data[key];
            var changedData = (_a = {},
                _a[key] = {
                    oldValue: oldData,
                    newValue: data[key]
                },
                _a);
            for (var _i = 0, storageListeners_1 = storageListeners; _i < storageListeners_1.length; _i++) {
                var storageListener = storageListeners_1[_i];
                storageListener(changedData, this._storageType);
            }
        }
        this._syncToLocalStorage();
        callback && callback(this._container);
    };
    StorageGenerator.prototype.clear = function (callback) {
        checkOnlyCallback(callback, true);
        if (this._storageType === 'sync') {
            this._container = {};
        }
        else {
            this._container = {};
        }
        this._syncToLocalStorage();
        callback && callback();
    };
    return StorageGenerator;
}());
var extensionId = 'glloknfjojplkpphcmpgkcemckbcbmhe';
var onMessageListener = null;
var usedIds = [];
function findItemWithId(arr, idToFind, fn) {
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        var id = item.id, children = item.children;
        if (areStringsEqual(id, idToFind)) {
            fn(item, i, arr);
            return true;
        }
        if (children && findItemWithId(children, idToFind, fn)) {
            return true;
        }
    }
    return false;
}
var TypeChecking;
(function (TypeChecking) {
    function getDotValue(source, index) {
        var indexes = index.split('.');
        var currentValue = source;
        for (var i = 0; i < indexes.length; i++) {
            if (indexes[i] in currentValue) {
                currentValue = currentValue[indexes[i]];
            }
            else {
                return undefined;
            }
        }
        return currentValue;
    }
    function dependencyMet(data, optionals) {
        if (data.dependency && !optionals[data.dependency]) {
            optionals[data.val] = false;
            return false;
        }
        return true;
    }
    function isDefined(data, value, optionals) {
        if (value === undefined || value === null) {
            if (data.optional) {
                optionals[data.val] = false;
                return 'continue';
            }
            else {
                throw new Error("Value for " + data.val + " is not set");
            }
        }
        return true;
    }
    function typesMatch(data, value) {
        var types = Array.isArray(data.type) ? data.type : [data.type];
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            if (type === 'array') {
                if (typeof value === 'object' && Array.isArray(value)) {
                    return type;
                }
            }
            else if (type === 'enum') {
                if (data.enum.indexOf(value) > -1) {
                    return type;
                }
            }
            if (typeof value === type) {
                return type;
            }
        }
        throw new Error("Value for " + data.val + " is not of type " + types.join(' or '));
    }
    function checkNumberConstraints(data, value) {
        if (data.min !== undefined) {
            if (data.min > value) {
                throw new Error("Value for " + data.val + " is smaller than " + data.min);
            }
        }
        if (data.max !== undefined) {
            if (data.max < value) {
                throw new Error("Value for " + data.val + " is bigger than " + data.max);
            }
        }
        return true;
    }
    function checkArrayChildType(data, value, forChild) {
        var types = Array.isArray(forChild.type) ? forChild.type : [forChild.type];
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            if (type === 'array') {
                if (Array.isArray(value)) {
                    return true;
                }
            }
            else if (typeof value === type) {
                return true;
            }
        }
        throw new Error("For not all values in the array " + data.val + " is the property " + forChild.val + " of type " + types.join(' or '));
    }
    function checkArrayChildrenConstraints(data, values) {
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            for (var _a = 0, _b = data.forChildren; _a < _b.length; _a++) {
                var forChild = _b[_a];
                var childValue = value[forChild.val];
                if (childValue === undefined || childValue === null) {
                    if (!forChild.optional) {
                        throw new Error("For not all values in the array " + data.val + " is the property " + forChild.val + " defined");
                    }
                }
                else if (!checkArrayChildType(data, childValue, forChild)) {
                    return false;
                }
            }
        }
        return true;
    }
    function checkConstraints(data, value) {
        if (typeof value === 'number') {
            return checkNumberConstraints(data, value);
        }
        if (Array.isArray(value) && data.forChildren) {
            return checkArrayChildrenConstraints(data, value);
        }
        return true;
    }
    function typeCheck(args, toCheck) {
        var optionals = {};
        for (var _i = 0, toCheck_1 = toCheck; _i < toCheck_1.length; _i++) {
            var data = toCheck_1[_i];
            if (!dependencyMet(data, optionals)) {
                continue;
            }
            var value = getDotValue(args, data.val);
            var isDef = isDefined(data, value, optionals);
            if (isDef === true) {
                var matchedType = typesMatch(data, value);
                if (matchedType) {
                    optionals[data.val] = true;
                    checkConstraints(data, value);
                    continue;
                }
            }
            else if (isDef === 'continue') {
                continue;
            }
            return false;
        }
        return true;
    }
    TypeChecking.typeCheck = typeCheck;
    ;
})(TypeChecking || (TypeChecking = {}));
function checkOnlyCallback(callback, optional) {
    TypeChecking.typeCheck({
        callback: callback
    }, [{
            val: 'callback',
            type: 'function',
            optional: optional
        }]);
}
var contexts = ['all', 'page', 'frame', 'selection', 'link',
    'editable', 'image', 'video', 'audio', 'launcher',
    'browser_action', 'page_action'];
function areStringsEqual(a, b) {
    return (a + '') === (b + '');
}
var FakeCRMAPI = (function () {
    function FakeCRMAPI() {
        this.debugOnError = false;
    }
    FakeCRMAPI.prototype.onReady = function (callback) {
        callback();
    };
    return FakeCRMAPI;
}());
;
var testWindow = window;
testWindow.chrome = {
    _lastSpecialCall: null,
    _currentContextMenu: [],
    _activeTabs: [],
    _executedScripts: [],
    _fakeTabs: {},
    _tabUpdateListeners: [],
    _activatedBackgroundPages: [],
    _clearExecutedScripts: function () {
        while (testWindow.chrome._executedScripts.pop()) { }
    },
    commands: {
        onCommand: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        getAll: function (callback) {
            checkOnlyCallback(callback, false);
            callback([]);
        }
    },
    contextMenus: {
        create: function (data, callback) {
            var id = ~~(Math.random() * 1000000) + 1;
            while (usedIds.indexOf(id) > -1) {
                id = ~~(Math.random() * 1000000) + 1;
            }
            TypeChecking.typeCheck({
                data: data,
                callback: callback
            }, [{
                    val: 'data',
                    type: 'object'
                }, {
                    val: 'data.type',
                    type: 'enum',
                    enum: ['normal', 'checkbox', 'radio', 'separator'],
                    optional: true
                }, {
                    val: 'data.id',
                    type: 'string',
                    optional: true
                }, {
                    val: 'data.title',
                    type: 'string',
                    optional: data.type === 'separator'
                }, {
                    val: 'data.checked',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.contexts',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.onclick',
                    type: 'function',
                    optional: true
                }, {
                    val: 'data.parentId',
                    type: ['number', 'string'],
                    optional: true
                }, {
                    val: 'data.documentUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.targetUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.enabled',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            if (data.contexts && data.contexts.filter(function (element) {
                return contexts.indexOf(element) === -1;
            }).length !== 0) {
                throw new Error('Not all context values are in the enum');
            }
            data.type = data.type || 'normal';
            data.documentUrlPatterns = data.documentUrlPatterns || [];
            usedIds.push(id);
            if (data.parentId) {
                findItemWithId(testWindow.chrome._currentContextMenu, data.parentId, function (parent) {
                    parent.children.push({
                        id: id,
                        createProperties: data,
                        currentProperties: data,
                        children: []
                    });
                });
            }
            else {
                testWindow.chrome._currentContextMenu.push({
                    id: id,
                    createProperties: data,
                    currentProperties: data,
                    children: []
                });
            }
            callback && callback();
            return id;
        },
        update: function (id, data, callback) {
            TypeChecking.typeCheck({
                id: id,
                data: data,
                callback: callback
            }, [{
                    val: 'id',
                    type: ['number', 'string']
                }, {
                    val: 'data',
                    type: 'object'
                }, {
                    val: 'data.type',
                    type: 'enum',
                    enum: ['normal', 'checkbox', 'radio', 'separator'],
                    optional: true
                }, {
                    val: 'data.title',
                    type: 'string',
                    optional: true
                }, {
                    val: 'data.checked',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.contexts',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.onclick',
                    type: 'function',
                    optional: true
                }, {
                    val: 'data.parentId',
                    type: ['number', 'string'],
                    optional: true
                }, {
                    val: 'data.documentUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.targetUrlPatterns',
                    type: 'array',
                    optional: true
                }, {
                    val: 'data.enabled',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            if (data.contexts && data.contexts.filter(function (element) {
                return contexts.indexOf(element) > -1;
            }).length !== 0) {
                throw new Error('Not all context values are in the enum');
            }
            if (!findItemWithId(testWindow.chrome._currentContextMenu, id, function (item) {
                var currentProperties = item.currentProperties;
                for (var key in data) {
                    currentProperties[key] = data[key];
                }
            })) {
                testWindow.chrome.runtime.lastError = new Error('No contextMenu with id ' + id + ' exists');
            }
            callback && callback();
            testWindow.chrome.runtime.lastError = undefined;
        },
        remove: function (id, callback) {
            TypeChecking.typeCheck({
                id: id,
                callback: callback
            }, [{
                    val: 'id',
                    type: ['number', 'string']
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            if (!findItemWithId(testWindow.chrome._currentContextMenu, id, function (_item, index, parent) {
                parent.splice(index, 1);
            })) {
                testWindow.chrome.runtime.lastError = new Error('No contextMenu with id ' + id + ' exists');
            }
            callback && callback();
        },
        removeAll: function (callback) {
            checkOnlyCallback(callback, true);
            while (testWindow.chrome._currentContextMenu.length > 0) {
                testWindow.chrome._currentContextMenu.pop();
            }
            callback && callback();
        }
    },
    downloads: {
        download: function (settings, callback) {
            TypeChecking.typeCheck({
                options: settings,
                callback: callback
            }, [{
                    val: 'options',
                    type: 'object'
                }, {
                    val: 'options.url',
                    type: 'string'
                }, {
                    val: 'options.filename',
                    type: 'string',
                    optional: true
                }, {
                    val: 'options.conflictAction',
                    type: 'enum',
                    enum: ['uniquify', 'overwrite', 'prompt'],
                    optional: true
                }, {
                    val: 'options.saveAs',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.method',
                    type: 'enum',
                    enum: ['GET', 'POST'],
                    optional: true
                }, {
                    val: 'options.headers',
                    type: 'array',
                    forChildren: [{
                            val: 'name',
                            type: 'string'
                        }, {
                            val: 'value',
                            type: 'string'
                        }],
                    optional: true
                }, {
                    val: 'options.body',
                    type: 'string',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            testWindow.chrome._lastSpecialCall = {
                api: 'downloads.download',
                args: [settings]
            };
        }
    },
    runtime: {
        getManifest: function () {
            return {
                short_name: 'dev',
                version: '2.0'
            };
        },
        connect: function (extensionId, connectInfo) {
            if (connectInfo === void 0 && typeof extensionId !== 'string') {
                connectInfo = extensionId;
                extensionId = void 0;
            }
            TypeChecking.typeCheck({
                extensionId: extensionId,
                connectInfo: connectInfo
            }, [{
                    val: 'extensionId',
                    type: 'string',
                    optional: true
                }, {
                    val: 'connectInfo',
                    type: 'object',
                    optional: true
                }, {
                    val: 'connectInfo.name',
                    type: 'string',
                    optional: true,
                    dependency: 'connectInfo'
                }, {
                    val: 'connectInfo.includeTlsChannelId',
                    type: 'boolean',
                    optional: true,
                    dependency: 'connectInfo'
                }]);
            return {
                onMessage: {
                    addListener: function (callback) {
                        checkOnlyCallback(callback, false);
                    },
                    removeListener: function (callback) {
                        checkOnlyCallback(callback, false);
                    }
                },
                postMessage: function (message) {
                    if (typeof message === void 0) {
                        throw new Error('No message passed');
                    }
                }
            };
        },
        openOptionsPage: function (callback) {
            checkOnlyCallback(callback, true);
            callback && callback();
        },
        getURL: function (arg) {
            TypeChecking.typeCheck({
                arg: arg
            }, [{
                    val: 'arg',
                    type: 'string'
                }]);
            if (arg === 'js/libraries/crmapi.d.ts') {
                return '/build/' + arg;
            }
            switch (BrowserAPI.getBrowser()) {
                case 'firefox':
                    return 'moz-extension://' + extensionId + '/' + arg;
                case 'edge':
                    return 'ms-browser-extension://' + extensionId + '/' + arg;
                case 'opera':
                case 'chrome':
                    return 'chrome-extension://' + extensionId + '/' + arg;
            }
            return '?://' + extensionId + '/' + arg;
        },
        id: extensionId,
        reload: function () { },
        restart: function () { },
        restartAfterDelay: function (seconds, callback) {
            TypeChecking.typeCheck({
                seconds: seconds,
                callback: callback
            }, [{
                    val: 'seconds',
                    type: 'number',
                    min: -1
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            callback && callback();
        },
        getPlatformInfo: function (callback) {
            checkOnlyCallback(callback, false);
            callback({});
        },
        getPackageDirectoryEntry: function (callback) {
            checkOnlyCallback(callback, false);
            callback({});
        },
        lastError: undefined,
        onConnect: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onMessage: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
                onMessageListener = listener;
            }
        },
        sendMessage: function (extensionId, message, options, responseCallback) {
            if (typeof extensionId !== 'string') {
                responseCallback = options;
                options = message;
                message = extensionId;
                extensionId = void 0;
            }
            if (typeof options === 'function') {
                responseCallback = options;
                options = void 0;
            }
            TypeChecking.typeCheck({
                extensionId: extensionId,
                message: message,
                options: options,
                responseCallback: responseCallback
            }, [{
                    val: 'extensionId',
                    type: 'string',
                    optional: true
                }, {
                    val: 'options',
                    type: 'object',
                    optional: true
                }, {
                    val: 'options.includeTisChannelId',
                    type: 'boolean',
                    optional: true,
                    dependency: 'options'
                }, {
                    val: 'responseCallback',
                    type: 'function',
                    optional: true
                }]);
            onMessageListener && onMessageListener(message, options, responseCallback);
        },
        getBackgroundPage: function (callback) {
            checkOnlyCallback(callback, false);
            callback(window);
        },
        onInstalled: {
            addListener: function (callback) {
                checkOnlyCallback(callback, false);
            }
        }
    },
    extension: {
        isAllowedFileSchemeAccess: function (callback) {
            checkOnlyCallback(callback, false);
            callback(true);
        }
    },
    i18n: {
        getAcceptLanguages: function (callback) {
            callback(['en', 'en-US']);
        },
        getMessage: function (messageName, _substitutions) {
            return messageName;
        },
        getUILanguage: function () {
            return 'en';
        }
    },
    tabs: {
        get: function (id, callback) {
            TypeChecking.typeCheck({
                id: id,
                callback: callback
            }, [{
                    val: 'id',
                    type: 'number'
                }, {
                    val: 'callback',
                    type: 'function'
                }]);
            if (!testWindow.chrome._fakeTabs[id]) {
                testWindow.chrome.runtime.lastError = new Error('No tab with id ' + id);
            }
            callback(testWindow.chrome._fakeTabs[id]);
            testWindow.chrome.runtime.lastError = undefined;
        },
        getCurrent: function (callback) {
            checkOnlyCallback(callback, false);
            callback({});
        },
        onRemoved: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        executeScript: function (tabId, scriptSettings, callback) {
            if (typeof tabId !== 'number') {
                callback = scriptSettings;
                scriptSettings = tabId;
                tabId = void 0;
            }
            TypeChecking.typeCheck({
                tabId: tabId,
                details: scriptSettings,
                callback: callback
            }, [{
                    val: 'tabId',
                    type: 'number',
                    optional: true
                }, {
                    val: 'details',
                    type: 'object'
                }, {
                    val: 'details.code',
                    type: 'string',
                    optional: scriptSettings && scriptSettings.file !== void 0
                }, {
                    val: 'details.file',
                    type: 'string',
                    optional: scriptSettings && scriptSettings.code !== void 0
                }, {
                    val: 'details.allFrames',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'details.frameId',
                    type: 'number',
                    optional: true
                }, {
                    val: 'details.matchAboutBlank',
                    type: 'number',
                    optional: true
                }, {
                    val: 'details.runAt',
                    type: 'enum',
                    enum: ['document_start', 'document_end', 'document_idle'],
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            if (scriptSettings.runAt &&
                scriptSettings.runAt !== 'document_start' &&
                scriptSettings.runAt !== 'document_end' &&
                scriptSettings.runAt !== 'document_idle') {
                throw new Error('Invalid value for argument 2. Property \'runAt\':' +
                    ' Value must be one of: [document_start, document_end, document_idle].');
            }
            if (scriptSettings.code) {
                testWindow.chrome._executedScripts.push({
                    id: tabId,
                    code: scriptSettings.code
                });
                eval(scriptSettings.code);
            }
            else if (scriptSettings.file === '/js/crmapi.js') {
                testWindow._crmAPIRegistry = testWindow._crmAPIRegistry || [];
                testWindow._crmAPIRegistry.push(FakeCRMAPI);
            }
            callback && callback([]);
        },
        onHighlighted: {
            addListener: function (callback) {
                checkOnlyCallback(callback, false);
            }
        },
        onUpdated: {
            addListener: function (listener) {
                testWindow.chrome._tabUpdateListeners.push(listener);
                checkOnlyCallback(listener, false);
            }
        },
        create: function (data, callback) {
            TypeChecking.typeCheck({
                data: data,
                callback: callback
            }, [{
                    val: 'data',
                    type: 'object'
                }, {
                    val: 'data.windowId',
                    type: 'number',
                    optional: true
                }, {
                    val: 'data.index',
                    type: 'number',
                    optional: true
                }, {
                    val: 'data.url',
                    type: 'string',
                    optional: true
                }, {
                    val: 'data.active',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.selected',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.pinned',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.openerTabId',
                    type: 'number',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            testWindow.chrome._activeTabs.push({
                type: 'create',
                data: data
            });
        },
        update: function (id, data, callback) {
            if (typeof id !== 'number') {
                callback = data;
                data = id;
                id = void 0;
            }
            TypeChecking.typeCheck({
                id: id,
                data: data,
                callback: callback
            }, [{
                    val: 'id',
                    type: 'number',
                    optional: true
                }, {
                    val: 'data',
                    type: 'object',
                }, {
                    val: 'data.url',
                    type: 'string',
                    optional: true
                }, {
                    val: 'data.active',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.highlighted',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.selected',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.pinned',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.muted',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'data.openerTabId',
                    type: 'number',
                    optional: true
                }, {
                    val: 'data.autoDiscardable',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            testWindow.chrome._activeTabs.push({
                type: 'update',
                id: id,
                data: data
            });
        },
        sendMessage: function (tabId, message, options, responseCallback) {
            if (typeof options === 'function') {
                responseCallback = options;
                options = void 0;
            }
            TypeChecking.typeCheck({
                tabId: tabId,
                message: message,
                options: options,
                responseCallback: responseCallback
            }, [{
                    val: 'tabId',
                    type: 'number'
                }, {
                    val: 'options',
                    type: 'object',
                    optional: true
                }, {
                    val: 'options.frameId',
                    type: 'number',
                    optional: true,
                    dependency: 'options'
                }, {
                    val: 'responseCallback',
                    type: 'function',
                    optional: true
                }]);
            responseCallback({});
        },
        query: function (options, callback) {
            TypeChecking.typeCheck({
                options: options,
                callback: callback
            }, [{
                    val: 'options',
                    type: 'object'
                }, {
                    val: 'options.tabId',
                    type: ['number', 'array'],
                    optional: true
                }, {
                    val: 'options.status',
                    type: 'enum',
                    enum: ['loading', 'complete'],
                    optional: true
                }, {
                    val: 'options.lastFocusedWindow',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.windowId',
                    type: 'number',
                    optional: true
                }, {
                    val: 'options.windowType',
                    type: 'enum',
                    enum: ['normal', 'popup', 'panel', 'app', 'devtools'],
                    optional: true
                }, {
                    val: 'options.active',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.index',
                    type: 'number',
                    optional: true
                }, {
                    val: 'options.title',
                    type: 'string',
                    optional: true
                }, {
                    val: 'options.url',
                    type: ['string', 'array'],
                    optional: true
                }, {
                    val: 'options.currentWindow',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.highlighted',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.pinned',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.audible',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.muted',
                    type: 'boolean',
                    optional: true
                }, {
                    val: 'options.tabId',
                    type: ['number', 'array'],
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function',
                    optional: true
                }]);
            callback(Object.getOwnPropertyNames(testWindow.chrome._fakeTabs).map(function (fakeTabId) {
                return testWindow.chrome._fakeTabs[fakeTabId];
            }).filter(function (tab) {
                if (options.tabId !== undefined) {
                    if (typeof options.tabId === 'number') {
                        options.tabId = [options.tabId];
                    }
                    if (options.tabId.indexOf(tab.id) === -1) {
                        return false;
                    }
                }
                if (options.url !== undefined && tab.url !== options.url) {
                    return false;
                }
                return true;
            }));
        }
    },
    management: {
        getAll: function (listener) {
            checkOnlyCallback(listener, false);
            listener([]);
        },
        onInstalled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onEnabled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onUninstalled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onDisabled: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        }
    },
    permissions: {
        getAll: function (callback) {
            checkOnlyCallback(callback, false);
            callback({
                permissions: [
                    "tabs",
                    "<all_urls>",
                    "activeTab",
                    "notifications",
                    "storage",
                    "webRequest",
                    "webRequestBlocking",
                    "contextMenus",
                    "unlimitedStorage"
                ]
            });
        },
        onAdded: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        onRemoved: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        },
        contains: function (permissionsObject, callback) {
            TypeChecking.typeCheck({
                permissionsObject: permissionsObject,
                callback: callback
            }, [{
                    val: 'permissionsObject',
                    type: 'object'
                }, {
                    val: 'permissionsObject.permissions',
                    type: 'array',
                    optional: true
                }, {
                    val: 'permissionsObject.origins',
                    type: 'array',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function'
                }]);
            callback(true);
        },
        request: function (permissionsObject, callback) {
            TypeChecking.typeCheck({
                permissionsObject: permissionsObject,
                callback: callback
            }, [{
                    val: 'permissionsObject',
                    type: 'object'
                }, {
                    val: 'permissionsObject.permissions',
                    type: 'array',
                    optional: true
                }, {
                    val: 'permissionsObject.origins',
                    type: 'array',
                    optional: true
                }, {
                    val: 'callback',
                    type: 'function'
                }]);
            callback(true);
        }
    },
    storage: {
        local: new StorageGenerator('local'),
        sync: new StorageGenerator('sync'),
        onChanged: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
                storageListeners.push(listener);
            }
        }
    },
    webRequest: {
        onBeforeRequest: {
            addListener: function (listener) {
                checkOnlyCallback(listener, false);
            }
        }
    }
};
if ('StyleMedia' in testWindow) {
    testWindow.browser = testWindow.chrome;
}
var originalWorker = testWindow.Worker;
testWindow.Worker = (function () {
    function FakeWorker(url) {
        if (url.indexOf('/js/sandbox.js') === -1) {
            return new originalWorker(url);
        }
    }
    FakeWorker.prototype.postMessage = function (data) {
        testWindow.chrome._activatedBackgroundPages.push(data.id);
    };
    FakeWorker.prototype.addEventListener = function (event, callback) {
        TypeChecking.typeCheck({
            event: event,
            callback: callback
        }, [{
                val: 'event',
                type: 'string'
            }, {
                val: 'callback',
                type: 'function'
            }]);
    };
    FakeWorker.prototype.terminate = function () { };
    return FakeWorker;
}());
function addStyleString(str) {
    var node = document.createElement('style');
    node.innerHTML = str;
    document.head.appendChild(node);
}
window.onload = function () {
    var dummyContainer = testWindow.dummyContainer = document.createElement('div');
    dummyContainer.id = 'dummyContainer';
    dummyContainer.style.width = '100vw';
    dummyContainer.style.position = 'fixed';
    dummyContainer.style.top = '0';
    dummyContainer.style.zIndex = '999999999';
    dummyContainer.style.display = 'flex';
    dummyContainer.style.flexDirection = 'row';
    dummyContainer.style.justifyContent = 'space-between';
    document.body.appendChild(dummyContainer);
    addStyleString('#dummyContainer > * {\n' +
        '	background-color: blue;\n' +
        '}');
};
