/// <reference path="../tools/definitions/mocha.d.ts"/>
/// <reference path="../tools/definitions/promises.d.ts"/>

import Mocha = require('mocha');
import fs = require('fs');
import readline = require('readline');

interface ReporterBase {
	color: (type: string, str: string) => string; 
	cursor: {
		hide(),
		show(),
		deleteLine(),
		beginningOfLine(),
		CR()
	};
	symbols: {
		ok: string;
		err: string;
		dot: string;
		comma: string;
		bang: string;
	},
	sameType(a: any, b: any): boolean;
	utils: any;
	unifiedDiff(err, escape);
}

let quit: boolean = false;
const Base: ReporterBase = require('./resources/reporterBase.js');
const inherits = require('util').inherits;
const cursor = Base.cursor;
const color = Base.color;

let failedTests: boolean = false;

//Reading the same file twice with mocha does not work,
//	it will try to re-read the exports which of course
//	is nothing as you define tests with describe(), it() etc.
//So store the tests of the first read one in a variable and
//	assign it to the second one
//let firstReadTests = null;

const enum Side {
	LEFT = 0,
	RIGHT = 1
}

const fileName = 'test/test.js';
let fileReads = 0;
let fileContents: string = null;

function createExtraFile(): string {
	if (fileReads === 0) {
		fileReads++;
		return fileName;
	}

	fileContents = fileContents || fs.readFileSync(fileName, {
		encoding: 'utf8'
	});
	let nameSplit = fileName.split('.');
	const name = `${nameSplit[0]}-${fileReads++}.${nameSplit.slice(1).join('.')}`;

	fs.writeFileSync(name, fileContents, {
		encoding: 'utf8'
	});	

	return name;
}

function deleteExtraFiles() {
	let nameSplit = fileName.split('.');
	for (let i = 1; i <= fileReads; i++) {
		try {
			fs.unlinkSync(`${nameSplit[0]}-${i}.${nameSplit.slice(1).join('.')}`)
		} catch (e) {
			//File can't be deleted, it already has been
			break;
		}
	}

	process.exit(0);
}

process.on('exit', deleteExtraFiles);
process.on('SIGINT', deleteExtraFiles);
process.on('uncaughtException', (e) => {
	console.log(e);
	deleteExtraFiles();
});

function initRunner(side: Side): Mocha.IRunner {
	const mocha = new Mocha({
		reporter: function () {}
	});
	mocha.addFile(createExtraFile());
	const runner = mocha.run((failures) => {
		if (failures > 0) {
			failedTests = true;
		}
	});
	return runner;
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
	error: any;
}

interface ChangeBaseData {
	fullTitle: string;
	title: string;
	speed: TestSpeed;
	status: TestStatus;
	duration: number;
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

	_setTestSpeed(test: Mocha.TestData) {
		const slow = test.slow();
		test.speed = (test.duration >= slow ? 
			'slow' : (test.duration >= slow / 2 ?
				'medium' : 'fast'));
	}

	setupDataListeners() {
		this.runner.on('pass', (test) => {
			this.current++;
			this._setTestSpeed(test);
			this.onchange({
				fullTitle: test.fullTitle(),
				title: test.title,
				speed: test.speed,
				status: 'pass',
				duration: test.duration
			}, this.side);
		});
		this.runner.on('fail', (test, err) => {
			this.current++;
			this._setTestSpeed(test);
			this.onchange({
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
			}, this.side);
		});
	}

