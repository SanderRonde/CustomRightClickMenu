//TSC-target=ES5
/// <reference path="../tools/definitions/selenium-webdriver.d.ts" />
/// <reference path="../tools/definitions/chai.d.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />
/// <reference path="../tools/definitions/crm.ts" />
"use strict";
var chai = require('chai');
var webdriver = require('selenium-webdriver');
var mochaSteps = require('mocha-steps');
var secrets = require('./UI/secrets');
var btoa = require('btoa');
var assert = chai.assert;
var driver;
before('Driver connect', function (done) {
    this.timeout(60000);
    // Input capabilities
    var capabilities = {
        'browserName': 'Chrome',
        'browser_version': '53.0',
        'os': 'Windows',
        'os_version': '10',
        'resolution': '1920x1080',
        'browserstack.user': secrets.user,
        'browserstack.key': secrets.key,
        'browserstack.local': true,
        'browserstack.debug': process.env.BROWSERSTACK_LOCAL_IDENTIFIER ? false : true,
        'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
    };
    driver = new webdriver.Builder()
        .usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities)
        .build();
    driver.get('http://localhost:1234/test/UI/UITest.html#noClear').then(function () {
        ;
        driver.manage().timeouts().setScriptTimeout(10000);
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
function getSyncSettings() {
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
function getCRM() {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.app.settings.crm);
        })).then(function (str) {
            resolve(JSON.parse(str));
        });
    });
}
function getContextMenu() {
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
        driver
            .findElement(webdriver.By.tagName(type + "-edit"))
            .then(function (element) {
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
        else if (randomNum <= 36) {
            return String.fromCharCode(randomNum + 87);
        }
        else {
            return String.fromCharCode(randomNum + 49);
        }
    }).join('');
}
function resetSettings(_this, done) {
    _this.timeout(30000);
    var promise = new webdriver.promise.Promise(function (resolve) {
        driver.executeScript(inlineFn(function () {
            window.chrome.storage.local.clear();
            window.chrome.storage.sync.clear();
            return true;
        })).then(function (result) {
            return driver.get('http://localhost:1234/test/UI/UITest.html#noClear');
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
function reloadPage(_this, done) {
    _this.timeout(30000);
    var promise = new webdriver.promise.Promise(function (resolve) {
        driver
            .get('http://localhost:1234/test/UI/UITest.html#noClear')
            .then(function () {
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
function openDialogAndReload(done) {
    reloadPage.apply(this, [function () {
            driver.findElement(webdriver.By.tagName('edit-crm-item')).click().then(function () {
                setTimeout(done, 500);
            });
        }]);
}
function switchToTypeAndOpen(type, done) {
    driver.executeScript(inlineFn(function () {
        var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
        var typeSwitcher = crmItem.querySelector('type-switcher').changeType('REPLACE.type');
        return true;
    }, {
        type: type
    })).then(function () {
        return wait(100);
    }).then(function () {
        return driver.executeScript(inlineFn(function () {
            document.getElementsByTagName('edit-crm-item').item(0).openEditPage();
        }));
    }).then(function () {
        return wait(500);
    }).then(function () {
        done();
    });
}
function openDialog(type) {
    return new webdriver.promise.Promise(function (resolve) {
        if (type === 'link') {
            driver.findElement(webdriver.By.tagName('edit-crm-item')).click().then(function () {
                setTimeout(resolve, 500);
            });
        }
        else {
            switchToTypeAndOpen(type, resolve);
        }
    });
}
function wait(time, resolveParam) {
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
function inlineFn(fn, args) {
    if (args === void 0) { args = {}; }
    var str = "return (" + fn.toString() + ")(arguments)";
    Object.getOwnPropertyNames(args).forEach(function (key) {
        if (typeof args[key] === 'string' && args[key].split('\n').length > 1) {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), "' + " + JSON.stringify(args[key].split('\n')) + ".join('\\n') + '");
        }
        else {
            str = str.replace(new RegExp("REPLACE." + key, 'g'), args[key]);
        }
    });
    return str;
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
        this.timeout(20000);
        this.slow(10000);
        var checkboxDefaults = {
            showOptions: true,
            recoverUnsavedData: false,
            CRMOnPage: true,
            useStorageSync: true
        };
        Object.getOwnPropertyNames(checkboxDefaults).forEach(function (checkboxId, index) {
            it(checkboxId + " should be clickable", function (done) {
                driver
                    .findElement(webdriver.By.id(checkboxId))
                    .findElement(webdriver.By.tagName('paper-checkbox'))
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
            it(checkboxId + " should be saved", function (done) {
                reloadPage(this).then(function () {
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
        this.timeout(20000);
        this.slow(10000);
        var searchEngineLink = '';
        var defaultLinkName = '';
        before('Reset settings', function () {
            return resetSettings(this);
        });
        it('should be addable', function (done) {
            this.timeout(10000);
            driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
                elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                    elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM().then(function (crm) {
                                searchEngineLink = link;
                                defaultLinkName = name;
                                var element = crm[crm.length - 1];
                                assert.strictEqual(element.name, name, 'name is the same as expected');
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
            driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
                elements[0].findElement(webdriver.By.tagName('paper-button')).then(function (button) {
                    elements[0].findElement(webdriver.By.tagName('input')).sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name).then(function () {
                        return button.click();
                    }).then(function () {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM().then(function (crm) {
                                var element = crm[crm.length - 1];
                                assert.strictEqual(element.name, name, 'name is the same as expected');
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
            reloadPage(this).then(function () {
                return getCRM();
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
        this.timeout(5000);
        this.slow(5000);
        var searchEngineLink = '';
        var searchEngineName = '';
        before('Reset settings', function () {
            return resetSettings(this);
        });
        it('should be addable', function (done) {
            driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
                var index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                    elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM().then(function (crm) {
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
            driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
                var index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).then(function (button) {
                    elements[index].findElement(webdriver.By.tagName('input')).sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name).then(function () {
                        return button.click();
                    }).then(function () {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                            getCRM().then(function (crm) {
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
            reloadPage(this).then(function () {
                return getCRM();
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
            return resetSettings(this);
        });
        function testURIScheme(driver, done, toExecutePath, schemeName) {
            driver
                .findElement(webdriver.By.className('URISchemeGenerator'))
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
            return resetSettings(this);
        });
        var defaultToExecutePath = 'C:\\files\\my_file.exe';
        var defaultSchemeName = 'myscheme';
        it('should be able to download the default file', function (done) {
            var toExecutePath = defaultToExecutePath;
            var schemeName = defaultSchemeName;
            testURIScheme(driver, done, toExecutePath, schemeName);
        });
        it('should be able to download when a different file path was entered', function (done) {
            var toExecutePath = 'Z:\\a\\b\\c\\d\\e\\something.test';
            var schemeName = defaultSchemeName;
            driver
                .findElement(webdriver.By.id('URISchemeFilePath'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, toExecutePath)
                .then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
        it('should be able to download when a different scheme name was entered', function (done) {
            var toExecutePath = defaultToExecutePath;
            var schemeName = getRandomString(25);
            driver
                .findElement(webdriver.By.id('URISchemeSchemeName'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, schemeName)
                .then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
        it('should be able to download when a different scheme name and a different file path are entered', function (done) {
            var toExecutePath = 'Z:\\a\\b\\c\\d\\e\\something.test';
            var schemeName = getRandomString(25);
            driver
                .findElement(webdriver.By.id('URISchemeFilePath'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, toExecutePath)
                .then(function () {
                return driver
                    .findElement(webdriver.By.id('URISchemeSchemeName'))
                    .findElement(webdriver.By.tagName('input'));
            })
                .then(function (element) {
                return element.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, schemeName);
            })
                .then(function () {
                testURIScheme(driver, done, toExecutePath, schemeName);
            });
        });
    });
    function testNameInput(type) {
        var defaultName = 'name';
        describe('Name Input', function () {
            this.timeout(30000);
            this.slow(20000);
            after('Reset settings', function () {
                return resetSettings(this);
            });
            it('should not change when not saved', function (done) {
                this.slow(12000);
                before('Reset settings', function () {
                    return resetSettings(this);
                });
                var name = getRandomString(25);
                resetSettings(this).then(function () {
                    return openDialog(type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM();
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
                    return resetSettings(this);
                });
                resetSettings(this).then(function () {
                    return openDialog(type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM();
                    })
                        .then(function (crm) {
                        assert.strictEqual(crm[0].type, type, 'type is link');
                        assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                        done();
                    });
                });
            });
            it('should be saved when changed', function (done) {
                reloadPage(this)
                    .then(function () {
                    return getCRM();
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
            this.timeout(30000);
            this.slow(150000);
            after('Reset settings', function () {
                return resetSettings(this);
            });
            it('should not change when not saved', function (done) {
                resetSettings(this).then(function () {
                    return openDialog(type);
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
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                })
                                    .then(function () {
                                    return triggers[1]
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                });
                            }).then(function () {
                                return cancelDialog(dialog);
                            }).then(function () {
                                return getCRM();
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
                resetSettings(_this).then(function () {
                    return openDialog(type);
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
                                        .findElement(webdriver.By.tagName('input'))
                                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                });
                            }).then(function () {
                                return saveDialog(dialog);
                            }).then(function () {
                                return getCRM();
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
                reloadPage(this).then(function () {
                    return getCRM();
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
                return resetSettings(this);
            });
            it('should be editable through clicking on the checkboxes', function (done) {
                resetSettings(this).then(function () {
                    return openDialog('link');
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
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM();
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
                resetSettings(this).then(function () {
                    return openDialog('link');
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
                        return getCRM();
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
                resetSettings(this).then(function () {
                    return openDialog('link');
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
                        return getCRM();
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
                reloadPage(this).then(function () {
                    return getCRM();
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
                resetSettings(this).then(function () {
                    return openDialog('link');
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
                        return getCRM();
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
                        resetSettings(this).then(function () {
                            return openDialog(type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(500, dialog);
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(1500);
                            }).then(function () {
                                return saveDialog(dialog);
                            }).then(function () {
                                return getCRM();
                            }).then(function (crm) {
                                assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                                done();
                            });
                        });
                    });
                    it('should be saved on page reload', function (done) {
                        reloadPage(this).then(function () {
                            return getCRM();
                        }).then(function (crm) {
                            assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex, 'launchmode is the same as expected');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', function (done) {
                        resetSettings(this).then(function () {
                            return openDialog(type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(500, dialog);
                            ;
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(1500);
                            }).then(function () {
                                return cancelDialog(dialog);
                            }).then(function () {
                                return getCRM();
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
                        resetSettings(_this).then(function () {
                            return openDialog(type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(500, dialog);
                            ;
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(1000);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(1000);
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
                                                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                        });
                                    }).then(function () {
                                        return saveDialog(dialog);
                                    }).then(function () {
                                        return getCRM();
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
                        getCRM().then(function (crm) {
                            assert.lengthOf(crm[0].triggers, 3, 'trigger has been added');
                            assert.isTrue(crm[0].triggers[0].not, 'first trigger is NOT');
                            assert.isFalse(crm[0].triggers[1].not, 'second trigger is not NOT');
                            assert.strictEqual(crm[0].triggers[0].url, '*://*.example.com/*', 'first trigger url stays the same');
                            assert.strictEqual(crm[0].triggers[1].url, 'www.google.com', 'second trigger url changed');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', function (done) {
                        resetSettings(_this).then(function () {
                            return openDialog(type);
                        }).then(function () {
                            return getDialog(driver, type);
                        }).then(function (dialog) {
                            return wait(500, dialog);
                            ;
                        }).then(function (dialog) {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(function () {
                                wait(500);
                            })
                                .then(function () {
                                return dialog
                                    .findElements(webdriver.By.css('.stylesheetLaunchOption, .scriptLaunchOption'));
                            }).then(function (triggerOptions) {
                                return triggerOptions[triggerOptionIndex].click();
                            }).then(function () {
                                wait(1000);
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
                                                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                        });
                                    }).then(function () {
                                        return cancelDialog(dialog);
                                    }).then(function () {
                                        return getCRM();
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
            resetSettings(this).then(function () {
                return openDialog(type);
            }).then(function () {
                return getDialog(driver, type);
            }).then(function (dialog) {
                return wait(500, dialog);
                ;
            }).then(function (dialog) {
                return dialog
                    .findElement(webdriver.By.id('editorSettings'))
                    .click()
                    .then(function () {
                    return wait(500);
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
                resetSettings(this).then(function () {
                    return openDialog(type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorThemeSettingWhite'))
                            .click();
                    });
                }).then(function () {
                    return getSyncSettings();
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.theme, 'white', 'theme has been switched to white');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this).then(function () {
                    return getSyncSettings();
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
                resetSettings(this).then(function () {
                    return openDialog(type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .then(function (editorSettings) {
                        editorSettings
                            .click()
                            .then(function () {
                            return wait(500);
                        })
                            .then(function () {
                            return dialog
                                .findElement(webdriver.By.id('editorThemeFontSizeInput'))
                                .findElement(webdriver.By.tagName('input'))
                                .sendKeys(webdriver.Key.BACK_SPACE, webdriver.Key.BACK_SPACE, webdriver.Key.BACK_SPACE, newZoom);
                        }).then(function () {
                            //Click the cogwheel to click "somewhere" to remove focus
                            return editorSettings.click();
                        }).then(function () {
                            return wait(500, dialog);
                        });
                    });
                }).then(function () {
                    return getSyncSettings();
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this).then(function () {
                    return getSyncSettings();
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.zoom, newZoom, 'zoom has changed to the correct number');
                    done();
                });
            });
        });
        describe('UseTabs', function () {
            it('is changable', function (done) {
                this.slow(17000);
                resetSettings(this).then(function () {
                    return openDialog(type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorTabsOrSpacesCheckbox'))
                            .findElement(webdriver.By.tagName('paper-checkbox'))
                            .click();
                    });
                }).then(function () {
                    return getSyncSettings();
                }).then(function (settings) {
                    assert.isFalse(settings.editor.useTabs, 'useTabs is off');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this).then(function () {
                    return getSyncSettings();
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
                resetSettings(this).then(function () {
                    return openDialog(type);
                }).then(function () {
                    return getDialog(driver, type);
                }).then(function (dialog) {
                    return wait(500, dialog);
                }).then(function (dialog) {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(function () {
                        return wait(500);
                    })
                        .then(function () {
                        return dialog
                            .findElement(webdriver.By.id('editorTabSizeInput'))
                            .findElement(webdriver.By.tagName('input'))
                            .sendKeys(webdriver.Key.BACK_SPACE, webdriver.Key.BACK_SPACE, webdriver.Key.NULL, webdriver.Key.DELETE, webdriver.Key.DELETE, newTabSize)
                            .then(function () {
                            //Click "some" element to un-focus the input
                            return dialog
                                .findElement(webdriver.By.id('editorSettings'))
                                .click();
                        });
                    });
                }).then(function () {
                    return getSyncSettings();
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.tabSize, newTabSize, 'tab size has changed to the correct number');
                    done();
                });
            });
            it('is preserved on page reload', function (done) {
                this.slow(6000);
                reloadPage(this).then(function () {
                    return getSyncSettings();
                }).then(function (settings) {
                    assert.strictEqual(settings.editor.tabSize, newTabSize, 'tab size has changed to the correct number');
                    done();
                });
            });
        });
    }
    describe('CRM Editing', function () {
        before('Reset settings', function () {
            return resetSettings(this);
        });
        describe('Type Switching', function () {
            function testTypeSwitch(driver, type, done) {
                driver.executeAsyncScript(inlineFn(function (args) {
                    var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                    crmItem.typeIndicatorMouseOver();
                    window.setTimeout(function () {
                        var typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.openTypeSwitchContainer();
                        window.setTimeout(function () {
                            typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                                .click();
                            args[0](window.app.settings.crm[0].type === 'REPLACE.type');
                        }, 300);
                    }, 300);
                }, {
                    type: type
                })).then(function (typesMatch) {
                    assert.isTrue(typesMatch, 'new type matches expected');
                    done();
                });
            }
            this.timeout(20000);
            this.slow(7000);
            it('should be able to switch to a script', function (done) {
                resetSettings(this).then(function () {
                    testTypeSwitch(driver, 'script', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this).then(function () {
                    return getCRM();
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a menu', function (done) {
                resetSettings(this).then(function () {
                    testTypeSwitch(driver, 'menu', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this).then(function () {
                    return getCRM();
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a divider', function (done) {
                resetSettings(this).then(function () {
                    testTypeSwitch(driver, 'divider', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this).then(function () {
                    return getCRM();
                }).then(function (crm) {
                    assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a stylesheet', function (done) {
                resetSettings(this).then(function () {
                    testTypeSwitch(driver, 'stylesheet', done);
                });
            });
            it('should be preserved', function (done) {
                reloadPage(this).then(function () {
                    return getCRM();
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
                return resetSettings(this);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
            describe('Links', function () {
                this.slow(22500);
                after('Reset settings', function () {
                    return resetSettings(this);
                });
                it('open in new tab property should be editable', function (done) {
                    resetSettings(this).then(function () {
                        return openDialog('link');
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
                            return getCRM();
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
                    resetSettings(this).then(function () {
                        return openDialog('link');
                    }).then(function () {
                        return getDialog(driver, 'link');
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('input'))
                            .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl)
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM();
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
                    resetSettings(this).then(function () {
                        return openDialog('link');
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
                            return getCRM();
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
                    resetSettings(this).then(function () {
                        return openDialog('link');
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
                            return wait(500);
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
                                                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl);
                                        }).then(function () {
                                            resolve(null);
                                        });
                                    }, 250);
                                });
                            });
                        })
                            .then(function () {
                            return wait(500);
                        })
                            .then(function () {
                            return saveDialog(dialog);
                        })
                            .then(function () {
                            return getCRM();
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
                    reloadPage(this).then(function () {
                        return getCRM();
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
                    resetSettings(this).then(function () {
                        return openDialog('link');
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
                                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl);
                                });
                            });
                        })
                            .then(function () {
                            return cancelDialog(dialog);
                        })
                            .then(function () {
                            return getCRM();
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
                return resetSettings(this);
            });
            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Menu Dialog', function () {
            var type = 'menu';
            this.timeout(30000);
            before('Reset settings', function () {
                return resetSettings(this);
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
                return resetSettings(this);
            });
            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);
            describe('Toggling', function () {
                var _this = this;
                it('should be possible to toggle on', function (done) {
                    resetSettings(_this).then(function () {
                        return openDialog(type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(function () {
                            return saveDialog(dialog);
                        }).then(function () {
                            return getCRM();
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                            done();
                        });
                    });
                });
                it('should be saved on page reload', function (done) {
                    reloadPage(this).then(function () {
                        return getCRM();
                    }).then(function (crm) {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                        done();
                    });
                });
                it('should be possible to toggle on-off', function (done) {
                    resetSettings(_this).then(function () {
                        return openDialog(type);
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
                            return getCRM();
                        }).then(function (crm) {
                            assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
                            done();
                        });
                    });
                });
                it('should not be saved on cancel', function (done) {
                    resetSettings(_this).then(function () {
                        return openDialog(type);
                    }).then(function () {
                        return getDialog(driver, type);
                    }).then(function (dialog) {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(function () {
                            return cancelDialog(dialog);
                        }).then(function () {
                            return getCRM();
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
                    resetSettings(_this).then(function () {
                        return openDialog(type);
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
                            return getCRM();
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                            assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                            done();
                        });
                    });
                });
                it('should be saved on page reset', function (done) {
                    reloadPage(this).then(function () {
                        return getCRM();
                    }).then(function (crm) {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                        assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                        done();
                    });
                });
                it('should be togglable to false', function (done) {
                    resetSettings(_this).then(function () {
                        return openDialog(type);
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
                            return getCRM();
                        }).then(function (crm) {
                            assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                            assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to true');
                            done();
                        });
                    });
                });
                it('should not be saved when cancelled', function (done) {
                    resetSettings(_this).then(function () {
                        return openDialog(type);
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
                            return getCRM();
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
                return resetSettings(this);
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
        this.timeout(10000);
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
describe('On-Page CRM', function () {
    this.slow(200);
    this.timeout(2000);
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
                resetSettings(_this).then(function () {
                    driver
                        .executeScript(inlineFn(function () {
                        window.app.settings.crm = REPLACE.crm;
                        window.app.upload();
                        return true;
                    }, {
                        crm: JSON.stringify(CRM1)
                    })).then(function () {
                        done();
                    });
                });
            }, 'setting up the CRM does not throw');
        });
        it('should be using the first CRM', function (done) {
            getContextMenu().then(function (contextMenu) {
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
            getContextMenu().then(function (contextMenu) {
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
        this.timeout(2500);
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
                resetSettings(_this).then(function () {
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
            getContextMenu().then(function (contextMenu) {
                for (var i = 0; i < CRMNodes.length; i++) {
                    assert.isDefined(contextMenu[i], "node " + i + " is defined");
                    assert.strictEqual(contextMenu[i].currentProperties.title, CRMNodes[i].name, "names for " + i + " match");
                    assert.strictEqual(contextMenu[i].currentProperties.type, 'normal', "type for " + i + " is normal");
                }
                done();
            });
        });
        it('should match the given triggers', function (done) {
            getContextMenu().then(function (contextMenu) {
                assert.lengthOf(contextMenu[0 /* NO_TRIGGERS */].createProperties.documentUrlPatterns, 0, 'triggers are turned off');
                assert.deepEqual(contextMenu[1 /* TRIGGERS */].createProperties.documentUrlPatterns, CRMNodes[1 /* TRIGGERS */].triggers.map(function (trigger) {
                    return prepareTrigger(trigger.url);
                }), 'triggers are turned on');
                done();
            });
        });
        it('should match the given content types', function (done) {
            getContextMenu().then(function (contextMenu) {
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
            getContextMenu().then(function (contextMenu) {
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
            getContextMenu().then(function (contextMenu) {
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
                resetSettings(_this).then(function () {
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
            getContextMenu().then(function (contextMenu) {
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
        this.slow(2000);
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
                resetSettings(_this).then(function () {
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
                return wait(50);
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
            getContextMenu().then(function (contextMenu) {
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
                return wait(50);
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
                return getContextMenu();
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
            getContextMenu().then(function (contextMenu) {
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
            getContextMenu().then(function (contextMenu) {
                assert.notInclude(contextMenu.map(function (item) {
                    return item.id;
                }), CRMNodes[5 /* DISABLED */].id, 'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', function (done) {
            var fakeTabId = getRandomId();
            getContextMenu().then(function (contextMenu) {
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
        this.timeout(5000);
        this.slow(2000);
        var CRMNodes = [
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: false,
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    stylesheet: '#stylesheetTestDummy1 { width: 50px; height :50px; } /*1*/'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    toggle: true,
                    defaultOn: true,
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    stylesheet: '#stylesheetTestDummy2 { width: 50px; height :50px; }/*2*/'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 1 /* ALWAYS_RUN */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }/*3*/'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 0 /* RUN_ON_CLICKING */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }/*4*/'
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
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }/*5*/'
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
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }/*6*/'
                }
            }),
            templates.getDefaultStylesheetNode({
                name: getRandomString(25),
                id: getRandomId(),
                value: {
                    launchMode: 4 /* DISABLED */,
                    stylesheet: '#stylesheetTestDummy { width: 50px; height :50px; }/*7*/'
                }
            })
        ];
        it('should not throw when setting up the CRM', function (done) {
            var _this = this;
            this.slow(8000);
            assert.doesNotThrow(function () {
                resetSettings(_this).then(function () {
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
                return wait(50);
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
            getContextMenu().then(function (contextMenu) {
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
                return wait(50);
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
                return getContextMenu();
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
            getContextMenu().then(function (contextMenu) {
                assert.notInclude(contextMenu.map(function (item) {
                    return item.id;
                }), CRMNodes[6 /* DISABLED */].id, 'disabled node is not in the right-click menu');
                done();
            });
        });
        it('should run the correct code when clicked', function (done) {
            this.slow(4000);
            var fakeTabId = getRandomId();
            getContextMenu().then(function (contextMenu) {
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
                return wait(100);
            }).then(function () {
                return driver.findElement(webdriver.By.id('stylesheetTestDummy'));
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
                    return wait(50);
                }).then(function () {
                    return webdriver.promise.all([
                        driver.findElement(webdriver.By.id('stylesheetTestDummy1')),
                        driver.findElement(webdriver.By.id('stylesheetTestDummy2'))
                    ]);
                }).then(function (results) {
                    wait(150).then(function () {
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
                    wait(150).then(function () {
                        dummy1.getSize().then(function (dimensions) {
                            assert.strictEqual(dimensions.width, 0, 'dummy element is 0px wide');
                            done();
                        });
                    });
                });
                it('should be on when clicked', function (done) {
                    getContextMenu().then(function (contextMenu) {
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
                        return wait(100);
                    }).then(function () {
                        return dummy1.getSize();
                    }).then(function (dimensions) {
                        assert.strictEqual(dimensions.width, 50, 'dummy element is 50px wide');
                        done();
                    });
                });
                it('should be off when clicked again', function (done) {
                    getContextMenu().then(function (contextMenu) {
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
                        return wait(100);
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
