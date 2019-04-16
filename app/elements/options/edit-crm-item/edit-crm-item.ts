/// <reference path="../../elements.d.ts" />

import { CRMColumnElement } from '../edit-crm/edit-crm';
import { Polymer } from '../../../../tools/definitions/polymer';
import { I18NKeys } from '../../../_locales/i18n-keys';

namespace EditCrmItemElement {
	export const editCrmItemProperties: {
		item: CRM.Node;
		expanded: boolean;
		shadow: boolean;
		itemName: string;
		isMenu: boolean;
		hasCodeSettings: boolean;
		rootNode: boolean;
		crmTypeHidden: boolean;
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
		hasCodeSettings: {
			type: Boolean,
			notify: true
		},
		rootNode: {
			type: Boolean,
			notify: true
		},
		crmTypeHidden: {
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

		static properties = editCrmItemProperties;

		static itemIndex: number;

		static index: number;

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
		static currentColumn: CRMColumnElement;

		/**
		 * Whether the element's attached callback has been called before
		 */
		private static _hasBeenAttached: boolean = false;

		/**
		 * Whether the user is currently hovering over the type switcher
		 */
		private static _hoveringTypeSwitcher: boolean = false;

		/**
		 * Whether this item is being dragged by sortable (is a shdaow copy)
		 */
		private static _isDrag: boolean = false;

		static _openCodeSettings(this: EditCrmItem) {
			window.app.initCodeOptions(this.item as CRM.ScriptNode|CRM.StylesheetNode);
		}

		static getMenuExpandMessage(this: EditCrmItem) {
			if (!this.item.children) {
				return this.___(I18NKeys.options.editCrmItem.clickToShowChildren);
			}
			if ((this.item as CRM.MenuNode).children.length === 1) {
				return this.___(I18NKeys.options.editCrmItem.clickToShowChild);
			}
			return this.___(I18NKeys.options.editCrmItem.clickToShowXChildren,
				(this.item as CRM.MenuNode).children.length + '');
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

		static async updateName(this: EditCrmItem, name: string) {
			if (name === undefined) {
				name = window.app.settings.rootName = 
					await this.__async(I18NKeys.options.editCrmItem.rootName);;
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
				id: -1 as CRM.NodeId<CRM.DividerNode>,
				index: -1,
				path: [-1],
				onContentTypes: [true, true, true, true, true, true]
			});
		}

		static onMouseOver(this: EditCrmItem, e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();
			if (!this._hoveringTypeSwitcher && !this._isDrag) {
				this._hoveringTypeSwitcher = true;
				this.typeIndicatorMouseOver();
			}
		}

		private static _mouseMove(this: EditCrmItem, e: MouseEvent) {
			if (window.app.editCRM.dragging) {
				const event = new CustomEvent('dragover', {
					detail: {
						isCustom: true,
						target: window.app.util.getPath(e as any)[0],
						clientX: e.clientX,
						clientY: e.clientY
					}
				});
				//Dispatch it to this node's column
				this.parentNode.dispatchEvent(event);
			}
		}

		static attached(this: EditCrmItem, force: boolean = false) {
			if (this._hasBeenAttached && !force) {
				return;
			}
			this._hasBeenAttached = true;

			if (this.classList.contains('fallbackFiller')) {
				this.$.itemCont.classList.add('fallbackFiller');
				return;
			}
			if (this.classList.contains('draggingFiller') || this.getAttribute('draggable')) {
				//It's a dragging copy
				this.$.itemCont.classList.add('draggingFiller');
				this._isDrag = true;
			}

			if (!this._isDrag) {
				this.addEventListener('mousemove', this._mouseMove.bind(this));
			}

			if (!this._isDrag) {
				document.body.addEventListener('mousemove', () => {
					if (this._hoveringTypeSwitcher) {
						this._hoveringTypeSwitcher = false;
						this.typeIndicatorMouseLeave();
					}
				});
			}

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
						this.$.itemCont.classList.add('selecting');
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
				setItems: this.item.path
			});
		};

		private static _getCheckbox(this: EditCrmItem): HTMLPaperCheckboxElement {
			return this.shadowRoot.querySelector('#checkbox') as HTMLPaperCheckboxElement;
		}

		private static _selectThisNode(this: EditCrmItem) {
			let prevState = this._getCheckbox().checked;
			this._getCheckbox().checked = !prevState;
			if (window.app.editCRM.getItemsWithClass('highlighted').length === 0) {
				this.$.itemCont.classList.add('firstHighlighted');
			}
			prevState ? this._onDeselect() : this._onSelect();
		};

