import { I18NKeys } from '../../../_locales/i18n-keys.js';
import { CRMWindow } from '../../defs/crm-window.js';
import { CrmApp } from './crm-app';
import { onExistsChain } from '../../../js/shared.js';

declare const window: CRMWindow;

export class CRMAppPageDemo {
	constructor(private _parent: CrmApp) { }
	public get parent() {
		return this._parent;
	}
	private _active: boolean = false;
	private _root: HTMLElement = null;
	private _listeners: {
		event: string;
		handler: EventListener;
	}[] = [];
	private _setContentTypeClasses(el: HTMLElement, node: CRM.Node) {
		const contentTypes = node.onContentTypes;
		for (let i = 0; i < contentTypes.length; i++) {
			contentTypes[i] && el.classList.add(`contentType${i}`);
		}
	}
	private async _editNodeFromClick(node: CRM.Node) {
		if (window.app.props.item) {
			window.app.$.messageToast.text = await this.parent.__prom(I18NKeys.crmApp.code.alreadyEditingNode);
			window.app.$.messageToast.show();
		}
		else {
			const elements = window.app.editCRM.shadowRoot.querySelectorAll('edit-crm-item');
			for (let i = 0; i < elements.length; i++) {
				const element = elements[i];
				if (element.item && element.item.id && element.item.id === node.id) {
					element.openEditPage();
					break;
				}
			}
		}
	}
	private _genDividerNode(node: CRM.DividerNode) {
		return this.parent.util.createElement('div', {
			classes: ['contextMenuDivider'],
			props: {
				title: node.name
			},
			onclick: () => {
				if (window.app.storageLocal.editCRMInRM) {
					this._editNodeFromClick(node);
				}
			}
		});
	}
	private _genLinkNode(node: CRM.LinkNode) {
		return this.parent.util.createElement('div', {
			classes: ['contextMenuLink'],
			onclick: () => {
				if (window.app.storageLocal.editCRMInRM) {
					this._editNodeFromClick(node);
				}
				else {
					node.value.forEach((link) => {
						window.open(link.url, '_blank');
					});
				}
			},
			props: {
				title: `Link node ${node.name}`
			}
		}, [
				this.parent.util.createElement('div', {
					classes: ['contextMenuLinkText']
				}, [node.name])
			]);
	}
	private _genScriptNode(node: CRM.ScriptNode) {
		return this.parent.util.createElement('div', {
			classes: ['contextMenuScript'],
			onclick: async () => {
				if (window.app.storageLocal.editCRMInRM) {
					this._editNodeFromClick(node);
				}
				else {
					window.app.$.messageToast.text = await this.parent.__prom(I18NKeys.crmApp.code.wouldExecuteScript);
					window.app.$.messageToast.show();
				}
			},
			props: {
				title: `Script node ${node.name}`
			}
		}, [
				this.parent.util.createElement('div', {
					classes: ['contextMenuScriptText']
				}, [node.name])
			]);
	}
	private _genStylesheetNode(node: CRM.StylesheetNode) {
		return this.parent.util.createElement('div', {
			classes: ['contextMenuStylesheet'],
			onclick: async () => {
				if (window.app.storageLocal.editCRMInRM) {
					this._editNodeFromClick(node);
				}
				else {
					window.app.$.messageToast.text = await this.parent.__prom(I18NKeys.crmApp.code.wouldExecuteStylesheet);
					window.app.$.messageToast.show();
				}
			},
			props: {
				title: `Stylesheet node ${node.name}`
			}
		}, [
				this.parent.util.createElement('div', {
					classes: ['contextMenuStylesheetText']
				}, [node.name])
			]);
	}
	private _genMenuNode(node: CRM.MenuNode) {
		let timer: number = null;
		let thisEl: HTMLElement = null;
		let container: HTMLElement = null;
		let childrenContainer: HTMLElement = null;
		return this.parent.util.createElement('div', {
			classes: ['contextMenuMenu'],
			ref(el) {
				thisEl = el;
			},
			onclick: async () => {
				if (window.app.storageLocal.editCRMInRM) {
					this._editNodeFromClick(node);
				}
				else {
					window.app.$.messageToast.text = await this.parent.__prom(
						I18NKeys.crmApp.code.wouldExecuteStylesheet);
					thisEl.parentElement.classList.add('forcedVisible');
					timer && window.clearTimeout(timer);
					timer = window.setTimeout(() => {
						thisEl.parentElement.classList.remove('forcedVisible');
						childrenContainer.classList.add('hidden');
						container.classList.remove('hover');
						timer = null;
					}, 3000);
				}
			},
			onhover(_el, e) {
				if (!thisEl.parentElement.classList.contains('forcedVisible')) {
					childrenContainer.classList.remove('hidden');
					container.classList.add('hover');
					e.stopPropagation();
				}
			},
			onblur(_el, e) {
				if (!thisEl.parentElement.classList.contains('forcedVisible')) {
					childrenContainer.classList.add('hidden');
					container.classList.remove('hover');
					e.stopPropagation();
				}
			},
			props: {
				title: `Menu node ${node.name}`
			}
		}, [
				this.parent.util.createElement('div', {
					classes: ['contextMenuMenuContainer'],
					ref(_container) {
						container = _container;
					}
				}, [
						this.parent.util.createElement('div', {
							classes: ['contextMenuMenuText']
						}, [node.name]),
						this.parent.util.createElement('div', {
							classes: ['contextMenuMenuArrow']
						}, [
								this.parent.util.createSVG('svg', {
									classes: ['contextMenuMenuArrowImage'],
									props: {
										width: '48',
										height: '48',
										viewBox: '0 0 48 48'
									}
								}, [
										this.parent.util.createSVG('path', {
											props: {
												d: 'M16 10v28l22-14z'
											}
										})
									])
							])
					]),
				this.parent.util.createElement('div', {
					classes: ['contextMenuMenuSubmenu',
						'contextMenuMenuChildren', 'hidden'],
					ref(el) {
						childrenContainer = el;
					}
				}, (node.children || []).map(childNode => this._genNode(childNode)))
			]);
	}
	private _genNodeElement(node: CRM.Node) {
		switch (node.type) {
			case 'divider':
				return this._genDividerNode(node);
			case 'link':
				return this._genLinkNode(node);
			case 'script':
				return this._genScriptNode(node);
			case 'stylesheet':
				return this._genStylesheetNode(node);
			case 'menu':
				return this._genMenuNode(node);
		}
	}
	private _genNode(node: CRM.Node): HTMLElement {
		const el = this._genNodeElement(node);
		el.classList.add('contextMenuNode');
		if (window.app.storageLocal.editCRMInRM) {
			el.classList.add('clickable');
		}
		this._setContentTypeClasses(el, node);
		return el;
	}
	private _genMenu(): HTMLElement {
		const root = document.createElement('div');
		root.classList.add('contextMenuRoot', 'contextMenuMenuSubmenu', 'rootHidden');
		const crm = window.app.settings.crm;
		for (const node of crm) {
			root.appendChild(this._genNode(node));
		}
		return root;
	}
	private _setAllContentTypeClasses(el: HTMLElement, op: 'add' | 'remove') {
		const arr: [undefined, undefined, undefined, undefined, undefined, undefined] = [
			undefined, undefined, undefined, undefined, undefined, undefined
		];
		el.classList[op](...arr.map((_item: any, i: number) => `hidden${i}`));
		el.classList[op]('rootHidden');
	}
	private _setMenuPosition(menu: HTMLElement, e: MouseEvent) {
		menu.style.left = `${e.clientX}px`;
		menu.classList.remove('rootHidden');
		const bcr = menu.getBoundingClientRect();
		menu.classList.add('rootHidden');
		if (window.innerHeight > bcr.height + e.clientY) {
			menu.style.top = `${e.clientY}px`;
		}
		else {
			menu.style.top = `${e.clientY - bcr.height}px`;
		}
	}
	private _showMenu(menu: HTMLElement, e: MouseEvent) {
		this._setMenuPosition(menu, e);
		if (window.app.util.findElementWithId(e, 'mainCont')) {
			//Get the current content type
			for (let i = 0; i < 6; i++) {
				if (window.app.crmTypes[i]) {
					menu.classList.remove(`hidden${i}`);
				}
			}
			menu.classList.remove('rootHidden');
		}
		else {
			this._setAllContentTypeClasses(menu, 'remove');
		}
	}
	private _listen(event: string, handler: EventListener) {
		window.addEventListener(event, handler);
		this._listeners.push({
			event, handler
		});
	}
	private _setListeners(menu: HTMLElement) {
		this._listen('contextmenu', (e: MouseEvent) => {
			e.preventDefault();
			this._showMenu(menu, e as any);
		});
		this._listen('click', () => {
			this._setAllContentTypeClasses(menu, 'add');
		});
		this._listen('scroll', () => {
			this._setAllContentTypeClasses(menu, 'add');
		});
	}
	private _unsetListeners() {
		this._listeners.forEach(({ event, handler }) => {
			window.removeEventListener(event, handler);
		});
	}
	private _enable() {
		this._root = this._genMenu();
		this._setListeners(this._root);
		this._setAllContentTypeClasses(this._root, 'add');
		document.body.appendChild(this._root);
	}
	private _disable() {
		this._root.remove();
		this._unsetListeners();
		this._active = false;
	}
	async create() {
		if (this._active) {
			this._disable();
		}
		if (!window.app.storageLocal.CRMOnPage) {
			return;
		}
		await onExistsChain(window, 'app', 'settings', 'crm');
		this._active = true;
		this._enable();
	}
}
