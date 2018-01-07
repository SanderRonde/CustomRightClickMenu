/// <reference path="../elements.d.ts" />

namespace EditCrmItemElement {
	export const editCrmItemProperties: {
		item: CRM.Node;
		expanded: boolean;
		shadow: boolean;
		itemName: string;
		isMenu: boolean;
		isCode: boolean;
		rootNode: boolean;
	} = {
		item: {
			type: Object,
			notify: true
		},
		expanded: {
			type: Boolean,
			notify: true
		},
		shadow: {
			type: Boolean,
			notify: true
		},
		itemName: {
			type: String,
			notify: true
		},
		isMenu: {
			type: Boolean,
			notify: true
		},
		isCode: {
			type: Boolean,
			notify: true
		},
		rootNode: {
			type: Boolean,
			notify: true
		}
	} as any;

	export class ECI {
		static is: string = 'edit-crm-item';

		/**
		 * The type of this item
		*/
		static type: string = '';

		/**
		 * Whether the item is a link
		 */
		private static _isLink: boolean = false;

		/**
		 * Whether the item is a script
		 */
		private static _isScript: boolean = false;

		/**
		 * Whether the item is a stylesheet
		 */
		private static _isStylesheet: boolean = false;

		/**
		 * Whether the item is a divider
		 */
		private static _isDivider: boolean = false;

		static properties = editCrmItemProperties;

		static itemIndex: number;

		static index: number;

		/**
		 * The element to be animated
		 */
		private static _animationEl: HTMLElement = null;

		/**
		 * The showing animation of the type indicator
		 */
		private static _typeIndicatorAnimation: Animation = null;

		/**
		 * The time of the last mouseover over the type-switcher
		 */
		private static _lastTypeSwitchMouseover: number = null;

		/**
		 * The column this element is currently in
		 */
		static currentColumn: EditCrmElement.CRMColumnElement;

		/**
		 * Whether the element's attached callback has been called before
		 */
		private static _hasBeenAttached: boolean = false;

		/**
		 * Whether the user is currently hovering over the type switcher
		 */
		private static _hoveringTypeSwitcher: boolean = false;

		static _openCodeSettings(this: EditCrmItem) {
			window.app.initCodeOptions(this.item as CRM.ScriptNode|CRM.StylesheetNode);
		}

		static getMenuExpandMessage(this: EditCrmItem) {
			return 'Click to show ' + (this.item as CRM.MenuNode).children.length + ' child' + 
				((this.item as CRM.MenuNode).children.length > 1 ? 'ren' : '');
		};

		static update(this: EditCrmItem) {
			if (!this.classList.contains('id' + this.item.id)) {
				//Remove old ID and call ready
				const classes = this.classList;
				for (let i = 0; i < classes.length; i++) {
					if (classes[i].indexOf('id') > -1) {
						this.classList.remove(classes[i]);
						break;
					}
				}

				this.attached(true);
			}
		};

		static updateName(this: EditCrmItem, name: string) {
			if (name === undefined) {
				name = window.app.settings.rootName = 'Custom Menu';
				window.app.upload();
			}
			this.set('itemName', name);
			this.item.name = name;
		}

		static rootNameChange(this: EditCrmItem) {
			const value = (this.querySelector('#rootNameTitle') as HTMLInputElement).value;
			window.app.settings.rootName = value;
			window.app.upload();
		}

		private static _initRootNode(this: EditCrmItem) {
			this.item = window.app.templates.getDefaultDividerNode({
				name: 'Custom Menu',
				id: -1,
				index: -1,
				path: [-1],
				onContentTypes: [true, true, true, true, true, true]
			});
		}

		static onMouseOver(this: EditCrmItem, e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();
			if (!this._hoveringTypeSwitcher) {
				this._hoveringTypeSwitcher = true;
				this.typeIndicatorMouseOver();
			}
		}

