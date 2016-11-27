//TSC-target=ES5
/// <reference path="../tools/definitions/selenium-webdriver.d.ts" />
/// <reference path="../tools/definitions/chai.d.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />
/// <reference path="../tools/definitions/crm.d.ts" />
"use strict";
var chai = require('chai');
var webdriver = require('selenium-webdriver');
var mochaSteps = require('mocha-steps');
var secrets = require('./UI/secrets');
var btoa = require('btoa');
var assert = chai.assert;
var driver;
var capabilities;
switch (__filename.split('-').pop().split('.')[0]) {
    case '1':
        break;
    default:
        capabilities = {
            'browserName': 'Chrome',
            'browser_version': '26.0',
            'os': 'Windows',
            'os_version': '8',
            'resolution': '1920x1080',
            'browserstack.user': secrets.user,
            'browserstack.key': secrets.key,
            'browserstack.local': true,
            'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
            'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
        };
        capabilities = {
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
        break;
}
before('Driver connect', function (done) {
    this.timeout(60000);
    var result = new webdriver.Builder()
        .usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities)
        .build();
    result.get('http://localhost:1234/test/UI/UITest.html#noClear').then(function () {
        ;
        driver = result;
        done();
    });
});
after('Driver disconnect', function () {
    driver.quit();
});
var sentIds = [];
function getRandomId() {
    var id;
    do {
        id = ~~(Math.random() * 10000);
    } while (sentIds.indexOf(id) > -1);
    sentIds.push(id);
    return id;
}
var templates = {
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
        var defaultNodeInfo = {
            permissions: [],
            source: {}
        };
        return this.mergeObjects(defaultNodeInfo, options);
    },
    getDefaultLinkNode: function (options) {
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
            launchMode: 1 /* ALWAYS_RUN */
        };
        return this.mergeObjects(value, options);
    },
    getDefaultScriptValue: function (options) {
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
            backgroundScript: ''
        };
        return this.mergeObjects(value, options);
    },
    getDefaultScriptNode: function (options) {
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
        var defaultNode = {
            name: 'name',
            type: type,
            nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
            onContentTypes: [true, true, true, false, false, false],
            isLocal: true,
            value: {}
        };
        return this.mergeObjects(defaultNode, options);
    },
    getDefaultDividerNode: function (options) {
        return this.getDefaultDividerOrMenuNode(options, 'divider');
    },
    getDefaultMenuNode: function (options) {
        return this.getDefaultDividerOrMenuNode(options, 'menu');
    }
};
function getSyncSettings(driver) {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.app.settings);
        }))
            .then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function getCRM(driver) {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.app.settings.crm);
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function getContextMenu(driver) {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.chrome._currentContextMenu[0].children);
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function saveDialog(dialog) {
    return dialog
        .findElement(webdriver.By.id('saveButton'))
        .click();
}
function cancelDialog(dialog) {
    return dialog
        .findElement(webdriver.By.id('cancelButton'))
        .click();
}
function getDialog(driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        findElement(driver, webdriver.By.tagName(type + "-edit")).then(function (element) {
            setTimeout(function () {
                resolve(element);
            }, 500);
        });
    });
}
function promisify(data, fn, previousFn, index) {
    return function () {
    };
}
function generatePromiseChain(data, fn, index, resolve) {
    if (index !== data.length) {
        fn(data[index]).then(function () {
            generatePromiseChain(data, fn, index + 1, resolve);
        });
    }
    else {
        resolve(null);
    }
}
function forEachPromise(data, fn) {
    return new webdriver.promise.Promise(function (resolve) {
        generatePromiseChain(data, fn, 0, resolve);
    });
}
function getRandomString(length) {
    return new Array(length).join(' ').split(' ').map(function () {
        var randomNum = ~~(Math.random() * 62);
        if (randomNum <= 10) {
            return String(randomNum);
        }
        else if (randomNum < 36) {
            return String.fromCharCode(randomNum + 87);
        }
        else {
            return String.fromCharCode(randomNum + 29);
        }
    }).join('');
}
function resetSettings(_this, driver, done) {
    _this.timeout(30000);
    var promise = new webdriver.promise.Promise(function (resolve) {
        driver.executeScript(inlineFn(function () {
            window.chrome.storage.local.clear();
            window.chrome.storage.sync.clear();
            return true;
        })).then(function (result) {
            return reloadPage(_this, driver);
        }).then(function () {
            resolve(undefined);
        });
    });
    if (done) {
        promise.then(done);
    }
    else {
        return promise;
    }
}
function reloadPage(_this, driver, done) {
    _this.timeout(60000);
    var promise = new webdriver.promise.Promise(function (resolve) {
        driver
            .get('http://localhost:1234/test/UI/UITest.html#noClear')
            .then(function () {
            var timer = setInterval(function () {
                driver.executeScript(inlineFn(function () {
                    return window.polymerElementsLoaded;
                })).then(function (loaded) {
                    if (loaded) {
                        clearInterval(timer);
                        resolve(undefined);
                    }
                });
            }, 2500);
        });
    });
    if (done) {
        promise.then(done);
    }
    else {
        return promise;
    }
}
function openDialogAndReload(driver, done) {
    reloadPage.apply(this, [function () {
            findElement(driver, webdriver.By.tagName('edit-crm-item')).click().then(function () {
                setTimeout(done, 500);
            });
        }]);
}
function switchToTypeAndOpen(driver, type, done) {
    driver.executeScript(inlineFn(function () {
        var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
        var typeSwitcher = crmItem.querySelector('type-switcher').changeType('REPLACE.type');
        return true;
    }, {
        type: type
    })).then(function () {
        return wait(driver, 100);
    }).then(function () {
        return driver.executeScript(inlineFn(function () {
            document.getElementsByTagName('edit-crm-item').item(0).openEditPage();
        }));
    }).then(function () {
        return wait(driver, 500);
    }).then(function () {
        done();
    });
}
function openDialog(driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        if (type === 'link') {
            findElement(driver, webdriver.By.tagName('edit-crm-item')).click().then(function () {
                setTimeout(resolve, 500);
            });
        }
        else {
            switchToTypeAndOpen(driver, type, resolve);
        }
    });
}
function wait(driver, time, resolveParam) {
    return driver.wait(new webdriver.promise.Promise(function (resolve) {
        setTimeout(function () {
            if (resolveParam) {
                resolve(resolveParam);
            }
            else {
                resolve(null);
            }
        }, time);
    }));
}
var FoundElementPromise = (function () {
    function FoundElementPromise(resolver, opt_flow) {
        this.promise = new webdriver.promise.Promise(resolver);
    }
    FoundElementPromise.prototype.then = function (opt_callback, opt_errback) {
        if (opt_callback) {
            if (opt_errback) {
                return this.promise.then(opt_callback, opt_errback);
            }
            return this.promise.then(opt_callback);
        }
        return this.promise.then();
    };
    FoundElementPromise.prototype.click = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.click().then(function () {
                    resolve(undefined);
                });
            });
        });
    };
    FoundElementPromise.prototype.findElement = function (by) {
        var _this = this;
        return new FoundElementPromise(function (resolve) {
            _this.promise.then(function (element) {
                element.findElement(by).then(function (element) {
                    resolve(element);
                });
            });
        });
    };
    FoundElementPromise.prototype.findElements = function (by) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.findElements(by).then(function (element) {
                    resolve(element);
                });
            });
        });
    };
    FoundElementPromise.prototype.sendKeys = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.sendKeys.apply(element, args).then(function () {
                    resolve(undefined);
                });
            });
        });
    };
    FoundElementPromise.prototype.isDisplayed = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.isDisplayed().then(function (isDisplayed) {
                    resolve(isDisplayed);
                });
            });
        });
    };
    FoundElementPromise.prototype.getAttribute = function (attr) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getAttribute(attr).then(function (value) {
                    resolve(value);
                });
            });
        });
    };
    FoundElementPromise.prototype.getSize = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getSize().then(function (size) {
                    resolve(size);
                });
            });
        });
    };
    FoundElementPromise.all = function (promises) {
        return new webdriver.promise.Promise(function (resolve) {
            var states = promises.map(function (promise, index) {
                promise.then(function (result) {
                    states[index].done = true;
                    states[index].result = result;
                    if (states.filter(function (state) {
                        return !state.done;
                    }).length === 0) {
                        resolve(states.map(function (state) {
                            return state.result;
                        }));
                    }
                });
                return {
                    promise: promise,
                    done: false
                };
            });
        });
    };
    return FoundElementPromise;
}());
var FoundElement = (function () {
    function FoundElement(selector, index, key, driver, parent) {
        if (parent === void 0) { parent = null; }
        this.selector = selector;
        this.index = index;
        this.key = key;
        this.driver = driver;
        this.parent = parent;
    }
    FoundElement.prototype.click = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index, this.key]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index,
                currentElement.key]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var list = JSON.parse('REPLACE.selector');
                var el = document.body;
                for (var i = 0; i < list.length; i++) {
                    el = el.querySelectorAll(list[i][0])[list[i][1]];
                    if (list[i][2] !== 'self') {
                        el = el[list[i][2]];
                    }
                }
                el.click();
            }, {
                selector: JSON.stringify(selectorList.reverse())
            })).then(function () {
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.findElement = function (by) {
        var _this = this;
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index, this.key]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index,
                currentElement.key]);
        }
        return new FoundElementPromise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                function isElement(obj) {
                    return obj && obj.toString && /\[object HTML(\w+)Element\]/.exec(obj.toString());
                }
                var list = JSON.parse('REPLACE.selector');
                var el = document.body;
                for (var i = 0; i < list.length; i++) {
                    el = el.querySelectorAll(list[i][0])[list[i][1]];
                    if (list[i][2] !== 'self') {
                        el = el[list[i][2]];
                    }
                }
                el = el.querySelector('REPLACE.css');
                if (isElement(el)) {
                    return 'self';
                }
                else if (!el) {
                    return typeof el + " - " + el.toString();
                }
                else {
                    var keys = Object.getOwnPropertyNames(el);
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].slice(0, 2) === '__' &&
                            keys[i].slice(-2) === '__' &&
                            isElement(el[keys[i]])) {
                            return keys[i];
                        }
                    }
                    return keys.map(function (key) {
                        return "key: " + key + ", type: " + (el[key] && el[key].toString());
                    });
                }
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            })).then(function (index) {
                console.log('indexes are', index);
                resolve(new FoundElement(css, 0, index, driver, _this));
            });
        });
    };
    FoundElement.prototype.findElements = function (by) {
        var _this = this;
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index, this.key]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index,
                currentElement.key]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                function isElement(obj) {
                    return obj && obj.toString && /\[object HTML(\w+)Element\]/.exec(obj.toString());
                }
                var list = JSON.parse('REPLACE.selector');
                var el = document.body;
                for (var i = 0; i < list.length; i++) {
                    el = el.querySelectorAll(list[i][0])[list[i][1]];
                    if (list[i][2] !== 'self') {
                        el = el[list[i][2]];
                    }
                }
                var elList = el.querySelectorAll('REPLACE.css');
                return JSON.stringify(Array.prototype.slice.apply(elList).map(function (element) {
                    if (isElement(element)) {
                        return 'self';
                    }
                    else {
                        var keys = Object.getOwnPropertyNames(element);
                        for (var i = 0; i < keys.length; i++) {
                            if (keys[i].charAt(0) === '_' &&
                                keys[i].charAt(1) === '_' &&
                                isElement(element[keys[i]])) {
                                return keys[i];
                            }
                        }
                        throw new Error('Could not find element');
                    }
                }));
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            })).then(function (indexes) {
                return new webdriver.promise.Promise(function (resolve) {
                    resolve(JSON.parse(indexes).map(function (key, index) {
                        return new FoundElement(css, index, key, driver, _this);
                    }));
                });
            });
        });
    };
    FoundElement.prototype.isDisplayed = function () {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            var selectorList = [[_this.selector, _this.index, _this.key]];
            var currentElement = _this;
            while (currentElement.parent) {
                currentElement = currentElement.parent;
                selectorList.push([currentElement.selector, currentElement.index,
                    currentElement.key]);
            }
            _this.driver.executeScript(inlineFn(function () {
                //From http://stackoverflow.com/a/18078554/2078892
                var list = JSON.parse('REPLACE.selector');
                var el = document.body;
                for (var i = 0; i < list.length; i++) {
                    el = el.querySelectorAll(list[i][0])[list[i][1]];
                    if (list[i][2] !== 'self') {
                        el = el[list[i][2]];
                    }
                }
                function getOverflowState(element) {
                    var region = element.getBoundingClientRect();
                    var ownerDoc = element.ownerDocument;
                    var htmlElem = ownerDoc.documentElement;
                    var bodyElem = ownerDoc.body;
                    var htmlOverflowStyle = htmlElem.style.overflow || 'auto';
                    var treatAsFixedPosition;
                    function getOverflowParent(e) {
                        var position = e.style.position || 'static';
                        if (position == 'fixed') {
                            treatAsFixedPosition = true;
                            return e == htmlElem ? null : htmlElem;
                        }
                        else {
                            var parent = element.parentElement;
                            while (parent && !canBeOverflowed(parent)) {
                                parent = element.parentElement;
                            }
                            return parent;
                        }
                        function canBeOverflowed(container) {
                            if (container == htmlElem) {
                                return true;
                            }
                            var containerDisplay = (container.style.display || 'inline');
                            if (containerDisplay.indexOf('inline') === 0) {
                                return false;
                            }
                            if (position == 'absolute' &&
                                (container.style.position || 'static') === 'static') {
                                return false;
                            }
                            return true;
                        }
                    }
                    function getOverflowStyles(e) {
                        var overflowElem = e;
                        if (htmlOverflowStyle == 'visible') {
                            if (e == htmlElem && bodyElem) {
                                overflowElem = bodyElem;
                            }
                            else if (e == bodyElem) {
                                return { x: 'visible', y: 'visible' };
                            }
                        }
                        var overflow = {
                            x: overflowElem.style.overflowX || 'auto',
                            y: overflowElem.style.overflowY || 'auto'
                        };
                        if (e == htmlElem) {
                            overflow.x = overflow.x == 'visible' ? 'auto' : overflow.x;
                            overflow.y = overflow.y == 'visible' ? 'auto' : overflow.y;
                        }
                        return overflow;
                    }
                    function getScroll(e) {
                        if (e == htmlElem) {
                            return {
                                x: 0,
                                y: 0
                            };
                        }
                        else {
                            return {
                                x: e.scrollLeft,
                                y: e.scrollTop
                            };
                        }
                    }
                    for (var container = getOverflowParent(element); !!container; container = getOverflowParent(container)) {
                        var containerOverflow = getOverflowStyles(container);
                        if (containerOverflow.x == 'visible' && containerOverflow.y == 'visible') {
                            continue;
                        }
                        var containerRect = container.getBoundingClientRect();
                        if (containerRect.width == 0 || containerRect.height == 0) {
                            return 'hidden';
                        }
                        var underflowsX = region.right < containerRect.left;
                        var underflowsY = region.bottom < containerRect.top;
                        if ((underflowsX && containerOverflow.x == 'hidden') ||
                            (underflowsY && containerOverflow.y == 'hidden')) {
                            return 'hidden';
                        }
                        else if ((underflowsX && containerOverflow.x != 'visible') ||
                            (underflowsY && containerOverflow.y != 'visible')) {
                            var containerScroll = getScroll(container);
                            var unscrollableX = region.right < containerRect.left - containerScroll.x;
                            var unscrollableY = region.bottom < containerRect.top - containerScroll.y;
                            if ((unscrollableX && containerOverflow.x != 'visible') ||
                                (unscrollableY && containerOverflow.x != 'visible')) {
                                return 'hidden';
                            }
                            var containerState = getOverflowState(container);
                            return containerState == 'hidden' ?
                                'hidden' : 'scroll';
                        }
                        var overflowsX = region.left >= containerRect.left + containerRect.width;
                        var overflowsY = region.top >= containerRect.top + containerRect.height;
                        if ((overflowsX && containerOverflow.x == 'hidden') ||
                            (overflowsY && containerOverflow.y == 'hidden')) {
                            return 'hidden';
                        }
                        else if ((overflowsX && containerOverflow.x != 'visible') ||
                            (overflowsY && containerOverflow.y != 'visible')) {
                            if (treatAsFixedPosition) {
                                var docScroll = getScroll(container);
                                if ((region.left >= htmlElem.scrollWidth - docScroll.x) ||
                                    (region.right >= htmlElem.scrollHeight - docScroll.y)) {
                                    return 'hidden';
                                }
                            }
                            var containerState = getOverflowState(container);
                            return containerState == 'hidden' ?
                                'hidden' : 'scroll';
                        }
                    }
                    return 'none';
                }
                function isShown(element) {
                    if (element.tagName === 'OPTION' || element.tagName === 'OPTGROUP') {
                        var optionEl = element;
                        while (optionEl.tagName !== 'SELECT') {
                            if (optionEl.parentElement) {
                                optionEl = optionEl.parentElement;
                            }
                            else {
                                return false;
                            }
                        }
                        return isShown(optionEl);
                    }
                    if (element.tagName === 'INPUT' &&
                        element.getAttribute('hidden') === null) {
                        return false;
                    }
                    if (element.tagName === 'NOSCRIPT') {
                        return false;
                    }
                    if (element.style.visibility == 'hidden') {
                        return false;
                    }
                    function displayed(e) {
                        if (e.style.display == 'none') {
                            return false;
                        }
                        var parent = parent.parentElement;
                        return !parent || displayed(parent);
                    }
                    if (!displayed(element)) {
                        return false;
                    }
                    if (element.style.opacity === '0') {
                        return false;
                    }
                    function isHidden(e) {
                        if (e.hasAttribute) {
                            if (e.hasAttribute('hidden')) {
                                return false;
                            }
                        }
                        else {
                            return true;
                        }
                        var parent = e.parentElement;
                        return !parent || isHidden(parent);
                    }
                    if (!isHidden(element)) {
                        return false;
                    }
                    function positiveSize(e) {
                        var rect = e.getBoundingClientRect();
                        if (rect.height > 0 && rect.width > 0) {
                            return true;
                        }
                        if (document.body.tagName === 'PATH' && (rect.height > 0 || rect.width > 0)) {
                            var strokeWidth = element.style.strokeWidth;
                            return !!strokeWidth && (parseInt(strokeWidth, 10) > 0);
                        }
                        // Zero-sized elements should still be considered to have positive size
                        // if they have a child element or text node with positive size, unless
                        // the element has an 'overflow' style of 'hidden'.
                        return element.style.overflow != 'hidden' &&
                            Array.prototype.slice.apply(e.childNodes).filter(function (n) {
                                var bcr = n.getBoundingClientRect();
                                return n.nodeType == n.TEXT_NODE ||
                                    (bcr.width > 0 && bcr.height > 0);
                            }).length > 0;
                    }
                    if (!positiveSize(element)) {
                        return false;
                    }
                    // Elements that are hidden by overflow are not shown.
                    if (getOverflowState(element) == 'hidden') {
                        return false;
                    }
                }
                return isShown(el);
            }, {
                selector: JSON.stringify(selectorList.reverse())
            })).then(function (isDisplayed) {
                resolve(isDisplayed);
            });
        });
    };
    FoundElement.prototype.sendKeys = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return new webdriver.promise.Promise(function (resolve) {
            return webdriver.promise.all(args.map(function (arg) {
                if (webdriver.promise.isPromise(arg)) {
                    return arg;
                }
                return new webdriver.promise.Promise(function (instantResolve) {
                    instantResolve(arg);
                });
            })).then(function (keys) {
                var selectorList = [[_this.selector, _this.index, _this.key]];
                var currentElement = _this;
                while (currentElement.parent) {
                    currentElement = currentElement.parent;
                    selectorList.push([currentElement.selector, currentElement.index,
                        currentElement.key]);
                }
                return new webdriver.promise.Promise(function (sentKeysResolve) {
                    _this.driver.executeScript(inlineFn(function () {
                        function isElement(obj) {
                            return obj && obj.toString && /\[object HTML(\w+)Element\]/.exec(obj.toString());
                        }
                        var list = REPLACE.selector;
                        var el = document.body;
                        for (var i = 0; i < list.length; i++) {
                            el = el.querySelectorAll(list[i][0])[list[i][1]];
                            if (list[i][2] !== 'self') {
                                el = el[list[i][2]];
                            }
                        }
                        var keyPresses = REPLACE.keypresses;
                        var currentValue = el.value;
                        for (var i = 0; i < keyPresses.length; i++) {
                            switch (keyPresses[i]) {
                                case 0 /* CLEAR_ALL */:
                                    currentValue = '';
                                    break;
                                case 1 /* BACK_SPACE */:
                                    currentValue = currentValue.slice(0, -1);
                                    break;
                                default:
                                    currentValue += keyPresses[i];
                                    break;
                            }
                        }
                        el.value = currentValue;
                    }, {
                        selector: JSON.stringify(selectorList.reverse()),
                        keypresses: JSON.stringify(keys)
                    })).then(function () {
                        sentKeysResolve(undefined);
                    });
                });
            }).then(function () {
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.getAttribute = function (attr) {
        var _this = this;
        var selectorList = [[this.selector, this.index, this.key]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index,
                currentElement.key]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var list = JSON.parse('REPLACE.selector');
                var el = document.body;
                for (var i = 0; i < list.length; i++) {
                    el = el.querySelectorAll(list[i][0])[list[i][1]];
                    if (list[i][2] !== 'self') {
                        el = el[list[i][2]];
                    }
                }
                var attr = el.getAttribute('REPLACE.attr');
                return attr === undefined || attr === null ?
                    el['REPLACE.attr'] : attr;
            }, {
                selector: JSON.stringify(selectorList.reverse()),
                attr: attr
            })).then(function (value) {
                resolve(value);
            });
        });
    };
    FoundElement.prototype.getSize = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index, this.key]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index,
                currentElement.key]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var list = JSON.parse('REPLACE.selector');
                var el = document.body;
                for (var i = 0; i < list.length; i++) {
                    el = el.querySelectorAll(list[i][0])[list[i][1]];
                    if (list[i][2] !== 'self') {
                        el = el[list[i][2]];
                    }
                }
                var bcr = el.getBoundingClientRect();
                return JSON.stringify({
                    bottom: bcr.bottom,
                    height: bcr.height,
                    left: bcr.left,
                    right: bcr.right,
                    top: bcr.top,
                    width: bcr.width
                });
            }, {
                selector: JSON.stringify(selectorList.reverse())
            })).then(function (bcr) {
                resolve(JSON.parse(bcr));
            });
        });
    };
    return FoundElement;
}());
function locatorToCss(by) {
    switch (by.using) {
        case 'className':
            return "." + by.value;
        case 'css selector':
            return by.value;
        case 'id':
            return "#" + by.value;
        case 'linkText':
            return "*[href=" + by.value + "]";
        case 'name':
            return "*[name=\"" + by.value + "\"]";
        case 'tagName':
            return by.value;
        default:
        case 'js':
        case 'xpath':
        case 'partialLinkText':
            throw new Error('Not implemented');
    }
}
function findElement(driver, by) {
    var selector = locatorToCss(by);
    return new FoundElementPromise(function (resolve) {
        driver.executeScript(inlineFn(function () {
            function isElement(obj) {
                return obj && obj.toString && /\[object HTML(\w+)Element\]/.exec(obj.toString());
            }
            var elContainer = document.querySelector('REPLACE.css');
            if (isElement(elContainer)) {
                return 'self';
            }
            else if (!elContainer) {
                return typeof elContainer + " - " + elContainer.toString();
            }
            else {
                var keys = Object.getOwnPropertyNames(elContainer);
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].slice(0, 2) === '__' &&
                        keys[i].slice(-2) === '__' &&
                        isElement(elContainer[keys[i]])) {
                        return keys[i];
                    }
                }
                return keys.map(function (key) {
                    return "key: " + key + ", type: " + (elContainer[key] && elContainer[key].toString());
                });
            }
        }, {
            css: selector
        })).then(function (index) {
            resolve(new FoundElement(selector, 0, index, driver));
        });
    });
}
function findElements(driver, by) {
    var selector = locatorToCss(by);
    return driver.executeScript(inlineFn(function () {
        function isElement(obj) {
            return obj && obj.toString && /\[object HTML(\w+)Element\]/.exec(obj.toString());
        }
        var elList = document.querySelectorAll('REPLACE.css');
        return JSON.stringify(Array.prototype.slice.apply(elList).map(function (element) {
            if (isElement(element)) {
                return 'self';
            }
            else {
                var keys = Object.getOwnPropertyNames(element);
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].charAt(0) === '_' &&
                        keys[i].charAt(1) === '_' &&
                        isElement(element[keys[i]])) {
                        return keys[i];
                    }
                }
                throw new Error('Could not find element');
            }
        }));
    }, {
        css: selector
    })).then(function (indexes) {
        return new webdriver.promise.Promise(function (resolve) {
            resolve(JSON.parse(indexes).map(function (key, index) {
                return new FoundElement(selector, index, key, driver);
            }));
        });
    });
}
function inlineFn(fn, args) {
    if (args === void 0) { args = {}; }
    var str = "return (" + fn.toString() + ")(arguments)";
    Object.getOwnPropertyNames(args).forEach(function (key) {
        if (typeof args[key] === 'string' && args[key].split('\n').length > 1) {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), "' + " + JSON.stringify(args[key].split('\n')) + ".join('\\n') + '");
        }
        else {
            var arg = args[key];
            str = str.replace(new RegExp("REPLACE." + key, 'g'), arg !== undefined &&
                arg !== null && typeof arg === 'string' ?
                arg.replace(/\\\"/g, "\\\\\"") : arg);
        }
    });
    return str;
}
function getTypeName(index) {
    switch (index) {
        case 0:
            return 'page';
        case 1:
            return 'link';
        case 2:
            return 'selection';
        case 3:
            return 'image';
        case 4:
            return 'video';
        case 5:
            return 'audio';
    }
}
function prepareTrigger(url) {
    if (url === '<all_urls>') {
        return url;
    }
    if (url.replace(/\s/g, '') === '') {
        return null;
    }
    var newTrigger;
    if (url.split('//')[1].indexOf('/') === -1) {
        newTrigger = url + '/';
    }
    else {
        newTrigger = url;
    }
    return newTrigger;
}
function sanitizeUrl(url) {
    if (url.indexOf('://') === -1) {
        url = "http://" + url;
    }
    return url;
}
function getCRMNames(crm) {
    return crm.map(function (node) {
        return {
            name: node.name,
            children: (node.children && node.children.length > 0)
                ? getCRMNames(node.children) : undefined
        };
    });
}
function getContextMenuNames(contextMenu) {
    return contextMenu.map(function (item) {
        return {
            name: item.currentProperties.title,
            children: (item.children && item.children.length > 0)
                ? getContextMenuNames(item.children) : undefined
        };
    });
}
describe('Page', function () {
    describe('Loading', function () {
        this.timeout(5000);
        this.slow(2000);
        it('should happen without errors', function (done) {
            driver
                .executeScript(inlineFn(function () {
                return window.lastError ? window.lastError : 'noError';
            })).then(function (result) {
                assert.ifError(result !== 'noError' ? result : false, 'no errors should be thrown when loading');
                done();
            });
        });
    });
    describe('CheckboxOptions', function () {
        var _this = this;
        this.timeout(60000);
        this.slow(10000);
        var checkboxDefaults = {
            showOptions: true,
            recoverUnsavedData: false,
            CRMOnPage: true,
            useStorageSync: true
        };
        //This is disabled for any chrome <= 34 versions
        if (capabilities.browser_version && ~~capabilities.browser_version.split('.')[0] <= 34) {
            delete checkboxDefaults.CRMOnPage;
        }
        Object.getOwnPropertyNames(checkboxDefaults).forEach(function (checkboxId, index) {
            it(checkboxId + " should be clickable", function (done) {
                reloadPage(_this, driver).then(function () {
                    findElement(driver, webdriver.By.css("#" + checkboxId + " paper-checkbox"))
                        .then(function (element) {
                        return element.click();
                    }).then(function () {
                        return driver.executeScript(inlineFn(function () {
                            return JSON.stringify({
                                match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
                                checked: document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox').checked
                            });
                        }, {
                            checkboxId: checkboxId,
                            expected: !checkboxDefaults[checkboxId]
                        }));
                    }).then(function (result) {
                        var resultObj = JSON.parse(result);
                        assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId], 'checkbox checked status matches expected');
                        assert.strictEqual(resultObj.match, true, "checkbox " + checkboxId + " value reflects settings value");
                        done();
                    });
                });
            });
            it(checkboxId + " should be saved", function (done) {
                reloadPage(this, driver).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify({
                            match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
                            checked: document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox').checked
                        });
                    }, {
                        checkboxId: checkboxId,
                        expected: !checkboxDefaults[checkboxId]
                    }));
                })
                    .then(function (result) {
                    var resultObj = JSON.parse(result);
                    assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId], 'checkbox checked status has been saved');
                    assert.strictEqual(resultObj.match, true, "checkbox " + checkboxId + " value has been saved");
                    done();
                });
            });
        });
    });
    describe('Commonly used links', function () {
        this.timeout(60000);
        this.slow(30000);
        var searchEngineLink = '';
        var defaultLinkName = '';
        before('Reset settings', function (done) {
            resetSettings(this, driver).then(function () {
                done();
            });
        });
        it('should be addable', function (done) {
            this.timeout(10000);
            findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                    elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM(driver).then(function (crm) {
                                searchEngineLink = link;
                                defaultLinkName = name;
                                var element = crm[crm.length - 1];
                                assert.strictEqual(name, element.name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is array');
                                assert.lengthOf(element.value, 1, 'element has one child');
                                assert.isDefined(element.value[0], 'first element is defined');
                                assert.isObject(element.value[0], 'first element is an object');
                                assert.strictEqual(element.value[0].url, link, 'value url is the same as expected');
                                assert.isTrue(element.value[0].newTab, 'newTab is true');
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be renamable', function (done) {
            var name = 'SomeName';
            findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                elements[0].findElement(webdriver.By.tagName('paper-button')).then(function (button) {
                    elements[0].findElement(webdriver.By.tagName('input')).sendKeys(0 /* CLEAR_ALL */, name).then(function () {
                        return button.click();
                    }).then(function () {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM(driver).then(function (crm) {
                                var element = crm[crm.length - 1];
                                assert.strictEqual(name, element.name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'link', 'type of element is link');
                                assert.isArray(element.value, 'element value is array');
                                assert.lengthOf(element.value, 1, 'element has one child');
                                assert.isDefined(element.value[0], 'first element is defined');
                                assert.isObject(element.value[0], 'first element is an object');
                                assert.strictEqual(element.value[0].url, link, 'value url is the same as expected');
                                assert.isTrue(element.value[0].newTab, 'newTab is true');
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be saved', function (done) {
            reloadPage(this, driver).then(function () {
                return getCRM(driver);
            })
                .then(function (crm) {
                var element = crm[crm.length - 2];
                assert.isDefined(element, 'element is defined');
                assert.strictEqual(element.name, defaultLinkName, 'name is the same as expected');
                assert.strictEqual(element.type, 'link', 'type of element is link');
                assert.isArray(element.value, 'element value is array');
                assert.lengthOf(element.value, 1, 'element has one child');
                assert.isDefined(element.value[0], 'first element is defined');
                assert.isObject(element.value[0], 'first element is an object');
                assert.strictEqual(element.value[0].url, searchEngineLink, 'value url is the same as expected');
                assert.isTrue(element.value[0].newTab, 'newTab is true');
                var element2 = crm[crm.length - 1];
                assert.isDefined(element2, 'element is defined');
                assert.strictEqual(element2.name, 'SomeName', 'name is the same as expected');
                assert.strictEqual(element2.type, 'link', 'type of element is link');
                assert.isArray(element2.value, 'element value is array');
                assert.lengthOf(element2.value, 1, 'element has one child');
                assert.isDefined(element2.value[0], 'first element is defined');
                assert.isObject(element2.value[0], 'first element is an object');
                assert.strictEqual(element2.value[0].url, searchEngineLink, 'value url is the same as expected');
                assert.isTrue(element2.value[0].newTab, 'newTab is true');
                done();
            });
        });
    });
    describe('SearchEngines', function () {
        this.timeout(60000);
        this.slow(30000);
        var searchEngineLink = '';
        var searchEngineName = '';
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        it('should be addable', function (done) {
            findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                var index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                    elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM(driver).then(function (crm) {
                                var element = crm[crm.length - 1];
                                searchEngineLink = link;
                                searchEngineName = name;
                                assert.strictEqual(element.name, name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'script', 'type of element is script');
                                assert.isObject(element.value, 'element value is object');
                                assert.property(element.value, 'script', 'value has script property');
                                assert.isString(element.value.script, 'script is a string');
                                assert.strictEqual(element.value.script, '' +
                                    'var query;\n' +
                                    'var url = "' + link + '";\n' +
                                    'if (crmAPI.getSelection()) {\n' +
                                    '	query = crmAPI.getSelection();\n' +
                                    '} else {\n' +
                                    '	query = window.prompt(\'Please enter a search query\');\n' +
                                    '}\n' +
                                    'if (query) {\n' +
                                    '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                    '}\n', 'script value matches expected');
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be renamable', function (done) {
            var name = 'SomeName';
            findElements(driver, webdriver.By.tagName('default-link')).then(function (elements) {
                var index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).then(function (button) {
                    elements[index].findElement(webdriver.By.tagName('input')).sendKeys(0 /* CLEAR_ALL */, name).then(function () {
                        return button.click();
                    }).then(function () {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM(driver).then(function (crm) {
                                var element = crm[crm.length - 1];
                                assert.strictEqual(element.name, name, 'name is the same as expected');
                                assert.strictEqual(element.type, 'script', 'type of element is script');
                                assert.isObject(element.value, 'element value is object');
                                assert.property(element.value, 'script', 'value has script property');
                                assert.isString(element.value.script, 'script is a string');
                                assert.strictEqual(element.value.script, '' +
                                    'var query;\n' +
                                    'var url = "' + link + '";\n' +
                                    'if (crmAPI.getSelection()) {\n' +
                                    '	query = crmAPI.getSelection();\n' +
                                    '} else {\n' +
                                    '	query = window.prompt(\'Please enter a search query\');\n' +
                                    '}\n' +
                                    'if (query) {\n' +
                                    '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                    '}\n', 'script value matches expected');
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be saved on page reload', function (done) {
            reloadPage(this, driver).then(function () {
                return getCRM(driver);
            })
                .then(function (crm) {
                var element1 = crm[crm.length - 2];
                assert.isDefined(element1, 'element is defined');
                assert.strictEqual(element1.name, searchEngineName, 'name is the same as expected');
                assert.strictEqual(element1.type, 'script', 'type of element is script');
                assert.isObject(element1.value, 'element value is object');
                assert.property(element1.value, 'script', 'value has script property');
                assert.isString(element1.value.script, 'script is a string');
                assert.strictEqual(element1.value.script, '' +
                    'var query;\n' +
                    'var url = "' + searchEngineLink + '";\n' +
                    'if (crmAPI.getSelection()) {\n' +
                    '	query = crmAPI.getSelection();\n' +
                    '} else {\n' +
                    '	query = window.prompt(\'Please enter a search query\');\n' +
                    '}\n' +
                    'if (query) {\n' +
                    '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                    '}\n', 'script value matches expected');
                var element2 = crm[crm.length - 1];
                assert.strictEqual(element2.name, 'SomeName', 'name is the same as expected');
                assert.strictEqual(element2.type, 'script', 'type of element is script');
                assert.isObject(element2.value, 'element value is object');
                assert.property(element2.value, 'script', 'value has script property');
                assert.isString(element2.value.script, 'script is a string');
                assert.strictEqual(element2.value.script, '' +
                    'var query;\n' +
                    'var url = "' + searchEngineLink + '";\n' +
                    'if (crmAPI.getSelection()) {\n' +
                    '	query = crmAPI.getSelection();\n' +
                    '} else {\n' +
                    '	query = window.prompt(\'Please enter a search query\');\n' +
                    '}\n' +
                    'if (query) {\n' +
                    '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                    '}\n', 'script value matches expected');
                done();
            });
        });
    });
    describe('URIScheme', function () {
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        this.timeout(60000);
        function testURIScheme(driver, done, toExecutePath, schemeName) {
            findElement(driver, webdriver.By.className('URISchemeGenerator'))
                .findElement(webdriver.By.tagName('paper-button'))
                .click()
                .then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._lastCall);
                }));
            })
                .then(function (jsonStr) {
                var lastCall = JSON.parse(jsonStr);
                assert.isDefined(lastCall, 'a call to the chrome API was made');
                assert.strictEqual(lastCall.api, 'downloads.download', 'chrome downloads API was called');
                assert.isArray(lastCall.args, 'api args are present');
                assert.lengthOf(lastCall.args, 1, 'api has only one arg');
                assert.strictEqual(lastCall.args[0].url, 'data:text/plain;charset=utf-8;base64,' + btoa([
                    'Windows Registry Editor Version 5.00',
                    '',
                    '[HKEY_CLASSES_ROOT\\' + schemeName + ']',
                    '@="URL:' + schemeName + ' Protocol"',
                    '"URL Protocol"=""',
                    '',
                    '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
                    '',
                    '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
                    '',
                    '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
                    '@="\\"' + toExecutePath.replace(/\\/g, '\\\\') + '\\""'
                ].join('\n')), 'file content matches expected');
                assert.strictEqual(lastCall.args[0].filename, schemeName + '.reg', 'filename matches expected');
                done();
            });
        }
        this.slow(7000);
        this.timeout(50000);
        afterEach('Reset page settings', function () {
            return resetSettings(this, driver);
        });
        var defaultToExecutePath = 'C:\\files\\my_file.exe';
        var defaultSchemeName = 'myscheme';
        it('should be able to download the default file', function (done) {
            var toExecutePath = defaultToExecutePath;
            var schemeName = defaultSchemeName;
            testURIScheme(driver, done, toExecutePath, schemeName);
        });
        it('should be able to download when a different file path was entered', function (done) {
            var toExecutePath = 'somefile.x.y.z';
            var schemeName = defaultSchemeName;
            findElement(driver, webdriver.By.id('URISchemeFilePath'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(0 /* CLEAR_ALL */, toExecutePath)
                .then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
        it('should be able to download when a different scheme name was entered', function (done) {
            var toExecutePath = defaultToExecutePath;
            var schemeName = getRandomString(25);
            findElement(driver, webdriver.By.id('URISchemeSchemeName'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(0 /* CLEAR_ALL */, schemeName)
                .then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
        it('should be able to download when a different scheme name and a different file path are entered', function (done) {
            var toExecutePath = 'somefile.x.y.z';
            var schemeName = getRandomString(25);
            findElement(driver, webdriver.By.id('URISchemeFilePath'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(0 /* CLEAR_ALL */, toExecutePath)
                .then(function () {
                return findElement(driver, webdriver.By.id('URISchemeSchemeName'))
                    .findElement(webdriver.By.tagName('input'));
            })
                .then(function (element) {
                return element.sendKeys(0 /* CLEAR_ALL */, schemeName);
            })
                .then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
    });
    function testNameInput(type) {
        var defaultName = 'name';
        describe('Name Input', function () {
            this.timeout(60000);
            this.slow(20000);
            after('Reset settings', function () {
                return resetSettings(this, driver);
            });
            it('should not change when not saved', function (done) {
                this.slow(12000);
                before('Reset settings', function () {
                    return resetSettings(this, driver);
                });
                var name = getRandomString(25);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(0 /* CLEAR_ALL */, name)
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.strictEqual(crm[0].type, type, "type is " + type);
                        assert.strictEqual(crm[0].name, defaultName, 'name has not been saved');
                        done();
                    });
                });
            });
            var name = getRandomString(25);
            it('should be editable when saved', function (done) {
                this.slow(12000);
                before('Reset settings', function () {
                    return resetSettings(this, driver);
                });
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(0 /* CLEAR_ALL */, name)
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    })
                        .then(function (crm) {
                        assert.strictEqual(crm[0].type, type, 'type is link');
                        assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                        done();
                    });
                });
            });
            it('should be saved when changed', function (done) {
                reloadPage(this, driver)
                    .then(function () {
                    return getCRM(driver);
                })
                    .then(function (crm) {
                    assert.strictEqual(crm[0].type, type, "type is " + type);
                    assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                    done();
                });
            });
        });
    }
    function testVisibilityTriggers(type) {
        describe('Triggers', function () {
            var _this = this;
            this.timeout(60000);
            this.slow(15000);
            after('Reset settings', function () {
                return resetSettings(this, driver);
            });
            it('should not change when not saved', function (done) {
                resetSettings(this, driver).then(function () {
                    console.log(1);
                    return openDialog(driver, type);
                }).then(function () {
                    console.log(2);
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    console.log(3);
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        console.log(4);
                        return dialog
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            console.log(5);
                            return button.click().then(function () {
                                console.log(6);
                                return button.click();
                            });
                        });
                    }).then(function () {
                        console.log(7);
                        setTimeout(function () {
                            console.log(8);
                            dialog
                                .findElements(webdriver.By.className('executionTrigger'))
                                .then(function (triggers) {
                                console.log(9);
                                return triggers[0]
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click()
                                    .then(function () {
                                    console.log(10);
                                    return triggers[0]
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0 /* CLEAR_ALL */, 'www.google.com');
                                })
                                    .then(function () {
                                    console.log(11);
                                    return triggers[1]
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0 /* CLEAR_ALL */, 'www.google.com');
                                });
                            }).then(function () {
                                console.log(12);
                                return cancelDialog(dialog);
                            }).then(function () {
                                console.log(13);
                                return getCRM(driver);
                            }).then(function (crm) {
                                console.log(14);
                                assert.lengthOf(crm[0].triggers, 1, 'no triggers have been added');
                                assert.isFalse(crm[0].triggers[0].not, 'first trigger NOT status did not change');
                                assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                done();
                            });
                        }, 500);
                    });
                });
            });
            it('should be addable/editable when saved', function (done) {
                resetSettings(_this, driver).then(function () {
                    console.log(1);
                    return openDialog(driver, type);
                }).then(function () {
                    console.log(2);
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    console.log(3);
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        console.log(4);
                        return dialog
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            console.log(5);
                            return button.click().then(function () {
                                console.log(6);
                                return button.click();
                            });
                        });
                    }).then(function () {
                        console.log(7);
                        setTimeout(function () {
                            console.log(8);
                            dialog
                                .findElements(webdriver.By.className('executionTrigger'))
                                .then(function (triggers) {
                                console.log(9);
                                return triggers[0]
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click()
                                    .then(function () {
                                    console.log(10);
                                    return triggers[1]
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0 /* CLEAR_ALL */, 'www.google.com');
                                });
                            }).then(function () {
                                console.log(11);
                                return saveDialog(dialog);
                            }).then(function () {
                                console.log(12);
                                return getCRM(driver);
                            }).then(function (crm) {
                                console.log(13);
                                assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                                done();
                            });
                        }, 500);
                    });
                });
            });
            it('should be preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                    assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                    assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                    assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                    assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                    done();
                });
            });
        });
    }
    function testContentTypes(type) {
        describe('Content Types', function () {
            this.timeout(30000);
            this.slow(20000);
            var defaultContentTypes = [true, true, true, false, false, false];
            after('Reset settings', function () {
                return resetSettings(this, driver);
            });
            it('should be editable through clicking on the checkboxes', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.tagName('paper-checkbox'))
                                .click()
                                .then(function () {
                                return wait(driver, 25);
                            });
                        }));
                    })
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                        assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                        var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                        //CRM prevents you from turning off all content types and 4 is the one that stays on
                        newContentTypes[2] = true;
                        newContentTypes = crm[0].onContentTypes;
                        assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                        done();
                    });
                });
            });
            it('should be editable through clicking on the icons', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.className('showOnContentItemIcon'))
                                .click();
                        }));
                    })
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    })
                        .then(function (crm) {
                        assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                        assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                        var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                        //CRM prevents you from turning off all content types and 4 is the one that stays on
                        newContentTypes[2] = true;
                        assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                        done();
                    });
                });
            });
            it('should be editable through clicking on the names', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.className('showOnContentItemTxt'))
                                .click();
                        }));
                    })
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                        assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                        var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                        //CRM prevents you from turning off all content types and 4 is the one that stays on
                        newContentTypes[2] = true;
                        assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                        done();
                    });
                });
            });
            it('should be preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.isFalse(crm[0].onContentTypes[0], 'content types that were on were switched off');
                    assert.isTrue(crm[0].onContentTypes[4], 'content types that were off were switched on');
                    var newContentTypes = defaultContentTypes.map(function (contentType) { return !contentType; });
                    //CRM prevents you from turning off all content types and 4 is the one that stays on
                    newContentTypes[2] = true;
                    assert.deepEqual(crm[0].onContentTypes, newContentTypes, 'all content types were toggled');
                    done();
                });
            });
            it('should not change when not saved', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, 'link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then(function (elements) {
                        return webdriver.promise.all(elements.map(function (element) {
                            return element
                                .findElement(webdriver.By.tagName('paper-checkbox'))
                                .click();
                        }));
                    })
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isTrue(crm[0].onContentTypes[0], 'content types that were on did not change');
                        assert.isFalse(crm[0].onContentTypes[4], 'content types that were off did not change');
                        assert.deepEqual(crm[0].onContentTypes, defaultContentTypes, 'all content types were not toggled');
                        done();
                    });
                });
            });
        });
    }
    function testClickTriggers(type) {
        describe('Click Triggers', function () {
            this.timeout(30000);
            [0, 1, 2, 3, 4].forEach(function (triggerOptionIndex) {
                describe("Trigger option " + triggerOptionIndex, function () {
                    this.slow(20000);
                    it("should be possible to select trigger option number " + triggerOptionIndex, function (done) {
                        resetSettings(this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 1500);
                            }).then(function () {
                                return saveDialog(dialog);
                            }).then(function () {
                                return getCRM(driver);
                            }).then(function (crm) {
                                assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                                done();
                            });
                        });
                    });
                    it('should be saved on page reload', function (done) {
                        reloadPage(this, driver).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', function (done) {
                        resetSettings(this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 1500);
                            }).then(function () {
                                return cancelDialog(dialog);
                            }).then(function () {
                                return getCRM(driver);
                            }).then(function (crm) {
                                assert.strictEqual(crm[0].value.launchMode, 0, 'launchmode is the same as before');
                                done();
                            });
                        });
                    });
                });
            });
            [2, 3].forEach(function (triggerOptionIndex) {
                describe("Trigger Option " + triggerOptionIndex + " with URLs", function () {
                    var _this = this;
                    this.slow(22500);
                    it('should be editable', function (done) {
                        resetSettings(_this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 1000);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 1000);
                            })
                                .then(function () {
                                return dialog
                                    .findElement(webdriver.By.id('addTrigger'))
                                    .then(function (button) {
                                    return button.click().then(function () {
                                        return button.click();
                                    });
                                });
                            }).then(function () {
                                setTimeout(function () {
                                    dialog
                                        .findElements(webdriver.By.className('executionTrigger'))
                                        .then(function (triggers) {
                                        return triggers[0]
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(function () {
                                            return triggers[1]
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(0 /* CLEAR_ALL */, 'www.google.com');
                                        });
                                    }).then(function () {
                                        return saveDialog(dialog);
                                    }).then(function () {
                                        return getCRM(driver);
                                    }).then(function (crm) {
                                        assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                                        assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                                        assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                                        assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                        assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                                        done();
                                    });
                                }, 500);
                            });
                        });
                    });
                    it('should be saved on page reload', function (done) {
                        getCRM(driver).then(function (crm) {
                            assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                            assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                            assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                            assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                            assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', function (done) {
                        resetSettings(_this, driver).then(function () {
                            return openDialog(driver, type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(driver, 500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(driver, 500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(driver, 1000);
                            })
                                .then(function () {
                                return dialog
                                    .findElement(webdriver.By.id('addTrigger'))
                                    .then(function (button) {
                                    return button.click().then(function () {
                                        return button.click();
                                    });
                                });
                            }).then(function () {
                                setTimeout(function () {
                                    dialog
                                        .findElements(webdriver.By.className('executionTrigger'))
                                        .then(function (triggers) {
                                        return triggers[0]
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(function () {
                                            return triggers[1]
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(0 /* CLEAR_ALL */, 'www.google.com');
                                        });
                                    }).then(function () {
                                        return cancelDialog(dialog);
                                    }).then(function () {
                                        return getCRM(driver);
                                    }).then(function (crm) {
                                        assert.lengthOf(crm[0].triggers, 1, 'no triggers have been added');
                                        assert.isFalse(crm[0].triggers[0].not, 'first trigger NOT status did not change');
                                        assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                                        done();
                                    });
                                }, 500);
                            });
                        });
                    });
                });
            });
        });
    }
    function testEditorSettings(type) {
        it('are togglable', function (done) {
            this.timeout(30000);
            this.slow(13000);
            resetSettings(this, driver).then(function () {
                return openDialog(driver, type);
            }).then(function () {
                return getDialog(driver, type);
            }).then(function (dialog) {
                return wait(driver, 500, dialog);
            }).then(function (dialog) {
                return dialog
                    .findElement(webdriver.By.id('editorSettings'))
                    .click()
                    .then(function () {
                    return wait(driver, 500);
                })
                    .then(function () {
                    return dialog
                        .findElement(webdriver.By.id('editorSettingsTxt'))
                        .isDisplayed();
                });
            }).then(function (isDisplayed) {
                assert.isTrue(isDisplayed, 'settings menu is visible');
                done();
            });
        });
        describe('Theme', function () {
            this.timeout(30000);
            it('is changable', function (done) {
                this.slow(13000);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(driver, 500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorThemeSettingWhite'))
                            .click();
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                    done();
                });
            });
        });
        describe('Zoom', function () {
            var newZoom = '135';
            it('is changable', function (done) {
                this.slow(13000);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .then(function (editorSettings) {
                        editorSettings
                            .click()
                            .then(function () {
                            return wait(driver, 500);
                        })
                            .then(function () {
                            return dialog
                                .findElement(webdriver.By.id('editorThemeFontSizeInput'))
                                .findElement(webdriver.By.tagName('input'))
                                .sendKeys(1 /* BACK_SPACE */, 1 /* BACK_SPACE */, 1 /* BACK_SPACE */, newZoom);
                        }).then(function () {
                            //Click the cogwheel to click "somewhere" to remove focus
                            return editorSettings.click();
                        }).then(function () {
                            return wait(driver, 500, dialog);
                        });
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                    done();
                });
            });
        });
        describe('UseTabs', function () {
            it('is changable', function (done) {
                this.slow(17000);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(driver, 500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorTabsOrSpacesCheckbox'))
                            .findElement(webdriver.By.tagName('paper-checkbox'))
                            .click();
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.isFalse(settings.editor.useTabs, 'useTabs is off');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.isFalse(settings.editor.useTabs, 'useTabs is off');
                    done();
                });
            });
        });
        describe('Tab Size', function () {
            var newTabSize = '8';
            it('is changable', function (done) {
                this.slow(17000);
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(driver, 500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(driver, 500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorTabSizeInput'))
                            .findElement(webdriver.By.tagName('input'))
                            .sendKeys(1 /* BACK_SPACE */, 1 /* BACK_SPACE */, newTabSize)
                            .then(function () {
                            //Click "some" element to un-focus the input
                            return dialog
                                .findElement(webdriver.By.id('editorSettings'))
                                .click();
                        });
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.tabSize, newTabSize, 'tab size has changed to the correct number');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.tabSize, newTabSize, 'tab size has changed to the correct number');
                    done();
                });
            });
        });
    }
    describe('CRM Editing', function () {
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        this.timeout(60000);
        describe('Type Switching', function () {
            function testTypeSwitch(driver, type, done) {
                driver.executeScript(inlineFn(function () {
                    var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                    crmItem.typeIndicatorMouseOver();
                })).then(function () {
                    return wait(driver, 300);
                }).then(function () {
                    return driver.executeScript(inlineFn(function () {
                        var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                        var typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.openTypeSwitchContainer();
                    }));
                    ;
                }).then(function () {
                    return wait(driver, 300);
                }).then(function () {
                    return driver.executeScript(inlineFn(function () {
                        var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                        var typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                            .click();
                        return window.app.settings.crm[0].type === 'REPLACE.type';
                    }, {
                        type: type
                    }));
                }).then(function (typesMatch) {
                    assert.isTrue(typesMatch, 'new type matches expected');
                    done();
                });
            }
            this.timeout(20000);
            this.slow(7000);
            it('should be able to switch to a script', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'script', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a menu', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'menu', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a divider', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'divider', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a stylesheet', function (done) {
                resetSettings(this, driver).then(function () {
                    testTypeSwitch(driver, 'stylesheet', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this, driver).then(function () {
                    return getCRM(driver);
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
                    done();
                });
            });
        });
        describe('Link Dialog', function () {
            var type = 'link';
            this.timeout(30000);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
            describe('Links', function () {
                this.slow(22500);
                after('Reset settings', function () {
                    return resetSettings(this, driver);
                });
                it('open in new tab property should be editable', function (done) {
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('paper-checkbox'))
                            .click()
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                            assert.isFalse(crm[0].value[0].newTab, 'newTab has been switched off');
                            done();
                        });
                    });
                });
                it('url property should be editable', function (done) {
                    var newUrl = 'www.google.com';
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('input'))
                            .sendKeys(0 /* CLEAR_ALL */, newUrl)
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                            assert.strictEqual(crm[0].value[0].url, newUrl, 'url has been changed');
                            done();
                        });
                    });
                });
                it('should be addable', function (done) {
                    var defaultLink = {
                        newTab: true,
                        url: 'https://www.example.com'
                    };
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then(function (button) {
                            return button
                                .click()
                                .then(function () {
                                return button.click();
                            })
                                .then(function () {
                                return button.click();
                            });
                        })
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                            assert.deepEqual(crm[0].value, Array.apply(null, Array(4)).map(function (_) { return defaultLink; }), 'new links match default link value');
                            done();
                        });
                    });
                });
                it('should be editable when newly added', function (done) {
                    var newUrl = 'www.google.com';
                    var newValue = {
                        newTab: true,
                        url: newUrl
                    };
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then(function (button) {
                            return button
                                .click()
                                .then(function () {
                                return button.click();
                            })
                                .then(function () {
                                return button.click();
                            });
                        })
                            .then(function () {
                            return wait(driver, 500);
                        })
                            .then(function () {
                            return dialog
                                .findElements(webdriver.By.className('linkChangeCont'));
                        })
                            .then(function (elements) {
                            return forEachPromise(elements, function (element) {
                                return new webdriver.promise.Promise(function (resolve) {
                                    setTimeout(function () {
                                        element
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(function () {
                                            return element
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(0 /* CLEAR_ALL */, newUrl);
                                        }).then(function () {
                                            resolve(null);
                                        });
                                    }, 250);
                                });
                            });
                        })
                            .then(function () {
                            return wait(driver, 500);
                        })
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                            //Only one newTab can be false at a time
                            var newLinks = Array.apply(null, Array(4))
                                .map(function (_) { return JSON.parse(JSON.stringify(newValue)); });
                            newLinks[3].newTab = false;
                            assert.deepEqual(crm[0].value, newLinks, 'new links match changed link value');
                            done();
                        });
                    });
                });
                it('should be preserved on page reload', function (done) {
                    var newUrl = 'www.google.com';
                    var newValue = {
                        newTab: true,
                        url: newUrl
                    };
                    reloadPage(this, driver).then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                        //Only one newTab can be false at a time
                        var newLinks = Array.apply(null, Array(4))
                            .map(function (_) { return JSON.parse(JSON.stringify(newValue)); });
                        newLinks[3].newTab = false;
                        assert.deepEqual(crm[0].value, newLinks, 'new links match changed link value');
                        done();
                    });
                });
                it('should not change when not saved', function (done) {
                    this.slow(12000);
                    var newUrl = 'www.google.com';
                    var defaultLink = {
                        newTab: true,
                        url: 'https://www.example.com'
                    };
                    resetSettings(this, driver).then(function () {
                        return openDialog(driver, 'link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then(function (button) {
                            return button
                                .click()
                                .then(function () {
                                return button.click();
                            })
                                .then(function () {
                                return button.click();
                            });
                        })
                            .then(function () {
                            return dialog
                                .findElements(webdriver.By.className('linkChangeCont'));
                        })
                            .then(function (elements) {
                            return forEachPromise(elements, function (element) {
                                return element
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click()
                                    .then(function () {
                                    return element
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0 /* CLEAR_ALL */, newUrl);
                                });
                            });
                        })
                            .then(function () {
                            return cancelDialog(dialog);
                        })
                            .then(function () {
                            return getCRM(driver);
                        })
                            .then(function (crm) {
                            assert.lengthOf(crm[0].value, 1, 'node still has 1 link');
                            assert.deepEqual(crm[0].value, [defaultLink], 'link value has stayed the same');
                            done();
                        });
                    });
                });
            });
        });
        describe('Divider Dialog', function () {
            var type = 'link';
            this.timeout(30000);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Menu Dialog', function () {
            var type = 'menu';
            this.timeout(30000);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Stylesheet Dialog', function () {
            var type = 'stylesheet';
            this.timeout(30000);
            this.slow(12000);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);
            describe('Toggling', function () {
                var _this = this;
                it('should be possible to toggle on', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                            done();
                        });
                    });
                });
                it('should be saved on page reload', function (done) {
                    reloadPage(this, driver).then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                        done();
                    });
                });
                it('should be possible to toggle on-off', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click()
                                .then(function () {
                                return slider
                                    .click();
                            });
                        }).then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
                            done();
                        });
                    });
                });
                it('should not be saved on cancel', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(function () {
                            return cancelDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
                            done();
                        });
                    });
                });
            });
            describe('Default State', function () {
                var _this = this;
                it('should be togglable to true', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return dialog
                                .findElement(webdriver.By.id('isDefaultOnButton'));
                        }).then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                            assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                            done();
                        });
                    });
                });
                it('should be saved on page reset', function (done) {
                    reloadPage(this, driver).then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                        assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                        done();
                    });
                });
                it('should be togglable to false', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return dialog
                                .findElement(webdriver.By.id('isDefaultOnButton'));
                        }).then(function (slider) {
                            return slider
                                .click()
                                .then(function () {
                                return slider.click();
                            });
                        }).then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                            assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to true');
                            done();
                        });
                    });
                });
                it('should not be saved when cancelled', function (done) {
                    resetSettings(_this, driver).then(function () {
                        return openDialog(driver, type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return dialog
                                .findElement(webdriver.By.id('isDefaultOnButton'));
                        }).then(function (slider) {
                            return slider
                                .click();
                        }).then(function () {
                            return cancelDialog(dialog);
                        }).then(function () {
                            return getCRM(driver);
                        }).then(function (crm) {
                            assert.isNotTrue(crm[0].value.toggle, 'toggle option is set to false');
                            assert.isNotTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
                            done();
                        });
                    });
                });
            });
            describe('Editor', function () {
                describe('Settings', function () {
                    testEditorSettings(type);
                });
            });
        });
        describe('Script Dialog', function () {
            var type = 'script';
            this.timeout(30000);
            this.slow(12000);
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);
            describe('Editor', function () {
                describe('Settings', function () {
                    testEditorSettings(type);
                });
            });
        });
    });
    describe('Errors', function () {
        this.timeout(60000);
        this.slow(2000);
        it('should not have been thrown', function (done) {
            driver
                .executeScript(inlineFn(function () {
                return window.lastError ? window.lastError : 'noError';
            })).then(function (result) {
                assert.ifError(result !== 'noError' ? result : false, 'no errors should be thrown during testing');
                done();
            });
        });
    });
});
describe('On-Page CRM', function () {
    this.slow(200);
    this.timeout(10000);
    describe('Redraws on new CRM', function () {
        var CRM1 = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            })
        ];
        var CRM2 = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(8000);
            assert.doesNotThrow(function () {
                console.log(CRM1, JSON.stringify(CRM1));
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function () {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: JSON.stringify(CRM1)
                    })).then(function (returned) {
                        console.log('returned', returned);
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should be using the first CRM', function (done) {
            this.timeout(60000);
            getContextMenu(driver).then(function (contextMenu) {
                assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRM1.concat([{
                        name: undefined
                    }, {
                        name: 'Options'
                    }])), 'node orders and names match');
                done();
            });
        });
        it('should be able to switch to a new CRM', function (done) {
            this.slow(1200);
            assert.doesNotThrow(function () {
                driver
                    .executeScript(inlineFn(function () {
                    window.app.settings.crm = REPLACE.crm;
                    window.app.upload();
                    return true;
                }, {
                    crm: JSON.stringify(CRM2)
                })).then(function () {
                    done();
                });
            }, 'settings CRM does not throw');
        });
        it('should be using the new CRM', function (done) {
            this.slow(400);
            getContextMenu(driver).then(function (contextMenu) {
                assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRM2.concat([{
                        name: undefined
                    }, {
                        name: 'Options'
                    }])), 'node orders and names match');
                done();
            });
        });
    });
    describe('Links', function () {
        this.timeout(60000);
        this.slow(500);
        var CRMNodes = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: false,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: true
                    }]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }],
                onContentTypes: [true, false, false, false, false, false]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }],
                onContentTypes: [false, false, false, false, false, true]
            }),
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId(),
                showOnSpecified: true,
                triggers: [{
                        url: 'http://www.somewebsite.com',
                        not: false
                    }],
                value: [{
                        url: 'www.a.com',
                        newTab: true
                    }, {
                        url: 'www.b.com',
                        newTab: false
                    }, {
                        url: 'www.c.com',
                        newTab: true
                    }]
            }),
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(8000);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function () {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: JSON.stringify(CRMNodes)
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should match the given names and types', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                for (var i = 0; i < CRMNodes.length; i++) {
                    assert.isDefined(contextMenu[i], "node " + i + " is defined");
                    assert.strictEqual(contextMenu[i].currentProperties.title, CRMNodes[i].name, "names for " + i + " match");
                    assert.strictEqual(contextMenu[i].currentProperties.type, 'normal', "type for " + i + " is normal");
                }
                done();
            });
        });
        it('should match the given triggers', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                assert.lengthOf(contextMenu[0 /* NO_TRIGGERS */].createProperties.documentUrlPatterns, 0, 'triggers are turned off');
                assert.deepEqual(contextMenu[1 /* TRIGGERS */].createProperties.documentUrlPatterns, CRMNodes[1 /* TRIGGERS */].triggers.map(function (trigger) {
                    return prepareTrigger(trigger.url);
                }), 'triggers are turned on');
                done();
            });
        });
        it('should match the given content types', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                for (var i = 0; i < CRMNodes.length; i++) {
                    assert.sameDeepMembers(contextMenu[i].currentProperties.contexts, CRMNodes[i].onContentTypes.map(function (enabled, index) {
                        if (enabled) {
                            return getTypeName(index);
                        }
                        else {
                            return null;
                        }
                    }).filter(function (item) { return item !== null; }), "content types for " + i + " match");
                }
                done();
            });
        });
        it('should open the correct links when clicked for the default link', function (done) {
            this.slow(2500);
            this.timeout(5000);
            var tabId = ~~(Math.random() * 100);
            var windowId = ~~(Math.random() * 100);
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    window.chrome._currentContextMenu[0].children[4 /* DEFAULT_LINKS */]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                    return true;
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[4 /* DEFAULT_LINKS */].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: tabId,
                        index: 1,
                        windowId: windowId,
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._activeTabs);
                    }));
                }).then(function (str) {
                    var activeTabs = JSON.parse(str);
                    var expectedTabs = CRMNodes[4 /* DEFAULT_LINKS */].value.map(function (link) {
                        if (!link.newTab) {
                            return {
                                id: tabId,
                                data: {
                                    url: sanitizeUrl(link.url)
                                },
                                type: 'update'
                            };
                        }
                        else {
                            return {
                                type: 'create',
                                data: {
                                    windowId: windowId,
                                    url: sanitizeUrl(link.url),
                                    openerTabId: tabId
                                }
                            };
                        }
                    });
                    assert.sameDeepMembers(activeTabs, expectedTabs, 'opened tabs match expected');
                    done();
                });
            });
        });
        it('should open the correct links when clicked for multiple links', function (done) {
            var tabId = ~~(Math.random() * 100);
            var windowId = ~~(Math.random() * 100);
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    //Clear it without removing object-array-magic-address-linking
                    while (window.chrome._activeTabs.length > 0) {
                        window.chrome._activeTabs.pop();
                    }
                    return window.chrome._currentContextMenu[0].children[5 /* PRESET_LINKS */]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[5 /* PRESET_LINKS */].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: tabId,
                        index: 1,
                        windowId: windowId,
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                })).then(function (result) {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._activeTabs);
                    }));
                }).then(function (str) {
                    var activeTabs = JSON.parse(str);
                    var expectedTabs = CRMNodes[5 /* PRESET_LINKS */].value.map(function (link) {
                        if (!link.newTab) {
                            return {
                                id: tabId,
                                data: {
                                    url: sanitizeUrl(link.url)
                                },
                                type: 'update'
                            };
                        }
                        else {
                            return {
                                type: 'create',
                                data: {
                                    windowId: windowId,
                                    url: sanitizeUrl(link.url),
                                    openerTabId: tabId
                                }
                            };
                        }
                    });
                    assert.sameDeepMembers(activeTabs, expectedTabs, 'opened tabs match expected');
                    done();
                });
            });
        });
    });
    describe('Menu & Divider', function () {
        var CRMNodes = [
            templates.getDefaultLinkNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultDividerNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultDividerNode({
                name: getRandomString(25),
                id: getRandomId()
            }),
            templates.getDefaultMenuNode({
                name: getRandomString(25),
                id: getRandomId(),
                children: [
                    templates.getDefaultLinkNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultDividerNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultLinkNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultDividerNode({
                        name: getRandomString(25),
                        id: getRandomId()
                    }),
                    templates.getDefaultMenuNode({
                        name: getRandomString(25),
                        id: getRandomId(),
                        children: [
                            templates.getDefaultMenuNode({
                                name: getRandomString(25),
                                id: getRandomId(),
                                children: [
                                    templates.getDefaultMenuNode({
                                        name: getRandomString(25),
                                        id: getRandomId(),
                                        children: [
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                            templates.getDefaultLinkNode({
                                                name: getRandomString(25),
                                                id: getRandomId()
                                            }),
                                        ]
                                    }),
                                    templates.getDefaultLinkNode({
                                        name: getRandomString(25),
                                        id: getRandomId(),
                                        children: []
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(8000);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function () {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: JSON.stringify(CRMNodes)
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should have the correct structure', function (done) {
            this.slow(500);
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    return window.logs;
                }))
                    .then(function (logs) {
                    assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes.concat([{
                            name: undefined
                        }, {
                            name: 'Options'
                        }])), 'structures match');
                    done();
                });
            });
        });
    });
    describe('Scripts', function () {
        var _this = this;
        this.timeout(5000);
        this.slow(60000);
        var CRMNodes = [
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 1 /* ALWAYS_RUN */,
                    script: 'console.log("executed script");'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    script: 'console.log("executed script");'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 2 /* RUN_ON_SPECIFIED */,
                    script: 'console.log("executed script");'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example2.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 3 /* SHOW_ON_SPECIFIED */,
                    script: 'console.log("executed script");'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example3.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    backgroundScript: 'console.log("executed backgroundscript")'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 4 /* DISABLED */,
                    script: 'console.log("executed script");'
                }
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(8000);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function () {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: JSON.stringify(CRMNodes)
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function () {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.notexample.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 1, 'one script activated');
                assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on right tab');
                done();
            });
        });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[1 /* RUN_ON_CLICKING */]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var activatedScripts = JSON.parse(str);
                    assert.lengthOf(activatedScripts, 1, 'one script was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                    done();
                });
            });
        });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function () {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                //First one is the ALWAYS_RUN script, ignore that
                assert.lengthOf(activatedScripts, 2, 'two scripts activated');
                assert.strictEqual(activatedScripts[1].id, fakeTabId, 'new script was executed on right tab');
                done();
            });
        });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function (done) {
            _this.slow(25000);
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function () {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example2.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return getContextMenu(driver);
            }).then(function (contextMenu) {
                assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');
                return driver
                    .executeScript(inlineFn(function () {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[1]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                }));
            }).then(function () {
                return driver
                    .executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 1, 'one script was activated');
                assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                done();
            });
        });
        it('should run the backgroundscript when one is specified', function (done) {
            this.slow(8000);
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                assert.isAbove(contextMenu.length, 3, 'contextmenu contains at least 3 items');
                assert.doesNotThrow(function () {
                    driver
                        .executeScript(inlineFn(function () {
                        return window.chrome._currentContextMenu[0]
                            .children[2]
                            .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                    }, {
                        page: JSON.stringify({
                            menuItemId: contextMenu[0].id,
                            editable: false,
                            pageUrl: 'www.google.com'
                        }),
                        tab: JSON.stringify({
                            id: fakeTabId,
                            index: 1,
                            windowId: getRandomId(),
                            highlighted: false,
                            active: true,
                            pinned: false,
                            selected: false,
                            url: 'http://www.google.com',
                            title: 'Google',
                            incognito: false
                        })
                    })).then(function () {
                        return driver
                            .executeScript(inlineFn(function () {
                            return JSON.stringify(window.chrome._activatedBackgroundPages);
                        }));
                    }).then(function (str) {
                        var activatedBackgroundScripts = JSON.parse(str);
                        assert.lengthOf(activatedBackgroundScripts, 1, 'one backgroundscript was activated');
                        assert.strictEqual(activatedBackgroundScripts[0], CRMNodes[4 /* BACKGROUNDSCRIPT */].id, 'correct backgroundscript was executed');
                        done();
                    });
                }, 'clicking the node does not throw');
            });
        });
        it('should not show the disabled node', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                assert.notInclude(contextMenu.map(function (item) {
                    return item.id;
                }), CRMNodes[5 /* DISABLED */].id, 'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[1 /* RUN_ON_CLICKING */]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var activatedScripts = JSON.parse(str);
                    assert.lengthOf(activatedScripts, 1, 'one script was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                    assert.include(activatedScripts[0].code, CRMNodes[1 /* RUN_ON_CLICKING */].value.script, 'executed code is the same as set code');
                    done();
                });
            });
        });
    });
    describe('Stylesheets', function () {
        this.timeout(60000);
        this.slow(2000);
        var CRMNodes = [
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: false,
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    stylesheet: '#stylesheetTestDummy1 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: true,
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    stylesheet: '#stylesheetTestDummy2 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 1 /* ALWAYS_RUN */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 2 /* RUN_ON_SPECIFIED */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                triggers: [
                    {
                        url: 'http://www.example2.com',
                        not: false
                    }
                ],
                value: {
                    launchMode: 3 /* SHOW_ON_SPECIFIED */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 4 /* DISABLED */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(8000);
            assert.doesNotThrow(function () {
                resetSettings(_this, driver).then(function () {
                    driver
                        .executeScript(inlineFn(function () {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: JSON.stringify(CRMNodes)
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function () {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.notexample.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                //First one is the default on stylesheet, ignore that
                assert.lengthOf(activatedScripts, 2, 'two stylesheets activated');
                assert.strictEqual(activatedScripts[1].id, fakeTabId, 'stylesheet was executed on right tab');
                done();
            });
        });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[2]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var activatedScripts = JSON.parse(str);
                    assert.lengthOf(activatedScripts, 1, 'one stylesheet was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId, 'stylesheet was executed on the right tab');
                    done();
                });
            });
        });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', function (done) {
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function () {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return wait(driver, 50);
            }).then(function () {
                return driver.executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                //First one is the ALWAYS_RUN stylesheet, second one is the default on one ignore that
                assert.lengthOf(activatedScripts, 3, 'three stylesheets activated');
                assert.strictEqual(activatedScripts[2].id, fakeTabId, 'new stylesheet was executed on right tab');
                done();
            });
        });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function (done) {
            this.slow(10000);
            var fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(function () {
                window.chrome._clearExecutedScripts();
                window.chrome._fakeTabs[REPLACE.fakeTabId] = {
                    id: REPLACE.fakeTabId,
                    url: 'http://www.example2.com'
                };
                window.chrome.runtime.sendMessage({
                    type: 'newTabCreated'
                }, {
                    tab: {
                        id: REPLACE.fakeTabId
                    }
                }, function () { });
            }, {
                fakeTabId: fakeTabId
            })).then(function () {
                return getContextMenu(driver);
            }).then(function (contextMenu) {
                assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');
                return driver
                    .executeScript(inlineFn(function () {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[3]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                }));
            }).then(function () {
                return driver
                    .executeScript(inlineFn(function () {
                    return JSON.stringify(window.chrome._executedScripts);
                }));
            }).then(function (str) {
                var activatedScripts = JSON.parse(str);
                assert.lengthOf(activatedScripts, 1, 'one script was activated');
                assert.strictEqual(activatedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                done();
            });
        });
        it('should not show the disabled node', function (done) {
            getContextMenu(driver).then(function (contextMenu) {
                assert.notInclude(contextMenu.map(function (item) {
                    return item.id;
                }), CRMNodes[6 /* DISABLED */].id, 'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', function (done) {
            this.slow(4000);
            var fakeTabId = getRandomId();
            getContextMenu(driver).then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    window.chrome._clearExecutedScripts();
                    return window.chrome._currentContextMenu[0]
                        .children[2]
                        .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[0].id,
                        editable: false,
                        pageUrl: 'www.google.com'
                    }),
                    tab: JSON.stringify({
                        id: fakeTabId,
                        index: 1,
                        windowId: getRandomId(),
                        highlighted: false,
                        active: true,
                        pinned: false,
                        selected: false,
                        url: 'http://www.google.com',
                        title: 'Google',
                        incognito: false
                    })
                })).then(function () {
                    return driver
                        .executeScript(inlineFn(function () {
                        return JSON.stringify(window.chrome._executedScripts);
                    }));
                }).then(function (str) {
                    var executedScripts = JSON.parse(str);
                    assert.lengthOf(executedScripts, 1, 'one script was activated');
                    assert.strictEqual(executedScripts[0].id, fakeTabId, 'script was executed on the right tab');
                    assert.include(executedScripts[0].code, CRMNodes[3 /* RUN_ON_CLICKING */].value.stylesheet, 'executed code is the same as set code');
                    done();
                });
            });
        });
        it('should actually be applied to the page', function (done) {
            this.slow(6000);
            driver
                .executeScript(inlineFn(function (args) {
                var dummyEl = document.createElement('div');
                dummyEl.id = 'stylesheetTestDummy';
                window.dummyContainer.appendChild(dummyEl);
            })).then(function () {
                return wait(driver, 100);
            }).then(function () {
                return findElement(driver, webdriver.By.id('stylesheetTestDummy'));
            }).then(function (dummy) {
                return dummy.getSize();
            }).then(function (dimensions) {
                assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                assert.strictEqual(dimensions.height, 50, 'dummy element is 50px high');
                done();
            });
        });
        describe('Toggling', function () {
            var dummy1;
            var dummy2;
            before('Setting up dummy elements', function (done) {
                driver
                    .executeScript(inlineFn(function () {
                    var dummy1 = document.createElement('div');
                    dummy1.id = 'stylesheetTestDummy1';
                    var dummy2 = document.createElement('div');
                    dummy2.id = 'stylesheetTestDummy2';
                    window.dummyContainer.appendChild(dummy1);
                    window.dummyContainer.appendChild(dummy2);
                })).then(function () {
                    return wait(driver, 50);
                }).then(function () {
                    return FoundElementPromise.all([
                        findElement(driver, webdriver.By.id('stylesheetTestDummy1')),
                        findElement(driver, webdriver.By.id('stylesheetTestDummy2'))
                    ]);
                }).then(function (results) {
                    wait(driver, 150).then(function () {
                        dummy1 = results[0];
                        dummy2 = results[1];
                        done();
                    });
                });
            });
            describe('Default off', function () {
                var tabId = getRandomId();
                this.timeout(10000);
                it('should be off by default', function (done) {
                    wait(driver, 150).then(function () {
                        dummy1.getSize().then(function (dimensions) {
                            assert.strictEqual(dimensions.width, 0, 'dummy element is 0px wide');
                            done();
                        });
                    });
                });
                it('should be on when clicked', function (done) {
                    getContextMenu(driver).then(function (contextMenu) {
                        driver.executeScript(inlineFn(function () {
                            return window.chrome._currentContextMenu[0]
                                .children[0 /* TOGGLE_DEFAULT_OFF */]
                                .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                        }, {
                            page: JSON.stringify({
                                menuItemId: contextMenu[0].id,
                                editable: false,
                                pageUrl: 'www.google.com',
                                wasChecked: false
                            }),
                            tab: JSON.stringify({
                                id: tabId,
                                index: 1,
                                windowId: getRandomId(),
                                highlighted: false,
                                active: true,
                                pinned: false,
                                selected: false,
                                url: 'http://www.google.com',
                                title: 'Google',
                                incognito: false
                            })
                        }));
                    }).then(function () {
                        return wait(driver, 100);
                    }).then(function () {
                        return dummy1.getSize();
                    }).then(function (dimensions) {
                        assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                        done();
                    });
                });
                it('should be off when clicked again', function (done) {
                    getContextMenu(driver).then(function (contextMenu) {
                        driver.executeScript(inlineFn(function () {
                            return window.chrome._currentContextMenu[0]
                                .children[0 /* TOGGLE_DEFAULT_OFF */]
                                .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                        }, {
                            page: JSON.stringify({
                                menuItemId: contextMenu[0].id,
                                editable: false,
                                pageUrl: 'www.google.com',
                                wasChecked: true
                            }),
                            tab: JSON.stringify({
                                id: tabId,
                                index: 1,
                                windowId: getRandomId(),
                                highlighted: false,
                                active: true,
                                pinned: false,
                                selected: false,
                                url: 'http://www.google.com',
                                title: 'Google',
                                incognito: false
                            })
                        }));
                    }).then(function () {
                        return wait(driver, 100);
                    }).then(function () {
                        return dummy1.getSize();
                    }).then(function (dimensions) {
                        assert.strictEqual(dimensions.width, 0, 'dummy element is 0px wide');
                        done();
                    });
                });
            });
            describe('Default on', function () {
                this.timeout(10000);
                it('should be on by default', function (done) {
                    dummy2.getSize().then(function (dimensions) {
                        assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                        done();
                    });
                });
            });
        });
    });
});
