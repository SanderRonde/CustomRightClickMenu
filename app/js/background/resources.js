"use strict";
exports.__esModule = true;
var Resources;
(function (Resources) {
    var Resource;
    (function (Resource) {
        function handle(message) {
            Resources.handle(message, message.name);
        }
        Resource.handle = handle;
    })(Resource = Resources.Resource || (Resources.Resource = {}));
})(Resources = exports.Resources || (exports.Resources = {}));
(function (Resources) {
    var Anonymous;
    (function (Anonymous) {
        function handle(message) {
            Resources.handle(message, message.url);
        }
        Anonymous.handle = handle;
    })(Anonymous = Resources.Anonymous || (Resources.Anonymous = {}));
})(Resources = exports.Resources || (exports.Resources = {}));
(function (Resources) {
    function initModule(_modules) {
        Resources.modules = _modules;
    }
    Resources.initModule = initModule;
    function handle(message, name) {
        switch (message.type) {
            case 'register':
                _registerResource(name, message.url, message.scriptId);
                break;
            case 'remove':
                _removeResource(name, message.scriptId);
                break;
        }
    }
    Resources.handle = handle;
    function updateResourceValues() {
        var resourceKeys = Resources.modules.storages.resourceKeys;
        for (var i = 0; i < resourceKeys.length; i++) {
            setTimeout(_generateUpdateCallback(resourceKeys[i]), (i * 1000));
        }
    }
    Resources.updateResourceValues = updateResourceValues;
    function _getUrlData(scriptId, url, callback) {
        if (Resources.modules.storages.urlDataPairs[url]) {
            if (Resources.modules.storages.urlDataPairs[url].refs.indexOf(scriptId) === -1) {
                Resources.modules.storages.urlDataPairs[url].refs.push(scriptId);
            }
            callback(Resources.modules.storages.urlDataPairs[url].dataURI, Resources.modules.storages.urlDataPairs[url].dataString);
        }
        else {
            Resources.modules.Util.convertFileToDataURI(url, function (dataURI, dataString) {
                Resources.modules.storages.urlDataPairs[url] = {
                    dataURI: dataURI,
                    dataString: dataString,
                    refs: [scriptId]
                };
                callback(dataURI, dataString);
            });
        }
    }
    function _getHashes(url) {
        var hashes = [];
        var hashString = url.split('#')[1];
        if (!hashString) {
            return [];
        }
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
    function _doAlgorithm(name, data, lastMatchingHash) {
        window.crypto.subtle.digest(name, data).then(function (hash) {
            return String.fromCharCode.apply(null, hash) === lastMatchingHash.hash;
        });
    }
    function _algorithmNameToFnName(name) {
        var numIndex = 0;
        for (var i = 0; i < name.length; i++) {
            if (name.charCodeAt(i) >= 48 && name.charCodeAt(i) <= 57) {
                numIndex = i;
                break;
            }
        }
        return name.slice(0, numIndex).toUpperCase() + '-' + name.slice(numIndex);
    }
    function _matchesHashes(hashes, data) {
        if (hashes.length === 0) {
            return true;
        }
        var lastMatchingHash = null;
        hashes = hashes.reverse();
        for (var _i = 0, hashes_1 = hashes; _i < hashes_1.length; _i++) {
            var _a = hashes_1[_i], algorithm = _a.algorithm, hash = _a.hash;
            var lowerCase = algorithm.toLowerCase();
            if (Resources.modules.constants.supportedHashes.indexOf(lowerCase) !== -1) {
                lastMatchingHash = {
                    algorithm: lowerCase,
                    hash: hash
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
            case 'sha384':
            case 'sha512':
                _doAlgorithm(_algorithmNameToFnName(lastMatchingHash.algorithm), arrayBuffer, lastMatchingHash);
                break;
        }
        return false;
    }
    function _registerResource(name, url, scriptId) {
        var registerHashes = _getHashes(url);
        if (window.navigator.onLine) {
            _getUrlData(scriptId, url, function (dataURI, dataString) {
                var resources = Resources.modules.storages.resources;
                resources[scriptId] = resources[scriptId] || {};
                resources[scriptId][name] = {
                    name: name,
                    sourceUrl: url,
                    dataURI: dataURI,
                    dataString: dataString,
                    hashes: registerHashes,
                    matchesHashes: _matchesHashes(registerHashes, dataString),
                    crmUrl: "https://www.localhost.io/resource/" + scriptId + "/" + name
                };
                browserAPI.storage.local.set({
                    resources: resources,
                    urlDataPairs: Resources.modules.storages.urlDataPairs
                });
            });
        }
        var resourceKeys = Resources.modules.storages.resourceKeys;
        for (var _i = 0, resourceKeys_1 = resourceKeys; _i < resourceKeys_1.length; _i++) {
            var resourceKey = resourceKeys_1[_i];
            if (resourceKey.name === name &&
                resourceKey.scriptId === scriptId) {
                return;
            }
        }
        resourceKeys.push({
            name: name,
            sourceUrl: url,
            hashes: registerHashes,
            scriptId: scriptId
        });
        browserAPI.storage.local.set({
            resourceKeys: resourceKeys
        });
    }
    function _removeResource(name, scriptId) {
        for (var i = 0; i < Resources.modules.storages.resourceKeys.length; i++) {
            if (Resources.modules.storages.resourceKeys[i].name === name &&
                Resources.modules.storages.resourceKeys[i].scriptId === scriptId) {
                Resources.modules.storages.resourceKeys.splice(i, 1);
                break;
            }
        }
        if (!Resources.modules.storages.resources[scriptId] ||
            !Resources.modules.storages.resources[scriptId][name] ||
            !Resources.modules.storages.resources[scriptId][name].sourceUrl) {
            return;
        }
        var sourceUrl = Resources.modules.storages.resources[scriptId][name].sourceUrl;
        var urlDataLink = Resources.modules.storages.urlDataPairs[sourceUrl];
        if (urlDataLink) {
            urlDataLink.refs.splice(urlDataLink.refs.indexOf(scriptId), 1);
            if (urlDataLink.refs.length === 0) {
                delete Resources.modules.storages.urlDataPairs[sourceUrl];
            }
        }
        if (Resources.modules.storages.resources &&
            Resources.modules.storages.resources[scriptId] &&
            Resources.modules.storages.resources[scriptId][name]) {
            delete Resources.modules.storages.resources[scriptId][name];
        }
        browserAPI.storage.local.set({
            resourceKeys: Resources.modules.storages.resourceKeys,
            resources: Resources.modules.storages.resources,
            urlDataPairs: Resources.modules.storages.urlDataPairs
        });
    }
    function _compareResource(key) {
        var resources = Resources.modules.storages.resources;
        Resources.modules.Util.convertFileToDataURI(key.sourceUrl, function (dataURI, dataString) {
            if (!(resources[key.scriptId] && resources[key.scriptId][key.name]) ||
                resources[key.scriptId][key.name].dataURI !== dataURI) {
                var resourceData = resources[key.scriptId][key.name];
                if (_matchesHashes(resourceData.hashes, dataString)) {
                    Resources.modules.storages.urlDataPairs[key.sourceUrl].dataURI = dataURI;
                    Resources.modules.storages.urlDataPairs[key.sourceUrl].dataString = dataString;
                    browserAPI.storage.local.set({
                        resources: resources,
                        urlDataPairs: Resources.modules.storages.urlDataPairs
                    });
                }
            }
        });
    }
    function _generateUpdateCallback(resourceKey) {
        return function () {
            window.info('Attempting resource update');
            _compareResource(resourceKey);
        };
    }
})(Resources = exports.Resources || (exports.Resources = {}));
