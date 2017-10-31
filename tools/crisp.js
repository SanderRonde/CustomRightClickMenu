const inFile = process.argv.slice(-1)[0];
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Crisps given file
 * 
 * @param sourceFile {string} - The source file
 * @param [dest] {string} - The output location
 * 
 * @returns {Promise} A promise that resolves with an exit code
 */
function crispFile(sourceFile, dest) {
	dest = dest || sourceFile;
	return new Promise((resolve, reject) => {
		sourceFile = path.join(process.cwd(), sourceFile);
		dest = path.join(process.cwd(), dest);
		const outputHtmlFile = dest;
		const outputJsFile = dest.replace('.html', '.js');

		const proc = spawn('C:\\Users\\sande\\AppData\\Roaming\\npm\\crisper.cmd', [
			'-s', sourceFile, '-h', outputHtmlFile, '-j', outputJsFile, '--script-in-head=false'
		]);

		proc.stdout.on('data', (data) => {
			console.log(data.toString());
		});
		proc.stderr.on('data', (data) => {
			console.log(`Err: ${data.toString()}`);
		});
		proc.on('close', (code) => {
			resolve(code);
		});
	});
}

/**
 * Gets the children of given folder and its children etc.
 * 
 * @param folder {string} - The folder whose children to find
 * @param files {string[]} - An array containing all children
 */
function getChildrenRecursively(folder, files) {
	fs.readdirSync(folder).forEach((dirChild) => {
		const joined = path.join(folder, dirChild);
		if (fs.statSync(joined).isDirectory()) {
			getChildrenRecursively(joined, files);
		} else {
			files.push(joined);
		}
	});
}

if (require.main === module) {
	if (fs.statSync(inFile).isDirectory()) {
		//Get all children and do it for them instead
		const children = [];
		getChildrenRecursively(inFile, children);
		Promise.all(children.map(inFile => crispFile(inFile))).then((exitCodes) => {
			if (exitCodes.filter(code => code !== 0).length > 0) {
				const nonZero = exitCodes.filter(code => code !== 0);
				process.exit(nonZero[0]);
			}
		}).catch((err) => {
			console.log(err);
		});
	} else {
		crispFile(inFile).then((code) => {
			process.exit(code);
		}).catch((err) => {
			console.log(err);
		});
	}
} else {
	module.exports = function(grunt) {
		grunt.registerMultiTask('crisp', 'Crisps given glob', function() {
			let crisped = 0;
			const done = this.async();
			Promise.all(this.files.map((file) => {
				return Promise.all(file.src.map((srcFile) => {
					return new Promise((resolve) => {
						crispFile(srcFile, srcFile.dest).then(() => {
							grunt.log.ok('Crisped ', srcFile);
							crisped++;
							resolve();
						}).catch((err) => {
							console.log(err);
						});
					});
				}));
			})).then(() => {
				if (crisped === 0) {
					grunt.log.warn('Didn\'t crisp anything, are you sure the config is OK?');
				}
				done();
			});
		});
	}
}