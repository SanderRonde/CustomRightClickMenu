Polymer({
	is: 'edit-crm-item',

	properties: {
		item: {
			type: Object,
			notify: true
		},
		name: String,
		isMenu: Boolean,
		dragging: {
			type: Boolean,
			value: false
		},
		lastRecordedPos: {
			type: Object,
			value: {
				X: 0,
				Y: 0
			}
		},
		dragStart: {
			type: Object,
			value: {
				X: 0,
				Y: 0
			}
		},
		mouseToCorner: {
			type: Object,
			value: {
				X: 0,
				Y: 0
			}
		},
		scrollStartY: Number,
		element: Object,
		bodyDragFunction: Function,
		bodyScrollFunction: Function,
		blurFunction: Function,
		filler: {
			type: Element
		}
	},

	ready: function() {
		this.name = this.item.name;
		this.isMenu = this.item.type === 'menu';
		var elem = this;
		$(this.$.dragger)
			.on('mousedown', function(e) {
				if (e.which === 1) {
					elem.dragItem(e);
				}
			})
			.on('mouseup', function(e) {
				if (e.which === 1) {
					elem.stopDrag();
				}
			});
		this.element = this;
	},

	openEditPage: function(e) {
		console.log(e);
	},

	openMenu: function() {
		console.log(this.item.path);
		options.editCRM.build(this.item.path);
	},

	bodyScroll: function() {
		var newScroll = $('body').scrollTop();
		var difference = newScroll - this.scrollStartY;
		this.dragStart.Y = this.dragStart.Y - difference;
		this.lastRecordedPos.Y = this.lastRecordedPos.Y - difference;
		this.scrollStartY = newScroll;
		this.bodyDrag({
			clientX: this.lastRecordedPos.X,
			clientY: this.lastRecordedPos.Y
		});
	},

	dragItem: function(event) {
		this.dragStart.X = event.clientX;
		this.dragStart.Y = event.clientY;
		this.scrollStartY = $('body').scrollTop();
		var boundingClientRect = this.getBoundingClientRect();
		this.mouseToCorner.X = event.clientX - boundingClientRect.left;
		this.mouseToCorner.Y = event.clientY - boundingClientRect.top;

		this.dragging = true;
		this.style.position = 'absolute';
		this.filler = $('<div class="crmItemFiller"></div>');
		this.filler.insertBefore($(this.parentNode).children()[this.index]);
		this.filler.index = this.index;
		var elem = this;

		//Used to preserve 'this', passing data via jquery doesnt' seem to work
		this.bodyDragFunction = function(e) {
			elem.bodyDrag(e);
		}
		this.bodyScrollFunction = function(e) {
			console.log('meemd');
			elem.bodyScroll(e);
		}
		this.blurFunction = function() {
			elem.bodyDrag({
				clientX: elem.dragStart.X,
				clientY: elem.dragStart.Y
			});
			elem.stopDrag();
		}

		console.log(this.bodyDragFunction);

		$('body')
			.on('mousemove', elem.bodyDragFunction)
			.on('scroll', elem.bodyScrollFunction)
			.css('-webkit-user-select', 'none');

		$(window)
			.on('scroll', elem.bodyScrollFunction)
			.on('blur', elem.blurFunction);

		this.parentNode.appendChild(this);
	},

	stopDrag: function() {
		this.dragging = false;
		var elem = this;
		$('body')
			.off('mousemove', elem.bodyDragFunction)
			.css('-webkit-user-select', 'initial');

		$(window)
			.off('scroll', elem.bodyScrollFunction)
			.off('blur', elem.blurFunction);
		this.snapItem();
	},

	bodyDrag: function(event) {
		var elem = this;
		this.lastRecordedPos.X = event.clientX;
		this.lastRecordedPos.Y = event.clientY;
		this.$.itemCont.style.marginLeft = (event.clientX - elem.dragStart.X) + 'px';
		var spacingTop = event.clientY - elem.dragStart.Y;
		this.$.itemCont.style.marginTop = spacingTop + 'px';
		var thisTop = event.clientY - this.mouseToCorner.Y;
		var thisLeft = event.clientX - this.mouseToCorner.X;

		//Vertically space elements
		var parentChildrenList = $(this.parentNode).children('edit-crm-item');
		var prev = parentChildrenList[this.filler.index - 1];
		var next = parentChildrenList[this.filler.index];
		var fillerPrevTop;
		if (prev) {
			fillerPrevTop = prev.getBoundingClientRect().top;
		}
		else {
			fillerPrevTop = -999;
		}
		console.log(fillerPrevTop);
		if (thisTop < fillerPrevTop + 25) {
			this.filler.index--;
			this.filler.insertBefore(prev);
		}
		else if (next) {
			var fillerNextTop = next.getBoundingClientRect().top;
			if (thisTop > fillerNextTop - 25) {
				if (parentChildrenList.toArray().length !== this.filler.index + 1) {
					this.filler.insertBefore(parentChildrenList[this.filler.index + 1]);
				}
				else {
					this.filler.insertBefore(parentChildrenList[this.filler.index]);
				}
				this.filler.index++;
			}
		}


		//Horizontally space elements
		if (thisLeft > 150) {

		}
	},

	snapItem: function() {
		//Get the filler's current index and place the current item there
		var parentChildrenList = $(this.parentNode).children('edit-crm-item');
		$(this).insertBefore(parentChildrenList[this.filler.index]);

		var elem = this;
		setTimeout(function() {
			elem.filler.remove();
			elem.$.itemCont.style.position = 'relative';
			elem.style.position = 'relative';
			elem.$.itemCont.style.marginTop = '0';
			$(elem.$.itemCont).css('margin-left', '0');

			//Redo indexes
			parentChildrenList = $(elem.parentNode).children('edit-crm-item').toArray();
			parentChildrenList.forEach(function (value, index) {
				value.index = index;
			});
		}, 0);
	}
});