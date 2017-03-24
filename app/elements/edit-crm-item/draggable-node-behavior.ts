///// <reference path="../elements.d.ts" />

interface Coordinate {
	X: number,
	Y: number
}

interface FillerDragStateBase {
	type: string;
}

interface FillerBetweenState extends FillerDragStateBase {
	type: 'between';
	indexBefore: number;
	indexAfter: number;
	column: number;
}

interface FillerOnState extends FillerDragStateBase {
	type: 'on';
	index: number;
	column: number;
	indexBefore: number;
	indexAfter: number;
}

type FillerDragState = FillerBetweenState|FillerOnState;

interface FillerElement extends HTMLElement {
	state: FillerDragState;
	isFiller: true;
	getIndex(): number;
}

type DraggableNodeBehavior = PolymerElement<'behavior', typeof DNB>;
type DraggableNodeBehaviorInstance = DraggableNodeBehavior & EditCrmItem;

const NODE_HEIGHT = 50;
const NODE_WIDTH = 150;
const ON_NODE_TARGET_PERCENTAGE = 0.6;

const ON_NODE_TARGET_SIZE = NODE_HEIGHT * ON_NODE_TARGET_PERCENTAGE;

class DNB {
	/**
	  * Whether this item is currently being dragged
	  */
	static dragging: boolean = false;

	/**
	  * Whether this item is currently being dragged
	  */
	static _cursorPosChanged: boolean = true;

	/**
     * The last recorded position of the mouse
     */
	static _lastRecordedPos: Coordinate = {
		X: 0,
		Y: 0
	};

	/**
     * The position at which the user started to drag the curent item
     */
	static _dragStart: Coordinate = {
		X: 0,
		Y: 0
	};

	/**
     * The position the mouse was relative to the corner when the drag started
     */
	static _mouseToCorner: Coordinate = {
		X: 0,
		Y: 0
	};

	/**
     * Whether the element is ready for a mouse-up event
     */
	static _readyForMouseUp: boolean = true;

	/**
     * Whether the element should execute a mouse-up event when ready for it
     */
	static _execMouseUp: boolean = false;

	/**
     * What the getBoundingClientRect().top was for the CRM-container on drag
     * start
     */
	static _scrollStart: Coordinate = {
		X: 0,
		Y: 0
	}

	/**
     * The filler element
     */
	static _filler: FillerElement;

	/**
	 * The current column element
	 */
	static _currentColumn: CRMColumn;

	static _listeners: {
		stopDrag: EventListenerObject;
		onMouseMove: EventListenerObject;
		onScroll: EventListenerObject;
	};

	static _changeDraggingState(this: DraggableNodeBehaviorInstance, isDragging: boolean) {
		this.dragging = isDragging;
		this.classList[isDragging ? 'add' : 'remove']('dragging');
		this.$.itemCont.style.willChange = (isDragging ? 'transform' : 'initial');
		this.$.itemCont.style.zIndex = (isDragging ? '50000' : '0');
		document.body.style.webkitUserSelect = isDragging ? 'none' : 'initial';
	}

	static _onScroll(this: DraggableNodeBehaviorInstance) {
		const newScrollY = document.body.scrollTop;
		const diffY = newScrollY - this._scrollStart.Y;
		this._dragStart.Y -= diffY;
		this._lastRecordedPos.Y -= diffY;
		this._scrollStart.Y = newScrollY;
		
		const newScrollX = document.querySelector('.CRMEditColumnCont').getBoundingClientRect().left;
		const diffX = newScrollX - this._scrollStart.X;
		this._dragStart.X -= diffX;
		this._lastRecordedPos.X -= diffX;
		this._scrollStart.X = newScrollX;
	}

	static _sideDrag(this: DraggableNodeBehaviorInstance) {
		var newScroll = $('.CRMEditColumnCont')[0].getBoundingClientRect().left;
		var difference = newScroll - this._scrollStart.X;
		this._dragStart.X -= difference;
		this._lastRecordedPos.X -= difference;
		this._scrollStart.X = newScroll;
		this._onDrag();
	}

