/// <reference path="../elements.d.ts" />

const logPageProperties: {
	isLoading: boolean;
} = {
	isLoading: {
		type: Boolean,
		value: true,
		notify: true
	}
} as any;

type LogPage = PolymerElement<'log-page', typeof LP & typeof logPageProperties>;

class LP {
	static is: string = 'log-page';

	static properties = logPageProperties;

static ready(this: LogPage) {
		if (window.logConsole && window.logConsole.done) {
			this.isLoading = false;
		}
		window.logPage = this;

		window.setTimeout(function() {
			var event = document.createEvent("HTMLEvents");
			event.initEvent("CRMLoaded", true, true);
			(event as any).eventName = "CRMLoaded";
			document.body.dispatchEvent(event);
		}, 2500);
	}
}

Polymer(LP);