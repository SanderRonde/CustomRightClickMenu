var path = require('path');
var util = require('util');

var scriptImportReg = new RegExp(/<script src="([\w|\-|\/|\.]+)">([.|\s|\n]*)<\/script>/);
var otherImportTag = new RegExp(/<link( +)rel="(import|stylesheet)"( +)(type="css")?( +)?(href="([\w|\-|\/|\.]+)")?( ?)(\/)?>/);

function getScriptImport(fileObj) {
	var match;
	if ((match = scriptImportReg.exec(fileObj.file))) {
		fileObj.file = fileObj.file.replace(scriptImportReg, 'found');
		return match[1];
	}
	return false;
}

function getOtherImport(fileObj) {
	var match;
	if ((match = otherImportTag.exec(fileObj.file))) {
		fileObj.file = fileObj.file.replace(otherImportTag, 'found');
		return match[7];
	}
	return false;
}


function findImport(fileObj) {
	var importLoc;
	if ((importLoc = getScriptImport(fileObj)) || (importLoc = getOtherImport(fileObj))) {
		return importLoc;
	}
	return false;
}

function getImports(file, filesToCopy, path, grunt, passes) {
	var importLoc;
	var fileObj = {
		file: file
	};
	while ((importLoc = findImport(fileObj, filesToCopy, path))) {
		filesToCopy.push(path + importLoc);
		var newPath = importLoc.split('/');
		newPath = newPath.splice(0, newPath.length - 1).join('/') + '/';
		getImports(grunt.file.read(path + importLoc), filesToCopy, path + newPath, grunt, passes + 1);
	}
}

function collapsePath(path) {
	var pathSplit = path.split('/');
	var newPath = [];
	for (var i = 0; i < pathSplit.length; i++) {
		if (pathSplit[i] === '..') {
			newPath.pop();
		} else if (pathSplit[i] !== '') {
			newPath.push(pathSplit[i]);
		}
	}
	return newPath.join('/');
}

function collapsePaths(paths) {
	return paths.map(collapsePath);
}

function removeDuplicates(paths, ignore) {
	var newPaths = [];
	for (var i = 0; i < paths.length; i++) {
		if (newPaths.indexOf(paths[i]) === -1 && ignore.indexOf(paths[i]) === -1) {
			newPaths.push(paths[i]);
		}
	}
	return newPaths;
}

function removeCwdFolder(files, dir) {
	return files.map(function (file) {
		if (file.indexOf(dir) > -1) {
			return file.split(dir).splice(1).join(dir);
		}
		return file;
	});
}

function createFileImports(files) {
	var fileImports = [];
	for (var i = 0; i < files.length; i++) {
		//If it ends with .html
		if (files[i].split('').reverse().join('').indexOf('lmth.') === 0) {
			fileImports.push('<link rel="import" href="' + files[i] + '"/>');
		}
	}
	return fileImports;
}

function flattenFile(file, contFile) {
	var containingFolderIndex = contFile.length - 2;

	var i;
	var backs = 0;
	var fileSplit = file.split('/');
	for (i = 0; i < fileSplit.length; i++) {
		if (fileSplit[i] === '..') {
			backs++;
			containingFolderIndex--;
		} else {
			break;
		}
	}
	var contFileLastFolder = containingFolderIndex - 1;
	while (contFile.length > contFileLastFolder && fileSplit.length > i && contFile[containingFolderIndex + 1] === fileSplit[i]) {
		containingFolderIndex++;
		i++;
		backs--;
	}

	var newFile = [];
	for (var j = 0; j < backs; j++) {
		newFile.push('..');
	}
	for (;i < fileSplit.length; i++) {
		newFile.push(fileSplit[i]);
	}
	return newFile.join('/');
}

function flattenFiles(files, contFile) {
	contFile = contFile.split('/');
	return files.map(function(file) {
		return flattenFile(file, contFile);
	});
}

module.exports = function (grunt) {
	grunt.registerMultiTask('copyImportedElements', 'Extracts the imported elements and copies them to given output folder', function () {
		var fileObj = this.files[0];
		var srcFile = fileObj.src[0];
		var destFolder = fileObj.orig.dest;
		var options = this.data.options;
		options.rootPath = options.rootPath || '';
		options.ignore = options.ignore || [];

		var srcFolder = fileObj.orig.src[0].split('/');
		srcFolder = srcFolder.splice(0, srcFolder.length - 1);
		srcFolder = srcFolder.join('/') + '/';

		var filesToCopy = [];
		var srcFileContents = grunt.file.read(srcFile);
		getImports(srcFileContents, filesToCopy, fileObj.orig.cwd + srcFolder, grunt, 0);
		filesToCopy = collapsePaths(filesToCopy);
		filesToCopy = removeCwdFolder(filesToCopy, 'app/');
		filesToCopy = removeDuplicates(filesToCopy, options.ignore);

		var copyOptions = {
			encoding: grunt.file.defaultEncoding,
			process: false,
			noProcess: []
		}

		//Export files to dest folder
		for (var i = 0; i < filesToCopy.length; i++) {
			grunt.file.copy('app/' + filesToCopy[i], destFolder + filesToCopy[i], copyOptions);
		}
		grunt.log.ok('Copied imported elements, ' + srcFile + ' -> ' + fileObj.orig.dest);


		//Construct the new container file
		var prefix = fileObj.orig.cwd.split('/').length - 2;
		var prefixArr = [];
		prefixArr[prefix] = '';
		prefix = prefixArr.join('../');

		filesToCopy = filesToCopy.map(function(file) {
			return prefix + file;
		});

		var dest = fileObj.orig.dest + srcFile.split(options.rootFolder).splice(1).join(options.rootFolder);
		filesToCopy = flattenFiles(filesToCopy, dest);

		var fileImports = createFileImports(filesToCopy);
		var containerFile = fileImports.join('\n');
		grunt.file.write(dest, containerFile);
		grunt.log.ok('Created container file ' + srcFile + ' -> ' + dest);
	});
}