/// <reference path="../tools/definitions/selenium-webdriver.d.ts" />
/// <reference path="../tools/definitions/chai.d.ts" />
/// <reference path="../tools/definitions/chrome.d.ts" />
"use strict";
;
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
    _this.timeout(15000);
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
function reloadPage(done) {
    this.timeout(15000);
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
function wait(time) {
    return driver.wait(new webdriver.promise.Promise(function (resolve) {
        setTimeout(resolve, time);
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
/*
describe('Page', function(this: MochaFn) {
    describe('Loading', function(this: MochaFn) {
        this.timeout(5000);
        this.slow(2000);

        it('should happen without errors', function(done)  {
            driver
                .executeScript(inlineFn(() => {
                    return window.lastError ? window.lastError : 'noError';
                })).then((result) => {
                    assert.ifError(result !== 'noError' ? result : false,
                        'no errors should be thrown when loading');
                    done();
                });
        });
    });
    describe('CheckboxOptions', function(this: MochaFn) {
        this.timeout(10000);
        this.slow(6000);
        const checkboxDefaults = {
            showOptions: true,
            recoverUnsavedData: false,
            CRMOnPage: true,
            useStorageSync: true
        };
        Object.getOwnPropertyNames(checkboxDefaults).forEach((checkboxId, index) => {
            it(`${checkboxId} should be clickable`, (done) => {
                driver
                    .findElement(webdriver.By.id(checkboxId))
                    .findElement(webdriver.By.tagName('paper-checkbox'))
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
            it(`${checkboxId} should be saved`, function(done) {
                reloadPage().then(() => {
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
        this.timeout(5000);
        this.slow(5000);
        let searchEngineLink = '';
        let defaultLinkName = '';

        before('Reset settings', function() {
            resetSettings(this);
        });
        it('should be addable', function(done)  {
            driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
                elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
                    elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                            getCRM().then((crm: Array<LinkNode>) => {
                                searchEngineLink = link;
                                defaultLinkName = name;

                                const element = crm[crm.length - 1];

                                assert.strictEqual(element.name, name,
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
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be renamable', function(done)  {
            const name = 'SomeName';
            driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
                elements[0].findElement(webdriver.By.tagName('paper-button')).then((button) => {
                    elements[0].findElement(webdriver.By.tagName('input')).sendKeys(
                        webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name
                    ).then(() => {
                        return button.click();
                    }).then(() => {
                        elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                            getCRM().then((crm: Array<LinkNode>) => {
                                const element = crm[crm.length - 1];

                                assert.strictEqual(element.name, name,
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
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be saved', function(done) {
            reloadPage().then(() => {
                return getCRM();
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
    describe('SearchEngines', function(this: MochaFn) {
        this.timeout(5000);
        this.slow(5000);
        let searchEngineLink = '';
        let searchEngineName = '';

        before('Reset settings', function() {
            resetSettings(this);
        });

        it('should be addable', function(done)  {
            driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
                const index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(() => {
                    elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then((name) => {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                            getCRM().then((crm: Array<ScriptNode>) => {
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
                                    '}\n',
                                    'script value matches expected');
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be renamable', function(done)  {
            const name = 'SomeName';
            driver.findElements(webdriver.By.tagName('default-link')).then((elements) => {
                const index = elements.length - 1;
                elements[index].findElement(webdriver.By.tagName('paper-button')).then((button) => {
                    elements[index].findElement(webdriver.By.tagName('input')).sendKeys(
                        webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name
                    ).then(() => {
                        return button.click();
                    }).then(() => {
                        elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then((link) => {
                            getCRM().then((crm: Array<ScriptNode>) => {
                                const element = crm[crm.length - 1];
                                
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
                                    '}\n',
                                    'script value matches expected');
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('should be saved on page reload', function(done) {
            reloadPage().then(() => {
                return getCRM();
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
                    '}\n',
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
                    '}\n',
                    'script value matches expected');

                done();
            });
        });
    });
    describe('URIScheme', function(this: MochaFn) {

        before('Reset settings', function() {
            resetSettings(this);
        });

        function testURIScheme(driver: webdriver.WebDriver,
            done: () => void, toExecutePath: string, schemeName: string) {
                driver
                    .findElement(webdriver.By.className('URISchemeGenerator'))
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

        this.slow(7000);
        this.timeout(50000);
        afterEach('Reset page settings', function() {
            resetSettings(this);
        });

        const defaultToExecutePath = 'C:\\files\\my_file.exe';
        const defaultSchemeName = 'myscheme';
        it('should be able to download the default file', function(done)  {
            const toExecutePath = defaultToExecutePath;
            const schemeName = defaultSchemeName;
            testURIScheme(driver, done, toExecutePath, schemeName);
        });
        it('should be able to download when a different file path was entered', function(done)  {
            const toExecutePath = 'Z:\\a\\b\\c\\d\\e\\something.test';
            const schemeName = defaultSchemeName;
            driver
                .findElement(webdriver.By.id('URISchemeFilePath'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, toExecutePath)
                .then(() => {
                    testURIScheme(driver, done, toExecutePath, schemeName);
                });
        });
        it('should be able to download when a different scheme name was entered', function(done)  {
            const toExecutePath = defaultToExecutePath;
            const schemeName = getRandomString(25);
            driver
                .findElement(webdriver.By.id('URISchemeSchemeName'))
                .findElement(webdriver.By.tagName('input'))
                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, schemeName)
                .then(() => {
                    testURIScheme(driver, done, toExecutePath, schemeName);
                });
        });
        it('should be able to download when a different scheme name and a different file path are entered',
            (done) => {
                const toExecutePath = 'Z:\\a\\b\\c\\d\\e\\something.test';
                const schemeName = getRandomString(25);
                driver
                    .findElement(webdriver.By.id('URISchemeFilePath'))
                    .findElement(webdriver.By.tagName('input'))
                    .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, toExecutePath)
                    .then(() => {
                        return driver
                            .findElement(webdriver.By.id('URISchemeSchemeName'))
                            .findElement(webdriver.By.tagName('input'));
                    })
                    .then((element) => {
                        return element.sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, schemeName)
                    })
                    .then(() => {
                        testURIScheme(driver, done, toExecutePath, schemeName);
                    });
            });
    });

    function testNameInput(type: NodeType) {
        const defaultName = 'name';
        describe('Name Input', function(this: MochaFn) {
            this.slow(10000);

            after('Reset settings', function() {
                resetSettings(this);
            });

            it('should not change when not saved', function(done) {
                before('Reset settings', function() {
                resetSettings(this);
            });

                const name = getRandomString(25);
                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() =>{
                    return getDialog(driver, type);
                }).then((dialog) => {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(() => {
                            return cancelDialog(dialog);
                        })
                        .then(() => {
                            return getCRM();
                        }).then((crm) => {
                            assert.strictEqual(crm[0].type, type,
                                `type is ${type}`);
                            assert.strictEqual(crm[0].name, defaultName,
                                'name has not been saved');
                            done();
                        });
                });
            });
            const name = getRandomString(25);
            it('should be editable when saved', function(done)  {
                before('Reset settings', function() {
                    resetSettings(this);
                });

                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() =>{
                    return getDialog(driver, type);
                }).then((dialog) => {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(() => {
                            return saveDialog(dialog);
                        })
                        .then(() => {
                            return getCRM();
                        })
                        .then((crm) => {
                            assert.strictEqual(crm[0].type, type,
                                'type is link');
                            assert.strictEqual(crm[0].name, name,
                                'name has been properly saved');
                            done();
                        });
                });
            });
            it('should be saved when changed', function(done) {
                reloadPage()
                    .then(() => {
                        return getCRM();
                    })
                    .then((crm) => {
                        assert.strictEqual(crm[0].type, type,
                            `type is ${type}`);
                        assert.strictEqual(crm[0].name, name,
                            'name has been properly saved');
                        done();
                    });
            });
        });
    }

    function testVisibilityTriggers(type: NodeType) {
        describe('Triggers', function(this: MochaFn) {
            this.slow(150000);

            after('Reset settings', function() {
                resetSettings(this);
            });

            it('should not change when not saved', function(done)  {
                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() => {
                    return getDialog(driver, type)
                }).then((dialog) => {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(() => {
                            return dialog
                                .findElement(webdriver.By.id('addTrigger'))
                                .then((button) => {
                                    return button.click().then(() => {
                                        return button.click();
                                    })
                                });
                        }).then(() => {
                            setTimeout(() => {
                                dialog
                                    .findElements(webdriver.By.className('executionTrigger'))
                                    .then((triggers) => {
                                        return triggers[0]
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(() => {
                                                return triggers[0]
                                                    .findElement(webdriver.By.tagName('input'))
                                                    .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                            })
                                            .then(() => {
                                                return triggers[1]
                                                    .findElement(webdriver.By.tagName('input'))
                                                    .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                            });
                                    }).then(() => {
                                        return cancelDialog(dialog);
                                    }).then(() => {
                                        return getCRM();
                                    }).then((crm) => {
                                        assert.lengthOf(crm[0].triggers, 1,
                                            'no triggers have been added');
                                        assert.isFalse(crm[0].triggers[0].not,
                                            'first trigger NOT status did not change');
                                        assert.strictEqual(crm[0].triggers[0].url,
                                            '*://*.example.com/*',
                                            'first trigger url stays the same');
                                        done();
                                    });
                            }, 500);
                        })
                });
            });
            it('should be addable/editable when saved', (done) => {
                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() => {
                    return getDialog(driver, type)
                }).then((dialog) => {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(() => {
                            return dialog
                                .findElement(webdriver.By.id('addTrigger'))
                                .then((button) => {
                                    return button.click().then(() => {
                                        return button.click();
                                    })
                                });
                        }).then(() => {
                            setTimeout(() => {
                                dialog
                                    .findElements(webdriver.By.className('executionTrigger'))
                                    .then((triggers) => {
                                        return triggers[0]
                                            .findElement(webdriver.By.tagName('paper-checkbox'))
                                            .click()
                                            .then(() => {
                                                return triggers[1]
                                                    .findElement(webdriver.By.tagName('input'))
                                                    .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                            });
                                    }).then(() => {
                                        return saveDialog(dialog);
                                    }).then(() => {
                                        return getCRM();
                                    }).then((crm) => {
                                        assert.lengthOf(crm[0].triggers, 3,
                                            'trigger has been added');
                                        assert.isTrue(crm[0].triggers[0].not,
                                            'first trigger is NOT');
                                        assert.isFalse(crm[0].triggers[1].not,
                                            'second trigger is not NOT');
                                        assert.strictEqual(crm[0].triggers[0].url,
                                            '*://*.example.com/*',
                                            'first trigger url stays the same');
                                        assert.strictEqual(crm[0].triggers[1].url,
                                            'www.google.com',
                                            'second trigger url changed');
                                        done();
                                    });
                            }, 500);
                        })
                });
            });
            it('should be preserved on page reload', function(done) {
                reloadPage().then(() => {
                    return getCRM();
                }).then((crm) => {
                    assert.lengthOf(crm[0].triggers, 3,
                        'trigger has been added');
                    assert.isTrue(crm[0].triggers[0].not,
                        'first trigger is NOT');
                    assert.isFalse(crm[0].triggers[1].not,
                        'second trigger is not NOT');
                    assert.strictEqual(crm[0].triggers[0].url,
                        '*://*.example.com/*',
                        'first trigger url stays the same');
                    assert.strictEqual(crm[0].triggers[1].url,
                        'www.google.com',
                        'second trigger url changed');
                    done();
                });
            });
        });
    }

    function testContentTypes(type: NodeType) {
        describe('Content Types', function(this: MochaFn) {
            this.slow(15000);
            const defaultContentTypes = [true, true, true, false, false, false];

            after('Reset settings', function() {
                resetSettings(this);
            });

            it('should be editable through clicking on the checkboxes', function(done)  {
                resetSettings(this).then(() => {
                    return openDialog('link');
                }).then(() => {
                    return getDialog(driver, 'link')
                }).then((dialog) => {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then((elements) => {
                            return webdriver.promise.all(elements.map((element) => {
                                return element
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click();
                            }));
                        })
                        .then(() => {
                            return saveDialog(dialog);
                        })
                        .then(() => {
                            return getCRM();
                        }).then((crm) => {
                            assert.isFalse(crm[0].onContentTypes[0],
                                'content types that were on were switched off');
                            assert.isTrue(crm[0].onContentTypes[4],
                                'content types that were off were switched on');
                            let newContentTypes = defaultContentTypes.map(contentType => !contentType);
                            //CRM prevents you from turning off all content types and 4 is the one that stays on
                            newContentTypes[2] = true;
                            newContentTypes = crm[0].onContentTypes;
                            assert.deepEqual(crm[0].onContentTypes,
                                newContentTypes,
                                'all content types were toggled');
                            done();
                        });
                });
            });
            it('should be editable through clicking on the icons', function(done)  {
                resetSettings(this).then(() => {
                    return openDialog('link');
                }).then(() => {
                    return getDialog(driver, 'link')
                }).then((dialog) => {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then((elements) => {
                            return webdriver.promise.all(elements.map((element) => {
                                return element
                                    .findElement(webdriver.By.className('showOnContentItemIcon'))
                                    .click();
                            }));
                        })
                        .then(() => {
                            return saveDialog(dialog);
                        })
                        .then(() => {
                            return getCRM();
                        })
                        .then((crm) => {
                            assert.isFalse(crm[0].onContentTypes[0],
                                'content types that were on were switched off');
                            assert.isTrue(crm[0].onContentTypes[4],
                                'content types that were off were switched on');
                            const newContentTypes = defaultContentTypes.map(contentType => !contentType);
                            //CRM prevents you from turning off all content types and 4 is the one that stays on
                            newContentTypes[2] = true;
                            assert.deepEqual(crm[0].onContentTypes,
                                newContentTypes,
                                'all content types were toggled');
                            done();
                        });
                });
            });
            it('should be editable through clicking on the names', function(done)  {
                resetSettings(this).then(() => {
                    return openDialog('link');
                }).then(() => {
                    return getDialog(driver, 'link')
                }).then((dialog) => {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then((elements) => {
                            return webdriver.promise.all(elements.map((element) => {
                                return element
                                    .findElement(webdriver.By.className('showOnContentItemTxt'))
                                    .click();
                            }));
                        })
                        .then(() => {
                            return saveDialog(dialog);
                        })
                        .then(() => {
                            return getCRM();
                        }).then((crm) => {
                            assert.isFalse(crm[0].onContentTypes[0],
                                'content types that were on were switched off');
                            assert.isTrue(crm[0].onContentTypes[4],
                                'content types that were off were switched on');
                            const newContentTypes = defaultContentTypes.map(contentType => !contentType);
                            //CRM prevents you from turning off all content types and 4 is the one that stays on
                            newContentTypes[2] = true;
                            assert.deepEqual(crm[0].onContentTypes,
                                newContentTypes,
                                'all content types were toggled');
                            done();
                        });
                });
            });
            it('should be preserved on page reload', function(done) {
                reloadPage().then(() => {
                    return getCRM();
                }).then((crm) => {
                    assert.isFalse(crm[0].onContentTypes[0],
                        'content types that were on were switched off');
                    assert.isTrue(crm[0].onContentTypes[4],
                        'content types that were off were switched on');
                    const newContentTypes = defaultContentTypes.map(contentType => !contentType);
                    //CRM prevents you from turning off all content types and 4 is the one that stays on
                    newContentTypes[2] = true;
                    assert.deepEqual(crm[0].onContentTypes,
                        newContentTypes,
                        'all content types were toggled');
                    done();
                });
            });
            it('should not change when not saved', function(done)  {
                resetSettings(this).then(() => {
                    return openDialog('link');
                }).then(() => {
                    return getDialog(driver, 'link')
                }).then((dialog) => {
                    dialog
                        .findElements(webdriver.By.className('showOnContentItemCont'))
                        .then((elements) => {
                            return webdriver.promise.all(elements.map((element) => {
                                return element
                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                    .click();
                            }));
                        })
                        .then(() => {
                            return cancelDialog(dialog);
                        })
                        .then(() => {
                            return getCRM();
                        }).then((crm) => {
                            assert.isTrue(crm[0].onContentTypes[0],
                                'content types that were on did not change');
                            assert.isFalse(crm[0].onContentTypes[4],
                                'content types that were off did not change');
                            assert.deepEqual(crm[0].onContentTypes,
                                defaultContentTypes,
                                'all content types were not toggled');
                            done();
                        });
                });
            });
        });
    }

    function testClickTriggers(type: NodeType) {
        describe('Click Triggers', function(this: MochaFn) {
            [0, 1, 2, 3, 4].forEach((triggerOptionIndex) => {
                describe(`Trigger option ${triggerOptionIndex}`, function(this: MochaFn) {
                    this.slow(20000);
                    it(`should be possible to select trigger option number`, function(done) {
                        resetSettings(this).then(() => {
                            return openDialog(type);
                        }).then(() => {
                            return getDialog(driver, type);
                        }).then((dialog) => {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(() => {
                                    wait(500);
                                })
                                .then(() => {
                                    return dialog
                                        .findElements(webdriver.By.className('stylesheetLaunchOption'))
                                }).then((triggerOptions) => {
                                    return triggerOptions[triggerOptionIndex].click();
                                }).then(() => {
                                    wait(300);
                                }).then(() => {
                                    return saveDialog(dialog);
                                }).then(() => {
                                    return getCRM();
                                }).then((crm: Array<StylesheetNode|ScriptNode>) => {
                                    assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex,
                                        'launchmode is the same as expected');
                                    done();
                                });
                        });
                    });
                    it('should be saved on page reload', function(done) {
                        reloadPage().then(() => {
                            return getCRM();
                        }).then((crm: Array<StylesheetNode|ScriptNode>) => {
                            assert.strictEqual(crm[0].value.launchMode, triggerOptionIndex,
                                'launchmode is the same as expected');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', function(done) {
                        resetSettings(this).then(() => {
                            return openDialog(type);
                        }).then(() => {
                            return getDialog(driver, type);
                        }).then((dialog) => {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(() => {
                                    wait(500);
                                })
                                .then(() => {
                                    return dialog
                                        .findElements(webdriver.By.className('stylesheetLaunchOption'))
                                }).then((triggerOptions) => {
                                    return triggerOptions[triggerOptionIndex].click();
                                }).then(() => {
                                    wait(300);
                                }).then(() => {
                                    return cancelDialog(dialog);
                                }).then(() => {
                                    return getCRM();
                                }).then((crm: Array<StylesheetNode|ScriptNode>) => {
                                    assert.strictEqual(crm[0].value.launchMode, 0,
                                        'launchmode is the same as before');
                                    done();
                                });
                        });
                    });
                });
            });
            [2, 3].forEach((triggerOptionIndex) => {
                describe(`Trigger Option ${triggerOptionIndex} with URLs`, function(this: MochaFn) {
                    this.slow(22500);
                    it('should be editable', (done) => {
                        resetSettings(this).then(() => {
                            return openDialog(type);
                        }).then(() => {
                            return getDialog(driver, type)
                        }).then((dialog) => {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(() => {
                                    wait(500);
                                })
                                .then(() => {
                                    return dialog
                                        .findElements(webdriver.By.className('stylesheetLaunchOption'))
                                }).then((triggerOptions) => {
                                    return triggerOptions[triggerOptionIndex].click();
                                }).then(() => {
                                    wait(1000);
                                })
                                .then(() => {
                                    return dialog
                                        .findElement(webdriver.By.id('addTrigger'))
                                        .then((button) => {
                                            return button.click().then(() => {
                                                return button.click();
                                            })
                                        });
                                }).then(() => {
                                    setTimeout(() => {
                                        dialog
                                            .findElements(webdriver.By.className('executionTrigger'))
                                            .then((triggers) => {
                                                return triggers[0]
                                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                                    .click()
                                                    .then(() => {
                                                        return triggers[1]
                                                            .findElement(webdriver.By.tagName('input'))
                                                            .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                                    });
                                            }).then(() => {
                                                return saveDialog(dialog);
                                            }).then(() => {
                                                return getCRM();
                                            }).then((crm) => {
                                                assert.lengthOf(crm[0].triggers, 3,
                                                    'trigger has been added');
                                                assert.isTrue(crm[0].triggers[0].not,
                                                    'first trigger is NOT');
                                                assert.isFalse(crm[0].triggers[1].not,
                                                    'second trigger is not NOT');
                                                assert.strictEqual(crm[0].triggers[0].url,
                                                    '*://*.example.com/*',
                                                    'first trigger url stays the same');
                                                assert.strictEqual(crm[0].triggers[1].url,
                                                    'www.google.com',
                                                    'second trigger url changed');
                                                done();
                                            });
                                    }, 500);
                                });
                        });
                    });
                    it('should be saved on page reload', (done) => {
                        getCRM().then((crm: Array<StylesheetNode|ScriptNode>) => {
                            assert.lengthOf(crm[0].triggers, 3,
                                'trigger has been added');
                            assert.isTrue(crm[0].triggers[0].not,
                                'first trigger is NOT');
                            assert.isFalse(crm[0].triggers[1].not,
                                'second trigger is not NOT');
                            assert.strictEqual(crm[0].triggers[0].url,
                                '*://*.example.com/*',
                                'first trigger url stays the same');
                            assert.strictEqual(crm[0].triggers[1].url,
                                'www.google.com',
                                'second trigger url changed');
                            done();
                        });
                    });
                    it('should not be saved when cancelled', (done) => {
                        resetSettings(this).then(() => {
                            return openDialog(type);
                        }).then(() => {
                            return getDialog(driver, type)
                        }).then((dialog) => {
                            dialog
                                .findElement(webdriver.By.id('dropdownMenu'))
                                .click()
                                .then(() => {
                                    wait(500);
                                })
                                .then(() => {
                                    return dialog
                                        .findElements(webdriver.By.className('stylesheetLaunchOption'))
                                }).then((triggerOptions) => {
                                    return triggerOptions[triggerOptionIndex].click();
                                }).then(() => {
                                    wait(1000);
                                })
                                .then(() => {
                                    return dialog
                                        .findElement(webdriver.By.id('addTrigger'))
                                        .then((button) => {
                                            return button.click().then(() => {
                                                return button.click();
                                            })
                                        });
                                }).then(() => {
                                    setTimeout(() => {
                                        dialog
                                            .findElements(webdriver.By.className('executionTrigger'))
                                            .then((triggers) => {
                                                return triggers[0]
                                                    .findElement(webdriver.By.tagName('paper-checkbox'))
                                                    .click()
                                                    .then(() => {
                                                        return triggers[1]
                                                            .findElement(webdriver.By.tagName('input'))
                                                            .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, 'www.google.com');
                                                    });
                                            }).then(() => {
                                                return cancelDialog(dialog);
                                            }).then(() => {
                                                return getCRM();
                                            }).then((crm) => {
                                                assert.lengthOf(crm[0].triggers, 1,
                                                    'no triggers have been added');
                                                assert.isFalse(crm[0].triggers[0].not,
                                                    'first trigger NOT status did not change');
                                                assert.strictEqual(crm[0].triggers[0].url,
                                                    '*://*.example.com/*',
                                                    'first trigger url stays the same');
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

    function testEditorSettings(type: NodeType) {
        it('are togglable', function(done) {
            this.slow(13000);
            resetSettings(this).then(() => {
                return openDialog(type);
            }).then(() => {
                return getDialog(driver, type);
            }).then((dialog) => {
                return dialog
                    .findElement(webdriver.By.id('editorSettings'))
                    .click()
                    .then(() => {
                        return wait(500);
                    })
                    .then(() => {
                        return dialog
                            .findElement(webdriver.By.id('editorSettingsTxt'))
                            .isDisplayed()
                    })
            }).then((isDisplayed) => {
                assert.isTrue(isDisplayed, 'settings menu is visible');
                done();
            });
        });
        describe('Theme', function(this: MochaFn) {
            it('is changable', function(done) {
                this.slow(13000);
                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() => {
                    return getDialog(driver, type);
                }).then((dialog) => {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(() => {
                            return wait(500);
                        })
                        .then(() => {
                            return dialog
                                .findElement(webdriver.By.id('editorThemeSettingWhite'))
                                .click();
                        });
                }).then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.strictEqual(settings.editor.theme, 'white',
                        'theme has been switched to white');
                    done();
                });
            });
            it('is preserved on page reload', function(done) {
                this.slow(6000);
                reloadPage().then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.strictEqual(settings.editor.theme, 'white',
                        'theme has been switched to white');
                    done();
                });
            });
        });
        describe('Zoom', function(this: MochaFn) {
            const newZoom = '135';
            it('is changable', function(done) {
                this.slow(13000);
                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() => {
                    return getDialog(driver, type);
                }).then((dialog) => {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(() => {
                            return wait(500);
                        })
                        .then(() => {
                            return dialog
                                .findElement(webdriver.By.id('editorThemeFontSizeInput'))
                                .findElement(webdriver.By.tagName('input'))
                                .sendKeys(webdriver.Key.BACK_SPACE,
                                    webdriver.Key.BACK_SPACE,
                                    webdriver.Key.BACK_SPACE,
                                    newZoom);
                        });
                }).then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.strictEqual(settings.editor.zoom, newZoom,
                        'zoom has changed to the correct number');
                    done();
                });
            });
            it('is preserved on page reload', function(done) {
                this.slow(6000);
                reloadPage().then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.strictEqual(settings.editor.zoom, newZoom,
                        'zoom has changed to the correct number');
                    done();
                });
            });
        });
        describe('UseTabs', function(this: MochaFn) {
            it('is changable', function(done) {
                this.slow(13000);
                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() => {
                    return getDialog(driver, type);
                }).then((dialog) => {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(() => {
                            return wait(500);
                        })
                        .then(() => {
                            return dialog
                                .findElement(webdriver.By.id('editorTabsOrSpacesCheckbox'))
                                .findElement(webdriver.By.tagName('paper-checkbox'))
                                .click();
                        });
                }).then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.isFalse(settings.editor.useTabs,
                        'useTabs is off');
                    done();
                });
            });
            it('is preserved on page reload', function(done) {
                this.slow(6000);
                reloadPage().then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.isFalse(settings.editor.useTabs,
                        'useTabs is off');
                    done();
                })
            });
        });
        describe('Tab Size', function(this: MochaFn) {
            const newTabSize = '8';
            it('is changable', function(done) {
                this.slow(13000);
                resetSettings(this).then(() => {
                    return openDialog(type);
                }).then(() => {
                    return getDialog(driver, type);
                }).then((dialog) => {
                    return dialog
                        .findElement(webdriver.By.id('editorSettings'))
                        .click()
                        .then(() => {
                            return wait(500);
                        })
                        .then(() => {
                            return dialog
                                .findElement(webdriver.By.id('editorTabSizeInput'))
                                .findElement(webdriver.By.tagName('input'))
                                .sendKeys(webdriver.Key.BACK_SPACE,
                                    webdriver.Key.BACK_SPACE,
                                    webdriver.Key.NULL,
                                    webdriver.Key.DELETE,
                                    webdriver.Key.DELETE,
                                    newTabSize)
                                .then(() => {
                                    //Click "some" element to un-focus the input
                                    return dialog
                                        .findElement(webdriver.By.id('editorSettings'))
                                        .click();
                                })
                        });
                }).then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.strictEqual(settings.editor.tabSize, newTabSize,
                        'tab size has changed to the correct number');
                    done();
                });
            });
            it('is preserved on page reload', function(done) {
                this.slow(6000);
                reloadPage().then(() => {
                    return getSyncSettings();
                }).then((settings) => {
                    assert.strictEqual(settings.editor.tabSize, newTabSize,
                        'tab size has changed to the correct number');
                    done();
                })
            });
        });
    }

    describe('CRM Editing', function(this: MochaFn) {
        before('Reset settings', function() {
            resetSettings(this);
        });

        describe('Type Switching', function(this: MochaFn) {

            function testTypeSwitch(driver: webdriver.WebDriver, type: string, done: () => void) {
                driver.executeAsyncScript(inlineFn((args) => {
                    const crmItem = document.getElementsByTagName('edit-crm-item').item(0) as any;
                    crmItem.typeIndicatorMouseOver();
                    window.setTimeout(() => {
                        const typeSwitcher = crmItem.querySelector('type-switcher');
                        typeSwitcher.openTypeSwitchContainer();
                        window.setTimeout(() => {
                            typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                                .click();
                            args[0](window.app.settings.crm[0].type === 'REPLACE.type');
                        }, 300);
                    }, 300);
                }, {
                    type: type
                })).then((typesMatch: boolean) => {
                    assert.isTrue(typesMatch, 'new type matches expected');
                    done();
                });
            }
            this.timeout(20000);
            this.slow(7000);
            
            it('should be able to switch to a script', function(done)  {
                resetSettings(this).then(() => {
                    testTypeSwitch(driver, 'script', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage().then(() => {
                    return getCRM();
                }).then((crm) => {
                    assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a menu', function(done)  {
                resetSettings(this).then(() => {
                    testTypeSwitch(driver, 'menu', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage().then(() => {
                    return getCRM();
                }).then((crm) => {
                    assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a divider', function(done)  {
                resetSettings(this).then(() => {
                    testTypeSwitch(driver, 'divider', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage().then(() => {
                    return getCRM();
                }).then((crm) => {
                    assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
                    done();
                });
            });
            it('should be able to switch to a stylesheet', function(done)  {
                resetSettings(this).then(() => {
                    testTypeSwitch(driver, 'stylesheet', done);
                });
            });
            it('should be preserved', function(done) {
                reloadPage().then(() => {
                    return getCRM();
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
                resetSettings(this);
            });

            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
            
            describe('Links', function(this: MochaFn) {
                this.slow(22500);

                after('Reset settings', function() {
                    resetSettings(this);
                });

                it('open in new tab property should be editable', function(done)  {
                    resetSettings(this).then(() => {
                        return openDialog('link');
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
                                return getCRM();
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
                    resetSettings(this).then(() => {
                        return openDialog('link');
                    }).then(() => {
                        return getDialog(driver, 'link')
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.className('linkChangeCont'))
                            .findElement(webdriver.By.tagName('input'))
                            .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl)
                            .then(() => {
                                return saveDialog(dialog);
                            })
                            .then(() => {
                                return getCRM();
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
                    resetSettings(this).then(() => {
                        return openDialog('link');
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
                                return getCRM();
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
                    resetSettings(this).then(() => {
                        return openDialog('link');
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
                                return wait(500);
                            })
                            .then(() => {
                                return dialog
                                    .findElements(webdriver.By.className('linkChangeCont'))
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
                                                        .findElement(webdriver.By.tagName('input'))
                                                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl);
                                                }).then(() => {
                                                    resolve(null);
                                                });
                                        }, 250);
                                    });
                                });
                            })
                            .then(() => {
                                return wait(500);
                            })
                            .then(() => {
                                return saveDialog(dialog);
                            })
                            .then(() => {
                                return getCRM();
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

                    reloadPage().then(() => {
                        return getCRM();
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
                    resetSettings(this).then(() => {
                        return openDialog('link');
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
                                                .findElement(webdriver.By.tagName('input'))
                                                .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, newUrl);
                                        })
                                });
                            })
                            .then(() => {
                                return cancelDialog(dialog);
                            })
                            .then(() => {
                                return getCRM();
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
            const type: NodeType = 'link';

            this.timeout(30000);
            before('Reset settings', function() {
                resetSettings(this);
            });

            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Menu Dialog', function(this: MochaFn) {
            const type: NodeType = 'menu';

            this.timeout(30000);
            before('Reset settings', function() {
                resetSettings(this);
            });

            testNameInput(type);
            testVisibilityTriggers(type);
            testContentTypes(type);
        });
        describe('Stylesheet Dialog', function(this: MochaFn) {
            const type: NodeType = 'stylesheet';

            this.timeout(30000);
            before('Reset settings', function() {
                resetSettings(this);
            });

            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);

            describe('Toggling', function(this: MochaFn) {
                it('should be possible to toggle on', (done) => {
                    resetSettings(this).then(() => {
                        return openDialog(type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(() => {
                                return saveDialog(dialog);
                            }).then(() => {
                                return getCRM();
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                                done();
                            });
                    });
                });
                it('should be saved on page reload', function(done) {
                    reloadPage().then(() => {
                        return getCRM();
                    }).then((crm: Array<StylesheetNode>) => {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to on');
                        done();
                    });
                });
                it('should be possible to toggle on-off', (done) => {
                    resetSettings(this).then(() => {
                        return openDialog(type);
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
                                return getCRM();
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isFalse(crm[0].value.toggle, 'toggle option is set to off');
                                done();
                            });
                    });
                });
                it('should not be saved on cancel', (done) => {
                    resetSettings(this).then(() => {
                        return openDialog(type);
                    }).then(() => {
                        return getDialog(driver, type);
                    }).then((dialog) => {
                        dialog
                            .findElement(webdriver.By.id('isTogglableButton'))
                            .click()
                            .then(() => {
                                return cancelDialog(dialog);
                            }).then(() => {
                                return getCRM();
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isNotTrue(crm[0].value.toggle, 'toggle option is unchanged');
                                done();
                            });
                    });
                });
            });
            describe('Default State', function(this: MochaFn) {
                it('should be togglable to true', (done) => {
                    resetSettings(this).then(() => {
                        return openDialog(type);
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
                                return getCRM();
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                                assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                                done();
                            });
                    });
                });
                it('should be saved on page reset', function(done) {
                    reloadPage().then(() => {
                        return getCRM();
                    }).then((crm: Array<StylesheetNode>) => {
                        assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                        assert.isTrue(crm[0].value.defaultOn, 'defaultOn is set to true');
                        done();
                    });
                });
                it('should be togglable to false', (done) => {
                    resetSettings(this).then(() => {
                        return openDialog(type);
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
                                return getCRM();
                            }).then((crm: Array<StylesheetNode>) => {
                                assert.isTrue(crm[0].value.toggle, 'toggle option is set to true');
                                assert.isFalse(crm[0].value.defaultOn, 'defaultOn is set to true');
                                done();
                            });
                    });
                });
                it('should not be saved when cancelled', (done) => {
                    resetSettings(this).then(() => {
                        return openDialog(type);
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
                                return getCRM();
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
        describe('Script Dialog', function(this: MochaFn) {
            const type: NodeType = 'script';

            this.timeout(30000);
            before('Reset settings', function() {
                resetSettings(this);
            });

            testNameInput(type);
            testContentTypes(type);
            testClickTriggers(type);

            describe('Editor', function(this: MochaFn) {
                describe('Settings', function(this: MochaFn) {
                    testEditorSettings(type);
                });
            });
        });
    });
    describe('Errors', function(this: MochaFn) {
        this.timeout(10000);
        this.slow(2000);

        it('should not have been thrown', (done) => {
            driver
                .executeScript(inlineFn(() => {
                    return window.lastError ? window.lastError : 'noError';
                })).then((result) => {
                    assert.ifError(result !== 'noError' ? result : false,
                        'no errors should be thrown during testing');
                    done();
                });
        });
    });
});
*/
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
        before('Set CRM', function (done) {
            resetSettings(this).then(function () {
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
        before('Set CRM', function (done) {
            resetSettings(this).then(function () {
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
                assert.lengthOf(contextMenu[0].createProperties.documentUrlPatterns, 0, 'triggers are turned off');
                assert.deepEqual(contextMenu[1].createProperties.documentUrlPatterns, CRMNodes[1].triggers.map(function (trigger) {
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
        it('should open the correct links when "clicked" for the default link', function (done) {
            this.slow(2500);
            this.timeout(5000);
            var tabId = ~~(Math.random() * 100);
            var windowId = ~~(Math.random() * 100);
            getContextMenu().then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    window.chrome._currentContextMenu[0].children[4].currentProperties.onclick(REPLACE.page, REPLACE.tab);
                    return true;
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[4].id,
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
                    var expectedTabs = CRMNodes[4].value.map(function (link) {
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
        it('should open the correct links when "clicked" for multiple links', function (done) {
            var tabId = ~~(Math.random() * 100);
            var windowId = ~~(Math.random() * 100);
            getContextMenu().then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    //Clear it without removing object-array-magic-address-linking
                    while (window.chrome._activeTabs.length > 0) {
                        window.chrome._activeTabs.pop();
                    }
                    return window.chrome._currentContextMenu[0].children[5].currentProperties.onclick(REPLACE.page, REPLACE.tab);
                }, {
                    page: JSON.stringify({
                        menuItemId: contextMenu[5].id,
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
                    var expectedTabs = CRMNodes[5].value.map(function (link) {
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
        before('Set CRM', function (done) {
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
        it('should have the correct structure', function (done) {
            getContextMenu().then(function (contextMenu) {
                driver
                    .executeScript(inlineFn(function () {
                    return window.logs;
                }))
                    .then(function (logs) {
                    console.log(logs);
                    console.log(JSON.stringify(contextMenu));
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
});