		static attached(this: EditCrmItem, force: boolean = false) {
			if (this._hasBeenAttached && !force) {
				return;
			}
			this._hasBeenAttached = true;

			if (this.classList.contains('draggingFiller')) {
				//It's a dragging copy
				return;
			}

			document.body.addEventListener('mousemove', () => {
				if (this._hoveringTypeSwitcher) {
					this._hoveringTypeSwitcher = false;
					this._typeIndicatorMouseLeave();
				}
			});

			window.onExists('app').then(() => {
				if (this.rootNode) {
					//Skip initialization, only name is changable
					this._initRootNode();
					return;
				} else {
					this.rootNode = false;
				}

				this.classList.add('id' + this.item.id);
				if (this.classList[0] !== 'wait') {
					this.itemIndex = this.index;
					this.item = this.item;
					this.itemName = this.item.name;
					this.calculateType();
					this.itemIndex = this.index;
					this.$$('#typeSwitcher') && this.$$('#typeSwitcher').ready && this.$$('#typeSwitcher').ready();

					if (window.app.editCRM.isSelecting) {
						this.classList.add('selecting');
						if (window.app.editCRM.selectedElements.indexOf(this.item.id) > -1) {
							this._onSelect(true, true);
						} else {
							this._onDeselect(true, true);
						}
					}
				}
			});
		}

		static openMenu(this: EditCrmItem) {
			window.app.editCRM.build({
				setItems: this.item.path,
				superquick: true
			});
		};

		private static _selectThisNode(this: EditCrmItem) {
			let prevState = this.$.checkbox.checked;
			this.$.checkbox.checked = !prevState;
			if (document.getElementsByClassName('highlighted').length === 0) {
				this.classList.add('firstHighlighted');
			}
			prevState ? this._onDeselect() : this._onSelect();
		};

		static openEditPage(this: EditCrmItem) {
			if (!this.shadow && !window.app.item && !this.rootNode) {
				if (!this.classList.contains('selecting')) {
					const item = this.item;
					window.app.item = item;
					if (item.type === 'script') {
						window.app.stylesheetItem = null;
						window.app.scriptItem = item;
					} else if (item.type === 'stylesheet') {
						window.app.scriptItem = null;
						window.app.stylesheetItem = item;
					} else {
						window.app.stylesheetItem = null;
						window.app.scriptItem = null;
					}

					window.crmEditPage.init();
				} else {
					this._selectThisNode();
				}
			}
		};

		static getTitle(this: EditCrmItem): string {
			if (this.rootNode) {
				return 'Click to edit root node name';
			} else {
				return 'Click to edit node';
			}
		}

		private static _getNextNode(node: CRM.Node): CRM.Node {
			if (node.children) {
				return node.children[0];
			}

			const path = Array.prototype.slice.apply(node.path);
			let currentNodeSiblings = window.app.crm.lookup(path, true);
			let currentNodeIndex = path.splice(path.length - 1, 1)[0];
			while (currentNodeSiblings.length - 1 <= currentNodeIndex) {
				currentNodeSiblings = window.app.crm.lookup(path, true);
				currentNodeIndex = path.splice(path.length - 1, 1)[0];
			}
			return currentNodeSiblings[currentNodeIndex + 1];
		};

		private static _getPreviousNode(node: CRM.Node): CRM.Node {
			const path = Array.prototype.slice.apply(node.path);
			const currentNodeSiblings = window.app.crm.lookup(path, true);
			const currentNodeIndex = path.splice(path.length - 1, 1)[0];
			if (currentNodeIndex === 0) {
				//return parent
				const parent = window.app.crm.lookup(path) as CRM.Node;
				return parent;
			}
			const possibleParent = currentNodeSiblings[currentNodeIndex - 1];
			if (possibleParent.children) {
				return possibleParent.children[possibleParent.children.length - 1];
			}
			return possibleParent;
		};