	static _stopDrag(this: DraggableNodeBehaviorInstance) {
		// this.$$('paper-ripple').style.display = 'block';
		// this.style.pointerEvents = 'all';
		// this._changeDraggingState(false);
		// document.body.removeEventListener('mouseup', this._listeners.stopDrag);
		// document.body.style.webkitUserSelect = 'initial';
		// window.removeEventListener('scroll', this._listeners.onScroll);

		// //Doesn't propertly unbind
		// window.removeEventListener('blur', this._listeners.stopDrag);
		// document.querySelector('#mainCont').removeEventListener('scroll', this._listeners.onScroll);
		// this._snapItem();
		// this._rebuildMenu();

		this._changeDraggingState(false);
	}

	static _onMouseMove(this: DraggableNodeBehaviorInstance, event: MouseEvent) {
		this._lastRecordedPos.X = event.clientX;
		this._lastRecordedPos.Y = event.clientY;
		this._cursorPosChanged = true;
	}

	static _updateDraggedNodePosition(this: DraggableNodeBehaviorInstance, offset: {
		X: number;
		Y: number;
	}) {
		const { X, Y } = offset;
		this.$.itemCont.style.transform = `translate(${X}px, ${Y}px)`;
	}

	static _isBetween(target: number, minimum: number, maximum: number): boolean {
		return target >= minimum && target <= maximum;
	}

	static _getNodeDragState(this: DraggableNodeBehaviorInstance, offset: {
		X: number;
		Y: number;
	}): FillerDragState {
		let { X, Y } = offset;

		const halfNodeHeight = NODE_HEIGHT / 2;

		Y = Y - this._mouseToCorner.Y;
		X = X - this._mouseToCorner.X;
		console.log('-----');

		const halfNodeTargetSize = ON_NODE_TARGET_SIZE / 2;
		console.log(Y);
		//This gets rid of anything that happens when it's negative
		const relativePosition = ((Y % NODE_HEIGHT) + NODE_HEIGHT) % NODE_HEIGHT;
		if (this._isBetween(relativePosition, halfNodeHeight - halfNodeTargetSize, halfNodeHeight + halfNodeTargetSize)) {
			//On a node
			const indexY = Math.floor(Y / NODE_HEIGHT);
			const roundedY = Math.round(Y / NODE_HEIGHT);
			return {
				type: 'on',
				index: indexY,
				indexBefore: roundedY - 1,
				indexAfter: roundedY,
				column: Math.floor(X / NODE_WIDTH)
			}
		} else {
			//Between nodes
			const indexY = Math.round(Y / NODE_HEIGHT);
			//Between this and its successor
			return {
				type: 'between',
				column: Math.floor(X / NODE_WIDTH),
				indexBefore: indexY - 1,
				indexAfter: indexY
			}
		}
	}

	static _findNodeAtRelativePosition(this: DraggableNodeBehaviorInstance, position: {
		index: number;
		column: number;
	}): EditCrmItem|'filler' {
		let absoluteIndex = this.index + position.index;
		let absoluteColumn = this.column() + position.column;

		//Find out if that column even exists
		const columns = window.app.editCRM.getColumns();
		if (!columns[absoluteColumn]) {
			//Keep moving towards zero until a column is found
			if (absoluteColumn < 0) {
				absoluteColumn = 0;
			}
			while (!columns[absoluteColumn]) {
				absoluteColumn -= 1;
			}
		}

		const column = columns[absoluteColumn];

		//Find out if there exists a node at that index
		const nodes = window.app.editCRM.getEditCrmNodes(column);

		absoluteIndex -= window.app.editCRM.crm[absoluteColumn].indent.length;
		if (!nodes[absoluteIndex]) {
			if (absoluteIndex < 0) {
				absoluteIndex = 0;
			}
			while (!nodes[absoluteIndex]) {
				absoluteIndex -= 1;
			}
		}

		if (nodes[absoluteIndex].isFiller) {
			return 'filler';
		}
		const editCrmNodes = window.app.editCRM.getEditCrmItems(column);
		return editCrmNodes[absoluteIndex] || editCrmNodes[absoluteIndex - 1];
	}
	
