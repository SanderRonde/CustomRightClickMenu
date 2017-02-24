/// <reference path="../elements.d.ts" />

const editCrmProperties: {
	crm: CRMBuilder;
	crmLoading: boolean;
	crmEmpty: boolean;
	isSelecting: boolean;
	isAdding: boolean;
} = {
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
	/**
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
	},
	/**
	 * Whether the user is adding a node
	 * 
	 * @attribute isAdding
	 * @type Boolean
	 * @default false
	 */
	isAdding: {
		type: Boolean,
		value: false,
		notify: true
	}
} as any;

type EditCrm = PolymerElement<'edit-crm', typeof EC & typeof editCrmProperties>;

interface DragCoordinate {
	X: number;
	Y: number;
}

interface CRMColumn extends HTMLElement {
	list: Array<CRMNode & {
		expanded: boolean;
		name: string;
		shadow: boolean;
		index: number;	
	}>;
	dragging: boolean;
	draggingItem: EditCrmItem;
}

interface CRMBuilderColumn extends HTMLElement {
	list: Array<CRMNode & {
		expanded: boolean;
		name: string;
		shadow: boolean;
		index: number;	
		isPossibleAddLocation?: boolean;
	}>;
	menuPath: Array<number>;
	indent: Array<void>;
	index: number;
	shadow: boolean;
	isEmpty: boolean;
}

type CRMBuilder = Array<CRMBuilderColumn>;

class EC {
	static is: string = 'edit-crm';

	/**
	 * The currently used timeout for settings the crm
	 */
	static currentTimeout: number = null;

	/**
	 * The currently used set menus
	 */
	static setMenus: Array<number> = [];

	/**
	 * The element used to display drag area
	 */
	static dragAreaEl: HTMLElement = null;

	/**
	 * The coordinates of the location the user started dragging
	 * 
	 * @attribute dragAreaPos
	 * @type Object
	 * @default null
	 */
	static dragAreaPos: DragCoordinate = null;

	/**
	 * The handler for scrolling the body
	 * 
	 * @attribute scrollHandler
	 * @type Function
	 * @default null
	 */
	static scrollHandler: EventListenerObject = null;

	/**
	 * The last drag event
	 */
	static lastDragEvent: MouseEvent;

	/**
	 * The leftmost CRM column for getting scroll from the left
	 */
	static firstCRMColumnEl: HTMLElement = null;

	/**
	 * A list of selected nodes
	 */
	static selectedElements: Array<number> = [];

	/**
	 * A list of all the column elements
	 */
	static columns: Array<CRMColumn> = [];

	/**
	 * The menus that are set to be shown in the crm
	 */
	static setItems: Array<number>;

	static firstCRMColumn() {
		return (this.firstCRMColumnEl || (this.firstCRMColumnEl = window.app.editCRM.children[1].children[2] as HTMLElement));
	};

	static properties = editCrmProperties;

	static listeners = {
		'crmTypeChanged': '_typeChanged'
	};

	static _isColumnEmpty(this: EditCrm, column: CRMColumn): boolean {
		return column.list.length === 0 && !this.isAdding;
	};

	static _isCrmEmpty(this: EditCrm, crm: CRMTree, crmLoading: boolean): boolean {
		return !crmLoading && crm.length === 0;
	};

	static _getAriaLabel(this: EditCrm, item: CRMNode): string {
		return 'Edit item "' + item.name + '"';
	};

	/**
	 * Gets the columns in this crm-edit element
	 */
	static getColumns(this: EditCrm): Array<CRMColumn> {
		//Check if the nodes still exist 
		if (this.columns && document.contains(this.columns[0])) {
			return this.columns;
		}
		return (this.columns = Array.prototype.slice.apply(this.$.mainCont.children).filter(function(element: CRMColumn|HTMLElement) {
			return element.classList.contains('CRMEditColumnCont');
		}));
	};

	/**
	 * Gets the column with given index
	 */
	static getColumn(this: EditCrm, index: number): CRMColumn {
		return this.getColumns()[index];
	};