	setupSuiteListeners() {
		this.runner.on('suite', (suite) => {
			this.current++;
			this.onSuiteStatusChange(suite.title, 'enter', this.side);
		});
		this.runner.on('suite end', (suite) => {
			this.current++;
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

interface Tests {
	index: number;
	title: string;
}

interface ErrorCont {
	[key: number]: number;
}

class ReporterContainer {
	data: {
		[side: number]: ReporterData
	} = {};
	indenting: number = 0;
	tests: Array<Tests> = [];

	constructor(reporter1: Reporter, reporter2: Reporter) {
		Promise.all([reporter1.done, reporter2.done]).then(() => {
			this.outputFinalReport();
			quit = true;
		});
		const reporters: [Reporter, Reporter] = [reporter1, reporter2];
		reporters.forEach((reporter) => {
			reporter.onchange = this.dataChange.bind(this);
			reporter.onSuiteStatusChange = this.suiteChange.bind(this);

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
		if (this.data[side].reporter.current >= 
			this.data[otherSide].reporter.current) {
				return true;
			}
		return false;
	}

	_isNotLeader(side: Side): boolean {
		//Hello from the
		const otherSide = this._getOtherSide(side);
		if (this.data[side].reporter.current <= 
			this.data[otherSide].reporter.current) {
				return true;
			}
		return false;
	}

	suiteChange(suite: string, action: 'enter'|'exit', side: Side): void {
		if (this._isNotLeader(side)) {
			if (action === 'enter') {
				process.stdout.write(color('suite',
					`${this._getIndenting(this.indenting)}${suite}\n`));
				this.indenting++;
			} else {
				this.indenting--;
			}
		}
	}

	dataChange(data: ChangeData, side: Side): void {
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
	}

	_getIndenting(amount: number): string {
		let str = [];
		for (let i = 0; i < amount; i++) {
			str.push('  ');
		}
		return str.join('');
	}

	printLine(index: number, name: string) {
		const leftTest = this.data[Side.LEFT].tests[index];
		const rightTest = this.data[Side.RIGHT].tests[index];
		const indent = this._getIndenting(this.indenting);

		if (leftTest.status === rightTest.status) {
			if (leftTest.status === 'pass') {
				//Both passed
				if (leftTest.speed === 'fast' && rightTest.speed === 'fast') {
					console.log(`${indent}${color('checkmark', Base.symbols.ok)} ${
						color('checkmark', Base.symbols.ok)
					}${
						color('pass', ' %s')
					}`, name);
				} else {
					console.log(`${indent}${color('checkmark', Base.symbols.ok)} ${
						color('checkmark', Base.symbols.ok)
					}${
						color('pass', ' %s')
					}${color(leftTest.speed, ' (%dms)')}${color(rightTest.speed, ' (%dms)')}`,
						name, leftTest.duration, rightTest.duration);;
				}
			} else {	
				//Both failed
				console.log(`${indent}${color('fail', 'X')} ${
					color('fail', 'X')}${color('fail', ' %s, %s) %s')}`, 
					`${this.data[Side.LEFT].errors.length}a`,
					`${this.data[Side.RIGHT].errors.length}b`, name);
			}
		} else {
			const failedIsLeft = leftTest.status === 'fail';
			const isNotFast = failedIsLeft ? rightTest.speed !== 'fast' : leftTest.speed !== 'fast';
			const nonFastSpeed = failedIsLeft ? rightTest.speed : leftTest.speed;

			const errName = `${this.data[failedIsLeft ? Side.LEFT : Side.RIGHT].errors.length}${
				failedIsLeft ? 'a' : 'b'
			}`;
			if (isNotFast) {
				const duration = failedIsLeft ? rightTest.duration : leftTest.duration;
				console.log(`${indent}${failedIsLeft ? color('fail', 'X') : 
					color('checkmark', Base.symbols.ok)} ${!failedIsLeft ? color('fail', 'X') : 
					color('checkmark', Base.symbols.ok)} ${color('fail', ` ${errName}) ${name}`)} ${
						color(nonFastSpeed, ` (${duration}ms)`)
					}`);
			} else {
				console.log(`${indent}${failedIsLeft ? color('fail', 'X') :
					color('checkmark', Base.symbols.ok)} ${!failedIsLeft ? color('fail', 'X') : 
					color('checkmark', Base.symbols.ok)} ${color('fail', ` ${errName}) ${name}`)}`);
			}
		}
	}

	listErrors(errors: Array<{
		name: string;
		data: ErrorData
	}>, postfix: string) {
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
			} else if (typeof err.inspect === 'function') {
				message = err.inspect() + '';
			} else {
				message = '';
			}
			var stack = err.stack || message;
			var index = message ? stack.indexOf(message) : -1;
			var actual = err.actual;
			var expected = err.expected;
			var escape = true;

			if (index === -1) {
				msg = message;
			} else {
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
	}

	outputFinalReport() {
		console.log('done');
		if (this.data[Side.LEFT].errors.length > 0 || this.data[Side.RIGHT].errors.length > 0) {
			[Side.LEFT, Side.RIGHT].forEach((side) => {
				if (this.data[side].errors.length > 0) {
					this.listErrors(this.data[side].errors, side === Side.LEFT ?
						'a' : 'b');
				}
			});
		}

		cursor.show();	
	}
}

cursor.hide();
const reporter = new ReporterContainer(
	new Reporter(initRunner(Side.LEFT), Side.LEFT),
	new Reporter(initRunner(Side.RIGHT), Side.RIGHT));


function preventQuit() {
	if (!quit) {
		setInterval(preventQuit, 500);
	} else {
		process.exit(0);
	}
}
preventQuit();