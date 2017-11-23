/// <reference path="../elements.d.ts" />

const editCrmItemProperties: {
	item: CRM.Node;
	expanded: boolean;
	shadow: boolean;
	itemName: string;
	isMenu: boolean;
	isCode: boolean;
	rootNode: boolean;
	isSelecting: boolean;
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
	},
	isSelecting: {
		type: Boolean,
		notify: true,
		value: false
	}
} as any;

class ECI {
	static is: string = 'edit-crm-item';

	/**
	  * The type of this item
	  */
	static type: string = '';

	/**
	 * Whether the item is a link
	 */
	private static isLink: boolean = false;

	/**
	 * Whether the item is a script
	 */
	private static isScript: boolean = false;

	/**
	 * Whether the item is a stylesheet
	 */
	private static isStylesheet: boolean = false;

	/**
	 * Whether the item is a divider
	 */
	private static isDivider: boolean = false;

	static properties = editCrmItemProperties;

	static index: number;

	/**
     * The element to be animated
     */
	private static animationEl: HTMLElement = null;

	/**
     * The showing animation of the type indicator
     */
	private static typeIndicatorAnimation: Animation = null;

	/**
	 * The time of the last mouseover over the type-switcher
	 */
	private static lastTypeSwitchMouseover: number = null;

	/**
	 * The column this element is currently in
	 */
	static currentColumn: CRMColumnElement;

	/**
	 * Whether the user is currently hovering over the type switcher
	 */
	private static hoveringTypeSwitcher: boolean = false;

