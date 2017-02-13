/// <reference path="../elements.d.ts" />

const crmEditPageProperties: {
	animationConfig: {
		value(): {
			entry: {
				name: string;
				node: HTMLElement;
				duration: number;
			},
			exit: {
				name: string;
				node: HTMLElement;
				duration: number;
			}
		}
	};
	item: CRMNode;
	nodeInfo: CRMNodeInfo;
	hideUpdateMessage: boolean;
} = {
	animationConfig: {
		value: function(this: CrmEditPage) {
			return {
				'entry': {
					name: 'scale-up-animation',
					node: this.$.overlayCont,
					duration: 300
				},
				'exit': {
					name: 'scale-down-animation',
					node: this.$.overlayCont,
					duration: 300
				}
			};
		}
	},
	/**
	 * The item to edit
	 */
	item: {
		type: Object,
		value: null,
		notify: true
	},
	/**
	 * The nodeInfo to display
	 */
	nodeInfo: {
		type: Object,
		value: {},
		notify: true
	},
	/**
	 * Whether to hide the update message
	 */
	hideUpdateMessage: {
		type: Boolean,
		value: true,
		notify: true
	}
} as any;

type CrmEditPage = PolymerElement<'crm-edit-page',
	typeof CEP & typeof crmEditPageProperties & typeof Polymer.NeonAnimationRunnerBehavior
>;

class CEP {
	static is: string = 'crm-edit-page';

	static behaviors = [Polymer.NeonAnimationRunnerBehavior];

	/**
	 * The item that was originally clicked on
	 */
	static clicksrc: HTMLElement;

	/**
	 * Whether the item is a link
	 */
	static isLink: boolean = false;

	/**
	 * Whether the item is a script
	 */
	static isScript: boolean = false;

	/**
	 * Whether the item is a divider
	 */
	static isDivider: boolean = false;

	/**
	 * Whether the item is a menu
	 */
	static isMenu: boolean = false;

	/**
	 * Whether the item is a stylesheet
	 */
	static isStylesheet: boolean = false;

	/**
	 * The link item
	 */
	static linkItem: LinkNode = {} as any;

	/**
	 * The script item
	 */
	static scriptItem: ScriptNode = {} as any;

	/**
	 * The divider item
	 */
	static dividerItem: DividerNode = {} as any;

	/**
	 * The menu item
	 */
	static menuItem: MenuNode = {} as any;

	/**
	 * The stylesheet item
	 */
	static stylesheetItem: StylesheetNode = {} as any;

	/**
     * Whether the page is opened
     */
	static opened: boolean =  false;

	/**
     * The overlay element associated with the current dialog
     */
	static $overlayEl: JQuery;

	/**
	 * The overlayEl animation
	 */
	static overlayAnimation: Animation = null;

	static properties = crmEditPageProperties;

	static listeners = {
		"neon-animation-finish": '_onNeonAnimationFinish'
	};

	static isLocal(source: {
		updateURL?: string;
		downloadURL?: string;
		url?: string;
		author?: string;
	}): boolean {
		if (!source) {
			return true;
		}
		return source === 'local';
	};

	static nodeInfoExists(nodeInfo: CRMNodeInfo): boolean {
		return !!nodeInfo;
	};

	static hideNodeInfo(nodeInfo: CRMNodeInfo): boolean {
		return !this.nodeInfoExists(nodeInfo) ||
			(this.isLocal(nodeInfo.source) && !this.hasInstallDate(nodeInfo));
	};

	static hasInstallDate(nodeInfo: CRMNodeInfo): boolean {
		return this.nodeInfoExists(nodeInfo) && !!nodeInfo.installDate;
	};

	static _onNeonAnimationFinish(this: CrmEditPage) {
		if (!this.opened) {
			this.$overlayEl[0].style.display = 'none';
			this.$.overlayCont.style.display = 'none';
			document.body.style.overflow = 'auto';
			document.body.style.marginRight = '0';
			window.app.show = false;
			this.opened = false;
			window.app.item = null;
			this.unassignItems();
		}
	};

	static unassignItems() {
		this.isLink = this.isScript = this.isStylesheet = this.isMenu = this.isDivider = false;
		this.linkItem = this.scriptItem = this.stylesheetItem = this.menuItem = this.dividerItem = {} as any;
	};

	static animateIn(this: CrmEditPage) {
		this.$overlayEl.css('display', 'block');
		(this.overlayAnimation && this.overlayAnimation.play()) || (this.overlayAnimation = this.$overlayEl[0].animate([
			{
				opacity: 0
			}, {
				opacity: 0.3
			}
		], {
			duration: 300,
			fill: 'both',
			easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
		}));
			
		document.body.style.overflow = 'hidden';
		document.body.style.marginRight = '17px';
		window.app.show = true;
		this.opened = true;
		this.$.overlayCont.style.display = 'block';
		this.playAnimation('entry');
	};
	
	static animateOut(this: CrmEditPage) {
		this.overlayAnimation.reverse();
		this.$overlayEl.off('click');
		this.playAnimation('exit');
		this.opened = false;
		document.body.parentElement.style.overflow = 'auto';
	};