		static openEditPage(this: EditCrmItem) {
			if (!this.shadow && !window.app.item && !this.rootNode) {
				if (!this.$.itemCont.classList.contains('selecting')) {
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
				return this.___(I18NKeys.options.editCrmItem.clickToEditRoot);
			} else if (this.hasAttribute('crm-type-hidden')) {
				return this.___(I18NKeys.options.editCrmItem.nodeHidden);
			} else {
				return this.___(I18NKeys.options.editCrmItem.clickToEdit);
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
			const firstHighlightedNode = window.app.editCRM.getItemsWithClass('firstHighlighted')[0];
			const firstHighlightedItem = firstHighlightedNode.item;

			//Deselect everything else
			window.app.editCRM.getItemsWithClass('highlighted').forEach((item) => {
				item.$.itemCont.classList.remove('highlighted');
			});

			//Find out if the clicked on node is before, at, or after the first highlighted node
			const relation = this._getNodesOrder(firstHighlightedItem, this.item);
			if (relation === 'same') {
				this.$.itemCont.classList.add('highlighted');
				this._getCheckbox().checked = true;
				window.app.editCRM.selectedElements = [this.item.id];
			}
			else {
				firstHighlightedNode.$.itemCont.classList.add('highlighted');
				(firstHighlightedNode.shadowRoot.getElementById('checkbox') as HTMLPaperCheckboxElement).checked = true;
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
					this.$.itemCont.classList.add('highlighted');
					this._getCheckbox().checked = true;
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
			else if (this.$.itemCont.classList.contains('selecting') && e.detail.sourceEvent.shiftKey) {
				this._selectFromXToThis();
			} else {
				window.app.editCRM.cancelAdding();
				this.openEditPage();
			}
		};

		static calculateType(this: EditCrmItem) {
			this.type = this.item.type;
			this.isMenu = this.item.type === 'menu';

			this.hasCodeSettings = (this.item.type === 'script' || this.item.type === 'stylesheet') &&
				window.app.generateCodeOptionsArray(this.item.value.options).length > 0;
		};

		static typeIndicatorMouseOver(this: EditCrmItem) {
			if (!this.shadow) {
				const time = Date.now();
				this._lastTypeSwitchMouseover = time;
				this.async(() => {
					if (this._lastTypeSwitchMouseover === time) {
						this._lastTypeSwitchMouseover = null;
						$(this.$$('type-switcher').$$('.TSContainer')).stop().animate({
							marginLeft: 0
						}, 300);
					}
				}, 25);
			}
		};

		private static _animateOut(this: EditCrmItem) {
			if (this._typeIndicatorAnimation && this._typeIndicatorAnimation.reverse) {
				this._typeIndicatorAnimation.reverse();
			} else {
				$(this.$$('type-switcher').$$('.TSContainer')).stop().animate({
					marginLeft: '-293px'
				}, 300);
			}
		};

		static typeIndicatorMouseLeave(this: EditCrmItem) {
			this._lastTypeSwitchMouseover = null;
			if (!this.shadow) {
				const typeSwitcher = this.$$('#typeSwitcher');
				if (typeSwitcher.toggledOpen) {
					typeSwitcher.closeTypeSwitchContainer(true, () => {
						typeSwitcher.toggledOpen = false;
						typeSwitcher.$.typeSwitchChoicesContainer.style.display = 'none';
						window.setTransform(typeSwitcher.$.typeSwitchArrow, 'rotate(180deg)');
						this._animateOut();
					});
				} else {
					this._animateOut();
				}
			}
		};

		private static _getOnSelectFunction(this: EditCrmItem, index: number) {
			return () => {
				window.app.editCRM.getCRMElementFromPath((this.item.children as CRM.Node[])[index].path)._onSelect(true);
			};
		};

		private static _onSelect(this: EditCrmItem, selectCheckbox: boolean = false, dontSelectChildren: boolean = false) {
			this.$.itemCont.classList.add('highlighted');
			selectCheckbox && (this._getCheckbox().checked = true);
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
				window.app.editCRM.getCRMElementFromPath((this.item.children as CRM.Node[])[index].path)._onDeselect(true);
			};
		};

		private static _onDeselect(this: EditCrmItem, selectCheckbox: boolean = false, dontSelectChildren: boolean = false) {
			this.$.itemCont.classList.remove('highlighted');
			selectCheckbox && (this._getCheckbox().checked = false);
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
				if (this._getCheckbox().checked) {
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

export type EditCrmItem = Polymer.El<'edit-crm-item', 
	typeof EditCrmItemElement.ECI & typeof EditCrmItemElement.editCrmItemProperties>;