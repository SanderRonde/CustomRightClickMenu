/// <reference path="../tools/definitions/mocha.d.ts"/>
/// <reference path="../tools/definitions/promises.d.ts"/>
"use strict";
var Mocha = require('mocha');
var quit = false;
var Base = require('./resources/reporterBase.js');
var inherits = require('util').inherits;
var cursor = Base.cursor;
var color = Base.color;
var failedTests = false;
//Reading the same file twice with mocha does not work,
//	it will try to re-read the exports which of course
//	is nothing as you define tests with describe(), it() etc.
//So store the tests of the first read one in a variable and
//	assign it to the second one
var firstReadTests = null;
function initRunner(side) {
    var mocha = new Mocha({
        reporter: function () { }
    });
    mocha.addFile('test/test.js');
    var runner = mocha.run(function (failures) {
        if (failures > 0) {
            failedTests = true;
        }
    });
    if (firstReadTests === null) {
        firstReadTests = Object.assign({}, runner.suites);
    }
    else {
        runner.suites = firstReadTests;
    }
    return runner;
}
function getRunnerPromise(runner) {
    return new Promise(function (resolve) {
        console.log('adding listener');
        runner.on('end', function () {
            console.log('ended');
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
    Reporter.prototype.setupDataListeners = function () {
        var _this = this;
        this.runner.on('pass', function (test) {
            _this.onchange({
                fullTitle: test.fullTitle(),
                title: test.title,
                speed: test.speed,
                status: 'pass',
                duration: test.duration
            }, _this.side);
            _this.current++;
        });
        this.runner.on('fail', function (test) {
            _this.onchange({
                fullTitle: test.fullTitle(),
                title: test.title,
                speed: test.speed,
                status: 'fail',
                errData: {
                    message: test.message,
                    stack: test.stack
                },
                duration: test.duration
            }, _this.side);
            _this.current++;
        });
    };
    Reporter.prototype.setupSuiteListeners = function () {
        var _this = this;
        this.runner.on('suite', function (suite) {
            _this.onSuiteStatusChange(suite.title, 'enter', _this.side);
        });
        this.runner.on('suite end', function (suite) {
            _this.onSuiteStatusChange(suite.title, 'exit', _this.side);
        });
    };
    return Reporter;
}());
var ReporterContainer = (function () {
    function ReporterContainer(reporter1, reporter2) {
        var _this = this;
        this.data = {};
        this.tests = [];
        this.currentSuites = [];
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
        if (this.data[side].reporter.current >
            this.data[otherSide].reporter.current) {
            return true;
        }
        return false;
    };
    ReporterContainer.prototype.suiteChange = function (suite, action, side) {
        console.log(action + " suite " + suite + " for side " + side);
        if (!this._isLeader(side)) {
            return;
        }
        if (action === 'enter') {
            this.currentSuites.push(suite);
        }
        else {
            this.currentSuites.pop();
        }
    };
    ReporterContainer.prototype.dataChange = function (data, side) {
        if (this._isLeader(side)) {
            var currentSuite = this;
            for (var i = 0; i < this.currentSuites.length; i++) {
                for (var j = currentSuite.tests.length - 1; j >= 0; j--) {
                    var possibleSuite = currentSuite.tests[j];
                    if (possibleSuite.title === this.currentSuites[i] &&
                        possibleSuite.type === 'suite') {
                        currentSuite = possibleSuite;
                        break;
                    }
                }
            }
            currentSuite.tests.push({
                title: data.title,
                type: 'single',
                index: this.data[side].tests.length
            });
        }
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
        //this.printData();
    };
    ReporterContainer.prototype._getTabs = function (amount) {
        var str = [];
        for (var i = 0; i < amount; i++) {
            str.push('\t');
        }
        return str.join('');
    };
    ReporterContainer.prototype._printTest = function (name, index, indenting) {
        process.stdout.write(this._getTabs(indenting) + " Test " + name + "\n");
    };
    ReporterContainer.prototype._printSuite = function (name, tests, indenting) {
        process.stdout.write(this._getTabs(indenting) + " Suite " + name + "\n");
        for (var i = 0; i < tests.length; i++) {
            var test_1 = this.tests[i];
            if (test_1.type === 'suite') {
                this._printSuite(test_1.title, test_1.tests, indenting + 1);
            }
            else {
                this._printTest(test_1.title, test_1.index, indenting + 1);
            }
        }
    };
    ReporterContainer.prototype.printData = function () {
        var indenting = 1;
        for (var i = 0; i < this.tests.length; i++) {
            var test_2 = this.tests[i];
            if (test_2.type === 'suite') {
                this._printSuite(test_2.title, test_2.tests, 1);
            }
            else {
                this._printTest(test_2.title, test_2.index, 1);
            }
        }
    };
    ReporterContainer.prototype.outputFinalReport = function () {
        console.log('Final report');
        this.printData();
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
}
preventQuit();
// function Dot (runner) {
//   Base.call(this, runner);
//   var self = this;
//   var width = Base.window.width * 0.75 | 0;
//   var n = -1;
//   runner.on('start', function () {
//     process.stdout.write('\n');
//   });
//   runner.on('pending', function () {
//     if (++n % width === 0) {
//       process.stdout.write('\n  ');
//     }
//     process.stdout.write(color('pending', Base.symbols.comma));
//   });
//   runner.on('pass', function (test) {
//     if (++n % width === 0) {
//       process.stdout.write('\n  ');
//     }
//     if (test.speed === 'slow') {
//       process.stdout.write(color('bright yellow', Base.symbols.dot));
//     } else {
//       process.stdout.write(color(test.speed, Base.symbols.dot));
//     }
//   });
//   runner.on('fail', function () {
//     if (++n % width === 0) {
//       process.stdout.write('\n  ');
//     }
//     process.stdout.write(color('fail', Base.symbols.bang));
//   });
//   runner.on('end', function () {
//     console.log();
//     Base.epilogue();
//   });
// }
// inherits(Dot, Base);
// 'use strict';
// /**
//  * Module dependencies.
//  */
// var Base = require('./base');
// var inherits = require('../utils').inherits;
// var color = Base.color;
// /**
//  * Expose `Spec`.
//  */
// exports = module.exports = Spec;
// /**
//  * Initialize a new `Spec` test reporter.
//  *
//  * @api public
//  * @param {Runner} runner
//  */
// function Spec (runner) {
//   Base.call(this, runner);
//   var self = this;
//   var indents = 0;
//   var n = 0;
//   function indent () {
//     return Array(indents).join('  ');
//   }
//   runner.on('start', function () {
//     console.log();
//   });
//   runner.on('suite', function (suite) {
//     ++indents;
//     console.log(color('suite', '%s%s'), indent(), suite.title);
//   });
//   runner.on('suite end', function () {
//     --indents;
//     if (indents === 1) {
//       console.log();
//     }
//   });
//   runner.on('pending', function (test) {
//     var fmt = indent() + color('pending', '  - %s');
//     console.log(fmt, test.title);
//   });
//   runner.on('pass', function (test) {
//     var fmt;
//     if (test.speed === 'fast') {
//       fmt = indent() +
//         color('checkmark', '  ' + Base.symbols.ok) +
//         color('pass', ' %s');
//       console.log(fmt, test.title);
//     } else {
//       fmt = indent() +
//         color('checkmark', '  ' + Base.symbols.ok) +
//         color('pass', ' %s') +
//         color(test.speed, ' (%dms)');
//       console.log(fmt, test.title, test.duration);
//     }
//   });
//   runner.on('fail', function (test) {
//     console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
//   });
//   runner.on('end', self.epilogue.bind(self));
// }
// /**
//  * Inherit from `Base.prototype`.
//  */
// inherits(Spec, Base); 
//# sourceMappingURL=parallelTest.js.map