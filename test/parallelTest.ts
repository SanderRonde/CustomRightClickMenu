/// <reference path="../tools/definitions/mocha.d.ts"/>
/// <reference path="../tools/definitions/promises.d.ts"/>

import Mocha = require('mocha');
import fs = require('fs');

interface ReporterBase {
	color: (type: string, str: string) => string; 
}

const Base: ReporterBase = require('./resources/reporterBase.js');
const inherits = require('util').inherits;
const color = Base.color;

let failedTests: boolean = false;

const enum Side {
	LEFT = 0,
	RIGHT = 1
}

function initRunner(side: Side): Mocha.IRunner {
	const mocha = new Mocha();
	mocha.addFile('test/test.js');
	return mocha.run((failures) => {
		if (failures > 0) {
			failedTests = true;
		}
	});
}

function getRunnerPromise(runner: Mocha.IRunner): Promise<any> {
	return new Promise((resolve) => {
		runner.on('end', () => {
			resolve();
		});
	});
}

type TestSpeed = 'slow'|'medium'|'fast';

type TestStatus = 'pass'|'fail';

interface ErrorData {
	message: string;
	stack: string;
}

interface ChangeBaseData {
	fullTitle: string;
	title: string;
	speed: TestSpeed;
	status: TestStatus;
}

interface PassedData extends ChangeBaseData {
	status: 'pass';
}

interface FailedData extends ChangeBaseData {
	status: 'fail';
	errData: ErrorData;
}

type ChangeData = PassedData | FailedData;

type ReporterStatus = 'setup'|'running'|'done';

class Reporter {
	done: Promise<void>;

	onchange: (data: ChangeData, side: Side) => void;
	onSuiteStatusChange: (suite: string, action: 'enter'|'exit', side: Side) => void;

	total: number;
	current: number = 0;

	status: ReporterStatus;

	constructor(public runner: Mocha.IRunner, public side: Side) {
		this.done = getRunnerPromise(runner);
		this.total = runner.total;
		this.status = 'setup';

		this.setupStatusListeners();
		this.setupDataListeners();
		this.setupSuiteListeners();
	}

	setupStatusListeners() {
		this.runner.on('start', () => {
			this.status = 'running';
		});
		this.runner.on('end', () => {
			this.status = 'done';
		});
	}

	setupDataListeners() {
		this.runner.on('pass', (test) => {
			this.onchange({
				fullTitle: test.fullTitle(),
				title: test.title,
				speed: test.speed,
				status: 'pass'
			}, this.side);
			this.current++;
		});
		this.runner.on('fail', (test) => {
			this.onchange({
				fullTitle: test.fullTitle(),
				title: test.title,
				speed: test.speed,
				status: 'fail',
				errData: {
					message: test.message,
					stack: test.stack
				}
			}, this.side);
			this.current++;
		});
	}

	setupSuiteListeners() {
		this.runner.on('suite', (suite) => {
			this.onSuiteStatusChange(suite.title, 'enter', this.side);
		});
		this.runner.on('suite end', (suite) => {
			this.onSuiteStatusChange(suite.title, 'exit', this.side);
		});
	}
}

interface TestData {
	status: TestStatus;
	speed: TestSpeed;
	duration: number;
}

interface ReporterData {
	total: number;
	reporter: Reporter;
	tests: Array<TestData>;
	errors: Array<{
		name: string;
		data: ErrorData;
	}>
}

interface TestBase {
	title: string;
	type: 'suite'|'single';
}

interface TestSuite extends TestBase {
	type: 'suite';
	tests: Array<Tests>;
}

interface SingleTest extends TestBase {
	type: 'single';
	index: number;
}

type Tests = TestSuite|SingleTest;

class ReporterContainer {
	data: {
		[side: number]: ReporterData
	};
	tests: Array<Tests> = [];
	currentSuites: Array<string> = []; 

	constructor(reporter1: Reporter, reporter2: Reporter) {
		Promise.all([reporter1.done, reporter2.done]).then(() => {
			this.outputFinalReport();
		});
		const reporters: [Reporter, Reporter] = [reporter1, reporter2];
		reporters.forEach((reporter) => {
			reporter.onchange = this.dataChange;
			reporter.onSuiteStatusChange = this.suiteChange;

			this.data[reporter.side] = {
				total: reporter.total,
				tests: [],
				reporter: reporter,
				errors: []
			}
		}); 
	}

	_getOtherSide(side: Side): Side {
		if (side === Side.LEFT) {
			return Side.RIGHT;
		}
		return Side.LEFT;
	}

	_isLeader(side: Side): boolean {
		//Hello from the
		const otherSide = this._getOtherSide(side);
		if (this.data[side].reporter.current > 
			this.data[otherSide].reporter.current) {
				return true;
			}
		return false;
	}

	suiteChange(suite: string, action: 'enter'|'exit', side: Side): void {
		if (!this._isLeader(side)) {
			return;
		}
		if (action === 'enter') {
			this.currentSuites.push(suite);
		} else {
			this.currentSuites.pop();
		}
	}

	dataChange(data: ChangeData, side: Side): void {
		if (data.status === 'pass') {
			
		}
	}

	outputFinalReport() {

	}
}

const reporter = new ReporterContainer(
	new Reporter(initRunner(Side.LEFT), Side.LEFT),
	new Reporter(initRunner(Side.RIGHT), Side.RIGHT));

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