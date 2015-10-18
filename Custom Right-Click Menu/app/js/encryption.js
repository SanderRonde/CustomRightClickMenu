var chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function doubleKey(key) {
	var result;
	key.forEach(function (item) {
		item = parseInt(item, 10);
		result = item * 2;
		return (result > 99 ? result - 100 : result);
	});
	return key;
}

function ec(target, key) {
	var i;
	var keys = [];
	var newTarget = {};
	target.verified = true;
	for (var objKey in target) {
		if (target.hasOwnProperty(objKey)) {
			keys.push({
				key: objKey,
				val: target[objKey]
			});
		}
	}

	var keyCopy = [];
	key.forEach(function (item, index) {
		keyCopy[index] = item;
	});

	key = keyCopy;

	var index;
	console.log(keys);
	var length = keys.length;

	for (i = 0; i < length; i++) {
		newTarget[chars[Math.round(Math.random() * 26)] + (Math.round(Math.random() * 1000) >>> 0).toString(2)] = (Math.round(Math.random() * 1000) >>> 0).toString(2);
		index = Math.round(Math.random() * (keys.length - 1));
		newTarget[keys[index].key] = keys[index].val;
		keys.splice(index, 1);
	}

	console.log(newTarget);

	key = doubleKey(key);
	target = JSON.stringify(newTarget);

	console.log(target);

	var j = 0;
	var charcodes = [];
	length = target.length;
	for (i = 0; i < length; i++, j++) {
		if (j > 25) {
			key = doubleKey(key);
			j = 0;
		}
		charcodes[i] = target.charCodeAt(i) ^ key[j];
	}
	console.log(charcodes);
	return charcodes;
}

function de(target, key) {
	var keyCopy = [];
	console.log(key);
	key.forEach(function (item, index) {
		keyCopy[index] = item;
	});
	key = keyCopy;
	console.log(key);
	key = doubleKey(key);
	console.log(key);

	var i;
	var j = 0;
	var results = [];
	for (i = 0; i < target.length; i++, j++) {
		if (j > 25) {
			key = doubleKey(key);
			j = 0;
		}
		results[i] = String.fromCharCode(target[i] ^ key[j]);
	}
	results = results.join('');
	console.log(results);
	try {
		results = JSON.parse(results);
		console.log(results);
		var equal = true;
		keyCopy.forEach(function (item, index) {
			if (item !== results.secretKey[index]) {
				console.log(item, results.secretKey[index]);
				equal = false;
				return false;
			}
		});
		if (results.verified && equal) {
			return results;
		}
		return false;
	} catch (e) {
		return false;
	}
}