	static onMouseOver(this: EditCrmItem, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!this.hoveringTypeSwitcher) {
			this.hoveringTypeSwitcher = true;
			this.typeIndicatorMouseOver();
		}
	}

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

			this.ready();
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

	private static initRootNode(this: EditCrmItem) {
		this.item = window.app.templates.getDefaultDividerNode({
			name: 'Custom Menu',
			id: -1,
			index: -1,
			path: [-1],
			onContentTypes: [true, true, true, true, true, true]
		});
	}

	private static ready(this: EditCrmItem) {
		if (this.classList.contains('draggingFiller')) {
			//It's a dragging copy
			return;
		}

		if (this.rootNode) {
			//Skip initialization, only name is changable
			this.initRootNode();
			return;
		} else {
			this.rootNode = false;
		}

		this.classList.add('id' + this.item.id);
		if (this.classList[0] !== 'wait') {
			this.item = this.item;
			this.itemName = this.item.name;
			this.calculateType();
			this.$.typeSwitcher && this.$.typeSwitcher.ready && this.$.typeSwitcher.ready();

			if (window.app.editCRM.isSelecting) {
				this.classList.add('selecting');
				if (window.app.editCRM.selectedElements.indexOf(this.item.id) > -1) {
					this.onSelect(true, true);
				} else {
					this.onDeselect(true, true);
				}
			}
		}
		document.body.addEventListener('mousemove', () => {
			if (this.hoveringTypeSwitcher) {
				this.hoveringTypeSwitcher = false;
				this.typeIndicatorMouseLeave.apply(this, []);
			}
		});
	};

	static openMenu(this: EditCrmItem) {
		window.app.editCRM.build({
			setItems: this.item.path,
			superquick: true
		});
	};

	private static selectThisNode(this: EditCrmItem) {
		const checkbox = this.querySelector('#checkbox') as HTMLPaperCheckboxElement;
		let prevState = checkbox.checked;
		checkbox.checked = !prevState;
		if (document.getElementsByClassName('highlighted').length === 0) {
			this.classList.add('firstHighlighted');
		}
		prevState ? this.onDeselect() : this.onSelect();
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
				this.selectThisNode();
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

	private static getNextNode(node: CRM.Node): CRM.Node {
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

	private static getPreviousNode(node: CRM.Node): CRM.Node {
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

	private static getNodesOrder(this: EditCrmItem, reference: CRM.Node, other: CRM.Node): 'after'|'before'|'same' {
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

	private static generateShiftSelectionCallback(this: EditCrmItem, node: CRM.Node, wait: number): () => void {
		return function() {
			window.setTimeout(function() {
				window.app.editCRM.getCRMElementFromPath(node.path).onSelect(true);
			}, wait);
		};
	};

	private static selectFromXToThis(this: EditCrmItem) {
		const _this = this;

		//Get the first highlighted node
		const firstHighlightedNode = document.getElementsByClassName('firstHighlighted')[0] as EditCrmItem;
		const firstHighlightedItem = firstHighlightedNode.item;

		//Deselect everything else
		$('.highlighted').each(function(this: HTMLElement) {
			this.classList.remove('highlighted');
		});

		//Find out if the clicked on node is before, at, or after the first highlighted node
		const relation = this.getNodesOrder(firstHighlightedItem, this.item);
		const checkbox = this.querySelector('#checkbox') as HTMLPaperCheckboxElement
		if (relation === 'same') {
			this.classList.add('highlighted');
			checkbox.checked = true;
			window.app.editCRM.selectedElements = [this.item.id];
		}
		else {
			firstHighlightedNode.classList.add('highlighted');
			(firstHighlightedNode.querySelector('#checkbox') as HTMLPaperCheckboxElement).checked = true;
			window.app.editCRM.selectedElements = [firstHighlightedNode.item.id];

			let wait = 0;
			const nodeWalker = (relation === 'after' ? this.getNextNode : this.getPreviousNode);
			let node = nodeWalker(firstHighlightedItem);
			while (node.id !== this.item.id) {
				this.generateShiftSelectionCallback(node, wait)();
				wait += 35;
				node = nodeWalker(node);
			}
			
			//Finally select this node
			window.setTimeout(function() {
				_this.classList.add('highlighted');
				checkbox.checked = true;
				window.app.editCRM.selectedElements.push(_this.item.id);
			}, wait);
		}
	};

	static checkClickType(this: EditCrmItem, e: Polymer.ClickEvent) {
		if (this.rootNode) {
			return;
		} else if (e.detail.sourceEvent.ctrlKey) {
			window.app.editCRM.cancelAdding();
			window.app.editCRM.selectItems();
			this.selectThisNode();
		}
		else if (this.classList.contains('selecting') && e.detail.sourceEvent.shiftKey) {
			this.selectFromXToThis();
		} else {
			window.app.editCRM.cancelAdding();
			this.openEditPage();
		}
	};

	static calculateType(this: EditCrmItem) {
		this.type = this.item.type;
		((this.isScript = this.item.type === 'script') &&
			(this.isLink = this.isMenu = this.isDivider = this.isStylesheet = false)) || 
		((this.isLink = this.item.type === 'link') && 
			(this.isMenu = this.isDivider = this.isStylesheet = false)) || 
		((this.isStylesheet = this.item.type === 'stylesheet') && 
			(this.isMenu = this.isDivider = false)) || 
		((this.isMenu = this.item.type === 'menu') && 
			(this.isDivider = false)) || 
		(this.isDivider = true);

		this.isCode = this.isScript || this.isStylesheet;
	};

	static typeIndicatorMouseOver(this: EditCrmItem) {
		if (!this.shadow) {
			const time = Date.now();
			this.lastTypeSwitchMouseover = time;
			this.async(() => {
				if (this.lastTypeSwitchMouseover === time) {
					this.lastTypeSwitchMouseover = null;
					this.animationEl = this.animationEl || (this.$$('type-switcher') as TypeSwitcher).$$('.TSContainer');
					(this.typeIndicatorAnimation && this.typeIndicatorAnimation.play()) || (this.typeIndicatorAnimation = this.animationEl.animate([
							{
								marginLeft: '-193px'
							}, {
								marginLeft: 0
							}
						], {
							duration: 300,
							fill: 'both',
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}
					));
				}
			}, 25);
		}
	};

	private static animateOut(this: EditCrmItem) {
		this.typeIndicatorAnimation && this.typeIndicatorAnimation.reverse();
	};

	private static typeIndicatorMouseLeave(this: EditCrmItem) {
		const _this = this;
		this.lastTypeSwitchMouseover = null;
		if (!this.shadow) {
			const typeSwitcher = this.$$('type-switcher') as HTMLTypeSwitcherElement;
			if (typeSwitcher.toggledOpen) {
				typeSwitcher.closeTypeSwitchContainer(true, function() {
					typeSwitcher.toggledOpen = false;
					typeSwitcher.$.typeSwitchChoicesContainer.style.display = 'none';
					typeSwitcher.$.typeSwitchArrow.style.transform = 'rotate(180deg)';
					_this.animateOut();
				});
			} else {
				this.animateOut();
			}
		}
	};

	private static _getOnSelectFunction(_this: EditCrmItem, index: number) {
		return function () {
			window.app.editCRM.getCRMElementFromPath((_this.item.children as Array<CRM.Node>)[index].path).onSelect(true);
		};
	};

	private static onSelect(this: EditCrmItem, selectCheckbox: boolean = false, dontSelectChildren: boolean = false) {
		this.classList.add('highlighted');
		const checkbox = this.querySelector('#checkbox') as HTMLPaperCheckboxElement
		selectCheckbox && (checkbox.checked = true);
		if (this.item.children && !dontSelectChildren) {
			for (let i = 0; i < this.item.children.length; i++) {
				setTimeout(this._getOnSelectFunction(this, i), (i * 35));
				window.app.editCRM.selectedElements.push(this.item.children[i].id);
			}
		}
	};

	private static _getOnDeselectFunction(_this: EditCrmItem, index: number) {
		return function () {
			window.app.editCRM.getCRMElementFromPath((_this.item.children as Array<CRM.Node>)[index].path).onDeselect(true);
		};
	};

	private static onDeselect(this: EditCrmItem, selectCheckbox: boolean = false, dontSelectChildren: boolean = false) {
		this.classList.remove('highlighted');
		const checkbox = this.querySelector('#checkbox') as HTMLPaperCheckboxElement
		selectCheckbox && (checkbox.checked = false);
		if (this.item.children && !dontSelectChildren) {
			const selectedPaths = window.app.editCRM.selectedElements;
			for (let i = 0; i < this.item.children.length; i++) {
				setTimeout(this._getOnDeselectFunction(this, i), (i * 35));
				selectedPaths.splice(selectedPaths.indexOf(this.item.children[i].id), 1);
			}
		}
	};

	static onToggle(this: EditCrmItem) {
		const _this = this;
		const checkbox = this.querySelector('#checkbox') as HTMLPaperCheckboxElement
		setTimeout(function () {
			if (checkbox.checked) {
				_this.onSelect();
			} else {
				_this.onDeselect();
			}
		}, 0);
	}
}

type EditCrmItem = Polymer.El<'edit-crm-item', 
	typeof ECI & typeof editCrmItemProperties>;

Polymer(ECI);