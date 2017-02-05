/// <reference path="../../../tools/definitions/crmapp.d.ts" />
var PDB = (function () {
    function PDB() {
    }
    PDB._changeDraggingState = function (isDragging) {
        this.dragging = isDragging;
        this.$['itemCont'].style.willChange = (isDragging ? 'transform' : 'initial');
        this.$['itemCont'].style.zIndex = (isDragging ? '500' : '0');
        var currentColumn = window.app.editCRM.getCurrentColumn(this);
        currentColumn.dragging = isDragging;
        currentColumn.draggingItem = this;
    };
    PDB._onScroll = function () {
        var newScroll = $('body').scrollTop();
        var difference = newScroll - this._scrollStart.Y;
        this._dragStart.Y -= difference;
        this._lastRecordedPos.Y -= difference;
        this._scrollStart.Y = newScroll;
        this._onDrag();
    };
    PDB._sideDrag = function () {
        var newScroll = $('.CRMEditColumnCont')[0].getBoundingClientRect().left;
        var difference = newScroll - this._scrollStart.X;
        this._dragStart.X -= difference;
        this._lastRecordedPos.X -= difference;
        this._scrollStart.X = newScroll;
        this._onDrag();
    };
    PDB._stopDrag = function () {
        this.$$('paper-ripple').style.display = 'block';
        this.style.pointerEvents = 'all';
        this._changeDraggingState(false);
        document.body.removeEventListener('mouseup', this._listeners.stopDrag);
        document.body.style.webkitUserSelect = 'initial';
        window.removeEventListener('scroll', this._listeners.onScroll);
        //Doesn't propertly unbind
        window.removeEventListener('blur', this._listeners.stopDrag);
        document.querySelector('#mainCont').removeEventListener('scroll', this._listeners.onScroll);
        this._snapItem();
        this._rebuildMenu();
    };
    PDB._onMouseMove = function (event) {
        this._lastRecordedPos.X = event.clientX;
        this._lastRecordedPos.Y = event.clientY;
        this._cursorPosChanged = true;
    };
    PDB._onDrag = function () {
        if (this._cursorPosChanged && this.dragging) {
            this._cursorPosChanged = false;
            var columnCorrection = 200 * (this._filler.column - this.parentNode.index);
            var spacingTop = this._lastRecordedPos.Y - this._dragStart.Y;
            var x = (this._lastRecordedPos.X - this._dragStart.X + columnCorrection) + 'px';
            var y = spacingTop + 'px';
            this.$['itemCont'].style.transform = 'translate(' + x + ', ' + y + ')';
            var thisBoundingClientRect = this.getBoundingClientRect();
            var thisTop = (this._lastRecordedPos.Y - this._mouseToCorner.Y);
            var thisLeft = (this._lastRecordedPos.X - this._mouseToCorner.X) -
                thisBoundingClientRect.left - columnCorrection;
            //Vertically space elements
            if (!this._currentColumn) {
                this._currentColumn = window.app.editCRM.getCurrentColumn(this);
            }
            var parentChildrenList = window.app.editCRM.getEditCrmItems(this._currentColumn);
            var prev = parentChildrenList[this._filler.index - 1];
            var next = parentChildrenList[this._filler.index];
            var fillerPrevTop;
            if (prev) {
                fillerPrevTop = prev.getBoundingClientRect().top;
            }
            else {
                fillerPrevTop = -999;
            }
            if (thisTop < fillerPrevTop + 25) {
                this._filler.index--;
                $(this._filler).insertBefore(prev);
            }
            else if (next) {
                var fillerNextTop = next.getBoundingClientRect().top;
                if (thisTop > fillerNextTop - 25) {
                    if (parentChildrenList.length !== this._filler.index + 1) {
                        $(this._filler).insertBefore(parentChildrenList[this._filler.index + 1]);
                    }
                    else {
                        $(this._filler).insertBefore(parentChildrenList[this._filler.index]);
                    }
                    this._filler.index++;
                }
            }
            //Horizontally space elements
            var newColumn, newColumnChildren, newColumnLength, fillerIndex, currentChild, currentBoundingClientRect, i;
            if (thisLeft > 150) {
                var nextColumnCont = window.app.editCRM.getNextColumn(this);
                if (nextColumnCont) {
                    if (nextColumnCont.style.display !== 'none') {
                        this._dragStart.X += 200;
                        newColumn = nextColumnCont.querySelector('paper-material').querySelector('.CRMEditColumn');
                        newColumnChildren = newColumn.children;
                        newColumnLength = newColumnChildren.length - 1;
                        fillerIndex = 0;
                        if (this._lastRecordedPos.Y >
                            newColumnChildren[newColumnLength].getBoundingClientRect().top - 25) {
                            fillerIndex = newColumnLength;
                        }
                        else {
                            for (i = 0; i < newColumnLength; i++) {
                                currentChild = newColumn.children[i];
                                currentBoundingClientRect = currentChild.getBoundingClientRect();
                                if (this._lastRecordedPos.Y >= currentBoundingClientRect.top &&
                                    this._lastRecordedPos.Y <= currentBoundingClientRect.top) {
                                    fillerIndex = i;
                                    break;
                                }
                            }
                        }
                        this._filler.index = fillerIndex;
                        if (this.parentNode === this._filler[0].parentNode) {
                            this._dragStart.Y -= 50;
                        }
                        else if (this.parentNode === newColumn) {
                            this._dragStart.Y += 50;
                        }
                        $(this._filler).insertBefore(newColumnChildren[fillerIndex]);
                        if (newColumnLength === 0) {
                            newColumn.parentNode.style.display = 'block';
                            newColumn.parentNode.isEmpty = true;
                        }
                        this._filler.column = this._filler.column + 1;
                        this._currentColumn = null;
                    }
                }
            }
            else if (thisLeft < -50) {
                var prevColumnCont = window.app.editCRM.getPrevColumn(this);
                if (prevColumnCont) {
                    this._dragStart.X -= 200;
                    newColumn = prevColumnCont.querySelector('paper-material').querySelector('.CRMEditColumn');
                    newColumnChildren = newColumn.children;
                    newColumnLength = newColumnChildren.length - 1;
                    fillerIndex = 0;
                    if (this._lastRecordedPos.Y >
                        newColumnChildren[newColumnLength - 1].getBoundingClientRect().top - 25) {
                        fillerIndex = newColumnLength;
                    }
                    else {
                        for (i = 0; i < newColumnLength; i++) {
                            currentChild = newColumn.children[i];
                            currentBoundingClientRect = currentChild.getBoundingClientRect();
                            if (this._lastRecordedPos.Y >= currentBoundingClientRect.top &&
                                this._lastRecordedPos.Y <= currentBoundingClientRect.top) {
                                fillerIndex = i;
                                break;
                            }
                        }
                    }
                    this._filler.index = fillerIndex;
                    if (this._parentNode === newColumn) {
                        this._dragStart.Y += 50;
                    }
                    else if (this._parentNode === this._filler[0].parentNode) {
                        this._dragStart.Y -= 50;
                    }
                    var paperMaterial = this._filler[0].parentNode.parentNode;
                    if (paperMaterial.isEmpty) {
                        paperMaterial.style.display = 'none';
                    }
                    $(this._filler).insertBefore(newColumnChildren[fillerIndex]);
                    this._filler.column -= 1;
                    this._currentColumn = null;
                }
            }
        }
        if (this.dragging) {
            window.requestAnimationFrame(this._onDrag.bind(this));
        }
    };
    PDB._snapItem = function () {
        //Get the filler's current index and place the current item there
        var parentChildrenList = window.app.editCRM.getEditCrmItems(window.app.editCRM
            .getCurrentColumn(this), true);
        if (this._filler) {
            $(this).insertBefore(parentChildrenList[this._filler.index]);
            this.$['itemCont'].style.position = 'relative';
            this.style.position = 'relative';
            this.$['itemCont'].style.transform = 'initial';
            this.$['itemCont'].style.marginTop = '0';
            this._filler.remove();
        }
    };
    PDB._rebuildMenu = function () {
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
            newPath = prev.item.path;
            newPath[newPath.length - 1] += 1;
        }
        else if (next) {
            //The next item exists, newpath is that path
            newPath = next.item.path;
        }
        else {
            //No items exist yet, go to prev column and find the only expanded menu
            window.app.editCRM.getEditCrmItems(window.app.editCRM
                .getPrevColumn(this)).forEach(function (item) {
                if (item.item.expanded) {
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
            var newObj = window.app.editCRM.build(newPathMinusOne);
            Array.prototype.slice.apply(window.app.editCRM.getCurrentColumn(this).children)
                .forEach(function (element) {
                element.style.display = 'table';
            });
            setTimeout(function () {
                //Make every node re-run "ready"
                $(window.app.editCRM).find('edit-crm-item').each(function () {
                    this._recalculateIndex(newObj);
                });
            }, 0);
        }
    };
    PDB._startDrag = function (event) {
        this.$$('paper-ripple').style.display = 'none';
        var extraSpacing = (($(this.parentNode).children('edit-crm-item').toArray().length - this.index) * -50);
        this.style.pointerEvents = 'none';
        this._dragStart.X = event.clientX;
        this._dragStart.Y = event.clientY;
        this._lastRecordedPos.X = event.clientX;
        this._lastRecordedPos.Y = event.clientY;
        this._scrollStart.Y = $('body').scrollTop();
        this._scrollStart.X = $('.CRMEditColumnCont')[0].getBoundingClientRect().left;
        var boundingClientRect = this.getBoundingClientRect();
        this._mouseToCorner.X = event.clientX - boundingClientRect.left;
        this._mouseToCorner.Y = event.clientY - boundingClientRect.top;
        this._changeDraggingState(true);
        this.style.position = 'absolute';
        var x = $('something');
        this._filler = $('<div class="crmItemFiller"></div>').get(0);
        this._filler.index = this.index;
        this._filler.column = this.parentNode.index;
        document.body.addEventListener('mouseup', this._listeners.stopDrag);
        document.body.addEventListener('mousemove', this._listeners.onMouseMove);
        window.addEventListener('scroll', this._listeners.onScroll);
        window.addEventListener('blur', this._listeners.stopDrag);
        document.querySelector('#mainCont').addEventListener('scroll', this._listeners.onScroll);
        //Do visual stuff as to decrease delay between the visual stuff
        if (this.isMenu && this.parentNode.items[this.index].expanded) {
            //Collapse any columns to the right of this
            var columnContChildren = window.app.editCRM.getColumns();
            for (var i = this.column + 1; i < columnContChildren.length; i++) {
                columnContChildren[i].style.display = 'none';
            }
        }
        $(this._filler).insertBefore(this);
        this.$['itemCont'].style.marginTop = extraSpacing + 'px';
        this.parentNode.appendChild(this);
        this._onDrag();
    };
    PDB.init = function () {
        var _this = this;
        this.$['dragger'].addEventListener('mousedown', function (e) {
            if (e.which === 1) {
                _this._readyForMouseUp = false;
                _this._startDrag(e);
                _this._readyForMouseUp = true;
                if (_this._execMouseUp) {
                    _this._stopDrag();
                }
            }
        });
        this.$['dragger'].addEventListener('mouseup', function (e) {
            if (e.which === 1) {
                e.stopPropagation();
                if (_this._readyForMouseUp) {
                    _this._stopDrag();
                }
                else {
                    _this._execMouseUp = true;
                }
            }
        });
        this.column = this.parentNode.index;
        this._listeners = {
            stopDrag: this._stopDrag.bind(this),
            onMouseMove: this._onMouseMove.bind(this),
            onScroll: this._onScroll.bind(this)
        };
    };
    return PDB;
}());
/**
  * Whether this item is currently being dragged
  */
PDB.dragging = false;
/**
  * Whether this item is currently being dragged
  */
PDB._cursorPosChanged = true;
/**
 * The last recorded position of the mouse
 */
PDB._lastRecordedPos = {
    X: 0,
    Y: 0
};
/**
 * The position at which the user started to drag the curent item
 */
PDB._dragStart = {
    X: 0,
    Y: 0
};
/**
 * The position the mouse was relative to the corner when the drag started
 */
PDB._mouseToCorner = {
    X: 0,
    Y: 0
};
/**
 * Whether the element is ready for a mouse-up event
 */
PDB._readyForMouseUp = true;
/**
 * Whether the element should execute a mouse-up event when ready for it
 */
PDB._execMouseUp = false;
/**
 * What the getBoundingClientRect().top was for the CRM-container on drag
 * start
 */
PDB._scrollStart = {
    X: 0,
    Y: 0
};
;
Polymer.DraggableNodeBehavior = PDB;