		private static _getNodesOrder(this: EditCrmItem, reference: CRM.Node, other: CRM.Node): 'after'|'before'|'same' {
			let i;
			const referencePath = reference.path;
			const otherPath = other.path;
			
			//Check if they're the same
			if (referencePath.length === otherPath.length) {
				let same = true;
				for (i = 0; i < referencePath.length; i++) {
					if (referencePath[i] !== otherPath[i]) {
						same = false;
						break;
					}
				}
				if (same) {
					return 'same';
				}
			}

			const biggestArray = (referencePath.length > otherPath.length ? referencePath.length : otherPath.length);
			for (i = 0; i < biggestArray; i++) {
				if (otherPath[i] !== undefined && referencePath[i] !== undefined) {
					if (otherPath[i] > referencePath[i]) {
						return 'after';
					}
					else if (otherPath[i] < referencePath[i]) {
						return 'before';
					}
				} else {
					if (otherPath[i] !== undefined) {
						return 'after';
					} else {
						return 'before';
					}
				}
			}
			return 'same';
		};

		private static _generateShiftSelectionCallback(this: EditCrmItem, node: CRM.Node, wait: number): () => void {
			return function() {
				window.setTimeout(function() {
					window.app.editCRM.getCRMElementFromPath(node.path)._onSelect(true);
				}, wait);
			};
		};

		private static _selectFromXToThis(this: EditCrmItem) {
			//Get the first highlighted node
			const firstHighlightedNode = document.getElementsByClassName('firstHighlighted')[0] as EditCrmItem;
			const firstHighlightedItem = firstHighlightedNode.item;

			//Deselect everything else
			Array.prototype.slice.apply(window.app.editCRM.shadowRoot.querySelectorAll('.highlighted')).forEach((element: HTMLEditCrmElement) => {
				element.classList.remove('highlighted');
			});

			//Find out if the clicked on node is before, at, or after the first highlighted node
			const relation = this._getNodesOrder(firstHighlightedItem, this.item);
			if (relation === 'same') {
				this.classList.add('highlighted');
				this.$.checkbox.checked = true;
				window.app.editCRM.selectedElements = [this.item.id];
			}
			else {
				firstHighlightedNode.classList.add('highlighted');
				firstHighlightedNode.$.checkbox.checked = true;
				window.app.editCRM.selectedElements = [firstHighlightedNode.item.id];

				let wait = 0;
				const nodeWalker = (relation === 'after' ? this._getNextNode : this._getPreviousNode);
				let node = nodeWalker(firstHighlightedItem);
				while (node.id !== this.item.id) {
					this._generateShiftSelectionCallback(node, wait)();
					wait += 35;
					node = nodeWalker(node);
				}
				
				//Finally select this node
				window.setTimeout(() => {
					this.classList.add('highlighted');
					this.$.checkbox.checked = true;
					window.app.editCRM.selectedElements.push(this.item.id);
				}, wait);
			}
		};

		static checkClickType(this: EditCrmItem, e: Polymer.ClickEvent) {
			if (this.rootNode) {
				return;
			} else if (e.detail.sourceEvent.ctrlKey) {
				window.app.editCRM.cancelAdding();
				window.app.editCRM.selectItems();
				this._selectThisNode();
			}
			else if (this.classList.contains('selecting') && e.detail.sourceEvent.shiftKey) {
				this._selectFromXToThis();
			} else {
				window.app.editCRM.cancelAdding();
				this.openEditPage();
			}
		};

		static calculateType(this: EditCrmItem) {
			this.type = this.item.type;
			((this._isScript = this.item.type === 'script') &&
				(this._isLink = this.isMenu = this._isDivider = this._isStylesheet = false)) || 
			((this._isLink = this.item.type === 'link') && 
				(this.isMenu = this._isDivider = this._isStylesheet = false)) || 
			((this._isStylesheet = this.item.type === 'stylesheet') && 
				(this.isMenu = this._isDivider = false)) || 
			((this.isMenu = this.item.type === 'menu') && 
				(this._isDivider = false)) || 
			(this._isDivider = true);

			this.isCode = this._isScript || this._isStylesheet;
		};

