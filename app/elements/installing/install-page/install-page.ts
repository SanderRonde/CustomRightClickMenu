/// <reference path="../../elements.d.ts" />

(() => {
	window.objectify = <T>(fn: T): T => {
		const obj: Partial<T> = {};
		Object.getOwnPropertyNames(fn).forEach((key: keyof T) => {
			obj[key] = fn[key];
		});
		return obj as T;
	}

	window.onExists = <T extends keyof Window>(key: T, callback: (val: Window[T]) => void) => {
		if (window[key]) {
			callback(window[key]);
			return;
		}
		const interval = window.setInterval(() => {
			if (key in window) {
				window.clearInterval(interval);
				callback(window[key]);
			}
		}, 50);
	}

	const event = new Event('ObjectifyReady');
	window.dispatchEvent(event);
})();

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

class IP {
	static is: string = 'install-page';

	static properties = installPageProperties;

	static isPageLoading(this: InstallPage, fetchFailed: boolean, fetchCompleted: boolean): boolean {
		return !fetchFailed && !fetchCompleted;
	};

	static getInstallSource(): string {
		const searchParams = this.getSearchParams(location.href);
		return searchParams['s'];
	}

	private static getSearchParams(url: string): {
		[key: string]: string;
	} {
		//Split at the first ?
		const queryString = url.split('?').slice(1).join('?');

		const searchParamsArr = queryString.split('&').map((keyVal: string) => {
			const split = keyVal.split('=');
			return {
				key: split[0],
				val: decodeURIComponent(split[1])
			}
		});

		const searchParams: {
			[key: string]: string
		} = {};

		for (let i = 0; i < searchParamsArr.length; i++) {
			searchParams[searchParamsArr[i].key] = searchParamsArr[i].val;
		}

		return searchParams;
	}

	static getUserscriptUrl(this: InstallPage): string {
		this.userscriptUrlCalculated = true;

		//Polyfill URL().searchParams for chrome 26
		const searchParams = this.getSearchParams(location.href);

		return searchParams['i'];
	};

	static displayFetchedUserscript(this: InstallPage, script: string) {
		this.fetchCompleted = true;
		this.fetchedData = script;
	};

	static notifyFetchError(this: InstallPage) {
		this.fetchFailed = true;
	};

	static fetchUserscript(this: InstallPage, url: string) {
		const _this = this;
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

type InstallPage = Polymer.El<'install-page', typeof IP & typeof installPageProperties>;

if (window.objectify) {
	Polymer(window.objectify(IP));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(IP));
	});
}