	static _moveFiller(this: DraggableNodeBehaviorInstance, position: FillerDragState) {
		if (position.type === 'on') {
			//Find out what type of node the node being pointed at is
			const pointedAtNode = this._findNodeAtRelativePosition(position);
			if (pointedAtNode !== 'filler' && pointedAtNode.item.type === 'menu') {
				//Hovering over a menu node, expose its children
				
				//Check if it's already expanded
				if (!pointedAtNode.expanded) {
					pointedAtNode.classList.add('pulse');
					pointedAtNode.openMenu();
					Array.prototype.slice.apply(document.querySelectorAll('.menuArrow')).forEach((menuArrow: HTMLElement) => {
						menuArrow.removeAttribute('expanded');
					});
					pointedAtNode.querySelector('.menuArrow').setAttribute('expanded', 'expanded');
					this.async(() => {
						pointedAtNode.classList.remove('pulse');
					}, 1000);
					this._filler.state = position;
					return;
				}
			}
		}

		//Not on a node, it's between some nodes
		const beforeNode = this._findNodeAtRelativePosition({
			column: position.column,
			index: position.indexBefore
		});

		const afterNode = this._findNodeAtRelativePosition({
			column: position.column,
			index: position.indexAfter
		});

		if (beforeNode !== 'filler' && afterNode !== 'filler') {
			const column = window.app.editCRM.getColumn(window.app.editCRM.getNodeColumnIndex(beforeNode));
			if (beforeNode === afterNode) {
				//It's at one of the edges, determine which one and insert the filler at the edge
				if (beforeNode.index === 0) {
					column.insertBefore(this._filler, column.children[0]);
				} else {
					column.appendChild(this._filler);
				}
			} else {
				column.insertBefore(this._filler, afterNode);	
			}
		}
		this._filler.state = position;
	}

	static _onDrag(this: DraggableNodeBehaviorInstance) {
		if (!this.dragging) {
			return;
		}

		if (this._cursorPosChanged) {
			console.log(this._lastRecordedPos.X - this._dragStart.X, 
				this._lastRecordedPos.Y - this._dragStart.Y);

			const offset = {
				X: this._lastRecordedPos.X - this._dragStart.X,
				Y: this._lastRecordedPos.Y - this._dragStart.Y
			}
			this._updateDraggedNodePosition(offset);
			const pos = this._getNodeDragState(offset);
			console.log(pos);
			this._moveFiller(pos);
		}

		window.requestAnimationFrame(this._onDrag.bind(this));
	}

	static _snapItem(this: DraggableNodeBehaviorInstance) {
		// //Get the filler's current index and place the current item there
		// var parentChildrenList = window.app.editCRM.getEditCrmItems(window.app.editCRM
		// 	.getCurrentColumn(this), true);
		// if (this._filler) {
		// 	$(this).insertBefore(parentChildrenList[this._filler.index]);

		// 	this.$.itemCont.style.position = 'relative';
		// 	this.style.position = 'relative';
		// 	this.$.itemCont.style.transform = 'initial';
		// 	this.$.itemCont.style.marginTop = '0';
		// 	this._filler.remove();
		// }
	}

	static _rebuildMenu(this: DraggableNodeBehaviorInstance) {
		//Get original object
		var newPath;
		var $prev = $(this).prev();
		while ($prev[0] && $prev[0].tagName !== 'EDIT-CRM-ITEM') {
			$prev = $prev.prev();
		}
		var prev = $prev[0];
		var $next = $(this).next();
		while ($next[0] && $next[0].tagName !== 'EDIT-CRM-ITEM') {
			$next = $next.next();
		}
		var next = $next[0];
		if (prev) {
			//A previous item exists, newpath is that path with + 1 on the last index
			newPath = (prev as EditCrmItem).item.path;
			newPath[newPath.length - 1] += 1;
		}
		else if (next) {
			//The next item exists, newpath is that path
			newPath = (prev as EditCrmItem).item.path;
		}
		else {
			//No items exist yet, go to prev column and find the only expanded menu
			window.app.editCRM.getEditCrmNodes(window.app.editCRM
				.getPrevColumn(this as EditCrmItem)).forEach(function(item: EditCrmItem) {
				if ((item.item as MenuNode & {
						expanded: boolean;
					}).expanded) {
					newPath = item.item.path;
					newPath.push(0);
				}
			});
		}
		if (this.item) {
			var itemPathCopy = Array.prototype.slice.apply(this.item.path);
			itemPathCopy.splice(itemPathCopy.length - 1, 1);
			var newPathCopy = Array.prototype.slice.apply(newPath);
			newPathCopy.splice(newPathCopy.length - 1, 1);

			window.app.crm.move(this.item.path, newPath, window.app.compareArray(itemPathCopy, newPathCopy));
			var newPathMinusOne = newPath;
			newPathMinusOne.splice(newPathMinusOne.length - 1, 1);
			window.app.editCRM.build(newPathMinusOne);
			Array.prototype.slice.apply(window.app.editCRM.getCurrentColumn(this).children)
				.forEach(function(element: HTMLElement) {
					element.style.display = 'table';
				});
		}
	}

