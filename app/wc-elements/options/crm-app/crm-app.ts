/// <reference path="../../defs/wc-elements.d.ts" />

import { ConfigurableWebComponent, Props, config, bindToClass, ComplexType } from '../../../modules/wclib/build/es/wclib.js';
import { BrowserAPI, browserAPI } from '../../../js/polyfills/browser.js';
import { registerAnimatePolyfill } from './registerAnimatePolyfill.js';
import { setTransform, onExistsChain } from '../../../js/shared.js';
import { CrmAppIDMap, CrmAppClassMap } from './crm-app-querymap';
import { CRMAppCRMFunctions } from './crm-app-crm-functions.js';
import { ResolvablePromise, waitFor } from '../../utils.js';
import { I18NKeys } from '../../../_locales/i18n-keys.js';
import { CRMAppListeners } from './crm-app-listeners.js';
import { CRMAppTemplates } from './crm-app-templates.js';
import { CRMAppUploading } from './crm-app-uploading.js';
import { CRMAppPageDemo } from './crm-app-page-demo.js';
import { calc } from '../../lib/polyfills/calc.js';
import { CRMWindow } from '../../defs/crm-window';
import { CRMAppSetup } from './crm-app-setup.js';
import { CrmAppHTML } from './crm-app.html.js';
import { CRMAppUtil } from './crm-app-util.js';
import { CrmAppCSS } from './crm-app.css.js';

export interface CrmAppWindow {
	app: CrmApp;
	consoleInfo(): void;
	getLocalFormat(): void;
	getSyncFormat(): void;
	getCRMFormat(): void;
	upload(): void;
	getChanges(): void;
	checkFormat(): void;
	uploadIfCorrect(): void;
}

declare const window: CRMWindow;

type TypeCheckErrors = {
	err: string;
	storageType?: 'local'|'sync';
}[];

type TypeCheckTypes = 'string' | 'function' | '' | 'object' | 'array' | 'boolean';

interface TypeCheckConfig {
	val: string;
	type: TypeCheckTypes | TypeCheckTypes[];
	optional?: boolean;
	forChildren?: {
		val: string;
		type: TypeCheckTypes | TypeCheckTypes[];
		optional?: boolean;
	}[];
	dependency?: string;
	min?: number;
	max?: number;
}

interface JQContextMenuObj {
	name: string;
	callback(): void;

	type?: 'checkbox';
	selected?: boolean;
	items?: {
		[key: number]: JQContextMenuItem
	};
}

type JQContextMenuItem = JQContextMenuObj | string;

export interface JQueryContextMenu extends JQueryStatic {
	contextMenu(settings: {
		selector: string;
		items: JQContextMenuItem[];
	} | 'destroy'): void;
	bez(curve: number[]): string;
}

export type AddedPermissionsTabContainerEl = any; //TODO:
export type CodeSettingsDialogEl = any; //TODO:
export type ScriptUpdatesToastEl = any; //TODO:
export type ChooseFileDialogEl = any; //TODO:

