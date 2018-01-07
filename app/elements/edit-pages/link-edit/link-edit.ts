/// <reference path="../../elements.d.ts" />

namespace LinkEditElement {
	export const linkEditProperties: {
		item: CRM.LinkNode;
	} = {
		item: {
			type: Object,
			value: {},
			notify: true
		}
	} as any;

	export class LE {
		static is: string = 'link-edit';

		static behaviors = [Polymer.NodeEditBehavior];

		static properties = linkEditProperties;

		static init(this: NodeEditBehaviorLinkInstance) {
			this._init();
		};

		static ready(this: NodeEditBehaviorLinkInstance) {
			window.linkEdit = this;
		};

		static saveChanges(this: NodeEditBehaviorLinkInstance, resultStorage: Partial<CRM.LinkNode>) {
			//Get new "item"
			resultStorage.value = [];
			$(this.$.linksContainer).find('.linkChangeCont').each(function (this: HTMLElement) {
				resultStorage.value.push({
					'url': ($(this).children('paper-input')[0] as HTMLPaperInputElement).value,
					'newTab': ($(this).children('paper-checkbox')[0].getAttribute('aria-checked') !== 'true')
				});
			});
		};

		static checkboxStateChange(this: NodeEditBehaviorLinkInstance, e: Polymer.ClickEvent) {
			//Get this checkbox
			const checkbox = window.app.util.findElementWithTagname(e.path, 'paper-checkbox');
			$(this.$.linksContainer).find('paper-checkbox').each(function (this: HTMLPaperCheckboxElement) {
				if (this !== checkbox) {
					this.removeAttribute('checked');
				}
			});
		};

		static addLink() {
			window.linkEdit.push('newSettings.value', {
				url: 'https://www.example.com',
				newTab: true
			});
		};

		static toggleCheckbox(e: Polymer.ClickEvent) {
			$(window.app.util.findElementWithClassName(e.path, 'linkChangeCont'))
				.children('paper-checkbox').click();
		}
	}

	if (window.objectify) {
		window.register(LE);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(LE);
		});
	}
}

type LinkEdit = Polymer.El<'link-edit', typeof LinkEditElement.LE & typeof LinkEditElement.linkEditProperties>;