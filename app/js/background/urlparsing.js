"use strict";
exports.__esModule = true;
var URLParsing;
(function (URLParsing) {
    function initModule(_modules) {
        URLParsing.modules = _modules;
    }
    URLParsing.initModule = initModule;
    function triggerMatchesScheme(trigger) {
        var reg = /(file:\/\/\/.*|(\*|http|https|file|ftp):\/\/(\*\.[^/]+|\*|([^/\*]+.[^/\*]+))(\/(.*))?|(<all_urls>))/;
        return reg.test(trigger);
    }
    URLParsing.triggerMatchesScheme = triggerMatchesScheme;
    function prepareTrigger(trigger) {
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
    }
    URLParsing.prepareTrigger = prepareTrigger;
    function urlMatchesPattern(pattern, url) {
        var urlPattern;
        try {
            urlPattern = _parsePattern(url);
        }
        catch (e) {
            return false;
        }
        if (urlPattern === '<all_urls>') {
            return true;
        }
        var matchPattern = urlPattern;
        return (_matchesScheme(pattern.scheme, matchPattern.scheme) &&
            _matchesHost(pattern.host, matchPattern.host) &&
            _matchesPath(pattern.path, matchPattern.path));
    }
    URLParsing.urlMatchesPattern = urlMatchesPattern;
    function validatePatternUrl(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }
        url = url.trim();
        var pattern = _parsePattern(url);
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
        var schemes = URLParsing.modules.constants.validSchemes;
        var index = schemes.indexOf(matchPattern.scheme);
        if (index === -1) {
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
    }
    URLParsing.validatePatternUrl = validatePatternUrl;
    function matchesUrlSchemes(matchPatterns, url) {
        var matches = false;
        for (var i = 0; i < matchPatterns.length; i++) {
            var not = matchPatterns[i].not;
            var matchPattern = matchPatterns[i].url;
            if (matchPattern.indexOf('/') === 0 &&
                URLParsing.modules.Util.endsWith(matchPattern, '/')) {
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
    }
    URLParsing.matchesUrlSchemes = matchesUrlSchemes;
    function _parsePattern(url) {
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
    }
    function _matchesScheme(scheme1, scheme2) {
        if (scheme1 === '*') {
            return true;
        }
        return scheme1 === scheme2;
    }
    function _matchesHost(host1, host2) {
        if (host1 === '*') {
            return true;
        }
        if (host1[0] === '*') {
            var host1Split = host1.slice(2);
            var index = host2.indexOf(host1Split);
            return index === host2.length - host1Split.length;
        }
        return (host1 === host2);
    }
    function _matchesPath(path1, path2) {
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
})(URLParsing = exports.URLParsing || (exports.URLParsing = {}));