	/**
	 * Gets the current column
	 */
	static getCurrentColumn(this: EditCrm, element: EditCrmItem): CRMColumn {
		var fillerIndex = (element._filler && element._filler.column);
		if (typeof fillerIndex !== 'number') {
			fillerIndex = null;
		}
		return this.getColumn((fillerIndex === null || fillerIndex === undefined ?
			                       (element.parentNode as HTMLElement & {
									   index: number;
								   }).index :
			                       fillerIndex));
	};

	/**
	 * Gets the next column
	 */
	static getNextColumn(this: EditCrm, element: EditCrmItem): CRMColumn {
		var fillerIndex = (element._filler && element._filler.column);
		if (typeof fillerIndex !== 'number') {
			fillerIndex = null;
		}
		return this.getColumn((fillerIndex === null ?
			                       (element.parentNode as HTMLElement & {
									   index: number;
								   }).index + 1 :
			                       fillerIndex + 1));
	};

	/**
	 * Gets the previous column
	 */
	static getPrevColumn(this: EditCrm, element: EditCrmItem): CRMColumn {
		var fillerIndex = (element._filler && element._filler.column);
		if (typeof fillerIndex !== 'number') {
			fillerIndex = null;
		}
		return this.getColumn((fillerIndex === null ?
			                       (element.parentNode as HTMLElement & {
									   index: number;
								   }).index - 1 :
			                       fillerIndex - 1));
	};

	/**
	 * Gets the edit-crm-item nodes in the given colume
	 */
	static getEditCrmItems(this: EditCrm, column: CRMColumn, includeTemplate: boolean = false): Array<EditCrmItem> {
		return $(column)
			.children('paper-material')
			.children('.CRMEditColumn')
			.children(!includeTemplate ? 'edit-crm-item' : undefined)
			.toArray() as Array<EditCrmItem>;
	};

	static getCurrentTypeIndex(this: EditCrm, path: Array<number>): number {
		var i;
		var hiddenNodes: {
			[nodeId: number]: boolean; 
		} = {};
		for (i = 0; i < window.app.settings.crm.length; i++) {
			this.isNodeVisible(hiddenNodes, window.app.settings.crm[i], window.app.crmType);
		}
		var items: Array<EditCrmItem> = $($(window.app.editCRM.$.mainCont).children('.CRMEditColumnCont')[path.length - 1]).children('paper-material').children('.CRMEditColumn')[0].children as any;
		var index = path[path.length - 1];
		for (i = 0; i < items.length; i++) {
			if (items[i].item && items[i].item.id && hiddenNodes[items[i].item.id]) {
				index--;
			}
		}
		return index;
	};

	/**
	 * Gets the last menu of the list.
	 *
	 * @param list - The list.
	 * @param hidden - The hidden nodes
	 *
	 * @return The last menu on the given list.
	 */
	static getLastMenu(this: EditCrm, list: Array<CRMNode>, hidden: {
		[nodeId: number]: boolean
	}) {
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
	};

	/**
	 * Returns whether the node is visible or not (1 if it's visible)
	 */
	static isNodeVisible(this: EditCrm, result: {
		[nodeId: number]: boolean;
	}, node: CRMNode, showContentType: number): 0|1 {
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
	};

	static getIndent(this: EditCrm, data: Array<CRMNode>, lastMenu: number, hiddenNodes: {
		[nodeId: number]: boolean;
	}): number {
		var i;
		var length = data.length - 1;
		var visibleIndent = lastMenu;
		for (i = 0; i < length; i++) {
			if (hiddenNodes[data[i].id]) {
				visibleIndent--;
			}
		}
		return visibleIndent;
	};

