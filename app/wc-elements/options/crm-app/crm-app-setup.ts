import { I18NKeys } from '../../../_locales/i18n-keys.js';
import { CrmApp } from './crm-app';
export class CRMAppSetup {
	constructor(private _parent: CrmApp) { }
	public get parent() {
		return this._parent;
	}
	private async _restoreUnsavedInstances(editingObj: {
		id: CRM.GenericNodeId;
		mode: string;
		val: string;
		crmType: boolean[];
	}) {
		const crmItem = this.parent.nodesById.get(editingObj.id) as CRM.ScriptNode | CRM.StylesheetNode;
		const code = (crmItem.type === 'script' ? (editingObj.mode === 'main' ?
			crmItem.value.script : crmItem.value.backgroundScript) :
			(crmItem.value.stylesheet));
		this.parent.listeners.iconSwitch(null, editingObj.crmType);
		this.parent.$.keepChangesButton.addEventListener('click', () => {
			window.app.uploading.createRevertPoint();
			if (crmItem.type === 'script') {
				crmItem.value[(editingObj.mode === 'main' ?
					'script' : 'backgroundScript')] = editingObj.val;
			}
			else {
				crmItem.value.stylesheet = editingObj.val;
			}
			window.app.upload();
			browserAPI.storage.local.set({
				editing: null
			});
			window.setTimeout(function () {
				//Remove the CodeMirror instances for performance
				editor.destroy();
			}, 500);
		});
		this.parent.$.discardButton.addEventListener('click', () => {
			browserAPI.storage.local.set({
				editing: null
			});
			window.setTimeout(function () {
				//Remove the CodeMirror instances for performance
				editor.destroy();
			}, 500);
		});
		const isTs = crmItem.type === 'script' &&
			crmItem.value.ts && crmItem.value.ts.enabled;
		const stopHighlighting = (element: HTMLEditCrmItemElement) => {
			const item = element.$('.item');
			item.animate([
				{
					opacity: '1'
				}, {
					opacity: '0.6'
				}
			], {
					duration: 250,
					easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
				}).onfinish = () => {
					item.style.opacity = '0.6';
					$(this.parent.$('.pageCont')).animate({
						backgroundColor: 'white'
					}, 200);
					Array.prototype.slice.apply(this.parent.shadowRoot.querySelectorAll('.crmType')).forEach((crmType: HTMLElement) => {
						crmType.classList.add('dim');
					});
					const editCrmItems = window.app.editCRM.getItems();
					editCrmItems.forEach((el) => {
						el.$('.item').animate([{
							opacity: '0'
						}, {
							opacity: '1'
						}], {
								duration: 200
							}).onfinish = () => {
								document.body.style.pointerEvents = 'all';
							};
					});
					window.setTimeout(() => {
						window.doc.restoreChangesDialog.style.display = 'block';
					}, 200);
				};
		};
		const path = this.parent.nodesById.get(editingObj.id).path;
		const highlightItem = () => {
			document.body.style.pointerEvents = 'none';
			const columnConts = this.parent.editCRM.$.CRMEditColumnsContainer.children;
			const columnCont = columnConts[(path.length - 1)];
			const paperMaterial = columnCont.querySelector('.paper-material');
			const crmEditColumn = paperMaterial.querySelector('.CRMEditColumn');
			const editCRMItems = crmEditColumn.querySelectorAll('edit-crm-item');
			const crmElement = editCRMItems[path[path.length - 1]];
			//Just in case the item doesn't exist (anymore)
			if (crmElement.$('.item')) {
				crmElement.$('.item').animate([{
					opacity: '0.6'
				}, {
					opacity: '1'
				}], {
						duration: 250,
						easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
					}).onfinish = function (this: Animation) {
						crmElement.$('.item').style.opacity = '1';
					};
				setTimeout(function () {
					stopHighlighting(crmElement);
				}, 2000);
			}
			else {
				window.doc.restoreChangesDialog.style.display = 'block';
				$(this.parent.shadowRoot.querySelectorAll('.pageCont')).animate({
					backgroundColor: 'white'
				}, 200);
				Array.prototype.slice.apply(this.parent.shadowRoot.querySelectorAll('.crmType')).forEach((crmType: HTMLElement) => {
					crmType.classList.remove('dim');
				});
				const crmeditItemItems = window.app.editCRM.getItems().map((element) => {
					return element.$('.item');
				});
				$(crmeditItemItems).animate({
					opacity: 1
				}, 200, function () {
					document.body.style.pointerEvents = 'all';
				});
			}
		};
		window.doc.highlightChangedScript.addEventListener('click', () => {
			//Find the element first
			//Check if the element is already visible
			window.doc.restoreChangesDialog.style.display = 'none';
			this.parent.$('.pageCont').style.backgroundColor = 'rgba(0,0,0,0.4)';
			window.app.editCRM.getItems().forEach((element) => {
				const item = element.$('.item');
				item.style.opacity = '0.6';
			});
			Array.prototype.slice.apply(this.parent.shadowRoot.querySelectorAll('.crmType')).forEach((crmType: HTMLElement) => {
				crmType.classList.add('dim');
			});
			setTimeout(function () {
				if (path.length === 1) {
					//Always visible
					highlightItem();
				}
				else {
					let visible = true;
					for (let i = 1; i < path.length; i++) {
						if (window.app.editCRM.crm[i].indent.length !== path[i - 1]) {
							visible = false;
							break;
						}
					}
					if (!visible) {
						//Make it visible
						const popped = JSON.parse(JSON.stringify(path));
						popped.pop();
						window.app.editCRM.build({
							setItems: popped
						});
						setTimeout(highlightItem, 700);
					}
					else {
						highlightItem();
					}
				}
			}, 500);
		});
		window.doc.restoreChangesDialog.open();
		let editor: any = null;
		window.setTimeout(async () => {
			const me = window.doc.restoreChangesEditor;
			const type = crmItem.type === 'script' ?
				(isTs ? me.EditorMode.TS_META : me.EditorMode.JS_META) :
				me.EditorMode.CSS_META;
			editor = await window.doc.restoreChangesEditor.createDiff([code, editingObj.val], type, {
				wordWrap: 'off',
				fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
				folding: true
			});
		}, 1000);
	}
	;
	private _listening: boolean = false;
	private _bindListeners() {
		if (this._listening)
			return;
		this._listening = true;
		const urlInput = window.doc.addLibraryUrlInput;
		const manualInput = window.doc.addLibraryManualInput;
		window.doc.addLibraryUrlOption.addEventListener('change', function () {
			manualInput.style.display = 'none';
			urlInput.style.display = 'block';
		});
		window.doc.addLibraryManualOption.addEventListener('change', function () {
			urlInput.style.display = 'none';
			manualInput.style.display = 'block';
		});
		$('#addLibraryDialog').on('iron-overlay-closed', function (this: HTMLElement) {
			$(this).find('#addLibraryButton, #addLibraryConfirmAddition, #addLibraryDenyConfirmation').off('click');
		});
	}
	;
	private _crmTypeNumberToArr(crmType: number): boolean[] {
		const arr = [false, false, false, false, false, false];
		arr[crmType] = true;
		return arr;
	}
	async setupStorages() {
		const parent = this.parent;
		const storageLocal = await browserAPI.storage.local.get<CRM.StorageLocal & {
			nodeStorage: any;
			settings?: CRM.SettingsStorage;
		}>();
		function callback(items: CRM.SettingsStorage) {
			parent.settings = items;
			parent._settingsCopy = JSON.parse(JSON.stringify(items));
			window.app.editCRM.$.rootCRMItem.updateName(items.rootName);
			for (let i = 0; i < parent.onSettingsReadyCallbacks.length; i++) {
				parent.onSettingsReadyCallbacks[i].callback.apply(parent.onSettingsReadyCallbacks[i].thisElement, parent.onSettingsReadyCallbacks[i].params);
			}
			parent.updateEditorZoom();
			parent.updateCrmRepresentation(items.crm);
			if (parent.settings.latestId) {
				parent._latestId = items.latestId as CRM.GenericNodeId;
			}
			else {
				parent._latestId = 0 as CRM.GenericNodeId;
			}
			window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal
				.CRMOnPage);
			if (parent._isDemo()) {
				window.doc.CRMOnPage.toggled = true;
				window.app.setLocal('CRMOnPage', true);
				window.doc.CRMOnPage.setCheckboxDisabledValue(true);
				parent.pageDemo.create();
			}
			else {
				storageLocal.CRMOnPage && parent.pageDemo.create();
			}
		}
		Array.prototype.slice.apply(parent.shadowRoot.querySelectorAll('paper-toggle-option')).forEach(function (setting: PaperToggleOption) {
			setting.init(storageLocal);
		});
		parent._setup._bindListeners();
		delete storageLocal.nodeStorage;
		if (storageLocal.requestPermissions && storageLocal.requestPermissions.length > 0) {
			if (browserAPI.permissions) {
				await parent._requestPermissions(storageLocal.requestPermissions as CRM.Permission[]);
			}
		}
		if (storageLocal.editing) {
			const editing = storageLocal.editing as {
				val: string;
				id: CRM.GenericNodeId;
				mode: string;
				crmType: boolean[];
			};
			setTimeout(function () {
				//Check out if the code is actually different
				const node = parent.nodesById.get(editing.id) as CRM.ScriptNode | CRM.StylesheetNode;
				const nodeCurrentCode = (node.type === 'script' ? node.value.script :
					node.value.stylesheet);
				if (nodeCurrentCode.trim() !== editing.val.trim()) {
					parent._setup._restoreUnsavedInstances(editing);
				}
				else {
					browserAPI.storage.local.set({
						editing: null
					});
				}
			}, 2500);
		}
		if (storageLocal.selectedCrmType !== undefined) {
			const selected = Array.isArray(storageLocal.selectedCrmType) ?
				storageLocal.selectedCrmType :
				this._crmTypeNumberToArr(storageLocal.selectedCrmType);
			parent.crmTypes = selected;
			parent._setup.switchToIcons(selected);
		}
		else {
			browserAPI.storage.local.set({
				selectedCrmType: [true, true, true, true, true, true]
			});
			parent.crmTypes = [true, true, true, true, true, true];
			parent._setup.switchToIcons([true, true, true, true, true, true]);
		}
		if (storageLocal.jsLintGlobals) {
			parent.jsLintGlobals = storageLocal.jsLintGlobals;
		}
		else {
			parent.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
			browserAPI.storage.local.set({
				jsLintGlobals: parent.jsLintGlobals
			});
		}
		if (storageLocal.globalExcludes && storageLocal.globalExcludes.length > 1) {
			parent.globalExcludes.setValue(storageLocal.globalExcludes);
		}
		else {
			parent.globalExcludes.setValue(['']);
			browserAPI.storage.local.set({
				globalExcludes: parent.globalExcludes.getValue()
			});
		}
		if (storageLocal.addedPermissions && storageLocal.addedPermissions.length > 0) {
			window.setTimeout(function () {
				(window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer).tab = 0;
				(window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer).maxTabs =
					storageLocal.addedPermissions.length;
				window.doc.addedPermissionsTabRepeater.items =
					storageLocal.addedPermissions;
				if (storageLocal.addedPermissions.length === 1) {
					(window.doc.addedPermissionNextButton.querySelector('.next') as HTMLElement)
						.style.display = 'none';
				}
				else {
					(window.doc.addedPermissionNextButton.querySelector('.close') as HTMLElement)
						.style.display = 'none';
				}
				window.doc.addedPermissionPrevButton.style.display = 'none';
				window.doc.addedPermissionsTabRepeater.render();
				window.doc.addedPermissionsDialog.open();
				browserAPI.storage.local.set({
					addedPermissions: null
				});
			}, 2500);
		}
		if (storageLocal.updatedNodes && storageLocal.updatedNodes.length > 0) {
			parent.$.scriptUpdatesToast.text = parent._getUpdatedScriptString(storageLocal.updatedNodes[0]);
			parent.$.scriptUpdatesToast.scripts = storageLocal.updatedNodes;
			parent.$.scriptUpdatesToast.index = 0;
			parent.$.scriptUpdatesToast.show();
			if (storageLocal.updatedNodes.length > 1) {
				parent.$.nextScriptUpdateButton.style.display = 'inline';
			}
			else {
				parent.$.nextScriptUpdateButton.style.display = 'none';
			}
			browserAPI.storage.local.set({
				updatedScripts: []
			});
			storageLocal.updatedNodes = [];
		}
		if (storageLocal.settingsVersionData && storageLocal.settingsVersionData.wasUpdated) {
			const versionData = storageLocal.settingsVersionData;
			versionData.wasUpdated = false;
			browserAPI.storage.local.set({
				settingsVersionData: versionData
			});
			const toast = window.doc.updatedSettingsToast;
			toast.text = this.parent.___(I18NKeys.crmApp.code.settingsUpdated, new Date(versionData.latest.date).toLocaleDateString());
			toast.show();
		}
		if (storageLocal.isTransfer) {
			browserAPI.storage.local.set({
				isTransfer: false
			});
			//Lazyload the image
			window.app.$.stylesheetGif.src =
				window.app.$.stylesheetGif.getAttribute('data-src');
			window.doc.versionUpdateDialog.open();
		}
		parent.storageLocal = storageLocal;
		parent._storageLocalCopy = JSON.parse(JSON.stringify(storageLocal));
		if (storageLocal.useStorageSync && parent._supportsStorageSync()) {
			//Parse the data before sending it to the callback
			browserAPI.storage.sync.get().then((storageSync: any) => {
				const sync = storageSync as {
					[key: string]: string;
				} & {
					indexes: number | string[];
				};
				let indexes = sync.indexes;
				if (indexes == null || indexes === -1 || indexes === undefined) {
					browserAPI.storage.local.set({
						useStorageSync: false
					});
					callback(storageLocal.settings);
				}
				else {
					const settingsJsonArray: string[] = [];
					const indexesLength = typeof indexes === 'number' ?
						indexes : (Array.isArray(indexes) ?
							indexes.length : 0);
					window.app.util.createArray(indexesLength).forEach((_, index) => {
						settingsJsonArray.push(sync[`section${index}`]);
					});
					const jsonString = settingsJsonArray.join('');
					parent.settingsJsonLength.setValue(jsonString.length);
					const settings = JSON.parse(jsonString);
					if (parent.settingsJsonLength >= 102400) {
						window.app.$.useStorageSync.setCheckboxDisabledValue(true);
					}
					callback(settings);
				}
			});
		}
		else {
			//Send the "settings" object on the storage.local to the callback
			parent.settingsJsonLength.setValue(JSON.stringify(storageLocal.settings || {}).length);
			if (!storageLocal.settings) {
				browserAPI.storage.local.set({
					useStorageSync: true
				});
				browserAPI.storage.sync.get().then((storageSync: any) => {
					const sync = storageSync as {
						[key: string]: string;
					} & {
						indexes: string[];
					};
					const indexes = sync.indexes;
					const settingsJsonArray: string[] = [];
					const indexesLength = typeof indexes === 'number' ?
						indexes : (Array.isArray(indexes) ?
							indexes.length : 0);
					window.app.util.createArray(indexesLength).forEach((_, index) => {
						settingsJsonArray.push(sync[`section${index}`]);
					});
					const jsonString = settingsJsonArray.join('');
					parent.settingsJsonLength.setValue(jsonString.length);
					const settings = JSON.parse(jsonString);
					callback(settings);
				});
			}
			else {
				callback(storageLocal.settings);
			}
			if (!parent._supportsStorageSync() || parent.settingsJsonLength >= 102400) {
				window.app.$.useStorageSync.setCheckboxDisabledValue(true);
			}
		}
	}
	;
	setupLoadingBar(): Promise<void> {
		return new Promise(async (resolve) => {
			window.splashScreen.done.then(() => {
				//Wait until the element is actually registered to the DOM
				window.setTimeout(() => {
					//All elements have been loaded, unhide them all
					window.setTimeout(() => {
						window.setTimeout(() => {
							//Wait for the fade to pass
							window.polymerElementsLoaded = true;
						}, 500);
						if (BrowserAPI.getBrowser() === 'edge') {
							console.log(this.parent.___(I18NKeys.crmApp.code.hiMessage));
						}
						else {
							console.log(`%c${this.parent.___(I18NKeys.crmApp.code.hiMessage)}`, 'font-size:120%;font-weight:bold;');
						}
						console.log(this.parent.___(I18NKeys.crmApp.code.consoleInfo));
					}, 200);
					window.CRMLoaded = window.CRMLoaded || {
						listener: null,
						register(fn) {
							fn();
						}
					};
					window.CRMLoaded.listener && window.CRMLoaded.listener();
					resolve(null);
				}, 25);
			});
		});
	}
	;
	initCheckboxes(defaultLocalStorage: CRM.StorageLocal) {
		Array.prototype.slice.apply(this.parent.shadowRoot.querySelectorAll('paper-toggle-option')).forEach(function (setting: PaperToggleOption) {
			setting.init && setting.init(defaultLocalStorage);
		});
	}
	;
	orderNodesById(tree: CRM.Tree, root: boolean = true) {
		if (root) {
			this.parent.nodesById.clear();
		}
		for (let i = 0; i < tree.length; i++) {
			const node = tree[i];
			this.parent.nodesById.set(node.id, node);
			node.children && this.orderNodesById(node.children, false);
		}
	}
	;
	switchToIcons(indexes: boolean[]) {
		if (typeof indexes === 'number') {
			const arr = [false, false, false, false, false, false];
			arr[indexes] = true;
			indexes = arr;
		}
		let i;
		let element;
		const crmTypes = this.parent.shadowRoot.querySelectorAll('.crmType');
		for (i = 0; i < 6; i++) {
			if (indexes[i]) {
				element = <unknown>crmTypes[i] as HTMLElement;
				element.classList.add('toggled');
			}
		}
		this.parent.crmTypes = [...indexes];
		this.parent.fire('crmTypeChanged', {});
	}
	;
}
