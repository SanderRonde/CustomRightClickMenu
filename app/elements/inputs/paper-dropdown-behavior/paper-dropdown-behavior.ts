/// <reference path="../../elements.d.ts" />

namespace PaperDropdownBehaviorNamespace {
	export const paperDropdownBehaviorProperties: {
		raised: boolean;
		overflowing: boolean;
		unselectable: boolean;
	} = {
		raised: {
			type: Boolean,
			value: false
		},
		overflowing: {
			type: Boolean,
			value: false
		},
		unselectable: {
			type: Boolean,
			value: false
		}
	} as any;

	type PaperDropdownListener = (prevState: number, newState: number) => void;

	export class PDB {
		static properties = paperDropdownBehaviorProperties;

		/**
		 * The start time for the current animation
		 */
		static _startTime: number = null;

		/**
		 * The paper dropdown menu element
		 */
		static _paperDropdownEl: PaperDropdownMenu = null;

		/**
		 * The paper menu element
		 */
		static _paperMenu: HTMLPaperMenuElement = null;

		/**
		 * The dropdown selected container
		 */
		static _dropdownSelectedCont: HTMLElement = null;

		/**
		 * The listeners for this element
		 */
		static _listeners: Array<{
			listener: PaperDropdownListener;
			id: string;
			thisArg: any;
		}>;

		/**
		 * Whether the menu is expanded
		 */
		static _expanded: boolean = false;

		/**
		 * Whether the menu should have an indent from the left part of the screen
		 */
		static indent: boolean = true;

		/**
		 * Whether the menu is disabled
		 */
		static disabled: boolean = false;

		/**
		 * A function that is called whenever the dialog opens
		 */
		static onopen: () => void;

		/**
		 * The listeners on clicking the items
		 */
		static _elementListeners: Array<() => void> = [];

		/**
		 * Adds a listener that fires when a new value is selected
		 */
		static _addListener(this: PaperDropdownInstance, listener: PaperDropdownListener,
				id: string, thisArg: any) {
			let found = false;
			for (let i = 0; i < this._listeners.length; i++) {
				if (this._listeners[i].listener === listener && this._listeners[i].id === id) {
					found = true;
				}
			}
			if (!found) {
				this._listeners.push({
					id: id,
					listener: listener,
					thisArg: thisArg
				});
			}
		};

		static onValueChange(this: PaperDropdownInstance, oldState: number|Array<number>, newState: number|Array<number>) { }

		/**
		 * Fires all added listeners, triggers when a new value is selected
		 */
		static _fireListeners(this: PaperDropdownInstance, oldState: number|Array<number>) {
			const newState = this.selected;
			this._listeners.forEach((listener) => {
				if (listener.id === this.id) {
					listener.listener.apply(listener.thisArg, [oldState, newState]);
				}
			});
			this.onValueChange(oldState, newState);
		};

		static _getMenuContent(this: PaperDropdownInstance) {
			return this.getMenu().$.content.assignedNodes()[0] as HTMLElement;
		}

