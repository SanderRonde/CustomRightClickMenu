/// <reference path="../../elements.d.ts" />

import { Polymer } from '../../../../tools/definitions/polymer';

namespace EchoHtmlElement {
	export const echoHtmlProperties: {
		html: string;
		makelink: boolean;
		inline: boolean;
	} = {
		html: {
			type: String,
			value: '',
			observer: 'htmlChanged'
		},
		makelink: {
			type: Boolean,
			value: false
		},
		inline: {
			type: Boolean,
			value: false
		}
	} as any;

	export class EH {
		static is: string = 'echo-html';

		static properties = echoHtmlProperties;

		private static _stampHtml(this: EchoHtml, html: string) {
			this.$.content.innerHTML = html;
		};

		private static _makeLinksFromHtml(html: string): string {
			html = html && html.replace(/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g, '<a rel="noopener" target="_blank" href="$1" title="">$1</a>');
			return html;
		};

		static htmlChanged(this: EchoHtml) {
			let html = this.html;
			if (this.makelink) {
				html = this._makeLinksFromHtml(html);
			}
			this._stampHtml(html);
		};

		static ready(this: EchoHtml) {
			this.htmlChanged();
			if (this.inline) {
				this.$.content.classList.add('inline');
			}
		}
	}

	if (window.objectify) {
		window.register(EH);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(EH);
		});
	}
}

export type EchoHtml = Polymer.El<'echo-html',
	typeof EchoHtmlElement.EH & typeof EchoHtmlElement.echoHtmlProperties>;