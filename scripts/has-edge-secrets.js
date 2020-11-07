const path = require("path");
const fs = require("fs");

(() => {
	if (
		fs.existsSync(
			path.join(
				__dirname,
				"../",
				"resources/buildresources/edge_secrets.json"
			)
		)
	) {
		process.exit(0);
	} else {
		process.exit(1);
	}
})();
