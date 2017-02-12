function processData(data: string) {
	const dataArr = data.split('\n');
	var searchEngines: {
		searchEngines: Array<{
			name: string;
			url: string;
			searchUrl: string;
		}>
	} = { 
		searchEngines: [] 
	};
	var bindingName = dataArr[4];
	var bindingUrl = dataArr[5];
	var searchBindingUrl = dataArr[6];

	var i = 8;
	var passedBox = false;
	while (bindingName !== '' && bindingName !== undefined &&
			bindingUrl !== '' && bindingUrl !== undefined &&
			searchBindingUrl !== '' && searchBindingUrl !== undefined) {
		bindingName = dataArr[i];
		i++;
		bindingUrl = dataArr[i];
		i++;
		searchBindingUrl = dataArr[i];
		i += 2;

		if (bindingUrl === '' && searchBindingUrl !== '') {
			//We just passed the first box
			i -= 2;
			bindingName = dataArr[i];
			i++;
			bindingUrl = dataArr[i];
			i++;
			searchBindingUrl = dataArr[i];
			i += 2;
			passedBox = true;
		}
		else if (bindingUrl === '' && searchBindingUrl === '') {
			//The end of the search engines
			break;
		}

		if (passedBox) {
			const obj = {
				name: bindingName,
				url: bindingUrl,
				searchUrl: searchBindingUrl
			};
			searchEngines.searchEngines.push(obj);
		}
	}
	(postMessage as any)(searchEngines);
}

self.addEventListener('message', function (e) {
	var data = e.data;
	processData(data);
}, false);