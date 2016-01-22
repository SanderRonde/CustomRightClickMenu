//TODO remove from production

//Used for testing the speed of various functions
function getDuration(fn, iterations) {
	var timeStart = new Date();
	for (var i = 0; i < iterations; i++) {
		fn();
	}
	var timeEnd = new Date();
	return timeEnd - timeStart;
}


function findIterationsNumber(fn) {
	var iterations = 10;
	var result;
	do {
		result = getDuration(fn, iterations);
		iterations = iterations * Math.sqrt(10);
	} while (result < 1000)
	return iterations;
}

function test(fn) {
	console.log('Testing function...');
	var iterations = findIterationsNumber(fn);
	var duration = getDuration(fn, iterations);
	console.log('');
	console.log('Result:');
	console.log('Execution of function took ' + duration + 'ms over ' + iterations + ' iterations aka ' + (duration / iterations) + 'ms/execution');
	console.log('');
}

function compare() {
	console.log('Comparing functions...');
	var i;
	var functions = arguments;
	var minIterations = Infinity;

	console.log('Getting times... this may take up to ' + (3 * functions.length) + ' seconds');
	var currentIterations;
	for (i = 0; i < functions.length; i++) {
		currentIterations = findIterationsNumber(functions[i]);
		console.log('Found ' + (i + 1) + '/' + functions.length);
		if (currentIterations < minIterations) {
			minIterations = currentIterations;
		}
	}

	var highest = 0;
	var lowest = Infinity;

	console.log('Running functions');
	var result;
	var results = [];
	for (i = 0; i < functions.length; i++) {
		result = getDuration(functions[i], minIterations);
		console.log('Got result ' + (i + 1) + '...');
		if (result > highest) {
			highest = result;
		} else if (result < lowest) {
			lowest = result;
		}
		results[i] = result;
	}

	console.log('');
	console.log('Results:');
	for (i = 0; i < results.length; i++) {
		console.log('Function number ' + (i + 1) + ' took ' + results[i] + 'ms ' + (highest === results[i] ? '(highest) ' : (lowest === results[i] ? '(lowest) ' : '')));
	}
}