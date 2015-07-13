(function() {
	var startTime = null;
	var paperDropdownEl = null;
	var paperMenu = null;
	var dropdownSelectedCont = null;
	var scale, doubleScale;

	function animateBoxShadowIn(timestamp) {
		if (!startTime) {
			startTime = timestamp;
		}
		if (timestamp - 100 < startTime) {
			scale = ((timestamp - startTime) / 100);
			doubleScale = scale * 2;
			paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			dropdownSelectedCont.style.marginLeft = scale * 15;
			window.requestAnimationFrame(animateBoxShadowIn);
		} else {
			startTime = null;
			paperMenu.style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)';
		}
	}

	function animateBoxShadowOut(timestamp) {
		if (!startTime) {
			startTime = timestamp;
		}
		if (timestamp - 100 < startTime) {
			scale = 1 - (((timestamp - startTime) / 100));
			doubleScale = scale * 2;
			paperMenu.style.boxShadow = '0 ' + doubleScale + 'px ' + doubleScale + 'px 0 rgba(0,0,0,0.14),' +
				' 0 ' + scale + 'px ' + (5 * scale) + 'px 0 rgba(0,0,0,0.12),' +
				' 0 ' + (scale * 3) + 'px ' + scale + 'px ' + -doubleScale + 'px rgba(0,0,0,0.2)';
			dropdownSelectedCont.style.marginLeft = scale * 15;
			window.requestAnimationFrame(animateBoxShadowOut);
		} else {
			startTime = null;
			paperMenu.style.boxShadow = 'rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0, rgba(0, 0, 0, 0) 0 0 0 0';
			paperDropdownEl.$.dropdownArrow.style.transform = 'rotate(90deg)';
		}
	}

	Polymer({
		is: 'paper-dropdown-menu',

		properties: {
			selected: {
				type: Number,
				value: 0,
				notify: true
			}
		},

			/**
		 * Whether the menu is expanded
		 * 
		 * @attribute expanded
		 * @type Boolean
		 * @default false
		*/
		expanded: false,

		dropdownSelectChange: function(el) {
			var paperItems = $(el).find('paper-item');
			console.log($(el).find('paper-menu')[0].selected);
			console.log(paperItems);
			el.$.dropdownSelected.innerHTML = paperItems[$(el).find('paper-menu')[0].selected].innerHTML;
		},

		ready: function() {
			var el = this;
			var paperItems = $(this).find('paper-item').on('click', function () {
				setTimeout(function() {
					el.dropdownSelectChange(el);
				}, 0);
			});
			this.$.dropdownSelected.innerHTML = paperItems[this.selected].innerHTML;
			paperDropdownEl = this;
			paperMenu = $(this).find('paper-menu')[0];;
			setTimeout(function() {
				$(el.$.dropdownSelectedCont).insertBefore($(el).find('.content'));
			}, 200);
			dropdownSelectedCont = $(this).find('#dropdownSelectedCont')[0];
		},

		toggleDropdown: function() {
			var el = this;
			
			if (this.expanded) {
				this.expanded = false;
				$(this).find('paper-menu').find('.content').stop().animate({
					height: 0
				}, {
					easing: 'easeInCubic',
					duration: 300,
					complete: function() {
						this.style.display = 'none';
						window.requestAnimationFrame(animateBoxShadowOut);
					}
				});
			} else {
				this.expanded = true;
				window.requestAnimationFrame(animateBoxShadowIn);
				setTimeout(function() {
					$(el).find('paper-menu').find('.content').css('display', 'block').stop().animate({
						height: 144
					}, {
						easing: 'easeOutCubic',
						duration: 300,
						complete: function() {
							el.$.dropdownArrow.style.transform = 'rotate(270deg)';
						}
					});
				}, 100);
			}
		}
	});
})();