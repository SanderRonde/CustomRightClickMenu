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
        'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER
    };
    driver = new webdriver.Builder()
        .usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities)
        .build();
    driver.get('http://localhost:1234/test/UI/UITest.html').then(function () {
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
    driver
        .get('http://localhost:1234/test/UI/UITest.html')
        .then(function () {
        done();
    });
}
function openDialogAndReset(done) {
    resetSettings.call(this, function () {
        driver.findElement(webdriver.By.tagName('edit-crm-item')).click();
        setTimeout(done, 500);
    });
}
function switchToTypeResetAndOpenDialog(type) {
    return function (done) {
        resetSettings.call(this, function () {
            driver.executeAsyncScript(inlineFn(function (args) {
                var crmItem = document.getElementsByTagName('edit-crm-item').item(0);
                crmItem.typeIndicatorMouseOver();
                window.setTimeout(function () {
                    var typeSwitcher = crmItem.querySelector('type-switcher');
                    typeSwitcher.openTypeSwitchContainer();
                    window.setTimeout(function () {
                        typeSwitcher.querySelector('.typeSwitchChoice[type="REPLACE.type"]')
                            .click();
                        args[0]();
                    }, 300);
                }, 300);
            }, {
                type: type
            })).then(function () {
                setTimeout(function () {
                    driver.findElement(webdriver.By.tagName('edit-crm-item')).click();
                    setTimeout(done, 500);
                }, 300);
            });
        });
    };
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
            assert.notStrictEqual(result, 'noError', 'no errors should be thrown when loading');
            done();
        });
    });
});
describe('CheckboxOptions', function () {
    this.timeout(3000);
    this.slow(2000);
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
    });
});
describe('Commonly used links', function () {
    this.timeout(5000);
    this.slow(3000);
    it('should be addable', function (done) {
        driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
            elements[0].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                elements[0].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                    elements[0].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                        driver.executeScript(inlineFn(function () {
                            var element = window.app.settings.crm[window.app.settings.crm.length - 1];
                            if (element.name !== 'REPLACE.name' ||
                                element.type !== 'link' ||
                                typeof element.value !== 'object' ||
                                !Array.isArray(element.value) ||
                                element.value[0] === undefined ||
                                element.value[0].url !== 'REPLACE.link' ||
                                element.value[0].newTab !== true) {
                                return false;
                            }
                            return true;
                        }, {
                            name: name,
                            link: link
                        })).then(function (result) {
                            assert.strictEqual(result, true, 'link has been added to CRM');
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
                        driver.executeScript(inlineFn(function () {
                            var element = window.app.settings.crm[window.app.settings.crm.length - 1];
                            if (element.name !== 'REPLACE.name' ||
                                element.type !== 'link' ||
                                typeof element.value !== 'object' ||
                                !Array.isArray(element.value) ||
                                element.value[0] === undefined ||
                                element.value[0].url !== 'REPLACE.link' ||
                                element.value[0].newTab !== true) {
                                return false;
                            }
                            return true;
                        }, {
                            name: name,
                            link: link
                        })).then(function (result) {
                            assert.strictEqual(result, true, 'link has been added to CRM');
                            done();
                        });
                    });
                });
            });
        });
    });
});
describe('SearchEngines', function () {
    this.timeout(5000);
    this.slow(3000);
    it('should be addable', function (done) {
        driver.findElements(webdriver.By.tagName('default-link')).then(function (elements) {
            var index = elements.length - 1;
            elements[index].findElement(webdriver.By.tagName('paper-button')).click().then(function () {
                elements[index].findElement(webdriver.By.tagName('input')).getAttribute('value').then(function (name) {
                    elements[index].findElement(webdriver.By.tagName('a')).getAttribute('href').then(function (link) {
                        driver.executeScript(inlineFn(function () {
                            var element = window.app.settings.crm[window.app.settings.crm.length - 1];
                            if (element.name !== 'REPLACE.name' ||
                                element.type !== 'script' ||
                                typeof element.value !== 'object' ||
                                element.value.script === undefined ||
                                typeof element.value.script !== 'string' ||
                                element.value.script !== 'REPLACE.script') {
                                return false;
                            }
                            return true;
                        }, {
                            name: name,
                            script: '' +
                                'var query;\n' +
                                'var url = "' + link + '";\n' +
                                'if (crmAPI.getSelection()) {\n' +
                                '	query = crmAPI.getSelection();\n' +
                                '} else {\n' +
                                '	query = window.prompt(\'Please enter a search query\');\n' +
                                '}\n' +
                                'if (query) {\n' +
                                '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                '}\n'
                        })).then(function (result) {
                            assert.strictEqual(result, true, 'link has been added to CRM');
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
                        driver.executeScript(inlineFn(function () {
                            var element = window.app.settings.crm[window.app.settings.crm.length - 1];
                            if (element.name !== 'REPLACE.name' ||
                                element.type !== 'script' ||
                                typeof element.value !== 'object' ||
                                element.value.script === undefined ||
                                typeof element.value.script !== 'string' ||
                                element.value.script !== 'REPLACE.script') {
                                return false;
                            }
                            return true;
                        }, {
                            name: name,
                            script: '' +
                                'var query;\n' +
                                'var url = "' + link + '";\n' +
                                'if (crmAPI.getSelection()) {\n' +
                                '	query = crmAPI.getSelection();\n' +
                                '} else {\n' +
                                '	query = window.prompt(\'Please enter a search query\');\n' +
                                '}\n' +
                                'if (query) {\n' +
                                '	window.open(url.replace(/%s/g,query), \'_blank\');\n' +
                                '}\n'
                        })).then(function (result) {
                            assert.strictEqual(result, true, 'link has been added to CRM');
                            done();
                        });
                    });
                });
            });
        });
    });
});
describe('URIScheme', function () {
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
    describe('Type Switching', function () {
        beforeEach('Reset page settings', resetSettings);
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
        this.slow(3000);
        it('should be able to switch to a script', function (done) {
            testTypeSwitch(driver, 'script', done);
        });
        it('should be able to switch to a menu', function (done) {
            testTypeSwitch(driver, 'menu', done);
        });
        it('should be able to switch to a divider', function (done) {
            testTypeSwitch(driver, 'divider', done);
        });
        it('should be able to switch to a stylesheet', function (done) {
            testTypeSwitch(driver, 'stylesheet', done);
        });
    });
    describe('Link Dialog', function () {
        this.timeout(30000);
        beforeEach('Reset and open dialog', openDialogAndReset);
        describe('Name Input', function () {
            this.slow(7000);
            it('should be editable when saved', function (done) {
                var name = getRandomString(25);
                getDialog(driver, 'link').then(function (dialog) {
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
            it('should not change when not saved', function (done) {
                var name = getRandomString(25);
                getDialog(driver, 'link').then(function (dialog) {
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
        });
        describe('Triggers', function () {
            this.slow(9000);
            it('should be addable/editable when saved', function (done) {
                getDialog(driver, 'link').then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return driver
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            driver
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
            it('should not change when not saved', function (done) {
                getDialog(driver, 'link').then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return driver
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            driver
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
        });
        describe('Content Types', function () {
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            it('should be editable through clicking on the checkboxes', function (done) {
                getDialog(driver, 'link').then(function (dialog) {
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
                getDialog(driver, 'link').then(function (dialog) {
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
                getDialog(driver, 'link').then(function (dialog) {
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
            it('should not change when not saved', function (done) {
                getDialog(driver, 'link').then(function (dialog) {
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
            this.slow(15000);
            it('open in new tab property should be editable', function (done) {
                getDialog(driver, 'link').then(function (dialog) {
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
                getDialog(driver, 'link').then(function (dialog) {
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
                getDialog(driver, 'link').then(function (dialog) {
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
                getDialog(driver, 'link').then(function (dialog) {
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
                        return driver.wait(new webdriver.promise.Promise(function (resolve) {
                            setTimeout(resolve, 500);
                        }));
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
                        return driver.wait(new webdriver.promise.Promise(function (resolve) {
                            setTimeout(resolve, 250);
                        }));
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
            it('should not change when not saved', function (done) {
                var newUrl = 'www.google.com';
                var defaultLink = {
                    newTab: true,
                    url: 'https://www.example.com'
                };
                getDialog(driver, 'link').then(function (dialog) {
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
        beforeEach('Reset and open dialog', switchToTypeResetAndOpenDialog('divider'));
        describe('Name Input', function () {
            this.slow(7000);
            it('should be editable when saved', function (done) {
                var name = getRandomString(25);
                getDialog(driver, 'divider').then(function (dialog) {
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
                        assert.strictEqual(crm[0].type, 'divider', 'divider is link');
                        assert.strictEqual(crm[0].name, name, 'name has been properly saved');
                        done();
                    });
                });
            });
            it('should not change when not saved', function (done) {
                var name = getRandomString(25);
                getDialog(driver, 'divider').then(function (dialog) {
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
        });
        describe('Triggers', function () {
            this.slow(9000);
            it('should be addable/editable when saved', function (done) {
                getDialog(driver, 'divider').then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return driver
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            driver
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
            it('should not change when not saved', function (done) {
                getDialog(driver, 'divider').then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return driver
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            driver
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
        });
        describe('Content Types', function () {
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            it('should be editable through clicking on the checkboxes', function (done) {
                getDialog(driver, 'divider').then(function (dialog) {
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
                getDialog(driver, 'divider').then(function (dialog) {
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
                getDialog(driver, 'divider').then(function (dialog) {
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
            it('should not change when not saved', function (done) {
                getDialog(driver, 'divider').then(function (dialog) {
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
        beforeEach('Reset and open dialog', switchToTypeResetAndOpenDialog('menu'));
        describe('Name Input', function () {
            this.slow(7000);
            it('should be editable when saved', function (done) {
                var name = getRandomString(25);
                getDialog(driver, 'menu').then(function (dialog) {
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
            it('should not change when not saved', function (done) {
                var name = getRandomString(25);
                getDialog(driver, 'menu').then(function (dialog) {
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
        });
        describe('Triggers', function () {
            this.slow(9000);
            it('should be addable/editable when saved', function (done) {
                getDialog(driver, 'menu').then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return driver
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            driver
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
            it('should not change when not saved', function (done) {
                getDialog(driver, 'menu').then(function (dialog) {
                    dialog
                        .findElement(webdriver.By.id('showOnSpecified'))
                        .click()
                        .then(function () {
                        return driver
                            .findElement(webdriver.By.id('addTrigger'))
                            .then(function (button) {
                            return button.click().then(function () {
                                return button.click();
                            });
                        });
                    }).then(function () {
                        setTimeout(function () {
                            driver
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
        });
        describe('Content Types', function () {
            this.slow(15000);
            var defaultContentTypes = [true, true, true, false, false, false];
            it('should be editable through clicking on the checkboxes', function (done) {
                getDialog(driver, 'menu').then(function (dialog) {
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
                getDialog(driver, 'menu').then(function (dialog) {
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
                getDialog(driver, 'menu').then(function (dialog) {
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
            it('should not change when not saved', function (done) {
                getDialog(driver, 'menu').then(function (dialog) {
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