	/**
	 * Builds crm edit object.
	 * 		  
	 * @param setMenus - An array of menus that are set to be opened (by user input).
	 *
	 * @return the CRM edit object
	 */
	static buildCRMEditObj(this: EditCrm, setMenus: Array<number>): {
		crm: CRMBuilder;
		setMenus: Array<number>;
	} {
		var column: CRMBuilderColumn;
		var indent: number;
		const path: Array<number> = [];
		var columnCopy: Array<CRMNode & {
			expanded: boolean;
			name: string;
			shadow: boolean;
			index: number;	
			isPossibleAddLocation?: boolean;
		}>;
		var columnNum: number = 0;
		var lastMenu: number = -2;
		var indentTop: number = 0;
		const crmEditObj: CRMBuilder = [];
		const newSetMenus: Array<number> = [];
		var list: Array<CRMNode & Partial<{
			expanded: boolean;
			name: string;
			shadow: boolean;
			index: number;	
		}>> = window.app.settings.crm;
		const setMenusLength: number = setMenus.length;
		const showContentTypes: number = window.app.crmType;

		//Hide all nodes that should be hidden
		const hiddenNodes: {
			[nodeId: number]: boolean;
		} = {};
		let shown: number = 0;
		for (let i = 0; i < list.length; i++) {
			shown += this.isNodeVisible(hiddenNodes, list[i], showContentTypes);
		}

		if (shown || this.isAdding) {
			while (lastMenu !== -1) {
				if (setMenusLength > columnNum && setMenus[columnNum] !== -1 &&
						!hiddenNodes[list[setMenus[columnNum]].id]) {
					lastMenu = setMenus[columnNum];
				} else {
					lastMenu = this.getLastMenu(list, hiddenNodes);
				}
				newSetMenus[columnNum] = lastMenu;

				indent = this.getIndent(list, lastMenu, hiddenNodes);
				const columnIndent = [];
				columnIndent[indentTop - 1] = undefined;

				column = {
					indent: columnIndent,
					menuPath: path.concat(lastMenu),
					list: list as Array<CRMNode & {
						expanded: boolean;
						name: string;
						shadow: boolean;
						index: number;	
						isPossibleAddLocation?: boolean;
					}>,
					index: columnNum,
					shadow: window.app.shadowStart && window.app.shadowStart <= columnNum
				} as any;

				if (lastMenu !== -1) {
					indentTop += indent;
					list.forEach(function(item) {
						item.expanded = false;
					});
					const lastNode = list[lastMenu];
					lastNode.expanded = true;
					if (window.app.shadowStart && lastNode.menuVal) {
						list = (lastNode as ScriptNode|LinkNode|DividerNode|StylesheetNode).menuVal as Array<CRMNode>;
					} else {
						list = (list[lastMenu] as MenuNode).children;
					}
				}

				column.list.map(function(currentVal, index) {
					currentVal.path = [];
					path.forEach(function(item, pathIndex) {
						currentVal.path[pathIndex] = item;
					});
					currentVal.index = index;
					currentVal.isPossibleAddLocation = false;
					currentVal.path.push(index);
					return currentVal;
				});
				
				columnCopy = column.list.filter((item) => {
					return !hiddenNodes[item.id];
				});
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
	};

	/**
	 * Builds the crm object
	 * 		  
	 * @param setItems - Set choices for menus by the user
	 * @param quick - Do it quicker than normal
	 * @param superquick - Don't show a loading image and do it immediately
	 * 
	 * @return The object to be sent to Polymer
	 */
	static build(this: EditCrm, setItems: Array<number>, quick: boolean = false, superquick: boolean = false): CRMBuilder {
		var _this = this;
		setItems = setItems || [];
		var obj = this.buildCRMEditObj(setItems);
		this.setMenus = obj.setMenus;
		const crmBuilder = obj.crm;

		//Get the highest column's height and apply it to the element to prevent
		//the page from going and shrinking quickly
		var hight;
		var highest = 0;
		crmBuilder.forEach(function (column) {
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
			_this.crm = crmBuilder;
			_this.notifyPath('crm', _this.crm);
			_this.currentTimeout = null;
			setTimeout(function() {
				_this.crmLoading = false;
				const els = document.getElementsByTagName('edit-crm-item');
				for (let i = 0; i < els.length; i++) {
					els[i].update && els[i].update();
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
		return crmBuilder;
	};

	static ready(this: EditCrm) {
		window.app.editCRM = this;
		window.app.addEventListener('crmTypeChanged', () => {
			this._typeChanged();
		});
		this._typeChanged(true);
	};

	static addToPosition(this: EditCrm, e: PolymerClickEvent) {
		var index = 0;
		var node = e.path[index];
		while (node.classList.contains('addingItemPlaceholder') === false) {
			index++;
			node = e.path[index];
		}

		this.addItem(JSON.parse(node.getAttribute('data-path')));
		this.isAdding = false;
	};

	static cancelAdding(this: EditCrm) {
		if (this.isAdding) {
			this.isAdding = false;
			this.build(this.setItems, false, true);
		}
	};

	static toggleAddState(this: EditCrm) {
		if (!this.isAdding) {
			this.isSelecting && this.cancelSelecting();
			this.isAdding = true;

			this.build(this.setItems, false, true);
		} else {
			this.cancelAdding();
		}
	};

	static addItem(this: EditCrm, path: Array<number>) {
		var newItem = window.app.templates.getDefaultLinkNode({
			id: window.app.generateItemId()
		});

		var container = window.app.crm.lookup(path, true);
		container.push(newItem);
		window.app.editCRM.build(window.app.editCRM.setMenus, false, true);
		window.app.upload();
	};

	static getSelected(this: EditCrm): Array<number> {
		var selected = [];
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		var i;
		for (i = 0; i < editCrmItems.length; i++) {
			if (editCrmItems[i].classList.contains('highlighted')) {
				selected.push(editCrmItems[i].item.id);
			}
		}
		return selected;
	};

	static makeNodeSafe(this: EditCrm, node: CRMNode): SafeCRMNode {
		var newNode: Partial<SafeCRMNode> = {};
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
		return newNode as SafeCRMNode;
	};

	static extractUniqueChildren(this: EditCrm, node: CRMNode, toExportIds: Array<number>, results: Array<CRMNode>) {
		if (toExportIds.indexOf(node.id) > -1) {
			results.push(node);
		} else {
			for (var i = 0; node.children && i < node.children.length; i++) {
				this.extractUniqueChildren(node.children[i], toExportIds, results);
			}
		}
	};

	static changeAuthor(this: EditCrm, node: CRMNode|SafeCRMNode, authorName: string) {
		node.nodeInfo.source.author = authorName;
		for (var i = 0; node.children && i < node.children.length; i++) {
			this.changeAuthor(node.children[i], authorName);
		}
	};

	static crmExportNameChange(this: EditCrm, node: CRMNode, author: string): string {
		if (author) {
			node.nodeInfo && node.nodeInfo.source && (node.nodeInfo.source.author = author);
		}
		return JSON.stringify(node);
	};

	static getMetaIndexes(this: EditCrm, script: string): {
		start: number;
		end: number;
	} {
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
	};

	static getMetaLines(this: EditCrm, script: string): Array<string> {
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
	};

	static getMetaTags(this: EditCrm, script: string): {
		[key: string]: Array<string|number>;
	} {
		var metaLines = this.getMetaLines(script);

		var metaTags: MetaTags = {};
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
	};

	static setMetaTagIfSet<K extends keyof U, U>(this: EditCrm, metaTags: MetaTags, metaTagKey: string, nodeKey: K, node: U) {
		if (node && node[nodeKey]) {
			if (Array.isArray(node[nodeKey])) {
				metaTags[metaTagKey] = node[nodeKey] as any;
			} else {
				metaTags[metaTagKey] = [node[nodeKey]] as any;
			}
		}
	};

	static getUserscriptString(this: EditCrm, node: ScriptNode|StylesheetNode, author: string): string {
		var i;
		var code = (node.type === 'script' ? node.value.script : node.value.stylesheet);
		var codeSplit = code.split('\n');
		var metaIndexes = this.getMetaIndexes(code);
		var metaTags: {
			[key: string]: Array<string|number>;
		} = {};
		if (metaIndexes.start !== -1) {
			//Remove metaLines
			codeSplit.splice(metaIndexes.start, (metaIndexes.end - metaIndexes.start) + 1);
			metaTags = this.getMetaTags(code);
		}

		this.setMetaTagIfSet(metaTags, 'name', 'name', node);
		author = (metaTags['nodeInfo'] && JSON.parse(metaTags['nodeInfo'][0] as string).author) || author || 'anonymous';
		let authorArr: Array<string> = [];
		if (!Array.isArray(author)) {
			 authorArr = [author];
		}
		metaTags['author'] = authorArr;
		this.setMetaTagIfSet(metaTags, 'downloadURL', 'url', node.nodeInfo.source);
		this.setMetaTagIfSet(metaTags, 'version', 'version', node.nodeInfo);
		metaTags['CRM_contentTypes'] = [JSON.stringify(node.onContentTypes)];
		this.setMetaTagIfSet(metaTags, 'grant', 'permissions', node);

		var matches = [];
		var excludes = [];
		for (i = 0; i < node.triggers.length; i++) {
			if (node.triggers[i].not) {
				excludes.push(node.triggers[i].url);
			} else {
				matches.push(node.triggers[i].url);
			}
		}

		metaTags['match'] = matches;
		metaTags['exclude'] = excludes;

		this.setMetaTagIfSet(metaTags, 'CRM_launchMode', 'launchMode', node.value);
		if (node.type === 'script' && node.value.libraries) {
			metaTags['require'] = [];
			for (i = 0; i < node.value.libraries.length; i++) {
				//Turn into requires
				if (node.value.libraries[i].url) {
					metaTags['require'].push(node.value.libraries[i].url);
				}
			}
		}

		if (node.type === 'stylesheet') {
			metaTags['CRM_stylesheet'] = ['true'];
			this.setMetaTagIfSet(metaTags, 'CRM_toggle', 'toggle', node.value);
			this.setMetaTagIfSet(metaTags, 'CRM_defaultOn', 'defaultOn', node.value);

			//Convert stylesheet to GM API stylesheet insertion
			var stylesheetCode = codeSplit.join('\n');
			codeSplit = [`GM_addStyle('${stylesheetCode.replace(/\n/g, '\\n\' + \n\'')}');`];
		}

		var metaLines = [];
		for (var metaKey in metaTags) {
			if (metaTags.hasOwnProperty(metaKey)) {
				for (i = 0; i < metaTags[metaKey].length; i++) {
					metaLines.push('// @' + metaKey + '	' + metaTags[metaKey][i]);
				}
			}
		}

		const newScript = 
`// ==UserScript==
${metaLines.join('\n')}
// ==/UserScript
${codeSplit.join('\n')}`;

		return newScript;
	};

	static generateDocumentRule(this: EditCrm, node: StylesheetNode): string {
		var rules = node.triggers.map(function(trigger) {
			if (trigger.url.indexOf('*') === -1) {
				return 'url(' + trigger + ')';
			} else {
				var schemeAndDomainPath = trigger.url.split('://');
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
						trigger.url
							.replace(/\*/, '.*')
							.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
						'")';
				} else {
					return 'url-prefix(' + scheme + '://' + domain + ')';
				}
			}
		});

		var match;
		var indentation: string;
		var lines = node.value.stylesheet.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if ((match = /(\s+)(\w+)/.exec(lines[i]))) {
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
	};

	static getExportString(this: EditCrm, node: CRMNode, type: string, author: string) {
		switch (type) {
			case 'Userscript':
				return this.getUserscriptString(node as ScriptNode, author);
			case 'Userstyle':
				//Turn triggers into @document rules
				if ((node as StylesheetNode).value.launchMode === 0 || (node as StylesheetNode).value.launchMode === 1) {
					//On clicking
					return (node as StylesheetNode).value.stylesheet;
				} else {
					return this.generateDocumentRule(node as StylesheetNode);
				}
			default:
			case 'CRM':
				return this.crmExportNameChange(node as CRMNode, author);
		}
	};

	static exportSingleNode(this: EditCrm, exportNode: CRMNode, exportType: string) {
		var __this = this;

		var textArea = $('#exportJSONData')[0] as HTMLTextAreaElement;

		textArea.value = this.getExportString(exportNode, exportType, null);
		($('#exportAuthorName')[0] as HTMLTextAreaElement).value = 
			(exportNode.nodeInfo && exportNode.nodeInfo.source && exportNode.nodeInfo.source.author) || 'anonymous';
		$('#exportAuthorName').on('keydown', function (this: HTMLPaperInputElement) {
			window.setTimeout(() => {
				var author = this.value;
				chrome.storage.local.set({
					authorName: author
				});
				var data;
				data = __this.getExportString(exportNode, exportType, author);
				textArea.value = data;
			}, 0);
		});
		($('#exportDialog')[0] as HTMLPaperDialogElement).open();
		setTimeout(function() {
			textArea.focus();
			textArea.select();
		}, 150);
	};

	static exportGivenNodes(this: EditCrm, exports: Array<CRMNode>) {
		var _this = this;

		var safeExports: Array<SafeCRMNode> = [];
		for (var i = 0; i < exports.length; i++) {
			safeExports[i] = this.makeNodeSafe(exports[i]);
		}
		var data = {
			crm: safeExports
		};

		var textarea = $('#exportJSONData')[0] as HTMLTextAreaElement;

		function authorNameChange(event: {
			target: {
				value: string
			}
		}) {
			var author = (event.target as {
				value: string;
			}).value;
			chrome.storage.local.set({
				authorName: author
			});
			for (var j = 0; j < safeExports.length; j++) {
				_this.changeAuthor(safeExports[j], author);
			}
			const dataJson = JSON.stringify({
				crm: safeExports
			});
			textarea.value = dataJson;
		}

		$('#exportAuthorName').on('change' as any, authorNameChange);
		textarea.value = JSON.stringify(data);
		($('#exportDialog')[0] as HTMLPaperDialogElement).open();
		setTimeout(function() {
			textarea.focus();
			textarea.select();
		}, 150);

		if (window.app.storageLocal.authorName) {
			authorNameChange({
				target: {
					value: window.app.storageLocal.authorName
				}
			});
		}
	};

	static exportGivenNodeIDs(this: EditCrm, toExport: Array<number>) {
		var exports: Array<CRMNode> = [];
		for (var i = 0; i < window.app.settings.crm.length; i++) {
			this.extractUniqueChildren(window.app.settings.crm[i], toExport, exports);
		}

		this.exportGivenNodes(exports);
	};

	static exportSelected(this: EditCrm) {
		var toExport = this.getSelected();
		this.exportGivenNodeIDs(toExport);
	};

	static cancelSelecting(this: EditCrm) {
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
	};

	static removeSelected(this: EditCrm) {
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
	};

	static selectItems(this: EditCrm) {
		var _this = this;
		var editCrmItems = document.getElementsByTagName('edit-crm-item');
		//Select items
		for (var i = 0; i < editCrmItems.length; i++) {
			editCrmItems[i].classList.add('selecting');
		}
		setTimeout(function() {
			_this.isSelecting = true;
		}, 150);
	};

	static getCRMElementFromPath(this: EditCrm, path: Array<number>, showPath: boolean = false): EditCrmItem {
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
			if (window.app.compareArray((row[i] as EditCrmItem).item.path, path)) {
				return (row[i] as EditCrmItem);
			}
		}
		return null;
	};

	static _typeChanged(this: EditCrm, quick: boolean = false) {
		for (var i = 0; i < 6; i++) {
			window.app.editCRM.classList[(i === window.app.crmType ? 'add' : 'remove')](window.app.pageDemo.getCrmTypeFromNumber(i));
		}
		window.runOrAddAsCallback(window.app.editCRM.build, window.app.editCRM, (quick ? [null, true] : []));
	}
}

Polymer(EC);