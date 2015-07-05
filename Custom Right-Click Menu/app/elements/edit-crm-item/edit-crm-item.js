/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/* global options */
function createWrapper(thisObject, method) {
	return function () {
		return method.call(thisObject);
	};
}

function toArray(toConvert) {
	var array = [];
	for (var i = 0; i < toConvert.length; i++) {
		array[i] = toConvert[i];
	}
	return array;
}

Polymer({
	is: 'edit-crm-item',

	/**
	  * The name of this item
	  *
	  * @attribute name
	  * @type string
	  * @default ''
	  */
	name: '',

	/**
	  * The type of this item
	  *
	  * @attribute type
	  * @type string
	  * @default ''
	  */
	type: '',

	/**
	  * Whether this item is a menu or not
	  *
	  * @attribute isMenu
	  * @type boolean
	  * @default false
	  */
	isMenu: false,

	/**
	 * Whether the item is a link
	 *
	 * @attribute isLink
	 * @type Boolean
	 * @default false
	 */
	isLink: false,

	/**
	 * Whether the item is a script
	 *
	 * @attribute isScript
	 * @type Boolean
	 * @default false
	 */
	isScript: false,

	/**
	 * Whether the item is a divider
	 *
	 * @attribute isDivider
	 * @type Boolean
	 * @default false
	 */
	isDivider: false,

	/**
	 * The index of the item's column
	 *
	 * @attribute column
	 * @type Number
	 * @default -1
	 */
	column: -1,

	//#region DraggingProperties
	/**
	  * Whether this item is currently being dragged
	  *
	  * @attribute dragging
	  * @type boolean
	  * @default false
	  */
	dragging: false,

	/**
	  * Whether this item is currently being dragged
	  *
	  * @attribute dragging
	  * @type boolean
	  * @default false
	  */
	cursorPosChanged: true,

	/**
     * The last recorded position of the mouse
     *
     * @attribute lastRecordedPos
     * @type Object
     * @default { X: 0, Y: 0 }
     */
	lastRecordedPos: {
		X: 0,
		Y: 0
	},

	/**
     * The position at which the user started to drag the curent item
     *
     * @attribute dragStart
     * @type Object
     * @default { X: 0, Y: 0 }
     */
	dragStart: {
		X: 0,
		Y: 0
	},

	/**
     * The position the mouse was relative to the corner when the drag started
     *
     * @attribute mouseToCorner
     * @type Object
     * @default { X: 0, Y: 0 }
     */
	mouseToCorner: {
		X: 0,
		Y: 0
	},

	/**
     * Whether the element is ready for a mouse-up event
     *
     * @attribute readyForMouseUp
     * @type Boolean
     * @default true
     */
	readyForMouseUp: true,

	/**
     * Whether the element should execute a mouse-up event when ready for it
     *
     * @attribute execMouseUp
     * @type Boolean
     * @default false
     */
	execMouseUp: false,

	/**
     * What the getBoundingClientRect().top was for the CRM-container on drag
     * start
     *
     * @attribute scrollStart
     * @type Object
     * @default { X: 0, Y: 0 }
     */
	scrollStart: {
		X: 0,
		Y: 0
	},

	/**
     * The function that gets called when the body is dragged
     *
     * @attribute bodyDragFunction
     * @type Function
     * @default function(){}
     */
	bodyDragFunction: function() {},

	/**
     * The function that gets called when the body is scrolled on
     *
     * @attribute bodyScrollFunction
     * @type Function
     * @default function(){}
     */
	bodyScrollFunction: function() {},

	/**
     * The function that gets called when the window is blurred (out of focus)
     *
     * @attribute blurFunction
     * @type Function
     * @default function(){}
     */
	blurFunction: function() {},

	/**
     * The function that gets called when the body is dragged on
     *
     * @attribute bodyDragWrapper
     * @type Function
     * @default function() {}
     */
	bodyDragWrapper: function() {},

	/**
     * The function that gets called when the user scroll sideways
     *
     * @attribute sideScrollFunction
     * @type Function
     * @default function() {}
     */
	sideScrollFunction: function() {},

	/**
     * The filler element
     *
     * @attribute filler
     * @type Element
     * @default undefined
     */
	filler: undefined,

	properties: {
		item: {
			type: Object,
			notify: true
		}
	},
	//#endregion

	//#region editPageProperties

	//#endregion

	//#region typeIndicatorProperties

	/**
     * The element to be animated
     *
     * @attribute animationEl
     * @type Element
     * @default null
     */
	animationEl: null,

	//#endregion

	//#region draggingFunctions
	changeDraggingState: function(newState) {
		this.dragging = newState;
		this.parentNode.parentNode.parentNode.dragging = newState;
		this.parentNode.parentNode.parentNode.draggingItem = this;
	},

	ready: function () {
		if (this.classList[0] !== 'wait') {
			this.itemIndex = this.index;
			this.item = this.item;
			this.name = this.item.name;
			this.calculateType();
			this.itemIndex = this.index;
			var elem = this;
			$(this.$.dragger)
				.off('mousedown')
				.on('mousedown', function (e) {
					if (e.which === 1) {
						elem.readyForMouseUp = false;
						elem.startDrag(e);
						elem.readyForMouseUp = true;
						if (elem.execMouseUp) {
							elem.stopDrag();
						}
					}
				})
				.off('mouseup')
				.on('mouseup', function (e) {
					if (e.which === 1) {
						e.stopPropagation();
						if (elem.readyForMouseUp) {
							elem.stopDrag();
						} else {
							elem.execMouseUp = true;
						}
					}
				});
			this.bodyDragWrapper = createWrapper(this, this.bodyDrag);
			//Used to preserve 'this', passing data via jquery doesnt' seem to work
			this.bodyDragFunction = function (e) {
				elem.bodyDrag(e);
			}
			this.bodyScrollFunction = function () {
				elem.bodyScroll();
			}
			this.blurFunction = function () {
				elem.stopDrag();
			}
			this.stopDragFunction = function () {
				if (elem.dragging) {
					elem.stopDrag();
				}
			}
			this.mouseMovementFunction = function (event) {
				elem.recordMouseMovemenent(event);
			}
			this.sideScrollFunction = function () {
				elem.sideDrag();
			}
			this.column = this.parentNode.index;
			this.$.typeSwitcher && this.$.typeSwitcher.ready && this.$.typeSwitcher.ready();
		}
	},

	recalculateIndex: function (itemsObj) {
		this.index = $(this.parentNode).children().toArray().indexOf(this);
		this.item = itemsObj[$(this.parentNode.parentNode.parentNode).children().toArray().indexOf(this.parentNode.parentNode)].list[this.index];
	},

	openMenu: function () {
		options.editCRM.build(this.item.path);
	},

	menuMouseOver: function () {
		if (this.parentNode.parentNode.parentNode.dragging && !this.parentNode.items[this.index].expanded) {
			//Get the difference between the current column's bottom and the new column's bot
			var draggingEl = this.parentNode.parentNode.parentNode.draggingItem;

			//Create new column
			var oldItemsObj = this.parentNode.parentNode.parentNode.parentNode.crm;
			var newItemsObj = options.editCRM.build(this.item.path);

			//Now fix the spacing from the top
			var columnIndex = $(this.parentNode.parentNode.parentNode).children().toArray().indexOf(draggingEl.parentNode.parentNode);

			var oldColumn = oldItemsObj[columnIndex];
			var newColumn = newItemsObj[columnIndex];

			var oldColumnHeight = (oldColumn.indent.length * 50) + (oldColumn.list.length * 50);
			var newColumnHeight = (newColumn.indent.length * 50) + (newColumn.list.length * 50);

			var diff = newColumnHeight - oldColumnHeight;
			draggingEl.dragStart.Y += diff;
		}
	},

	bodyScroll: function () {
		var newScroll = $('body').scrollTop();
		var difference = newScroll - this.scrollStart.Y;
		this.dragStart.Y -= difference;
		this.lastRecordedPos.Y -= difference;
		this.scrollStart.Y = newScroll;
		this.bodyDrag();
	},

	sideDrag: function() {
		var newScroll = $('.CRMEditColumnCont')[0].getBoundingClientRect().left;
		var difference = newScroll - this.scrollStart.X;
		this.dragStart.X -= difference;
		this.lastRecordedPos.X -= difference;
		this.scrollStart.X = newScroll;
		this.bodyDrag();
	},

	startDrag: function (event) {
		//Do calculations
		this.$$('paper-ripple').style.display = 'none';
		var extraSpacing = (($(this.parentNode).children('edit-crm-item').toArray().length - this.index) * 50);
		this.style.pointerEvents = 'none';
		this.dragStart.X = event.clientX;
		this.dragStart.Y = event.clientY + extraSpacing;
		this.lastRecordedPos.X = event.clientX;
		this.lastRecordedPos.Y = event.clientY;
		this.scrollStart.Y = $('body').scrollTop();
		this.scrollStart.X = $('.CRMEditColumnCont')[0].getBoundingClientRect().left;
		var boundingClientRect = this.getBoundingClientRect();
		this.mouseToCorner.X = event.clientX - boundingClientRect.left;
		this.mouseToCorner.Y = event.clientY - boundingClientRect.top;

		this.changeDraggingState(true);
		this.style.position = 'absolute';
		this.filler = $('<div class="crmItemFiller"></div>');
		this.filler.index = this.index;
		var elem = this;

		$('body')
			.on('mouseup', elem.stopDragFunction)
			.on('mousemove', elem.mouseMovementFunction)
			.css('-webkit-user-select', 'none');

		$(window)
			.on('scroll', elem.bodyScrollFunction)
			.on('blur', elem.blurFunction);

		$('#mainCont')
			.on('scroll', elem.sideScrollFunction);


		//Do visual stuff as to decrease delay between the visual stuff
		if (this.isMenu && this.parentNode.items[this.index].expanded) {
			//Collapse any columns to the right of this
			var columnContChildren = $(this.parentNode.parentNode.parentNode).children('.CRMEditColumnCont ').toArray();
			for (var i = this.column + 1; i < columnContChildren.length; i++) {
				columnContChildren[i].style.display = 'none';
			}
		}

		this.filler.insertBefore(this);
		this.$.itemCont.style.marginTop = extraSpacing + 'px';
		this.parentNode.appendChild(this);
		elem.bodyDrag();
	},

	stopDrag: function() {
		this.$$('paper-ripple').style.display = 'block';
		this.style.pointerEvents = 'all';
		this.changeDraggingState(false);
		var elem = this;
		$('body')
			.off('mouseup', elem.stopDragFunction)
			.off('mousemove', elem.bodyDragFunction)
			.css('-webkit-user-select', 'initial');

		$(window)
			.off('scroll', elem.bodyScrollFunction)
			.off('blur', elem.blurFunction);

		$('#mainCont')
			.on('scroll', elem.sideScrollFunction);

		this.snapItem();
		this.rebuildMenu();
	},

	recordMouseMovemenent: function(event) {
		this.lastRecordedPos.X = event.clientX;
		this.lastRecordedPos.Y = event.clientY;
		this.cursorPosChanged = true;
	},

	bodyDrag: function() {
		if (this.cursorPosChanged && this.dragging) {
			this.cursorPosChanged = false;
			this.$.itemCont.style.marginLeft = (this.lastRecordedPos.X - this.dragStart.X) + 'px';
			var spacingTop = this.lastRecordedPos.Y - this.dragStart.Y;
			this.$.itemCont.style.marginTop = spacingTop + 'px';
			var thisBoundingClientRect = this.getBoundingClientRect();
			var thisTop = (this.lastRecordedPos.Y - this.mouseToCorner.Y);
			var thisLeft = (this.lastRecordedPos.X - this.mouseToCorner.X) - thisBoundingClientRect.left;

			//Vertically space elements
			var parentChildrenList = $(this.parentNode).children('edit-crm-item');
			var prev = parentChildrenList[this.filler.index - 1];
			var next = parentChildrenList[this.filler.index];
			var fillerPrevTop;
			if (prev) {
				fillerPrevTop = prev.getBoundingClientRect().top;
			} else {
				fillerPrevTop = -999;
			}
			if (thisTop < fillerPrevTop + 25) {
				this.filler.index--;
				this.filler.insertBefore(prev);
			} else if (next) {
				var fillerNextTop = next.getBoundingClientRect().top;
				if (thisTop > fillerNextTop - 25) {
					if (parentChildrenList.toArray().length !== this.filler.index + 1) {
						this.filler.insertBefore(parentChildrenList[this.filler.index + 1]);
					} else {
						this.filler.insertBefore(parentChildrenList[this.filler.index]);
					}
					this.filler.index++;
				}
			}

			//Horizontally space elements
			var newColumn,
				newColumnChildren,
				newColumnLength,
				fillerIndex,
				currentChild,
				currentBoundingClientRect,
				newBot,
				oldBot,
				i;
			if (thisLeft > 150) {
				var nextColumnCont = $(this.parentNode.parentNode).next('.CRMEditColumnCont');
				if (nextColumnCont[0]) {
					if (nextColumnCont[0].style.display !== 'none') {
						this.dragStart.X += 200;
						newColumn = nextColumnCont.children('.CRMEditColumn')[0];
						newColumnChildren = newColumn.children;
						newColumnLength = newColumnChildren.length - 1;
						fillerIndex = 0;
						if (newColumnLength > 0) {
							if (this.lastRecordedPos.Y > newColumnChildren[newColumnLength].getBoundingClientRect().top - 25) {
								fillerIndex = newColumnLength;
							} else {
								for (i = 0; i < newColumnLength; i++) {
									currentChild = newColumn.children[i];
									currentBoundingClientRect = currentChild.getBoundingClientRect();
									if (this.lastRecordedPos.Y >= currentBoundingClientRect.top && this.lastRecordedPos.Y <= currentBoundingClientRect.top) {
										fillerIndex = i;
										break;
									}
								}
							}
							this.filler.index = fillerIndex;
							this.index = fillerIndex;
							newBot = newColumn.getBoundingClientRect().bottom;
							oldBot = this.parentNode.getBoundingClientRect().bottom - 50;
							this.dragStart.Y += (newBot - oldBot);
							if (this.column + 1 === nextColumnCont.index) {
								this.dragStart.Y -= 50;
							}

							this.filler.insertBefore(newColumnChildren[fillerIndex]);
							newColumn.appendChild(this);
						}
					}
				}
			}
			else if (thisLeft < -50) {
				var prevColumnCont = $(this.parentNode.parentNode).prev('.CRMEditColumnCont');
				if (prevColumnCont[0]) {
					this.dragStart.X -= 200;
					newColumn = prevColumnCont.children('.CRMEditColumn')[0];
					newColumnChildren = newColumn.children;
					newColumnLength = newColumnChildren.length - 1;
					fillerIndex = 0;
					if (this.lastRecordedPos.Y > newColumnChildren[newColumnLength - 1].getBoundingClientRect().top - 25) {
						fillerIndex = newColumnLength;
					} else {
						for (i = 0; i < newColumnLength; i++) {
							currentChild = newColumn.children[i];
							currentBoundingClientRect = currentChild.getBoundingClientRect();
							if (this.lastRecordedPos.Y >= currentBoundingClientRect.top && this.lastRecordedPos.Y <= currentBoundingClientRect.top) {
								fillerIndex = i;
								break;
							}
						}
					}
					this.filler.index = fillerIndex;
					this.index = fillerIndex;
					newBot = newColumn.getBoundingClientRect().bottom;
					oldBot = this.parentNode.getBoundingClientRect().bottom - 50;
					this.dragStart.Y += (newBot - oldBot);

					this.filler.insertBefore(newColumnChildren[fillerIndex]);
					newColumn.appendChild(this);
				}
			}
		}
		if (this.dragging) {
			window.requestAnimationFrame(this.bodyDragWrapper);
		}
	},

	snapItem: function() {
		//Get the filler's current index and place the current item there
		var parentChildrenList = $(this.parentNode).children('edit-crm-item');
		if (this.filler) {
			$(this).insertBefore(parentChildrenList[this.filler.index]);

			var elem = this;
			setTimeout(function() {
				elem.filler.remove();
				elem.$.itemCont.style.position = 'relative';
				elem.style.position = 'relative';
				elem.$.itemCont.style.marginTop = '0';
				$(elem.$.itemCont).css('margin-left', '0');
			}, 0);
		}
	},

	rebuildMenu: function() {
		//Get original object
		var newPath;
		var prev = $(this).prev();
		while (prev[0] && prev[0].tagName !== 'EDIT-CRM-ITEM') {
			prev = prev.prev();
		}
		prev = prev[0];
		var next = $(this).next();
		while (next[0] && next[0].tagName !== 'EDIT-CRM-ITEM') {
			next = next.next();
		}
		next = next[0];
		if (prev) {
			//A previous item exists, newpath is that path with + 1 on the last index
			newPath = prev.item.path;
			newPath[newPath.length - 1] += 1;
		}
		else if (next) {
			//The next item exists, newpath is that path
			newPath = next.item.path;
		}
		else {
			//No items exist yet, go to prev column and find the only expanded menu
			$(this.parentNode.parentNode.parentNode).prev().children('.CRMEditColumn').children('edit-crm-item').toArray().forEach(function(item) {
				if (item.item.expanded) {
					newPath = item.item.path;
					newPath.push(0);
				}
			});
		}
		if (this.item) {
			options.crm.move(this.item.path, newPath, (this.parentNode.index === this.column));
			var newPathMinusOne = newPath;
			newPathMinusOne.splice(newPathMinusOne.length - 1, 1);
			var newObj = options.editCRM.build(newPathMinusOne);
			$(this.parentNode.parentNode.parentNode).children().css('display', 'table');

			setTimeout(function() {
				//Make every node re-run "ready"
				$(options.editCRM).find('edit-crm-item').each(function() {
					this.recalculateIndex(newObj);
				});
			}, 0);
		}
	},
	//#endregion

	//#region editPageFunctions
	openEditPage: function (e) {
		if (!this.shadow) {
			var path = e.path;
			var item = path[0];
			for (var i = 0; i < path.length && item.tagName !== 'EDIT-CRM-ITEM'; i++) {
				item = path[i];
			}
			item = item.item;
			options.item = item;
			options.show = true;
			var element;
			var elWaiter = window.setInterval(function() {
				element = $('crm-edit-page');
				if (element[0]) {
					element[0].init();
					window.clearInterval(elWaiter);
				}
			}, 50);
		}
	},
	//#endregion

	//#region typeIndicatorFunctions

	calculateType: function () {
		this.type = this.item.type;
		this.isMenu = this.item.type === 'menu';
		this.isLink = this.item.type === 'link';
		this.isScript = this.item.type === 'script';
		this.isDivider = this.item.type === 'divider';
	},

	typeIndicatorMouseOver: function () {
		if (!this.shadow) {
			this.animationEl = this.animationEl || [this.$$('type-switcher').$$('.TSContainer')];
			$(this.animationEl).stop().animate({
				'marginLeft': 0
			}, {
				'easing': 'easeOutCubic',
				'duration': 300
			});
		}
	},

	animateOut(el) {
		$(el.animationEl).stop().animate({
			'marginLeft': -193
		}, {
			'easing': 'easeInCubic',
			'duration': 300
		});
	},

	typeIndicatorMouseLeave: function () {
		if (!this.shadow) {
			var el = this;
			var typeSwitcher = this.$.typeSwitcher;
			if (typeSwitcher.toggledOpen) {
				typeSwitcher.closeTypeSwitchContainer(true, function() {
					typeSwitcher.toggledOpen = false;
					typeSwitcher.$.typeSwitchChoicesContainer.style.display = 'none';
					typeSwitcher.$.typeSwitchArrow.style.transform = 'rotate(180deg)';
					el.animateOut(el);
				});
			}
			else {
				this.animateOut(this);
			}
		}
	}

	//#endregion

});