		static typeIndicatorMouseOver(this: EditCrmItem) {
			if (!this.shadow) {
				const time = Date.now();
				this._lastTypeSwitchMouseover = time;
				this.async(() => {
					if (this._lastTypeSwitchMouseover === time) {
						this._lastTypeSwitchMouseover = null;
						this._animationEl = this._animationEl || (this.$$('type-switcher') as TypeSwitcher).$$('.TSContainer');
						(this._typeIndicatorAnimation && this._typeIndicatorAnimation.play()) || (this._typeIndicatorAnimation = this._animationEl.animate([
								{
									marginLeft: '-293px'
								}, {
									marginLeft: 0
								}
							], {
								duration: 300,
								fill: 'both',
								easing: 'bez'
							}
						));
					}
				}, 25);
			}
		};

		private static _animateOut(this: EditCrmItem) {
			this._typeIndicatorAnimation && this._typeIndicatorAnimation.reverse();
		};

		private static _typeIndicatorMouseLeave(this: EditCrmItem) {
			this._lastTypeSwitchMouseover = null;
			if (!this.shadow) {
				const typeSwitcher = this.$$('#typeSwitcher');
				if (typeSwitcher.toggledOpen) {
					typeSwitcher.closeTypeSwitchContainer(true, () => {
						typeSwitcher.toggledOpen = false;
						typeSwitcher.$.typeSwitchChoicesContainer.style.display = 'none';
						typeSwitcher.$.typeSwitchArrow.style.transform = 'rotate(180deg)';
						this._animateOut();
					});
				} else {
					this._animateOut();
				}
			}
		};

		private static _getOnSelectFunction(this: EditCrmItem, index: number) {
			return () => {
				window.app.editCRM.getCRMElementFromPath((this.item.children as Array<CRM.Node>)[index].path)._onSelect(true);
			};
		};

		private static _onSelect(this: EditCrmItem, selectCheckbox: boolean = false, dontSelectChildren: boolean = false) {
			this.classList.add('highlighted');
			selectCheckbox && (this.$.checkbox.checked = true);
			if (this.item.children && !dontSelectChildren) {
				for (let i = 0; i < this.item.children.length; i++) {
					setTimeout(() => {
						this._getOnSelectFunction(i)
					}, (i * 35));
					window.app.editCRM.selectedElements.push(this.item.children[i].id);
				}
			}
		};

		private static _getOnDeselectFunction(this: EditCrmItem, index: number) {
			return () => {
				window.app.editCRM.getCRMElementFromPath((this.item.children as Array<CRM.Node>)[index].path)._onDeselect(true);
			};
		};

		private static _onDeselect(this: EditCrmItem, selectCheckbox: boolean = false, dontSelectChildren: boolean = false) {
			this.classList.remove('highlighted');
			selectCheckbox && (this.$.checkbox.checked = false);
			if (this.item.children && !dontSelectChildren) {
				const selectedPaths = window.app.editCRM.selectedElements;
				for (let i = 0; i < this.item.children.length; i++) {
					setTimeout(() => {
						this._getOnDeselectFunction(i)
					}, (i * 35));
					selectedPaths.splice(selectedPaths.indexOf(this.item.children[i].id), 1);
				}
			}
		};

		static onToggle(this: EditCrmItem) {
			setTimeout(() => {
				if (this.$.checkbox.checked) {
					this._onSelect();
				} else {
					this._onDeselect();
				}
			}, 0);
		}
	}

	if (window.objectify) {
		window.register(ECI);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(ECI);
		});
	}
}

type EditCrmItem = Polymer.El<'edit-crm-item', 
	typeof EditCrmItemElement.ECI & typeof EditCrmItemElement.editCrmItemProperties>;