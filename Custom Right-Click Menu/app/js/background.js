/// <reference path="../../scripts/chrome.d.ts"/>
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
            /**
             * tabId: {
             *		nodes: {
             *			nodeId: {
             *				'secretKey': secret key,
             *				'port': Port
             *			}
             *		},
             *		libraries: {
             *			libraryName
             * 		}
             */
            tabData: {
                0: {
                    nodes: {},
                    libraries: {}
                }
            },
            /**
             * The ID of the root contextMenu node
             */
            rootId: null,
            /**
             * nodeId: context menu ID for given node ID
             */
            contextMenuIds: {},
            /*
             * nodeId: {
             *		instance: {
             *			'hasHandler': boolean
             *		}
             * }
             */
            nodeInstances: {},
            /**
             * contextMenuId: {
             *		'path': path,
             *		'settings': settings
             * }
             */
            contextMenuInfoById: {},
            /**
             * A tree following the same structure as the right-click menu where each node has
             *		data about the node's ID, the node itself, its visibility, its parentTree
             *		and its index
             */
            contextMenuItemTree: [],
            /**
             * nodeId: url's to NOT show this on
             */
            hideNodesOnPagesData: {},
            /**
             * nodeId: {
             *		tabId: visibility (true or false)
             */
            stylesheetNodeStatusses: {}
        },
        toExecuteNodes: {
            onUrl: [],
            always: []
        },
        sendCallbackMessage: function sendCallbackMessage(tabId, id, data) {
            var message = {
                type: (data.err ? 'error' : 'success'),
                data: (data.err ? data.errorMessage : data.args),
                callbackId: data.callbackId,
                messageType: 'callback'
            };
            try {
                globalObject.globals.crmValues.tabData[tabId].nodes[id].port.postMessage(message);
            }
            catch (e) {
                if (e.message === 'Converting circular structure to JSON') {
                    message.data = 'Converting circular structure to JSON, getting a response from this API will not work';
                    message.type = 'error';
                    globalObject.globals.crmValues.tabData[tabId].nodes[id].port.postMessage(message);
                }
                else {
                    throw e;
                }
            }
        },
        /**
         * notificationId: {
         *		'id': id,
         *		'tabId': tabId,
         *		'notificationId': notificationId,
         * 		'onDone': onDone,
         * 		'onClick': onClick
         *	}
         */
        notificationListeners: {},
        /*
         * tabId: {
         *		'id': id,
         *		'tabid': tabId, - TabId of the listener
         *		'callback': callback,
         *		'url': url
         *	}
         */
        scriptInstallListeners: {},
        /*
         * nodeId: {
         * 		logMessages: [{
         * 			'tabId': tabId,
         * 			'value': value,
         * 			'timestamp': timestamp
         * 		}]
         * },
         * filter: {
         * 		'id': id,
         * 		'tabId': tabId
         * }
         */
        logging: {
            filter: {
                id: null,
                tabId: null
            }
        },
        constants: {
            supportedHashes: ['sha1', 'sha256', 'sha384', 'sha512', 'md5'],
            validSchemes: ['http', 'https', 'file', 'ftp', '*'],
            //#region Templates
            templates: {
                /**
                 * Merges two arrays
                 *
                 * @param {any[]} mainArray - The main array
                 * @param {any[]} additions - The additions array
                 * @returns {any[]} The merged arrays
                 */
                mergeArrays: function (mainArray, additionArray) {
                    for (var i = 0; i < additionArray.length; i++) {
                        if (mainArray[i] && typeof additionArray[i] === 'object' &&
                            mainArray[i] !== undefined && mainArray[i] !== null) {
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
                /**
                 * Merges two objects
                 *
                 * @param {Object} mainObject - The main object
                 * @param {Object} additions - The additions to the main object, these overwrite the
                 *		main object's properties
                 * @returns {Object} The merged objects
                 */
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
                /**
                 * Gets the default link node object with given options applied
                 *
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A link node with specified properties set
                 */
                getDefaultLinkNode: function (options) {
                    var defaultNode = {
                        name: 'name',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'link',
                        showOnSpecified: false,
                        triggers: [{
                                url: '*://*.example.com/*',
                                not: false
                            }],
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
                /**
                 * Gets the default stylesheet value object with given options applied
                 *
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A stylesheet node value with specified properties set
                 */
                getDefaultStylesheetValue: function (options) {
                    var value = {
                        stylesheet: [
                            '// ==UserScript==',
                            '// @name	name',
                            '// @CRM_contentTypes	[true, true, true, false, false, false]',
                            '// @CRM_launchMode	0',
                            '// @CRM_stylesheet	true',
                            '// @grant	none',
                            '// @match	*://*.example.com/*',
                            '// ==/UserScript=='].join('\n'),
                        launchMode: 0,
                        triggers: [{
                                url: '*://*.example.com/*',
                                not: false
                            }]
                    };
                    return this.mergeObjects(value, options);
                },
                /**
                 * Gets the default script value object with given options applied
                 *
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A script node value with specified properties set
                 */
                getDefaultScriptValue: function (options) {
                    var value = {
                        launchMode: 0,
                        backgroundLibraries: [],
                        libraries: [],
                        script: [
                            '// ==UserScript==',
                            '// @name	name',
                            '// @CRM_contentTypes	[true, true, true, false, false, false]',
                            '// @CRM_launchMode	0',
                            '// @grant	none',
                            '// @match	*://*.example.com/*',
                            '// ==/UserScript=='].join('\n'),
                        backgroundScript: '',
                        triggers: [{
                                url: '*://*.example.com/*',
                                not: false
                            }]
                    };
                    return this.mergeObjects(value, options);
                },
                /**
                 * Gets the default script node object with given options applied
                 *
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A script node with specified properties set
                 */
                getDefaultScriptNode: function (options) {
                    var defaultNode = {
                        name: 'name',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'script',
                        isLocal: true,
                        value: this.getDefaultScriptValue(options.value)
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                /**
                 * Gets the default stylesheet node object with given options applied
                 *
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A stylesheet node with specified properties set
                 */
                getDefaultStylesheetNode: function (options) {
                    var defaultNode = {
                        name: 'name',
                        onContentTypes: [true, true, true, false, false, false],
                        type: 'stylesheet',
                        isLocal: true,
                        value: this.getDefaultStylesheetValue(options.value)
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                /**
                 * Gets the default divider or menu node object with given options applied
                 *
                 * @param {String} type - The type of node
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A divider or menu node with specified properties set
                 */
                getDefaultDividerOrMenuNode: function (options, type) {
                    var defaultNode = {
                        name: 'name',
                        type: type,
                        onContentTypes: [true, true, true, false, false, false],
                        isLocal: true,
                        value: {}
                    };
                    return this.mergeObjects(defaultNode, options);
                },
                /**
                 * Gets the default divider node object with given options applied
                 *
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A divider node with specified properties set
                 */
                getDefaultDividerNode: function (options) {
                    return this.getDefaultDividerOrMenuNode(options, 'divider');
                },
                /**
                 * Gets the default menu node object with given options applied
                 *
                 * @param {Object} options - Any pre-set properties
                 * @returns {Object} A menu node with specified properties set
                 */
                getDefaultMenuNode: function (options) {
                    return this.getDefaultDividerOrMenuNode(options, 'menu');
                }
            },
            specialJSON: {
                resolveJson: function (root, args) {
                    args = args || {};
                    var idAttribute = args.idAttribute || 'id';
                    var refAttribute = this.refAttribute;
                    var idAsRef = args.idAsRef;
                    var prefix = args.idPrefix || '';
                    var assignAbsoluteIds = args.assignAbsoluteIds;
                    var index = args.index || {}; // create an index if one doesn't exist
                    var timeStamps = args.timeStamps;
                    var ref, reWalk = [];
                    var pathResolveRegex = /^(.*\/)?(\w+:\/\/)|[^\/\.]+\/\.\.\/|^.*\/(\/)/;
                    var addProp = this._addProp;
                    var F = function () { };
                    function walk(it, stop, defaultId, needsPrefix, schema, defaultObject) {
                        // this walks the new graph, resolving references and making other changes
                        var i, update, val, id = idAttribute in it ? it[idAttribute] : defaultId;
                        if (idAttribute in it || ((id !== undefined) && needsPrefix)) {
                            id = (prefix + id).replace(pathResolveRegex, '$2$3');
                        }
                        var target = defaultObject || it;
                        if (id !== undefined) {
                            if (assignAbsoluteIds) {
                                it.__id = id;
                            }
                            if (args.schemas && (!(it instanceof Array)) &&
                                (val = id.match(/^(.+\/)[^\.\[]*$/))) {
                                schema = args.schemas[val[1]];
                            }
                            // if the id already exists in the system, we should use the existing object, and just 
                            // update it... as long as the object is compatible
                            if (index[id] && ((it instanceof Array) == (index[id] instanceof Array))) {
                                target = index[id];
                                delete target.$ref; // remove this artifact
                                delete target._loadObject;
                                update = true;
                            }
                            else {
                                var proto = schema && schema.prototype; // and if has a prototype
                                if (proto) {
                                    // if the schema defines a prototype, that needs to be the prototype of the object
                                    F.prototype = proto;
                                    target = new F();
                                }
                            }
                            index[id] = target; // add the prefix, set _id, and index it
                            if (timeStamps) {
                                timeStamps[id] = args.time;
                            }
                        }
                        while (schema) {
                            var properties = schema.properties;
                            if (properties) {
                                for (i in it) {
                                    var propertyDefinition = properties[i];
                                    console.log(it);
                                    if (propertyDefinition && propertyDefinition.format == 'date-time' && typeof it[i] == 'string') {
                                        it[i] = new Date(it[i]);
                                    }
                                }
                            }
                            schema = schema["extends"];
                        }
                        var length = it.length;
                        for (i in it) {
                            if (i == length) {
                                break;
                            }
                            if (it.hasOwnProperty(i)) {
                                val = it[i];
                                if ((typeof val == 'object') && val && !(val instanceof Date) && i != '__parent') {
                                    ref = val[refAttribute] || (idAsRef && val[idAttribute]);
                                    if (!ref || !val.__parent) {
                                        val.__parent = it;
                                    }
                                    if (ref) {
                                        // make sure it is a safe reference
                                        delete it[i]; // remove the property so it doesn't resolve to itself in the case of id.propertyName lazy values
                                        var path = ref.toString().replace(/(#)([^\.\[])/, '$1.$2').match(/(^([^\[]*\/)?[^#\.\[]*)#?([\.\[].*)?/); // divide along the path
                                        if ((ref = (path[1] == '$' || path[1] == 'this' || path[1] == '') ? root : index[(prefix + path[1]).replace(pathResolveRegex, '$2$3')])) {
                                            // if there is a path, we will iterate through the path references
                                            if (path[3]) {
                                                path[3].replace(/(\[([^\]]+)\])|(\.?([^\.\[]+))/g, function (t, a, b, c, d) {
                                                    ref = ref && ref[b ? b.replace(/[\"\'\\]/, '') : d];
                                                });
                                            }
                                        }
                                        if (ref) {
                                            val = ref;
                                        }
                                        else {
                                            // otherwise, no starting point was found (id not found), if stop is set, it does not exist, we have
                                            // unloaded reference, if stop is not set, it may be in a part of the graph not walked yet,
                                            // we will wait for the second loop
                                            if (!stop) {
                                                var rewalking;
                                                if (!rewalking) {
                                                    reWalk.push(target); // we need to rewalk it to resolve references
                                                }
                                                rewalking = true; // we only want to add it once
                                                val = walk(val, false, val[refAttribute], true, propertyDefinition);
                                                // create a lazy loaded object
                                                val._loadObject = args.loader;
                                            }
                                        }
                                    }
                                    else {
                                        if (!stop) {
                                            // further walking may lead down circular loops
                                            val = walk(val, reWalk == it, id === undefined ? undefined : addProp(id, i), // the default id to use
                                            false, propertyDefinition, 
                                            // if we have an existing object child, we want to 
                                            // maintain it's identity, so we pass it as the default object
                                            target != it && typeof target[i] == 'object' && target[i]);
                                        }
                                    }
                                }
                                it[i] = val;
                                if (target != it && !target.__isDirty) {
                                    var old = target[i];
                                    target[i] = val; // only update if it changed
                                    if (update && val !== old &&
                                        !target._loadObject &&
                                        !(i.charAt(0) == '_' && i.charAt(1) == '_') && i != "$ref" &&
                                        !(val instanceof Date && old instanceof Date && val.getTime() == old.getTime()) &&
                                        !(typeof val == 'function' && typeof old == 'function' && val.toString() == old.toString()) &&
                                        index.onUpdate) {
                                        index.onUpdate(target, i, old, val); // call the listener for each update
                                    }
                                }
                            }
                        }
                        if (update && (idAttribute in it)) {
                            // this means we are updating with a full representation of the object, we need to remove deleted
                            for (i in target) {
                                if (!target.__isDirty && target.hasOwnProperty(i) && !it.hasOwnProperty(i) && !(i.charAt(0) == '_' && i.charAt(1) == '_') && !(target instanceof Array && isNaN(i))) {
                                    if (index.onUpdate && i != "_loadObject" && i != "_idAttr") {
                                        index.onUpdate(target, i, target[i], undefined); // call the listener for each update
                                    }
                                    delete target[i];
                                    while (target instanceof Array && target.length && target[target.length - 1] === undefined) {
                                        // shorten the target if necessary
                                        target.length--;
                                    }
                                }
                            }
                        }
                        else {
                            if (index.onLoad) {
                                index.onLoad(target);
                            }
                        }
                        return target;
                    }
                    if (root && typeof root == 'object') {
                        root = walk(root, false, args.defaultId, true); // do the main walk through
                        walk(reWalk, false); // re walk any parts that were not able to resolve references on the first round
                    }
                    return root;
                },
                fromJson: function (str, args) {
                    function ref(target) {
                        var refObject = {};
                        refObject[this.refAttribute] = target;
                        return refObject;
                    }
                    try {
                        var root = eval('(' + str + ')'); // do the eval
                    }
                    catch (e) {
                        throw new SyntaxError("Invalid JSON string: " + e.message + " parsing: " + str);
                    }
                    if (root) {
                        return this.resolveJson(root, args);
                    }
                    return root;
                },
                _addProp: function (id, prop) {
                    return id + (id.match(/#/) ? id.length == 1 ? '' : '.' : '#') + prop;
                },
                refAttribute: "$ref",
                _useRefs: false,
                serializeFunctions: true
            }
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
    //#endregion
    //#region Helper Functions
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
    var jsonFn = {
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
            var iso8061 = date2Obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;
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
                    return eval('(' + value + ')');
                }
                if (prefix === '_PxEgEr_') {
                    return eval(value.slice(8));
                }
                return value;
            });
        }
    };
    function compareObj(firstObj, secondObj) {
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
                        if (!compareArray(firstObj[key], secondObj[key])) {
                            return false;
                        }
                    }
                    else if (!compareObj(firstObj[key], secondObj[key])) {
                        return false;
                    }
                }
                else if (firstObj[key] !== secondObj[key]) {
                    return false;
                }
            }
        }
        return true;
    }
    function compareArray(firstArray, secondArray) {
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
        var i;
        for (i = 0; i < firstLength; i++) {
            if (typeof firstArray[i] === 'object') {
                if (typeof secondArray[i] !== 'object') {
                    return false;
                }
                if (Array.isArray(firstArray[i])) {
                    if (!Array.isArray(secondArray[i])) {
                        return false;
                    }
                    if (!compareArray(firstArray[i], secondArray[i])) {
                        return false;
                    }
                }
                else if (!compareObj(firstArray[i], secondArray[i])) {
                    return false;
                }
            }
            else if (firstArray[i] !== secondArray[i]) {
                return false;
            }
        }
        return true;
    }
    function safe(node) {
        return globalObject.globals.crm.crmByIdSafe[node.id];
    }
    //#endregion
    //#region LogExecution
    function executeCRMCode(message) {
        //Get the port
        globalObject.globals.crmValues.tabData[message.tab].nodes[message.id].port.postMessage({
            messageType: 'executeCode',
            code: message.code,
            logCallbackIndex: message.logCallback.index
        });
    }
    function getCRMHints(message) {
    }
    //#endregion
    //#region Logging
    function log(nodeId, tabId) {
        var data = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            data[_i - 2] = arguments[_i];
        }
        console.log(arguments);
        var args = Array.prototype.slice.apply(arguments, [2]);
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
    }
    function prepareLog(nodeId, tabId) {
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
    }
    function backgroundPageLog(id, lineNumber) {
        var args = Array.prototype.slice.apply(arguments);
        var logValue = {
            id: id,
            tabId: 'background',
            nodeTitle: globalObject.globals.crm.crmById[id].name,
            tabtitle: 'Background Page',
            value: args,
            lineNumber: lineNumber,
            timestamp: new Date().toLocaleString()
        };
        globalObject.globals.logging[id].logMessages.push(logValue);
        updateLogs(logValue);
    }
    function logHandlerLog(message) {
        var srcObj = {};
        var args = [
            'Log[src:',
            srcObj,
            ']: '
        ];
        var logValue = {
            id: message.id,
            tabId: message.tabId,
            value: message.data,
            lineNumber: message.lineNumber || '?',
            timestamp: new Date().toLocaleString()
        };
        chrome.tabs.get(message.tabId, function (tab) {
            args = args.concat(globalObject.globals.constants.specialJSON.fromJson(message.data));
            log.apply(globalObject, [message.id, message.tabId].concat(args));
            srcObj.id = message.id;
            srcObj.tabId = message.tabId;
            srcObj.tab = tab;
            srcObj.url = tab.url;
            srcObj.tabTitle = tab.title;
            srcObj.node = globalObject.globals.crm.crmById[message.id];
            srcObj.nodeName = srcObj.node.name;
            logValue.tabTitle = tab.title;
            logValue.nodeTitle = srcObj.nodeName;
            globalObject.globals.logging[message.id].logMessages.push(logValue);
            updateLogs(logValue);
        });
    }
    function logHandler(message) {
        prepareLog(message.id, message.tabId);
        switch (message.type) {
            case 'log':
                logHandlerLog(message);
                break;
            case 'evalResult':
                chrome.tabs.get(message.tabId, function (tab) {
                    globalObject.globals.listeners.log[message.data.callbackIndex].listener({
                        id: message.id,
                        tabId: message.tabId,
                        nodeTitle: globalObject.globals.crm.crmById[message.id].name,
                        value: message.data,
                        tabTitle: tab.title,
                        type: 'evalResult',
                        lineNumber: message.data.lineNumber,
                        timestamp: message.timestamp
                    });
                });
                break;
        }
    }
    //#endregion
    //#region Logging Listeners
    function updateTabAndIdLists(force) {
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
        for (tabId in tabIds) {
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
        if (!compareArray(idArr, listeners.idVals)) {
            listeners.ids.forEach(function (idListener) {
                idListener(idArr);
            });
            listeners.idVals = idArr;
        }
        if (!compareArray(tabArr, listeners.tabVals)) {
            listeners.tabs.forEach(function (tabListener) {
                tabListener(tabArr);
            });
            listeners.tabVals = tabArr;
        }
        return {
            ids: idArr,
            tabs: tabArr
        };
    }
    function updateLogs(newLog) {
        globalObject.globals.listeners.log.forEach(function (logListener) {
            var idMatches = logListener.id === 'all' || logListener.id === newLog.id;
            var tabMatches = logListener.tab === 'all' || logListener.tab === newLog.tabId;
            if (idMatches && tabMatches) {
                logListener.listener(newLog);
            }
        });
    }
    //#endregion
    //#region Right-Click Menu Handling/Building
    function removeNode(node) {
        chrome.contextMenus.remove(node.id, function () {
            if (chrome.runtime.lastError) { }
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
        var stylesheetStatus = globalObject.globals.crmValues.stylesheetNodeStatusses[oldId];
        var settings = globalObject.globals.crmValues.contextMenuInfoById[node.id].settings;
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
        globalObject.globals.crmValues.contextMenuInfoById[id] = globalObject.globals.crmValues.contextMenuInfoById[oldId];
        globalObject.globals.crmValues.contextMenuInfoById[oldId] = undefined;
        globalObject.globals.crmValues.contextMenuInfoById[id].enabled = true;
        if (node.children) {
            buildSubTreeFromNothing(id, node.children, changes);
        }
    }
    function buildSubTreeFromNothing(parentId, tree, changes) {
        for (var i = 0; i < tree.length; i++) {
            if ((changes[tree[i].id] && changes[tree[i].id].type === 'show') || !changes[tree[i].id]) {
                reCreateNode(parentId, tree[i], changes);
            }
            else {
                globalObject.globals.crmValues.contextMenuInfoById[tree[i].id].enabled = false;
            }
        }
    }
    function applyNodeChangesOntree(parentId, tree, changes) {
        //Remove all nodes below it and re-enable them and its children
        //Remove all nodes below it and store them
        var i;
        var firstChangeIndex = getFirstRowChange(tree, changes);
        if (firstChangeIndex < tree.length) {
            for (i = 0; i < firstChangeIndex; i++) {
                //Normally check its children
                if (tree[i].children && tree[i].children.length > 0) {
                    applyNodeChangesOntree(tree[i].id, tree[i].children, changes);
                }
            }
        }
        for (i = firstChangeIndex; i < tree.length; i++) {
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
                    var j;
                    var enableAfter = [tree[i]];
                    for (j = i + 1; j < tree.length; j++) {
                        if (changes[tree[j].id]) {
                            if (changes[tree[j].id].type === 'hide') {
                                removeNode(tree[j]);
                                changes[tree[j].id].node.enabled = false;
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
                    for (var k = 0; k < enableAfter.length; k++) {
                        reCreateNode(parentId, enableAfter[k], changes);
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
            var i;
            var changes = {};
            var shownNodes = [];
            var hiddenNodes = [];
            getNodeStatusses(globalObject.globals.crmValues.contextMenuItemTree, hiddenNodes, shownNodes);
            //Find nodes to enable
            var hideOn;
            for (i = 0; i < hiddenNodes.length; i++) {
                hideOn = globalObject.globals.crmValues.hideNodesOnPagesData[hiddenNodes[i].node.id];
                if (!hideOn || !matchesUrlSchemes(hideOn, tab.url)) {
                    //Don't hide on current url
                    toEnable.push({
                        node: hiddenNodes[i].node,
                        id: hiddenNodes[i].id
                    });
                }
            }
            //Find nodes to hide
            for (i = 0; i < shownNodes.length; i++) {
                hideOn = globalObject.globals.crmValues.hideNodesOnPagesData[shownNodes[i].node.id];
                if (hideOn) {
                    if (matchesUrlSchemes(hideOn, tab.url)) {
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
            for (i = 0; i < length; i++) {
                hideOn = globalObject.globals.crmValues.hideNodesOnPagesData[toEnable[i].node.id];
                if (hideOn) {
                    if (matchesUrlSchemes(hideOn, tab.url)) {
                        //Don't hide on current url
                        toEnable.splice(i, 1);
                        length--;
                        i--;
                    }
                }
            }
            for (i = 0; i < toHide.length; i++) {
                changes[toHide[i].id] = {
                    node: toHide[i].node,
                    type: 'hide'
                };
            }
            for (i = 0; i < toEnable.length; i++) {
                changes[toEnable[i].id] = {
                    node: toEnable[i].node,
                    type: 'show'
                };
            }
            //Apply changes
            applyNodeChangesOntree(globalObject.globals.crmValues.rootId, globalObject.globals.crmValues.contextMenuItemTree, changes);
        });
        var statuses = globalObject.globals.crmValues.stylesheetNodeStatusses;
        function checkForRuntimeErrors() {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
            }
        }
        for (var nodeId in statuses) {
            if (statuses.hasOwnProperty(nodeId) && statuses[nodeId]) {
                chrome.contextMenus.update(globalObject.globals.crmValues.contextMenuIds[nodeId], {
                    checked: typeof statuses[nodeId][currentTabId] !== 'boolean' ?
                        statuses[nodeId].defaultValue :
                        statuses[nodeId][currentTabId]
                }, checkForRuntimeErrors);
            }
        }
    }
    chrome.tabs.onHighlighted.addListener(tabChangeListener);
    function createSecretKey() {
        var key = [];
        var i;
        for (i = 0; i < 25; i++) {
            key[i] = Math.round(Math.random() * 100);
        }
        if (!globalObject.globals.keys[key.join(',')]) {
            globalObject.globals.keys[key.join(',')] = true;
            return key;
        }
        else {
            return createSecretKey();
        }
    }
    function getContexts(contexts) {
        var newContexts = [];
        var textContexts = ['page', 'link', 'selection', 'image', 'video', 'audio'];
        for (var i = 0; i < 6; i++) {
            if (contexts[i]) {
                newContexts.push(textContexts[i]);
            }
        }
        return newContexts;
    }
    //#region Link Click Handler
    function sanitizeUrl(url) {
        if (url.indexOf('://') === -1) {
            url = 'http://' + url;
        }
        return url;
    }
    function createLinkClickHandler(node) {
        return function (clickData, tabInfo) {
            var i;
            var finalUrl;
            for (i = 0; i < node.value.length; i++) {
                if (node.value[i].newTab) {
                    chrome.tabs.create({
                        windowId: tabInfo.windowId,
                        url: sanitizeUrl(node.value[i].url),
                        openerTabId: tabInfo.id
                    });
                }
                else {
                    finalUrl = node.value[i].url;
                }
            }
            if (finalUrl) {
                chrome.tabs.update(tabInfo.tabId, {
                    url: sanitizeUrl(finalUrl)
                });
            }
        };
    }
    //#endregion
    //#region Stylesheet Click Handler
    function createStylesheetToggleHandler(node) {
        return function (info, tab) {
            var code;
            var className = node.id + '' + tab.id;
            if (info.wasChecked) {
                code = ['var nodes = Array.prototype.slice.apply(document.querySelectorAll(".styleNodes' + className + '")).forEach(function(node){',
                    'node.remove();',
                    '});'].join('');
            }
            else {
                var css = node.value.stylesheet.replace(/[ |\n]/g, '');
                code = ['var CRMSSInsert=document.createElement("style");',
                    'CRMSSInsert.className="styleNodes' + className + '";',
                    'CRMSSInsert.type="text/css";',
                    'CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(css) + '));',
                    'document.head.appendChild(CRMSSInsert);'].join('');
            }
            globalObject.globals.crmValues.stylesheetNodeStatusses[node.id][tab.id] = info.checked;
            chrome.tabs.executeScript(tab.id, {
                code: code,
                allFrames: true
            });
        };
    }
    function createStylesheetClickHandler(node) {
        return function (info, tab) {
            var className = node.id + '' + tab.id;
            var code = ['(function() {',
                'if (document.querySelector(".styleNodes' + className + '")) {',
                'return false;',
                '}',
                'var CRMSSInsert=document.createElement("style");',
                'CRMSSInsert.classList.add("styleNodes' + className + '");',
                'CRMSSInsert.type="text/css";',
                'CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(node.value.stylesheet) + '));',
                'document.head.appendChild(CRMSSInsert);',
                '}());'].join('');
            chrome.tabs.executeScript(tab.id, {
                code: code,
                allFrames: true
            });
        };
    }
    //#endregion
    //#region Script Click Handler
    function executeScript(tabId, scripts, i) {
        return function () {
            if (scripts.length > i) {
                chrome.tabs.executeScript(tabId, scripts[i], executeScript(tabId, scripts, i + 1));
            }
        };
    }
    function executeScripts(tabId, scripts) {
        executeScript(tabId, scripts, 0)();
    }
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
    function getMetaLines(script) {
        var metaIndexes = getMetaIndexes(script);
        var metaStart = metaIndexes.start;
        var metaEnd = metaIndexes.end;
        var startPlusOne = metaStart + 1;
        var lines = script.split('\n');
        var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
        return metaLines;
    }
    function getMetaTags(script) {
        var metaLines = getMetaLines(script);
        var metaTags = {};
        var regex = /@(\w+)(\s+)(.+)/;
        var regexMatches;
        for (var i = 0; i < metaLines.length; i++) {
            regexMatches = metaLines[i].match(regex);
            if (regexMatches) {
                metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
                metaTags[regexMatches[1]].push(regexMatches[3]);
            }
        }
        return metaTags;
    }
    function generateMetaAccessFunction(metaData) {
        return function (key) {
            if (metaData[key]) {
                return metaData[key][0];
            }
            return undefined;
        };
    }
    function createScriptClickHandler(node) {
        return function (info, tab) {
            var key = [];
            var err = false;
            try {
                key = createSecretKey();
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
                globalObject.globals.crmValues.tabData[tab.id] = globalObject.globals.crmValues.tabData[tab.id] || {
                    libraries: {},
                    nodes: {}
                };
                globalObject.globals.crmValues.tabData[tab.id].nodes[node.id] = {
                    secretKey: key
                };
                updateTabAndIdLists();
                var metaData = getMetaTags(node.value.script);
                var metaString = getMetaLines(node.value.script) || undefined;
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
                var metaVal = generateMetaAccessFunction(metaData);
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
                            resources: getResourcesArrayForScript(node.id),
                            "run-at": runAt,
                            system: false,
                            unwrap: true,
                            version: metaVal('version')
                        },
                        scriptMetaStr: metaString,
                        scriptSource: node.value.script,
                        scriptUpdateURL: metaVal('updateURL'),
                        scriptWillUpdate: false,
                        scriptHandler: 'Custom Right-Click Menu',
                        version: chrome.runtime.getManifest().version
                    },
                    resources: getScriptResources(node.id) || {}
                };
                globalObject.globals.storages.nodeStorage[node.id] = globalObject.globals.storages.nodeStorage[node.id] || {};
                var nodeStorage = globalObject.globals.storages.nodeStorage[node.id];
                var indentUnit;
                if (globalObject.globals.storages.settingsStorage.editor.useTabs) {
                    indentUnit = '	';
                }
                else {
                    indentUnit = [];
                    indentUnit[globalObject.globals.storages.settingsStorage.editor.tabSize || 2] = '';
                    indentUnit = indentUnit.join(' ');
                }
                var script = node.value.script.split('\n').map(function (line) {
                    return indentUnit + line;
                }).join('\n');
                var code = [
                    [
                        'var crmAPI = new CrmAPIInit(' +
                            [makeSafe(node), node.id, tab, info, key, nodeStorage, greaseMonkeyData].map(function (param) {
                                return JSON.stringify(param);
                            }).join(', ') +
                            ');'
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
                            if (globalObject.globals.storages.storageLocal.libraries[j].name === node.value.libraries[i].name) {
                                lib = globalObject.globals.storages.storageLocal.libraries[j];
                                break;
                            }
                            else {
                                //Resource hasn't been registered with its name, try if it's an anonymous one
                                if (node.value.libraries[i].name === null) {
                                    //Check if the value has been registered as a resource
                                    if (globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url]) {
                                        lib = {
                                            code: globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url].dataString
                                        };
                                    }
                                }
                            }
                        }
                    }
                    if (lib) {
                        if (lib.location) {
                            scripts.push({
                                file: '/js/defaultLibraries/' + lib.location,
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
                executeScripts(tab.id, scripts);
            }
        };
    }
    function createOptionsPageHandler() {
        return function () {
            chrome.runtime.openOptionsPage();
        };
    }
    //#endregion
    function getStylesheetReplacementTabs(node) {
        var replaceOnTabs = [];
        if (globalObject.globals.crmValues.contextMenuIds[node.id] &&
            globalObject.globals.crm.crmById[node.id].type === 'stylesheet' && node.type === 'stylesheet' &&
            globalObject.globals.crm.crmById[node.id].value.stylesheet !== node.value.stylesheet) {
            //Update after creating a new node
            for (var key in globalObject.globals.crmValues.stylesheetNodeStatusses[node.id]) {
                if (globalObject.globals.crmValues.stylesheetNodeStatusses.hasOwnProperty(key) && globalObject.globals.crmValues.stylesheetNodeStatusses[key]) {
                    if (globalObject.globals.crmValues.stylesheetNodeStatusses[node.id][key] && key !== 'defaultValue') {
                        replaceOnTabs.push({
                            id: key
                        });
                    }
                }
            }
        }
        return replaceOnTabs;
    }
    function executeNode(node, tab) {
        if (node.type === 'script') {
            createScriptClickHandler(node)({}, tab);
        }
        else if (node.type === 'stylesheet') {
            createStylesheetClickHandler(node)({}, tab);
        }
        else if (node.type === 'link') {
            createLinkClickHandler(node)({}, tab);
        }
    }
    //#region URL scheme matching
    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&').replace(/\*/g, '.*');
    }
    function matchesUrlSchemes(matchPatterns, url) {
        var matches = false;
        for (var i = 0; i < matchPatterns.length; i++) {
            var not = matchPatterns[i].not;
            var matchPattern = matchPatterns[i].url;
            if (matchPattern.indexOf('/') === 0 &&
                matchPattern.split('').reverse().join('').indexOf('/') === 0) {
                //It's regular expression
                if (new RegExp(matchPattern.slice(1, matchPattern.length - 1)).test(url)) {
                    if (not) {
                        return false;
                    }
                    else {
                        matches = true;
                    }
                }
            }
            else {
                if (new RegExp('^' + matchPattern.replace(/\*/g, '(.+)') + '$').test(url)) {
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
    }
    function parsePattern(url) {
        if (url === '<all_urls') {
            return url;
        }
        try {
            var schemeSplit = url.split('://');
            var scheme = schemeSplit[0];
            var hostAndPath = schemeSplit[1];
            var hostAndPathSplit = hostAndPath.split('/');
            var host = hostAndPathSplit[0];
            var path = hostAndPathSplit.splice(1).join('/');
            return {
                scheme: scheme,
                host: host,
                path: path
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
    }
    function validatePatternUrl(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }
        url = url.trim();
        var pattern = parsePattern(url);
        if (pattern.invalid) {
            return null;
        }
        if (globalObject.globals.constants.validSchemes.indexOf(pattern.scheme) === -1) {
            return null;
        }
        var wildcardIndex = pattern.host.indexOf('*');
        if (wildcardIndex > -1) {
            if (pattern.host.split('*').length > 2) {
                return null;
            }
            if (wildcardIndex === 0 && pattern.host[1] === '.') {
                if (pattern.host.slice(2).split('/').length > 1) {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        return pattern;
    }
    function matchesScheme(scheme1, scheme2) {
        if (scheme1 === '*') {
            return true;
        }
        return scheme1 === scheme2;
    }
    function matchesHost(host1, host2) {
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
    }
    function matchesPath(path1, path2) {
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
    }
    function urlMatchesPattern(pattern, url) {
        var urlPattern;
        try {
            urlPattern = parsePattern(url);
        }
        catch (e) {
            return false;
        }
        return (matchesScheme(pattern.scheme, urlPattern.scheme) &&
            matchesHost(pattern.host, urlPattern.host) &&
            matchesPath(pattern.path, urlPattern.path));
    }
    function urlIsGlobalExcluded(url) {
        if (globalObject.globals.storages.globalExcludes.indexOf('<all_urls>') > -1) {
            return true;
        }
        for (var i = 0; i < globalObject.globals.storages.globalExcludes.length; i++) {
            if (globalObject.globals.storages.globalExcludes[i] !== null && urlMatchesPattern(globalObject.globals.storages.globalExcludes[i], url)) {
                return true;
            }
        }
        return false;
    }
    function executeScriptsForTab(tabId, respond) {
        chrome.tabs.get(tabId, function (tab) {
            if (tab.url.indexOf('chrome') !== 0) {
                var i;
                globalObject.globals.crmValues.tabData[tab.id] = {
                    libraries: {},
                    nodes: {}
                };
                updateTabAndIdLists();
                if (!urlIsGlobalExcluded(tab.url)) {
                    if (!urlIsGlobalExcluded(tab.url)) {
                        var toExecute = [];
                        for (var nodeId in globalObject.globals.toExecuteNodes.onUrl) {
                            if (globalObject.globals.toExecuteNodes.onUrl.hasOwnProperty(nodeId) && globalObject.globals.toExecuteNodes.onUrl[nodeId]) {
                                if (matchesUrlSchemes(globalObject.globals.toExecuteNodes.onUrl[nodeId], tab.url)) {
                                    toExecute.push({
                                        node: globalObject.globals.crm.crmById[nodeId],
                                        tab: tab
                                    });
                                }
                            }
                        }
                        for (i = 0; i < globalObject.globals.toExecuteNodes.always.length; i++) {
                            executeNode(globalObject.globals.toExecuteNodes.always[i], tab);
                        }
                        for (i = 0; i < toExecute.length; i++) {
                            executeNode(toExecute[i].node, toExecute[i].tab);
                        }
                        respond({
                            matched: toExecute.length > 0
                        });
                    }
                }
            }
        });
    }
    //#endregion
    function triggerMatchesScheme(trigger) {
        var reg = /(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;
        return reg.exec(trigger);
    }
    function prepareTrigger(trigger) {
        if (trigger === '<all_urls>') {
            return trigger;
        }
        if (trigger.replace(/\s/g, '') === '') {
            return null;
        }
        var newTrigger;
        if (trigger.split('//')[1].indexOf('/') === -1) {
            newTrigger = trigger + '/';
        }
        else {
            newTrigger = trigger;
        }
        return newTrigger;
    }
    function addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder) {
        //On by default
        if (node.type === 'stylesheet' && node.value.toggle && node.value.defaultOn) {
            if (launchMode === 0 || launchMode === 1) {
                globalObject.globals.toExecuteNodes.always.push(node);
            }
            else if (launchMode === 2 || launchMode === 3) {
                globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
            }
        }
        if (launchMode === 3) {
            rightClickItemOptions.documentUrlPatterns = [];
            globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
            for (var i = 0; i < node.triggers.length; i++) {
                var prepared = prepareTrigger(node.triggers[i].url);
                if (prepared) {
                    if (node.triggers[i].not) {
                        globalObject.globals.crmValues.hideNodesOnPagesData[node.id].push(prepared);
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
                rightClickItemOptions.onclick = createLinkClickHandler(node);
                break;
            case 'script':
                rightClickItemOptions.onclick = createScriptClickHandler(node);
                break;
            case 'stylesheet':
                if (node.value.toggle) {
                    rightClickItemOptions.type = 'checkbox';
                    rightClickItemOptions.onclick = createStylesheetToggleHandler(node);
                    rightClickItemOptions.checked = node.value.defaultOn;
                }
                else {
                    rightClickItemOptions.onclick = createStylesheetClickHandler(node);
                }
                globalObject.globals.crmValues.stylesheetNodeStatusses[node.id] = {
                    defaultValue: node.value.defaultOn
                };
                break;
        }
        var id = chrome.contextMenus.create(rightClickItemOptions, function () {
            if (chrome.runtime.lastError) {
                if (rightClickItemOptions.documentUrlPatterns) {
                    console.log('An error occurred with your context menu, attempting again with no url matching.', chrome.runtime.lastError);
                    delete rightClickItemOptions.documentUrlPatterns;
                    id = chrome.contextMenus.create(rightClickItemOptions, function () {
                        id = chrome.contextMenus.create({
                            title: 'ERROR',
                            onclick: createOptionsPageHandler()
                        });
                        console.log('Another error occured with your context menu!', chrome.runtime.lastError);
                    });
                }
                else {
                    console.log('An error occured with your context menu!', chrome.runtime.lastError);
                }
            }
        });
        globalObject.globals.crmValues.contextMenuInfoById[id] = {
            settings: rightClickItemOptions,
            path: node.path,
            enabled: false
        };
        idHolder.id = id;
    }
    function setLaunchModeData(node, rightClickItemOptions, idHolder) {
        //For clarity
        var launchModes = {
            'run on clicking': 0,
            'always run': 1,
            'run on specified pages': 2,
            'only show on specified pages': 3,
            'disabled': 4
        };
        var launchMode = (node.value && node.value.launchMode) || 0;
        if (launchMode === launchModes['always run']) {
            globalObject.globals.toExecuteNodes.always.push(node);
        }
        else if (launchMode === launchModes['run on specified pages']) {
            globalObject.globals.toExecuteNodes.onUrl[node.id] = node.triggers;
        }
        else if (launchMode !== launchMode.disabled) {
            addRightClickItemClick(node, launchMode, rightClickItemOptions, idHolder);
        }
    }
    function createNode(node, parentId) {
        var replaceStylesheetTabs = getStylesheetReplacementTabs(node);
        var rightClickItemOptions = {
            title: node.name,
            contexts: getContexts(node.onContentTypes),
            parentId: parentId
        };
        var idHolder = { id: null };
        setLaunchModeData(node, rightClickItemOptions, idHolder);
        var id = idHolder.id;
        if (replaceStylesheetTabs.length !== 0) {
            var css;
            var code;
            var className;
            for (var i = 0; i < replaceStylesheetTabs.length; i++) {
                className = node.id + '' + replaceStylesheetTabs[i].id;
                code = 'var nodes = document.querySelectorAll(".styleNodes' + className + '");var i;for (i = 0; i < nodes.length; i++) {nodes[i].remove();}';
                css = node.value.stylesheet.replace(/[ |\n]/g, '');
                code += 'var CRMSSInsert=document.createElement("style");CRMSSInsert.className="styleNodes' + className + '";CRMSSInsert.type="text/css";CRMSSInsert.appendChild(document.createTextNode(' + JSON.stringify(css) + '));document.head.appendChild(CRMSSInsert);';
                chrome.tabs.executeScript(replaceStylesheetTabs[i].id, {
                    code: code,
                    allFrames: true
                });
                globalObject.globals.crmValues.stylesheetNodeStatusses[node.id][replaceStylesheetTabs[i].id] = true;
            }
        }
        return id;
    }
    function buildPageCRMTree(node, parentId, path, parentTree) {
        var i;
        var id = createNode(node, parentId);
        globalObject.globals.crmValues.contextMenuIds[node.id] = id;
        if (id !== null) {
            var children = [];
            if (node.children) {
                var visibleIndex = 0;
                for (i = 0; i < node.children.length; i++) {
                    var newPath = JSON.parse(JSON.stringify(path));
                    newPath.push(visibleIndex);
                    var result = buildPageCRMTree(node.children[i], id, newPath, children);
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
    }
    function buildNodePaths(tree, currentPath) {
        for (var i = 0; i < tree.length; i++) {
            var childPath = currentPath.concat([i]);
            tree[i].path = childPath;
            if (tree[i].children) {
                buildNodePaths(tree[i].children, childPath);
            }
        }
    }
    function updateCRMValues() {
        globalObject.globals.crm.crmTree = globalObject.globals.storages.settingsStorage.crm;
        globalObject.globals.crm.safeTree = buildSafeTree(globalObject.globals.storages.settingsStorage.crm);
        buildNodePaths(globalObject.globals.crm.crmTree, []);
        buildByIdObjects();
    }
    function buildPageCRM(storageSync) {
        var i;
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
        for (i = 0; i < length; i++) {
            var result = buildPageCRMTree(globalObject.globals.crm.crmTree[i], globalObject.globals.crmValues.rootId, [i], globalObject.globals.crmValues.contextMenuItemTree);
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
        if (storageSync.showOptions) {
            chrome.contextMenus.create({
                type: 'separator',
                parentId: globalObject.globals.crmValues.rootId
            });
            chrome.contextMenus.create({
                title: 'Options',
                onclick: createOptionsPageHandler(),
                parentId: globalObject.globals.crmValues.rootId
            });
        }
    }
    chrome.tabs.onRemoved.addListener(function (tabId) {
        //Delete all data for this tabId
        var node;
        for (node in globalObject.globals.crmValues.stylesheetNodeStatusses) {
            if (globalObject.globals.crmValues.stylesheetNodeStatusses.hasOwnProperty(node) && globalObject.globals.crmValues.stylesheetNodeStatusses[node]) {
                globalObject.globals.crmValues.stylesheetNodeStatusses[node][tabId] = undefined;
            }
        }
        //Delete this instance if it exists
        var deleted = [];
        for (node in globalObject.globals.crmValues.nodeInstances) {
            if (globalObject.globals.crmValues.nodeInstances.hasOwnProperty(node) && globalObject.globals.crmValues.nodeInstances[node]) {
                if (globalObject.globals.crmValues.nodeInstances[node][tabId]) {
                    deleted.push(node);
                    globalObject.globals.crmValues.nodeInstances[node][tabId] = undefined;
                }
            }
        }
        for (var i = 0; i < deleted.length; i++) {
            if (deleted[i].node && deleted[i].node.id !== undefined) {
                globalObject.globals.crmValues.tabData[tabId].nodes[deleted[i].node.id].port.postMessage({
                    change: {
                        type: 'removed',
                        value: tabId
                    },
                    messageType: 'instancesUpdate'
                });
            }
        }
        delete globalObject.globals.crmValues.tabData[tabId];
        updateTabAndIdLists();
    });
    //#endregion
    //#region BackgroundPages
    function loadBackgroundPageLibs(node) {
        var libraries = [];
        var code = [];
        for (var i = 0; i < node.value.libraries.length; i++) {
            var lib;
            if (globalObject.globals.storages.storageLocal.libraries) {
                for (var j = 0; j < globalObject.globals.storages.storageLocal.libraries.length; j++) {
                    if (globalObject.globals.storages.storageLocal.libraries[j].name === node.value
                        .libraries[i].name) {
                        lib = globalObject.globals.storages.storageLocal.libraries[j];
                        break;
                    }
                    else {
                        //Resource hasn't been registered with its name, try if it's an anonymous one
                        if (node.value.libraries[i].name === null) {
                            //Check if the value has been registered as a resource
                            if (globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url]) {
                                lib = {
                                    code: globalObject.globals.storages.urlDataPairs[node.value.libraries[i].url]
                                        .dataString
                                };
                            }
                        }
                    }
                }
            }
            if (lib) {
                if (lib.location) {
                    libraries.push('/js/defaultLibraries/' + lib.location);
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
    function createBackgroundPage(node) {
        if (!node || node.type !== 'script' || !node.value.backgroundScript || node.value.backgroundScript === '') {
            return;
        }
        var isRestart = false;
        if (globalObject.globals.background.byId[node.id]) {
            isRestart = true;
            console.log('Background page [' + node.id + ']: ', 'Restarting background page...');
            globalObject.globals.background.byId[node.id].worker.terminate();
            console.log('Background page [' + node.id + ']: ', 'Terminated background page...');
        }
        var result = loadBackgroundPageLibs(node);
        var code = result.code;
        var libraries = result.libraries;
        var key = [];
        var err = false;
        try {
            key = createSecretKey();
        }
        catch (e) {
            //There somehow was a stack overflow
            err = e;
        }
        if (!err) {
            globalObject.globals.crmValues.tabData[0] = globalObject.globals.crmValues.tabData[0] || {
                libraries: {},
                nodes: {}
            };
            globalObject.globals.crmValues.tabData[0].nodes[node.id] = {
                secretKey: key
            };
            updateTabAndIdLists();
            var metaData = getMetaTags(node.value.script);
            var metaString = getMetaLines(node.value.script) || undefined;
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
                indentUnit = [];
                indentUnit[globalObject.globals.storages.settingsStorage.editor.tabSize || 2] = '';
                indentUnit = indentUnit.join(' ');
            }
            var script = node.value.backgroundScript.split('\n').map(function (line) {
                return indentUnit + line;
            }).join('\n');
            var metaVal = generateMetaAccessFunction(metaData);
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
                        resources: getResourcesArrayForScript(node.id),
                        "run-at": runAt,
                        system: false,
                        unwrap: true,
                        version: metaVal('version')
                    },
                    scriptMetaStr: metaString,
                    scriptSource: script,
                    scriptUpdateURL: metaVal('updateURL'),
                    scriptWillUpdate: false,
                    scriptHandler: 'Custom Right-Click Menu',
                    version: chrome.runtime.getManifest().version
                },
                resources: {}
            };
            globalObject.globals.storages.nodeStorage[node.id] = globalObject.globals.storages.nodeStorage[node.id] || {};
            var nodeStorage = globalObject.globals.storages.nodeStorage[node.id];
            libraries.push('/js/crmapi.js');
            code = [code.join('\n'), [
                    'var crmAPI = new CrmAPIInit(' +
                        [makeSafe(node), node.id, { id: 0 }, {}, key, nodeStorage, greaseMonkeyData, true]
                            .map(function (param) {
                            return JSON.stringify(param);
                        }).join(', ') +
                        ');'
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
            sandboxes.sandbox(node.id, code.join('\n'), libraries, key, function (worker) {
                globalObject.globals.background.workers.push(worker);
                globalObject.globals.background.byId[node.id] = worker;
                if (isRestart) {
                    log(node.id, '*', 'Background page [' + node.id + ']: ', 'Restarted background page...');
                }
            });
        }
        else {
            console.log('An error occurred while setting up the script for node ', node.id, err);
            throw err;
        }
    }
    function createBackgroundPages() {
        //Iterate through every node
        for (var nodeId in globalObject.globals.crm.crmById) {
            if (globalObject.globals.crm.crmById.hasOwnProperty(nodeId)) {
                var node = globalObject.globals.crm.crmById[nodeId];
                if (node.type === 'script') {
                    createBackgroundPage(node);
                }
            }
        }
    }
    //#endregion
    //#region Building CRMValues
    var permissions = [
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
    ];
    function pushIntoArray(toPush, position, target) {
        if (position === target.length) {
            target[position] = toPush;
        }
        else {
            var length = target.length + 1;
            var temp1 = target[position];
            var temp2 = toPush;
            for (var i = position; i < length; i++) {
                target[i] = temp2;
                temp2 = temp1;
                temp1 = target[i + 1];
            }
        }
        return target;
    }
    function generateItemId() {
        globalObject.globals.latestId = globalObject.globals.latestId || 0;
        globalObject.globals.latestId++;
        chrome.storage.local.set({
            latestId: globalObject.globals.latestId
        });
        return globalObject.globals.latestId;
    }
    function refreshPermissions() {
        chrome.permissions.getAll(function (available) {
            globalObject.globals.availablePermissions = available.permissions;
        });
    }
    function removeStorage(node) {
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                removeStorage(node);
            }
        }
        else {
            delete node.storage;
        }
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
    function makeSafe(node) {
        var newNode = {};
        if (node.children) {
            newNode.children = [];
            for (var i = 0; i < node.children.length; i++) {
                newNode.children[i] = makeSafe(node.children[i]);
            }
        }
        var copy = createCopyFunction(node, newNode);
        copy(['id', 'path', 'type', 'name', 'value', 'linkVal',
            'menuVal', 'scriptVal', 'stylesheetVal', 'nodeInfo',
            'triggers', 'onContentTypes', 'showOnSpecified']);
        return newNode;
    }
    function parseNode(node, isSafe) {
        globalObject.globals.crm[isSafe ? 'crmByIdSafe' : 'crmById'][node.id] = (isSafe ? makeSafe(node) : node);
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                parseNode(node.children[i], isSafe);
            }
        }
    }
    function buildByIdObjects() {
        var i;
        globalObject.globals.crm.crmById = {};
        globalObject.globals.crm.crmByIdSafe = {};
        for (i = 0; i < globalObject.globals.crm.crmTree.length; i++) {
            parseNode(globalObject.globals.crm.crmTree[i]);
            parseNode(globalObject.globals.crm.safeTree[i], true);
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
    //#endregion
    //#region Storage Updating
    function cutData(data) {
        var obj = {};
        var arrLength;
        var sectionKey;
        var indexes = [];
        var splitJson = data.match(/[\s\S]{1,5000}/g);
        splitJson.forEach(function (section) {
            arrLength = indexes.length;
            sectionKey = 'section' + arrLength;
            obj[sectionKey] = section;
            indexes[arrLength] = sectionKey;
        });
        obj.indexes = indexes;
        return obj;
    }
    function uploadChanges(type, changes, useStorageSync) {
        switch (type) {
            case 'local':
                chrome.storage.local.set(globalObject.globals.storages.storageLocal);
                for (var i = 0; i < changes.length; i++) {
                    if (changes[i].key === 'useStorageSync') {
                        uploadChanges('settings', [], changes[i].newValue);
                    }
                }
                break;
            case 'settings':
                if (useStorageSync !== undefined) {
                    globalObject.globals.storages.storageLocal.useStorageSync = useStorageSync;
                }
                var settingsJson = JSON.stringify(globalObject.globals.storages.settingsStorage);
                if (!globalObject.globals.storages.storageLocal.useStorageSync) {
                    chrome.storage.local.set({
                        settings: globalObject.globals.storages.settingsStorage
                    }, function () {
                        if (chrome.runtime.lastError) {
                            console.log('Error on uploading to chrome.storage.local ', chrome.runtime.lastError);
                        }
                        else {
                            for (var i = 0; i < changes.length; i++) {
                                if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
                                    updateCRMValues();
                                    checkBackgroundPagesForChange(changes);
                                    buildPageCRM(globalObject.globals.storages.settingsStorage);
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
                            uploadChanges('settings', changes);
                        });
                    }
                    else {
                        //Cut up all data into smaller JSON
                        var obj = cutData(settingsJson);
                        chrome.storage.sync.set(obj, function () {
                            if (chrome.runtime.lastError) {
                                //Switch to local storage
                                console.log('Error on uploading to chrome.storage.sync ', chrome.runtime.lastError);
                                chrome.storage.local.set({
                                    useStorageSync: false
                                }, function () {
                                    uploadChanges('settings', changes);
                                });
                            }
                            else {
                                for (var i = 0; i < changes.length; i++) {
                                    if (changes[i].key === 'crm' || changes[i].key === 'showOptions') {
                                        updateCRMValues();
                                        checkBackgroundPagesForChange(changes);
                                        buildPageCRM(globalObject.globals.storages.settingsStorage);
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
    }
    function orderBackgroundPagesById(tree, obj) {
        for (var i = 0; i < tree.length; i++) {
            if (tree[i].type === 'script') {
                obj[tree[i].id] = tree[i].value.backgroundScript;
            }
            else if (tree[i].type === 'menu' && tree[i].children) {
                orderBackgroundPagesById(tree[i].children, obj);
            }
        }
    }
    function checkBackgroundPagesForChange(changes, toUpdate) {
        if (toUpdate) {
            toUpdate.forEach(function (id) {
                createBackgroundPage(globalObject.globals.crm.crmById[id]);
            });
        }
        //Check if any background page updates occurred
        for (var i = 0; i < changes.length; i++) {
            if (changes[i].key === 'crm') {
                var ordered = {};
                orderBackgroundPagesById(changes[i].newValue, ordered);
                for (var id in ordered) {
                    if (ordered.hasOwnProperty(id)) {
                        if (globalObject.globals.background.byId[id] && globalObject.globals.background.byId[id].script !== ordered[id]) {
                            createBackgroundPage(globalObject.globals.crm.crmById[id]);
                        }
                    }
                }
            }
        }
    }
    function updateCrm(toUpdate) {
        uploadChanges('settings', [{
                key: 'crm',
                newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree))
            }]);
        updateCRMValues();
        buildPageCRM(globalObject.globals.storages.settingsStorage);
        if (toUpdate) {
            checkBackgroundPagesForChange([], toUpdate);
        }
    }
    function notifyNodeStorageChanges(id, tabId, changes) {
        //Update in storage
        globalObject.globals.crm.crmById[id].storage = globalObject.globals.storages.nodeStorage[id];
        chrome.storage.local.set({
            nodeStorage: globalObject.globals.storages.nodeStorage
        });
        //Notify all pages running that node
        var tabData = globalObject.globals.crmValues.tabData;
        for (var tab in tabData) {
            if (tabData.hasOwnProperty(tab) && tabData[tab]) {
                if (tab !== tabId) {
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
    }
    function applyChangeForStorageType(storageObj, changes) {
        for (var i = 0; i < changes.length; i++) {
            storageObj[changes[i].key] = changes[i].newValue;
        }
    }
    function applyChanges(data) {
        switch (data.type) {
            case 'optionsPage':
                if (data.localChanges) {
                    applyChangeForStorageType(globalObject.globals.storages.storageLocal, data.localChanges);
                    uploadChanges('local', data.localChanges);
                }
                if (data.settingsChanges) {
                    applyChangeForStorageType(globalObject.globals.storages.settingsStorage, data.settingsChanges);
                    uploadChanges('settings', data.settingsChanges);
                }
                break;
            case 'libraries':
                applyChangeForStorageType(globalObject.globals.storages.storageLocal, [
                    {
                        key: 'libraries',
                        newValue: data.libraries,
                        oldValue: globalObject.globals.storages.storageLocal.libraries
                    }
                ]);
                break;
            case 'nodeStorage':
                globalObject.globals.storages.nodeStorage[data.id] = globalObject.globals.storages.nodeStorage[data.id] || {};
                applyChangeForStorageType(globalObject.globals.storages.nodeStorage[data.id], data.nodeStorageChanges);
                notifyNodeStorageChanges(data.id, data.tabId, data.nodeStorageChanges);
                break;
        }
    }
    //#endregion
    //#region CRMFunction
    function respondToCrmAPI(message, type, data, stackTrace) {
        var msg = {
            type: type,
            callbackId: message.onFinish,
            messageType: 'callback'
        };
        msg.data = (type === 'error' || type === 'chromeError' ? {
            error: data,
            stackTrace: stackTrace,
            lineNumber: message.lineNumber
        } : data);
        try {
            globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id].port.postMessage(msg);
        }
        catch (e) {
            if (e.message === 'Converting circular structure to JSON') {
                respondToCrmAPI(message, 'error', 'Converting circular structure to JSON, this API will not work');
            }
            else {
                throw e;
            }
        }
    }
    function throwChromeError(message, error, stackTrace) {
        console.warn('Error:', error);
        if (stackTrace) {
            var stacktraceSplit = stackTrace.split('\n');
            stacktraceSplit.forEach(function (line) {
                console.warn(line);
            });
        }
        respondToCrmAPI(message, 'chromeError', error, stackTrace);
    }
    function flattenCrm(searchScope, obj) {
        searchScope.push(obj);
        if (obj.children) {
            obj.children.forEach(function (child) {
                flattenCrm(searchScope, child);
            });
        }
    }
    function runCrmFunction(toRun, _this) {
        var crmFunctions = {
            getTree: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.respondSuccess(globalObject.globals.crm.safeTree);
                });
            },
            getSubTree: function (id) {
                _this.checkPermissions(['crmGet'], function () {
                    if (typeof _this.message.nodeId === 'number') {
                        var node = globalObject.globals.crm.crmByIdSafe[_this.message.nodeId];
                        if (node) {
                            _this.respondSuccess([node]);
                        }
                        else {
                            _this.respondError('There is no node with id ' + (_this.message.nodeId));
                        }
                    }
                    else {
                        _this.respondError('No nodeId supplied');
                    }
                });
            },
            getNode: function () {
                _this.checkPermissions(['crmGet'], function () {
                    if (typeof _this.message.nodeId === 'number') {
                        var node = globalObject.globals.crm.crmByIdSafe[_this.message.nodeId];
                        if (node) {
                            _this.respondSuccess(node);
                        }
                        else {
                            _this.respondError('There is no node with id ' + (_this.message.nodeId));
                        }
                    }
                    else {
                        _this.respondError('No nodeId supplied');
                    }
                });
            },
            getNodeIdFromPath: function (path) {
                _this.checkPermissions(['crmGet'], function () {
                    var pathToSearch = path || _this.message.path;
                    var lookedUp = _this.lookup(pathToSearch, globalObject.globals.crm.safeTree, false);
                    if (lookedUp === true) {
                        return false;
                    }
                    else if (lookedUp === false) {
                        _this.respondError('Path does not return a valid value');
                        return false;
                    }
                    else {
                        _this.respondSuccess(lookedUp.id);
                        return lookedUp.id;
                    }
                });
            },
            queryCrm: function () {
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
                        var searchScope;
                        if (optionals['query.inSubTree']) {
                            var searchScopeObj = _this.getNodeFromId(_this.message.query.inSubTree, true, true);
                            var searchScopeObjChildren = [];
                            if (searchScopeObj) {
                                searchScopeObjChildren = searchScopeObj.children;
                            }
                            searchScope = [];
                            searchScopeObjChildren.forEach(function (child) {
                                flattenCrm(searchScope, child);
                            });
                        }
                        searchScope = searchScope || crmArray;
                        if (optionals['query.type']) {
                            searchScope = searchScope.filter(function (candidate) {
                                return candidate.type === _this.message.query.type;
                            });
                        }
                        if (optionals['query.name']) {
                            searchScope = searchScope.filter(function (candidate) {
                                return candidate.name === _this.message.query.name;
                            });
                        }
                        //Filter out all nulls
                        searchScope = searchScope.filter(function (result) {
                            return result !== null;
                        });
                        _this.respondSuccess(searchScope);
                    });
                });
            },
            getParentNode: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        var pathToSearch = JSON.parse(JSON.stringify(node.path));
                        pathToSearch.pop();
                        if (pathToSearch.length === 0) {
                            _this.respondSuccess(globalObject.globals.crm.safeTree);
                        }
                        else {
                            var lookedUp = _this.lookup(pathToSearch, globalObject.globals.crm.safeTree, false);
                            _this.respondSuccess(lookedUp);
                        }
                    });
                });
            },
            getNodeType: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        _this.respondSuccess(node.type);
                    });
                });
            },
            getNodeValue: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        _this.respondSuccess(node.value);
                    });
                });
            },
            createNode: function () {
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
                        var id = generateItemId();
                        var i;
                        var node = _this.message.options;
                        node = makeSafe(node);
                        node.id = id;
                        node.nodeInfo = _this.getNodeFromId(_this.message.id, false, true).nodeInfo;
                        _this.getNodeFromId(_this.message.id, false, true).local && (node.local = true);
                        var newNode;
                        switch (_this.message.options.type) {
                            case 'script':
                                newNode = getTemplates().getDefaultLinkNode(node);
                                newNode.type = 'script';
                                break;
                            case 'stylesheet':
                                newNode = getTemplates().getDefaultLinkNode(node);
                                newNode.type = 'stylesheet';
                                break;
                            case 'menu':
                                newNode = getTemplates().getDefaultLinkNode(node);
                                newNode.type = 'menu';
                                break;
                            case 'divider':
                                newNode = getTemplates().getDefaultLinkNode(node);
                                newNode.type = 'divider';
                                break;
                            default:
                            case 'link':
                                newNode = getTemplates().getDefaultLinkNode(node);
                                newNode.type = 'link';
                                break;
                        }
                        if ((newNode = _this.moveNode(newNode, _this.message.options.position))) {
                            updateCrm([newNode.id]);
                            _this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
                        }
                        else {
                            _this.respondError('Failed to place node');
                        }
                        return true;
                    });
                });
            },
            copyNode: function () {
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
                            var id = generateItemId();
                            newNode.id = id;
                            if (_this.getNodeFromId(_this.message.id, false, true).local === true && node.local === true) {
                                newNode.local = true;
                            }
                            newNode.nodeInfo = _this.getNodeFromId(_this.message.id, false, true).nodeInfo;
                            delete newNode.storage;
                            delete newNode.file;
                            if (optionals['options.name']) {
                                newNode.name = _this.message.options.name;
                            }
                            if ((newNode = _this.moveNode(newNode, _this.message.options.position))) {
                                updateCrm([newNode.id]);
                                _this.respondSuccess(_this.getNodeFromId(newNode.id, true, true));
                            }
                            return true;
                        });
                        return true;
                    });
                });
                return true;
            },
            moveNode: function () {
                _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        //Remove original from CRM
                        var parentChildren = _this.lookup(node.path, globalObject.globals.crm.crmTree, true);
                        //parentChildren.splice(node.path[node.path.length - 1], 1);
                        if ((node = _this.moveNode(node, _this.message.position, {
                            children: parentChildren,
                            index: node.path[node.path.length - 1]
                        }))) {
                            updateCrm();
                            _this.respondSuccess(_this.getNodeFromId(node.id, true, true));
                        }
                    });
                });
            },
            deleteNode: function () {
                _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        var parentChildren = _this.lookup(node.path, globalObject.globals.crm.crmTree, true);
                        parentChildren.splice(node.path[node.path.length - 1], 1);
                        if (globalObject.globals.crmValues.contextMenuIds[node.id] !== undefined) {
                            chrome.contextMenus.remove(globalObject.globals.crmValues.contextMenuIds[node.id], function () {
                                updateCrm([_this.message.nodeId]);
                                _this.respondSuccess(true);
                            });
                        }
                        else {
                            updateCrm([_this.message.nodeId]);
                            _this.respondSuccess(true);
                        }
                    });
                });
            },
            editNode: function () {
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
                                    _this.respondError('Given type is not a possible type to switch to, use either script, stylesheet, link, menu or divider');
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
                            updateCrm([_this.message.id]);
                            _this.respondSuccess(safe(node));
                            return true;
                        });
                    });
                });
            },
            getTriggers: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        _this.respondSuccess(node.triggers);
                    });
                });
            },
            setTriggers: function () {
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
                            node.triggers = _this.message.triggers;
                            node.showOnSpecified = true;
                            updateCrm();
                            var matchPatterns = [];
                            globalObject.globals.crmValues.hideNodesOnPagesData[node.id] = [];
                            if (node.launchMode !== 3) {
                                for (var i = 0; i < node.triggers.length; i++) {
                                    if (!triggerMatchesScheme(node.triggers[i].url)) {
                                        _this.respondError('Triggers don\'t match URL scheme');
                                        return false;
                                    }
                                    node.triggers[i].url = prepareTrigger(node.triggers[i].url);
                                    if (node.triggers[i].not) {
                                        globalObject.globals.crmValues.hideNodesOnPagesData[node.id].push(node.triggers[i].url);
                                    }
                                    else {
                                        matchPatterns.push(node.triggers[i].url);
                                    }
                                }
                            }
                            chrome.contextMenus.update(globalObject.globals.crmValues.contextMenuIds[node.id], {
                                documentUrlPatterns: matchPatterns
                            }, function () {
                                updateCrm();
                                _this.respondSuccess(safe(node));
                            });
                        });
                    });
                });
            },
            getTriggerUsage: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type === 'menu' || node.type === 'link' || node.type === 'divider') {
                            _this.respondSuccess(node.showOnSpecified);
                        }
                        else {
                            _this.respondError('Node is not of right type, can only be menu, link or divider');
                        }
                    });
                });
            },
            setTriggerUsage: function () {
                _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    _this.typeCheck([
                        {
                            val: 'useTriggers',
                            type: 'boolean'
                        }
                    ], function () {
                        _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                            if (node.type === 'menu' || node.type === 'link' || node.type === 'divider') {
                                node.showOnSpecified = _this.message.useTriggers;
                                updateCrm();
                                chrome.contextMenus.update(globalObject.globals.crmValues.contextMenuIds[node.id], {
                                    documentUrlPatterns: ['<all_urls>']
                                }, function () {
                                    updateCrm();
                                    _this.respondSuccess(safe(node));
                                });
                            }
                            else {
                                _this.respondError('Node is not of right type, can only be menu, link or divider');
                            }
                        });
                    });
                });
            },
            getContentTypes: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        _this.respondSuccess(node.onContentTypes);
                    });
                });
            },
            setContentType: function () {
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
                            node.onContentTypes[_this.message.index] = _this.message.value;
                            updateCrm();
                            chrome.contextMenus.update(globalObject.globals.crmValues.contextMenuIds[node.id], {
                                contexts: getContexts(node.onContentTypes)
                            }, function () {
                                updateCrm();
                                _this.respondSuccess(node.onContentTypes);
                            });
                        });
                    });
                });
            },
            setContentTypes: function () {
                _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    _this.typeCheck([
                        {
                            val: 'contentTypes',
                            type: 'array'
                        }
                    ], function () {
                        _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                            var i;
                            for (i = 0; i < _this.message.contentTypes.length; i++) {
                                if (typeof _this.message.contentTypes[i] !== 'string') {
                                    _this.respondError('Not all values in array contentTypes are of type string');
                                    return false;
                                }
                            }
                            var matches = 0;
                            var hasContentType;
                            var contentTypes = [];
                            var contentTypeStrings = ['page', 'link', 'selection', 'image', 'video', 'audio'];
                            for (i = 0; i < _this.message.contentTypes.length; i++) {
                                hasContentType = _this.message.contentTypes.indexOf(contentTypeStrings[i]) > -1;
                                hasContentType && matches++;
                                contentTypes[i] = hasContentType;
                            }
                            if (!matches) {
                                contentTypes = [true, true, true, true, true, true];
                            }
                            node.onContentTypes = contentTypes;
                            chrome.contextMenus.update(globalObject.globals.crmValues.contextMenuIds[node.id], {
                                contexts: getContexts(node.onContentTypes)
                            }, function () {
                                updateCrm();
                                _this.respondSuccess(safe(node));
                            });
                            return true;
                        });
                    });
                });
            },
            linkGetLinks: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                        if (node.type === 'link') {
                            _this.respondSuccess(node.value);
                        }
                        else {
                            _this.respondSuccess(node.linkVal);
                        }
                        return true;
                    });
                });
            },
            linkPush: function () {
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
                            if (Array.isArray(_this.message.items)) {
                                if (node.type !== 'link') {
                                    node.linkVal = node.linkVal || [];
                                }
                                for (var i = 0; i < _this.message.items.length; i++) {
                                    _this.message.items[i].newTab = !!_this.message.items[i].newTab;
                                    node[(node.type === 'link' ? 'value' : 'linkVal')]
                                        .push(_this.message.items[i]);
                                }
                            }
                            else {
                                _this.message.items.newTab = !!_this.message.items.newTab;
                                if (!_this.message.items.url) {
                                    _this.respondError('For not all values in the array items is the property url defined');
                                    return false;
                                }
                                if (node.type === 'link') {
                                    node.value.push(_this.message.items);
                                }
                                else {
                                    node.linkVal.push = node.linkVal.push || [];
                                    node.linkVal.push(_this.message.items);
                                }
                            }
                            updateCrm();
                            if (node.type === 'link') {
                                _this.respondSuccess(safe(node).value);
                            }
                            else {
                                _this.respondSuccess(safe(node)['linkVal']);
                            }
                            return true;
                        });
                    });
                });
            },
            linkSplice: function () {
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
                                spliced = node.value.splice(_this.message.start, _this.message.amount);
                                updateCrm();
                                _this.respondSuccess(spliced, safe(node).value);
                            }
                            else {
                                node.linkVal = node.linkVal || [];
                                spliced = node.linkVal.splice(_this.message.start, _this.message.amount);
                                updateCrm();
                                _this.respondSuccess(spliced, safe(node)['linkVal']);
                            }
                        });
                    });
                });
            },
            setLaunchMode: function () {
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
                                node.value.launchMode = _this.message.launchMode;
                            }
                            else {
                                _this.respondError('Node is not of type script or stylesheet');
                            }
                            updateCrm();
                            _this.respondSuccess(safe(node));
                            return true;
                        });
                    });
                });
            },
            getLaunchMode: function () {
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
            },
            registerLibrary: function () {
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
                        if (optionals.url) {
                            if (_this.message.url.indexOf('.js') === _this.message.url.length - 3) {
                                //Use URL
                                var done = false;
                                var xhr = new window.XMLHttpRequest();
                                xhr.open('GET', _this.message.url, true);
                                xhr.onreadystatechange = function () {
                                    if (xhr.readyState === 4 && xhr.status === 200) {
                                        done = true;
                                        newLibrary = {
                                            name: _this.message.name,
                                            code: xhr.responseText,
                                            url: _this.message.url
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
                        else if (optionals.code) {
                            newLibrary = {
                                name: _this.message.name,
                                code: _this.message.code
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
            },
            scriptLibraryPush: function () {
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
                                    if (globalObject.globals.storages.storageLocal.libraries[i].name.toLowerCase() === lib.name.toLowerCase()) {
                                        return globalObject.globals.storages.storageLocal.libraries[i].name;
                                    }
                                }
                                return false;
                            }
                            function isAlreadyUsed(lib) {
                                for (var i = 0; i < node.value.libraries.length; i++) {
                                    if (node.value.libraries[i].name === lib.name) {
                                        return true;
                                    }
                                }
                                return false;
                            }
                            if (node.type !== 'script') {
                                _this.respondError('Node is not of type script');
                                return false;
                            }
                            if (Array.isArray(_this.message.libraries)) {
                                for (var i = 0; i < _this.message.libraries.length; i++) {
                                    var originalName = _this.message.libraries[i].name;
                                    if (!(_this.message.libraries[i].name = doesLibraryExist(_this.message.libraries[i]))) {
                                        _this.respondError('Library ' + originalName + ' is not registered');
                                        return false;
                                    }
                                    if (!isAlreadyUsed(_this.message.libraries[i])) {
                                        node.value.libraries.push(_this.message.libraries[i]);
                                    }
                                }
                            }
                            else {
                                var name = _this.message.libraries.name;
                                if (!(_this.message.libraries.name = doesLibraryExist(_this.message.libraries))) {
                                    _this.respondError('Library ' + name + ' is not registered');
                                    return false;
                                }
                                if (!isAlreadyUsed(_this.message.libraries)) {
                                    node.value.libraries.push(_this.message.libraries);
                                }
                            }
                            updateCrm();
                            _this.respondSuccess(safe(node).value.libraries);
                            return true;
                        });
                    });
                });
            },
            scriptLibrarySplice: function () {
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
                                spliced = safe(node).value.libraries.splice(_this.message.start, _this.message.amount);
                                updateCrm();
                                _this.respondSuccess(spliced, safe(node).value.libraries);
                            }
                            else {
                                _this.respondError('Node is not of type script');
                            }
                            return true;
                        });
                    });
                });
            },
            scriptBackgroundLibraryPush: function () {
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
                                    if (globalObject.globals.storages.storageLocal.libraries[i].name.toLowerCase() === lib.name.toLowerCase()) {
                                        return globalObject.globals.storages.storageLocal.libraries[i].name;
                                    }
                                }
                                return false;
                            }
                            function isAlreadyUsed(lib) {
                                for (var i = 0; i < node.value.backgroundLibraries.length; i++) {
                                    if (node.value.backgroundLibraries[i].name === lib.name) {
                                        return true;
                                    }
                                }
                                return false;
                            }
                            if (node.type !== 'script') {
                                _this.respondError('Node is not of type script');
                                return false;
                            }
                            if (Array.isArray(_this.message.libraries)) {
                                for (var i = 0; i < _this.message.libraries.length; i++) {
                                    var originalName = _this.message.libraries[i].name;
                                    if (!(_this.message.libraries[i].name = doesLibraryExist(_this.message.libraries[i]))) {
                                        _this.respondError('Library ' + originalName + ' is not registered');
                                        return false;
                                    }
                                    if (!isAlreadyUsed(_this.message.libraries[i])) {
                                        node.value.backgroundLibraries.push(_this.message.libraries[i]);
                                    }
                                }
                            }
                            else {
                                var name = _this.message.libraries.name;
                                if (!(_this.message.libraries.name = doesLibraryExist(_this.message.libraries))) {
                                    _this.respondError('Library ' + name + ' is not registered');
                                    return false;
                                }
                                if (!isAlreadyUsed(_this.message.libraries)) {
                                    node.value.backgroundLibraries.push(_this.message.libraries);
                                }
                            }
                            updateCrm();
                            _this.respondSuccess(safe(node).value.backgroundLibraries);
                            return true;
                        });
                    });
                });
            },
            scriptBackgroundLibrarySplice: function () {
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
                                spliced = safe(node).value.backgroundLibraries.splice(_this.message.start, _this.message.amount);
                                updateCrm([_this.message.nodeId]);
                                _this.respondSuccess(spliced, safe(node).value.backgroundLibraries);
                            }
                            else {
                                node.scriptVal = node.scriptVal || {};
                                node.scriptVal.backgroundLibraries = node.scriptVal.libraries || [];
                                spliced = node.scriptVal.backgroundLibraries.splice(_this.message.start, _this.message.amount);
                                updateCrm([_this.message.nodeId]);
                                _this.respondSuccess(spliced, node.scriptVal.backgroundLibraries);
                            }
                            return true;
                        });
                    });
                });
            },
            setScriptValue: function () {
                _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    _this.typeCheck([
                        {
                            val: 'script',
                            type: 'string'
                        }
                    ], function () {
                        _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                            if (node.type === 'script') {
                                node.value.script = _this.message.script;
                            }
                            else {
                                node.scriptVal = node.scriptVal || {};
                                node.scriptVal.script = _this.message.script;
                            }
                            updateCrm();
                            _this.respondSuccess(safe(node));
                            return true;
                        });
                    });
                });
            },
            getScriptValue: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        if (node.type === 'script') {
                            _this.respondSuccess(node.value.script);
                        }
                        else {
                            (node.scriptVal && _this.respondSuccess(node.scriptVal.script)) || _this.respondSuccess(undefined);
                        }
                    });
                });
            },
            setStylesheetValue: function () {
                _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    _this.typeCheck([
                        {
                            val: 'stylesheet',
                            type: 'string'
                        }
                    ], function () {
                        _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                            if (node.type === 'stylesheet') {
                                node.value.stylesheet = _this.message.stylesheet;
                            }
                            else {
                                node.stylesheetVal = node.scriptVal || {};
                                node.stylesheetVal.stylesheet = _this.message.stylesheet;
                            }
                            updateCrm();
                            _this.respondSuccess(safe(node));
                            return true;
                        });
                    });
                });
            },
            getStylesheetValue: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        if (node.type === 'stylesheet') {
                            _this.respondSuccess(node.value.stylesheet);
                        }
                        else {
                            (node.stylesheetVall && _this.respondSuccess(node.stylesheetVal.stylesheet)) || _this.respondSuccess(undefined);
                        }
                    });
                });
            },
            setBackgroundScriptValue: function () {
                _this.checkPermissions(['crmGet', 'crmWrite'], function () {
                    _this.typeCheck([
                        {
                            val: 'script',
                            type: 'string'
                        }
                    ], function () {
                        _this.getNodeFromId(_this.message.nodeId).run(function (node) {
                            if (node.type === 'script') {
                                node.value.backgroundScript = _this.message.script;
                            }
                            else {
                                node.scriptVal = node.scriptVal || {};
                                node.scriptVal.backgroundScript = _this.message.script;
                            }
                            updateCrm([_this.message.nodeId]);
                            _this.respondSuccess(safe(node));
                            return true;
                        });
                    });
                });
            },
            getBackgroundScriptValue: function () {
                _this.checkPermissions(['crmGet'], function () {
                    _this.getNodeFromId(_this.message.nodeId, true).run(function (node) {
                        if (node.type === 'script') {
                            _this.respondSuccess(node.value.backgroundScript);
                        }
                        else {
                            (node.scriptVal && _this.respondSuccess(node.scriptVal.backgroundScript)) || _this.respondSuccess(undefined);
                        }
                    });
                });
            },
            getMenuChildren: function () {
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
            },
            setMenuChildren: function () {
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
                            for (i = 0; i < _this.message.childrenIds.length; i++) {
                                if (typeof _this.message.childrenIds[i] !== 'number') {
                                    _this.respondError('Not all values in array childrenIds are of type number');
                                    return false;
                                }
                            }
                            var oldLength = node.children.length;
                            for (i = 0; i < _this.message.childrenIds.length; i++) {
                                var toMove = _this.getNodeFromId(_this.message.childrenIds[i], false, true);
                                _this.moveNode(toMove, {
                                    position: 'lastChild',
                                    node: _this.message.nodeId
                                }, {
                                    children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree, true),
                                    index: toMove.path[toMove.path.length - 1]
                                });
                            }
                            _this.getNodeFromId(node.id, false, true).children.splice(0, oldLength);
                            updateCrm();
                            _this.respondSuccess(_this.getNodeFromId(node.id, true, true));
                            return true;
                        });
                    });
                });
            },
            pushMenuChildren: function () {
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
                            for (i = 0; i < _this.message.childrenIds.length; i++) {
                                if (typeof _this.message.childrenIds[i] !== 'number') {
                                    _this.respondError('Not all values in array childrenIds are of type number');
                                    return false;
                                }
                            }
                            for (i = 0; i < _this.message.childrenIds.length; i++) {
                                var toMove = _this.getNodeFromId(_this.message.childrenIds[i], false, true);
                                _this.moveNode(toMove, {
                                    position: 'lastChild',
                                    node: _this.message.nodeId
                                }, {
                                    children: _this.lookup(toMove.path, globalObject.globals.crm.crmTree, true),
                                    index: toMove.path[toMove.path.length - 1]
                                });
                            }
                            updateCrm();
                            _this.respondSuccess(_this.getNodeFromId(node.id, true, true));
                            return true;
                        });
                    });
                });
            },
            spliceMenuChildren: function () {
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
                        _this.getNodeFromId(_this.message.nodeId, false).run(function (node) {
                            if (node.type !== 'menu') {
                                _this.respondError('Node is not of type menu');
                            }
                            var spliced = node.children.splice(_this.message.start, _this.message.amount);
                            updateCrm();
                            _this.respondSuccess(spliced.map(function (splicedNode) {
                                return makeSafe(splicedNode);
                            }), _this.getNodeFromId(node.id, true, true).children);
                            return true;
                        });
                    });
                });
            }
        };
        crmFunctions[toRun] && crmFunctions[toRun]();
    }
    // ReSharper disable once InconsistentNaming
    function CRMFunction(message, toRun) {
        this.toRun = toRun;
        this.message = message;
        runCrmFunction(this.toRun, this);
    }
    CRMFunction.prototype.respondSuccess = function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        respondToCrmAPI(this.message, 'success', args);
        return true;
    };
    CRMFunction.prototype.respondError = function (error) {
        respondToCrmAPI(this.message, 'error', error);
        return true;
    };
    CRMFunction.prototype.lookup = function (path, data, hold) {
        if (path === null || typeof path !== 'object' || !Array.isArray(path)) {
            this.respondError('Supplied path is not of type array');
            return true;
        }
        var length = path.length - 1;
        for (var i = 0; i < length; i++) {
            if (data && data[path[i]]) {
                data = data[path[i]].children;
            }
            else {
                return false;
            }
        }
        return (hold ? data : data[path[length]]) || false;
    };
    CRMFunction.prototype.checkType = function (toCheck, type, name, optional, ifndef, isArray, ifdef) {
        if (toCheck === undefined || toCheck === null) {
            if (optional) {
                ifndef && ifndef();
                return true;
            }
            else {
                if (isArray) {
                    this.respondError('Not all values for ' + name + ' are defined');
                }
                else {
                    this.respondError('Value for ' + name + ' is not defined');
                }
                return false;
            }
        }
        else {
            if (type === 'array') {
                if (typeof toCheck !== 'object' || Array.isArray(toCheck)) {
                    if (isArray) {
                        this.respondError('Not all values for ' + name + ' are of type ' + type + ', they are instead of type ' + typeof toCheck);
                    }
                    else {
                        this.respondError('Value for ' + name + ' is not of type ' + type + ', it is instead of type ' + typeof toCheck);
                    }
                    return false;
                }
            }
            if (typeof toCheck !== type) {
                if (isArray) {
                    this.respondError('Not all values for ' + name + ' are of type ' + type + ', they are instead of type ' + typeof toCheck);
                }
                else {
                    this.respondError('Value for ' + name + ' is not of type ' + type + ', it is instead of type ' + typeof toCheck);
                }
                return false;
            }
        }
        ifdef && ifdef();
        return true;
    };
    CRMFunction.prototype.moveNode = function (node, position, removeOld) {
        var _this = this;
        //Capture old CRM tree
        var oldCrmTree = JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree));
        //Put the node in the tree
        var relativeNode;
        var parentChildren;
        position = position || {};
        if (!this.checkType(position, 'object', 'position')) {
            return false;
        }
        if (!this.checkType(position.node, 'number', 'node', true, null, false, function () {
            if (!(relativeNode = _this.getNodeFromId(position.node, false, true))) {
                return false;
            }
        })) {
            return false;
        }
        if (!this.checkType(position.relation, 'string', 'relation', true)) {
            return false;
        }
        relativeNode = relativeNode || globalObject.globals.crm.crmTree;
        var isRoot = relativeNode === globalObject.globals.crm.crmTree;
        switch (position.relation) {
            case 'before':
                if (isRoot) {
                    pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
                    if (removeOld && globalObject.globals.crm.crmTree === removeOld.children) {
                        removeOld.index++;
                    }
                }
                else {
                    parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm.crmTree, true);
                    pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1], parentChildren);
                    if (removeOld && parentChildren === removeOld.children) {
                        removeOld.index++;
                    }
                }
                break;
            case 'firstSibling':
                if (isRoot) {
                    pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
                    if (removeOld && globalObject.globals.crm.crmTree === removeOld.children) {
                        removeOld.index++;
                    }
                }
                else {
                    parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm.crmTree, true);
                    pushIntoArray(node, 0, parentChildren);
                    if (removeOld && parentChildren === removeOld.children) {
                        removeOld.index++;
                    }
                }
                break;
            case 'after':
                if (isRoot) {
                    pushIntoArray(node, globalObject.globals.crm.crmTree.length, globalObject.globals.crm.crmTree);
                }
                else {
                    parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm.crmTree, true);
                    if (relativeNode.path.length > 0) {
                        pushIntoArray(node, relativeNode.path[relativeNode.path.length - 1] + 1, parentChildren);
                    }
                }
                break;
            case 'lastSibling':
                if (isRoot) {
                    pushIntoArray(node, globalObject.globals.crm.crmTree.length, globalObject.globals.crm.crmTree);
                }
                else {
                    parentChildren = this.lookup(relativeNode.path, globalObject.globals.crm.crmTree, true);
                    pushIntoArray(node, parentChildren.length, parentChildren);
                }
                break;
            case 'firstChild':
                if (isRoot) {
                    pushIntoArray(node, 0, globalObject.globals.crm.crmTree);
                    if (removeOld && globalObject.globals.crm.crmTree === removeOld.children) {
                        removeOld.index++;
                    }
                }
                else if (relativeNode.type === 'menu') {
                    pushIntoArray(node, 0, relativeNode.children);
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
                    pushIntoArray(node, globalObject.globals.crm.crmTree.length, globalObject.globals.crm.crmTree);
                }
                else if (relativeNode.type === 'menu') {
                    pushIntoArray(node, relativeNode.children.length, relativeNode.children);
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
        applyChanges({
            type: 'optionsPage',
            settingsChanges: [{
                    key: 'crm',
                    oldValue: oldCrmTree,
                    newValue: JSON.parse(JSON.stringify(globalObject.globals.crm.crmTree))
                }]
        });
        return node;
    };
    CRMFunction.prototype.getNodeFromId = function (id, makeSafe, synchronous) {
        var node = (makeSafe ? globalObject.globals.crm.crmByIdSafe : globalObject.globals.crm.crmById)[id];
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
            this.respondError('There is no node with the id you supplied (' + id + ')');
            if (synchronous) {
                return false;
            }
            return {
                run: function () { }
            };
        }
    };
    CRMFunction.prototype.typeCheck = function (toCheck, callback) {
        var i, j, k, l;
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
        for (i = 0; i < toCheck.length; i++) {
            toCheckName = toCheck[i].val;
            if (toCheck[i].dependency) {
                if (!optionals[toCheck[i].dependency]) {
                    optionals[toCheckName] = false;
                    continue;
                }
            }
            toCheckTypes = toCheck[i].type.split('|');
            toCheckValue = eval('this.message.' + toCheckName + ';');
            if (toCheckValue === undefined || toCheckValue === null) {
                if (toCheck[i].optional) {
                    optionals[toCheckName] = false;
                    continue;
                }
                else {
                    this.respondError('Value for ' + toCheckName + ' is not set');
                    return false;
                }
            }
            else {
                toCheckIsArray = Array.isArray(toCheckValue);
                typesMatch = false;
                matchingType = false;
                for (j = 0; j < toCheckTypes.length; j++) {
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
                    this.respondError('Value for ' + toCheckName + ' is not of type ' + toCheckTypes.join(' or '));
                    return false;
                }
                optionals[toCheckName] = true;
                if (toCheck[i].min !== undefined && typeof toCheckValue === 'number') {
                    if (toCheck[i].min > toCheckValue) {
                        this.respondError('Value for ' + toCheckName + ' is smaller than ' + toCheck[i].min);
                        return false;
                    }
                }
                if (toCheck[i].max !== undefined && typeof toCheckValue === 'number') {
                    if (toCheck[i].max < toCheckValue) {
                        this.respondError('Value for ' + toCheckName + ' is bigger than ' + toCheck[i].max);
                        return false;
                    }
                }
                if (toCheckIsArray && matchingType.indexOf('array') && toCheck[i].forChildren) {
                    for (j = 0; j < toCheckValue.length; j++) {
                        for (k = 0; k < toCheck[i].forChildren.length; k++) {
                            toCheckChildrenName = toCheck[i].forChildren[k].val;
                            toCheckChildrenValue = toCheckValue[j][toCheckChildrenName];
                            if (toCheckChildrenValue === undefined || toCheckChildrenValue === null) {
                                if (!toCheck[i].forChildren[k].optional) {
                                    this.respondError('For not all values in the array ' + toCheckName + ' is the property ' + toCheckChildrenName + ' defined');
                                    return false;
                                }
                            }
                            else {
                                toCheckChildrenType = toCheck[i].forChildren[k].type;
                                toCheckChildrenTypes = toCheckChildrenType.split('|');
                                typesMatch = false;
                                for (l = 0; l < toCheckChildrenTypes.length; l++) {
                                    if (toCheckChildrenTypes[l] === 'array') {
                                        if (typeof toCheckChildrenValue === 'object' && Array.isArray(toCheckChildrenValue) !== undefined) {
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
                                    this.respondError('For not all values in the array ' + toCheckName + ' is the property ' + toCheckChildrenName + ' of type ' + toCheckChildrenTypes.join(' or '));
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
    CRMFunction.prototype.checkPermissions = function (toCheck, callbackOrOptional, callback) {
        var optional = [];
        if (callbackOrOptional !== undefined && callbackOrOptional !== null && typeof callbackOrOptional === 'object') {
            optional = callbackOrOptional;
        }
        else {
            callback = callbackOrOptional;
        }
        var permitted = true;
        var notPermitted = [];
        var node;
        if (!(node = globalObject.globals.crm.crmById[this.message.id])) {
            this.respondError('The node you are running this script from no longer exist, no CRM API calls are allowed');
            return false;
        }
        if (node.isLocal) {
            callback && callback(optional);
        }
        else {
            var i;
            if (!node.permissions || compareArray(node.permissions, [])) {
                if (toCheck.length > 0) {
                    permitted = false;
                    notPermitted.push(toCheck);
                }
            }
            else {
                for (i = 0; i < toCheck.length; i++) {
                    if (node.permissions.indexOf(toCheck[i]) === -1) {
                        permitted = false;
                        notPermitted.push(toCheck[i]);
                    }
                }
            }
            if (!permitted) {
                this.respondError('Permission' + (notPermitted.length === 1 ? ' ' + notPermitted[0] : 's ' + notPermitted.join(', ')) + ' are not available to this script.');
            }
            else {
                var length = optional.length;
                for (i = 0; i < length; i++) {
                    if (node.permissions.indexOf(optional[i]) === -1) {
                        optional.splice(i, 1);
                        length--;
                        i--;
                    }
                }
                callback && callback(optional);
            }
        }
    };
    function crmHandler(message) {
        // ReSharper disable once ConstructorCallNotUsed
        new CRMFunction(message, message.action);
    }
    //#endregion
    //#region Chrome Function Handling
    function createChromeFnCallbackHandler(message, callbackIndex) {
        return function () {
            var params = [];
            for (var i = 0; i < arguments.length; i++) {
                params[i] = arguments[i];
            }
            respondToCrmAPI(message, 'success', {
                callbackId: callbackIndex,
                params: params
            });
        };
    }
    function createReturnFunction(message, callbackIndex) {
        return function (result) {
            respondToCrmAPI(message, 'success', {
                callbackId: callbackIndex,
                params: [result]
            });
        };
    }
    function sendMessageThroughComm(message) {
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
        for (i = 0; i < instancesArr.length; i++) {
            globalObject.globals.crmValues.tabData[instancesArr[i].id].nodes[message.id].port.postMessage({
                messageType: 'instanceMessage',
                message: args[0]
            });
        }
    }
    function checkForRuntimeMessages(message) {
        var api = message.api.split('.').slice(1);
        if (message.api.split('.')[0] !== 'runtime') {
            return false;
        }
        var i;
        var args = [];
        var fns = [];
        var returns = [];
        switch (api) {
            case 'getBackgroundPage':
                console.warn('The chrome.runtime.getBackgroundPage API should not be used');
                if (!message.args[0] || message.args[0].type !== 'fn') {
                    throwChromeError(message, 'First argument of getBackgroundPage should be a function');
                    return true;
                }
                respondToCrmAPI(message, 'success', {
                    callbackId: message.args[0].val,
                    params: [{}]
                });
                return true;
            case 'openOptionsPage':
                if (message.args[0] && message.args[0].type !== 'fn') {
                    throwChromeError(message, 'First argument of openOptionsPage should be a function');
                    return true;
                }
                chrome.runtime.openOptionsPage(function () {
                    if (message.args[0]) {
                        respondToCrmAPI(message, 'success', {
                            callbackId: message.args[0].val,
                            params: []
                        });
                    }
                });
                return true;
            case 'getManifest':
                if (!message.args[0] || message.args[0].type !== 'return') {
                    throwChromeError(message, 'getManifest should have a function to return to');
                    return true;
                }
                createReturnFunction(message, message.args[0].val)(chrome.runtime.getManifest());
                return true;
            case 'getURL':
                for (i = 0; i < message.args.length; i++) {
                    if (message.args[i].type === 'return') {
                        returns.push(message.args[i].val);
                    }
                    else if (message.args[i].type === 'arg') {
                        args.push(message.args[i].val);
                    }
                    else {
                        throwChromeError(message, 'getURL should not have a function as an argument');
                        return true;
                    }
                }
                if (returns.length === 0 || args.length === 0) {
                    throwChromeError(message, 'getURL should be a return function with at least one argument');
                }
                createReturnFunction(message, returns[0])(chrome.runtime.getURL(args[0]));
                return true;
            case 'connect':
            case 'connectNative':
            case 'setUninstallURL':
            case 'sendNativeMessage':
            case 'requestUpdateCheck':
                throwChromeError(message, 'This API should not be accessed');
                return true;
            case 'reload':
                chrome.runtime.reload();
                return true;
            case 'restart':
                chrome.runtime.restart();
                return true;
            case 'restartAfterDelay':
                for (i = 0; i < message.args.length; i++) {
                    if (message.args[i].type === 'fn') {
                        fns.push(message.args[i].val);
                    }
                    else if (message.args[i].type === 'arg') {
                        args.push(message.args[i].val);
                    }
                    else {
                        throwChromeError(message, 'restartAfterDelay should not have a return as an argument');
                        return true;
                    }
                }
                chrome.runtime.restartAfterDelay(args[0], function () {
                    respondToCrmAPI(message, 'success', {
                        callbackId: fns[0],
                        params: []
                    });
                });
                return true;
            case 'getPlatformInfo':
                if (message.args[0] && message.args[0].type !== 'fn') {
                    throwChromeError(message, 'First argument of getPlatformInfo should be a function');
                    return true;
                }
                chrome.runtime.getPlatformInfo(function (platformInfo) {
                    if (message.args[0]) {
                        respondToCrmAPI(message, 'success', {
                            callbackId: message.args[0].val,
                            params: [platformInfo]
                        });
                    }
                });
                return true;
            case 'getPackageDirectoryEntry':
                if (message.args[0] && message.args[0].type !== 'fn') {
                    throwChromeError(message, 'First argument of getPackageDirectoryEntry should be a function');
                    return true;
                }
                chrome.runtime.getPackageDirectoryEntry(function (directoryInfo) {
                    if (message.args[0]) {
                        respondToCrmAPI(message, 'success', {
                            callbackId: message.args[0].val,
                            params: [directoryInfo]
                        });
                    }
                });
                return true;
        }
        if (api.split('.').length > 1) {
            if (!message.args[0] || message.args[0].type !== 'fn') {
                throwChromeError(message, 'First argument should be a function');
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
                    var params = Array.prototype.slice.apply(arguments);
                    respondToCrmAPI(message, 'success', {
                        callbackId: message.args[0].val,
                        params: params
                    });
                });
                return true;
            }
            else if (listenerTarget === 'onMessage') {
                throwChromeError(message, 'This method of listening to messages is not allowed,' +
                    ' use crmAPI.comm instead');
                return true;
            }
            else {
                throwChromeError(message, 'You are not allowed to listen to given event');
                return true;
            }
        }
        return false;
    }
    function chromeHandler(message) {
        var node = globalObject.globals.crm.crmById[message.id];
        if (!/[a-z|A-Z|0-9]*/.test(message.api)) {
            throwChromeError(message, 'Passed API "' + message.api + '" is not alphanumeric.');
            return false;
        }
        else if (checkForRuntimeMessages(message)) {
            return false;
        }
        else if (message.api === 'runtime.sendMessage') {
            console.warn('The chrome.runtime.sendMessage API is not meant to be used, use ' +
                'crmAPI.comm instead');
            sendMessageThroughComm(message);
            return false;
        }
        var apiPermission = message.requestType || message.api.split('.')[0];
        if (!node.isLocal) {
            var apiFound;
            var chromeFound = (node.permissions.indexOf('chrome') !== -1);
            apiFound = (node.permissions.indexOf(apiPermission) !== -1);
            if (!chromeFound && !apiFound) {
                throwChromeError(message, 'Both permissions chrome and ' + apiPermission + ' not available to this script');
                return false;
            }
            else if (!chromeFound) {
                throwChromeError(message, 'Permission chrome not available to this script');
                return false;
            }
            else if (!apiFound) {
                throwChromeError(message, 'Permission ' + apiPermission + ' not avilable to this script');
                return false;
            }
        }
        if (permissions.indexOf(apiPermission) === -1) {
            throwChromeError(message, 'Permissions ' + apiPermission + ' is not available for use or does not exist.');
            return false;
        }
        if (globalObject.globals.availablePermissions.indexOf(apiPermission) === -1) {
            throwChromeError(message, 'Permissions ' + apiPermission + ' not available to the extension, visit options page');
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
                    params.push(jsonFn.parse(message.args[i].val));
                    break;
                case 'fn':
                    params.push(createChromeFnCallbackHandler(message, message.args[i].val));
                    break;
                case 'return':
                    returnFunctions.push(createReturnFunction(message, message.args[i].val));
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
            throwChromeError(message, e.message, e.stack);
            return false;
        }
        return true;
    }
    //#endregion
    //#region Updating Scripts
    function isNewer(newVersion, oldVersion) {
        var newSplit = newVersion.split('.');
        var oldSplit = oldVersion.split('.');
        var longest = (newSplit.length > oldSplit.length ?
            newSplit.length : oldSplit.length);
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
    }
    function convertTriggerToMatch(trigger) {
        var protocolSplit = trigger.split('://');
        var protocol = protocolSplit[0];
        if (protocol.length > 1) {
            if (protocolSplit[1] === '*') {
                return protocol + '://*/*';
            }
            else {
                var hostSplit = protocolSplit[1].split('/');
                var host = hostSplit[0];
                var hostRegex = /(((\*\.)?)(([^\/\*\s])+))|(\*)/;
                if (hostSplit.length > 1) {
                    var path = hostSplit[1];
                    if (host.match(hostRegex)) {
                        return null;
                    }
                    else {
                        return protocol + '://' + host + '/' + path;
                    }
                }
                else {
                    if (host.match(hostRegex)) {
                        return protocol + '://' + host + '/*';
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        else {
            //Only one protocol part, meaning it's either an asterisk
            //or protocol*
            if (trigger !== '*') {
                var schemes = ['http', 'https', 'file', 'ftp'];
                if (schemes.indexOf(protocol) > -1) {
                    return schemes[schemes.indexOf(protocol)] + '://*/*';
                }
            }
            return '*://*/*';
        }
    }
    function createUserscriptTriggers(metaTags) {
        var i;
        var url;
        var triggers = [];
        var includes = metaTags.includes;
        if (includes) {
            triggers = triggers.concat(includes.map(function (include) {
                return {
                    url: include,
                    not: false
                };
            }).filter(function (include) {
                return !!include.url;
            }));
        }
        var matches = metaTags.match;
        if (matches) {
            triggers = triggers.concat(matches.map(function (match) {
                return {
                    url: match,
                    not: false
                };
            }).filter(function (match) {
                return !!match.url;
            }));
        }
        var excludes = metaTags.exclude;
        if (excludes) {
            triggers = triggers.concat(excludes.map(function (exclude) {
                return {
                    url: exclude,
                    not: false
                };
            }).filter(function (exclude) {
                return !!exclude.url;
            }));
        }
        triggers = triggers.map(function (trigger, index) {
            return triggers.indexOf(trigger) === index;
        });
        return triggers;
    }
    function getlastMetaTagValue(metaTags, key) {
        return metaTags[key] && metaTags[key][metaTags[key].length - 1];
    }
    function createUserscriptTypeData(metaTags, code, node) {
        var launchMode;
        if (getlastMetaTagValue(metaTags, 'CRM_stylesheet')) {
            node.type = 'stylesheet';
            launchMode = getlastMetaTagValue(metaTags, 'CRM_launchMode') || 2;
            launchMode = metaTags.CRM_launchMode = parseInt(launchMode, 10);
            node.value = {
                stylesheet: code,
                defaultOn: (metaTags.CRM_defaultOn = getlastMetaTagValue(metaTags, 'CRM_defaultOn') || false),
                toggle: (metaTags.CRM_toggle = getlastMetaTagValue(metaTags, 'CRM_toggle') || false),
                launchMode: launchMode
            };
        }
        else {
            node.type = 'script';
            //Libraries
            var libs = [];
            if (metaTags.CRM_libraries) {
                metaTags.CRM_libraries.forEach(function (item) {
                    try {
                        libs.push(JSON.stringify(item));
                    }
                    catch (e) { }
                });
            }
            metaTags.CRM_libraries = libs;
            var anonymousLibs;
            anonymousLibs = metaTags.require || [];
            if (metaTags.require) {
                for (i = 0; i < anonymousLibs.length; i++) {
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
                anonymousLibsHandler({
                    type: 'register',
                    name: anonymousLib.url,
                    url: anonymousLib.url,
                    scriptId: node.id
                });
            });
            for (var i = 0; i < anonymousLibs.length; i++) {
                libs.push(anonymousLibs[i].url);
            }
            launchMode = getlastMetaTagValue(metaTags, 'CRM_launchMode') || 0;
            launchMode = metaTags.CRM_launchMode = parseInt(launchMode, 10);
            node.value = {
                script: code,
                launchMode: launchMode,
                libraries: libs
            };
        }
    }
    function applyMetaTags(code, metaTags, node) {
        var metaTagsArr = [];
        var metaValue;
        var tags = metaTags;
        for (var metaKey in tags) {
            if (tags.hasOwnProperty(metaKey)) {
                metaValue = tags[metaKey];
                var value;
                if (metaKey === 'CRM_contentTypes') {
                    value = JSON.stringify(metaValue);
                    metaTagsArr.push('// @' + metaKey + '	' + value);
                }
                else {
                    for (var i = 0; i < metaValue.length; i++) {
                        value = metaValue[i];
                        metaTagsArr.push('// @' + metaKey + '	' + value);
                    }
                }
            }
        }
        var scriptSplit = (node.type === 'script' ? node.value.script : node.value.stylesheet).split('\n');
        var finalMetaTags;
        var beforeMetaTags;
        var metaIndexes = getMetaIndexes(code);
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
    }
    function removeOldNode(id) {
        var children = globalObject.globals.crm.crmById[id].children;
        if (children) {
            for (var i = 0; i < children.length; i++) {
                removeOldNode(children[i].id);
            }
        }
        if (globalObject.globals.background.byId[id]) {
            globalObject.globals.background.byId[id].worker.terminate();
            delete globalObject.globals.background.byId[id];
        }
        var path = globalObject.globals.crm.crmById[id].path;
        delete globalObject.globals.crm.crmById[id];
        delete globalObject.globals.crm.crmByIdSafe[id];
        var contextMenuId = globalObject.globals.crmValues.contextMenuIds[id];
        if (contextMenuId !== undefined && contextMenuId !== null) {
            chrome.contextMenus.remove(contextMenuId, function () {
                chrome.runtime.lastError;
            });
        }
    }
    function registerNode(node, oldPath) {
        //Update it in CRM tree
        if (oldPath !== undefined && oldPath !== null) {
            eval('globalObject.globals.storages.settingsStorage.crm[' + oldPath.join('][') + '] = node');
        }
        else {
            globalObject.globals.storages.settingsStorage.crm.push(node);
        }
    }
    function installUserscript(metaTags, code, downloadURL, allowedPermissions, oldNodeId) {
        var node = {};
        var hasOldNode = false;
        if (oldNodeId !== undefined && oldNodeId !== null) {
            hasOldNode = true;
            node.id = oldNodeId;
        }
        else {
            node.id = generateItemId();
        }
        node.name = (metaTags.name = [getlastMetaTagValue(metaTags, 'name') || 'name'])[0];
        node.triggers = createUserscriptTriggers(metaTags);
        createUserscriptTypeData(metaTags, code, node);
        var updateUrl = getlastMetaTagValue(metaTags, 'updateURL') ||
            getlastMetaTagValue(metaTags, 'downloadURL') || downloadURL;
        //Requested permissions
        var permissions = [];
        if (metaTags.grant) {
            permissions = metaTags.grant;
            permissions = permissions.splice(permissions.indexOf('none'), 1);
            metaTags.grant = permissions;
        }
        //NodeInfo
        node.nodeInfo = {
            version: getlastMetaTagValue(metaTags, 'version') || null,
            source: {
                updateURL: updateUrl || downloadURL,
                url: updateUrl || getlastMetaTagValue(metaTags, 'namespace') || downloadURL,
                author: getlastMetaTagValue(metaTags, 'author') || null
            },
            isRoot: true,
            permissions: permissions,
            lastUpdatedAt: new Date().toLocaleDateString(),
            installDate: new Date().toLocaleDateString()
        };
        if (hasOldNode) {
            node.nodeInfo.installDate = (globalObject.globals.crm.crmById[oldNodeId] &&
                globalObject.globals.crm.crmById[oldNodeId].nodeInfo &&
                globalObject.globals.crm.crmById[oldNodeId].nodeInfo.installDate) || node.nodeInfo.installDate;
        }
        //Content types
        if (getlastMetaTagValue(metaTags, 'CRM_contentTypes')) {
            try {
                node.onContentTypes = JSON.parse(getlastMetaTagValue(metaTags, 'CRM_contentTypes'));
            }
            catch (e) { }
        }
        node.onContentTypes = metaTags.CRM_contentTypes = (node.onContentTypes || [true, true, true, true, true, true]);
        //Allowed permissions
        node.permissions = allowedPermissions || [];
        //Resources
        if (metaTags.resource) {
            //Register resources
            var resources = metaTags.resource;
            resources.forEach(function (resource) {
                var resourceSplit = resource.split(/(\s*)/);
                var resourceName = resourceSplit[0];
                var resourceUrl = resourceSplit[1];
                resourceHandler({
                    type: 'register',
                    name: resourceName,
                    url: resourceUrl,
                    scriptId: node.id
                });
            });
        }
        //Uploading
        applyMetaTags(code, metaTags, node);
        chrome.storage.local.get('requestPermissions', function (keys) {
            chrome.permissions.getAll(function (permissions) {
                var allowedPermissions = permissions.permissions || [];
                var requestPermissions = keys['requestPermissions'] || [];
                requestPermissions = requestPermissions.concat(node.permissions.filter(function (nodePermission) {
                    return allowedPermissions.indexOf(nodePermission) === -1;
                }));
                requestPermissions = requestPermissions.filter(function (nodePermission, index) {
                    return requestPermissions.indexOf(nodePermission) === index;
                });
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
            node = globalObject.globals.constants.templates.getDefaultScriptNode(node);
        }
        else {
            node = globalObject.globals.constants.templates.getDefaultStylesheetNode(node);
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
    }
    function updateCRMNode(node, allowedPermissions, downloadURL, oldNodeId) {
        var hasOldNode = false;
        if (oldNodeId !== undefined && oldNodeId !== null) {
            hasOldNode = true;
        }
        var templates = getTemplates();
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
    }
    function getURL(url) {
        var anchor = document.createElement('a');
        anchor.href = url;
        return anchor;
    }
    function checkNodeForUpdate(node, checking, checkingId, downloadURL, onDone, updatedScripts) {
        if (getURL(downloadURL).hostname === undefined &&
            (node.type === 'script' || node.type === 'stylesheet' ||
                node.type === 'menu')) {
            try {
                convertFileToDataURI('example.com/isUpdated/' +
                    downloadURL.split('/').pop().split('.user.js')[0] +
                    '/' + node.nodeInfo.version, function (dataURI, dataString) {
                    try {
                        var resultParsed = JSON.parse(dataString);
                        if (resultParsed.updated) {
                            if (!compareArray(node.nodeInfo.permissions, resultParsed.metaTags.grant) &&
                                !(resultParsed.metaTags.grant.length === 0 && resultParsed.metaTags.grant[0] === 'none')) {
                                //New permissions were added, notify user
                                chrome.storage.local.get('addedPermissions', function (data) {
                                    var addedPermissions = data['addedPermissions'] || [];
                                    addedPermissions.push({
                                        node: node.id,
                                        permissions: resultParsed.metaTags.grant.filter(function (newPermission) {
                                            return node.nodeInfo.permissions.indexOf(newPermission) === -1;
                                        })
                                    });
                                    chrome.storage.local.set({
                                        addedPermissions: addedPermissions
                                    });
                                    chrome.runtime.openOptionsPage();
                                });
                            }
                            updatedScripts.push(updateCRMNode(resultParsed.node, node.nodeInfo.permissions, downloadURL, node.id));
                        }
                        checking[checkingId] = false;
                        if (checking.filter(function (c) { return c; }).length === 0) {
                            onDone();
                        }
                    }
                    catch (e) {
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
                        convertFileToDataURI(downloadURL, function (dataURI, dataString) {
                            //Get the meta tags
                            try {
                                var metaTags = getMetaTags(dataString);
                                if (isNewer(metaTags['version'][0], node.nodeInfo.version)) {
                                    if (!compareArray(node.nodeInfo.permissions, metaTags['grant']) &&
                                        !(metaTags['grant'].length === 0 && metaTags['grant'][0] === 'none')) {
                                        //New permissions were added, notify user
                                        chrome.storage.local.get('addedPermissions', function (data) {
                                            var addedPermissions = data['addedPermissions'] || [];
                                            addedPermissions.push({
                                                node: node.id,
                                                permissions: metaTags['grant'].filter(function (newPermission) {
                                                    return node.nodeInfo.permissions.indexOf(newPermission) === -1;
                                                })
                                            });
                                            chrome.storage.local.set({
                                                addedPermissions: addedPermissions
                                            });
                                            chrome.runtime.openOptionsPage();
                                        });
                                    }
                                    updatedScripts.push(installUserscript(metaTags, dataString, downloadURL, node.permissions, node.id));
                                }
                                checking[checkingId] = false;
                                if (checking.filter(function (c) { return c; }).length === 0) {
                                    onDone();
                                }
                            }
                            catch (e) {
                                console.log(e);
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
    }
    function updateScripts(callback) {
        var checking = [];
        var updatedScripts = [];
        var oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages.settingsStorage.crm));
        function onDone() {
            var updatedData = updatedScripts.map(function (updatedScript) {
                var oldNode = globalObject.globals.crm.crmById[updatedScript.oldNodeId];
                return {
                    name: updatedScript.node.name,
                    id: updatedScript.node.id,
                    oldVersion: (oldNode && oldNode.nodeInfo && oldNode.nodeInfo.version) || undefined,
                    newVersion: updatedScript.node.nodeInfo.version
                };
            });
            updatedScripts.forEach(function (updatedScript) {
                if (updatedScript.path) {
                    removeOldNode(updatedScript.oldNodeId);
                    registerNode(updatedScript.node, updatedScript.path);
                }
                else {
                    registerNode(updatedScript.node);
                }
            });
            uploadChanges('settings', [{
                    key: 'crm',
                    oldValue: oldTree,
                    newValue: globalObject.globals.storages.settingsStorage.crm
                }]);
            chrome.storage.local.get('updatedScripts', function (storage) {
                var updatedScripts = storage['updatedScripts'] || [];
                updatedScripts = updatedScripts.concat(updatedData);
                chrome.storage.local.set({
                    updatedScripts: updatedScripts
                });
            });
            callback && callback(updatedData);
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
                    checkNodeForUpdate(node, checking, checkingId, downloadURL, onDone, updatedScripts);
                }
            }
        }
    }
    //#endregion
    //#region GM Resources
    function matchesHashes(hashes, data) {
        var lastMatchingHash = null;
        hashes = hashes.reverse();
        for (var i = 0; i < hashes.length; i++) {
            var lowerCase = hashes[i].hash.algorithm.toLowerCase;
            if (globalObject.globals.constants.supportedHashes.indexOf(lowerCase()) !== -1) {
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
    }
    function convertFileToDataURI(url, callback, onError) {
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
    }
    function getUrlData(scriptId, url, callback) {
        //First check if the data has already been fetched
        if (globalObject.globals.storages.urlDataPairs[url]) {
            if (globalObject.globals.storages.urlDataPairs[url].refs.indexOf(scriptId) === -1) {
                globalObject.globals.storages.urlDataPairs[url].refs.push(scriptId);
            }
            callback(globalObject.globals.storages.urlDataPairs[url].dataURI, globalObject.globals.storages.urlDataPairs[url].dataString);
        }
        else {
            convertFileToDataURI(url, function (dataURI, dataString) {
                //Write the data away to the url-data-pairs object
                globalObject.globals.storages.urlDataPairs[url] = {
                    dataURI: dataURI,
                    dataString: dataString,
                    refs: [scriptId]
                };
                callback(dataURI, dataString);
            });
        }
    }
    function getHashes(url) {
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
    }
    function registerResource(name, url, scriptId) {
        var registerHashes = getHashes(url);
        if (window.navigator.onLine) {
            getUrlData(scriptId, url, function (dataURI, dataString) {
                var resources = globalObject.globals.storages.resources;
                resources[scriptId] = resources[scriptId] || {};
                resources[scriptId][name] = {
                    name: name,
                    sourceUrl: url,
                    dataURI: dataURI,
                    matchesHashes: matchesHashes(dataString, registerHashes),
                    crmUrl: 'chrome-extension://' + extensionId + '/resource/' + scriptId + '/' + name
                };
                chrome.storage.local.set({
                    resources: resources,
                    urlDataPairs: globalObject.globals.storages.urlDataPairs
                });
            });
        }
        var resourceKeys = globalObject.globals.storages.resourceKeys;
        for (var i = 0; i < resourceKeys.length; i++) {
            if (resourceKeys[i].name === name && resourceKeys[i].scriptId === scriptId) {
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
    }
    function compareResource(key) {
        var resources = globalObject.globals.storages.resources;
        convertFileToDataURI(key.sourceUrl, function (dataURI, dataString) {
            if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) || resources[key.scriptId][key.name].dataURI !== dataURI) {
                //Data URIs do not match, just update the url ref
                globalObject.globals.storages.urlDataPairs[key.url].dataURI = dataURI;
                globalObject.globals.storages.urlDataPairs[key.url].dataString = dataString;
                chrome.storage.local.set({
                    resources: resources,
                    urlDataPairs: globalObject.globals.storages.urlDataPairs
                });
            }
        });
    }
    function generateUpdateCallback(resourceKey) {
        return function () {
            compareResource(resourceKey);
        };
    }
    function updateResourceValues() {
        for (var i = 0; i < globalObject.globals.storages.resourceKeys.length; i++) {
            setTimeout(generateUpdateCallback(globalObject.globals.storages.resourceKeys[i]), (i * 1000));
        }
    }
    function removeResource(name, scriptId) {
        for (var i = 0; i < globalObject.globals.storages.resourceKeys.length; i++) {
            if (globalObject.globals.storages.resourceKeys[i].name === name && globalObject.globals.storages.resourceKeys[i].scriptId === scriptId) {
                globalObject.globals.storages.resourceKeys.splice(i, 1);
                break;
            }
        }
        var urlDataLink = globalObject.globals.storages.urlDataPairs[globalObject.globals.storages.resources[scriptId][name].sourceUrl];
        if (urlDataLink) {
            urlDataLink.refs.splice(urlDataLink.refs.indexOf(scriptId), 1);
            if (urlDataLink.refs.length === 0) {
                //No more refs, clear it
                delete globalObject.globals.storages.urlDataPairs[globalObject.globals.storages.resources[scriptId][name].sourceUrl];
            }
        }
        if (globalObject.globals.storages.resources && globalObject.globals.storages.resources[scriptId] && globalObject.globals.storages.resources[scriptId][name]) {
            delete globalObject.globals.storages.resources[scriptId][name];
        }
        chrome.storage.local.set({
            resourceKeys: globalObject.globals.storages.resourceKeys,
            resources: globalObject.globals.storages.resources,
            urlDataPairs: globalObject.globals.storages.urlDataPairs
        });
    }
    function checkIfResourcesAreUsed() {
        var resourceNames = [];
        for (var resourceForScript in globalObject.globals.storages.resources) {
            if (globalObject.globals.storages.resources.hasOwnProperty(resourceForScript) && globalObject.globals.storages.resources[resourceForScript]) {
                var scriptResources = globalObject.globals.storages.resources[resourceForScript];
                for (var resourceName in scriptResources) {
                    if (scriptResources.hasOwnProperty(resourceName) && scriptResources[resourceName]) {
                        resourceNames.push(scriptResources[resourceName].name);
                    }
                }
            }
        }
        for (var id in globalObject.globals.crm.crmById) {
            if (globalObject.globals.crm.crmById.hasOwnProperty(id) && globalObject.globals.crm.crmById[id]) {
                if (globalObject.globals.crm.crmById[id].type === 'script') {
                    var i;
                    if (globalObject.globals.crm.crmById[id].value.script) {
                        var resourceObj = {};
                        var metaTags = getMetaTags(globalObject.globals.crm.crmById[id].value.script);
                        var resources = metaTags['resource'];
                        var libs = globalObject.globals.crm.crmById[id].value.libraries;
                        for (i = 0; i < libs.length; i++) {
                            if (libs[i] === null) {
                                resourceObj[libs[i].url] = true;
                            }
                        }
                        for (i = 0; i < resources; i++) {
                            resourceObj[resources[i]] = true;
                        }
                        for (i = 0; i < resourceNames.length; i++) {
                            if (!resourceObj[resourceNames[i]]) {
                                removeResource(resourceNames[i], id);
                            }
                        }
                    }
                }
            }
        }
    }
    function getResourceData(name, scriptId) {
        if (globalObject.globals.storages.resources[scriptId][name] && globalObject.globals.storages.resources[scriptId][name].matchesHashes) {
            return globalObject.globals.storages.urlDataPairs[globalObject.globals.storages.resources[scriptId][name].sourceUrl].dataURI;
        }
        return null;
    }
    function getScriptResources(scriptId) {
        return globalObject.globals.storages.resources[scriptId];
    }
    function getResourcesArrayForScript(scriptId) {
        var resourcesArray = [];
        var scriptResources = getScriptResources(scriptId);
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
    function addResourceWebRequestListener() {
        chrome.webRequest.onBeforeRequest.addListener(function (details) {
            var split = details.url.split('chrome-extension://' + extensionId + '/resource/')[1].split('/');
            var name = split[0];
            var scriptId = split[1];
            return {
                redirectUrl: getResourceData(name, scriptId)
            };
        }, {
            urls: ['chrome-extension://' + extensionId + '/resource/*']
        }, ['blocking']);
    }
    function resourceHandler(message) {
        switch (message.type) {
            case 'register':
                registerResource(message.name, message.url, message.scriptId);
                break;
            case 'remove':
                removeResource(message.name, message.scriptId);
                break;
        }
    }
    function anonymousLibsHandler(message) {
        switch (message.type) {
            case 'register':
                registerResource(message.url, message.url, message.scriptid);
                break;
            case 'remove':
                removeResource(message.url, message.scriptId);
                break;
        }
    }
    //#endregion
    //#region Stylesheet Installation
    function triggerify(url) {
        var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g.exec(url);
        return [
            match[2] || '*',
            '://',
            (match[4] && match[6]) ? match[4] + match[6] : '*',
            match[7] || '/'
        ].join('');
    }
    function extractStylesheetData(data) {
        //Get the @document declaration
        if (data.domains.length === 0 && data.regexps.length === 0 &&
            data.urlPrefixes.length && data.urls.length === 0) {
            return {
                launchMode: 1,
                triggers: [],
                code: data.code
            };
        }
        var triggers = [];
        data.domains.forEach(function (domainRule) {
            triggers.push('*://' + domainRule + '/*');
        });
        data.regexps.forEach(function (regexpRule) {
            var match = /((http|https|file|ftp):\/\/)?(www\.)?((\w+)\.)*((\w+)?|(\w+)?(\/(.*)))?/g.exec(regexpRule);
            triggers.push([
                (match[2] ? (match[2].indexOf('*') > -1 ?
                    '*' : match[2]) : '*'),
                '://',
                ((match[4] && match[6]) ?
                    ((match[4].indexOf('*') > -1 || match[6].indexOf('*') > -1) ?
                        '*' : match[4] + match[6]) : '*'),
                (match[7] ? (match[7].indexOf('*') > -1 ?
                    '*' : match[7]) : '*')
            ].join(''));
        });
        data.urlPrefixes.forEach(function (urlPrefixRule) {
            if (triggerMatchesScheme(urlPrefixRule)) {
                triggers.push(urlPrefixRule + '*');
            }
            else {
                triggers.push(triggerify(urlPrefixRule + '*'));
            }
        });
        data.urls.forEach(function (urlRule) {
            if (triggerMatchesScheme(urlRule)) {
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
    function installStylesheet(data) {
        var stylesheetData = JSON.parse(data.code);
        stylesheetData.sections.forEach(function (section) {
            var sectionData = extractStylesheetData(section);
            var node = globalObject.globals.constants.templates.getDefaultStylesheetNode({
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
                id: generateItemId()
            });
            var crmFn = new CRMFunction({}, 'null');
            crmFn.moveNode(node, {}, null);
        });
    }
    //#endregion
    //#region Message Passing
    function createCallbackMessageHandlerInstance(tabId, id) {
        return function (data) {
            globalObject.globals.sendCallbackMessage(tabId, id, data);
        };
    }
    function respondToInstanceMessageCallback(message, status, data) {
        var msg = {
            type: status,
            callbackId: message.onFinish,
            messageType: 'callback',
            data: data
        };
        try {
            globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id].port.postMessage(msg);
        }
        catch (e) {
            if (e.message === 'Converting circular structure to JSON') {
                respondToInstanceMessageCallback(message, 'error', 'Converting circular structure to JSON, getting a response from this API will not work');
            }
            else {
                throw e;
            }
        }
    }
    function sendInstanceMessage(message) {
        var data = message.data;
        var tabData = globalObject.globals.crmValues.tabData;
        if (globalObject.globals.crmValues.nodeInstances[data.id][data.toInstanceId] && tabData[data.toInstanceId] && tabData[data.toInstanceId].nodes[data.id]) {
            if (globalObject.globals.crmValues.nodeInstances[data.id][data.toInstanceId].hasHandler) {
                tabData[data.toInstanceId].nodes[data.id].port.postMessage({
                    messageType: 'instanceMessage',
                    message: data.message
                });
                respondToInstanceMessageCallback(message, 'success');
            }
            else {
                respondToInstanceMessageCallback(message, 'error', 'no listener exists');
            }
        }
        else {
            respondToInstanceMessageCallback(message, 'error', 'instance no longer exists');
        }
    }
    function sendBackgroundPageMessage(message) {
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
    }
    function changeInstanceHandlerStatus(message) {
        globalObject.globals.crmValues.nodeInstances[message.id][message.tabId].hasHandler = message.data.hasHandler;
    }
    function addNotificationListener(message) {
        var data = message.data;
        globalObject.globals.notificationListeners[data.notificationId] = {
            id: data.id,
            tabId: data.tabId,
            notificationId: data.notificationId,
            onDone: data.onDone,
            onClick: data.onClick
        };
    }
    chrome.notifications.onClicked.addListener(function (notificationId) {
        var notification = globalObject.globals.notificationListeners[notificationId];
        if (notification && notification.onClick !== undefined) {
            globalObject.globals.sendCallbackMessage(notification.tabId, notification.id, {
                err: false,
                args: [notificationId],
                callbackId: notification.onClick
            });
        }
    });
    chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
        var notification = globalObject.globals.notificationListeners[notificationId];
        if (notification && notification.onDone !== undefined) {
            globalObject.globals.sendCallbackMessage(notification.tabId, notification.id, {
                err: false,
                args: [notificationId, byUser],
                callbackId: notification.onClick
            });
        }
        delete globalObject.globals.notificationListeners[notificationId];
    });
    function handleRuntimeMessage(message, messageSender, response) {
        switch (message.type) {
            case 'executeCRMCode':
                executeCRMCode(message.data);
                break;
            case 'getCRMHints':
                getCRMHints(message.data);
                break;
            case 'logCrmAPIValue':
                logHandler(message.data);
                break;
            case 'resource':
                resourceHandler(message.data);
                break;
            case 'anonymousLibrary':
                anonymousLibsHandler(message.data);
                break;
            case 'updateStorage':
                applyChanges(message.data);
                break;
            case 'sendInstanceMessage':
                sendInstanceMessage(message);
                break;
            case 'sendBackgroundpageMessage':
                sendBackgroundPageMessage(message.data);
                break;
            case 'respondToBackgroundMessage':
                respondToInstanceMessageCallback({
                    onFinish: message.data.response,
                    id: message.data.id,
                    tabId: message.data.tabId
                }, 'success', message.data.message);
                break;
            case 'changeInstanceHandlerStatus':
                changeInstanceHandlerStatus(message);
                break;
            case 'addNotificationListener':
                addNotificationListener(message);
                break;
            case 'newTabCreated':
                if (messageSender && response) {
                    executeScriptsForTab(messageSender.tab.id, response);
                }
                break;
            case 'styleInstall':
                installStylesheet(message.data);
                break;
            case 'updateScripts':
                updateScripts(function (updated) {
                    response && response(updated);
                });
                break;
            case 'installUserScript':
                var oldTree = JSON.parse(JSON.stringify(globalObject.globals.storages.settingsStorage.crm));
                var newScript = installUserscript(message.data.metaTags, message.data.script, message.data.downloadURL, message.data.allowedPermissions);
                if (newScript.path) {
                    var nodePath = newScript.path;
                    removeOldNode(newScript.oldNodeId);
                    registerNode(newScript.node, nodePath);
                }
                else {
                    registerNode(newScript.node);
                }
                uploadChanges('settings', [{
                        key: 'crm',
                        oldValue: oldTree,
                        newValue: globalObject.globals.storages.settingsStorage.crm
                    }]);
                break;
        }
    }
    function handleCrmAPIMessage(message) {
        switch (message.type) {
            case 'crm':
                crmHandler(message);
                break;
            case 'chrome':
                chromeHandler(message);
                break;
            default:
                handleRuntimeMessage(message);
                break;
        }
    }
    window.createHandlerFunction = function (port) {
        return function (message, port) {
            var tabNodeData = globalObject.globals.crmValues.tabData[message.tabId].nodes[message.id];
            if (!tabNodeData.port) {
                if (compareArray(tabNodeData.secretKey, message.key)) {
                    delete tabNodeData.secretKey;
                    tabNodeData.port = port;
                    if (!globalObject.globals.crmValues.nodeInstances[message.id]) {
                        globalObject.globals.crmValues.nodeInstances[message.id] = {};
                    }
                    var instance;
                    var instancesArr = [];
                    for (instance in globalObject.globals.crmValues.nodeInstances[message.id]) {
                        if (globalObject.globals.crmValues.nodeInstances[message.id].hasOwnProperty(instance) &&
                            globalObject.globals.crmValues.nodeInstances[message.id][instance]) {
                            try {
                                globalObject.globals.crmValues.tabData[instance].nodes[message.id].port.postMessage({
                                    change: {
                                        type: 'added',
                                        value: message.tabId
                                    },
                                    messageType: 'instancesUpdate'
                                });
                                instancesArr.push(instance);
                            }
                            catch (e) {
                                delete globalObject.globals.crmValues.nodeInstances[message.id][instance];
                            }
                        }
                    }
                    globalObject.globals.crmValues.nodeInstances[message.id][message.tabId] = {
                        hasHandler: false
                    };
                    port.postMessage({
                        data: 'connected',
                        instances: instancesArr
                    });
                }
            }
            else {
                handleCrmAPIMessage(message);
            }
        };
    };
    //#endregion
    //#region Startup
    //#region Uploading First Time or Transfer Data
    function uploadStorageSyncData(data) {
        var settingsJson = JSON.stringify(data);
        //Using chrome.storage.sync
        if (settingsJson.length >= 101400) {
            chrome.storage.local.set({
                useStorageSync: false
            }, function () {
                uploadStorageSyncData(data);
            });
        }
        else {
            //Cut up all data into smaller JSON
            var obj = cutData(settingsJson);
            chrome.storage.sync.set(obj, function () {
                if (chrome.runtime.lastError) {
                    //Switch to local storage
                    console.log('Error on uploading to chrome.storage.sync ', chrome.runtime.lastError);
                    chrome.storage.local.set({
                        useStorageSync: false
                    }, function () {
                        uploadStorageSyncData(data);
                    });
                }
                else {
                    chrome.storage.local.set({
                        settings: null
                    });
                }
            });
        }
    }
    //#endregion
    //#region Handling First Run
    function handleFirstRun() {
        //Local storage
        var defaultLocalStorage = {
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
            CRMOnPage: true,
            editCRMInRM: false,
            hideToolsRibbon: false,
            shrinkTitleRibbon: false,
            libraries: [
                { "location": 'jQuery.js', "name": 'jQuery' },
                { "location": 'mooTools.js', "name": 'mooTools' },
                { "location": 'YUI.js', "name": 'YUI' },
                { "location": 'Angular.js', "name": 'Angular' },
                { "location": "jqlite.js", "name": 'jqlite' }
            ]
        };
        //Save local storage
        chrome.storage.local.set(defaultLocalStorage);
        //Sync storage
        var defaultSyncStorage = {
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
                zoom: 100
            },
            crm: [
                getTemplates().getDefaultLinkNode({
                    id: generateItemId()
                })
            ]
        };
        //Save sync storage
        uploadStorageSyncData(defaultSyncStorage);
        var storageLocal = defaultLocalStorage;
        var storageLocalCopy = JSON.parse(JSON.stringify(defaultLocalStorage));
        return {
            settingsStorage: defaultSyncStorage,
            storageLocalCopy: storageLocalCopy,
            storageLocal: storageLocal
        };
    }
    //#endregion
    //#region Transfer
    var legacyScriptReplace = {
        /**
         * Checks if given value is the property passed, disregarding quotes
         *
         * @param {string} toCheck - The string to compare it to
         * @param {string} prop - The value to be compared
         * @returns {boolean} Returns true if they are equal
         */
        isProperty: function (toCheck, prop) {
            if (toCheck === prop) {
                return true;
            }
            return toCheck.replace(/['|"|`]/g, '') === prop;
        },
        /**
         * Gets the lines where an expression begins and ends
         *
         * @param {Object[]} lines - All lines of the script
         * @param {Object[]} lineSeperators - An object for every line signaling the start and end
         * @param {Number} lineSeperators.start - The index of that line's first character in the
         *		entire script if all new lines were removed
            * @param {Number} lineSeperators.end - The index of that line's last character in the
            *		entire script if all new lines were removed
            * @param {Number} start - The first character's index of the function call whose line to find
            * @param {Number} end  - The last character's index of the function call whose line to find
            * @returns {Object} The line(s) on which the function was called, containing a "from" and
            *		"to" property that indicate the start and end of the line(s). Each "from" or "to"
            *		consists of an "index" and a "line" property signaling the char index and the line num
            */
        getCallLines: function (lines, lineSeperators, start, end) {
            var sep;
            var line = {};
            for (var i = 0; i < lineSeperators.length; i++) {
                sep = lineSeperators[i];
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
        },
        /**
         * Finds the function call expression around the expression whose data was passed
         *
         * @param {Object} data - The data associated with a chrome call
         * @returns {Object} The expression around the expression whose data was passed
         */
        getFunctionCallExpressions: function (data) {
            //Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
            var index = data.parentExpressions.length - 1;
            var expr = data.parentExpressions[index];
            while (expr && expr.type !== 'CallExpression') {
                expr = data.parentExpressions[--index];
            }
            return data.parentExpressions[index];
        },
        /**
         * Gets the chrome API in use by given function call expression
         *
         * @param {Object} expr - The expression whose function call to find
         * @param {Object} data - The data about that call
         * @returns {Object} An object containing the call on the "call"
         *		property and the arguments on the "args" property
            */
        getChromeAPI: function (expr, data) {
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
        },
        /**
         * Gets the position of an index relative to the line instead of relative
         * to the entire script
         *
         * @param {Object[]} lines - All lines of the script
         * @param {Number} line - The line the index is on
         * @param {Number} index - The index relative to the entire script
         * @returns {Number} The index of the char relative to given line
         */
        getLineIndexFromTotalIndex: function (lines, line, index) {
            for (var i = 0; i < line; i++) {
                index -= lines[i].length + 1;
            }
            return index;
        },
        replaceChromeFunction: function (data, expr, callLines) {
            if (data.isReturn && !data.isValidReturn) {
                return;
            }
            var lines = data.persistent.lines;
            //Get chrome API
            var i;
            var chromeAPI = this.getChromeAPI(expr, data);
            var firstLine = data.persistent.lines[callLines.from.line];
            var lineExprStart = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, ((data.returnExpr && data.returnExpr.start) || expr.callee.start));
            var lineExprEnd = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, expr.callee.end);
            var newLine = firstLine.slice(0, lineExprStart) +
                'window.crmAPI.chrome(\'' + chromeAPI.call + '\')' +
                firstLine.slice(lineExprEnd);
            if (newLine[newLine.length - 1] === ';') {
                newLine = newLine.slice(0, newLine.length - 1);
            }
            if (data.isReturn) {
                newLine += '.return(function(' + data.returnName + ') {';
                var usesTabs = true;
                var spacesAmount = 0;
                //Find out if the writer uses tabs or spaces
                for (i = 0; i < data.persistent.lines.length; i++) {
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
                var indent;
                if (usesTabs) {
                    indent = '	';
                }
                else {
                    indent = [];
                    indent[spacesAmount] = ' ';
                    indent = indent.join(' ');
                }
                for (i = callLines.to.line + 1; i < data.persistent.lines.length; i++) {
                    data.persistent.lines[i] = indent + data.persistent.lines[i];
                }
                data.persistent.lines.push('}).send();');
            }
            else {
                newLine += '.send();';
            }
            lines[callLines.from.line] = newLine;
            return;
        },
        callsChromeFunction: function (callee, data, onError) {
            data.parentExpressions.push(callee);
            //Check if the function has any arguments and check those first
            if (callee.arguments && callee.arguments.length > 0) {
                for (var i = 0; i < callee.arguments.length; i++) {
                    if (this.findChromeExpression(callee.arguments[i], this.removeObjLink(data), onError)) {
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
                var isWindowCall = (this.isProperty(callee.object.name, 'window') && this.isProperty(callee.property.name || callee.property.raw, 'chrome'));
                if (isWindowCall || this.isProperty(callee.object.name, 'chrome')) {
                    data.expression = callee;
                    var expr = this.getFunctionCallExpressions(data);
                    var callLines = this.getCallLines(data.persistent.lines, data.persistent.lineSeperators, expr.start, expr.end);
                    if (data.isReturn && !data.isValidReturn) {
                        callLines.from.index = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.from.line, callLines.from.index);
                        callLines.to.index = this.getLineIndexFromTotalIndex(data.persistent.lines, callLines.to.line, callLines.to.index);
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
        },
        removeObjLink: function (data) {
            var parentExpressions = data.parentExpressions || [];
            var newObj = {};
            for (var key in data) {
                if (data.hasOwnProperty(key) && key !== 'parentExpressions' && key !== 'persistent') {
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
        },
        findChromeExpression: function (expression, data, onError) {
            data.parentExpressions = data.parentExpressions || [];
            data.parentExpressions.push(expression);
            var i;
            switch (expression.type) {
                case 'VariableDeclaration':
                    data.isValidReturn = expression.declarations.length === 1;
                    for (i = 0; i < expression.declarations.length; i++) {
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
                        for (i = 0; i < expression.arguments.length; i++) {
                            if (this.findChromeExpression(expression.arguments[i], this.removeObjLink(data), onError)) {
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
                    for (i = 0; i < expression.body.body.length; i++) {
                        if (this.findChromeExpression(expression.body.body[i], this.removeObjLink(data), onError)) {
                            return true;
                        }
                    }
                    break;
                case 'ExpressionStatement':
                    return this.findChromeExpression(expression.expression, data, onError);
                case 'SequenceExpression':
                    data.isReturn = false;
                    var lastExpression = expression.expressions.length - 1;
                    for (i = 0; i < expression.expressions.length; i++) {
                        if (i === lastExpression) {
                            data.isReturn = true;
                        }
                        if (this.findChromeExpression(expression.expressions[i], this.removeObjLink(data), onError)) {
                            return true;
                        }
                    }
                    break;
                case 'UnaryExpression':
                case 'ConditionalExpression':
                    data.isValidReturn = false;
                    data.isReturn = true;
                    if (this.findChromeExpression(expression.consequent, this.removeObjLink(data), onError)) {
                        return true;
                    }
                    if (this.findChromeExpression(expression.alternate, this.removeObjLink(data), onError)) {
                        return true;
                    }
                    break;
                case 'IfStatement':
                    data.isReturn = false;
                    if (this.findChromeExpression(expression.consequent, this.removeObjLink(data), onError)) {
                        return true;
                    }
                    if (expression.alternate && this.findChromeExpression(expression.alternate, this.removeObjLink(data), onError)) {
                        return true;
                    }
                    break;
                case 'LogicalExpression':
                    data.isReturn = true;
                    data.isValidReturn = false;
                    if (this.findChromeExpression(expression.left, this.removeObjLink(data), onError)) {
                        return true;
                    }
                    if (this.findChromeExpression(expression.right, this.removeObjLink(data), onError)) {
                        return true;
                    }
                    break;
                case 'BlockStatement':
                    data.isReturn = false;
                    for (i = 0; i < expression.body.length; i++) {
                        if (this.findChromeExpression(expression.body[i], this.removeObjLink(data), onError)) {
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
        },
        /**
         * Generates an onError function that passes any errors into given container
         *
         * @param {Object[][]} container - A container array that contains arrays of errors for every pass
         *		of the script
            * @returns {function} A function that can be called with the "position" argument signaling the
            *		position of the error in the script and the "passes" argument which signals the amount
            *		of passes the script went through
            */
        generateOnError: function (container) {
            return function (position, passes) {
                if (!container[passes]) {
                    container[passes] = [position];
                }
                else {
                    container[passes].push(position);
                }
            };
        },
        replaceChromeCalls: function (lines, passes, onError) {
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
            var i;
            var index = 0;
            var lineSeperators = [];
            for (i = 0; i < lines.length; i++) {
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
                for (i = 0; i < scriptExpressions.length; i++) {
                    expression = scriptExpressions[i];
                    this.findChromeExpression(expression, { persistent: persistentData }, onError);
                }
                persistentData.diagnostic = false;
            }
            for (i = 0; i < scriptExpressions.length; i++) {
                expression = scriptExpressions[i];
                if (this.findChromeExpression(expression, { persistent: persistentData }, onError)) {
                    script = this.replaceChromeCalls(persistentData.lines.join('\n').split('\n'), passes + 1, onError);
                    break;
                }
            }
            return script;
        },
        /**
         * Removes any duplicate position entries from given array
         *
         * @param {Object[]} arr - An array containing position objects
         * @returns {Object[]} The same array with all duplicates removed
         */
        removePositionDuplicates: function (arr) {
            var jsonArr = [];
            arr.forEach(function (item, index) {
                jsonArr[index] = JSON.stringify(item);
            });
            arr = jsonArr.filter(function (item, pos) {
                return jsonArr.indexOf(item) === pos;
            });
            return arr.map(function (item) {
                return JSON.parse(item);
            });
        },
        convertScriptFromLegacy: function (script, onError) {
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
        }
    };
    function getTemplates() {
        return globalObject.globals.constants.templates;
    }
    function parseOldCRMNode(string, openInNewTab) {
        var node = {};
        var oldNodeSplit = string.split('%123');
        var name = oldNodeSplit[0];
        var type = oldNodeSplit[1].toLowerCase();
        var nodeData = oldNodeSplit[2];
        switch (type) {
            //Stylesheets don't exist yet so don't implement those
            case 'link':
                node = getTemplates().getDefaultLinkNode({
                    name: name,
                    id: generateItemId(),
                    value: [
                        {
                            newTab: openInNewTab,
                            url: nodeData
                        }]
                });
                break;
            case 'divider':
                node = getTemplates().getDefaultDividerNode({
                    name: name,
                    id: generateItemId()
                });
                break;
            case 'menu':
                node = getTemplates().getDefaultMenuNode({
                    name: name,
                    id: generateItemId(),
                    children: nodeData
                });
                break;
            case 'script':
                var scriptSplit = nodeData.split('%124');
                var scriptLaunchMode = scriptSplit[0];
                var scriptData = scriptSplit[1];
                var triggers;
                var launchModeString = scriptLaunchMode + '';
                if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
                    triggers = launchModeString.split('1,')[1].split(',');
                    triggers = triggers.map(function (item) {
                        return {
                            not: false,
                            url: item.trim()
                        };
                    }).filter(function (item) {
                        return item.url !== '';
                    });
                    scriptLaunchMode = 2;
                }
                var id = generateItemId();
                node = getTemplates().getDefaultScriptNode({
                    name: name,
                    id: id,
                    triggers: triggers,
                    value: {
                        launchMode: parseInt(scriptLaunchMode, 10),
                        updateNotice: true,
                        oldScript: scriptData,
                        script: legacyScriptReplace.convertScriptFromLegacy(scriptData, function (oldScriptErrors, newScriptErrors, parseError) {
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
                break;
        }
        return node;
    }
    function assignParents(parent, nodes, startIndex, endIndex) {
        for (var i = startIndex; i < endIndex; i++) {
            var currentIndex = i;
            if (nodes[i].type === 'menu') {
                var start = i + 1;
                //The amount of children it has
                i += parseInt(nodes[i].children, 10);
                var end = i + 1;
                nodes[currentIndex].children = [];
                assignParents(nodes[currentIndex].children, nodes, start, end);
            }
            parent.push(nodes[currentIndex]);
        }
    }
    function transferCRMFromOld(openInNewTab) {
        var amount = parseInt(localStorage.getItem('numberofrows'), 10) + 1;
        var nodes = [];
        for (var i = 1; i < amount; i++) {
            nodes.push(parseOldCRMNode(localStorage.getItem(String(i)), openInNewTab));
        }
        //Structure nodes with children etc
        var crm = [];
        assignParents(crm, nodes, 0, nodes.length);
        return crm;
    }
    function handleTransfer() {
        localStorage.setItem('transferred', 'true');
        return function (resolve) {
            if (!window.CodeMirror.TernServer) {
                //Wait until TernServer is loaded
                window.setTimeout(function () {
                    handleTransfer()(function (data) {
                        resolve(data);
                    });
                }, 200);
            }
            else {
                var result = handleFirstRun();
                result.settingsStorage.crm = transferCRMFromOld(localStorage.getItem('whatpage'));
                resolve({
                    settingsStorage: result.settingsStorage,
                    storageLocalCopy: result.storageLocalCopy,
                    chromeStorageLocal: result.storageLocal
                });
            }
        };
    }
    //#endregion
    function upgradeVersion(oldVersion, newVersion) {
        //No changes yet
    }
    function isFirstTime(storageLocal) {
        var currentVersion = chrome.runtime.getManifest().version;
        if (storageLocal.lastUpdatedAt === currentVersion) {
            return false;
        }
        else {
            if (storageLocal.lastUpdatedAt) {
                upgradeVersion(storageLocal.lastUpdatedAt, currentVersion);
                return false;
            }
            //Determine if it's a transfer from CRM version 1.*
            if (!localStorage.getItem('transferred')) {
                return handleTransfer();
            }
            else {
                var firstRunResult = handleFirstRun();
                return function (resolve) {
                    resolve(firstRunResult);
                };
            }
        }
    }
    function setIfNotSet(obj, key, defaultValue) {
        if (obj[key]) {
            return obj[key];
        }
        chrome.storage.local.set({
            key: defaultValue
        });
        return defaultValue;
    }
    function setStorages(storageLocalCopy, settingsStorage, chromeStorageLocal, callback) {
        globalObject.globals.storages.storageLocal = storageLocalCopy;
        globalObject.globals.storages.settingsStorage = settingsStorage;
        globalObject.globals.storages.globalExcludes = setIfNotSet(chromeStorageLocal, 'globalExcludes', []);
        globalObject.globals.storages.resources = setIfNotSet(chromeStorageLocal, 'resources', []);
        globalObject.globals.storages.nodeStorage = setIfNotSet(chromeStorageLocal, 'nodeStorage', {});
        globalObject.globals.storages.resourceKeys = setIfNotSet(chromeStorageLocal, 'resourceKeys', []);
        globalObject.globals.storages.globalExcludes.map(validatePatternUrl);
        globalObject.globals.storages.urlDataPairs = setIfNotSet(chromeStorageLocal, 'urlDataPairs', {});
        updateCRMValues();
        callback && callback();
    }
    function loadStorages(callback) {
        chrome.storage.sync.get(function (chromeStorageSync) {
            chrome.storage.local.get(function (chromeStorageLocal) {
                var result;
                if ((result = isFirstTime(chromeStorageLocal))) {
                    result(function (data) {
                        setStorages(data.storageLocalCopy, data.settingsStorage, data.chromeStorageLocal, callback);
                    }, function (err) {
                        console.warn(err);
                        throw err;
                    });
                }
                else {
                    var storageLocalCopy = JSON.parse(JSON.stringify(chromeStorageLocal));
                    delete storageLocalCopy.resources;
                    delete storageLocalCopy.nodeStorage;
                    delete storageLocalCopy.urlDataPairs;
                    delete storageLocalCopy.resourceKeys;
                    delete storageLocalCopy.globalExcludes;
                    var indexes;
                    var jsonString;
                    var settingsStorage;
                    var settingsJsonArray;
                    if (chromeStorageLocal['useStorageSync']) {
                        //Parse the data before sending it to the callback
                        indexes = chromeStorageSync['indexes'];
                        if (!indexes) {
                            chrome.storage.local.set({
                                useStorageSync: false
                            });
                            settingsStorage = chromeStorageLocal['settings'];
                        }
                        else {
                            settingsJsonArray = [];
                            indexes.forEach(function (index) {
                                settingsJsonArray.push(chromeStorageSync[index]);
                            });
                            jsonString = settingsJsonArray.join('');
                            settingsStorage = JSON.parse(jsonString);
                        }
                    }
                    else {
                        //Send the "settings" object on the storage.local to the callback
                        if (!chromeStorageLocal['settings']) {
                            chrome.storage.local.set({
                                useStorageSync: true
                            });
                            indexes = chromeStorageSync['indexes'];
                            settingsJsonArray = [];
                            indexes.forEach(function (index) {
                                settingsJsonArray.push(chromeStorageSync[index]);
                            });
                            jsonString = settingsJsonArray.join('');
                            var settings = JSON.parse(jsonString);
                            settingsStorage = settings;
                        }
                        else {
                            delete storageLocalCopy.settings;
                            settingsStorage = chromeStorageLocal['settings'];
                        }
                    }
                    setStorages(storageLocalCopy, settingsStorage, chromeStorageLocal, callback);
                }
            });
        });
    }
    (function () {
        loadStorages(function () {
            try {
                refreshPermissions();
                chrome.runtime.onConnect.addListener(function (port) {
                    port.onMessage.addListener(window.createHandlerFunction(port));
                });
                chrome.runtime.onMessage.addListener(handleRuntimeMessage);
                buildPageCRM(globalObject.globals.storages.settingsStorage);
                createBackgroundPages();
                addResourceWebRequestListener();
                chrome.storage.local.get(function (storageLocal) {
                    globalObject.globals.latestId = storageLocal['latestId'] || 0;
                });
                chrome.storage.onChanged.addListener(function (changes, areaName) {
                    if (areaName === 'local' && changes['latestId']) {
                        var highest = changes['latestId'].newValue > changes['latestId'].oldValue ? changes['latestId'].newValue : changes['latestId'].oldValue;
                        globalObject.globals.latestId = highest;
                    }
                });
                //Checks if all values are still correct
                checkIfResourcesAreUsed();
                updateResourceValues();
                updateScripts();
                window.setInterval(function () {
                    updateScripts();
                }, 6 * 60 * 60 * 1000);
                window.getID = function (name) {
                    name = name.toLocaleLowerCase();
                    var matches = [];
                    for (var id in globalObject.globals.crm.crmById) {
                        if (globalObject.globals.crm.crmById.hasOwnProperty(id)) {
                            var node = globalObject.globals.crm.crmById[id];
                            if (node.type === 'script' && typeof node.name === 'string' && name === node.name.toLocaleLowerCase()) {
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
                    listener(updateTabAndIdLists(true).ids);
                    globalObject.globals.listeners.ids.push(listener);
                };
                window._listenTabs = function (listener) {
                    listener(updateTabAndIdLists(true).tabs);
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
                        for (var i = 0; i < message.value.length; i++) {
                            if (typeof message.value[i] !== 'function' &&
                                typeof message.value[i] !== 'object') {
                                if (filterRegex.test(String(message.value[i]))) {
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
                        messages = globalObject.globals.logging[id].logMessages;
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
                        update: updateLog.bind(filterObj),
                        index: globalObject.globals.listeners.log.length
                    };
                    callback(filterObj);
                    globalObject.globals.listeners.log.push(filterObj);
                    return getLog('all', 'all', '');
                };
                window._getIdCurrentTabs = function (id) {
                    var tabs = [];
                    var tabData = globalObject.globals.crmValues.tabData;
                    for (var tabId in tabData) {
                        if (tabData.hasOwnProperty(tabId)) {
                            if (tabData[tabId].nodes[id] || id === 0) {
                                if (tabId === '0') {
                                    tabs.push('background');
                                }
                                else {
                                    tabs.push(tabId);
                                }
                            }
                        }
                    }
                    return tabs;
                };
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    }());
    //#endregion
}(chrome.runtime.getURL('').split('://')[1].split('/')[0], //Gets the extension's URL through a blocking instead of a callback function
typeof module !== 'undefined' || window.isDev ? window : {}, function (global) {
    function sandboxChromeFunction(fn, context, args, window, global, chrome) {
        return fn.apply(context, args);
    }
    global.sandboxChrome = function (api, args) {
        var context = {};
        var fn = window.chrome;
        var apiSplit = api.split('.');
        for (var i = 0; i < apiSplit.length; i++) {
            context = fn;
            fn = fn[apiSplit[i]];
        }
        var result = sandboxChromeFunction(fn, context, args, null, null, null);
        return result;
    };
    return global;
}(function () {
    var global = {};
    // ReSharper disable once InconsistentNaming
    function SandboxWorker(id, script, libraries, secretKey) {
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
        var handler;
        function postMessage(message) {
            worker.postMessage({
                type: 'message',
                message: JSON.stringify(message),
                key: secretKey.join('') + id + 'verified'
            });
        }
        handler = window.createHandlerFunction({
            postMessage: postMessage
        });
        function verifyKey(message, callback) {
            if (message.key.join('') === secretKey.join('')) {
                callback(JSON.parse(message.data));
            }
            else {
                window.backgroundPageLog(id, null, 'Background page [' + id + ']: ', 'Tried to send an unauthenticated message');
            }
        }
        var verified = false;
        worker.addEventListener('message', function (e) {
            var data = e.data;
            switch (data.type) {
                case 'handshake':
                case 'crmapi':
                    if (!verified) {
                        window.backgroundPageLog(id, null, 'Background page [' + id + ']: ', 'Ininitialized background page');
                        verified = true;
                    }
                    verifyKey(data, handler);
                    break;
                case 'log':
                    window.backgroundPageLog.apply(window, [id, data.lineNumber, 'Background page [' + id + ']: '].concat(JSON.parse(data.data)));
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
            script: script,
            libraries: libraries
        });
    }
    global.sandbox = function (id, script, libraries, secretKey, callback) {
        callback(new SandboxWorker(id, script, libraries, secretKey));
    };
    return global;
}())));
if (typeof module === 'undefined') {
    console.log('If you\'re here to check out your background script,' +
        ' get its ID (you can type getID("name") to find the ID),' +
        ' and type filter(id, [optional tabId]) to show only those messages.' +
        ' You can also visit the logging page for even better logging over at ', chrome.runtime.getURL('logging.html'));
}
