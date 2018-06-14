/// <reference path="../../elements.d.ts" />

namespace EditCrmElement {
	export const editCrmProperties: {
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
			value: true,
			notify: true
		},
		crmEmpty: {
			type: Boolean,
			value: false,
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

	interface CRMColumn {
		list: (CRM.Node & {
			expanded: boolean;
			name: string;
			shadow: boolean;
			index: number;	
		})[];
		dragging: boolean;
		draggingItem: EditCrmItem;
	}

	export interface CRMColumnElement extends HTMLElement {
		index: number;
		items: (CRM.Node & {
			expanded: boolean;
			name: string;
			shadow: boolean;
			index: number;	
		})[];
	}

	interface CRMBuilderColumn {
		list: (CRM.Node & {
			expanded: boolean;
			name: string;
			shadow: boolean;
			index: number;	
			isPossibleAddLocation?: boolean;
		})[];
		menuPath: number[];
		indent: void[];
		index: number;
		shadow: boolean;
		isEmpty: boolean;
	}

	type CRMBuilder = CRMBuilderColumn[];

	namespace Sortable {
		export interface Instance {
			option<T>(name: string, value?: T): T;
			closest(el: string, selector?: HTMLElement): HTMLElement|null;
			toArray(): string[];
			sort(order: string[]): void;
			save(): void;
			destroy(): void;
		}

		type SortableEvent<T, U> = Event & {
			/**
			 * List in which the element is moved
			 */
			to: U;
			/**
			 * Previous list
			 */
			from: U;
			/**
			 * Dragged element
			 */
			item: T;
			clone: T;
			oldIndex: number;
			newIndex: number;
		};

		type DragEvent<T, U> = Event & {
			/**
			 * List in which the element is moved
			 */
			to: U;
			/**
			 * Previous list
			 */
			from: U;
			/**
			 * Dragged element
			 */
			dragged: T;
			draggedRect: ClientRect;
			related: T;
			relatedRect: ClientRect;
		};

		export interface Sortable {
			new<T extends HTMLElement, U extends HTMLElement>(target: HTMLElement, options: {
				group?: string;
				sort?: boolean;
				delay?: number;
				disabled?: boolean;
				store?: any;
				animation?: number;
				handle?: string;
				filter?: string;
				preventOnFilter?: boolean;
				draggable?: string;
				ghostClass?: string;
				chosenClass?: string;
				dragClass?: string;
				dataIdAttr?: string;
				forceFallback?: boolean;
				fallbackClass?: string;
				fallbackOnBody?: boolean;
				fallbackTolerance?: number;
				scroll: boolean;
				scrollFn?(offsetX: number, offsetY: number, originalEvent: Event): void;
				scrollSensitivirt?: number;
				scrollSpeed?: number;
				
				setData?(dataTransfer: any, dragEl: T): void;
				onChoose?(evt: SortableEvent<T, U>): void;
				onStart?(evt: SortableEvent<T, U>): void;
				onEnd?(evt: SortableEvent<T, U>): void;
				onAdd?(evt: SortableEvent<T, U>): void;
				onUpdate?(evt: SortableEvent<T, U>): void;
				onSort?(evt: SortableEvent<T, U>): void;
				onFilter?(evt: SortableEvent<T, U>): void;
				onMove?(evt: DragEvent<T, U>, originalEvent: Event): void;
				onClone?(evt: SortableEvent<T, U>): void;
			}): Instance;
		}
	}

	declare const Sortable: Sortable.Sortable;

	export class EC {
		static is: string = 'edit-crm';

		/**
		 * The currently used timeout for settings the crm
		 */
		private static _currentTimeout: number = null;

		/**
		 * The currently used set menus
		 */
		static setMenus: number[] = [];

		/**
		 * A list of selected nodes
		 */
		static selectedElements: number[] = [];

		/**
		 * A list of all the column elements
		 */
		private static _columns: CRMColumnElement[] = [];

		/**
		 * The menus that are set to be shown in the crm
		 */
		private static _setItems: number[];

		/**
		 * The sortable object
		 */
		private static _sortables: Sortable.Instance[] = [];

		static properties = editCrmProperties;

		static listeners = {
			'crmTypeChanged': '_typeChanged'
		};

		static _isColumnEmpty(this: EditCrm, column: CRMColumn): boolean {
			return column.list.length === 0 && !this.isAdding;
		};

		static _isCrmEmpty(this: EditCrm, crm: CRM.Tree, crmLoading: boolean): boolean {
			return !crmLoading && crm.length === 0;
		};

		static _getAriaLabel(this: EditCrm, item: CRM.Node): string {
			return 'Edit item "' + item.name + '"';
		};

		/**
		 * Gets the columns in this crm-edit element
		 */
		private static _getColumns(this: EditCrm): CRMColumnElement[] {
			//Check if the nodes still exist 
			if (this._columns && document.contains(this._columns[0])) {
				return this._columns;
			}
			return (this._columns = Array.prototype.slice.apply(this.$.mainCont.children).filter(function(element: CRMColumnElement|HTMLElement) {
				return element.classList.contains('CRMEditColumnCont');
			}).map((columnCont: CRMColumnElement) => {
				return columnCont.querySelector('.CRMEditColumn');
			}));
		};

		/**
		 * Gets the last menu of the list.
		 *
		 * @param list - The list.
		 * @param hidden - The hidden nodes
		 * @param exclude - The menu not to choose
		 *
		 * @return The last menu on the given list.
		 */
		private static _getLastMenu(this: EditCrm, list: CRM.Node[], hidden: {
			[nodeId: number]: boolean
		}, exclude: number) {
			let lastMenu = -1;
			let lastFilledMenu = -1;
			//Find last menu to auto-expand
			if (list) {
				list.forEach(function(item, index) {
					if ((item.type === 'menu' || (window.app.shadowStart && item.menuVal)) && !hidden[item.id]) {
						item.children = item.children || [];
						if (exclude === undefined || index !== exclude) {
							lastMenu = index;
							if (item.children.length > 0) {
								lastFilledMenu = index;
							}
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
		private static _isNodeVisible(this: EditCrm, result: {
			[nodeId: number]: boolean;
		}, node: CRM.Node, showContentTypes: boolean[]): 0|1 {
			let length;
			if (node.children && node.children.length > 0) {
				length = node.children.length;
				for (let i = 0; i < length; i++) {
					this._isNodeVisible(result, node.children[i], showContentTypes);
				}
			}
			if (!window.app.util.arraysOverlap(node.onContentTypes, showContentTypes)) {
				result[node.id] = true;
				return 0;
			}
			return 1;
		};

		private static _getIndent(this: EditCrm, data: CRM.Node[], lastMenu: number, hiddenNodes: {
			[nodeId: number]: boolean;
		}): number {
			let visibleIndent = lastMenu;
			for (let i = 0; i < lastMenu; i++) {
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
		 * @param unsetMenus - An array of menus that should not be opened
		 *
		 * @return the CRM edit object
		 */
		private static _buildCRMEditObj(this: EditCrm, setMenus: number[], unsetMenus: number[]): {
			crm: CRMBuilder;
			setMenus: number[];
		} {
			let column: CRMBuilderColumn;
			let indent: number;
			const path: number[] = [];
			let columnCopy: (CRM.Node & {
				expanded: boolean;
				name: string;
				shadow: boolean;
				index: number;
				isPossibleAddLocation?: boolean;
			})[];
			let columnNum: number = 0;
			let lastMenu: number = -2;
			let indentTop: number = 0;
			const crmEditObj: CRMBuilder = [];
			const newSetMenus: number[] = [];
			let list: (CRM.Node & Partial<{
				expanded: boolean;
				name: string;
				shadow: boolean;
				index: number;
			}>)[] = window.app.settings.crm;
			const setMenusLength: number = setMenus.length;
			const showContentTypes: boolean[] = window.app.crmTypes;

			//Hide all nodes that should be hidden
			const hiddenNodes: {
				[nodeId: number]: boolean;
			} = {};
			let shown: number = 0;
			for (let i = 0; i < list.length; i++) {
				shown += this._isNodeVisible(hiddenNodes, list[i], showContentTypes);
			}

			if (shown || this.isAdding) {
				while (lastMenu !== -1) {
					if (setMenusLength > columnNum && setMenus[columnNum] !== -1 &&
							!hiddenNodes[list[setMenus[columnNum]].id]) {
						lastMenu = setMenus[columnNum];
					} else {
						lastMenu = this._getLastMenu(list, hiddenNodes, unsetMenus[columnNum]);
					}
					newSetMenus[columnNum] = lastMenu;

					indent = this._getIndent(list, lastMenu, hiddenNodes);
					const columnIndent = [];
					columnIndent[indentTop - 1] = undefined;

					column = {
						indent: columnIndent,
						menuPath: path.concat(lastMenu),
						list: list as (CRM.Node & {
							expanded: boolean;
							name: string;
							shadow: boolean;
							index: number;	
							isPossibleAddLocation?: boolean;
						})[],
						index: columnNum,
						shadow: window.app.shadowStart && window.app.shadowStart <= columnNum
					} as any;

					list.forEach(function(item) {
						item.expanded = false;
					});
					if (lastMenu !== -1) {
						indentTop += indent;
						const lastNode = list[lastMenu];
						lastNode.expanded = true;
						if (window.app.shadowStart && lastNode.menuVal) {
							list = (lastNode as CRM.ScriptNode|CRM.LinkNode|CRM.DividerNode|CRM.StylesheetNode).menuVal as CRM.Node[];
						} else {
							list = (list[lastMenu] as CRM.MenuNode).children;
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

			this._columns = null;

			return {
				crm: crmEditObj,
				setMenus: newSetMenus
			};
		};

		private static _setColumnContOffset(column: HTMLElement & {
			offset: number;
		}, offset: number, force: boolean = false) {
			if (column.offset === undefined) {
				column.offset = 0;
			}

			if (force) {
				column.offset = offset;	
			} else {
				column.offset += offset;
			}
			window.setTransform(column, `translateY(${column.offset}px)`);
		}

		private static _moveFollowingColumns(startColumn: CRMColumnElement, offset: number) {
			const topLevelColumns = window.app.editCRM.shadowRoot.querySelectorAll('.CRMEditColumnCont');
			for (let i = startColumn.index + 1; i < topLevelColumns.length; i++) {
				this._setColumnContOffset(topLevelColumns[i] as HTMLDivElement & {
					offset: number;
				}, offset);
			}
		}

		private static _createSorter(this: EditCrm) {
			this._sortables = this._sortables.filter((sortable) => {
				sortable.destroy();
				return false;
			});
			this._getColumns().forEach((column, columnIndex, allColumns) => {
				let draggedNode: EditCrmItem = null;
				let moves: number = 0;
				let movedUp: boolean = false;

				this._sortables.push(new Sortable<EditCrmItem, CRMColumnElement>(column, {
					group: 'crm',
					animation: 50,
					handle: '.dragger',
					ghostClass: 'draggingCRMItem',
					chosenClass: 'draggingFiller',
					scroll: true,
					onChoose: (event) => {
						const node = event.item;
						draggedNode = node;

						//Collapse menu if it's a menu type node
						if (node.item.type === 'menu' && node.expanded) {
							//Hide all its children while dragging to avoid confusion

							//Disabe expanded status
							node.expanded = false;
							node.shadowRoot.querySelector('.menuArrow').removeAttribute('expanded');

							//Hide columns to the right
							for (let i = columnIndex + 1; i < allColumns.length; i++) {
								allColumns[i].style.display = 'none';
							}
						}
						node.currentColumn = column;
					},
					onEnd: (event) => {
						//Get the current column
						const newColumn = (event.item.parentNode as CRMColumnElement).index;
						const index = event.newIndex;

						//Upload changes
						window.app.crm.move(event.item.item.path, 
							window.app.editCRM.setMenus.slice(0, newColumn).concat(index), 
							allColumns[newColumn] === column);
					},
					onMove: (event) => {
						this.async(() => {
							if (event.to !== event.dragged.currentColumn) {
								//Column was switched

								//Too many sortable bugs to rely on events, just calculate it
								const topLevelColumns = window.app.editCRM.querySelectorAll('.CRMEditColumnCont') as NodeListOf<HTMLElement & {
									offset: number;
								}>;
								const leftmostColumn = Math.min(event.dragged.currentColumn.index, event.to.index);

								this._setColumnContOffset(topLevelColumns[leftmostColumn], 0, true);

								for (let i = leftmostColumn; i < topLevelColumns.length - 1; i++) {
									const col = topLevelColumns[i];
									const colMenu: EditCrmItem = Array.prototype.slice.apply(col.querySelectorAll('edit-crm-item'))
										.filter((node: EditCrmItem) => {
											return node !== event.dragged && node.item && node.item.type === 'menu' && node.expanded;
										})[0];

									if (!colMenu) {
										//No menu, exit loop
										break;
									}
									const colMenuIndex = Array.prototype.slice.apply(colMenu.parentElement.children)
										.indexOf(colMenu) + window.app.editCRM.crm[i].indent.length + col.offset;
									
									//Get the base offset of the next column
									const baseOffset = window.app.editCRM.crm[i + 1].indent.length;

									this._setColumnContOffset(topLevelColumns[i + 1], (
										(colMenuIndex - baseOffset) * 50
									), true);
								}
							} else {
								//In-column switching

								//Also move the children of any menu if the menu has moved
								if (event.related.item.type === 'menu' && event.related.expanded) {
									//It's passed an expanded menu in some direction

									//If the menu node is below the dragged node before any events,
									//that means that the dragged node is now above the menu node
									if (event.relatedRect.top < event.draggedRect.top) {
										//Above the menu node, move all other columns down
										if (moves !== 1 || !movedUp) {
											//Ignore second move-up, some weird bug in sortable causes this
											this._moveFollowingColumns(event.to, 50);
											movedUp = true;
										}
									} else {
										//Below the menu node, move all other columns up
										this._moveFollowingColumns(event.to, -50);
									}
								}
							}

							draggedNode.currentColumn = event.to;
							moves++;
						}, 10);
					}
				}));
			});
		}

		/**
		 * Builds the crm object
		 * 		  
		 * @param setItems - Set choices for menus by the user
		 * @param quick - Do it quicker than normal
		 * @param superquick - Don't show a loading image and do it immediately
		 * 
		 * @return The object to be sent to Polymer
		 */
		static build(this: EditCrm, settings: {
			setItems?: number[];
			unsetItems?: number[];
			quick?: boolean;
		} = {
			setItems: [],
			unsetItems: [],
			quick: false,
		}): CRMBuilder {
			let {
				setItems, unsetItems, quick
			} = settings;
			setItems = setItems || [];
			unsetItems = unsetItems || [];
			quick = quick || false;

			const obj = this._buildCRMEditObj(setItems, unsetItems);
			this.setMenus = obj.setMenus;
			const crmBuilder = obj.crm;

			//Get the highest column's height and apply it to the element to prevent
			//the page from going and shrinking quickly
			let hight;
			let highest = 0;
			crmBuilder.forEach(function (column) {
				hight = column.indent.length + column.list.length;
				hight > highest && (highest = hight);
			});
			this.$.mainCont.style.minHeight = (highest * 50) + 'px';

			this.crm = [];
			if (this._currentTimeout !== null) {
				window.clearTimeout(this._currentTimeout);
			}
			this.crmLoading = true;
			this._columns = null;

			function func(this: EditCrm) {
				this.crm = crmBuilder;
				this.notifyPath('crm', this.crm);
				this._currentTimeout = null;
				setTimeout(() => {
					this.crmLoading = false;
					const els = this.getItems();
					for (let i = 0; i < els.length; i++) {
						els[i].update && els[i].update();
					}
					setTimeout(() => {
						this._createSorter();
					}, 0);
				}, 50);
			}

			this._currentTimeout = window.setTimeout(func.bind(this), quick ? 150 : 1000);
			return crmBuilder;
		};

		static ready(this: EditCrm) {
			window.onExists('app').then(() => {
				window.app.editCRM = this;
				window.app.addEventListener('crmTypeChanged', () => {
					this._typeChanged();
				});
				this._typeChanged(true);
			});
		};

		static addToPosition(this: EditCrm, e: Polymer.ClickEvent) {
			const node = window.app.util.findElementWithClassName(e, 'addingItemPlaceholder');

			this._addItem(JSON.parse(node.getAttribute('data-path')));
			this.isAdding = false;
		};

		static cancelAdding(this: EditCrm) {
			if (this.isAdding) {
				this.isAdding = false;
				this.build({
					setItems: this._setItems
				});
			}
		};

		static toggleAddState(this: EditCrm) {
			if (!this.isAdding) {
				this.isSelecting && this.cancelSelecting();
				this.isAdding = true;

				this.build({
					setItems: this._setItems
				});
			} else {
				this.cancelAdding();
			}
		};

		private static _addItem(this: EditCrm, path: number[]) {
			const newItem = window.app.templates.getDefaultLinkNode({
				id: window.app.generateItemId() as CRM.NodeId<CRM.LinkNode>
			});

			const container = window.app.crm.lookup(path, true);
			container.push(newItem);
			window.app.editCRM.build({
				setItems: window.app.editCRM.setMenus
			});
			window.app.upload();
		};

		private static _getSelected(this: EditCrm): CRM.GenericNodeId[] {
			const selected: CRM.GenericNodeId[] = [];
			const editCrmItems = this.getItems();
			let i;
			for (i = 0; i < editCrmItems.length; i++) {
				if (editCrmItems[i].$.itemCont.classList.contains('highlighted')) {
					selected.push(editCrmItems[i].item.id as CRM.GenericNodeId);
				}
			}
			return selected;
		};
		
		private static _ifDefSet(this: EditCrm, node: CRM.Node, target: Partial<CRM.SafeNode>, ...props: (keyof CRM.SafeNode)[]) { 
			for (let i = 0; i < props.length; i++) {
				const property = props[i];
				if (node[property] !== void 0) {
					target[property] = node[property];
				}
			}
		}

		static makeNodeSafe(this: EditCrm, node: CRM.Node): CRM.SafeNode {
			const newNode: Partial<CRM.SafeNode> = {};
			this._ifDefSet(node, newNode, 'type', 'name', 'value',
				'linkVal', 'menuVal', 'nodeInfo', 'triggers', 'scriptVal',
				'stylesheetVal', 'onContentTypes', 'showOnSpecified');
			if (node.children) {
				newNode.children = [];
				for (let i = 0; i < node.children.length; i++) {
					newNode.children[i] = this.makeNodeSafe(node.children[i]);
				}
			}
			return newNode as CRM.SafeNode;
		};

		private static _extractUniqueChildren(this: EditCrm, node: CRM.Node, toExportIds: 
			CRM.GenericNodeId[], results: CRM.Node[]) {
				if (toExportIds.indexOf(node.id) > -1) {
					results.push(node);
				} else {
					for (let i = 0; node.children && i < node.children.length; i++) {
						this._extractUniqueChildren(node.children[i], toExportIds, results);
					}
				}
			};

		private static _changeAuthor(this: EditCrm, node: CRM.Node|CRM.SafeNode, authorName: string) {
			if (node.nodeInfo.source !== 'local') {
				node.nodeInfo.source.author = authorName;
				for (let i = 0; node.children && i < node.children.length; i++) {
					this._changeAuthor(node.children[i], authorName);
				}
			}
		};

		private static _crmExportNameChange(this: EditCrm, node: CRM.Node, author: string): string {
			if (author) {
				node.nodeInfo && node.nodeInfo.source && node.nodeInfo.source !== 'local' &&
					(node.nodeInfo.source.author = author);
			}
			return JSON.stringify(node);
		};

		private static _getMetaIndexes(this: EditCrm, script: string): {
			start: number;
			end: number;
		} {
			let metaStart = -1;
			let metaEnd = -1;
			const lines = script.split('\n');
			for (let i = 0; i < lines.length; i++) {
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

		private static _getMetaLines(this: EditCrm, script: string): string[] {
			const metaIndexes = this._getMetaIndexes(script);
			if (metaIndexes.start === -1) {
				return null;
			}
			const metaStart = metaIndexes.start;
			const metaEnd = metaIndexes.end;
			const startPlusOne = metaStart + 1;
			const lines = script.split('\n');
			const metaLines = lines.splice(startPlusOne, (metaEnd - startPlusOne));
			return metaLines;
		};

		private static _getMetaTags(this: EditCrm, script: string): {
			[key: string]: (string|number)[];
		} {
			const metaLines = this._getMetaLines(script);

			const metaTags: CRM.MetaTags = {};
			const regex = new RegExp(/@(\w+)(\s+)(.+)/);
			let regexMatches;
			for (let i = 0; i < metaLines.length; i++) {
				regexMatches = metaLines[i].match(regex);
				if (regexMatches) {
					metaTags[regexMatches[1]] = metaTags[regexMatches[1]] || [];
					metaTags[regexMatches[1]].push(regexMatches[3]);
				}
			}

			return metaTags;
		};

		private static _setMetaTagIfSet<K extends keyof U, U>(this: EditCrm, metaTags: CRM.MetaTags, metaTagKey: string, nodeKey: K, node: U) {
			if (node && node[nodeKey]) {
				if (Array.isArray(node[nodeKey])) {
					metaTags[metaTagKey] = node[nodeKey] as any;
				} else {
					metaTags[metaTagKey] = [node[nodeKey]] as any;
				}
			}
		};

		private static _getUserscriptString(this: EditCrm, node: CRM.ScriptNode|CRM.StylesheetNode, author: string): string {
			let i;
			const code = (node.type === 'script' ? node.value.script : node.value.stylesheet);
			let codeSplit = code.split('\n');
			const metaIndexes = this._getMetaIndexes(code);
			let metaTags: {
				[key: string]: (string|number)[];
			} = {};
			if (metaIndexes.start !== -1) {
				//Remove metaLines
				codeSplit.splice(metaIndexes.start, (metaIndexes.end - metaIndexes.start) + 1);
				metaTags = this._getMetaTags(code);
			}

			this._setMetaTagIfSet(metaTags, 'name', 'name', node);
			author = (metaTags['nodeInfo'] && JSON.parse(metaTags['nodeInfo'][0] as string).author) || author || 'anonymous';
			let authorArr: string[] = [];
			if (!Array.isArray(author)) {
				authorArr = [author];
			}
			metaTags['author'] = authorArr;
			if (node.nodeInfo.source !== 'local') {
				this._setMetaTagIfSet(metaTags, 'downloadURL', 'url', node.nodeInfo.source);
			}
			this._setMetaTagIfSet(metaTags, 'version', 'version', node.nodeInfo);
			metaTags['CRM_contentTypes'] = [JSON.stringify(node.onContentTypes)];
			this._setMetaTagIfSet(metaTags, 'grant', 'permissions', node);

			const matches = [];
			const excludes = [];
			for (i = 0; i < node.triggers.length; i++) {
				if (node.triggers[i].not) {
					excludes.push(node.triggers[i].url);
				} else {
					matches.push(node.triggers[i].url);
				}
			}

			metaTags['match'] = matches;
			metaTags['exclude'] = excludes;

			this._setMetaTagIfSet(metaTags, 'CRM_launchMode', 'launchMode', node.value);
			if (node.type === 'script' && node.value.libraries) {
				metaTags['require'] = [];
				for (i = 0; i < node.value.libraries.length; i++) {
					//Turn into requires
					if (node.value.libraries[i].url) {
						metaTags['require'].push(node.value.libraries[i].url as string);
					}
				}
			}

			if (node.type === 'stylesheet') {
				metaTags['CRM_stylesheet'] = ['true'];
				this._setMetaTagIfSet(metaTags, 'CRM_toggle', 'toggle', node.value);
				this._setMetaTagIfSet(metaTags, 'CRM_defaultOn', 'defaultOn', node.value);

				//Convert stylesheet to GM API stylesheet insertion
				const stylesheetCode = codeSplit.join('\n');
				codeSplit = [`GM_addStyle('${stylesheetCode.replace(/\n/g, '\\n\' + \n\'')}');`];
			}

			const metaLines = [];
			for (let metaKey in metaTags) {
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

		private static _generateDocumentRule(this: EditCrm, node: CRM.StylesheetNode): string {
			const rules = node.triggers.map(function (trigger) {
				if (trigger.url.indexOf('*') === -1) {
					return 'url(' + trigger + ')';
				} else {
					const schemeAndDomainPath = trigger.url.split('://');
					const scheme = schemeAndDomainPath[0];
					const domainPath = schemeAndDomainPath.slice(1).join('://');
					const domainAndPath = domainPath.split('/');
					const domain = domainAndPath[0];
					const path = domainAndPath.slice(1).join('/');

					let schemeWildCard = scheme.indexOf('*') > -1;
					let domainWildcard = domain.indexOf('*') > -1;
					let pathWildcard = path.indexOf('*') > -1;

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

			let match;
			let indentation: string;
			const lines = node.value.stylesheet.split('\n');
			for (let i = 0; i < lines.length; i++) {
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

		private static _getExportString(this: EditCrm, node: CRM.Node, type: string, author: string) {
			switch (type) {
				case 'Userscript':
					return this._getUserscriptString(node as CRM.ScriptNode, author);
				case 'Userstyle':
					//Turn triggers into @document rules
					if ((node as CRM.StylesheetNode).value.launchMode === 0 || (node as CRM.StylesheetNode).value.launchMode === 1) {
						//On clicking
						return (node as CRM.StylesheetNode).value.stylesheet;
					} else {
						return this._generateDocumentRule(node as CRM.StylesheetNode);
					}
				default:
				case 'CRM':
					return this._crmExportNameChange(node as CRM.Node, author);
			}
		};

		static exportSingleNode(this: EditCrm, exportNode: CRM.Node, exportType: string) {
			const textArea = window.doc.exportJSONData;

			textArea.value = this._getExportString(exportNode, exportType, null);
			window.doc.exportAuthorName.value = 
				(exportNode.nodeInfo && exportNode.nodeInfo.source && 
					exportNode.nodeInfo.source &&
					exportNode.nodeInfo.source !== 'local' &&
					exportNode.nodeInfo.source.author) || 'anonymous';
			window.doc.exportAuthorName.addEventListener('keydown', () => {
				window.setTimeout(() => {
					const author = window.doc.exportAuthorName.value;
					browserAPI.storage.local.set({
						authorName: author
					});
					let data;
					data = this._getExportString(exportNode, exportType, author);
					textArea.value = data;
				}, 0);
			});
			window.doc.exportDialog.open();
			setTimeout(() => {
				textArea.focus();
				textArea.select();
			}, 150);
		};

		private static _exportGivenNodes(this: EditCrm, exports: CRM.Node[]) {
			const __this = this;

			const safeExports: CRM.SafeNode[] = [];
			for (let i = 0; i < exports.length; i++) {
				safeExports[i] = this.makeNodeSafe(exports[i]);
			}
			const data = {
				crm: safeExports
			};

			const textarea = window.doc.exportJSONData;

			function authorNameChange(event: {
				target: {
					value: string
				}
			}) {
				const author = (event.target as {
					value: string;
				}).value;
				browserAPI.storage.local.set({
					authorName: author
				});
				for (let j = 0; j < safeExports.length; j++) {
					__this._changeAuthor(safeExports[j], author);
				}
				const dataJson = JSON.stringify({
					crm: safeExports
				});
				textarea.value = dataJson;
			}

			window.app.$.exportAuthorName.addEventListener('change', (event) => {
				authorNameChange(event as any);
			});
			textarea.value = JSON.stringify(data);
			window.app.$.exportDialog.open();
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

		private static _exportGivenNodeIDs(this: EditCrm, toExport: CRM.GenericNodeId[]) {
			const exports: CRM.Node[] = [];
			for (let i = 0; i < window.app.settings.crm.length; i++) {
				this._extractUniqueChildren(window.app.settings.crm[i], toExport, exports);
			}

			this._exportGivenNodes(exports);
		};

		static exportSelected(this: EditCrm) {
			const toExport = this._getSelected();
			this._exportGivenNodeIDs(toExport);
		};

		static cancelSelecting(this: EditCrm) {
			const editCrmItems = this.getItems();
			//Select items
			for (let i = 0; i < editCrmItems.length; i++) {
				if (editCrmItems[i].rootNode) {
					continue;
				}
				editCrmItems[i].$.itemCont.classList.remove('selecting');
				editCrmItems[i].$.itemCont.classList.remove('highlighted');
			}
			setTimeout(() => {
				this.isSelecting = false;
			}, 150);
		};

		static removeSelected(this: EditCrm) {
			let j;
			let arr;
			const toRemove = this._getSelected();
			for (let i = 0; i < toRemove.length; i++) {
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
			this.build({
				quick: true
			});

			this.isSelecting = false;
		};

		static selectItems(this: EditCrm) {
			const editCrmItems = this.getItems();
			//Select items
			for (let i = 0; i < editCrmItems.length; i++) {
				editCrmItems[i].$.itemCont.classList.add('selecting');
			}
			setTimeout(() => {
				this.isSelecting = true;
			}, 150);
		};

		static getCRMElementFromPath(this: EditCrm, path: number[], showPath: boolean = false): EditCrmItem {
			let i;
			for (i = 0; i < path.length - 1; i++) {
				if (this.setMenus[i] !== path[i]) {
					if (showPath) {
						this.build({
							setItems: path
						});
						break;
					} else {
						return null;
					}
				}
			}

			const cols = this.$.CRMEditColumnsContainer.children;
			let row = cols[path.length - 1].querySelector('.CRMEditColumn').children;

			for (i = 0; i < row.length; i++) {
				if (window.app.util.compareArray((row[i] as EditCrmItem).item.path, path)) {
					return (row[i] as EditCrmItem);
				}
			}
			return null;
		};

		private static _getCrmTypeFromNumber(crmType: number): string {
			const types = ['page', 'link', 'selection', 'image', 'video', 'audio'];
			return types[crmType];
		};

		private static _typeChanged(this: EditCrm, quick: boolean = false) {
			const crmTypes = window.app.crmTypes || [true, true, true, true, true, true];
			for (let i = 0; i < 6; i++) {
				window.app.editCRM.classList[crmTypes[i] ? 'add' : 'remove'](this._getCrmTypeFromNumber(i));
			}
			window.runOrAddAsCallback(window.app.editCRM.build, window.app.editCRM, [{
				quick: quick
			}]);
		}

		static getItems(this: EditCrm): EditCrmItem[] {
			return Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('edit-crm-item'));
		}

		static getItemsWithClass(this: EditCrm, className: string) {
			return this.getItems().filter((item) => {
				return item.$.itemCont.classList.contains(className);
			});
		}
	}

	if (window.objectify) {
		window.register(EC);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(EC);
		});
	}
}

type EditCrm = Polymer.El<'edit-crm', typeof EditCrmElement.EC & typeof EditCrmElement.editCrmProperties>;