(function() {
	if (!(function() {
		try {
			new Function('(a = 0) => a');
			return true;
		} catch (err) {
			return false;
		}
	}())) {
		var tag = document.createElement('script');
		tag.src = './' + 
			location.pathname.split('/').pop().split('.')[0] + 
			'.es5.js';
		document.body.appendChild(tag);
	}
})();