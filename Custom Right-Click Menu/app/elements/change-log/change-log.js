(function() {
	Polymer({
		is: 'change-log',

		properties: {
			/**
			 * The changelog that is displayed
			 * 
			 * @attribute changelog
			 * @type Array
			 * @value []
			 */
			changelog: {
				type: Array,
				value: [],
				notify: true
			}
		},

		/**
		 * Turns the object-based changelog into an array-based changelog 
		 * for polymer to iterate through
		 * 
		 * @param {Object} changelog - The changelog to turn into an array
		 * @returns {Array} The changelog with the new structure
		 */
		makeChangelogArray: function (changelog) {
			var arrayChangelog = [];
			for (var versionEntry in changelog) {
				if (changelog.hasOwnProperty(versionEntry)) {
					arrayChangelog.push({
						version: versionEntry,
						changes: changelog[versionEntry]
					});
				}
			}
			return arrayChangelog;
		},

		/**
		 * Turns a version string into 3 seperate version parts
		 * 
		 * @param {String} versionString - The version in string-form
		 * @returns {Object} An object containing all 3 versions
		 *		in number form by their name.
		 */
		splitVersion: function(versionString) {
			var split = versionString.split('.');
			return {
				baseVersion: parseInt(split[0], 10),
				majorVersion: parseInt(split[1], 10),
				minorVersion: parseInt(split[2], 10)
			};
		},

		/**
		 * Compares two versions and returns true if A is lower,
		 *		false if B is lower and 0 if they are equal
		 * 
		 * @param {String} versionStringA - The version string of the first version-item
		 * @param {String} versionStringB - The version string of the second version-item 
		 * @returns {Boolean|Number} - A boolean indicating the result
		 */
		compareVersions: function(versionStringA, versionStringB) {
			var aSplit = this.splitVersion(versionStringA);
			var bSplit = this.splitVersion(versionStringB);

			if (aSplit.baseVersion !== bSplit.baseVersion) {
				return aSplit.baseVersion < bSplit.baseVersion;
			}

			if (aSplit.majorVersion !== bSplit.majorVersion) {
				return aSplit.majorVersion < bSplit.majorVersion;
			}

			if (aSplit.minorVersion !== bSplit.minorVersion) {
				return aSplit.minorVersion < bSplit.minorVersion;
			}

			return 0;
		},

		/**
		 * The function used in javascript's sort function
		 * 
		 * @param {Object} a - The first item to compare
		 * @param {Object} b - The second item to compare
		 * @returns {Boolean|Number} The result of the comparison
		 */
		sortFunction: function(a, b) {
			return window.changeLog.compareVersions(a.version, b.version);
		},

		/**
		 * Sorts the changelog from highest version first to lowest last
		 * 
		 * @param {Array} changelog - The changelog in the (probably) wrong order
		 * @returns {Array} The changelog in chronological order
		 */
		sortChangelog: function (changelog) {
			return changelog.sort(this.sortFunction);
		},

		ready: function() {
			window.changeLog = this;
			this.changelog = this.sortChangelog(this.makeChangelogArray(window.changelogLog));
		}
	});
}());