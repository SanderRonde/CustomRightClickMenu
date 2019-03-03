const path = require('path');
const fs = require('fs');

(() => {
	if (fs.existsSync(path.join(__dirname, '../',
		'resources/buildresources/edge_secrets.json'))) {
			process.exit(0);
		} else {
			console.log('Edge secrets not present, skipping edge packaging');
			process.exit(1);
		}
})();