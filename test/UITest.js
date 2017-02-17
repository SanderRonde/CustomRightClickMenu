/// <reference path="../tools/definitions/selenium-webdriver.d.ts" />
/// <reference path="../tools/definitions/chai.d.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />
/// <reference path="../tools/definitions/crm.d.ts" />
/// <reference path="../app/js/background.ts" />
/// <reference path="../tools/definitions/codemirror.d.ts" />
"use strict";
var chai = require("chai");
var webdriver = require("selenium-webdriver");
var mochaSteps = require('mocha-steps');
var secrets = require('./UI/secrets');
var btoa = require('btoa');
var xhr = require('xhr');
var assert = chai.assert;
var driver;
var capabilities;
switch (__filename.split('-').pop().split('.')[0]) {
    case '1':
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
    default:
        capabilities = {
            'browserName': 'Chrome',
            //'browser_version': '26.0',
            'os': 'Windows',
            'os_version': '8',
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
    this.timeout(600000);
    var result = new webdriver.Builder()
        .usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities)
        .build();
    var called = false;
    function callDone() {
        if (!called) {
            called = true;
            done();
        }
    }
    result.get('http://localhost:1234/test/UI/UITest.html#noClear-test').then(function () {
        driver = result;
        var timer = setInterval(function () {
            driver.executeScript(inlineFn(function () {
                return window.polymerElementsLoaded;
            })).then(function (loaded) {
                if (loaded) {
                    clearInterval(timer);
                    callDone();
                }
            });
        }, 2500);
    });
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
            stylesheet: [].join('\n'),
            launchMode: 1 /* ALWAYS_RUN */
        };
        return this.mergeObjects(value, options);
    },
    getDefaultScriptValue: function (options) {
        var value = {
            launchMode: 1 /* ALWAYS_RUN */,
            backgroundLibraries: [],
            libraries: [],
            script: [].join('\n'),
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
function findElementOnPage(selector) {
    var list = JSON.parse(selector);
    var el = document.body;
    for (var i = 0; i < list.length; i++) {
        el = el.querySelectorAll(list[i][0])[list[i][1]];
    }
    return el;
}
function checkIfListContainsElement(element) {
    var keys = Object.getOwnPropertyNames(element);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(0, 2) === '__' && element[keys[i]] !== null) {
            return keys[i];
        }
    }
    throw new Error('Could not find element');
}
function inlineFn(fn, args) {
    if (args === void 0) { args = {}; }
    var insertedFunctions = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        insertedFunctions[_i - 2] = arguments[_i];
    }
    var str = insertedFunctions.map(function (inserted) { return inserted.toString(); }).join('\n') + "\n\t\t\treturn (" + fn.toString() + ")(arguments)";
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
            try {
                window.chrome.storage.local.clear();
                window.chrome.storage.sync.clear();
                window.app.settings = window.app.storageLocal = window.app.storageSync = null;
                window.app.refreshPage();
            }
            catch (e) {
                return {
                    message: e.message,
                    stack: e.stack
                };
            }
        })).then(function (e) {
            if (e) {
                console.log(e);
                throw e;
            }
            return wait(driver, 1500);
        }).then(function () {
            resolve(null);
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
        wait(driver, 500).then(function () {
            driver.executeScript(inlineFn(function () {
                try {
                    window.app.refreshPage();
                }
                catch (e) {
                    return {
                        message: e.message,
                        stack: e.stack
                    };
                }
            })).then(function (e) {
                if (e) {
                    console.log(e);
                    throw e;
                }
                return wait(driver, 1000);
            }).then(function () {
                resolve(null);
            });
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
            driver.executeScript(inlineFn(function () {
                document.getElementsByTagName('edit-crm-item').item(0).openEditPage();
            })).then(function () {
                wait(driver, 1000).then(resolve);
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
            args[_i] = arguments[_i];
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.promise.then(function (element) {
                element.sendKeys.apply(element, args).then(function () {
                    resolve(undefined);
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
    FoundElementPromise.prototype.getProperty = function (prop) {
        var _this = this;
        return new webdriver.promise.Promise(function (resolve) {
            _this.then(function (element) {
                element.getProperty(prop).then(function (value) {
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
    function FoundElement(selector, index, driver, parent) {
        if (parent === void 0) { parent = null; }
        this.selector = selector;
        this.index = index;
        this.driver = driver;
        this.parent = parent;
    }
    FoundElement.prototype.click = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                findElementOnPage('REPLACE.selector').click();
            }, {
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage)).then(function (e) {
                e && console.log(e);
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.findElement = function (by) {
        var _this = this;
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new FoundElementPromise(function (resolve, reject) {
            _this.driver.executeScript(inlineFn(function () {
                var el = findElementOnPage('REPLACE.selector')
                    .querySelector('REPLACE.css');
                if (el === null) {
                    return 'null';
                }
                return 'exists';
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage)).then(function (index) {
                if (index === 'null') {
                    reject(null);
                }
                else {
                    resolve(new FoundElement(css, 0, driver, _this));
                }
            });
        });
    };
    FoundElement.prototype.findElements = function (by) {
        var _this = this;
        var css = locatorToCss(by);
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var elList = findElementOnPage('REPLACE.selector').querySelectorAll('REPLACE.css');
                return JSON.stringify(Array.prototype.slice.apply(elList).map(function (element) {
                    if (element === null) {
                        return 'null';
                    }
                    return 'exists';
                }));
            }, {
                css: css,
                selector: JSON.stringify(selectorList.reverse())
            }, findElementOnPage, checkIfListContainsElement)).then(function (indexes) {
                resolve(JSON.parse(indexes).map(function (found, index) {
                    if (found === 'exists') {
                        return new FoundElement(css, index, driver, _this);
                    }
                    return null;
                }).filter(function (item) { return item !== null; }));
            });
        });
    };
    FoundElement.prototype.sendKeys = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
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
                var selectorList = [[_this.selector, _this.index]];
                var currentElement = _this;
                while (currentElement.parent) {
                    currentElement = currentElement.parent;
                    selectorList.push([currentElement.selector, currentElement.index]);
                }
                return new webdriver.promise.Promise(function (sentKeysResolve) {
                    _this.driver.executeScript(inlineFn(function () {
                        var el = findElementOnPage('REPLACE.selector');
                        var keyPresses = REPLACE.keypresses;
                        var currentValue = el.value || '';
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
                    }, findElementOnPage)).then(function () {
                        sentKeysResolve(undefined);
                    });
                });
            }).then(function () {
                resolve(undefined);
            });
        });
    };
    FoundElement.prototype.getProperty = function (prop) {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var el = findElementOnPage('REPLACE.selector');
                var val = el['REPLACE.prop'];
                return JSON.stringify(val);
            }, {
                selector: JSON.stringify(selectorList.reverse()),
                prop: prop
            }, findElementOnPage)).then(function (value) {
                resolve(JSON.parse(value));
            });
        });
    };
    FoundElement.prototype.getAttribute = function (attr) {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var el = findElementOnPage('REPLACE.selector');
                var attr = el.getAttribute('REPLACE.attr');
                return attr === undefined || attr === null ?
                    el['REPLACE.attr'] : attr;
            }, {
                selector: JSON.stringify(selectorList.reverse()),
                attr: attr
            }, findElementOnPage)).then(function (value) {
                resolve(value);
            });
        });
    };
    FoundElement.prototype.getSize = function () {
        var _this = this;
        var selectorList = [[this.selector, this.index]];
        var currentElement = this;
        while (currentElement.parent) {
            currentElement = currentElement.parent;
            selectorList.push([currentElement.selector, currentElement.index]);
        }
        return new webdriver.promise.Promise(function (resolve) {
            _this.driver.executeScript(inlineFn(function () {
                var bcr = findElementOnPage('REPLACE.selector').getBoundingClientRect();
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
            }, findElementOnPage)).then(function (bcr) {
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
    return new FoundElementPromise(function (resolve, reject) {
        driver.executeScript(inlineFn(function () {
            var elContainer = document.querySelector('REPLACE.css');
            if (elContainer === null) {
                return 'null';
            }
            return 'exists';
        }, {
            css: selector
        })).then(function (found) {
            if (found === 'exists') {
                resolve(new FoundElement(selector, 0, driver));
            }
            else {
                reject(null);
            }
        });
    });
}
function findElements(driver, by) {
    var selector = locatorToCss(by);
    return driver.executeScript(inlineFn(function () {
        var elList = document.querySelectorAll('REPLACE.css');
        return JSON.stringify(Array.prototype.slice.apply(elList).map(function (element) {
            if (element === null) {
                return 'null';
            }
            return 'exists';
        }));
    }, {
        css: selector
    })).then(function (indexes) {
        return new webdriver.promise.Promise(function (resolve) {
            resolve(JSON.parse(indexes).map(function (exists, index) {
                if (exists === 'exists') {
                    return new FoundElement(selector, index, driver);
                }
                return null;
            }).filter(function (item) { return item !== null; }));
        });
    });
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
function subtractStrings(biggest, smallest) {
    return biggest.slice(smallest.length);
}
function getEditorValue(driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        driver.executeScript(inlineFn(function () {
            return window['REPLACE.editor'].editor.getValue();
        }, {
            editor: type === 'script' ? 'scriptEdit' : 'stylesheetEdit'
        })).then(function (value) {
            resolve(value);
        });
    });
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
function enterEditorFullscreen(_this, driver, type) {
    return new webdriver.promise.Promise(function (resolve) {
        resetSettings(_this, driver).then(function () {
            return openDialog(driver, type);
        }).then(function () {
            return getDialog(driver, type);
        }).then(function (dialog) {
            return wait(driver, 500, dialog);
        }).then(function (dialog) {
            return dialog
                .findElement(webdriver.By.id('editorFullScreen'))
                .click()
                .then(function () {
                return wait(driver, 500);
            }).then(function () {
                resolve(dialog);
            });
        });
    });
}
describe('Options Page', function () {
    describe('Loading', function () {
        this.timeout(60000);
        this.slow(60000);
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
    /*
    describe('CheckboxOptions', function(this: MochaFn) {
        this.timeout(5000);
        this.slow(4000);
        const checkboxDefaults = {
            showOptions: true,
            recoverUnsavedData: false,
            CRMOnPage: true,
            useStorageSync: true
        };
        //This is disabled for any chrome <= 34 versions
        if (capabilities.browser_version && ~~capabilities.browser_version.split('.')[0] <= 34) {
            delete checkboxDefaults.CRMOnPage;
        }
        Object.getOwnPropertyNames(checkboxDefaults).forEach((checkboxId, index) => {
            it(`${checkboxId} should be clickable`, (done) => {
                reloadPage(this, driver).then(() => {
                    findElement(driver, webdriver.By.css(`#${checkboxId} paper-checkbox`))
                        .then((element) => {
                            return element.click();
                        }).then(() => {
                            return driver.executeScript(inlineFn(() => {
                                return JSON.stringify({
                                    match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
                                    checked: (document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox') as HTMLInputElement).checked
                                });
                            }, {
                                checkboxId: checkboxId,
                                expected: !checkboxDefaults[checkboxId]
                            }));
                        }).then((result: string) => {
                            const resultObj: {
                                checked: boolean;
                                match: boolean;
                            } = JSON.parse(result);
                            assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId],
                                'checkbox checked status matches expected');
                            assert.strictEqual(resultObj.match, true,
                                `checkbox ${checkboxId} value reflects settings value`);
                            done();
                        });
                });
            });
            it(`${checkboxId} should be saved`, function(done) {
                reloadPage(this, driver).then(() => {
                    return driver
                        .executeScript(inlineFn(() => {
                            return JSON.stringify({
                                match: window.app.storageLocal['REPLACE.checkboxId'] === REPLACE.expected,
                                checked: (document.getElementById('REPLACE.checkboxId').querySelector('paper-checkbox') as HTMLInputElement).checked
                            });
                        }, {
                            checkboxId: checkboxId,
                            expected: !checkboxDefaults[checkboxId]
                        }))
                    })
                    .then((result: string) => {
                        const resultObj: {
                            checked: boolean;
                            match: boolean;
                        } = JSON.parse(result);

                        assert.strictEqual(resultObj.checked, !checkboxDefaults[checkboxId],
                            'checkbox checked status has been saved');
                        assert.strictEqual(resultObj.match, true,
                            `checkbox ${checkboxId} value has been saved`);
                        done();
                    })
            });
        });
    });
    describe('Commonly used links', function(this: MochaFn) {
        this.timeout(15000);
        this.slow(10000);
        let searchEngineLink = '';
        let defaultLinkName = '';

        before('Reset settings', function() {
            return resetSettings(this, driver);
        });
        it('should be addable, renamable and saved', function(this: MochaFn, done)  {
            this.retries(3);
            findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
                elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
                    elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                            getCRM(driver).then((crm: Array<LinkNode>) => {
                                searchEngineLink = link;
                                defaultLinkName = name;

                                const element = crm[crm.length - 1];

                                assert.strictEqual(name, element.name,
                                    'name is the same as expected');
                                assert.strictEqual(element.type, 'link',
                                    'type of element is link');
                                assert.isArray(element.value, 'element value is array');
                                assert.lengthOf(element.value, 1, 'element has one child');
                                assert.isDefined(element.value[0], 'first element is defined');
                                assert.isObject(element.value[0], 'first element is an object');
                                assert.strictEqual(element.value[0].url, link,
                                    'value url is the same as expected');
                                assert.isTrue(element.value[0].newTab, 'newTab is true');
                                

                                const renameName = 'SomeName';
                                findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
                                    elements[0].findElement(webdriver.By.tagName('paper-button')).then((button) => {
                                        elements[0].findElement(webdriver.By.tagName('input')).sendKeys(
                                            InputKeys.CLEAR_ALL, renameName
                                        ).then(() => {
                                            return button.click();
                                        }).then(() => {
                                            elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                                                getCRM(driver).then((crm: Array<LinkNode>) => {
                                                    const element = crm[crm.length - 1];

                                                    assert.strictEqual(element.name, renameName,
                                                        'name is the same as expected');
                                                    assert.strictEqual(element.type, 'link',
                                                        'type of element is link');
                                                    assert.isArray(element.value, 'element value is array');
                                                    assert.lengthOf(element.value, 1, 'element has one child');
                                                    assert.isDefined(element.value[0], 'first element is defined');
                                                    assert.isObject(element.value[0], 'first element is an object');
                                                    assert.strictEqual(element.value[0].url, link,
                                                        'value url is the same as expected');
                                                    assert.isTrue(element.value[0].newTab, 'newTab is true');
                                                    

                                                    reloadPage(this, driver).then(() => {
                                                        return getCRM(driver);
                                                    })
                                                    .then((crm: Array<LinkNode>) => {
                                                        const element = crm[crm.length - 2];

                                                        assert.isDefined(element, 'element is defined');
                                                        assert.strictEqual(element.name, defaultLinkName,
                                                            'name is the same as expected');
                                                        assert.strictEqual(element.type, 'link',
                                                            'type of element is link');
                                                        assert.isArray(element.value, 'element value is array');
                                                        assert.lengthOf(element.value, 1, 'element has one child');
                                                        assert.isDefined(element.value[0], 'first element is defined');
                                                        assert.isObject(element.value[0], 'first element is an object');
                                                        assert.strictEqual(element.value[0].url, searchEngineLink,
                                                            'value url is the same as expected');
                                                        assert.isTrue(element.value[0].newTab, 'newTab is true');

                                                        var element2 = crm[crm.length - 1];
                                                        assert.isDefined(element2, 'element is defined');
                                                        assert.strictEqual(element2.name, 'SomeName',
                                                            'name is the same as expected');
                                                        assert.strictEqual(element2.type, 'link',
                                                            'type of element is link');
                                                        assert.isArray(element2.value, 'element value is array');
                                                        assert.lengthOf(element2.value, 1, 'element has one child');
                                                        assert.isDefined(element2.value[0], 'first element is defined');
                                                        assert.isObject(element2.value[0], 'first element is an object');
                                                        assert.strictEqual(element2.value[0].url, searchEngineLink,
                                                            'value url is the same as expected');
                                                        assert.isTrue(element2.value[0].newTab, 'newTab is true');

                                                        done();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    describe('SearchEngines', function(this: MochaFn) {
        this.timeout(150000);
        this.slow(10000);
        let searchEngineLink = '';
        let searchEngineName = '';

        before('Reset settings', function() {
            return resetSettings(this, driver);
        });

        it('should be addable, renamable and should be saved', function(this: MochaFn, done)  {
            this.retries(3);
            findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
                const index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
                    elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                            getCRM(driver).then((crm: Array<ScriptNode>) => {
                                const element = crm[crm.length - 1];

                                searchEngineLink = link;
                                searchEngineName = name;
                                
                                assert.strictEqual(element.name, name,
                                    'name is the same as expected');
                                assert.strictEqual(element.type, 'script',
                                    'type of element is script');
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
                                    '}',
                                    'script1 value matches expected');
                                
                                const renameName = 'SomeName';
                                findElements(driver, webdriver.By.tagName('default-link')).then((elements) => {
                                    const index = elements.length - 1;
                                    elements[index].findElement(webdriver.By.tagName('paper-button')).then((button) => {
                                        elements[index].findElement(webdriver.By.tagName('input')).sendKeys(
                                            InputKeys.CLEAR_ALL, renameName
                                        ).then(() => {
                                            return button.click();
                                        }).then(() => {
                                            elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                                                getCRM(driver).then((crm: Array<ScriptNode>) => {
                                                    const element = crm[crm.length - 1];
                                                    
                                                    assert.strictEqual(renameName, element.name,
                                                        'name is the same as expected');
                                                    assert.strictEqual(element.type, 'script',
                                                        'type of element is script');
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
                                                        '}',
                                                        'script value matches expected');
                                                    
                                                    reloadPage(this, driver).then(() => {
                                                        return getCRM(driver);
                                                    })
                                                    .then((crm: Array<ScriptNode>) => {
                                                        const element1 = crm[crm.length - 2];

                                                        assert.isDefined(element1, 'element is defined');
                                                        assert.strictEqual(element1.name, searchEngineName,
                                                            'name is the same as expected');
                                                        assert.strictEqual(element1.type, 'script',
                                                            'type of element is script');
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
                                                            '}',
                                                            'script value matches expected');
                                                        
                                                        const element2 = crm[crm.length - 1];
                                                        assert.strictEqual(element2.name, 'SomeName',
                                                            'name is the same as expected');
                                                        assert.strictEqual(element2.type, 'script',
                                                            'type of element is script');
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
                                                            '}',
                                                            'script2 value matches expected');

                                                        done();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    describe('URIScheme', function(this: MochaFn) {
        before('Reset settings', function() {
            return resetSettings(this, driver);
        });
        this.slow(5000);
        this.timeout(7500);

        function testURIScheme(driver: webdriver.WebDriver,
            done: () => void, toExecutePath: string, schemeName: string) {
                findElement(driver, webdriver.By.className('URISchemeGenerator'))
                    .findElement(webdriver.By.tagName('paper-button'))
                    .click()
                    .then(() => {
                        return driver.executeScript(inlineFn(() => {
                            return JSON.stringify(window.chrome._lastCall);
                        }));
                    })
                    .then((jsonStr: string) => {
                        const lastCall: ChromeLastCall = JSON.parse(jsonStr);
                        assert.isDefined(lastCall, 'a call to the chrome API was made');
                        assert.strictEqual(lastCall.api, 'downloads.download',
                            'chrome downloads API was called');
                        assert.isArray(lastCall.args, 'api args are present');
                        assert.lengthOf(lastCall.args, 1, 'api has only one arg');
                        assert.strictEqual(lastCall.args[0].url,
                            'data:text/plain;charset=utf-8;base64,' + btoa([
                            'Windows Registry Editor Version 5.00',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + ']',
                            '@="URL:' + schemeName +' Protocol"',
                            '"URL Protocol"=""',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
                            '',
                            '[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
                            '@="\\"' + toExecutePath.replace(/\\/g, '\\\\') + '\\""'
                        ].join('\n')),
                            'file content matches expected');
                        assert.strictEqual(lastCall.args[0].filename,
                            schemeName + '.reg', 'filename matches expected');
                        done();
                    });
            }

        afterEach('Reset page settings', function() {
            return resetSettings(this, driver);
        });

        const defaultToExecutePath = 'C:\\files\\my_file.exe';
        const defaultSchemeName = 'myscheme';
        it('should be able to download the default file', function(done)  {
            const toExecutePath = defaultToExecutePath;
            const schemeName = defaultSchemeName;
            testURIScheme(driver, done, toExecutePath, schemeName);
        });
        it('should be able to download when a different file path was entered', function(done)  {
            const toExecutePath = 'somefile.x.y.z';
            const schemeName = defaultSchemeName;
            findElement(driver, webdriver.By.id('URISchemeFilePath'))
                .sendKeys(InputKeys.CLEAR_ALL, toExecutePath)
                .then(() => {
                    testURIScheme(driver, done, toExecutePath, schemeName);
                });
        });
        it('should be able to download when a different scheme name was entered', function(done)  {
            const toExecutePath = defaultToExecutePath;
            const schemeName = getRandomString(25);
            findElement(driver, webdriver.By.id('URISchemeSchemeName'))
                .sendKeys(InputKeys.CLEAR_ALL, schemeName)
                .then(() => {
                    testURIScheme(driver, done, toExecutePath, schemeName);
                });
        });
        it('should be able to download when a different scheme name and a different file path are entered',
            (done) => {
                const toExecutePath = 'somefile.x.y.z';
                const schemeName = getRandomString(25);
                findElement(driver, webdriver.By.id('URISchemeFilePath'))
                    .sendKeys(InputKeys.CLEAR_ALL, toExecutePath)
                    .then(() => {
                        return findElement(driver, webdriver.By.id('URISchemeSchemeName'));
                    })
                    .then((element) => {
                        return element.sendKeys(InputKeys.CLEAR_ALL, schemeName)
                    })
                    .then(() => {
                        testURIScheme(driver, done, toExecutePath, schemeName);
                    });
            });
    });
    */
    function testNameInput(type) {
        var defaultName = 'name';
        describe('Name Input', function () {
            this.timeout(10000);
            this.slow(10000);
            it('should not change when not saved', function (done) {
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
                        .sendKeys(0 /* CLEAR_ALL */, name)
                        .then(function (res) {
                        return wait(driver, 300);
                    }).then(function () {
                        return saveDialog(dialog);
                    }).then(function () {
                        return wait(driver, 300);
                    }).then(function () {
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
                }).then(function (crm) {
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
            this.timeout(15000);
            this.slow(12000);
            it('should not change when not saved', function (done) {
                resetSettings(this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
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
                                    return triggers[0]
                                        .sendKeys(0 /* CLEAR_ALL */, 'www.google.com');
                                })
                                    .then(function () {
                                    return triggers[1]
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
            it('should be addable/editable when saved', function (done) {
                resetSettings(_this, driver).then(function () {
                    return openDialog(driver, type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
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
                                        .findElement(webdriver.By.tagName('paper-input'))
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
            it('should be preserved on page reload', function (done) {
                reloadPage(this, driver).then(function () {
                    return wait(driver, 500);
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
            });
        });
    }
    function testContentTypes(type) {
        describe('Content Types', function () {
            this.timeout(30000);
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            it('should be editable through clicking on the checkboxes', function (done) {
                this.retries(3);
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
                this.retries(3);
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
                this.retries(3);
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
            this.slow(25000);
            [0, 1, 2, 3, 4].forEach(function (triggerOptionIndex) {
                describe("Trigger option " + triggerOptionIndex, function () {
                    this.retries(3);
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
                                wait(driver, 5000);
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
        describe('Theme', function () {
            this.slow(8000);
            this.timeout(10000);
            it('is changable', function (done) {
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
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                    done();
                });
            });
        });
        describe('Zoom', function () {
            this.slow(30000);
            this.timeout(40000);
            var newZoom = '135';
            it('is changable', function (done) {
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
                            return driver.executeScript(inlineFn(function () {
                                (window.app.item.type === 'stylesheet' ?
                                    window.stylesheetEdit :
                                    window.scriptEdit)._updateZoomEl();
                            }));
                        }).then(function () {
                            return wait(driver, 10000, dialog);
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
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                    done();
                });
            });
        });
        describe('UseTabs', function () {
            this.slow(10000);
            this.timeout(12000);
            it('is changable', function (done) {
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
                reloadPage(this, driver).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.isFalse(settings.editor.useTabs, 'useTabs is off');
                    done();
                });
            });
        });
        describe('Tab Size', function () {
            this.slow(15000);
            this.timeout(20000);
            this.retries(3);
            var newTabSize = '8';
            it('is changable and preserved on page reload', function (done) {
                var _this = this;
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
                            return driver.executeScript(inlineFn(function () {
                                (window.app.item.type === 'stylesheet' ?
                                    window.stylesheetEdit :
                                    window.scriptEdit)._updateTabSizeEl();
                            }));
                        });
                    });
                }).then(function () {
                    return getSyncSettings(driver);
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.tabSize, newTabSize, 'tab size has changed to the correct number');
                    reloadPage(_this, driver).then(function () {
                        return getSyncSettings(driver);
                    }).then(function (settings) {
                        assert.strictEqual(settings.editor.tabSize, newTabSize, 'tab size has changed to the correct number');
                        done();
                    });
                });
            });
        });
    }
    describe('CRM Editing', function () {
        before('Reset settings', function () {
            return resetSettings(this, driver);
        });
        this.timeout(60000);
        /*
        describe('Type Switching', function(this: MochaFn) {

            function testTypeSwitch(driver: webdriver.WebDriver, type: string, done: () => void) {
                driver.executeScript(inlineFn(() => {
                    const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
                    crmItem.typeIndicatorMouseOver();
                })).then(() => {
                    return wait(driver, 300);
                }).then(() => {
                    return driver.executeScript(inlineFn(() => {
                        const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
                        const typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.openTypeSwitchContainer();
                    }));;
                }).then(() => {
                    return wait(driver, 300);
                }).then(() => {
                    return driver.executeScript(inlineFn(() => {
                        const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
                        const typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                            .click();
                        return window.app.settings.crm[0].type === 'REPLACE.type';
                    }, {
                        type: type
                    }));
                }).then((typesMatch: boolean) => {
                    assert.isTrue(typesMatch, 'new type matches expected');
                    done();
                });
            }
            this.timeout(10000);
            this.slow(5000);
            
            it('should be able to switch to a script', function(done)  {
                resetSettings(this, driver).then(() => {
                    testTypeSwitch(driver, 'script', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage(this, driver).then(() => {
                    return getCRM(driver);
                }).then((crm) => {
                    assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a menu', function(done)  {
                resetSettings(this, driver).then(() => {
                    testTypeSwitch(driver, 'menu', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage(this, driver).then(() => {
                    return getCRM(driver);
                }).then((crm) => {
                    assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a divider', function(done)  {
                resetSettings(this, driver).then(() => {
                    testTypeSwitch(driver, 'divider', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage(this, driver).then(() => {
                    return getCRM(driver);
                }).then((crm) => {
                    assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a stylesheet', function(done)  {
                resetSettings(this, driver).then(() => {
                    testTypeSwitch(driver, 'stylesheet', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage(this, driver).then(() => {
                    return getCRM(driver);
                }).then((crm) => {
                    assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
                    done();
                });
            });
        });
        describe('Link Dialog', function(this: MochaFn) {
            const type: NodeType = 'link';

            this.timeout(30000);

            before('Reset settings', function() {
                return resetSettings(this, driver);
            });

            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);

            describe('Links', function(this: MochaFn) {
                this.slow(20000);
                this.timeout(25000);

                after('Reset settings', function() {
                    return resetSettings(this, driver);
                });

                it('open in new tab property should be editable', function(done)  {
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, 'link');
                    }).then(() => {
                        return getDialog(driver, 'link')
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('paper-checkbox'))
                            .click()
                            .then(() => {
                                return saveDialog(dialog);
                            })
                            .then(() => {
                                return getCRM(driver);
                            })
                            .then((crm: Array<LinkNode>) => {
                                assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                                assert.isFalse(crm[0].value[0].newTab, 'newTab has been switched off');
                                done();
                            });
                    });
                });
                it('url property should be editable', function(done)  {
                    const newUrl = 'www.google.com';
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, 'link');
                    }).then(() => {
                        return getDialog(driver, 'link')
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('paper-input'))
                            .sendKeys(InputKeys.CLEAR_ALL, newUrl)
                            .then(() => {
                                return saveDialog(dialog);
                            })
                            .then(() => {
                                return getCRM(driver);
                            })
                            .then((crm: Array<LinkNode>) => {
                                assert.lengthOf(crm[0].value, 1, 'node has only 1 link');
                                assert.strictEqual(crm[0].value[0].url, newUrl,
                                    'url has been changed');
                                done();
                            });
                    });
                });
                it('should be addable', function(done)  {
                    const defaultLink = {
                        newTab: true,
                        url: 'https://www.example.com'
                    };
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, 'link');
                    }).then(() => {
                        return getDialog(driver, 'link')
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then((button) => {
                                return button
                                    .click()
                                    .then(() => {
                                        return button.click();
                                    })
                                    .then(() => {
                                        return button.click();
                                    });
                            })
                            .then(() => {
                                return saveDialog(dialog);
                            })
                            .then(() => {
                                return getCRM(driver);
                            })
                            .then((crm: Array<LinkNode>) => {
                                assert.lengthOf(crm[0].value, 4, 'node has 4 links now');
                                assert.deepEqual(crm[0].value,
                                    Array.apply(null, Array(4)).map(_ => defaultLink),
                                    'new links match default link value');
                                done();
                            });
                    });
                });
                it('should be editable when newly added', function(done)  {
                    const newUrl = 'www.google.com';
                    const newValue = {
                        newTab: true,
                        url: newUrl
                    }
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, 'link');
                    }).then(() => {
                        return getDialog(driver, 'link')
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then((button) => {
                                return button
                                    .click()
                                    .then(() => {
                                        return button.click();
                                    })
                                    .then(() => {
                                        return button.click();
                                    });
                            })
                            .then(() => {
                                return wait(driver, 500);
                            })
                            .then(() => {
                                return dialog
                                    .findElements(webdriver.By.className('linkChangeCont'));
                            })
                            .then((elements) => {
                                return forEachPromise(elements, (element) => {
                                    return new webdriver.promise.Promise((resolve) => {
                                        setTimeout(() => {
                                            element
                                                .findElement(webdriver.By.tagName('paper-checkbox'))
                                                .click()
                                                .then(() => {
                                                    return element
                                                        .findElement(webdriver.By.tagName('paper-input'))
                                                        .sendKeys(InputKeys.CLEAR_ALL, newUrl);
                                                }).then(() => {
                                                    resolve(null);
                                                });
                                        }, 250);
                                    });
                                });
                            })
                            .then(() => {
                                return wait(driver, 500);
                            })
                            .then(() => {
                                return saveDialog(dialog);
                            })
                            .then(() => {
                                return getCRM(driver);
                            })
                            .then((crm: Array<LinkNode>) => {
                                assert.lengthOf(crm[0].value, 4, 'node has 4 links now');

                                //Only one newTab can be false at a time
                                const newLinks = Array.apply(null, Array(4))
                                    .map(_ => JSON.parse(JSON.stringify(newValue)));
                                newLinks[3].newTab = false;

                                assert.deepEqual(crm[0].value, newLinks,
                                    'new links match changed link value');
                                done();
                            });
                    });
                });
                it('should be preserved on page reload', function(done) {
                    const newUrl = 'www.google.com';
                    const newValue = {
                        newTab: true,
                        url: newUrl
                    }

                    reloadPage(this, driver).then(() => {
                        return getCRM(driver);
                    }).then((crm) => {
                        assert.lengthOf(crm[0].value, 4, 'node has 4 links now');

                        //Only one newTab can be false at a time
                        const newLinks = Array.apply(null, Array(4))
                            .map(_ => JSON.parse(JSON.stringify(newValue)));
                        newLinks[3].newTab = false;

                        assert.deepEqual(crm[0].value, newLinks,
                            'new links match changed link value');
                        done();
                    });
                });
                it('should not change when not saved', function(done)  {
                    const newUrl = 'www.google.com';
                    const defaultLink = {
                        newTab: true,
                        url: 'https://www.example.com'
                    };
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, 'link');
                    }).then(() => {
                        return getDialog(driver, 'link')
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('changeLink'))
                            .findElement(webdriver.By.tagName('paper-button'))
                            .then((button) => {
                                return button
                                    .click()
                                    .then(() => {
                                        return button.click();
                                    })
                                    .then(() => {
                                        return button.click();
                                    });
                            })
                            .then(() => {
                                return dialog
                                    .findElements(webdriver.By.className('linkChangeCont'));
                            })
                            .then((elements) => {
                                return forEachPromise(elements, (element) => {
                                    return element
                                        .findElement(webdriver.By.tagName('paper-checkbox'))
                                        .click()
                                        .then(() => {
                                            return element
                                                .sendKeys(InputKeys.CLEAR_ALL, newUrl);
                                        })
                                });
                            })
                            .then(() => {
                                return cancelDialog(dialog);
                            })
                            .then(() => {
                                return getCRM(driver);
                            })
                            .then((crm: Array<LinkNode>) => {
                                assert.lengthOf(crm[0].value, 1, 'node still has 1 link');
                                assert.deepEqual(crm[0].value, [defaultLink],
                                    'link value has stayed the same');
                                done();
                            });
                    });
                });
            });
        });
        describe('Divider Dialog', function(this: MochaFn) {
            const type: NodeType = 'divider';

            this.timeout(60000);
            before('Reset settings', function() {
                return resetSettings(this, driver);
            });

            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Menu Dialog', function(this: MochaFn) {
            const type: NodeType = 'menu';

            this.timeout(60000);
            before('Reset settings', function() {
                return resetSettings(this, driver);
            });

            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Stylesheet Dialog', function(this: MochaFn) {
            const type: NodeType = 'stylesheet';

            before('Reset settings', function() {
                return resetSettings(this, driver);
            });

            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);

            describe('Toggling', function(this: MochaFn) {
                this.timeout(15000);
                this.slow(7500);
                it('should be possible to toggle on', (done) => {
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(() => {
                                return saveDialog(dialog);
                            }).then(() => {
                                return getCRM(driver);
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                                done();
                            });
                    });
                });
                it('should be saved on page reload', function(done) {
                    reloadPage(this, driver).then(() => {
                        return getCRM(driver);
                    }).then((crm: Array<StylesheetNode>) => {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                        done();
                    });
                });
                it('should be possible to toggle on-off', (done) => {
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then((slider) => {
                                return slider
                                    .click()
                                    .then(() => {
                                        return slider
                                            .click();
                                    });
                            }).then(() => {
                                return saveDialog(dialog);
                            }).then(() => {
                                return getCRM(driver);
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
                                done();
                            });
                    });
                });
                it('should not be saved on cancel', (done) => {
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(() => {
                                return cancelDialog(dialog);
                            }).then(() => {
                                return getCRM(driver);
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
                                done();
                            });
                    });
                });
            });
            describe('Default State', function(this: MochaFn) {
                this.slow(7500);
                this.timeout(10000);
                it('should be togglable to true', (done) => {
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then((slider) => {
                                return slider
                                    .click();
                            }).then(() => {
                                return dialog
                                    .findElement(webdriver.By.id('isDefaultOnButton'));
                            }).then((slider) => {
                                return slider
                                    .click();
                            }).then(() => {
                                return saveDialog(dialog);
                            }).then(() => {
                                return getCRM(driver);
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                                assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                                done();
                            });
                    });
                });
                it('should be saved on page reset', function(done) {
                    reloadPage(this, driver).then(() => {
                        return getCRM(driver);
                    }).then((crm: Array<StylesheetNode>) => {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                        assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                        done();
                    });
                });
                it('should be togglable to false', (done) => {
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then((slider) => {
                                return slider
                                    .click();
                            }).then(() => {
                                return dialog
                                    .findElement(webdriver.By.id('isDefaultOnButton'));
                            }).then((slider) => {
                                return slider
                                    .click()
                                    .then(() => {
                                        return slider.click();
                                    });
                            }).then(() => {
                                return saveDialog(dialog);
                            }).then(() => {
                                return getCRM(driver);
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                                assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to true');
                                done();
                            });
                    });
                });
                it('should not be saved when cancelled', (done) => {
                    resetSettings(this, driver).then(() => {
                        return openDialog(driver, type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .then((slider) => {
                                return slider
                                    .click();
                            }).then(() => {
                                return dialog
                                    .findElement(webdriver.By.id('isDefaultOnButton'));
                            }).then((slider) => {
                                return slider
                                    .click();
                            }).then(() => {
                                return cancelDialog(dialog);
                            }).then(() => {
                                return getCRM(driver);
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isNotTrue(crm[0].value.toggle, 'toggle option is set to false');
                                assert.isNotTrue(crm[0].value.defaultOn, 'defaultOn is set to false');
                                done();
                            });
                    });
                });
            });
            describe('Editor', function(this: MochaFn) {
                describe('Settings', function(this: MochaFn) {
                    testEditorSettings(type);
                });
            });
        });
        */
        describe('Script Dialog', function () {
            var type = 'script';
            before('Reset settings', function () {
                return resetSettings(this, driver);
            });
            /*
            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);
            */
            describe('Editor', function () {
                /*
                describe('Settings', function(this: MochaFn) {
                    testEditorSettings(type);
                });
                */
                describe('Fullscreen Tools', function () {
                    this.slow(30000);
                    this.timeout(40000);
                    describe('Libraries', function () {
                        var _this = this;
                        afterEach('Close dialog', function (done) {
                            driver.executeScript(inlineFn(function () {
                                document.getElementById('addLibraryDialog').close();
                            })).then(function () {
                                done();
                            });
                        });
                        it('should be possible to add your own library through a URL', function (done) {
                            var tabId = getRandomId();
                            var libName = getRandomString(25);
                            var libUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js';
                            enterEditorFullscreen(_this, driver, type).then(function (dialog) {
                                return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(function () {
                                    return wait(driver, 500, dialog);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.className('addLibrary'))
                                        .click()
                                        .then(function () {
                                        return wait(driver, 500, dialog);
                                    });
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryUrlInput'))
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(0 /* CLEAR_ALL */, libUrl);
                                }).then(function () {
                                    return wait(driver, 500);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 500);
                                }).then(function () {
                                    return webdriver.promise.all([
                                        findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .getProperty('invalid'),
                                        findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                            .getSize()
                                    ]).then(function (_a) {
                                        var isInvalid = _a[0], libSizes = _a[1];
                                        assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                        assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter(function (key) {
                                            return libSizes[key] !== 0;
                                        }).length !== 0, 'Current dialog should be visible');
                                        console.log('tested this first thing');
                                        return findElement(driver, webdriver.By.id('addedLibraryName'))
                                            .findElement(webdriver.By.tagName('input'))
                                            .sendKeys(0 /* CLEAR_ALL */, libName);
                                    });
                                }).then(function () {
                                    return wait(driver, 10000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryButton'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 5000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 5000);
                                }).then(function () {
                                    return findElement(driver, webdriver.By.id('editorFullScreen'))
                                        .click();
                                }).then(function () {
                                    return wait(driver, 5000);
                                }).then(function () {
                                    return saveDialog(dialog);
                                }).then(function () {
                                    return getCRM(driver);
                                }).then(function (crm) {
                                    assert.include(crm[0].value.libraries, {
                                        name: libName,
                                        url: libUrl
                                    }, 'Library was added');
                                    return wait(driver, 200);
                                });
                            }).then(function () {
                                //Get the code that is stored at given test URL
                                return new webdriver.promise.Promise(function (resolve) {
                                    xhr.post(libUrl, function (err, resp) {
                                        assert.ifError(err, 'Should not fail the GET request');
                                        resolve(resp);
                                    });
                                });
                            }).then(function (jqCode) {
                                getContextMenu(driver).then(function (contextMenu) {
                                    driver
                                        .executeScript(inlineFn(function () {
                                        window.chrome._clearExecutedScripts();
                                        return window.chrome._currentContextMenu[0]
                                            .children[0]
                                            .currentProperties.onclick(REPLACE.page, REPLACE.tab);
                                    }, {
                                        page: JSON.stringify({
                                            menuItemId: contextMenu[0].id,
                                            editable: false,
                                            pageUrl: 'www.google.com'
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
                                    })).then(function () {
                                        return driver
                                            .executeScript(inlineFn(function () {
                                            return JSON.stringify(window.chrome._executedScripts);
                                        }));
                                    }).then(function (str) {
                                        var activatedScripts = JSON.parse(str);
                                        assert.include(activatedScripts, {
                                            id: tabId,
                                            code: jqCode
                                        }, 'library was properly executed');
                                        ;
                                        done();
                                    });
                                });
                            });
                        });
                        /*
                        it('should not add a library through url when not saved', (done) => {
                            const libName = getRandomString(25);
                            const libUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js';

                            enterEditorFullscreen(this, driver, type).then((dialog) => {
                                findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(() => {
                                        return wait(driver, 500, dialog);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.className('addLibrary'))
                                            .click()
                                            .then(() => {
                                                return wait(driver, 500, dialog);
                                            });
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryUrlInput'))
                                            .findElement(webdriver.By.tagName('input'))
                                            .sendKeys(InputKeys.CLEAR_ALL, libUrl)
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryButton'))
                                            .click();
                                    }).then(() => {
                                        return webdriver.promise.all([
                                            findElement(driver, webdriver.By.id('addedLibraryName'))
                                                .getProperty('invalid'),
                                            findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                                .getSize()
                                        ]).then(([isInvalid, libSizes]: [boolean, ClientRect]) => {
                                            assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                            assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter((key) => {
                                                return libSizes[key] !== 0;
                                            }).length !== 0, 'Current dialog should be visible');

                                            return findElement(driver, webdriver.By.id('addedLibraryName'))
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(InputKeys.CLEAR_ALL, libName);
                                        });
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryButton'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 2000);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 500);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('editorFullScreen'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 500);
                                    }).then(() => {
                                        return cancelDialog(dialog);
                                    }).then(() => {
                                        return getCRM(driver);
                                    }).then((crm: [ScriptNode]) => {
                                        assert.notInclude(crm[0].value.libraries, {
                                            name: libName,
                                            url: libUrl
                                        }, 'Library was not added');
                                        done();
                                    });
                            });
                        });
                        it('should be possible to add your own library through code', (done) => {
                            const libName = getRandomString(25);
                            const testCode = getRandomString(100);
                            const tabId = getRandomId();

                            enterEditorFullscreen(this, driver, type).then((dialog) => {
                                return findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(() => {
                                        return wait(driver, 500, dialog);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.className('addLibrary'))
                                            .click()
                                            .then(() => {
                                                return wait(driver, 500, dialog);
                                            });
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryManualOption'))
                                            .click();
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryManualInput'))
                                            .findElement(webdriver.By.tagName('textarea'))
                                            .sendKeys(InputKeys.CLEAR_ALL, testCode);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryButton'))
                                            .click();
                                    }).then(() => {
                                        return webdriver.promise.all([
                                            findElement(driver, webdriver.By.id('addedLibraryName'))
                                                .getProperty('invalid'),
                                            findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                                .getSize()
                                        ]).then(([isInvalid, libSizes]: [boolean, ClientRect]) => {
                                            assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                            assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter((key) => {
                                                return libSizes[key] !== 0;
                                            }).length !== 0, 'Current dialog should be visible');

                                            return findElement(driver, webdriver.By.id('addedLibraryName'))
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(InputKeys.CLEAR_ALL, libName);
                                        });
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryButton'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 2000);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 500);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('editorFullScreen'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 500);
                                    }).then(() => {
                                        return saveDialog(dialog);
                                    }).then(() => {
                                        return getCRM(driver);
                                    }).then((crm: [ScriptNode]) => {
                                        assert.include(crm[0].value.libraries, {
                                            name: libName,
                                            url: null
                                        }, 'Library was added');
                                    });
                            }).then(() => {
                                getContextMenu(driver).then((contextMenu) => {
                                    driver
                                        .executeScript(inlineFn(() => {
                                            window.chrome._clearExecutedScripts();
                                            return window.chrome._currentContextMenu[0]
                                                .children[0]
                                                .currentProperties.onclick(
                                                    REPLACE.page, REPLACE.tab
                                                );
                                        }, {
                                            page: JSON.stringify({
                                                menuItemId: contextMenu[0].id,
                                                editable: false,
                                                pageUrl: 'www.google.com'
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
                                        })).then(() => {
                                            return driver
                                                .executeScript(inlineFn(() => {
                                                    return JSON.stringify(window.chrome._executedScripts);
                                                }))
                                        }).then((str: string) => {
                                            const activatedScripts = JSON.parse(str) as ExecutedScripts;

                                            assert.include(activatedScripts, {
                                                id: tabId,
                                                code: testCode
                                            }, 'library was properly executed');;
                                            done();
                                        });
                                });
                            });
                        });
                        it('should not add a library through url when not saved', (done) => {
                            const libName = getRandomString(25);
                            const testCode = getRandomString(100);

                            enterEditorFullscreen(this, driver, type).then((dialog) => {
                                findElement(driver, webdriver.By.id('paperLibrariesSelector'))
                                    .findElement(webdriver.By.id('dropdownSelectedCont'))
                                    .click()
                                    .then(() => {
                                        return wait(driver, 500, dialog);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.className('addLibrary'))
                                            .click()
                                            .then(() => {
                                                return wait(driver, 500, dialog);
                                            });
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryManualOption'))
                                            .click();
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryManualInput'))
                                            .findElement(webdriver.By.tagName('textarea'))
                                            .sendKeys(InputKeys.CLEAR_ALL, testCode);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryButton'))
                                            .click();
                                    }).then(() => {
                                        return webdriver.promise.all([
                                            findElement(driver, webdriver.By.id('addedLibraryName'))
                                                .getProperty('invalid'),
                                            findElement(driver, webdriver.By.id('addLibraryProcessContainer'))
                                                .getSize()
                                        ]).then(([isInvalid, libSizes]: [boolean, ClientRect]) => {
                                            assert.isTrue(isInvalid, 'Name should be marked as invalid');
                                            assert.isTrue(Array.prototype.slice.apply(Object.getOwnPropertyNames(libSizes)).filter((key) => {
                                                return libSizes[key] !== 0;
                                            }).length !== 0, 'Current dialog should be visible');

                                            return findElement(driver, webdriver.By.id('addedLibraryName'))
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(InputKeys.CLEAR_ALL, libName);
                                        });
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryButton'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 2000);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('addLibraryConfirmAddition'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 500);
                                    }).then(() => {
                                        return findElement(driver, webdriver.By.id('editorFullScreen'))
                                            .click();
                                    }).then(() => {
                                        return wait(driver, 500);
                                    }).then(() => {
                                        return cancelDialog(dialog);
                                    }).then(() => {
                                        return getCRM(driver);
                                    }).then((crm: [ScriptNode]) => {
                                        assert.notInclude(crm[0].value.libraries, {
                                            name: libName,
                                            url: testCode
                                        }, 'Library was not added');
                                        done();
                                    });
                            });
                        });
                        */
                    });
                    /*
                    describe('GetPageProperties', function(this: MochaFn) {
                        const pagePropertyPairs = {
                            paperGetPropertySelection: 'crmAPI.getSelection();\n',
                            paperGetPropertyUrl: 'window.location.href;\n',
                            paperGetPropertyHost: 'window.location.host;\n',
                            paperGetPropertyPath: 'window.location.path;\n',
                            paperGetPropertyProtocol: 'window.location.protocol;\n',
                            paperGetPropertyWidth: 'window.innerWidth;\n',
                            paperGetPropertyHeight: 'window.innerHeight;\n',
                            paperGetPropertyPixels: 'window.scrollY;\n',
                            paperGetPropertyTitle: 'document.title;\n'
                        };
                        Object.getOwnPropertyNames(pagePropertyPairs).forEach((prop) => {
                            it(`should be able to insert the ${prop} property`, (done) => {
                                enterEditorFullscreen(this, driver, type).then((dialog) => {
                                    getEditorValue(driver, type).then((prevCode) => {
                                        findElement(driver, webdriver.By.id('paperGetPageProperties'))
                                            .click().then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                findElement(driver, webdriver.By.id(prop))
                                                    .click()
                                                    .then(() => {
                                                        return wait(driver, 500);
                                                    }).then(() => {
                                                        return getEditorValue(driver, type);
                                                    }).then((newCode) => {
                                                        assert.strictEqual(subtractStrings(newCode, prevCode),
                                                            pagePropertyPairs[prop],
                                                            'Added text should match expected');
                                                    }).then(() => {
                                                        return findElement(driver, webdriver.By.id('editorFullScreen'))
                                                            .click();
                                                    }).then(() => {
                                                        return wait(driver, 500);
                                                    }).then(() => {
                                                        return cancelDialog(dialog);
                                                    }).then(() => {
                                                        done();
                                                    });
                                            });
                                    });
                                });
                            });
                        });
                    });
                    describe('Search Website', function(this: MochaFn) {
                        afterEach('Close dialog', (done) => {
                            driver.executeScript(inlineFn(() => {
                                (document.getElementById('paperSearchWebsiteDialog') as any).opened &&
                                (document.getElementById('paperSearchWebsiteDialog') as any).hide();
                            })).then(() => {
                                done();
                            });
                        });

                        describe('Default SearchEngines', function(this: MochaFn){
                            it('should correctly add a search engine script (new tab)', (done) => {
                                enterEditorFullscreen(this, driver, type).then((dialog) => {
                                    getEditorValue(driver, type).then((prevCode) => {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                        .click()
                                        .then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('paperSearchWebsiteDialog'))
                                            .findElement(webdriver.By.id('initialWindow'))
                                            .findElement(webdriver.By.className('buttons'))
                                            .findElement(webdriver.By.css('paper-button:nth-child(2)'))
                                            .click()
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('chooseDefaultSearchWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return getEditorValue(driver, type);
                                        }).then((newCode) => {
                                            console.log(newCode, prevCode);
                                            assert.strictEqual(
                                                subtractStrings(newCode, prevCode),
                                                [
                                                    'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                    'var url = \'https://www.google.com/search?q=%s\';',
                                                    'var toOpen = url.replace(/%s/g,search);',
                                                    'window.open(toOpen, \'_blank\');'
                                                ].join('\n'), 'Added code matches expected');
                                                done();
                                        });
                                    });
                                });
                            });
                            it('should correctly add a search engine script (current tab)', (done) => {
                                enterEditorFullscreen(this, driver, type).then((dialog) => {
                                    getEditorValue(driver, type).then((prevCode) => {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                        .click()
                                        .then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('paperSearchWebsiteDialog'))
                                            .findElement(webdriver.By.id('initialWindow'))
                                            .findElement(webdriver.By.className('buttons'))
                                            .findElement(webdriver.By.css('paper-button:nth-child(2)'))
                                            .click()
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('chooseDefaultSearchWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('howToOpenLink'))
                                                .findElements(webdriver.By.tagName('paper-radio-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return getEditorValue(driver, type);
                                        }).then((newCode) => {
                                            console.log(newCode, prevCode);
                                            assert.strictEqual(
                                                subtractStrings(newCode, prevCode),
                                                [
                                                    'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                    'var url = \'https://www.google.com/search?q=%s\';',
                                                    'var toOpen = url.replace(/%s/g,search);',
                                                    'location.href = toOpen;'
                                                ].join('\n'), 'Added code matches expected');
                                                done();
                                        });
                                    });
                                });
                            });
                        });
                        describe('Custom Input', function(this: MochaFn) {
                            it('should be able to add one from a search URL', (done) => {
                                const exampleSearchURL =
                                    `http://www.${getRandomString(10)}/?${getRandomString(10)}=customRightClickMenu}`;

                                enterEditorFullscreen(this, driver, type).then((dialog) => {
                                    getEditorValue(driver, type).then((prevCode) => {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                        .click()
                                        .then(() => {
                                            return findElement(driver, webdriver.By.id('initialWindowChoicesCont'))
                                                .findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
                                                .click();
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                        }).then(() => {
                                            return wait(driver, 500);
                                        }).then(() => {
                                            getEditorValue(driver, type).then((newCode) => {
                                                assert.strictEqual(subtractStrings(newCode, prevCode),
                                                    [
                                                        'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                        `var url = '${exampleSearchURL.replace('customRightClickMenu', '%s')}';`,
                                                        'var toOpen = url.replace(/%s/g,search);',
                                                        'window.open(toOpen, \'_blank\');'
                                                    ].join('\n'), 'Script should match expected value');
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                            it('should be able to add one from your visited websites', (done) => {
                                const exampleVisitedWebsites: Array<{
                                    name: string;
                                    url: string;
                                    searchUrl: string;
                                }> = [{
                                    name: getRandomString(20),
                                    url: getRandomString(20),
                                    searchUrl: `${getRandomString(20)}%s${getRandomString(10)}`
                                }];

                                enterEditorFullscreen(this, driver, type).then((dialog) => {
                                    getEditorValue(driver, type).then((oldValue) => {
                                        findElement(driver, webdriver.By.id('paperSearchWebsitesToolTrigger'))
                                            .click()
                                            .then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return findElement(driver, webdriver.By.id('initialWindowChoicesCont'))
                                                    .findElement(webdriver.By.css('paper-radio-button:nth-child(2)'))
                                                    .click();
                                            }).then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return findElement(driver, webdriver.By.id('manulInputSavedChoice'))
                                                    .click();
                                            }).then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return driver.executeScript(inlineFn(() => {
                                                    document.querySelector('#manualInputListChoiceInput')
                                                        .querySelector('textarea').value = 'REPLACE.websites';
                                                }, {
                                                    websites: JSON.stringify(exampleVisitedWebsites)
                                                }));
                                            }).then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return findElement(driver, webdriver.By.id('manuallyInputSearchWebsiteWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                            }).then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return findElement(driver, webdriver.By.id('processedListWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                            }).then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return findElement(driver, webdriver.By.id('confirmationWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                            }).then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return findElement(driver, webdriver.By.id('howToOpenWindow'))
                                                .findElement(webdriver.By.className('buttons'))
                                                .findElements(webdriver.By.tagName('paper-button'))
                                                .then((elements) => {
                                                    elements[1].click();
                                                });
                                            }).then(() => {
                                                return wait(driver, 500);
                                            }).then(() => {
                                                return getEditorValue(driver, type);
                                            }).then((newValue) => {
                                                assert.strictEqual(subtractStrings(newValue, oldValue),
                                                    [
                                                        'var search = crmAPI.getSelection() || prompt(\'Please enter a search query\');',
                                                        `var url = '${exampleVisitedWebsites[0].searchUrl}';`,
                                                        'var toOpen = url.replace(/%s/g,search);',
                                                        'window.open(toOpen, \'_blank\');'
                                                    ].join('\n'), 'Added script should match expected');
                                                done();
                                            });
                                    });
                                });
                            });
                        });
                    });
                    */
                });
            });
        });
    });
    describe('Errors', function () {
        this.timeout(60000);
        this.slow(100);
        it('should not have been thrown', function (done) {
            driver
                .executeScript(inlineFn(function () {
                return window.lastError ? {
                    message: window.lastError.message,
                    stack: window.lastError.stack
                } : 'noError';
            })).then(function (result) {
                if (result !== 'noError' &&
                    result.message.indexOf('Object [object global] has no method') !== -1) {
                    console.log(result);
                    assert.ifError(result, 'no errors should be thrown during testing');
                }
                else {
                    assert.ifError(false, 'no errors should be thrown during testing');
                }
                done();
            });
        });
    });
});
/*
describe('On-Page CRM', function(this: MochaFn) {
    describe('Redraws on new CRM', function(this: MochaFn) {
        this.slow(250);
        this.timeout(1500);

        const CRM1 = [
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
        const CRM2 = [
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

        it('should not throw when setting up the CRM', function(done) {
            this.slow(4000);
            this.timeout(5000);
            assert.doesNotThrow(() => {
                resetSettings(this, driver).then(() => {
                    driver
                        .executeScript(inlineFn(() => {
                            window.app.settings.crm = REPLACE.crm;
                            window.app.upload();
                        }, {
                            crm: JSON.stringify(CRM1)
                        })).then(() => {
                            done();
                        });
                });
            }, 'setting up the CRM does not throw');
        })
        it('should be using the first CRM', function(this: MochaFn, done) {
            this.timeout(60000);
            getContextMenu(driver).then((contextMenu) => {
                assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRM1), 'node orders and names match');
                done();
            });
        });
        it('should be able to switch to a new CRM', function(this: MochaFn, done) {
            assert.doesNotThrow(() => {
                driver
                    .executeScript(inlineFn(() => {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: JSON.stringify(CRM2)
                    })).then(() => {
                        done();
                    });
            }, 'settings CRM does not throw');
        });
        it('should be using the new CRM', function(this: MochaFn, done) {
            getContextMenu(driver).then((contextMenu) => {
                assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRM2), 'node orders and names match');
                done();
            });
        });
    });
    describe('Links', function(this: MochaFn) {
        this.slow(150);
        this.timeout(1500);
        const CRMNodes = [
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

        const enum LinkOnPageTest {
            NO_TRIGGERS = 0,
            TRIGGERS = 1,
            DEFAULT_LINKS = 4,
            PRESET_LINKS = 5
        }

        it('should not throw when setting up the CRM', function(done) {
            this.slow(4000);
            this.timeout(5000);
            assert.doesNotThrow(() => {
                resetSettings(this, driver).then(() => {
                    driver
                        .executeScript(inlineFn(() => {
                            window.app.settings.crm = REPLACE.crm;
                            window.app.upload();
                            return true;
                        }, {
                            crm: JSON.stringify(CRMNodes)
                        })).then(() => {
                            done();
                        });
                });
            }, 'setting up the CRM does not throw');
        })
        it('should match the given names and types', (done) => {
            getContextMenu(driver).then((contextMenu) => {
                for (let i = 0; i < CRMNodes.length; i++) {
                    assert.isDefined(contextMenu[i], `node ${i} is defined`);
                    assert.strictEqual(contextMenu[i].currentProperties.title,
                        CRMNodes[i].name, `names for ${i} match`);
                    assert.strictEqual(contextMenu[i].currentProperties.type,
                        'normal', `type for ${i} is normal`);
                }
                done();
            });
        });
        it('should match the given triggers', (done) => {
            getContextMenu(driver).then((contextMenu) => {
                assert.lengthOf(
                    contextMenu[LinkOnPageTest.NO_TRIGGERS].createProperties.documentUrlPatterns,
                    0, 'triggers are turned off');
                assert.deepEqual(contextMenu[LinkOnPageTest.TRIGGERS].createProperties.documentUrlPatterns,
                    CRMNodes[LinkOnPageTest.TRIGGERS].triggers.map((trigger) => {
                        return prepareTrigger(trigger.url);
                    }), 'triggers are turned on');
                done();
            });
        });
        it('should match the given content types', (done) => {
            getContextMenu(driver).then((contextMenu) => {
                for (let i = 0; i < CRMNodes.length; i++) {
                    assert.includeMembers(contextMenu[i].currentProperties.contexts,
                        CRMNodes[i].onContentTypes.map((enabled, index) => {
                            if (enabled) {
                                return getTypeName(index);
                            } else {
                                return null;
                            }
                        }).filter(item => item !== null), `content types for ${i} match`);
                }
                done();
            });
        });
        it('should open the correct links when clicked for the default link', function(this: MochaFn, done) {
            this.timeout(2000);
            const tabId = ~~(Math.random() * 100);
            const windowId = ~~(Math.random() * 100);
            getContextMenu(driver).then((contextMenu) => {
                driver
                    .executeScript(inlineFn(() => {
                        window.chrome._currentContextMenu[0].children[LinkOnPageTest.DEFAULT_LINKS]
                            .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
                        return true;
                    }, {
                        page: JSON.stringify({
                            menuItemId: contextMenu[LinkOnPageTest.DEFAULT_LINKS].id,
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
                    })).then(() => {
                        return driver
                            .executeScript(inlineFn(() => {
                                return JSON.stringify(window.chrome._activeTabs);
                            }));
                    }).then((str: string) => {
                        const activeTabs = JSON.parse(str) as ActiveTabs;
                        const expectedTabs = CRMNodes[LinkOnPageTest.DEFAULT_LINKS].value.map((link) => {
                            if (!link.newTab) {
                                return {
                                    id:	tabId,
                                    data: {
                                        url: sanitizeUrl(link.url)
                                    },
                                    type: 'update'
                                }
                            } else {
                                return {
                                    type: 'create',
                                    data: {
                                        windowId: windowId,
                                        url: sanitizeUrl(link.url),
                                        openerTabId: tabId
                                    }
                                };
                            }
                        }) as ActiveTabs;

                        assert.sameDeepMembers(activeTabs, expectedTabs,
                            'opened tabs match expected');
                        done();
                    });
            });
        });
        it('should open the correct links when clicked for multiple links', (done) => {
            this.timeout(2000);
            const tabId = ~~(Math.random() * 100);
            const windowId = ~~(Math.random() * 100);
            getContextMenu(driver).then((contextMenu) => {
                driver
                    .executeScript(inlineFn(() => {
                        //Clear it without removing object-array-magic-address-linking
                        while (window.chrome._activeTabs.length > 0) {
                            window.chrome._activeTabs.pop();
                        }
                        return window.chrome._currentContextMenu[0].children[LinkOnPageTest.PRESET_LINKS]
                            .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
                    }, {
                        page: JSON.stringify({
                            menuItemId: contextMenu[LinkOnPageTest.PRESET_LINKS].id,
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
                    })).then((result) => {
                        return driver
                            .executeScript(inlineFn(() => {
                                return JSON.stringify(window.chrome._activeTabs);
                            }));
                    }).then((str: string) => {
                        const activeTabs = JSON.parse(str) as ActiveTabs;
                        const expectedTabs = CRMNodes[LinkOnPageTest.PRESET_LINKS].value.map((link) => {
                            if (!link.newTab) {
                                return {
                                    id:	tabId,
                                    data: {
                                        url: sanitizeUrl(link.url)
                                    },
                                    type: 'update'
                                }
                            } else {
                                return {
                                    type: 'create',
                                    data: {
                                        windowId: windowId,
                                        url: sanitizeUrl(link.url),
                                        openerTabId: tabId
                                    }
                                };
                            }
                        }) as ActiveTabs;

                        assert.sameDeepMembers(activeTabs, expectedTabs,
                            'opened tabs match expected');
                        done();
                    });
                });
        });
    });
    describe('Menu & Divider', function(this: MochaFn) {
        const CRMNodes = [
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

        it('should not throw when setting up the CRM', function(done) {
            this.timeout(5000);
            this.slow(4000);
            assert.doesNotThrow(() => {
                resetSettings(this, driver).then(() => {
                    driver
                        .executeScript(inlineFn(() => {
                            window.app.settings.crm = REPLACE.crm;
                            window.app.upload();
                            return true;
                        }, {
                            crm: JSON.stringify(CRMNodes)
                        })).then(() => {
                            done();
                        });
                });
            }, 'setting up the CRM does not throw');
        })
        it('should have the correct structure', function(done) {
            this.slow(400);
            this.timeout(1400);
            getContextMenu(driver).then((contextMenu) => {
                driver
                    .executeScript(inlineFn(() => {
                        return window.logs;
                    }))
                    .then((logs) => {
                        assert.deepEqual(getContextMenuNames(contextMenu), getCRMNames(CRMNodes),
                            'structures match');
                        done();
                    });
            })
        });
    });
    describe('Scripts', function(this: MochaFn) {
        this.slow(900);
        this.timeout(2000);

        const CRMNodes = [
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: CRMLaunchModes.ALWAYS_RUN,
                    script: 'console.log(\'executed script\');'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: CRMLaunchModes.RUN_ON_CLICKING,
                    script: 'console.log(\'executed script\');'
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
                    launchMode: CRMLaunchModes.RUN_ON_SPECIFIED,
                    script: 'console.log(\'executed script\');'
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
                    launchMode: CRMLaunchModes.SHOW_ON_SPECIFIED,
                    script: 'console.log(\'executed script\');'
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
                    launchMode: CRMLaunchModes.RUN_ON_CLICKING,
                    backgroundScript: 'console.log(\'executed backgroundscript\')'
                }
            }),
            templates.getDefaultScriptNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: CRMLaunchModes.DISABLED,
                    script: 'console.log(\'executed script\');'
                }
            })
        ];

        const enum ScriptOnPageTests {
            ALWAYS_RUN = 0,
            RUN_ON_CLICKING = 1,
            RUN_ON_SPECIFIED = 2,
            SHOW_ON_SPECIFIED = 3,
            BACKGROUNDSCRIPT = 4,
            DISABLED = 5
        }

        it('should not throw when setting up the CRM', function(done) {
            this.timeout(5000);
            this.slow(4000);
            assert.doesNotThrow(() => {
                resetSettings(this, driver).then(() => {
                    driver
                        .executeScript(inlineFn(() => {
                            window.app.settings.crm = REPLACE.crm;
                            window.app.upload();
                            return true;
                        }, {
                            crm: JSON.stringify(CRMNodes)
                        })).then(() => {
                            done();
                        });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', (done) => {
            const fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(() => {
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
                    } as any, () => { });
                }, {
                    fakeTabId: fakeTabId
                })).then(() => {
                    return wait(driver, 50);
                }).then(() => {
                    return driver.executeScript(inlineFn(() => {
                        return JSON.stringify(window.chrome._executedScripts)
                    }));
                }).then((str: string) => {
                    const activatedScripts = JSON.parse(str) as ExecutedScripts;

                    assert.lengthOf(activatedScripts, 1, 'one script activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId,
                        'script was executed on right tab');
                    done();
                });
        });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', (done) => {
            const fakeTabId = getRandomId();
            getContextMenu(driver).then((contextMenu) => {
                driver
                    .executeScript(inlineFn(() => {
                        window.chrome._clearExecutedScripts();
                        return window.chrome._currentContextMenu[0]
                            .children[ScriptOnPageTests.RUN_ON_CLICKING]
                            .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
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
                    })).then(() => {
                        return driver
                            .executeScript(inlineFn(() => {
                                return JSON.stringify(window.chrome._executedScripts);
                            }))
                    }).then((str: string) => {
                        const activatedScripts = JSON.parse(str) as ExecutedScripts;
                        assert.lengthOf(activatedScripts, 1, 'one script was activated');
                        assert.strictEqual(activatedScripts[0].id, fakeTabId,
                            'script was executed on the right tab');
                        done();
                    });
            });
        });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', (done) => {
            const fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(() => {
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
                    } as any, () => { });
                }, {
                    fakeTabId: fakeTabId
                })).then(() => {
                    return wait(driver, 50);
                }).then(() => {
                    return driver.executeScript(inlineFn(() => {
                        return JSON.stringify(window.chrome._executedScripts)
                    }));
                }).then((str: string) => {
                    const activatedScripts = JSON.parse(str) as ExecutedScripts;

                    //First one is the ALWAYS_RUN script, ignore that
                    assert.lengthOf(activatedScripts, 2, 'two scripts activated');
                    assert.strictEqual(activatedScripts[1].id, fakeTabId,
                        'new script was executed on right tab');
                    done();
                });
        });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', (done) => {
            const fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(() => {
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
                    } as any, () => { });
                }, {
                    fakeTabId: fakeTabId
                })).then(() => {
                    return getContextMenu(driver);
                }).then((contextMenu) => {
                    assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');

                    return driver
                        .executeScript(inlineFn(() => {
                            window.chrome._clearExecutedScripts();
                            return window.chrome._currentContextMenu[0]
                                .children[1]
                                .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
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
                }).then(() => {
                    return driver
                        .executeScript(inlineFn(() => {
                            return JSON.stringify(window.chrome._executedScripts);
                        }))
                }).then((str: string) => {
                    const activatedScripts = JSON.parse(str) as ExecutedScripts;
                    assert.lengthOf(activatedScripts, 1, 'one script was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId,
                        'script was executed on the right tab');
                    done();
                });
        });
        it('should run the backgroundscript when one is specified', function(done) {
            const fakeTabId = getRandomId();
            getContextMenu(driver).then((contextMenu) => {
                assert.isAbove(contextMenu.length, 1, 'contextmenu contains at least 1 items');

                assert.doesNotThrow(() => {
                    driver
                        .executeScript(inlineFn(() => {
                            return window.chrome._currentContextMenu[0]
                                .children[2]
                                .currentProperties.onclick(
                                    REPLACE.page, REPLACE.tab
                                );
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
                        })).then(() => {
                            return driver
                                .executeScript(inlineFn(() => {
                                    return JSON.stringify(window.chrome._activatedBackgroundPages);
                                }))
                        }).then((str: string) => {
                            const activatedBackgroundScripts = JSON.parse(str) as Array<number>;
                            assert.lengthOf(activatedBackgroundScripts, 1,
                                'one backgroundscript was activated');
                            assert.strictEqual(activatedBackgroundScripts[0],
                                CRMNodes[ScriptOnPageTests.BACKGROUNDSCRIPT].id,
                                'correct backgroundscript was executed');
                            done();
                        });
                }, 'clicking the node does not throw');
            });
        });
        it('should not show the disabled node', (done) => {
            getContextMenu(driver).then((contextMenu) => {
                assert.notInclude(contextMenu.map((item) => {
                    return item.id;
                }), CRMNodes[ScriptOnPageTests.DISABLED].id,
                    'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', (done) => {
            const fakeTabId = getRandomId();
            getContextMenu(driver).then((contextMenu) => {
                driver
                    .executeScript(inlineFn(() => {
                        window.chrome._clearExecutedScripts();
                        return window.chrome._currentContextMenu[0]
                            .children[ScriptOnPageTests.RUN_ON_CLICKING]
                            .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
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
                    })).then(() => {
                        return driver
                            .executeScript(inlineFn(() => {
                                return JSON.stringify(window.chrome._executedScripts);
                            }))
                    }).then((str: string) => {
                        const activatedScripts = JSON.parse(str) as ExecutedScripts;
                        assert.lengthOf(activatedScripts, 1, 'one script was activated');
                        assert.strictEqual(activatedScripts[0].id, fakeTabId,
                            'script was executed on the right tab');
                        assert.include(activatedScripts[0].code,
                            CRMNodes[ScriptOnPageTests.RUN_ON_CLICKING].value.script,
                            'executed code is the same as set code');
                        done();
                    });
            });
        });
    });
    describe('Stylesheets', function(this: MochaFn) {
        this.slow(900);
        this.timeout(2000);

        const CRMNodes = [
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: false,
                    launchMode: CRMLaunchModes.RUN_ON_CLICKING,
                    stylesheet: '#stylesheetTestDummy1 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: true,
                    launchMode: CRMLaunchModes.RUN_ON_CLICKING,
                    stylesheet: '#stylesheetTestDummy2 { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: CRMLaunchModes.ALWAYS_RUN,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: CRMLaunchModes.RUN_ON_CLICKING,
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
                    launchMode: CRMLaunchModes.RUN_ON_SPECIFIED,
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
                    launchMode: CRMLaunchModes.SHOW_ON_SPECIFIED,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: CRMLaunchModes.DISABLED,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }'
                }
            })
        ];

        const enum StylesheetOnPageTests {
            TOGGLE_DEFAULT_OFF = 0,
            TOGGLE_DEFAULT_ON = 1,
            ALWAYS_RUN = 2,
            RUN_ON_CLICKING = 3,
            RUN_ON_SPECIFIED = 4,
            SHOW_ON_SPECIFIED = 5,
            DISABLED = 6
        }

        it('should not throw when setting up the CRM', function(done) {
            this.timeout(5000);
            this.slow(4000);
            assert.doesNotThrow(() => {
                resetSettings(this, driver).then(() => {
                    driver
                        .executeScript(inlineFn(() => {
                            window.app.settings.crm = REPLACE.crm;
                            window.app.upload();
                            return true;
                        }, {
                            crm: JSON.stringify(CRMNodes)
                        })).then(() => {
                            done();
                        });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should always run when launchMode is set to ALWAYS_RUN', (done) => {
            const fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(() => {
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
                    } as any, () => { });
                }, {
                    fakeTabId: fakeTabId
                })).then(() => {
                    return wait(driver, 50);
                }).then(() => {
                    return driver.executeScript(inlineFn(() => {
                        return JSON.stringify(window.chrome._executedScripts)
                    }));
                }).then((str: string) => {
                    const activatedScripts = JSON.parse(str) as ExecutedScripts;

                    //First one is the default on stylesheet, ignore that
                    assert.lengthOf(activatedScripts, 2, 'two stylesheets activated');
                    assert.strictEqual(activatedScripts[1].id, fakeTabId,
                        'stylesheet was executed on right tab');
                    done();
                });
        });
        it('should run on clicking when launchMode is set to RUN_ON_CLICKING', (done) => {
            const fakeTabId = getRandomId();
            getContextMenu(driver).then((contextMenu) => {
                driver
                    .executeScript(inlineFn(() => {
                        window.chrome._clearExecutedScripts();
                        return window.chrome._currentContextMenu[0]
                            .children[2]
                            .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
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
                    })).then(() => {
                        return driver
                            .executeScript(inlineFn(() => {
                                return JSON.stringify(window.chrome._executedScripts);
                            }))
                    }).then((str: string) => {
                        const activatedScripts = JSON.parse(str) as ExecutedScripts;
                        assert.lengthOf(activatedScripts, 1, 'one stylesheet was activated');
                        assert.strictEqual(activatedScripts[0].id, fakeTabId,
                            'stylesheet was executed on the right tab');
                        done();
                    });
            });
        });
        it('should run on specified URL when launchMode is set to RUN_ON_SPECIFIED', (done) => {
            const fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(() => {
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
                    } as any, () => { });
                }, {
                    fakeTabId: fakeTabId
                })).then(() => {
                    return wait(driver, 50);
                }).then(() => {
                    return driver.executeScript(inlineFn(() => {
                        return JSON.stringify(window.chrome._executedScripts)
                    }));
                }).then((str: string) => {
                    const activatedScripts = JSON.parse(str) as ExecutedScripts;

                    //First one is the ALWAYS_RUN stylesheet, second one is the default on one ignore that
                    assert.lengthOf(activatedScripts, 3, 'three stylesheets activated');
                    assert.strictEqual(activatedScripts[2].id, fakeTabId,
                        'new stylesheet was executed on right tab');
                    done();
                });
        });
        it('should show on specified URL when launchMode is set to SHOW_ON_SPECIFIED', function(done) {
            const fakeTabId = getRandomId();
            driver
                .executeScript(inlineFn(() => {
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
                    } as any, () => { });
                }, {
                    fakeTabId: fakeTabId
                })).then(() => {
                    return getContextMenu(driver);
                }).then((contextMenu) => {
                    assert.isAbove(contextMenu.length, 2, 'contextmenu contains at least two items');

                    return driver
                        .executeScript(inlineFn(() => {
                            window.chrome._clearExecutedScripts();
                            return window.chrome._currentContextMenu[0]
                                .children[3]
                                .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
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
                }).then(() => {
                    return driver
                        .executeScript(inlineFn(() => {
                            return JSON.stringify(window.chrome._executedScripts);
                        }))
                }).then((str: string) => {
                    const activatedScripts = JSON.parse(str) as ExecutedScripts;
                    assert.lengthOf(activatedScripts, 1, 'one script was activated');
                    assert.strictEqual(activatedScripts[0].id, fakeTabId,
                        'script was executed on the right tab');
                    done();
                });
        });
        it('should not show the disabled node', (done) => {
            getContextMenu(driver).then((contextMenu) => {
                assert.notInclude(contextMenu.map((item) => {
                    return item.id;
                }), CRMNodes[StylesheetOnPageTests.DISABLED].id,
                    'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', function(done) {
            const fakeTabId = getRandomId();
            getContextMenu(driver).then((contextMenu) => {
                driver
                    .executeScript(inlineFn(() => {
                        window.chrome._clearExecutedScripts();
                        return window.chrome._currentContextMenu[0]
                            .children[2]
                            .currentProperties.onclick(
                                REPLACE.page, REPLACE.tab
                            );
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
                    })).then(() => {
                        return driver
                            .executeScript(inlineFn(() => {
                                return JSON.stringify(window.chrome._executedScripts);
                            }))
                    }).then((str: string) => {
                        const executedScripts = JSON.parse(str) as ExecutedScripts;
                        assert.lengthOf(executedScripts, 1, 'one script was activated');
                        assert.strictEqual(executedScripts[0].id, fakeTabId,
                            'script was executed on the right tab');
                        assert.include(executedScripts[0].code,
                            CRMNodes[StylesheetOnPageTests.RUN_ON_CLICKING].value.stylesheet,
                            'executed code is the same as set code');
                        done();
                    });
            });
        });
        it('should actually be applied to the page', function(done) {
            driver
                .executeScript(inlineFn((args) => {
                    const dummyEl = document.createElement('div');
                    dummyEl.id = 'stylesheetTestDummy';

                    window.dummyContainer.appendChild(dummyEl);
                })).then(() => {
                    return wait(driver, 100);
                }).then(() => {
                    return findElement(driver, webdriver.By.id('stylesheetTestDummy'));
                }).then((dummy) => {
                    return dummy.getSize();
                }).then((dimensions) => {
                    assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                    assert.strictEqual(dimensions.height, 50, 'dummy element is 50px high');
                    done();
                });
        });
        describe('Toggling', function(this: MochaFn) {
            let dummy1: FoundElement;
            let dummy2: FoundElement;

            before('Setting up dummy elements', function(done) {
                driver
                    .executeScript(inlineFn(() => {
                        const dummy1 = document.createElement('div');
                        dummy1.id = 'stylesheetTestDummy1';
                        
                        const dummy2 = document.createElement('div');
                        dummy2.id = 'stylesheetTestDummy2';

                        window.dummyContainer.appendChild(dummy1);
                        window.dummyContainer.appendChild(dummy2);
                    })).then(() => {
                        return wait(driver, 50);
                    }).then(() => {
                        return FoundElementPromise.all([
                            findElement(driver, webdriver.By.id('stylesheetTestDummy1')),
                            findElement(driver, webdriver.By.id('stylesheetTestDummy2'))
                        ]);
                    }).then((results) => {
                        wait(driver, 150).then(() => {
                            dummy1 = results[0];
                            dummy2 = results[1];
                            done();
                        });
                    });
            });
            describe('Default off', function(this: MochaFn) {
                const tabId = getRandomId();
                this.slow(600);
                this.timeout(1600);
                it('should be off by default', (done) => {
                    wait(driver, 150).then(() => {
                        dummy1.getSize().then((dimensions) => {
                            assert.notStrictEqual(dimensions.width, 50,
                                'dummy element is not 50px wide');
                            done();
                        });
                    });
                });
                it('should be on when clicked', (done) => {
                    getContextMenu(driver).then((contextMenu) => {
                        driver.executeScript(inlineFn(() => {
                            return window.chrome._currentContextMenu[0]
                                .children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
                                .currentProperties.onclick(
                                    REPLACE.page, REPLACE.tab
                                );
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
                        }))
                    }).then(() => {
                        return wait(driver, 100);
                    }).then(() => {
                        return dummy1.getSize();
                    }).then((dimensions) => {
                        assert.strictEqual(dimensions.width, 50,
                            'dummy element is 50px wide');
                        done();
                    });
                });
                it('should be off when clicked again', (done) => {
                    getContextMenu(driver).then((contextMenu) => {
                        driver.executeScript(inlineFn(() => {
                            return window.chrome._currentContextMenu[0]
                                .children[StylesheetOnPageTests.TOGGLE_DEFAULT_OFF]
                                .currentProperties.onclick(
                                    REPLACE.page, REPLACE.tab
                                );
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
                        }))
                    }).then(() => {
                        return wait(driver, 100);
                    }).then(() => {
                        return dummy1.getSize();
                    }).then((dimensions) => {
                        assert.notStrictEqual(dimensions.width, 50,
                            'dummy element is not 50px wide');
                        done();
                    });
                });
            });
            describe('Default on', function(this: MochaFn) {
                this.slow(300);
                this.timeout(1500);
                it('should be on by default', (done) => {
                    dummy2.getSize().then((dimensions) => {
                        assert.strictEqual(dimensions.width, 50,
                            'dummy element is 50px wide');
                        done();
                    });
                });
            });
        });
    });
    describe('Errors', function(this: MochaFn) {
        this.timeout(60000);
        this.slow(100);

        it('should not have been thrown', (done) => {
            driver
                .executeScript(inlineFn(() => {
                    return window.lastError ? {
                        message: window.lastError.message,
                        stack: window.lastError.stack
                     } : 'noError';
                })).then((result: 'noError'|{
                    message: string;
                    stack: string;
                }) => {
                    if (result !== 'noError' &&
                        result.message.indexOf('Object [object global] has no method') !== -1) {
                        console.log(result);
                        assert.ifError(result, 'no errors should be thrown during testing');
                    } else {
                        assert.ifError(false, 'no errors should be thrown during testing');
                    }
                    done();
                });
        });
    });
});
*/
after('quit driver', function () {
    console.log('quitting');
    driver.quit();
});
