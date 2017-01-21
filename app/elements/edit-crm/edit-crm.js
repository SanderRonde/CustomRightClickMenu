/// <reference path="../../../tools/definitions/_references.js"/>
'use strict';

window.Polymer({
	is: 'edit-crm',

	/*
	 * The currently used timeout for settings the crm
	 * 
	 * @attribute currentTimeout
	 * @type Number
	 * @default null
	 */
	currentTimeout: null,

	/*
	 * The currently used set menus
	 * 
	 * @attribute setMenus
	 * @type Array
	 * @default []
	 */
	setMenus: [],

	/*
	 * The element used to display drag area
	 * 
	 * @attribute dragAreaEl
	 * @type Element
	 * @default null
	 */
	dragAreaEl: null,

	/*
	 * The coordinates of the location the user started dragging
	 * 
	 * @attribute dragAreaPos
	 * @type Object
	 * @default null
	 */
	dragAreaPos: null,

	/*
	 * The handler for scrolling the body
	 * 
	 * @attribute scrollHandler
	 * @type Function
	 * @default null
	 */
	scrollHandler: null,

	/*
	 * The last drag event
	 * 
	 * @attribute lastDragEvent
	 * @type Object
	 * @default {}
	 */
	lastDragEvent: {},

	/*
	 * The leftmost CRM column for getting scroll from the left
	 * 
	 * @attribute firstCRMColumnEl
	 * @type Element
	 * @default null
	 */
	firstCRMColumnEl: null,

	/*
	 * A list of selected nodes
	 * 
	 * @attribute selectedElements
	 * @type Element[]
	 * @default []
	 */
	selectedElements: [],

	/*
	 * A list of all the column elements
	 * 
	 * @attribute columns
	 * @type Element[]
	 * @default null
	 */
	columns: null,

	get firstCRMColumn() {
		return (this.firstCRMColumnEl || (this.firstCRMColumnEl = window.app.editCRM.children[1].children[2]));
	},

	properties: {
		crm: {
			type: Array,
			value: [],
			notify: true
		},
		crmLoading: {
			type: Boolean,
			value: false,
			notify: true
		},
		crmEmpty: {
			type: Boolean,
			value: true,
			notify: true,
			computed: '_isCrmEmpty(crm, crmLoading)'
		},
		/*
		 * Whether the user is currently selecting nodes to remove
		 * 
		 * @attribute isSelecting
		 * @type Boolean
		 * @default false
		 */
		isSelecting: {
			type: Boolean,
			value: false,
			notify: true
		}
	},

	listeners: {
		'crmTypeChanged': '_typeChanged'
	},

	_isColumnEmpty: function (column) {
		return column.list.length === 0;
	},

	_isCrmEmpty: function(crm, crmLoading) {
		return !crmLoading && crm.length === 0;
	},

	_getAriaLabel: function(item) {
		return 'Edit item "' + item.name + '"';
	},

	/**
	 * Gets the columns in this crm-edit element
	 * 
	 * @returns {Element[]} An array of the columns
	 */
	getColumns: function () {
		//Check if the nodes still exist 
		if (this.columns && document.contains(this.columns[0])) {
			return this.columns;
		}
		return (this.columns = Array.prototype.slice.apply(this.$.mainCont.children).filter(function(element) {
			return element.classList.contains('CRMEditColumnCont');
		}));
	},

	/**
	 * Gets the column with given index
	 * 
	 * @param {Number} index - An optional index
	 * @returns {Element} The column with given index
	 */
	getColumn: function (index) {
		return this.getColumns()[index];
	},

	/**
	 * Gets the current column
	 * 
	 * @param {Element} element - The element whose column to get
	 * @returns {Element} The column it's in
	 */
	getCurrentColumn: function(element) {
		var fillerIndex = (element._filler && element._filler.column);
		if (typeof fillerIndex !== 'number') {
			fillerIndex = null;
		}
		return this.getColumn((fillerIndex === null || fillerIndex === undefined ?
			                       element.parentNode.index :
			                       fillerIndex));
	},

	/**
	 * Gets the next column
	 * 
	 * @param {Element} element - The element whose next column to get
	 * @returns {Element} The next column
	 */
	getNextColumn: function(element) {
		var fillerIndex = (element._filler && element._filler.column);
		if (typeof fillerIndex !== 'number') {
			fillerIndex = null;
		}
		return this.getColumn((fillerIndex === null ?
			                       element.parentNode.index + 1 :
			                       fillerIndex + 1));
	},

	/**
	 * Gets the previous column
	 * 
	 * @param {Element} element - The element whose previous column to get
	 * @returns {Element} The previous column
	 */
	getPrevColumn: function (element) {
		var fillerIndex = (element._filler && element._filler.column);
		if (typeof fillerIndex !== 'number') {
			fillerIndex = null;
		}
		return this.getColumn((fillerIndex === null ?
			                       element.parentNode.index - 1 :
			                       fillerIndex - 1));
	},

	/**
	 * Gets the edit-crm-item nodes in the given column
	 * 
	 * @param {Element} column - The column whose children to find
	 * @param {boolean} includeTemplate - If true, includes the templates
	 * 	element in the list, handy when using insertBefore
	 * @returns {Element[]} The edit-crm-item nodes
	 */
	getEditCrmItems: function(column, includeTemplate) {
		return $(column)
			.children('paper-material')
			.children('.CRMEditColumn')
			.children(!includeTemplate ? 'edit-crm-item' : undefined)
			.toArray();
	},

	getCurrentTypeIndex: function(path) {
		var i;
		var hiddenNodes = {};
		for (i = 0; i < window.app.settings.crm.length; i++) {
			this.isNodeVisible(hiddenNodes, window.app.settings.crm[i], window.app.crmType);
		}
		var items = $($(window.app.editCRM.$.mainCont).children('.CRMEditColumnCont')[path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children;
		var index = path[path.length - 1];
		for (i = 0; i < items.length; i++) {
			if (hiddenNodes[items[i]]) {
				index--;
			}
		}
		return index;
	},

	/**
	 * Gets the last menu of the list.
	 *
	 * @param list - The list.
	 * @param hidden - The hidden nodes
	 *
	 * @return The last menu on the given list.
	 */
	getLastMenu: function(list, hidden) {
		var lastMenu = -1;
		var lastFilledMenu = -1;
		//Find last menu to auto-expand
		if (list) {
			list.forEach(function(item, index) {
				if ((item.type === 'menu' || (window.app.shadowStart && item.menuVal)) && !hidden[item.id]) {
					lastMenu = index;
					item.children = item.children || [];
					if (item.children.length > 0) {
						lastFilledMenu = index;
					}
				}
			});
			if (lastFilledMenu !== -1) {
				return lastFilledMenu;
			}
		}
		return lastMenu;
	},

	/**
	 * Returns whether the node is visible or not (1 if it's visible)
	 * 
	 * @param {Object} result - The result object in which to store all paths
	 * @param {Object} node - The node to check
	 * @param {Number} showContentType - The content type to show
	 * @returns {Number} 1 if the node is visible, 0 if it's not
	 */
	isNodeVisible: function(result, node, showContentType) {
		var length;
		if (node.children && node.children.length > 0) {
			length = node.children.length;
			for (var i = 0; i < length; i++) {
				this.isNodeVisible(result, node.children[i], showContentType);
			}
		}
		if (!node.onContentTypes[showContentType]) {
			result[node.id] = true;
			return 0;
		}
		return 1;
	},

	getIndent: function(data, lastMenu, hiddenNodes) {
		var i;
		var length = data.length - 1;
		var visibleIndent = lastMenu;
		for (i = 0; i < length; i++) {
			if (hiddenNodes[data[i].id]) {
				visibleIndent--;
			}
		}
		return visibleIndent;
	},

	/**
	 * Builds crm edit object.
	 * 		  
	 * @param setMenus - An array of menus that are set to be opened (by user input).
	 *
	 * @return the CRM edit object
	 */
	buildCRMEditObj: function(setMenus) {
		var i;
		var length;
		var column;
		var indent;
		var path = [];
		var columnCopy;
		var columnNum = 0;
		var lastMenu = -2;
		var indentTop = 0;
		var crmEditObj = [];
		var newSetMenus = [];
		var list = window.app.settings.crm;
		var setMenusLength = setMenus.length;
		var showContentTypes = window.app.crmType;

		//Hide all nodes that should be hidden
		var hiddenNodes = {};
		var shown = 0;
		for (i = 0; i < list.length; i++) {
			shown += this.isNodeVisible(hiddenNodes, list[i], showContentTypes);
		}

		if (shown) {
			while (lastMenu !== -1) {
				if (setMenusLength > columnNum && !hiddenNodes[list[setMenus[columnNum]]]) {
					lastMenu = setMenus[columnNum];
				} else {
					lastMenu = this.getLastMenu(list, hiddenNodes);
				}
				newSetMenus[columnNum] = lastMenu;
				indent = this.getIndent(list, lastMenu, hiddenNodes);
				column = {};
				column.indent = [];
				column.indent[indentTop - 1] = undefined;
				column.list = list;
				column.index = columnNum;
				if (window.app.shadowStart && window.app.shadowStart <= columnNum) {
					column.shadow = true;
				}

				if (lastMenu !== -1) {
					indentTop += indent;
					list.forEach(function(item) {
						item.expanded = false;
					});
					list[lastMenu].expanded = true;
					if (window.app.shadowStart && list[lastMenu].menuVal) {
						list = list[lastMenu].menuVal;
					} else {
						list = list[lastMenu].children;
					}
				}

				column.list.map(function(currentVal, index) {
					currentVal.path = [];
					path.forEach(function(item, pathIndex) {
						currentVal.path[pathIndex] = item;
					});
					currentVal.index = index;
					currentVal.path.push(index);
					return currentVal;
				});
				length = column.list.length;
				columnCopy = [];
				for (i = 0; i < length; i++) {
					if (!hiddenNodes[column.list[i].id]) {
						columnCopy.push(column.list[i]);
					}
				}
				column.list = columnCopy;
				path.push(lastMenu);
				crmEditObj.push(column);
				columnNum++;
			}
		}

		this.columns = null;

		return {
			crm: crmEditObj,
			setMenus: newSetMenus
		};
	},

	/**
	 * Builds the crm object
	 * 		  
	 * @param setItems - Set choices for menus by the user
	 * @param quick - Do it quicker than normal
	 * @param superquick - Don't show a loading image and do it immediately
	 * 
	 * @return The object to be sent to Polymer
	 */
	build: function(setItems, quick, superquick) {
		var _this = this;
		setItems = setItems || [];
		var obj = this.buildCRMEditObj(setItems);
		this.setMenus = obj.setMenus;
		obj = obj.crm;

		//Get the highest column's height and apply it to the element to prevent
		//the page from going and shrinking quickly
		var hight;
		var highest = 0;
		obj.forEach(function (column) {
			hight = column.indent.length + column.list.length;
			hight > highest && (highest = hight);
		});
		this.$.mainCont.style.minHeight = (highest * 50) + 'px';

		this.crm = [];
		if (this.currentTimeout !== null) {
			window.clearTimeout(this.currentTimeout);
		}
		this.crmLoading = true;
		this.columns = null;

		function func() {
			_this.crm = obj;
			_this.notifyPath('crm', _this.crm);
			_this.currentTimeout = null;
			setTimeout(function() {
				_this.crmLoading = false;
				var els = document.getElementsByTagName('edit-crm-item');
				for (var i = 0; i < els.length; i++) {
					els[i].update();
				}
				setTimeout(function() {
					window.app.pageDemo.create();
				}, 0);
			}, 50);
		}

		if (superquick) {
			func();
		} else {
			this.currentTimeout = window.setTimeout(func, quick ? 150 : 1000);
		}
		return obj;
	},

	ready: function() {
		var _this = this;
		window.app.editCRM = this;
		window.app.addEventListener('crmTypeChanged', this._typeChanged);
		_this._typeChanged(true);
	},

	addItem: function() {
		var newItem = window.app.templates.getDefaultLinkNode({
			id: window.app.generateItemId()
		});
		window.app.crm.add(newItem);
		window.app.editCRM.build(window.app.editCRM.setMenus, false, true);
	},

	getSelected: function() {
		var selected = [];
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		var i;
		for (i = 0; i < editCrmItems.length; i++) {
			if (editCrmItems[i].classList.contains('highlighted')) {
				selected.push(editCrmItems[i].item.id);
			}
		}
		return selected;
	},

	makeNodeSafe: function(node) {
		var newNode = {};
		node.type && (newNode.type = node.type);
		node.name && (newNode.name = node.name);
		node.value && (newNode.value = node.value);
		node.linkVal && (newNode.linkVal = node.linkVal);
		node.menuVal && (newNode.menuVal = node.menuVal);
		if (node.children) {
			newNode.children = [];
			for (var i = 0; i < node.children.length; i++) {
				newNode.children[i] = this.makeNodeSafe(node.children[i]);
			}
		}
		node.nodeInfo && (newNode.nodeInfo = node.nodeInfo);
		node.triggers && (newNode.triggers = node.triggers);
		node.scriptVal && (newNode.scriptVal = node.scriptVal);
		node.stylesheetVal && (newNode.stylesheetVal = node.stylesheetVal);
		node.onContentTypes && (newNode.onContentTypes = node.onContentTypes);
		node.showOnSpecified && (newNode.showOnSpecified = node.showOnSpecified);
		return newNode;
	},

	extractUniqueChildren: function(node, toExportIds, results) {
		if (toExportIds.indexOf(node.id) > -1) {
			results.push(node);
		} else {
			for (var i = 0; node.children && i < node.children.length; i++) {
				this.extractUniqueChildren(node.children[i], toExportIds, results);
			}
		}
	},

	changeAuthor: function(node, authorName) {
		node.nodeInfo.author = authorName;
		for (var i = 0; node.children && i < node.children.length; i++) {
			this.changeAuthor(node.children[i], authorName);
		}
	},

	crmExportNameChange: function(node, author) {
		if (author) {
			node.nodeInfo && (node.nodeInfo.author = author);
		}
		return JSON.stringify(node);
	},

	getMetaIndexes: function(script) {
		var metaStart = -1;
		var metaEnd = -1;
		var lines = script.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if (metaStart !== -1) {
				if (lines[i].indexOf('==/UserScript==') > -1) {
					metaEnd = i;
					break;
				}
			} else if (lines[i].indexOf('==UserScript==') > -1) {
				metaStart = i;
			}
		}
		return {
			start: metaStart,
			end: metaEnd
		};
	},

	getMetaLines: function(script) {
		var metaIndexes = this.getMetaIndexes(script);
		if (metaIndexes.start === -1) {
			return null;
		}
		var metaStart = metaIndexes.start;
		var metaEnd = metaIndexes.end;
		var startPlusOne = metaStart + 1;
		var lines = script.split('\n');
		var metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
		return metaLines;
	},

	getMetaTags: function(script) {
		var metaLines = this.getMetaLines(script);

		var metaTags = {};
		var regex = new RegExp(/@(\w+)(\s+)(.+)/);
		var regexMatches;
		for (var i = 0; i < metaLines.length; i++) {
			regexMatches = metaLines[i].match(regex);
			if (regexMatches) {
				metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
				metaTags[regexMatches[1]].push(regexMatches[3]);
			}
		}

		return metaTags;
	},

	setMetaTagIfSet: function(metaTags, metaTagKey, nodeKey, node) {
		if (node && node[nodeKey]) {
			if (Array.isArray(node[nodeKey])) {
				metaTags[metaTagKey] = node[nodeKey];
			} else {
				metaTags[metaTagKey] = [node[nodeKey]];
			}
		}
	},

	getUserscriptString: function(node, author) {
		var i;
		var script = node.value.script;
		var scriptSplit = script.split('\n');
		var metaIndexes = this.getMetaIndexes(script);
		var metaTags = {};
		if (metaIndexes.start !== -1) {
			//Remove metaLines
			scriptSplit.splice(metaIndexes.start, (metaIndexes.end - metaIndexes.start) + 1);
			metaTags = this.getMetaTags(script);
		}

		this.setMetaTagIfSet(metaTags, 'name', 'name', node);
		author = (metaTags.nodeInfo && metaTags.nodeInfo.author) || author || 'anonymous';
		if (!Array.isArray(author)) {
			author = [author];
		}
		metaTags.author = author;
		this.setMetaTagIfSet(metaTags, 'downloadURL', 'url', node.nodeInfo);
		this.setMetaTagIfSet(metaTags, 'version', 'version', node);
		metaTags.CRM_contentTypes = [JSON.stringify(node.onContentTypes)];
		this.setMetaTagIfSet(metaTags, 'grant', 'permissions', node);

		var matches = [];
		var excludes = [];
		for (i = 0; i < node.value.triggers.length; i++) {
			if (node.value.triggers[i].not) {
				excludes.push(node.value.triggers[i].url);
			} else {
				matches.push(node.value.triggers[i].url);
			}
		}

		metaTags.match = matches;
		metaTags.exclude = excludes;

		this.setMetaTagIfSet(metaTags, 'CRM_launchMode', 'launchMode', node.value);
		if (node.value.libraries) {
			metaTags.require = [];
			for (i = 0; i < node.value.libraries.length; i++) {
				//Turn into requires
				if (node.value.libraries[i].location) {
					switch (node.value.libraries[i].location) {
					case 'jquery.js':
						metaTags.require.push('https://code.jquery.com/jquery-2.1.4.min.js');
						break;
					case 'angular.js':
						metaTags.require.push('https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.7/angular.min.js');
						break;
					case 'mooTools.js':
						metaTags.require.push('https://cdnjs.cloudlare.com/ajax/libs/mootools/1.5.2/mootools-core.min.js');
						break;
					case 'yui.js':
						metaTags.require.push('https://cdnjs.cloudlare.com/ajax/libs/yui/3.18.1/yui/yui-min.js');
						break;
					case 'jqlite':
						metaTags.require.push('https://raw.githubusercontent.com/jstools/jqlite/master/jqlite.min.js');
							break;
					}
				} else {
					metaTags.require.push(node.value.libraries[i].url);
				}
			}
		}

		if (node.type === 'stylesheet') {
			metaTags.CRM_stylesheet = ['true'];
			this.setMetaTagIfSet(metaTags, 'toggle', 'CRM_toggle', node.value);
			this.setMetaTagIfSet(metaTags, 'defaultOn', 'CRM_defaultOn', node.value);

			//Convert stylesheet to GM API stylesheet insertion
			var stylesheetCode = scriptSplit.join('\n');
			scriptSplit = ['GM_addStyle(\'', stylesheetCode.replace(/\n/g, ''), '\');'];
		}

		var metaLines = [];
		for (var metaKey in metaTags) {
			if (metaTags.hasOwnProperty(metaKey)) {
				for (i = 0; i < metaTags[metaKey].length; i++) {
					metaLines.push('// @' + metaKey + '	' + metaTags[metaKey][i]);
				}
			}
		}

		var newScript = '// ==UserScript==\n';
		newScript += metaLines.join('\n');
		newScript += '// ==/UserScript==\n';
		newScript += scriptSplit.join('\n');

		return newScript;
	},

	generateDocumentRule: function(node) {
		var rules = node.triggers.map(function(trigger) {
			if (trigger.indexOf('*') === -1) {
				return 'url(' + trigger + ')';
			} else {
				var schemeAndDomainPath = trigger.split('://');
				var scheme = schemeAndDomainPath[0];
				var domainPath = schemeAndDomainPath.slice(1).join('://');
				var domainAndPath = domainPath.split('/');
				var domain = domainAndPath[0];
				var path = domainAndPath.slice(1).join('/');

				var schemeWildCard = scheme.indexOf('*') > -1;
				var domainWildcard = domain.indexOf('*') > -1;
				var pathWildcard = path.indexOf('*') > -1;

				if (~~schemeWildCard + ~~domainWildcard + ~~pathWildcard > 1 ||
					domainWildcard || schemeWildCard) {
					//Use regex
					return 'regexp("' +
						trigger
							.replace(/\*/, '.*')
							.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
						'")';
				} else {
					return 'url-prefix(' + scheme + '://' + domain + ')';
				}
			}
		});

		var match;
		var indentation;
		var lines = node.value.stylesheet.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if ((match = /(\s+)(\w+)/.match(lines[i]))) {
				indentation = match[1];
				break;
			}
		}
		indentation = indentation || '	';

		return '@-moz-document ' + rules.join(', ') + ' {' + 
				lines.map(function(line) {
					return indentation + line;
				}).join('\n') + 
			'}';
	},

	getExportString: function(node, type, author) {
		switch (type) {
			case 'Userscript':
				return this.getUserscriptString(node, author);
			case 'Userstyle':
				//Turn triggers into @document rules
				if (node.value.launchMode === 0 || node.value.launchMode === 1) {
					//On clicking
					return node.value.stylesheet;
				} else {
					return this.generateDocumentRule(node);
				}
			default:
			case 'CRM':
				return this.crmExportNameChange(node, author);
		}
	},

	exportSingleNode: function(exportNode, exportType) {
		var _this = this;

		var textArea = $('#exportJSONData')[0];

		textArea.value = this.getExportString(exportNode, exportType, null);
		$('#exportAuthorName')[0].value = (exportNode.nodeInfo && exportNode.nodeInfo.author) || '';
		$('#exportAuthorName').on('change', function () {
			var author = this.value;
			chrome.storage.local.set({
				authorName: author
			});
			var data;
			data = _this.getExportString(exportNode, exportType, author);
			textArea.value = data;
		});
		$('#exportDialog')[0].open();
		setTimeout(function() {
			textArea.focus();
			textArea.select();
		}, 150);
	},

	exportGivenNodes: function(exports) {
		var _this = this;

		var safeExports = [];
		for (var i = 0; i < exports.length; i++) {
			safeExports[i] = this.makeNodeSafe(exports[i]);
		}
		var dataJson = {
			crm: safeExports
		};

		var textarea = $('#exportJSONData')[0];

		function authorNameChange(event) {
			var author = event.target.value;
			chrome.storage.local.set({
				authorName: author
			});
			for (var j = 0; j < safeExports.length; j++) {
				_this.changeAuthor(safeExports[j], author);
			}
			dataJson = JSON.stringify({
				crm: safeExports
			});
			textarea.value = dataJson;
		}

		$('#exportAuthorName').on('change', authorNameChange);
		textarea.value = JSON.stringify(dataJson);
		$('#exportDialog')[0].open();
		setTimeout(function() {
			textarea.focus();
			textarea.select();
		}, 150);

		if (window.app.storageLocal.authorName) {
			authorNameChange(window.app.storageLocal.authorName);
		}
	},

	exportGivenNodeIDs: function(toExport, exportType) {
		exportType = exportType || 'CRM';
		var exports = [];
		for (var i = 0; i < window.app.settings.crm.length; i++) {
			this.extractUniqueChildren(window.app.settings.crm[i], toExport, exports);
		}

		this.exportGivenNodes(exports, exportType);
	},

	exportSelected: function() {
		var toExport = this.getSelected();
		this.exportGivenNodeIDs(toExport);
	},

	cancelSelecting: function() {
		var _this = this;
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		//Select items
		for (var i = 0; i < editCrmItems.length; i++) {
			editCrmItems[i].classList.remove('selecting');
			editCrmItems[i].classList.remove('highlighted');
		}
		setTimeout(function() {
			_this.isSelecting = false;
		}, 150);
	},

	removeSelected: function() {
		var j;
		var arr;
		var toRemove = this.getSelected();
		for (var i = 0; i < toRemove.length; i++) {
			arr = window.app.crm.lookupId(toRemove[i], true);
			if (!arr) {
				continue;
			}
			for (j = 0; j < arr.length; j++) {
				if (arr[j].id === toRemove[i]) {
					arr.splice(j, 1);
				}
			}
		}
		window.app.upload();
		this.build(null, true, false);

		this.isSelecting = false;
	},

	selectItems: function() {
		var _this = this;
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		//Select items
		for (var i = 0; i < editCrmItems.length; i++) {
			editCrmItems[i].classList.add('selecting');
		}
		setTimeout(function() {
			_this.isSelecting = true;
		}, 150);
	},

	getCRMElementFromPath: function(path, showPath) {
		var i;
		for (i = 0; i < path.length - 1; i++) {
			if (this.setMenus[i] !== path[i]) {
				if (showPath) {
					this.build(path, false, true);
					break;
				} else {
					return null;
				}
			}
		}

		var cols = this.$.mainCont.children;
		var row = cols[path.length + 1].children;
		for (i = 0; i < row.length; i++) {
			if (row[i].tagName === 'PAPER-MATERIAL') {
				row = row[i].children[0].children;
				break;
			}
		}

		for (i = 0; i < row.length; i++) {
			if (window.app.compareArray(row[i].item.path, path)) {
				return row[i];
			}
		}
		return null;
	},

	_typeChanged: function(quick) {
		for (var i = 0; i < 6; i++) {
			window.app.editCRM.classList[(i === window.app.crmType ? 'add' : 'remove')](window.app.pageDemo.getCrmTypeFromNumber(i));
		}
		window.runOrAddAsCallback(window.app.editCRM.build, window.app.editCRM, (quick ? [null, true] : []));
	}
});