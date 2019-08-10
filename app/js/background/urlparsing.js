export var URLParsing;
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
            urlPattern = parsePattern(url);
        }
        catch (e) {
            return false;
        }
        if (urlPattern === '<all_urls>') {
            return true;
        }
        var matchPattern = urlPattern;
        return (matchesScheme(pattern.scheme, matchPattern.scheme) &&
            matchesHost(pattern.host, matchPattern.host) &&
            matchesPath(pattern.path, matchPattern.path));
    }
    URLParsing.urlMatchesPattern = urlMatchesPattern;
    function validatePatternUrl(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }
        url = url.trim();
        var pattern = parsePattern(url);
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
        for (var _i = 0, matchPatterns_1 = matchPatterns; _i < matchPatterns_1.length; _i++) {
            var _a = matchPatterns_1[_i], not = _a.not, matchURL = _a.url;
            if (matchURL.indexOf('/') === 0 &&
                URLParsing.modules.Util.endsWith(matchURL, '/')) {
                if (new RegExp(matchURL.slice(1, matchURL.length - 1))
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
                try {
                    var matchPattern = parsePattern(matchURL);
                    if (matchPattern === '<all_urls>') {
                        if (not) {
                            return false;
                        }
                        else {
                            matches = true;
                            continue;
                        }
                    }
                    var urlPattern = parsePattern(url);
                    if (matchPattern.invalid || urlPattern.invalid) {
                        throw new Error('nomatch');
                    }
                    if (matchPattern.scheme !== '*' &&
                        matchPattern.scheme !== urlPattern.scheme) {
                        throw new Error('nomatch');
                    }
                    if (matchPattern.host.split('.').length > 2 ||
                        matchPattern.host.indexOf('*.') === 0) {
                        var host = urlPattern.host;
                        if (host.indexOf('www.') === 0) {
                            host = host.slice(4);
                        }
                        if (matchPattern.host.indexOf('*.') === 0) {
                            matchPattern.host = matchPattern.host.slice(2);
                            host = host.split('.').slice(-2).join('.');
                        }
                        if (matchPattern.host !== '*' &&
                            matchPattern.host !== host) {
                            throw new Error('nomatch');
                        }
                    }
                    else if (matchPattern.host !== '*' &&
                        matchPattern.host !== urlPattern.host.split('.').slice(-2).join('.')) {
                        throw new Error('nomatch');
                    }
                    if (matchPattern.path !== '*' &&
                        !new RegExp("^" + matchPattern.path.replace(/\*/g, '(.*)') + "$")
                            .test(urlPattern.path)) {
                        throw new Error('nomatch');
                    }
                    if (not) {
                        return false;
                    }
                    else {
                        matches = true;
                    }
                }
                catch (e) {
                    if (new RegExp("^" + matchURL.replace(/\*/g, '(.*)') + "$").test(url)) {
                        if (not) {
                            return false;
                        }
                        else {
                            matches = true;
                        }
                    }
                }
            }
        }
        return matches;
    }
    URLParsing.matchesUrlSchemes = matchesUrlSchemes;
    function parsePattern(url) {
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
            return index === host2.length - host1Split.length;
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
})(URLParsing || (URLParsing = {}));
