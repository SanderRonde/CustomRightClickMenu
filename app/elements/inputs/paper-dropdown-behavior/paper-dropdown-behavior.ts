/// <reference path="../../elements.d.ts" />

const paperDropdownBehaviorProperties: {
	raised: boolean;
	overflowing: boolean;
} = {
	raised: {
		type: Boolean,
		value: false
	},
	overflowing: {
		type: Boolean,
		value: false
	}
} as any;

type PaperDropdownListener = (prevState: number, newState: number) => void;

class PDB {
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
	}> = [];

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
		if (this.onchange) {
			(this.onchange as any)(oldState, newState);
		}
	};

	static _getMenuContent(this: PaperDropdownInstance) {
		return this.getMenu().$.content.assignedNodes()[0] as HTMLElement;
	}

	static doHighlight(this: PaperDropdownInstance) {
		const content = this._getMenuContent();
		const paperItems = Array.prototype.slice.apply(content.querySelectorAll('paper-item'));
		paperItems.forEach((paperItem: HTMLPaperItemElement, index: number) => {
			const checkMark = paperItem.$$('slot').assignedNodes().filter((node) => {
				return node.nodeType !== node.TEXT_NODE;
			})[0] as HTMLElement;
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
				this.set('selected', index);
				setTimeout(() => {
					this.doHighlight();
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
						this._getMenuContent().querySelectorAll('paper-item')[0].$$('slot').assignedNodes().filter((node) => {
							return node.nodeType !== node.TEXT_NODE
						}).length > 0) {
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
	static _animateBoxShadowIn(timestamp: number, _this: PaperDropdownInstance) {
		if (!_this._startTime) {
			_this._startTime = timestamp;
		}
		if (timestamp - 100 < _this._startTime) {
			const scale = ((timestamp - _this._startTime) / 100);
			let doubleScale = scale * 2;
			_this._getMenuContent().style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
			}
			window.requestAnimationFrame(function(time) {
				_this._animateBoxShadowIn(time, _this);
			});
		}
		else {
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = '15px';
			}
			_this._startTime = null;
			_this._getMenuContent().style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
		}
	};

	/**
	 * Animates the box-shadow out on clicking the main blue text again
	 */
	static _animateBoxShadowOut(timestamp: number, _this: PaperDropdownInstance) {
		if (!_this._startTime) {
			_this._startTime = timestamp;
		}
		if (timestamp - 100 < _this._startTime) {
			const scale = 1 - (((timestamp - _this._startTime) / 100));
			let doubleScale = scale * 2;
			_this.getMenu().style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = (scale * 15) + 'px';
			}
			window.requestAnimationFrame(function (time) {
				_this._animateBoxShadowOut(time, _this);
			});
		}
		else {
			if (!_this.indent) {
				_this._dropdownSelectedCont.style.marginLeft = '0';
			}
			_this._startTime = null;
			_this.getMenu().style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
			_this._paperDropdownEl.$.dropdownArrow.style.transform = 'rotate(90deg)';
		}
	};

	/**
	 * Open the dropdown menu
	*/
	static open(this: PaperDropdownInstance) {
		if (this.onopen) {
			this.onopen();
		}

		const _this = this;
		if (!this._expanded) {
			this._expanded = true;
			if (!this.raised) {
				window.requestAnimationFrame(function(time) {
					_this._animateBoxShadowIn(time, _this);
				});
			}
			setTimeout(function() {
				const content = _this._getMenuContent();
				content.style.display = 'block';
				const animation: {
					[key: string]: any
				} = {
					height: content.scrollHeight
				};
				if (_this.overflowing) {
					animation['marginBottom'] = -(content.scrollHeight + 14);
				}
				$(content).stop().animate(animation, {
					easing: 'easeOutCubic',
					duration: 300,
					complete() {
						_this.$.dropdownArrow.style.transform = 'rotate(270deg)';
					}
				});
			}, 100);
		}
	};

	/**
	 * Close the dropdown menu
	 */
	static close(this: PaperDropdownInstance) {
		const _this = this;
		if (this._expanded) {
			this._expanded = false;
			const animation: {
				[key: string]: any;
			} = {
				height: 0
			};
			if (this.overflowing !== undefined) {
				animation['marginBottom'] = -15;
			}
			$(this._getMenuContent()).stop().animate(animation, {
				easing: 'easeInCubic',
				duration: 300,
				complete(this: HTMLElement) {
					this.style.display = 'none';
					if (!_this.raised) {
						window.requestAnimationFrame(function(time) {
							_this._animateBoxShadowOut(time, _this);
						});
					}
				}
			});
		}
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
		if (this.$$('.iron-selected.addLibrary')) {
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
}

type PaperDropdownBehaviorBase = Polymer.El<'paper-dropdown-behavior',
	typeof PDB & typeof paperDropdownBehaviorProperties
>;
type PaperDropdownBehavior<T> = T & PaperDropdownBehaviorBase;
type PaperDropdownInstance = PaperDropdownBehavior<
	PaperLibrariesSelectorBase|PaperDropdownMenuBase|
	PaperGetPagePropertiesBase
>;

const x: PaperDropdownBehavior<PaperGetPagePropertiesBase> = '' as any;
x.selected

Polymer.PaperDropdownBehavior = PDB as PaperDropdownBehaviorBase;