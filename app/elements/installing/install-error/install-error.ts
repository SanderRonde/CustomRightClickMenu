class IE {
	static is: string = 'install-error';
}

if (window.objectify) {
	window.register(IE);
} else {
	window.addEventListener('RegisterReady', () => {
		window.register(IE);
	});
}