@config({
	is: 'crm-app',
	css: CrmAppCSS,
	html: CrmAppHTML
})
export class CrmApp extends ConfigurableWebComponent<{
	IDS: CrmAppIDMap;
	CLASSES: CrmAppClassMap;
}, {
	crmTypeChanged: {
		args: [];
	}
}> {
	props = Props.define(this, { 
		reflect: {
			item: {
				type: ComplexType<CRM.Node>(),
				value: null
			}
		}
	});

	editCRM: any; //TODO:

	settings: CRM.SettingsStorage;

	onSettingsReadyCallbacks: {
		callback: Function;
		thisElement: HTMLElement;
		params: any[]
	}[] = [];

	crmTypes: CRM.ContentTypes;

	constructor() {
		super();
		window.app = this;
		registerAnimatePolyfill();
	}

	_log: any[] = [];

	/**
	 * The item to show, if it is a script
	 */
	scriptItem: CRM.ScriptNode;

	/**
	 * The item to show, if it is a stylesheet
	 */
	stylesheetItem: CRM.StylesheetNode;

	/**
	 * The last-used unique ID
	 */
	latestId: CRM.GenericNodeId = -1 as CRM.GenericNodeId;

	/**
	 * The value of the storage.local
	 */
	storageLocal: CRM.StorageLocal;

	/**
	 * A copy of the storage.local to compare when calling upload
	 */
	storageLocalCopy: CRM.StorageLocal;

	/**
	 * A copy of the settings to compare when calling upload
	 */
	settingsCopy: CRM.SettingsStorage;

	/**
	 * The nodes in an object where the key is the ID and the
	 * value is the node
	 */
	nodesById: CRMStore = new Map();

	/**
	 * The column index of the "shadow" node, if any
	 */
	shadowStart: number;

	/**
	 * The global variables for the jsLint linter
	 */
	jsLintGlobals: string[] = [];

	/**
	 * The tern server used for key bindings
	 */
	ternServer: Tern.ServerInstance;

	/**
	 * The monaco theme style element
	 */
	monacoStyleElement: HTMLStyleElement = null;

	settingsJsonLength = new ResolvablePromise<number>();

	globalExcludes = new ResolvablePromise<string[]>();

	codeSettingsNoItems = new ResolvablePromise<boolean>();

	scriptPermissions = new ResolvablePromise<{
		name: string;
		toggled: boolean;
		required: boolean;
		description: string;
	}[]>()

	codeSettings = new ResolvablePromise<{
		key: keyof CRM.Options;
		value: CRM.Options[keyof CRM.Options]
	}[]>();

	requestedPermissions = new ResolvablePromise<{
		name: string;
		description: string;
		toggled: boolean;
	}[]>();

	requestedPermissionsOther = new ResolvablePromise<{
		name: string;
		description: string;
		toggled: boolean;
	}[]>();

	addedPermissions = new ResolvablePromise<{
		node: number;
		permissions: Array<string>;
	}[]>();

	keyBindingsSettings = new ResolvablePromise<{
		name: string;
		defaultKey: string;
		monacoKey: string;
		storageKey: keyof CRM.KeyBindings;
	}[]>();

	getKeyBindingValue(binding: {
		name: string;
		defaultKey: string;
		monacoKey: string;
		storageKey: keyof CRM.KeyBindings;
	}) {
		return (window.app.settings && 
			window.app.settings.editor.keyBindings[binding.storageKey]) ||
				binding.defaultKey;
	}
	
	isDemo() {
		return location.href.indexOf('demo') > -1;
	}

	private _onIsTest() {
		return new Promise((resolve) => {
			if (location.href.indexOf('test') > -1) {
				resolve(null);
			} else {
				if (window.onIsTest === true) {
					resolve(null);
				} else {
					window.onIsTest = () => {
						resolve(null);
					};
				}
			}
		})
	}

	/**
	 * Shows the crm-edit-page element
	 */
	public showEditPage() {
		this.$.editPage.style.display = 'none';
	}

	/**
	 * Hides the crm-edit-page element
	 */
	public hideEditPage() {
		this.$.editPage.style.display = 'block';
	}

	@bindToClass
	_getPageTitle(): string {
		return this.isDemo() ?
			'Demo, actual right-click menu does NOT work in demo' :
			this.__(I18NKeys.generic.appTitle);
	}
	
	getChromeVersion() {
		if (BrowserAPI.getBrowser() === 'chrome') {
			return parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);	
		}
		return 1000;
	}

	generateCodeOptionsArray<T extends CRM.Options>(settings: T|string): {
		key: keyof T;
		value: T[keyof T]
	}[] {
		if (!settings || typeof settings === 'string') {
			return [];
		}
		return Object.getOwnPropertyNames(settings).map((key: keyof T) => {
			if (key === '$schema') {
				return null;
			}
			return {
				key: key,
				value: JSON.parse(JSON.stringify(settings[key]))
			};
		}).filter(item => item !== null).map(({ key, value }) => {
			if (value.type === 'choice') {
				//If nothing is selected, select the first item
				const choice = value as CRM.OptionChoice;
				if (typeof choice.selected !== 'number' ||
					choice.selected > choice.values.length ||
					choice.selected < 0) {
						choice.selected = 0;
					}
			}
			return {
				key,
				value
			}
		});
	}

	@bindToClass
	_formatJSONLength(num: number): string {
		const split = this._reverseString(num.toString()).match(/[0-9]{1,3}/g);
		return this._reverseString(split.join(','));
	};

	@bindToClass
	_supportsStorageSync() {
		return 'sync' in BrowserAPI.getSrc().storage && 
			'get' in BrowserAPI.getSrc().storage.sync;
	}

	@bindToClass
	_getCRMInRMDisabledReason() {
		return waitFor( (async () => {
			return await this.__prom(I18NKeys.crmApp.options.chromeLow, 
				~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent) ? 
					(~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] + '') : 
						await this.__prom(I18NKeys.crmApp.options.notChrome));
		})(), `{{${I18NKeys.crmApp.options.chromeLow}}}`);
	}

	@bindToClass
	_getStorageSyncDisabledReason() {
		if (!this._supportsStorageSync()) {
			return this.__(I18NKeys.crmApp.options.useStorageSyncDisabledUnavailable);
		} else {
			return this.__(I18NKeys.crmApp.options.useStorageSyncDisabledTooBig);
		}
	}

	@bindToClass
	_getSettingsJsonLengthColor(settingsJsonLength: number): string {
		let red;
		let green;
		if (settingsJsonLength <= 51200) {
			//Green to yellow, increase red
			green = 255;
			red = (settingsJsonLength / 51200) * 255;
		} else {
			//Yellow to red, reduce green
			red = 255;
			green = 255 - (((settingsJsonLength - 51200) / 51200) * 255);
		}

		//Darken a bit
		red = Math.floor(red * 0.7);
		green = Math.floor(green * 0.7);
		return 'color: rgb(' + red + ', ' + green + ', 0);';
	};

	private _findScriptsInSubtree(toFind: CRM.Node, container: CRM.Node[]) {
		if (toFind.type === 'script') {
			container.push(toFind);
		} else if (toFind.children) {
			for (let i = 0; i < toFind.children.length; i++) {
				this._findScriptsInSubtree(toFind.children[i], container);
			}
		}
	};

	private async _runDialogsForImportedScripts(nodesToAdd: CRM.Node[], dialogs: CRM.ScriptNode[]) {
		if (dialogs[0]) {
			const script = dialogs.splice(0, 1)[0];
			await window.scriptEdit.openPermissionsDialog(script);
			await this._runDialogsForImportedScripts(nodesToAdd, dialogs);
		} else {
			this.addImportedNodes(nodesToAdd);
		}
	};

	addImportedNodes(nodesToAdd: CRM.Node[]): boolean {
		if (!nodesToAdd[0]) {
			return false;
		}
		const toAdd = nodesToAdd.splice(0, 1)[0];
		this.util.treeForEach(toAdd, (node) => {
			node.id = this.generateItemId();
			node.nodeInfo.source = 'local';
		});

		this.crm.add(toAdd);
		const scripts: CRM.ScriptNode[] = [];
		this._findScriptsInSubtree(toAdd, scripts);
		this._runDialogsForImportedScripts(nodesToAdd, scripts);
		return true;
	};

	private _reverseString(string: string): string {
		return string.split('').reverse().join('');
	};

	private _genRequestPermissionsHandler(overlayContainer: {
		overlay: HTMLPaperDialogElement
	}, toRequest: CRM.Permission[]) {
		const fn = () => {
			let el: HTMLElement & {
				animation?: {
					reverse?(): void;
				}
			}, svg;
			const overlay = overlayContainer.overlay;
			overlay.style.maxHeight = 'initial!important';
			overlay.style.top = 'initial!important';
			overlay.removeEventListener('iron-overlay-opened', fn);
			$(window.app.util.getQuerySlot()(overlay, '.requestPermissionsShowBot')).off('click').on('click', function (this: HTMLElement) {
				el = $(this).parent().parent().children('.requestPermissionsPermissionBotCont')[0];
				svg = $(this).find('.requestPermissionsSvg')[0];
				if ((svg as any).__rotated) {
					setTransform(svg, 'rotate(90deg)');
					(svg as any).rotated = false;
				} else {
					setTransform(svg, 'rotate(270deg)');
					(svg as any).rotated = true;
				}
				if (el.animation && el.animation.reverse) {
					el.animation.reverse();
				} else {
					el.animation = el.animate([{
						height: '0'
					}, {
						height: el.scrollHeight + 'px'
					}], {
						duration: 250,
						easing: 'linear',
						fill: 'both'
					});
				}
			});
			$(this.$('#requestPermissionsShowOther')).off('click').on('click', function (this: HTMLElement) {
				const showHideSvg = this;
				const otherPermissions = $(this).parent().parent().parent().children('#requestPermissionsOther')[0];
				if (!otherPermissions.style.height || otherPermissions.style.height === '0px') {
					$(otherPermissions).animate({
						height: otherPermissions.scrollHeight + 'px'
					}, 350, function () {
						(<unknown>showHideSvg.children[0] as HTMLElement).style.display = 'none';
						(<unknown>showHideSvg.children[1] as HTMLElement).style.display = 'block';
					});
				} else {
					$(otherPermissions).animate({
						height: 0
					}, 350, function () {
						(<unknown>showHideSvg.children[0] as HTMLElement).style.display = 'block';
						(<unknown>showHideSvg.children[1] as HTMLElement).style.display = 'none';
					});
				}
			});

			let permission: string;
			$(this.$('.requestPermissionButton')).off('click').on('click', function (this: HTMLPaperCheckboxElement) {
				permission = this.previousElementSibling.previousElementSibling.textContent;
				const slider = this;
				if (this.checked) {
					try {
						browserAPI.permissions.request({
							permissions: [permission as _browser.permissions.Permission]
						}).then((accepted) => {
							if (!accepted) {
								//The user didn't accept, don't pretend it's active when it's not, turn it off
								slider.checked = false;
							} else {
								//Accepted, remove from to-request permissions
								browserAPI.storage.local.get<CRM.StorageLocal>().then((e) => {
									const permissionsToRequest = e.requestPermissions;
									permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
									browserAPI.storage.local.set({
										requestPermissions: permissionsToRequest
									});
								});
							}
						});
					} catch (e) {
						//Accepted, remove from to-request permissions
						browserAPI.storage.local.get<CRM.StorageLocal>().then((e) => {
							const permissionsToRequest = e.requestPermissions;
							permissionsToRequest.splice(permissionsToRequest.indexOf(permission), 1);
							browserAPI.storage.local.set({
								requestPermissions: permissionsToRequest
							});
						});
					}
				} else {
					browserAPI.permissions.remove({
						permissions: [permission as _browser.permissions.Permission]
					}).then((removed) => {
						if (!removed) {
							//It didn't get removed
							slider.checked = true;
						}
					});
				}
			});

			$(this.$('#requestPermissionsAcceptAll')).off('click').on('click', function () {
				browserAPI.permissions.request({
					permissions: toRequest as _browser.permissions.Permission[]
				}).then((accepted) => {
					if (accepted) {
						browserAPI.storage.local.set({
							requestPermissions: []
						});
						$('.requestPermissionButton.required').each(function (this: HTMLPaperCheckboxElement) {
							this.checked = true;
						});
					}
				});
			});
		}
		return fn;
	}

	/**
	 * Shows the user a dialog and asks them to allow/deny those permissions
	 */
	async requestPermissions(toRequest: CRM.Permission[],
		force: boolean = false) {
		let i;
		let index;
		const allPermissions = this.templates.getPermissions();
		for (i = 0; i < toRequest.length; i++) {
			index = allPermissions.indexOf(toRequest[i]);
			if (index === -1) {
				toRequest.splice(index, 1);
				i--;
			} else {
				allPermissions.splice(index, 1);
			}
		}

		browserAPI.storage.local.set({
			requestPermissions: toRequest
		});

		if (toRequest.length > 0 || force) {
			const allowed = browserAPI.permissions ? await browserAPI.permissions.getAll() : {
				permissions: []
			};
			const requested: {
				name: string;
				description: string;
				toggled: boolean;
			}[] = [];
			for (i = 0; i < toRequest.length; i++) {
				requested.push({
					name: toRequest[i],
					description: await this.templates.getPermissionDescription(toRequest[i]),
					toggled: false
				});
			}

			const other: {
				name: string;
				description: string;
				toggled: boolean;
			}[] = [];
			for (i = 0; i < allPermissions.length; i++) {
				other.push({
					name: allPermissions[i],
					description: await this.templates.getPermissionDescription(allPermissions[i]),
					toggled: (allowed.permissions.indexOf((allPermissions as _browser.permissions.Permission[])[i]) > -1)
				});
			}
			const requestPermissionsOther = this.$('#requestPermissionsOther');

			const overlayContainer: {
				overlay: HTMLPaperDialogElement;
			} = {
				overlay: null
			};

			const handler = this._genRequestPermissionsHandler(overlayContainer, toRequest);

			const interval = window.setInterval(() => {
				try {
					const centerer = window.doc.requestPermissionsCenterer as any; //TODO: CenterElement
					const overlay = overlayContainer.overlay = 
						window.app.util.getQuerySlot()(centerer)[0] as HTMLPaperDialogElement;
					if (overlay.open) {
						window.clearInterval(interval);
						const innerOverlay = window.app.util.getQuerySlot()(overlay)[0] as HTMLElement;
						this.requestedPermissions.setValue(requested);
						this.requestedPermissionsOther.setValue(other);
						overlay.addEventListener('iron-overlay-opened', handler);
						setTimeout(function () {
							const requestedPermissionsCont = innerOverlay.querySelector('#requestedPermissionsCont');
							const requestedPermissionsAcceptAll = innerOverlay.querySelector('#requestPermissionsAcceptAll');
							const requestedPermissionsType = innerOverlay.querySelector('.requestPermissionsType');
							if (requested.length === 0) {
								requestedPermissionsCont.style.display = 'none';
								requestPermissionsOther.style.height = (31 * other.length) + 'px';
								requestedPermissionsAcceptAll.style.display = 'none';
								requestedPermissionsType.style.display = 'none';
							} else {
								requestedPermissionsCont.style.display = 'block';
								requestPermissionsOther.style.height = '0';
								requestedPermissionsAcceptAll.style.display = 'block';
								requestedPermissionsType.style.display = 'block';
							}
							overlay.open();
						}, 0);
					}
				} catch (e) {
					//Somehow the element doesn't exist yet
				}
			}, 100);
		}
	};

	initCodeOptions(node: CRM.ScriptNode | CRM.StylesheetNode) {
		this.$.codeSettingsDialog.item = node;
		this.$.codeSettingsNodeName.innerText = node.name;

		this.codeSettings.setValue(this.generateCodeOptionsArray(node.value.options));
		this.codeSettingsNoItems.setValue(this.codeSettings.getValue().length === 0);
		window.setTimeout(() => {
			this.$.codeSettingsDialog.fit();
			Array.prototype.slice.apply(this.$.codeSettingsDialog.querySelectorAll('paper-dropdown-menu'))
				.forEach((el: HTMLPaperDropdownMenuElement) => {
					el.init();
					el.updateSelectedContent();
				});
			this.$.codeSettingsDialog.open();
		}, 250);
	}

	/**
	 * Generates an ID for a node
	 */
	generateItemId() {
		this.latestId = this.latestId || 0 as CRM.GenericNodeId;
		this.latestId++;

		if (this.settings) {
			this.settings.latestId = this.latestId;
			window.app.upload();
		}

		return this.latestId;
	};

	toggleShrinkTitleRibbon() {
		const viewportHeight = window.innerHeight;
		const $settingsCont = $(this.$('#settingsContainer'));
		if (window.app.storageLocal.shrinkTitleRibbon) {
			$(window.doc.editorTitleRibbon).animate({
				fontSize: '100%'
			}, 250);
			$(window.doc.editorCurrentScriptTitle).animate({
				paddingTop: '4px',
				paddingBottom: '4px'
			}, 250);
			$settingsCont.animate({
				height: viewportHeight - 50
			}, 250, function () {
				$settingsCont[0].style.height = calc('100vh - 66px')
			});
			setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(270deg)');

			window.doc.showHideToolsRibbonButton.classList.add('hidden');
		} else {
			$(window.doc.editorTitleRibbon).animate({
				fontSize: '40%'
			}, 250);
			$(window.doc.editorCurrentScriptTitle).animate({
				paddingTop: 0,
				paddingBottom: 0
			}, 250);
			$settingsCont.animate({
				height: viewportHeight - 18
			}, 250, function () {
				$settingsCont[0].style.height = calc('100vh + 29px');
			});
			setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(90deg)');

			window.doc.showHideToolsRibbonButton.classList.remove('hidden');
		}
		window.app.storageLocal.shrinkTitleRibbon = !window.app.storageLocal.shrinkTitleRibbon;
		browserAPI.storage.local.set({
			shrinkTitleRibbon: window.app.storageLocal.shrinkTitleRibbon
		});
	};

	addSettingsReadyCallback(callback: Function, thisElement: HTMLElement, params: any[]) {
		this.onSettingsReadyCallbacks.push({
			callback: callback,
			thisElement: thisElement,
			params: params
		});
	};

	/**
	 * Uploads the settings to chrome.storage
	 */
	upload(force: boolean = false) {
		this.uploading.upload(force);
		(async () => {
			await onExistsChain(window, 'app', 'settings', 'crm');
			this.updateCrmRepresentation(window.app.settings.crm);
		})();
	}

	updateEditorZoom() {
		const prevStyle = document.getElementById('editorZoomStyle');
		prevStyle && prevStyle.remove();
		const styleEl = document.createElement('style');
		styleEl.id = 'editorZoomStyle';
		styleEl.innerText = `.CodeMirror, .CodeMirror-focused {
			font-size: ${1.25 * ~~window.app.settings.editor.zoom}%!important;
		}`;
		document.head.appendChild(styleEl);
	};

	private _assertCRMNodeShape(node: CRM.Node): boolean {
		let changed = false;
		if (node.type !== 'menu') {
			return false;
		}
		if (!node.children) {
			node.children = [];
			changed = true;
		}
		for (let i = node.children.length - 1; i >= 0; i--) {
			if (!node.children[i]) {
				// Remove dead children
				node.children.splice(i, 1);
				changed = true;
			}
		}
		for (const child of node.children) {
			// Put the function first to make sure it's executed
			// even when changed is true
			changed = this._assertCRMNodeShape(child) || changed;
		}
		return changed;
	}

	private _assertCRMShape(crm: CRM.Tree) {
		let changed = false;
		for (let i = 0; i < crm.length; i++) {
			// Put the function first to make sure it's executed
			// even when changed is true
			changed = this._assertCRMNodeShape(crm[i]) || changed;
		}
		if (changed) {
			window.app.upload();
		}
	}

	updateCrmRepresentation(crm: CRM.Tree) {
		this._assertCRMShape(crm);
		this.setup.orderNodesById(crm);
		this.crm.buildNodePaths(crm);
	}

	setLocal<K extends keyof CRM.StorageLocal>(key: K, value: CRM.StorageLocal[K]) {
		const obj = {
			[key]: value
		};

		browserAPI.storage.local.set(obj as any);
		browserAPI.storage.local.get<CRM.StorageLocal>().then((storageLocal) => {
			this.storageLocal = storageLocal;
			this.upload();

			if (key === 'CRMOnPage' || key === 'editCRMInRM') {
				(window.doc.editCRMInRM as any).setCheckboxDisabledValue && //TODO: PaperToggleOption
				(window.doc.editCRMInRM as any).setCheckboxDisabledValue(!storageLocal.CRMOnPage); //TODO: PaperToggleOption
				this.pageDemo.create();
			}
		});
	};

	private _getDialog() {
		switch (window.app.props.item.type) {
			case 'script':
				return window.scriptEdit;
			case 'stylesheet':
				return window.stylesheetEdit;
			case 'divider':
				return window.dividerEdit;
			case 'menu':
				return window.menuEdit;
			case 'link':
				return window.linkEdit;
		}
	}

	async refreshPage() {
		//Reset dialog
		if (window.app.props.item) {
			const dialog = this._getDialog();
			dialog && dialog.cancel();
		}
		window.app.props.item = null;

		//Reset storages
		window.app.settings = window.app.storageLocal = null;
		window.app.settingsCopy = window.app.storageLocalCopy = null;
		if (window.Storages) {
			window.Storages.clearStorages();
			await window.Storages.loadStorages();
		} else {
			await browserAPI.runtime.sendMessage({
				type: '_resetSettings'
			});
		}

		//On a demo or test page right now, use background page to init settings
		await this.setup.setupStorages();

		//Reset checkboxes
		this.setup.initCheckboxes(window.app.storageLocal);
		
		//Reset default links and searchengines
		Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('default-link')).forEach(function (link: any) { //TODO: DefaultLink
			link.reset();
		});

		//Reset regedit part
		window.doc.URISchemeFilePath.value = 'C:\\files\\my_file.exe';
		window.doc.URISchemeSchemeName.value = await this.__prom(I18NKeys.crmApp.uriScheme.example);

		//Hide all open dialogs
		Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('paper-dialog')).forEach((dialog: HTMLPaperDialogElement) => {
			dialog.opened && dialog.close();
		});

		this.upload(true);
		await onExistsChain(window, 'app', 'settings', 'crm');
	};

	private _codeStr(code: string): {
		content: string;
		isCode: true;
	} {
		return {
			content: code,
			isCode: true
		}
	}

	private _logCode(...args: ({
		content: string;
		isCode: true;
	}|string)[]) {
		let currentWord: string = '';
		const logArgs: string[] = [];
		const styleArgs: string[] = [];
		const isEdge = BrowserAPI.getBrowser() === 'edge';
		for (const arg of args) {
			if (typeof arg === 'string') {
				currentWord += arg;
			} else {
				const { content } = arg;
				if (isEdge) {
					currentWord += arg;
				} else {
					logArgs.push(`${currentWord}%c${content}`);
					styleArgs.push('color: grey;font-weight: bold;');
					currentWord = '%c';
					styleArgs.push('color: white; font-weight: regular');
				}
			}
		}
		if (currentWord.length > 0) {
			logArgs.push(currentWord);
		}
		console.log.call(console, ...[logArgs.join(' ')].concat(styleArgs));
	}

	private _getDotValue<T extends {
		[key: string]: T | U
	}, U>(source: T, index: string): U {
		const indexes = index.split('.');
		let currentValue: T | U = source;
		for (let i = 0; i < indexes.length; i++) {
			if (indexes[i] in (currentValue as any)) {
				currentValue = (currentValue as T)[indexes[i]];
			} else {
				return undefined;
			}
		}
		return currentValue as U;
	}

	private dependencyMet(data: TypeCheckConfig, optionals: {
		[key: string]: any;
		[key: number]: any;
	}): boolean {
		if (data.dependency && !optionals[data.dependency]) {
			optionals[data.val] = false;
			return false;
		}
		return true;
	}

	private _isDefined(data: TypeCheckConfig, value: any, optionals: {
		[key: string]: any;
		[key: number]: any;
	}, errors: TypeCheckErrors): boolean | 'continue' {
		//Check if it's defined
		if (value === undefined || value === null) {
			if (data.optional) {
				optionals[data.val] = false;
				return 'continue';
			} else {
				errors.push({
					err: `Value for ${data.val} is not set`
				});
				return false;
			}
		}
		return true;
	}

	private _typesMatch(data: TypeCheckConfig, value: any, errors: TypeCheckErrors): string {
		const types = Array.isArray(data.type) ? data.type : [data.type];
		for (let i = 0; i < types.length; i++) {
			const type = types[i];
			if (type === 'array') {
				if (typeof value === 'object' && Array.isArray(value)) {
					return type;
				}
			}
			if (typeof value === type) {
				return type;
			}
		}
		errors.push({
			err: `Value for ${data.val} is not of type ${types.join(' or ')}`
		});
		return null;
	}

	private _checkNumberConstraints(data: TypeCheckConfig, value: number,
		errors: TypeCheckErrors): boolean {
			if (data.min !== undefined) {
				if (data.min > value) {
					errors.push({
						err: `Value for ${data.val} is smaller than ${data.min}`
					});
					return false;
				}
			}
			if (data.max !== undefined) {
				if (data.max < value) {
					errors.push({
						err: `Value for ${data.val} is bigger than ${data.max}`
					});
					return false;
				}
			}
			return true;
		}

		private _checkArrayChildType(data: TypeCheckConfig, value: any, forChild: {
		val: string;
		type: TypeCheckTypes | TypeCheckTypes[];
		optional?: boolean;
	}, errors: TypeCheckErrors): boolean {
		const types = Array.isArray(forChild.type) ? forChild.type : [forChild.type]
		for (let i = 0; i < types.length; i++) {
			const type = types[i];
			if (type === 'array') {
				if (Array.isArray(value)) {
					return true;
				}
			} else if (typeof value === type) {
				return true;
			}
		}
		errors.push({
			err: `For not all values in the array ${data.val} is the property ${
				forChild.val} of type ${types.join(' or ')}`
		});
		return false;
	}

	private _checkArrayChildrenConstraints<T extends {
		[key: string]: any;
	}>(data: TypeCheckConfig, value: T[], errors: TypeCheckErrors): boolean {
		for (let i = 0; i < value.length; i++) {
			for (let j = 0; j < data.forChildren.length; j++) {
				const forChild = data.forChildren[j];
				const childValue = value[i][forChild.val];

				//Check if it's defined
				if (childValue === undefined || childValue === null) {
					if (!forChild.optional) {
						errors.push({
							err: `For not all values in the array ${data.val} is the property ${forChild.val} defined`
						});
						return false;
					}
				} else if (!this._checkArrayChildType(data, childValue, forChild, errors)) {
					return false;
				}
			}
		}
		return true;
	}

	private _checkConstraints(data: TypeCheckConfig, value: any, errors: TypeCheckErrors): boolean {
		if (typeof value === 'number') {
			return this._checkNumberConstraints(data, value, errors);
		}
		if (Array.isArray(value) && data.forChildren) {
			return this._checkArrayChildrenConstraints(data, value, errors);
		}
		return true;
	}

	private typeCheck(source: any, toCheck: TypeCheckConfig[], errors: TypeCheckErrors) {
		const optionals: {
			[key: string]: any;
			[key: number]: any;
		} = {};
		for (let i = 0; i < toCheck.length; i++) {
			const config = toCheck[i];

			//Skip if dependency not met
			if (!this.dependencyMet(config, optionals)) {
				continue;
			}

			const value = this._getDotValue(source as any, config.val);
			//Check if it's defined
			const isDefined = this._isDefined(config, value, optionals, errors);
			if (isDefined === true) {
				const matchedType = this._typesMatch(config, value, errors);
				if (matchedType) {
					optionals[config.val] = true;
					this._checkConstraints(config, value, errors);
					continue;
				}
			} else if (isDefined === 'continue') {
				continue;
			}
			return false;
		}
		return true;
	};

	private _checkLocalFormat() {
		const storage = window.app.storageLocal;
		const errors: TypeCheckErrors = [];
		this.typeCheck(storage, [{
			val: 'libraries',
			type: 'array',
			forChildren: [{
				val: 'code',
				type: 'string'
			}, {
				val: 'name',
				type: 'string',
				optional: true
			}, {
				val: 'url',
				type: 'string',
				optional: true
			}, {
				val: 'ts',
				type: 'object'
			}]
		}, {
			val: 'requestPermissions',
			type: 'array'
		}, {
			val: 'selectedCrmType',
			type: 'array',
		}, {
			val: 'jsLintGlobals',
			type: 'array'
		}, {
			val: 'globalExcludes',
			type: 'array'
		}, {
			val: 'resources',
			type: 'object'
		}, {
			val: 'nodeStorage',
			type: 'object'
		}, {
			val: 'resourceKeys',
			type: 'array'
		}, {
			val: 'urlDataPairs',
			type: 'object'
		}, {
			val: 'notFirstTime',
			type: 'boolean'
		}, {
			val: 'lastUpdatedAt',
			type: 'string'
		}, {
			val: 'authorName',
			type: 'string'
		}, {
			val: 'recoverUnsavedData',
			type: 'boolean'
		}, {
			val: 'CRMOnPage',
			type: 'boolean'
		}, {
			val: 'editCRMInRM',
			type: 'boolean'
		}, {
			val: 'useAsUserscriptInstaller',
			type: 'boolean'
		}, {
			val: "useAsUserstylesInstaller",
			type: "boolean"
		}, {
			val: 'hideToolsRibbon',
			type: 'boolean'
		}, {
			val: 'shrinkTitleRibbon',
			type: 'boolean'
		}, {
			val: 'showOptions',
			type: 'boolean'
		}, {
			val: 'catchErrors',
			type: 'boolean'
		}, {
			val: 'useStorageSync',
			type: 'boolean'
		}, {
			val: 'settingsVersionData',
			type: 'object'
		}, {
			val: 'addedPermissions',
			type: 'array',
			forChildren: [{
				val: 'node',
				type: ''
			}, {
				val: 'permissions',
				type: 'array'
			}]
		}, {
			val: 'updatedScripts',
			type: 'array',
			forChildren: [{
				val: 'name',
				type: 'string'
			}, {
				val: 'oldVersion',
				type: 'string'
			}, {
				val: 'newVersion',
				type: 'string'
			}]
		}, {
			val: 'isTransfer',
			type: 'boolean'
		}, {
			val: 'upgradeErrors',
			type: 'object',
			optional: true
		}], errors);
		return errors;
	}

	private _checkSyncFormat() {
		const storage = window.app.settings;
		const errors: TypeCheckErrors = [];
		this.typeCheck(storage, [{
			val: 'errors',
			type: 'object'
		}, {
			val: 'settingsLastUpdatedAt',
			type: '',
		}, {
			val: 'crm',
			type: 'array',
			forChildren: [{
				val: 'type',
				type: 'string'
			}, {
				val: 'index',
				type: '',
				optional: true
			}, {
				val: 'isLocal',
				type: 'boolean'
			}, {
				val: 'permissions',
				type: 'array'
			}, {
				val: 'id',
				type: ''
			}, {
				val: 'path',
				type: 'array'
			}, {
				val: 'name',
				type: 'string'
			}, {
				val: 'nodeInfo',
				type: 'object'
			}, {
				val: 'triggers',
				type: 'array'
			}, {
				val: 'onContentTypes',
				type: 'array'
			}, {
				val: 'showOnSpecified',
				type: 'boolean'
			}]
		}, {
			val: 'latestId',
			type: ''
		}, {
			val: 'rootName',
			type: 'string'
		}, {
			val: 'nodeStorageSync',
			type: 'object'
		}, {
			val: 'editor',
			type: 'object'
		}, {
			val: 'editor.theme',
			type: 'string'
		}, {
			val: 'editor.zoom',
			type: 'string'
		}, {
			val: 'editor.keyBindings',
			type: 'object'
		}, {
			val: 'editor.keyBindings.goToDef',
			type: 'string'
		}, {
			val: 'editor.keyBindings.rename',
			type: 'string'
		}, {
			val: 'editor.cssUnderlineDisabled',
			type: 'boolean'
		}, {
			val: 'editor.disabledMetaDataHighlight',
			type: 'boolean'
		}], errors);
		return errors;
	}

	private _checkFormat() {
		let errors: {
			err: string;
			storageType: 'local'|'sync';
		}[] = [];

		errors = this._checkLocalFormat().map((err) => {
			err.storageType = 'local';
			return err;
		}) as {
			err: string;
			storageType: 'local'|'sync';
		}[];
		errors = errors.concat(this._checkSyncFormat().map((err) => {
			err.storageType = 'sync';
			return err;
		}) as {
			err: string;
			storageType: 'local'|'sync';
		}[]);

		return errors;
	}

	private _setupConsoleInterface() {
		window.consoleInfo = () => {
			this._logCode('Edit local (not synchronized with your google account) settings as follows:');
			this._logCode('	', this._codeStr('window.app.storageLocal.<setting> = <value>;'));
			this._logCode('	For example: ', this._codeStr('window.app.storageLocal.hideToolsRibbon = false;'));
			this._logCode('	To get the type formatting of local settings call ', this._codeStr('window.getLocalFormat();'));
			this._logCode('	To read the current settings just call ', this._codeStr('window.app.storageLocal;'));
			this._logCode('');
			this._logCode('Edit synchronized settings as follows:');
			this._logCode('	', this._codeStr('window.app.settings.<setting> = <value>'));
			this._logCode('	For example: ', this._codeStr('window.app.settings.rootName = "ROOT";'));
			this._logCode('	Or: ', this._codeStr('window.app.settings.editor.theme = "white";'));
			this._logCode('	To get the type formatting of local settings call ', this._codeStr('window.getSyncFormat();'));
			this._logCode('	To read the current settings just call ', this._codeStr('window.app.settings;'));
			this._logCode('');
			this._logCode('Edit the CRM as follows:');
			this._logCode('	', this._codeStr('window.app.settings.crm[<index>].<property> = <value>'));
			this._logCode('	For example: ', this._codeStr('window.app.settings.crm[0].name = "MyName";'));
			this._logCode('	To find the index either call ', this._codeStr('window.app.settings.crm;'), ' or ', this._codeStr('window.getIndexByName("<name>");'));
			this._logCode('	To get the type formatting of a CRM node call ', this._codeStr('window.getCRMFormat();'));
			this._logCode('');
			this._logCode('To force upload any changes you made call ', this._codeStr('window.upload();'));
			this._logCode('To look at the changes that were made call ', this._codeStr('window.getChanges();'));
			this._logCode('To check the format of your changes call ', this._codeStr('window.checkFormat();'));
			this._logCode('To upload changes you made if the format is correct call ', this._codeStr('window.uploadIfCorrect();'));
		};
		window.getLocalFormat = () => {
			this._logCode('Format can be found here https://github.com/SanderRonde/CustomRightClickMenu/blob/polymer-2/tools/definitions/crm.d.ts#L1148');
		};
		window.getSyncFormat = () => {
			this._logCode('Format can be found here https://github.com/SanderRonde/CustomRightClickMenu/blob/polymer-2/tools/definitions/crm.d.ts#L1091');
		};
		window.getCRMFormat = () => {
			this._logCode('Format can be found here https://github.com/SanderRonde/CustomRightClickMenu/blob/polymer-2/tools/definitions/crm.d.ts#L1103');
		};
		window.upload = window.app.upload;
		window.getChanges = () => {
			this._logCode('Here are the changes that have been made. Keep in mind that this includes unuploaded changes the extension made.');
			this._logCode('');
			const {
				hasLocalChanged, 
				haveSettingsChanged, 
				localChanges,
				settingsChanges
			} = this.uploading.getChanges(false);
			if (!hasLocalChanged) {
				this._logCode('No changes to local storage were made');
			} else {
				this._logCode('The following changes to local storage were made');
				for (const change of localChanges) {
					this._logCode('Key ', this._codeStr(change.key), ' had value ', 
						this._codeStr(change.oldValue), ' and was changed to ', 
						this._codeStr(change.newValue));
				}
			}
			this._logCode('');
			if (!haveSettingsChanged) {
				this._logCode('No changes to synced storage were made');
			} else {
				this._logCode('The following changes to synced storage were made');
				for (const change of settingsChanges) {
					this._logCode('Key ', this._codeStr(change.key), ' had value ', 
						this._codeStr(change.oldValue), ' and was changed to ', 
						this._codeStr(change.newValue));
				}
			}
		}
		window.checkFormat = () => {
			const errors = this._checkFormat();
			if (errors.length === 0) {
				this._logCode('Format is correct!');
			} else {
				for (const err of errors) {
					this._logCode('Storage type: ', err.storageType,
						this._codeStr(err.err));
				}
			}
		}
		window.uploadIfCorrect = () => {
			if (this._checkFormat().length === 0) {
				window.app.upload();
				this._logCode('Successfully uploaded');
			} else {
				this._logCode('Did not upload because errors were found.');
			}
		}
	}

	ready() {
		window.app = this;
		window.doc = window.app.$;
		this._setupConsoleInterface();

		browserAPI.runtime.onInstalled.addListener(async (details) => {
			if (details.reason === 'update') {
				//Show a little message
				this.$.messageToast.text = this.__(I18NKeys.crmApp.code.extensionUpdated,
					(await browserAPI.runtime.getManifest()).version);
				this.$.messageToast.show();
			}
		});

		if (typeof localStorage === 'undefined') {
			//Running a test
			browserAPI.runtime.onMessage.addListener((message: any, 
				_sender: _browser.runtime.MessageSender, 
				respond: (response: object) => any) => {
					if (message.type === 'idUpdate') {
						this.latestId = message.latestId;
					}
					respond(null);
				});
		}

		let controlPresses = 0;
		document.body.addEventListener('keyup', (event) => {
			if (event.key === 'Control') {
				controlPresses++;
				window.setTimeout(() => {
					if (controlPresses >= 3) {
						this.listeners._toggleBugReportingTool();
						controlPresses = 0;
					} else {
						if (controlPresses > 0) {
							controlPresses--;
						}
					}
				}, 800);
			}
		});

		this.setup.setupLoadingBar().then(() => {
			this.setup.setupStorages();
		});

		if (this._onIsTest()) {
			var dummyContainer = window.dummyContainer = document.createElement('div');
			dummyContainer.id = 'dummyContainer';
			dummyContainer.style.width = '100vw';
			dummyContainer.style.position = 'fixed';
			dummyContainer.style.top = '0';
			dummyContainer.style.zIndex = '999999999';
			dummyContainer.style.display = 'flex';
			dummyContainer.style.flexDirection = 'row';
			dummyContainer.style.justifyContent = 'space-between';
			document.body.appendChild(dummyContainer);

			var node = document.createElement('style');
			node.innerHTML = '#dummyContainer > * {\n' + 
			'	background-color: blue;\n' +
			'}';
			document.head.appendChild(node);
		}

		this.hideEditPage();
	};

	/**
	 * Functions related to setting up the page on launch
	 */
	setup = new CRMAppSetup(this)

	/**
	 * Functions related to uploading the data to the backgroundpage
	 */
	uploading = new CRMAppUploading(this);

	/**
	* Dom listeners for this node
	 */
	listeners = new CRMAppListeners(this);

	/**
	 * Any templates
	 */
	templates = new CRMAppTemplates(this);

	/**
	 * CRM functions.
	 */
	crm = new CRMAppCRMFunctions(this);

	/**
	* Various util functions
	*/
	util = new CRMAppUtil(this);

	pageDemo = new CRMAppPageDemo(this);

	mounted() {
		// ...
	}

	firstRender() {
		// ...
	}
}