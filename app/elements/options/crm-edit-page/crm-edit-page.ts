/// <reference path="../../elements.d.ts" />

import { EditPage } from '../../elements';
import { Polymer } from '../../../../tools/definitions/polymer';
import { I18NKeys } from '../../../_locales/i18n-keys';

declare const browserAPI: browserAPI;

namespace CrmEditPageElement {
	export const crmEditPageProperties: {
		item: CRM.Node;
		nodeInfo: CRM.NodeInfo;
		hideUpdateMessage: boolean;
	} = {
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

	export class CEP {
		static is: string = 'crm-edit-page';

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
		static linkItem: CRM.LinkNode = {} as any;

		/**
		 * The script item
		 */
		static scriptItem: CRM.ScriptNode = {} as any;

		/**
		 * The divider item
		 */
		static dividerItem: CRM.DividerNode = {} as any;

		/**
		 * The menu item
		 */
		static menuItem: CRM.MenuNode = {} as any;

		/**
		 * The stylesheet item
		 */
		static stylesheetItem: CRM.StylesheetNode = {} as any;

		/**
		 * The backdrop element associated with the current dialog
		 */
		private static _backdropEl: HTMLElement;

		static properties = crmEditPageProperties;

		static listeners = {
			"neon-animation-finish": '_onNeonAnimationFinish'
		};

		static getCreatedBy(this: CrmEditPage) {
			return this.___(I18NKeys.options.crmEditPage.createdByYou, 
				`<b id="nodeInfoByYou" title="${
					this.___(I18NKeys.options.crmEditPage.hasAllPermissions)
				}">You</b>`)
		}

		static nodeInfoSource(this: CrmEditPage) {
			return this.___(this.isLocal(this.nodeInfo.source) ? 
					I18NKeys.options.crmEditPage.createdOn : 
					I18NKeys.options.crmEditPage.installedOn,
				`<b title="${
					this.getInstallDate()
				}">${this.nodeInfo.installDate}</b>`)
		}

		static isLocal(this: CrmEditPage, source: {
			updateURL?: string;
			downloadURL?: string;
			url?: string;
			author?: string;
		}|string): source is string {
			if (!source) {
				return true;
			}
			return source === 'local' || this.item.isLocal;
		};

		private static _nodeInfoExists(nodeInfo: CRM.NodeInfo): boolean {
			return !!nodeInfo;
		};

		static hideNodeInfo(this: CrmEditPage, nodeInfo: CRM.NodeInfo): boolean {
			return !this._nodeInfoExists(nodeInfo) ||
				(this.isLocal(nodeInfo.source) && !this.hasInstallDate(nodeInfo));
		};

		static hasInstallDate(nodeInfo: CRM.NodeInfo): boolean {
			return this._nodeInfoExists(nodeInfo) && !!nodeInfo.installDate;
		};

		private static _onAnimationDone(this: CrmEditPage) {
			this._backdropEl.classList.remove('visible');
			this._backdropEl.classList.remove('clickthrough');
			this.$.overlayCont.style.display = 'none';
			document.body.style.overflow = 'auto';
			document.body.style.marginRight = '0';
			window.app.show = false;
			window.app.item = null;
			this._unassignItems();
		};

		private static _unassignItems(this: CrmEditPage) {
			this.isLink = this.isScript = this.isStylesheet = this.isMenu = this.isDivider = false;
			this.linkItem = this.scriptItem = this.stylesheetItem = this.menuItem = this.dividerItem = {} as any;
		};

		private static _animateIn(this: CrmEditPage) {
			this._backdropEl.classList.add('visible');
			this._backdropEl.classList.add('animateIn');
				
			document.body.style.overflow = 'hidden';
			document.body.style.marginRight = '17px';
			window.app.show = true;
			this.$.overlayCont.style.display = 'block';
			return window.animateTransform(this.$.overlayCont, {
				propName: 'scale',
				postfix: '',
				from: 0,
				to: 1
			}, {
				duration: 300,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
				fill: 'both'
			});
		};
		
		static animateOut(this: CrmEditPage) {
			this._backdropEl.classList.remove('animateIn');

			//Make it clickthrough-able already
			this._backdropEl.classList.add('clickthrough');
			
			const animation = window.animateTransform(this.$.overlayCont, {
				propName: 'scale',
				postfix: '',
				from: 1,
				to: 0
			}, {
				duration: 500,
				easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
				fill: 'both'
			});
			animation.onfinish = () => {
				this._onAnimationDone();
			}
			document.body.parentElement.style.overflow = 'auto';
		};

		static updateName(this: CrmEditPage, value: any) {
			this.notifyPath('item.name', value);
		};

		static showUpgradeNotice(hideUpdateMessage: boolean, node: CRM.Node): boolean {
			return !hideUpdateMessage && (node && node.type === 'script' && node.value && node.value.updateNotice);
		};

		static getScriptUpdateStatus(node: CRM.Node): string {
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
				}).onfinish = () => {
					this.$.scriptUpdateNotice.style.marginBottom = marginBot;
					this.hideUpdateMessage = true;
				};
			}
			window.scriptEdit.newSettings.value.updateNotice = false;
		};

		static showScriptUpdateDiff(this: CrmEditPage) {
			var oldScript = (this.item as CRM.ScriptNode).value.oldScript;
			var newScript = (this.item as CRM.ScriptNode).value.script;
			const chooseDialog = window.doc.externalEditorChooseFile;
			chooseDialog.init(oldScript, newScript, (chosenScript: string) => {
				if (window.app.storageLocal.upgradeErrors) {
					delete window.app.storageLocal.upgradeErrors[this.item.id];
				}
				const editor = window.scriptEdit.editorManager.editor;
				if (!window.scriptEdit.editorManager.isDiff(editor)) {
					editor.setValue(chosenScript);
				}
				setTimeout(() => {
					this.hideUpdateMergeDialog();
				}, 250);
				browserAPI.storage.local.set({
					upgradeErrors: window.app.storageLocal.upgradeErrors || {}
				} as any);
			}, true, window.app.storageLocal.upgradeErrors && window.app.storageLocal.upgradeErrors[this.item.id]);
			window.externalEditor.showMergeDialog(oldScript, newScript);
			chooseDialog.open();
		};

		static getInstallDate(this: CrmEditPage) {
			if (window.Intl && typeof window.Intl === 'object' && this.nodeInfo &&
				this.nodeInfo.installDate) {
					const format = (new Date(2016, 1, 13).toLocaleDateString() === '13-2-2016' ? 'eu' : 'na');
					let date;
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
			$(this.$$('.popupCont')).click(function(e) {
				e.stopPropagation();
			});
			window.onExists('app').then(() => {
				this._backdropEl = window.app.$$('.backdropCont');
				window.crmEditPage = this;
				this.isLink = this.isMenu = this.isScript = this.isDivider = false;

				this.$.nodeInfoVersion.addEventListener('input', () => {
					this.item.nodeInfo.version = this.$.nodeInfoVersion.innerText.length > 0 ?
						this.$.nodeInfoVersion.innerText : '1.0';
				});
			});
		};
		
		static init(this: CrmEditPage) {
			const valueStorer: {
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
				this.scriptItem = node as CRM.ScriptNode;
				valueStorer.isLink = valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
			} else if ((valueStorer.isLink = node.type === 'link')) {
				this.linkItem = node as CRM.LinkNode;
				valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
			} else if ((valueStorer.isStylesheet = node.type === 'stylesheet')) {
				this.stylesheetItem = node as CRM.StylesheetNode;
				valueStorer.isMenu = valueStorer.isDivider = false;
			} else if ((valueStorer.isMenu = node.type === 'menu')) {
				this.menuItem = node as CRM.MenuNode;
				valueStorer.isDivider = false;
			} else {
				valueStorer.isDivider = true;
				this.dividerItem = node as CRM.DividerNode;

			}
			setTimeout(() => {
				window.app.show = true;
				this.isScript = valueStorer.isScript;
				this.isLink = valueStorer.isLink;
				this.isMenu = valueStorer.isMenu;
				this.isDivider = valueStorer.isDivider;
				this.isStylesheet = valueStorer.isStylesheet;
				const page = this.shadowRoot.querySelector('#editPageCont > :not([hidden])') as EditPage;
				page.init.apply(page);
				this._animateIn();
			}, 300);
		}
	}

	if (window.objectify) {
		window.register(CEP);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(CEP);
		});
	}
}

export type CrmEditPage = Polymer.El<'crm-edit-page',
	typeof CrmEditPageElement.CEP & typeof CrmEditPageElement.crmEditPageProperties
>;