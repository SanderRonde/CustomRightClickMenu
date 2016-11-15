/// <reference path="../tools/definitions/mocha.d.ts"/>
/// <reference path="../tools/definitions/promises.d.ts"/>
"use strict";
var Mocha = require('mocha');
var fs = require('fs');
var quit = false;
var Base = require('./resources/reporterBase.js');
var inherits = require('util').inherits;
var cursor = Base.cursor;
var color = Base.color;
var failedTests = false;
var fileName = 'test/test.js';
var fileReads = 0;
var fileContents = null;
function createExtraFile() {
    if (fileReads === 0) {
        fileReads++;
        return fileName;
    }
    fileContents = fileContents || fs.readFileSync(fileName, {
        encoding: 'utf8'
    });
    var nameSplit = fileName.split('.');
    var name = nameSplit[0] + "-" + fileReads++ + "." + nameSplit.slice(1).join('.');
    fs.writeFileSync(name, fileContents, {
        encoding: 'utf8'
    });
    return name;
}
function deleteExtraFiles() {
    var nameSplit = fileName.split('.');
    for (var i = 1; i <= fileReads; i++) {
        try {
            fs.unlinkSync(nameSplit[0] + "-" + i + "." + nameSplit.slice(1).join('.'));
        }
        catch (e) {
            //File can't be deleted, it already has been
            break;
        }
    }
    process.exit(0);
}
process.on('exit', deleteExtraFiles);
process.on('SIGINT', deleteExtraFiles);
process.on('uncaughtException', function (e) {
    console.log(e);
    deleteExtraFiles();
});
function initRunner(side) {
    var mocha = new Mocha({
        reporter: function () { }
    });
    mocha.addFile(createExtraFile());
    var runner = mocha.run(function (failures) {
        if (failures > 0) {
            failedTests = true;
        }
    });
    return runner;
}
function getRunnerPromise(runner) {
    return new Promise(function (resolve) {
        runner.on('end', function () {
            resolve();
        });
    });
}
var Reporter = (function () {
    function Reporter(runner, side) {
        this.runner = runner;
        this.side = side;
        this.current = 0;
        this.done = getRunnerPromise(runner);
        this.total = runner.total;
        this.status = 'setup';
        this.setupStatusListeners();
        this.setupDataListeners();
        this.setupSuiteListeners();
    }
    Reporter.prototype.setupStatusListeners = function () {
        var _this = this;
        this.runner.on('start', function () {
            _this.status = 'running';
        });
        this.runner.on('end', function () {
            _this.status = 'done';
        });
    };
    Reporter.prototype._setTestSpeed = function (test) {
        var slow = test.slow();
        test.speed = (test.duration >= slow ?
            'slow' : (test.duration >= slow / 2 ?
            'medium' : 'fast'));
    };
    Reporter.prototype.setupDataListeners = function () {
        var _this = this;
        this.runner.on('pass', function (test) {
            _this.current++;
            _this._setTestSpeed(test);
            _this.onchange({
                fullTitle: test.fullTitle(),
                title: test.title,
                speed: test.speed,
                status: 'pass',
                duration: test.duration
            }, _this.side);
        });
        this.runner.on('fail', function (test, err) {
            _this.current++;
            _this._setTestSpeed(test);
            _this.onchange({
                fullTitle: test.fullTitle(),
                title: test.title,
                speed: test.speed,
                status: 'fail',
                errData: {
                    message: test.message,
                    stack: test.stack,
                    error: err
                },
                duration: test.duration
            }, _this.side);
        });
    };
    Reporter.prototype.setupSuiteListeners = function () {
        var _this = this;
        this.runner.on('suite', function (suite) {
            _this.current++;
            _this.onSuiteStatusChange(suite.title, 'enter', _this.side);
        });
        this.runner.on('suite end', function (suite) {
            _this.current++;
            _this.onSuiteStatusChange(suite.title, 'exit', _this.side);
        });
    };
    return Reporter;
}());
var ReporterContainer = (function () {
    function ReporterContainer(reporter1, reporter2) {
        var _this = this;
        this.data = {};
        this.indenting = 0;
        this.tests = [];
        Promise.all([reporter1.done, reporter2.done]).then(function () {
            _this.outputFinalReport();
            quit = true;
        });
        var reporters = [reporter1, reporter2];
        reporters.forEach(function (reporter) {
            reporter.onchange = _this.dataChange.bind(_this);
            reporter.onSuiteStatusChange = _this.suiteChange.bind(_this);
            _this.data[reporter.side] = {
                total: reporter.total,
                tests: [],
                reporter: reporter,
                errors: []
            };
        });
    }
    ReporterContainer.prototype._getOtherSide = function (side) {
        if (side === 0 /* LEFT */) {
            return 1 /* RIGHT */;
        }
        return 0 /* LEFT */;
    };
    ReporterContainer.prototype._isLeader = function (side) {
        //Hello from the
        var otherSide = this._getOtherSide(side);
        if (this.data[side].reporter.current >=
            this.data[otherSide].reporter.current) {
            return true;
        }
        return false;
    };
    ReporterContainer.prototype._isNotLeader = function (side) {
        //Hello from the
        var otherSide = this._getOtherSide(side);
        if (this.data[side].reporter.current <=
            this.data[otherSide].reporter.current) {
            return true;
        }
        return false;
    };
    ReporterContainer.prototype.suiteChange = function (suite, action, side) {
        if (this._isNotLeader(side)) {
            if (action === 'enter') {
                process.stdout.write(color('suite', "" + this._getIndenting(this.indenting) + suite + "\n"));
                this.indenting++;
            }
            else {
                this.indenting--;
            }
        }
    };
    ReporterContainer.prototype.dataChange = function (data, side) {
        if (data.status === 'fail') {
            this.data[side].errors.push({
                name: data.fullTitle,
                data: data.errData
            });
        }
        this.data[side].tests.push({
            status: data.status,
            speed: data.speed,
            duration: data.duration
        });
        if (this._isNotLeader(side)) {
            this.printLine(this.data[side].tests.length - 1, data.title);
        }
    };
    ReporterContainer.prototype._getIndenting = function (amount) {
        var str = [];
        for (var i = 0; i < amount; i++) {
            str.push('  ');
        }
        return str.join('');
    };
    ReporterContainer.prototype.printLine = function (index, name) {
        var leftTest = this.data[0 /* LEFT */].tests[index];
        var rightTest = this.data[1 /* RIGHT */].tests[index];
        var indent = this._getIndenting(this.indenting);
        if (leftTest.status === rightTest.status) {
            if (leftTest.status === 'pass') {
                //Both passed
                if (leftTest.speed === 'fast' && rightTest.speed === 'fast') {
                    console.log("" + indent + color('checkmark', Base.symbols.ok) + " " + color('checkmark', Base.symbols.ok) + color('pass', ' %s'), name);
                }
                else {
                    console.log("" + indent + color('checkmark', Base.symbols.ok) + " " + color('checkmark', Base.symbols.ok) + color('pass', ' %s') + color(leftTest.speed, ' (%dms)') + color(rightTest.speed, ' (%dms)'), name, leftTest.duration, rightTest.duration);
                    ;
                }
            }
            else {
                //Both failed
                console.log("" + indent + color('fail', 'X') + " " + color('fail', 'X') + color('fail', ' %s, %s) %s'), this.data[0 /* LEFT */].errors.length + "a", this.data[1 /* RIGHT */].errors.length + "b", name);
            }
        }
        else {
            var failedIsLeft = leftTest.status === 'fail';
            var isNotFast = failedIsLeft ? rightTest.speed !== 'fast' : leftTest.speed !== 'fast';
            var nonFastSpeed = failedIsLeft ? rightTest.speed : leftTest.speed;
            var errName = "" + this.data[failedIsLeft ? 0 /* LEFT */ : 1 /* RIGHT */].errors.length + (failedIsLeft ? 'a' : 'b');
            if (isNotFast) {
                var duration = failedIsLeft ? rightTest.duration : leftTest.duration;
                console.log("" + indent + (failedIsLeft ? color('fail', 'X') :
                    color('checkmark', Base.symbols.ok)) + " " + (!failedIsLeft ? color('fail', 'X') :
                    color('checkmark', Base.symbols.ok)) + " " + color('fail', " " + errName + ") " + name) + " " + color(nonFastSpeed, " (" + duration + "ms)"));
            }
            else {
                console.log("" + indent + (failedIsLeft ? color('fail', 'X') :
                    color('checkmark', Base.symbols.ok)) + " " + (!failedIsLeft ? color('fail', 'X') :
                    color('checkmark', Base.symbols.ok)) + " " + color('fail', " " + errName + ") " + name));
            }
        }
    };
    ReporterContainer.prototype.listErrors = function (errors, postfix) {
        errors.forEach(function (test, i) {
            // format
            var fmt = color('error title', '  %s) %s:\n') +
                color('error message', '     %s') +
                color('error stack', '\n%s\n');
            // msg
            var msg;
            var err = test.data.error;
            var message;
            if (err.message && typeof err.message.toString === 'function') {
                message = err.message + '';
            }
            else if (typeof err.inspect === 'function') {
                message = err.inspect() + '';
            }
            else {
                message = '';
            }
            var stack = err.stack || message;
            var index = message ? stack.indexOf(message) : -1;
            var actual = err.actual;
            var expected = err.expected;
            var escape = true;
            if (index === -1) {
                msg = message;
            }
            else {
                index += message.length;
                msg = stack.slice(0, index);
                // remove msg from stack
                stack = stack.slice(index + 1);
            }
            // uncaught
            if (err.uncaught) {
                msg = 'Uncaught ' + msg;
            }
            // explicitly show diff
            if (err.showDiff !== false && Base.sameType(actual, expected) && expected !== undefined) {
                escape = false;
                if (!(Base.utils.isString(actual) && Base.utils.isString(expected))) {
                    err.actual = actual = Base.utils.stringify(actual);
                    err.expected = expected = Base.utils.stringify(expected);
                }
                fmt = color('error title', '  %s) %s:\n%s') + color('error stack', '\n%s\n');
                var match = message.match(/^([^:]+): expected/);
                msg = '\n      ' + color('error message', match ? match[1] : msg);
                msg += Base.unifiedDiff(err, escape);
            }
            // indent stack trace
            stack = stack.replace(/^/gm, '  ');
            console.log(fmt, (i + 1) + postfix, test.name, msg, stack);
        });
    };
    ReporterContainer.prototype.outputFinalReport = function () {
        var _this = this;
        console.log('done');
        if (this.data[0 /* LEFT */].errors.length > 0 || this.data[1 /* RIGHT */].errors.length > 0) {
            [0 /* LEFT */, 1 /* RIGHT */].forEach(function (side) {
                if (_this.data[side].errors.length > 0) {
                    _this.listErrors(_this.data[side].errors, side === 0 /* LEFT */ ?
                        'a' : 'b');
                }
            });
        }
        cursor.show();
    };
    return ReporterContainer;
}());
cursor.hide();
var reporter = new ReporterContainer(new Reporter(initRunner(0 /* LEFT */), 0 /* LEFT */), new Reporter(initRunner(1 /* RIGHT */), 1 /* RIGHT */));
function preventQuit() {
    if (!quit) {
        setInterval(preventQuit, 500);
    }
    else {
        process.exit(0);
    }
}
preventQuit();
