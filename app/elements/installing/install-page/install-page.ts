/// <reference path="../../elements.d.ts" />

const installPageProperties: {
	fetchFailed: boolean;
	fetchCompleted: boolean;
	fetchedData: string;
	userscriptUrlCalculated: boolean;
	userscriptUrl: string;
	isLoading: boolean;
} = {
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
} as any;

type InstallPage = PolymerElement<'install-page', typeof IP & typeof installPageProperties>;

class IP {
	static is: string = 'install-page';

	static properties = installPageProperties;

	static isPageLoading(this: InstallPage, fetchFailed: boolean, fetchCompleted: boolean): boolean {
		return !fetchFailed && !fetchCompleted;
	};

	static getUserscriptUrl(this: InstallPage): string {
		this.userscriptUrlCalculated = true;
		var urlArr: Array<string> = location.href.split('#');
		urlArr.splice(0, 1);
		return urlArr.join('#');
	};

	static displayFetchedUserscript(this: InstallPage, script: string) {
		this.fetchCompleted = true;
		this.fetchedData = script;
	};

	static notifyFetchError(this: InstallPage) {
		this.fetchFailed = true;
	};

	static fetchUserscript(this: InstallPage, url: string) {
		var _this = this;
		$.ajax({
			url: url + '?noInstall',
			dataType: 'text'
		}).done(function(script) {
			_this.displayFetchedUserscript(script);
		}).fail(function() {
			_this.notifyFetchError();
		});
	};

	static ready(this: InstallPage) {
		this.userscriptUrl = this.getUserscriptUrl();
		this.$.title.innerHTML = 'Installing userscript from ' + this.userscriptUrl;
		this.fetchUserscript(this.userscriptUrl);
		window.installPage = this;
	}
}

Polymer(IP);