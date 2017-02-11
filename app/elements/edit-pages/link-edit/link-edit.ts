/// <reference path="../../../../tools/definitions/crmapp.d.ts" />

const linkEditProperties: {
	item: LinkNode;
} = {
	item: {
		type: Object,
		value: {},
		notify: true
	}
} as any;

interface LinkEditBehaviorProperties extends NodeEditBehaviorProperties {
	newSettings: Partial<ScriptNode>;
}

type LinkEdit = PolymerElement<typeof SCE & typeof linkEditProperties> & 
	NodeEditBehaviorBase & LinkEditBehaviorProperties;

class LE {
	static is: string = 'link-edit';

	static behaviors = [Polymer.NodeEditBehavior];

	static properties = linkEditProperties;

	static init(this: LinkEdit) {
		this._init();
	};

	static ready(this: LinkEdit) {
		window.linkEdit = this;
	};

	static saveChanges(this: LinkEdit, resultStorage: Partial<LinkNode>) {
		//Get new "item"
		resultStorage.value = [];
		$(this.$['linksContainer']).find('.linkChangeCont').each(function () {
			resultStorage.value.push({
				'url': ($(this).children('paper-input')[0] as PaperInput).value,
				'newTab': ($(this).children('paper-checkbox')[0].getAttribute('aria-checked') !== 'true')
			});
		});
	};

	static checkboxStateChange(this: LinkEdit, e: PolymerClickEvent) {
		//Get this checkbox
		var pathIndex = 0;
		while (e.path[pathIndex].tagName !== 'PAPER-CHECKBOX') {
			pathIndex++;
		}
		var checkbox = e.path[pathIndex];
		$(this.$['linksContainer']).find('paper-checkbox').each(function () {
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

	static toggleCheckbox(e: PolymerClickEvent) {
		var pathIndex = 0;
		while (!e.path[pathIndex].classList.contains('linkChangeCont')) {
			pathIndex++;
		}
		$(e.path[pathIndex]).children('paper-checkbox').click();
	}
}

Polymer(LE);