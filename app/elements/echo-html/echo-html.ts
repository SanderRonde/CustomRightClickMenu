/// <reference path="../elements.d.ts" />

namespace EchoHtmlElement {
	export const echoHtmlProperties: {
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

	export class EH {
		static is: string = 'echo-html';

		static properties = echoHtmlProperties;

		private static stampHtml(this: EchoHtml, html: string) {
			this.shadowRoot.innerHTML = html;
		};

		private static makeLinksFromHtml(html: string): string {
			html = html && html.replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g, '<a target="_blank" href="$1" title="">$1</a>');
			return html;
		};

		static htmlChanged(this: EchoHtml) {
			let html = this.html;
			if (this.makelink) {
				html = this.makeLinksFromHtml(html);
			}
			this.stampHtml(html);
		};

		static ready(this: EchoHtml) {
			this.htmlChanged();
		}
	}

	if (window.objectify) {
		Polymer(window.objectify(EH));
	} else {
		window.addEventListener('ObjectifyReady', () => {
			Polymer(window.objectify(EH));
		});
	}
}

type EchoHtml = Polymer.El<'echo-html',
	typeof EchoHtmlElement.EH & typeof EchoHtmlElement.echoHtmlProperties>;