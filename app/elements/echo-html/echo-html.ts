/// <reference path="../elements.d.ts" />

const echoHtmlProperties: {
	html: string;
	makelink: boolean;
} = {
	html: {
		type: String,
		value: '',
		observer: 'htmlChanged'
	},
	makelink: {
		type: Boolean,
		value: false
	}
} as any;

type EchoHtml = Polymer.El<'echo-html',
	typeof EH & typeof echoHtmlProperties>;

class EH {
	static is: string = 'echo-html';

	static properties = echoHtmlProperties;

	static stampHtml(this: EchoHtml, html: string) {
		this.innerHTML = html;
	};

	static makeLinksFromHtml(html: string): string {
		html = html && html.replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g, '<a target="_blank" href="$1" title="">$1</a>');
		return html;
	};

	static htmlChanged(this: EchoHtml) {
		var html = this.html;
		if (this.makelink) {
			html = this.makeLinksFromHtml(html);
		}
		this.stampHtml(html);
	};

	static ready(this: EchoHtml) {
		this.htmlChanged();
	}
}

Polymer(EH);