	static updateNodeInfo<T>(this: CrmEditPage, obj: T, path: string = 'nodeInfo') {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key as keyof T] === 'object') {
					this.updateNodeInfo(obj[key as keyof T], path + '.' + key);
				}
				this.notifyPath(path + '.' + key, obj[key as keyof T]);
			}
		}
	};

	static updateName(this: CrmEditPage, value: any) {
		this.notifyPath('item.name', value);
	};

	static showUpgradeNotice(hideUpdateMessage: boolean, node: CRMNode): boolean {
		return !hideUpdateMessage && (node && node.type === 'script' && node.value && node.value.updateNotice);
	};

	static getScriptUpdateStatus(node: CRMNode): string {
		if (node) {
			if (window.app.storageLocal.upgradeErrors) {
				if (window.app.storageLocal.upgradeErrors[node.id]) {
					return 'Some errors have occurred in updating this script. Please resolve them by clicking the link and replace any chrome ' +
						'calls on error lines with their CRM API equivalent.';
				}
			}
			return 'No errors have been detected in updating this script but this is no guarantee it will work, be sure to test it at least once.';
		}
		return '';
	};

	static hideUpdateMergeDialog(this: CrmEditPage) {
		var _this = this;
		if (this.showUpgradeNotice(this.hideUpdateMessage, this.item)) {
			var height = this.$.scriptUpdateNotice.getBoundingClientRect().height;
			var marginBot = '-' + height + 'px';
			this.$.scriptUpdateNotice.animate([
				{
					marginBottom: '0px'
				}, {
					marginBottom: marginBot
				}
			], {
				duration: 350,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
			}).onfinish = function() {
				_this.$.scriptUpdateNotice.style.marginBottom = marginBot;
				_this.hideUpdateMessage = true;
			};
		}
		window.scriptEdit.newSettings.value.updateNotice = false;
	};

	static showScriptUpdateDiff(this: CrmEditPage) {
		var _this = this;
		var oldScript = (this.item as ScriptNode).value.oldScript;
		var newScript = (this.item as ScriptNode).value.script;
		const chooseDialog = window.doc['externalEditorChooseFile'];
		chooseDialog.init(oldScript, newScript, function(chosenScript: string) {
			if (window.app.storageLocal.upgradeErrors) {
				delete window.app.storageLocal.upgradeErrors[_this.item.id];
			}
			window.scriptEdit.editor.setValue(chosenScript);
			setTimeout(function() {
				_this.hideUpdateMergeDialog();
			}, 250);
			chrome.storage.local.set({
				upgradeErrors: window.app.storageLocal.upgradeErrors || {}
			});
		}, true, window.app.storageLocal.upgradeErrors && window.app.storageLocal.upgradeErrors[this.item.id]);
		window.externalEditor.showMergeDialog(window.externalEditor, oldScript, newScript);
		chooseDialog.open();
	};

	static getInstallDateTextFormat(this: CrmEditPage) {
		if (window.Intl && typeof window.Intl === 'object' && this.nodeInfo) {
			var format = (new Date('1-13-2016').toLocaleDateString() === '1-13-2016' ? 'eu' : 'na');
			var date;
			if (format === 'eu') {
				date = this.nodeInfo.installDate.split('-');
				date = date[1] + '-' + date[0] + '-' + date[2];
			} else {
				date = this.nodeInfo.installDate;
			}
			date = new Date(date);
			return Math.floor(new Date(Date.now() - date.getMilliseconds()).getMilliseconds() / (1000 * 60 * 60 * 24)) + ' days ago';
		}
		return null;
	};

	static ready(this: CrmEditPage) {
		$('.popupCont').click(function(e) {
			e.stopPropagation();
		});
		this.$overlayEl = $('.overlayCont');
		window.crmEditPage = this;
		this.isLink = this.isMenu = this.isScript = this.isDivider = false;
	};
	
	static init(this: CrmEditPage) {
		var _this = this;
		var valueStorer: {
			isScript: boolean;
			isLink: boolean;
			isMenu: boolean;
			isDivider: boolean;
			isStylesheet: boolean;
		} = {
			isScript: false,
			isLink: false,
			isDivider: false,
			isMenu: false,
			isStylesheet: false
		};
		this.hideUpdateMessage = false;
		this.scriptItem = this.linkItem = this.dividerItem = this.menuItem = this.stylesheetItem = {} as any;
		const node = this.item;
		if ((valueStorer.isScript = node.type === 'script')) {
			this.scriptItem = node as ScriptNode;
			valueStorer.isLink = valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
		} else if ((valueStorer.isLink = node.type === 'link')) {
			this.linkItem = node as LinkNode;
			valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
		} else if ((valueStorer.isStylesheet = node.type === 'stylesheet')) {
			this.stylesheetItem = node as StylesheetNode;
			valueStorer.isMenu = valueStorer.isDivider = false;
		} else if ((valueStorer.isMenu = node.type === 'menu')) {
			this.menuItem = node as MenuNode;
			valueStorer.isDivider = false;
		} else {
			valueStorer.isDivider = true;
			this.dividerItem = node as DividerNode;

		}
		setTimeout(function() {
			window.app.show = true;
			_this.isScript = valueStorer.isScript;
			_this.isLink = valueStorer.isLink;
			_this.isMenu = valueStorer.isMenu;
			_this.isDivider = valueStorer.isDivider;
			_this.isStylesheet = valueStorer.isStylesheet;
			const page = ($(_this)
				.find('#editPageCont > :not([hidden])')[0] as EditPage);
			page.init.apply(page);
			_this.animateIn();
		}, 300);
	}
}

Polymer(CEP);