	static _setDragStartPositions(this: DraggableNodeBehaviorInstance, event: MouseEvent) {
		this._dragStart.X = event.clientX;
		this._dragStart.Y = event.clientY;
		this._scrollStart.Y = document.body.scrollTop;
		this._scrollStart.X = document.querySelector('.CRMEditColumnCont').getBoundingClientRect().left;

		const bcr = this.getBoundingClientRect();
		this._mouseToCorner.X = event.clientX - bcr.left;
		this._mouseToCorner.Y = event.clientY - bcr.top;
	}

	static _updateCursorPosition(this: DraggableNodeBehaviorInstance, event: MouseEvent) {
		this._lastRecordedPos.X = event.clientX;
		this._lastRecordedPos.Y = event.clientX;
	}

	static _startDrag(this: DraggableNodeBehaviorInstance, event: MouseEvent) {
		this._changeDraggingState(true);

		this.$$('paper-ripple').style.display = 'none';

		this._setDragStartPositions(event);
		this._updateCursorPosition(event);

		this.style.position = 'absolute';
		this._filler = $('<div class="crmItemFiller"></div>').get(0) as FillerElement;
		this._filler.state = {
			type: 'between',
			indexBefore: this.index - 1,
			indexAfter: this.index,
			column: (this.parentElement as CRMBuilderColumn).index
		}
		this._filler.isFiller = true;
		this._filler.getIndex = () => {
			if (this.previousSibling) {
				return (this.previousSibling as EditCrmItem).index + 1;
			} else if (this.nextSibling) {
				return (this.nextSibling as EditCrmItem).index - 1;
			}
			//If it has no siblings, it's the only node and as such the first
			return 0;
		}

		document.body.addEventListener('mouseup', () => {
			this._stopDrag();
		});
		document.body.addEventListener('mousemove', (e) => {
			if (this.dragging) {
				this._onMouseMove(e);
			}
		});
		window.addEventListener('scroll', () => {
			this._onScroll();
		});
		window.addEventListener('blur', () => {
			console.log('stop drag');
		});
		document.querySelector('#mainCont').addEventListener('scroll', () => {
			this._onScroll();
		});


		//Do visual stuff as to decrease delay between the visual stuff
		if (this.isMenu && (this.parentElement as HTMLDomRepeatElement).items[this.index].expanded) {
			//Collapse any columns to the right of this
			var columnContChildren = window.app.editCRM.getColumns();
			for (var i = this.column() + 1; i < columnContChildren.length; i++) {
				columnContChildren[i].style.display = 'none';
			}
		}

		$(this._filler).insertBefore(this);
		this.$.itemCont.style.marginTop = `${this.index * 50}px`;

		window.app.editCRM.insertBefore(this, window.app.editCRM.children[0]);
		this.async(this._onDrag, 0);
	}

	static init(this: DraggableNodeBehaviorInstance) {
		this.$.dragger.addEventListener('mousedown', (e: MouseEvent) => {
			if (e.which === 1) {
				this._readyForMouseUp = false;
				this._startDrag(e);
				this._readyForMouseUp = true;
				if (this._execMouseUp) {
					this._stopDrag();
				}
			}
		});
		this.$.dragger.addEventListener('mouseup', (e: MouseEvent) => {
			if (e.which === 1) {
				e.stopPropagation();
				this._stopDrag();
			}
		});
	}
};

Polymer.DraggableNodeBehavior = DNB as DraggableNodeBehavior;