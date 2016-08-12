(function() {
	Polymer({
		is: 'install-page',

		properties: {
			fetchFailed: {
				type: Boolean,
				value: false,
				notify: true
			},
			fetchCompleted: {
				type: Boolean,
				value: false,
				notify: true
			},
			fetchedData: {
				type: String,
				value: '',
				notify: true
			},
			userscriptUrlCalculated: {
				type: Boolean,
				notify: false,
				value: false
			},
			userscriptUrl: {
				type: String,
				computed: 'getUserscriptUrl(userscriptUrlCalculated)'
			},
			isLoading: {
				type: Boolean,
				value: false,
				notify: true,
				computed: 'isPageLoading(fetchFailed, fetchCompleted)'
			}
		},

		isPageLoading: function(fetchFailed, fetchCompleted) {
			return !fetchFailed && !fetchCompleted;
		},

		getUserscriptUrl: function() {
			this.userscriptUrlCalculated = true;
			var url = location.href.split('#');
			url.splice(0, 1);
			url = url.join('#');
			return url;
		},

		displayFetchedUserscript: function(script) {
			this.fetchCompleted = true;
			this.fetchedData = script;
		},

		notifyFetchError: function() {
			this.fetchFailed = true;
		},

		fetchUserscript: function(url) {
			var _this = this;
			$.ajax({
				url: url + '?noInstall',
				dataType: 'text'
			}).done(function(script) {
				_this.displayFetchedUserscript(script);
			}).fail(function() {
				_this.notifyFetchError();
			});
		},

		ready: function() {
			this.userscriptUrl = this.getUserscriptUrl();
			this.$.title.innerHTML = 'Installing userscript from ' + this.userscriptUrl;
			this.fetchUserscript(this.userscriptUrl);
			window.installPage = this;
		}
	});
}());