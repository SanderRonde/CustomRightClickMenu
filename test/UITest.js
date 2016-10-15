"use strict";
/// <reference path="defs/selenium-webdriver.d.ts" />
/// <reference path="defs/chai.d.ts" />
;
var chai = require('chai');
var webdriver = require('selenium-webdriver');
var mochaSteps = require('mocha-steps');
var secrets = require('./secrets');
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
function getCRM(driver) {
    return new webdriver.promise.Promise(function (resolve) {
        driver
            .executeScript(inlineFn(function () {
            return JSON.stringify(window.app.settings.crm);
        }))
            .then(function (str) {
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
function resetSettings(done) {
    this.timeout(15000);
    driver.executeScript(inlineFn(function () {
        window.chrome.storage.local.clear();
        window.chrome.storage.sync.clear();
        return true;
    })).then(function (result) {
        return driver.get('http://localhost:1234/test/UI/UITest.html#noClear');
    }).then(function () {
        done();
    });
}
function resetSettingsPromise() {
    return new webdriver.promise.Promise(function (resolve) {
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
}
function reloadPage(done) {
    this.timeout(150000);
    driver
        .get('http://localhost:1234/test/UI/UITest.html#noClear')
        .then(function () {
        done();
    });
}
function reloadPagePromise(_this) {
    return new webdriver.promise.Promise(function (resolve) {
        reloadPage.apply(_this, [resolve]);
    });
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
    this.timeout(10000);
    this.slow(6000);
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
            reloadPagePromise(this).then(function () {
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
    this.timeout(5000);
    this.slow(5000);
    var searchEngineLink = '';
    var defaultLinkName = '';
    before('Reset settings', resetSettings);
    it('should be addable', function (done) {
        driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
            elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                    elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                        getCRM(driver).then(function (crm) {
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
                        getCRM(driver).then(function (crm) {
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
        reloadPagePromise(this).then(function () {
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
    this.timeout(5000);
    this.slow(5000);
    var searchEngineLink = '';
    var searchEngineName = '';
    before('Reset settings', resetSettings);
    it('should be addable', function (done) {
        driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
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
        driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
            var index = elements.length - 1;
            elements[index].findElement(webdriver.By.tagName('paper-button')).then(function (button) {
                elements[index].findElement(webdriver.By.tagName('input')).sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name).then(function () {
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
        reloadPagePromise(this).then(function () {
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
    before('Reset settings', resetSettings);
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
    afterEach('Reset page settings', resetSettings);
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
describe('CRM Editing', function () {
    var defaultName = 'name';
    before('Reset settings', resetSettings);
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
        this.slow(6000);
        it('should be able to switch to a script', function (done) {
            resetSettingsPromise().then(function () {
                testTypeSwitch(driver, 'script', done);
            });
        });
        it('should be preserved', function (done) {
            reloadPagePromise(this).then(function () {
                return getCRM(driver);
            }).then(function (crm) {
                assert.strictEqual(crm[0].type, 'script', 'type has stayed the same');
                done();
            });
        });
        it('should be able to switch to a menu', function (done) {
            resetSettingsPromise().then(function () {
                testTypeSwitch(driver, 'menu', done);
            });
        });
        it('should be preserved', function (done) {
            reloadPagePromise(this).then(function () {
                return getCRM(driver);
            }).then(function (crm) {
                assert.strictEqual(crm[0].type, 'menu', 'type has stayed the same');
                done();
            });
        });
        it('should be able to switch to a divider', function (done) {
            resetSettingsPromise().then(function () {
                testTypeSwitch(driver, 'divider', done);
            });
        });
        it('should be preserved', function (done) {
            reloadPagePromise(this).then(function () {
                return getCRM(driver);
            }).then(function (crm) {
                assert.strictEqual(crm[0].type, 'divider', 'type has stayed the same');
                done();
            });
        });
        it('should be able to switch to a stylesheet', function (done) {
            resetSettingsPromise().then(function () {
                testTypeSwitch(driver, 'stylesheet', done);
            });
        });
        it('should be preserved', function (done) {
            reloadPagePromise(this).then(function () {
                return getCRM(driver);
            }).then(function (crm) {
                assert.strictEqual(crm[0].type, 'stylesheet', 'type has stayed the same');
                done();
            });
        });
    });
    describe('Link Dialog', function () {
        this.timeout(30000);
        before('Reset settings', resetSettings);
        describe('Name Input', function () {
            this.slow(7000);
            after('Reset settings', resetSettings);
            it('should not change when not saved', function (done) {
                before('Reset settings', resetSettings);
                var name = getRandomString(25);
                resetSettingsPromise().then(function () {
                    return openDialog('link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.strictEqual(crm[0].type, 'link', 'type is link');
                        assert.strictEqual(crm[0].name, defaultName, 'name has not been saved');
                        done();
                    });
                });
            });
            var name = getRandomString(25);
            it('should be editable when saved', function (done) {
                before('Reset settings', resetSettings);
                resetSettingsPromise().then(function () {
                    return openDialog('link');
                }).then(function () {
                    return getDialog(driver, 'link');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    })
                        .then(function (crm) {
                        assert.strictEqual(crm[0].type, 'link', 'type is link');
                        assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                        done();
                    });
                });
            });
            it('should be saved when changed', function (done) {
                reloadPagePromise(this)
                    .then(function () {
                    return getCRM(driver);
                })
                    .then(function (crm) {
                    assert.strictEqual(crm[0].type, 'link', 'type is link');
                    assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                    done();
                });
            });
        });
        describe('Triggers', function () {
            this.slow(150000);
            after('Reset settings', resetSettings);
            it('should not change when not saved', function (done) {
                resetSettingsPromise().then(function () {
                    return openDialog('link');
                }).then(function () {
                    return getDialog(driver, 'link');
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
                resetSettingsPromise().then(function () {
                    return openDialog('link');
                }).then(function () {
                    return getDialog(driver, 'link');
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
                reloadPagePromise(this).then(function () {
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
        describe('Content Types', function () {
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            after('Reset settings', resetSettings);
            it('should be editable through clicking on the checkboxes', function (done) {
                resetSettingsPromise().then(function () {
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
                resetSettingsPromise().then(function () {
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
                resetSettingsPromise().then(function () {
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
                reloadPagePromise(this).then(function () {
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
                resetSettingsPromise().then(function () {
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
        describe('Links', function () {
            this.slow(20000);
            after('Reset settings', resetSettings);
            it('open in new tab property should be editable', function (done) {
                resetSettingsPromise().then(function () {
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
                resetSettingsPromise().then(function () {
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
                resetSettingsPromise().then(function () {
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
                resetSettingsPromise().then(function () {
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
                reloadPagePromise(this).then(function () {
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
                var newUrl = 'www.google.com';
                var defaultLink = {
                    newTab: true,
                    url: 'https://www.example.com'
                };
                resetSettingsPromise().then(function () {
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
        this.timeout(30000);
        before('Reset settings', resetSettings);
        describe('Name Input', function () {
            this.slow(7000);
            after('Reset settings', resetSettings);
            it('should not change when not saved', function (done) {
                before('Reset settings', resetSettings);
                var name = getRandomString(25);
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.strictEqual(crm[0].type, 'divider', 'type is divider');
                        assert.strictEqual(crm[0].name, defaultName, 'name has not been saved');
                        done();
                    });
                });
            });
            var name = getRandomString(25);
            it('should be editable when saved', function (done) {
                before('Reset settings', resetSettings);
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    })
                        .then(function (crm) {
                        assert.strictEqual(crm[0].type, 'divider', 'type is divider');
                        assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                        done();
                    });
                });
            });
            it('should be saved when changed', function (done) {
                reloadPagePromise(this)
                    .then(function () {
                    return getCRM(driver);
                })
                    .then(function (crm) {
                    assert.strictEqual(crm[0].type, 'divider', 'type is divider');
                    assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                    done();
                });
            });
        });
        describe('Triggers', function () {
            this.slow(9000);
            after('Reset settings', resetSettings);
            it('should not change when not saved', function (done) {
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return wait(250);
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
                                assert.lengthOf(triggers, 3, '2 triggers have been added');
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
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return wait(250);
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
                                assert.lengthOf(triggers, 3, '2 triggers have been added');
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
                reloadPagePromise(this).then(function () {
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
        describe('Content Types', function () {
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            after('Reset settings', resetSettings);
            it('should be editable through clicking on the checkboxes', function (done) {
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
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
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
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
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
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
                reloadPagePromise(this).then(function () {
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
                resetSettingsPromise().then(function () {
                    return openDialog('divider');
                }).then(function () {
                    return getDialog(driver, 'divider');
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
    });
    describe('Menu Dialog', function () {
        this.timeout(30000);
        before('Reset settings', resetSettings);
        describe('Name Input', function () {
            this.slow(7000);
            after('Reset settings', resetSettings);
            it('should not change when not saved', function (done) {
                before('Reset settings', resetSettings);
                var name = getRandomString(25);
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return cancelDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    }).then(function (crm) {
                        assert.strictEqual(crm[0].type, 'menu', 'type is menu');
                        assert.strictEqual(crm[0].name, defaultName, 'name has not been saved');
                        done();
                    });
                });
            });
            var name = getRandomString(25);
            it('should be editable when saved', function (done) {
                before('Reset settings', resetSettings);
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('nameInput'))
                        .findElement(webdriver.By.tagName('input'))
                        .sendKeys(webdriver.Key.CONTROL, "a", webdriver.Key.NULL, name)
                        .then(function () {
                        return saveDialog(dialog);
                    })
                        .then(function () {
                        return getCRM(driver);
                    })
                        .then(function (crm) {
                        assert.strictEqual(crm[0].type, 'menu', 'type is menu');
                        assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                        done();
                    });
                });
            });
            it('should be saved when changed', function (done) {
                reloadPagePromise(this)
                    .then(function () {
                    return getCRM(driver);
                })
                    .then(function (crm) {
                    assert.strictEqual(crm[0].type, 'menu', 'type is menu');
                    assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                    done();
                });
            });
        });
        describe('Triggers', function () {
            this.slow(9000);
            after('Reset settings', resetSettings);
            it('should not change when not saved', function (done) {
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return wait(250);
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
                                assert.lengthOf(triggers, 3, '2 triggers have been added');
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
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
                }).then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return wait(250);
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
                                assert.lengthOf(triggers, 3, '2 triggers have been added');
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
                reloadPagePromise(this).then(function () {
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
        describe('Content Types', function () {
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            after('Reset settings', resetSettings);
            it('should be editable through clicking on the checkboxes', function (done) {
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
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
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
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
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
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
                reloadPagePromise(this).then(function () {
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
                resetSettingsPromise().then(function () {
                    return openDialog('menu');
                }).then(function () {
                    return getDialog(driver, 'menu');
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
    });
});
