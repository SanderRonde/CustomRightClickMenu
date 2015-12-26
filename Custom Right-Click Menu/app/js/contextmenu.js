(function () {
	var rowHeight = 50;

	function buildMenuSection(indent, row) {
		var container = document.createElement('div');
		container.classList.add('contextmenuRow');
		container.style.marginTop = ((indent * rowHeight) + 3) + 'px';

		var el;
		row.forEach(function(node) {
			el = document.createElement('div');
			el.classList.add('contextMenuItem');
			if (node.type === 'checkbox') {
				el.addEventListener('click', function() {
					
				});
			} else {
				
			}
			container.appendChild(el);
		});

		return container;
	}

	function ContextMenu(selector, items) {
		var element = document.createElement('div');
		

		$(selector).on('mouseup', function(event) {
			if (event.which === 3) {
				
			}
		});
	}

	window.contextMenu = new ContextMenu();
}());