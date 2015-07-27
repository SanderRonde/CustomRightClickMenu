function processData(data) {
	data = data.split('\n');
	var searchEngines = { searchEngines: [] };
	var bindingName;
	var bindingUrl;
	var searchBindingUrl;

	bindingName = data[4];
	bindingUrl = data[5];
	searchBindingUrl = data[6];

	var o = 8;
	var obj;
	var passedBox = false;
	while (bindingName !== '' && bindingName !== undefined && bindingUrl !== '' && bindingUrl !== undefined && searchBindingUrl !== '' && searchBindingUrl !== undefined) {
		bindingName = data[o];
		o++;
		bindingUrl = data[o];
		o++;
		searchBindingUrl = data[o];
		o += 2;

		if (bindingUrl === '' && searchBindingUrl !== '') {
			//We just passed the first box
			o -= 2;
			bindingName = data[o];
			o++;
			bindingUrl = data[o];
			o++;
			searchBindingUrl = data[o];
			o += 2;
			passedBox = true;
		}
		else if (bindingUrl === '' && searchBindingUrl === '') {
			//The end of the search engines
			break;
		}

		if (passedBox) {
			obj = {
				name: bindingName,
				url: bindingUrl,
				searchUrl: searchBindingUrl
			};
			searchEngines.searchEngines.push(obj);
		}
	}
	postMessage(searchEngines);
}

self.addEventListener('message', function (e) {
	var data = e.data;
	processData(data);
}, false);