		static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
			selector?: string, slotSelector?: string): Array<HTMLElement|Polymer.PolymerElement> | null
		static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
			selector?: K, slotSelector?: string): Array<Polymer.ElementTagNameMap[K]> | null
		static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
			selector?: string, slotSelector?: string): Array<HTMLElement> | null
		static querySlot<K extends keyof Polymer.ElementTagNameMap>(parent: HTMLElement|Polymer.RootElement, 
			selector: K|string = null, slotSelector: string = 'slot'): Array<Polymer.ElementTagNameMap[K]|HTMLElement> | null {
				const selectFn = '$$' in parent ? (parent as any).$$ : parent.querySelector;
				const slotChildren = (selectFn.bind(parent)(slotSelector) as HTMLSlotElement).assignedNodes().filter((node) => {
					return node.nodeType !== node.TEXT_NODE;
				}) as Array<HTMLElement>;
				if (!selector) {
					return slotChildren;
				}
				const result = (slotChildren.map((node: HTMLElement) => {
					return node.querySelectorAll(selector)
				}).reduce((prev, current) => {
					let arr: Array<HTMLElement|Polymer.ElementTagNameMap[K]> = [];
					if (prev) {
						arr = arr.concat(Array.prototype.slice.apply(prev));
					}
					if (current) {
						arr = arr.concat(Array.prototype.slice.apply(current));
					}
					return arr as any;
				}) as any) as Array<Polymer.ElementTagNameMap[K]|HTMLElement>;
				if (!Array.isArray(result)) {
					return Array.prototype.slice.apply(result);
				}
				return result;
			}

		static doHighlight(this: PaperDropdownInstance) {
			const content = this._getMenuContent();
			const paperItems = Array.prototype.slice.apply(content.querySelectorAll('paper-item'));
			paperItems.forEach((paperItem: HTMLPaperItemElement, index: number) => {
				const checkMark = this.querySlot(paperItem)[0] as HTMLElement;
				if (!checkMark) {
					return;
				}
				const selectedArr = Array.isArray(this.selected) ? 
					this.selected : [this.selected];
				if (selectedArr.indexOf(index) > -1) {
					checkMark.style.opacity = '1';
				} else {
					checkMark.style.opacity = '0';
				}
			});
		}

		static refreshListeners(this: PaperDropdownInstance) {
			const content = this._getMenuContent();
			const paperItems = Array.prototype.slice.apply(content.querySelectorAll('paper-item'));
			const oldListeners = this._elementListeners;
			this._elementListeners = [];
			paperItems.forEach((paperItem: HTMLPaperItemElement, index: number) => {
				oldListeners.forEach((listener) => {
					paperItem.removeEventListener('click', listener);
				});
				const fn = () => {
					const oldSelected = this.selected;

					if (!this.unselectable) {
						this.set('selected', index);
					}
					setTimeout(() => {
						if (!this.unselectable) {
							this.doHighlight();
						}
						this._fireListeners(oldSelected);
						if ((this as any)._dropdownSelectChange) {
							(this as any)._dropdownSelectChange(this);
						}
						this.close();
					}, 50);
				}
				this._elementListeners.push(fn);
				paperItem.addEventListener('click', fn);
			});
		};

		static getMenu(this: PaperDropdownInstance) {
			if (this._paperMenu) {
				return this._paperMenu;
			}
			return (this._paperMenu = this._getMenu());
		}

		static attached(this: PaperDropdownMenu) {
			const __this = this;
			this._paperDropdownEl = this;
			this._dropdownSelectedCont = this.$.dropdownSelectedCont;
			if (this.getAttribute('indent') === 'false') {
				this.indent = false;
			}
			if (this.raised) {
				window.requestAnimationFrame(function(time) {
					__this._animateBoxShadowIn(time, __this);
				});
			}
			this._expanded = true;

			const interval = window.setInterval(() => {
				if (this.getMenu() && this._getMenuContent()) {
					const content = this._getMenuContent();
					if (this.overflowing) {
						content.style.position = 'absolute';
					}
					content.style.backgroundColor = 'white';
					
					window.clearInterval(interval);
					this.close();
					this.refreshListeners();

					const innerInterval = window.setInterval(() => {
						if (this._getMenuContent().querySelectorAll('paper-item')[0] && 
							this.querySlot(this._getMenuContent().querySelectorAll('paper-item')[0]).length > 0) {
								this.doHighlight();
								window.clearInterval(innerInterval);
							}
					}, 250);
				}
			}, 250);
		};

		/**
		 * Animates the box-shadow in on clicking the main blue text
		 */
		static _animateBoxShadowIn(timestamp: number, __this: PaperDropdownInstance) {
			if (!__this._startTime) {
				__this._startTime = timestamp;
			}
			if (timestamp - 100 < __this._startTime) {
				const scale = ((timestamp - __this._startTime) / 100);
				let doubleScale = scale * 2;
				__this._getMenuContent().style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
					' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
					' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
				if (!__this.indent) {
					__this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
				}
				window.requestAnimationFrame(function(time) {
					__this._animateBoxShadowIn(time, __this);
				});
			}
			else {
				if (!__this.indent) {
					__this._dropdownSelectedCont.style.marginLeft = '15px';
				}
				__this._startTime = null;
				__this._getMenuContent().style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
			}
		};

		/**
		 * Animates the box-shadow out on clicking the main blue text again
		 */
		static _animateBoxShadowOut(timestamp: number, __this: PaperDropdownInstance) {
			if (!__this._startTime) {
				__this._startTime = timestamp;
			}
			if (timestamp - 100 < __this._startTime) {
				const scale = 1 - (((timestamp - __this._startTime) / 100));
				let doubleScale = scale * 2;
				__this.getMenu().style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
					' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
					' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
				if (!__this.indent) {
					__this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
				}
				window.requestAnimationFrame(function (time) {
					__this._animateBoxShadowOut(time, __this);
				});
			}
			else {
				if (!__this.indent) {
					__this._dropdownSelectedCont.style.marginLeft = '0';
				}
				__this._startTime = null;
				__this.getMenu().style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
				if (__this._paperDropdownEl.$.dropdownArrow) {
					window.setTransform(__this._paperDropdownEl.$.dropdownArrow, 'rotate(90deg)');
				}
			}
		};

		/**
		 * Open the dropdown menu
		*/
		static open(this: PaperDropdownInstance) {
			if (this.onopen) {
				this.onopen();
			}

			this.fire('expansionStateChange', {
				state: 'opening'
			});

			if (!this._expanded) {
				this._expanded = true;
				if (!this.raised) {
					window.requestAnimationFrame((time) => {
						this._animateBoxShadowIn(time, this);
					});
				}
				setTimeout(() => {
					const content = this._getMenuContent();
					content.style.display = 'block';
					const animation: {
						[key: string]: any
					} = {
						height: content.scrollHeight
					};
					if (this.overflowing) {
						animation['marginBottom'] = -(content.scrollHeight + 14);
					}
					$(content).stop().animate(animation, {
						easing: 'easeOutCubic',
						duration: 300,
						complete: () => {
							if (this.$.dropdownArrow) {
								window.setTransform(this.$.dropdownArrow, 'rotate(270deg)');
							}
							this.fire('expansionStateChange', {
								state: 'opened'
							});
						}
					});
				}, 100);
			}
		};

		/**
		 * Close the dropdown menu
		 */
		static close(this: PaperDropdownInstance) {
			return new Promise<void>((resolve) => {
				if (this._expanded) {
					this._expanded = false;
					const animation: {
						[key: string]: any;
					} = {
						height: 0
					};
					if (this.overflowing) {
						animation['marginBottom'] = -15;
					}

					this.fire('expansionStateChange', {
						state: 'closing'
					});

					$(this._getMenuContent()).stop().animate(animation, {
						easing: 'swing',
						duration: 300,
						complete: () => {
							this._getMenuContent().style.display = 'none';
							if (!this.raised) {
								window.requestAnimationFrame((time) => {
									this._animateBoxShadowOut(time, this);
								});
								this.fire('expansionStateChange', {
									state: 'closed'
								});
								resolve(null);
							}
						}
					});
				} else {
					resolve(null);
				}
			});
		};

		/**
		 * Toggles the dropdown menu, tirggers on clicking the main blue text
		 */
		static _toggleDropdown(this: PaperDropdownInstance) {
			if (!this.disabled) {
				(this._expanded ? this.close() : this.open());
			}
		};

		/**
		 * Gets the currently selected item(s)
		 * @returns {Array} The currently selected item(s) in array form
		 */
		static getSelected(this: PaperDropdownInstance): Array<number> {
			if (this.shadowRoot.querySelectorAll('.iron-selected.addLibrary')) {
				(this.selected as Array<number>).pop();
			}
			if (typeof this.selected === 'number') {
				return [this.selected];
			}
			return this.selected;
		};

		static disable(this: PaperDropdownInstance) {
			this.disabled = true;
			this._expanded && this.close && this.close();
			this.$.dropdownSelected.style.color = 'rgb(176, 220, 255)';
		};

		static enable(this: PaperDropdownInstance) {
			this.disabled = false;
			this.$.dropdownSelected.style.color = 'rgb(38, 153, 244)';
		}

		static ready(this: PaperDropdownInstance) {
			this._listeners = [];
		}
	}

	Polymer.PaperDropdownBehavior = PDB as PaperDropdownBehaviorBase;
}

type PaperDropdownBehaviorBase = Polymer.El<'paper-dropdown-behavior',
	typeof PaperDropdownBehaviorNamespace.PDB & typeof PaperDropdownBehaviorNamespace.paperDropdownBehaviorProperties
>;
type PaperDropdownBehavior<T> = T & PaperDropdownBehaviorBase;
	type PaperDropdownInstance = PaperDropdownBehavior<
	PaperLibrariesSelectorBase|PaperDropdownMenuBase
>;

PaperDropdownBehaviorNamespace