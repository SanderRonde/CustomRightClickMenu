/// <reference path="../../elements.d.ts" />
/// <reference path="../../../../tools/definitions/jquery.d.ts" />
/// <reference path="../../../../tools/definitions/tern.d.ts" />

import { EncodedString } from '../../elements';
import { EditCrm } from '../edit-crm/edit-crm';
import { DefaultLink } from '../default-link/default-link';
import { CodeEditBehaviorInstance } from '../editpages/code-edit-pages/code-edit-behavior';
import { Polymer, ElementTagNameMaps } from '../../../../tools/definitions/polymer';
import { CenterElement } from '../../util/center-element/center-element';
import { PaperToggleOption } from '../inputs/paper-toggle-option/paper-toggle-option';
import { SCRIPT_CONVERSION_TYPE } from '../../../js/background/sharedTypes';
import { I18NKeys } from '../../../_locales/i18n-keys';

declare const browserAPI: browserAPI;
declare const BrowserAPI: BrowserAPI;

namespace CRMAppElement {
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

	interface JQueryContextMenu extends JQueryStatic {
		contextMenu(settings: {
			selector: string;
			items: JQContextMenuItem[];
		} | 'destroy'): void;
		bez(curve: number[]): string;
	}

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

	type TypeCheckErrors = {
		err: string;
		storageType?: 'local'|'sync';
	}[];

	window.runOrAddAsCallback = function (toRun: Function, thisElement: HTMLElement, params: any[]): void {
		if (window.app.settings) {
			toRun.apply(thisElement, params);
		} else {
			window.app.addSettingsReadyCallback(toRun, thisElement, params);
		}
	};

	(() => {
		const animateExists = !!document.createElement('div').animate;
		const animatePolyFill = function (this: HTMLElement, properties: {
			[key: string]: any;
		}[], options: {
			duration?: number;
			easing?: string|'bez';
			fill?: 'forwards'|'backwards'|'both';
		}): Animation {
			if (!properties[1]) {
				var skippedAnimation: Animation = {
					currentTime: null,
					play: function () { },
					reverse: function () { },
					cancel: function() { },
					finish: function() {},
					pause: function() {},
					updatePlaybackRate(_playbackRate: number) {},
					addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {},
					removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {},
					dispatchEvent(_event: Event) { return true },
					effect: null,
					finished: Promise.resolve(skippedAnimation),
					pending: false,
					startTime: Date.now(),
					id: '',
					ready: Promise.resolve(skippedAnimation),
					playState: 'finished',
					playbackRate: 1.0,
					timeline: {
						currentTime: Date.now()
					},
					oncancel: null,
					onfinish: null
				};
				return skippedAnimation;
			}

			const element = this;
			let direction: 'forwards' | 'backwards' = 'forwards';
			const state: {
				isPaused: boolean;
				currentProgress: number;
				msRemaining: number;
				finishedPromise: Promise<Animation>;
				finishPromise: (animation: Animation) => void;
				playbackRate: number;
				playState: 'idle'|'running'|'paused'|'finished';
				iterations: number;
			} = {
				isPaused: false,
				currentProgress: 0,
				msRemaining: 0,
				finishedPromise: null,
				finishPromise: null,
				playbackRate: 1.0,
				playState: 'idle',
				iterations: 0
			};
			var returnVal: Animation = {
				play() {
					state.playState = 'running';
					state.iterations++;

					state.finishedPromise = new Promise<Animation>((resolve) => {
						state.finishPromise = resolve;
					});

					let duration = (options && options.duration) || 500;
					if (state.isPaused) {
						duration = state.msRemaining;
					}
					duration = duration / state.playbackRate;
					$(element).stop().animate(properties[~~(direction === 'forwards')], {
						duration: duration,
						complete() {
							state.playState = 'finished';
							state.isPaused = false;
							state.finishPromise && state.finishPromise(returnVal);
							if (returnVal.onfinish) {
								returnVal.onfinish.apply(returnVal, {
									currentTime: Date.now(),
    								timelineTime: null
								});
							}
						},
						progress(_animation, progress, remainingMs) {
							state.currentProgress = progress;
							state.msRemaining = remainingMs;
						}
					});
					state.isPaused = false;
				},
				reverse() {
					direction = 'backwards';
					this.play();
				},
				cancel() {
					state.playState = 'idle';
					$(element).stop();
					state.isPaused = false;

					//Reset to start
					const props = properties[~~(direction !== 'forwards')];
					for (const prop in props) {
						element.style[prop as any] = props[prop];
					}

					returnVal.oncancel && returnVal.oncancel.apply(returnVal, {
						currentTime: Date.now(),
						timelineTime: null
					});
				},
				finish() {
					state.isPaused = false;
					$(element).stop().animate(properties[~~(direction === 'forwards')], {
						duration: 0,
						complete() {
							state.playState = 'finished';
							state.finishPromise && state.finishPromise(returnVal);
							if (returnVal.onfinish) {
								returnVal.onfinish.apply(returnVal, {
									currentTime: Date.now(),
    								timelineTime: null
								});
							}
						}
					});
				},
				pause() {
					state.playState = 'paused';
					$(element).stop();
					state.isPaused = true;
				},
				id: '',
				pending: false,
				currentTime: null,
				effect: {
					getTiming(): EffectTiming {
						const duration = ((options && options.duration) || 500) / state.playbackRate;
						return {
							delay: 0,
							direction: direction === 'forwards' ?
								'normal' : 'reverse',
							duration: duration,
							easing: options.easing,
							fill: options.fill
						}
					},
					updateTiming(_timing?: OptionalEffectTiming) {

					},
					getComputedTiming() {
						const duration = ((options && options.duration) || 500) / state.playbackRate;
						return {
							endTime: duration,
							activeDuration: duration,
							localTime: state.playState === 'running' ?
								duration - state.msRemaining : null,
							progress: state.playState === 'running' ?
								state.currentProgress : null,
							currentIteration: state.playState === 'running' ?
								state.iterations : null
						}
					}
				},
				updatePlaybackRate(_playbackRate: number) {},
				addEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {},
				removeEventListener(_type: string, _listener: EventListenerOrEventListenerObject) {},
				dispatchEvent(_event: Event) { return true },
				timeline: {
					currentTime: null
				},
				startTime: Date.now(),
				ready: Promise.resolve(returnVal),
				playbackRate: null,
				playState: null,
				finished: null,
				oncancel: null,
				onfinish: null
			};
			Object.defineProperty(returnVal.timeline, 'currentTime', {
				get() {
					return Date.now();
				}
			});
			Object.defineProperties(returnVal, {
				playbackRate: {
					get() {
						return state.playbackRate;
					}
				},
				playState: {
					get() {
						return state.playState;
					}
				},
				finished: {
					get() {
						return state.finishedPromise;
					}
				}
			});
			$(this).animate(properties[1], options.duration, function () {
				if (returnVal.onfinish) {
					returnVal.onfinish.apply({
						effect: {
							target: element
						}
					});
				}
			});
			return returnVal;
		};

		if (!animateExists) {
			HTMLElement.prototype.animate = animatePolyFill as any;
			HTMLElement.prototype.__isAnimationJqueryPolyfill = true;
		}
	})();

	const crmAppProperties: {
		settings: CRM.SettingsStorage;
		onSettingsReadyCallbacks: {
			callback: Function;
			thisElement: HTMLElement;
			params: any[];
		}[];
		crmTypes: boolean[];
		settingsJsonLength: number;
		globalExcludes: string[];
		versionUpdateTab: number;
	} = {
		settings: {
			type: Object,
			notify: true
		},
		onSettingsReadyCallbacks: {
			type: Array,
			value: []
		},
		crmTypes: Array,
		settingsJsonLength: {
			type: Number,
			notify: true,
			value: 0
		},
		globalExcludes: {
			type: Array,
			notify: true,
			value: []
		},
		versionUpdateTab: {
			type: Number,
			notify: true,
			value: 0,
			observer: 'versionUpdateChanged'
		}
	} as any;

	interface PersistentData {
		lineSeperators: {
			start: number;
			end: number;
		}[];
		script: string;
		lines: string[];
		siblingExpr?: Tern.Expression;
		isObj?: boolean;
	}

	interface ChromePersistentData {
		persistent: {
			passes: number;
			diagnostic: boolean;
			lineSeperators: {
				start: number;
				end: number;
			}[];
			script: string;
			lines: string[];
		};
		parentExpressions: Tern.Expression[];
		functionCall: string[];
		isReturn: boolean;
		isValidReturn: boolean;
		returnExpr: Tern.Expression;
		returnName: string;
		expression: Tern.Expression;
	}

	type TransferOnErrorError = {
		from: {
			line: number;
		}
		to: {
			line: number;
		}
	};

	type TransferOnError = (position: TransferOnErrorError,
		passes: number) => void;

	type ScriptUpgradeErrorHandler = (oldScriptErrors: CursorPosition[],
		newScriptErrors: CursorPosition[], parseError: boolean) => void;

	class CA {
		static is = 'crm-app';

		static _log: any[] = [];

		/**
		 * Whether to show the item-edit-page
		 */
		static show: boolean = false;

		/**
		 * What item to show in the item-edit-page
		 */
		static item: CRM.Node = null;

		/**
		 * The item to show, if it is a script
		 */
		static scriptItem: CRM.ScriptNode;

		/**
		 * The item to show, if it is a stylesheet
		 */
		static stylesheetItem: CRM.StylesheetNode;

		/**
		 * The last-used unique ID
		 */
		private static _latestId: CRM.GenericNodeId = -1 as CRM.GenericNodeId;

		/**
		 * The value of the storage.local
		 */
		static storageLocal: CRM.StorageLocal;

		/**
		 * A copy of the storage.local to compare when calling upload
		 */
		private static _storageLocalCopy: CRM.StorageLocal;

		/**
		 * A copy of the settings to compare when calling upload
		 */
		private static _settingsCopy: CRM.SettingsStorage;

		/**
		 * The nodes in an object where the key is the ID and the
		 * value is the node
		 */
		static nodesById: CRMStore = new window.Map();

		/**
		 * The column index of the "shadow" node, if any
		 */
		static shadowStart: number;

		/**
		 * The global variables for the jsLint linter
		 */
		static jsLintGlobals: string[] = [];

		/**
		 * The tern server used for key bindings
		 */
		static ternServer: Tern.ServerInstance;

		/**
		 * The monaco theme style element
		 */
		static monacoStyleElement: HTMLStyleElement = null;

		static properties = crmAppProperties;

		private static _getRegisteredListener(this: CrmApp, 
			element: Polymer.PolymerElement|HTMLElement|DocumentFragment, 
			eventType: string) {
				const listeners = this.listeners;
				if (!element || !('getAttribute' in element)) {
					return null;
				}
				return (element as Polymer.PolymerElement)
					.getAttribute(`data-on-${eventType}`) as keyof typeof listeners;
			}

		static domListener(this: CrmApp, event: Polymer.CustomEvent) {
			const listeners = this.listeners;

			const fnName: keyof typeof listeners = window.app.util.iteratePath(event, (element) => {
				return this._getRegisteredListener(element, event.type);
			});

			if (fnName) {
				if (fnName !== 'prototype' && fnName !== 'parent' && listeners[fnName]) {
					const listener = this.listeners[fnName];
					(listener as (this: typeof listener,
						event: Polymer.CustomEvent,
						eDetail: Polymer.CustomEvent['detail']) => void).bind(listeners)(event, event.detail);
				} else {
					console.warn.apply(console, this._logf(`_createEventHandler`, `listener method ${fnName} not defined`));
				}
			} else {
				console.warn.apply(console, this._logf(`_createEventHandler`, `property data-on${event.type} not defined`));
			}
		}

		static getKeyBindingValue(binding: {
			name: string;
			defaultKey: string;
			monacoKey: string;
			storageKey: keyof CRM.KeyBindings;
		}) {
			return (window.app.settings && 
				window.app.settings.editor.keyBindings[binding.storageKey]) ||
					binding.defaultKey;
		}

		static _currentItemIsCss(_item: CRM.ScriptNode|CRM.StylesheetNode) {
			return (this.item && this.item.type === 'stylesheet');
		}

		private static _isDemo() {
			return location.href.indexOf('demo') > -1;
		}

		private static _onIsTest() {
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

		static _getPageTitle(this: CrmApp): string {
			return this._isDemo() ?
				'Demo, actual right-click menu does NOT work in demo' :
				this.___(I18NKeys.generic.appTitle);
		}

		static _isOldChrome() {
			return this.getChromeVersion() < 30;
		}
		
		static _getChromeAge() {
			return new Date().getUTCFullYear() - 2013;
		}

		static _getString(str: string | null): string {
			return str || '';
		}

		static _isOfType<T extends {
			type: string;
		}>(option: T, type: T['type']): boolean {
			return option.type === type;
		}

		private static getChromeVersion() {
			if (BrowserAPI.getBrowser() === 'chrome') {
				return parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);	
			}
			return 1000;
		}

		static generateCodeOptionsArray<T extends CRM.Options>(this: CrmApp, settings: T|string): {
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

		static _isOnlyGlobalExclude(this: CrmApp): boolean {
			return this.globalExcludes.length === 1;
		};

		static _isVersionUpdateTabX(this: CrmApp, currentTab: number, desiredTab: number) {
			return currentTab === desiredTab;
		};

		private static _getUpdatedScriptString(this: CrmApp, updatedScript: {
			name: string;
			oldVersion: string;
			newVersion: string;
		}): string {
			if (!updatedScript) {
				return 'Please ignore';
			}
			return this.___(I18NKeys.crmApp.code.nodeUpdated, 
				updatedScript.name, updatedScript.oldVersion,
				updatedScript.newVersion);
		};

		static _getPermissionDescription(this: CrmApp): (permission: string) => string {
			return this.templates.getPermissionDescription;
		};

		static _getNodeName(this: CrmApp, nodeId: CRM.GenericNodeId) {
			return window.app.nodesById.get(nodeId).name;
		};

		static _getNodeVersion(this: CrmApp, nodeId: CRM.GenericNodeId) {
			return (window.app.nodesById.get(nodeId).nodeInfo && 
				window.app.nodesById.get(nodeId).nodeInfo.version) ||
					'1.0';
		};

		static _placeCommas(this: CrmApp, num: number): string {
			const split = this._reverseString(num.toString()).match(/[0-9]{1,3}/g);
			return this._reverseString(split.join(','));
		};

		static _supportsStorageSync() {
			return 'sync' in BrowserAPI.getSrc().storage && 
				'get' in BrowserAPI.getSrc().storage.sync;
		}

		static _getCRMInRMDisabledReason(this: CrmApp) {
			return this.___(I18NKeys.crmApp.options.chromeLow, 
				~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent) ? 
					(~~/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1].split('.')[0] + '') : 
					this.___(I18NKeys.crmApp.options.notChrome));
		}

		static _getStorageSyncDisabledReason(this: CrmApp) {
			if (!this._supportsStorageSync()) {
				return this.___(I18NKeys.crmApp.options.useStorageSyncDisabledUnavailable);
			} else {
				return this.___(I18NKeys.crmApp.options.useStorageSyncDisabledTooBig);
			}
		}

		static _getSettingsJsonLengthColor(this: CrmApp): string {
			let red;
			let green;
			if (this.settingsJsonLength <= 51200) {
				//Green to yellow, increase red
				green = 255;
				red = (this.settingsJsonLength / 51200) * 255;
			} else {
				//Yellow to red, reduce green
				red = 255;
				green = 255 - (((this.settingsJsonLength - 51200) / 51200) * 255);
			}

			//Darken a bit
			red = Math.floor(red * 0.7);
			green = Math.floor(green * 0.7);
			return 'color: rgb(' + red + ', ' + green + ', 0);';
		};

		private static _findScriptsInSubtree(this: CrmApp, toFind: CRM.Node, container: CRM.Node[]) {
			if (toFind.type === 'script') {
				container.push(toFind);
			} else if (toFind.children) {
				for (let i = 0; i < toFind.children.length; i++) {
					this._findScriptsInSubtree(toFind.children[i], container);
				}
			}
		};

		private static async _runDialogsForImportedScripts(this: CrmApp, nodesToAdd: CRM.Node[], dialogs: CRM.ScriptNode[]) {
			if (dialogs[0]) {
				const script = dialogs.splice(0, 1)[0];
				await window.scriptEdit.openPermissionsDialog(script);
				await this._runDialogsForImportedScripts(nodesToAdd, dialogs);
			} else {
				this._addImportedNodes(nodesToAdd);
			}
		};

		private static _addImportedNodes(this: CrmApp, nodesToAdd: CRM.Node[]): boolean {
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

		private static _reverseString(this: CrmApp, string: string): string {
			return string.split('').reverse().join('');
		};

		private static _genRequestPermissionsHandler(this: CrmApp, overlayContainer: {
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
						window.setTransform(svg, 'rotate(90deg)');
						(svg as any).rotated = false;
					} else {
						window.setTransform(svg, 'rotate(270deg)');
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
				$(this.shadowRoot.querySelectorAll('#requestPermissionsShowOther')).off('click').on('click', function (this: HTMLElement) {
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
				$(this.shadowRoot.querySelectorAll('.requestPermissionButton')).off('click').on('click', function (this: HTMLPaperCheckboxElement) {
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

				$(this.shadowRoot.querySelectorAll('#requestPermissionsAcceptAll')).off('click').on('click', function () {
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
		private static async _requestPermissions(this: CrmApp, toRequest: CRM.Permission[],
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
						description: this.templates.getPermissionDescription(toRequest[i]),
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
						description: this.templates.getPermissionDescription(allPermissions[i]),
						toggled: (allowed.permissions.indexOf((allPermissions as _browser.permissions.Permission[])[i]) > -1)
					});
				}
				const requestPermissionsOther = this.$$('#requestPermissionsOther');

				const overlayContainer: {
					overlay: HTMLPaperDialogElement;
				} = {
					overlay: null
				};

				const handler = this._genRequestPermissionsHandler(overlayContainer, toRequest);

				const interval = window.setInterval(() => {
					try {
						const centerer = window.doc.requestPermissionsCenterer as CenterElement;
						const overlay = overlayContainer.overlay = 
							window.app.util.getQuerySlot()(centerer)[0] as HTMLPaperDialogElement;
						if (overlay.open) {
							window.clearInterval(interval);
							const innerOverlay = window.app.util.getQuerySlot()(overlay)[0] as HTMLElement;
							window.app.$.requestedPermissionsTemplate.items = requested;
							window.app.$.requestedPermissionsOtherTemplate.items = other;
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

		private static async _transferCRMFromOld(this: CrmApp, openInNewTab: boolean, storageSource: {
			getItem(index: string | number): any;
		} = localStorage, method: SCRIPT_CONVERSION_TYPE = SCRIPT_CONVERSION_TYPE.BOTH): Promise<CRM.Tree> {
			return await this._transferFromOld.transferCRMFromOld(openInNewTab, storageSource, method);
		};

		static initCodeOptions(this: CrmApp, node: CRM.ScriptNode | CRM.StylesheetNode) {
			this.$.codeSettingsDialog.item = node;
			this.$.codeSettingsNodeName.innerText = node.name;

			this.$.codeSettingsRepeat.items = this.generateCodeOptionsArray(node.value.options);
			this.$.codeSettingsNoItems.if = this.$.codeSettingsRepeat.items.length === 0;
			this.$.codeSettingsRepeat.render();
			this.async(() => {
				this.$.codeSettingsDialog.fit();
				Array.prototype.slice.apply(this.$.codeSettingsDialog.querySelectorAll('paper-dropdown-menu'))
					.forEach((el: HTMLPaperDropdownMenuElement) => {
						el.init();
						el.updateSelectedContent();
					});
				this.$.codeSettingsDialog.open();
			}, 250);
		}

		static async versionUpdateChanged(this: CrmApp) {
			if (this._isVersionUpdateTabX(this.versionUpdateTab, 1)) {
				const versionUpdateDialog = this.$.versionUpdateDialog;
				if (!versionUpdateDialog.editorManager) {
					versionUpdateDialog.editorManager = await this.$.tryOutEditor.create(this.$.tryOutEditor.EditorMode.JS, {
						value: '//some javascript code\nvar body = document.getElementById(\'body\');\nbody.style.color = \'red\';\n\n',
						language: 'javascript',
						theme: window.app.settings.editor.theme === 'dark' ? 'vs-dark' : 'vs',
						wordWrap: 'off',
						fontSize: (~~window.app.settings.editor.zoom / 100) * 14,
						folding: true
					});
				}
			}
		};

		/**
		 * Generates an ID for a node
		 */
		static generateItemId(this: CrmApp) {
			this._latestId = this._latestId || 0 as CRM.GenericNodeId;
			this._latestId++;

			if (this.settings) {
				this.settings.latestId = this._latestId;
				window.app.upload();
			}

			return this._latestId;
		};

		static toggleShrinkTitleRibbon(this: CrmApp) {
			const viewportHeight = window.innerHeight;
			const $settingsCont = $(this.$$('#settingsContainer'));
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
					window.addCalcFn($settingsCont[0], 'height', '100vh - 66px');
				});
				window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(270deg)');

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
					window.addCalcFn($settingsCont[0], 'height', '100vh - -29px');
				});
				window.setTransform(window.doc.shrinkTitleRibbonButton, 'rotate(90deg)');

				window.doc.showHideToolsRibbonButton.classList.remove('hidden');
			}
			window.app.storageLocal.shrinkTitleRibbon = !window.app.storageLocal.shrinkTitleRibbon;
			browserAPI.storage.local.set({
				shrinkTitleRibbon: window.app.storageLocal.shrinkTitleRibbon
			});
		};

		static addSettingsReadyCallback(this: CrmApp, callback: Function, thisElement: HTMLElement, params: any[]) {
			this.onSettingsReadyCallbacks.push({
				callback: callback,
				thisElement: thisElement,
				params: params
			});
		};

		/**
		 * Uploads the settings to chrome.storage
		 */
		static upload(this: CrmApp, force: boolean = false) {
			this.uploading.upload(force);
			(async () => {
				await window.onExistsChain(window, 'app', 'settings', 'crm');
				this.updateCrmRepresentation(window.app.settings.crm);
			})();
		}

		static updateEditorZoom(this: CrmApp) {
			const prevStyle = document.getElementById('editorZoomStyle');
			prevStyle && prevStyle.remove();
			const styleEl = document.createElement('style');
			styleEl.id = 'editorZoomStyle';
			styleEl.innerText = `.CodeMirror, .CodeMirror-focused {
				font-size: ${1.25 * ~~window.app.settings.editor.zoom}%!important;
			}`;
			document.head.appendChild(styleEl);
		};

		private static _assertCRMNodeShape(this: CrmApp, node: CRM.Node): boolean {
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

		private static _assertCRMShape(this: CrmApp, crm: CRM.Tree) {
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

		static updateCrmRepresentation(this: CrmApp, crm: CRM.Tree) {
			this._assertCRMShape(crm);
			this._setup.orderNodesById(crm);
			this.crm.buildNodePaths(crm);
		}

		static setLocal<K extends keyof CRM.StorageLocal>(this: CrmApp, key: K, value: CRM.StorageLocal[K]) {
			const obj = {
				[key]: value
			};

			browserAPI.storage.local.set(obj as any);
			browserAPI.storage.local.get<CRM.StorageLocal>().then((storageLocal) => {
				this.storageLocal = storageLocal;
				this.upload();

				if (key === 'CRMOnPage' || key === 'editCRMInRM') {
					(window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue &&
					(window.doc.editCRMInRM as PaperToggleOption).setCheckboxDisabledValue(!storageLocal.CRMOnPage);
					this.pageDemo.create();
				}
			});
		};

		static async refreshPage(this: CrmApp) {
			//Reset dialog
			if (window.app.item) {
				const dialog = window[window.app.item.type + 'Edit' as
					'scriptEdit' | 'stylesheetEdit' | 'linkEdit' | 'dividerEdit' | 'menuEdit'];
				dialog && dialog.cancel();
			}
			window.app.item = null;

			//Reset storages
			window.app.settings = window.app.storageLocal = null;
			window.app._settingsCopy = window.app._storageLocalCopy = null;
			if (window.Storages) {
				window.Storages.clearStorages();
				await window.Storages.loadStorages();
			} else {
				await browserAPI.runtime.sendMessage({
					type: '_resetSettings'
				});
			}

			//On a demo or test page right now, use background page to init settings
			await this._setup.setupStorages();

			//Reset checkboxes
			this._setup.initCheckboxes(window.app.storageLocal);
			
			//Reset default links and searchengines
			Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('default-link')).forEach(function (link: DefaultLink) {
				link.reset();
			});

			//Reset regedit part
			window.doc.URISchemeFilePath.value = 'C:\\files\\my_file.exe';
			window.doc.URISchemeSchemeName.value = await this.__async(I18NKeys.crmApp.uriScheme.example);

			//Hide all open dialogs
			Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('paper-dialog')).forEach((dialog: HTMLPaperDialogElement) => {
				dialog.opened && dialog.close();
			});

			this.upload(true);
			await window.onExistsChain(window, 'app', 'settings', 'crm');
		};

		private static _codeStr(code: string): {
			content: string;
			isCode: true;
		} {
			return {
				content: code,
				isCode: true
			}
		}

		private static _logCode(...args: ({
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
			console.log.apply(console, [logArgs.join(' ')].concat(styleArgs));
		}

		private static _getDotValue<T extends {
			[key: string]: T | U
		}, U>(this: CrmApp, source: T, index: string): U {
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

		private static dependencyMet(this: CrmApp, data: TypeCheckConfig, optionals: {
			[key: string]: any;
			[key: number]: any;
		}): boolean {
			if (data.dependency && !optionals[data.dependency]) {
				optionals[data.val] = false;
				return false;
			}
			return true;
		}

		private static _isDefined(this: CrmApp, data: TypeCheckConfig, value: any, optionals: {
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

		private static _typesMatch(this: CrmApp, data: TypeCheckConfig, value: any, errors: TypeCheckErrors): string {
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

		private static _checkNumberConstraints(this: CrmApp, data: TypeCheckConfig, value: number,
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

			private static _checkArrayChildType(this: CrmApp, data: TypeCheckConfig, value: any, forChild: {
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

		private static _checkArrayChildrenConstraints<T extends {
			[key: string]: any;
		}>(this: CrmApp, data: TypeCheckConfig, value: T[], errors: TypeCheckErrors): boolean {
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

		private static _checkConstraints(this: CrmApp, data: TypeCheckConfig, value: any, errors: TypeCheckErrors): boolean {
			if (typeof value === 'number') {
				return this._checkNumberConstraints(data, value, errors);
			}
			if (Array.isArray(value) && data.forChildren) {
				return this._checkArrayChildrenConstraints(data, value, errors);
			}
			return true;
		}

		private static typeCheck(this: CrmApp, source: any, toCheck: TypeCheckConfig[], errors: TypeCheckErrors) {
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

		private static _checkLocalFormat(this: CrmApp) {
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

		private static _checkSyncFormat(this: CrmApp) {
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

		private static _checkFormat(this: CrmApp) {
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

		private static _setupConsoleInterface(this: CrmApp) {
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

		static ready(this: CrmApp) {
			window.app = this;
			window.doc = window.app.$;
			this._setupConsoleInterface();

			browserAPI.runtime.onInstalled.addListener(async (details) => {
				if (details.reason === 'update') {
					//Show a little message
					this.$.messageToast.text = this.___(I18NKeys.crmApp.code.extensionUpdated,
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
							this._latestId = message.latestId;
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

			this._setup.setupLoadingBar().then(() => {
				this._setup.setupStorages();
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

			this.show = false;
		};

		private static _TernFile = class TernFile {
			parent: any;
			scope: any;
			text: string;
			ast: Tern.ParsedFile;
			lineOffsets: number[];

			constructor(public name: string) { }
		}

		/**
		 * Functions related to transferring from version 1.0
		 */
		private static _transferFromOld = class CRMAppTransferFromOld {
			private static _backupLocalStorage() {
				if (typeof localStorage === 'undefined' ||
					(typeof window.indexedDB === 'undefined' && typeof (window as any).webkitIndexedDB === 'undefined')) {
					return;
				}
				const data = JSON.stringify(localStorage);
				const idb: IDBFactory = window.indexedDB || (window as any).webkitIndexedDB;
				const req = idb.open('localStorageBackup', 1);
				req.onerror = () => { console.log('Error backing up localStorage data'); };			
				req.onupgradeneeded = (event) => {
					const db: IDBDatabase = (event.target as any).result;
					const objectStore = db.createObjectStore('data', {
						keyPath: 'id'
					});
					objectStore.add({
						id: 0,
						data: data
					});
				}
			}

			private static _parseOldCRMNode(string: string, openInNewTab: boolean,
				method: SCRIPT_CONVERSION_TYPE): CRM.Node {
				let node: CRM.Node = {} as any;
				const oldNodeSplit = string.split('%123');
				const name = oldNodeSplit[0];
				const type = oldNodeSplit[1].toLowerCase();

				const nodeData = oldNodeSplit[2];

				switch (type) {
					//Stylesheets don't exist yet so don't implement those
					case 'link':
						let split;
						if (nodeData.indexOf(', ') > -1) {
							split = nodeData.split(', ');
						} else {
							split = nodeData.split(',');
						}
						node = this.parent().templates.getDefaultLinkNode({
							name: name,
							id: this.parent().generateItemId() as 
								CRM.NodeId<CRM.LinkNode>,
							value: split.map(function (url) {
								return {
									newTab: openInNewTab,
									url: url
								};
							})
						});
						break;
					case 'divider':
						node = this.parent().templates.getDefaultDividerNode({
							name: name,
							id: this.parent().generateItemId() as
								CRM.NodeId<CRM.DividerNode>
						});
						break;
					case 'menu':
						node = this.parent().templates.getDefaultMenuNode({
							name: name,
							id: this.parent().generateItemId() as 
								CRM.NodeId<CRM.MenuNode>,
							children: nodeData as any
						});
						break;
					case 'script':
						const scriptSplit = nodeData.split('%124');
						let scriptLaunchMode = scriptSplit[0];
						const scriptData = scriptSplit[1];
						let triggers;
						const launchModeString = scriptLaunchMode + '';
						if (launchModeString + '' !== '0' && launchModeString + '' !== '2') {
							triggers = launchModeString.split('1,')[1].split(',');
							triggers = triggers.map(function (item) {
								return {
									not: false,
									url: item.trim()
								};
							}).filter(function (item) {
								return item.url !== '';
							});
							scriptLaunchMode = '2';
						}
						const id = this.parent().generateItemId();
						node = this.parent().templates.getDefaultScriptNode({
							name: name,
							id: id,
							triggers: triggers || [],
							value: {
								launchMode: parseInt(scriptLaunchMode, 10),
								updateNotice: true,
								oldScript: scriptData,
								script: this.parent().legacyScriptReplace.convertScriptFromLegacy(scriptData, id, method)
							} as CRM.ScriptVal
						});
						break;
				}

				return node;
			};

			private static _assignParents(parent: CRM.Tree, nodes: CRM.Node[],
				index: {
					index: number;
				}, amount: number) {
				for (; amount !== 0 && nodes[index.index]; index.index++ , amount--) {
					const currentNode = nodes[index.index];
					if (currentNode.type === 'menu') {
						const childrenAmount = ~~currentNode.children;
						currentNode.children = [];
						index.index++;
						this._assignParents(currentNode.children, nodes, index, childrenAmount);
						index.index--;
					}
					parent.push(currentNode);
				}
			};

			private static _chainPromise<T>(promiseInitializers: (() =>Promise<T>)[], index: number = 0): Promise<T> {
				return new Promise<T>((resolve, reject) => {
					promiseInitializers[index]().then((value) => {
						if (index + 1 >= promiseInitializers.length) {
							resolve(value);
						} else {
							this._chainPromise(promiseInitializers, index + 1).then((value) => {
								resolve(value);
							}, (err) => {
								reject(err);
							});
						}
					}, (err) => {
						reject(err);	
					});
				});
			}
			private static async _execFile(path: string): Promise<void> {
				const el = document.createElement('script');
				el.src = browserAPI.runtime.getURL(browserAPI.runtime.getURL(path));
				document.body.appendChild(el);
			}
			private static _loadTernFiles(): Promise<void> {
				return new Promise((resolve, reject) => {
					const files: string[] = [
						'/js/libraries/tern/walk.js',
						'/js/libraries/tern/signal.js',
						'/js/libraries/tern/acorn.js',
						'/js/libraries/tern/tern.js',
						'/js/libraries/tern/ternserver.js',
						'/js/libraries/tern/def.js',
						'/js/libraries/tern/comment.js',
						'/js/libraries/tern/infer.js'
					];
					this._chainPromise(files.map((file) => {
						return () => {
							return this._execFile(file)
						}
					})).then(async () => {
						await window.onExists('tern', window);
						resolve(null);
					}, (err) => {
						reject(err);
					});
				});
			}

			static async transferCRMFromOld(openInNewTab: boolean, storageSource: {
				getItem(index: string | number): any;
			}, method: SCRIPT_CONVERSION_TYPE): Promise<CRM.Tree> {
				this._backupLocalStorage();
				await this._loadTernFiles();

				let i;
				const amount = parseInt(storageSource.getItem('numberofrows'), 10) + 1;

				const nodes = [];
				for (i = 1; i < amount; i++) {
					nodes.push(this._parseOldCRMNode(storageSource.getItem(i), openInNewTab, method));
				}

				//Structure nodes with children etc
				const crm: CRM.Tree = [];
				this._assignParents(crm, nodes, {
					index: 0
				}, nodes.length);
				return crm;
			};

			static parent() {
				return window.app;
			}
		}

		/**
		 * Functions related to setting up the page on launch
		 */
		private static _setup = class CRMAppSetup {
			private static async _restoreUnsavedInstances(editingObj: {
				id: CRM.GenericNodeId;
				mode: string;
				val: string;
				crmType: boolean[];
			}) {
				const crmItem = this.parent().nodesById.get(editingObj.id) as CRM.ScriptNode | CRM.StylesheetNode;
				const code = (crmItem.type === 'script' ? (editingObj.mode === 'main' ?
					crmItem.value.script : crmItem.value.backgroundScript) :
					(crmItem.value.stylesheet));
				this.parent().listeners.iconSwitch(null, editingObj.crmType);
				this.parent().$.keepChangesButton.addEventListener('click', () => {
					window.app.uploading.createRevertPoint();
					if (crmItem.type === 'script') {
						crmItem.value[(editingObj.mode === 'main' ?
							'script' : 'backgroundScript')] = editingObj.val;
					} else {
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
				this.parent().$.discardButton.addEventListener('click', () => {
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
					const item = element.$$('.item');
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
						$(this.parent().$$('.pageCont')).animate({
							backgroundColor: 'white'
						}, 200);
						Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('.crmType')).forEach((crmType: HTMLElement) => {
							crmType.classList.add('dim');
						});
						const editCrmItems = window.app.editCRM.getItems();
						editCrmItems.forEach((el) => {
							el.$$('.item').animate([{
								opacity: '0'
							}, {
								opacity: '1'
							}], {
								duration: 200
							}).onfinish = () => {
								document.body.style.pointerEvents = 'all';
							}
						});
						window.setTimeout(() => {
							window.doc.restoreChangesDialog.style.display = 'block';
						}, 200);
					};
				};

				const path = this.parent().nodesById.get(editingObj.id).path;
				const highlightItem = () => { 
					document.body.style.pointerEvents = 'none';
					const columnConts = this.parent().editCRM.$.CRMEditColumnsContainer.children;
					const columnCont = columnConts[(path.length - 1)];
					const paperMaterial = columnCont.querySelector('.paper-material');
					const crmEditColumn = paperMaterial.querySelector('.CRMEditColumn');
					const editCRMItems = crmEditColumn.querySelectorAll('edit-crm-item');
					const crmElement = editCRMItems[path[path.length - 1]];
					//Just in case the item doesn't exist (anymore)
					if (crmElement.$$('.item')) {
						crmElement.$$('.item').animate([{
							opacity: '0.6'
						}, {
							opacity: '1'
						}], {
							duration: 250,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}).onfinish = function (this: Animation) {
							crmElement.$$('.item').style.opacity = '1';
						};
						setTimeout(function () {
							stopHighlighting(crmElement);
						}, 2000);
					} else {
						window.doc.restoreChangesDialog.style.display = 'block';
						$(this.parent().shadowRoot.querySelectorAll('.pageCont')).animate({
							backgroundColor: 'white'
						}, 200);
						Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('.crmType')).forEach((crmType: HTMLElement) => {
							crmType.classList.remove('dim');
						});
						const crmeditItemItems = window.app.editCRM.getItems().map((element) => {
							return element.$$('.item');
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
					this.parent().$$('.pageCont').style.backgroundColor = 'rgba(0,0,0,0.4)';
					window.app.editCRM.getItems().forEach((element) => {
						const item = element.$$('.item');
						item.style.opacity = '0.6';
					});
					Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('.crmType')).forEach((crmType: HTMLElement) => {
						crmType.classList.add('dim');
					});

					setTimeout(function () {
						if (path.length === 1) {
							//Always visible
							highlightItem();
						} else {
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
							} else {
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
			};

			private static _listening: boolean = false;
			private static _bindListeners() {
				if (this._listening) return;

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
			};

			private static _crmTypeNumberToArr(crmType: number): boolean[] {
				const arr = [false, false, false, false, false, false];
				arr[crmType] = true;
				return arr;
			}

			static async setupStorages() {
				const parent = this.parent();
				const storageLocal = await browserAPI.storage.local.get<CRM.StorageLocal & {
					nodeStorage: any;
					settings?: CRM.SettingsStorage;
				}>();
				function callback(items: CRM.SettingsStorage) {
					parent.settings = items;
					parent._settingsCopy = JSON.parse(JSON.stringify(items));
					window.app.editCRM.$.rootCRMItem.updateName(items.rootName);
					for (let i = 0; i < parent.onSettingsReadyCallbacks.length; i++) {
						parent.onSettingsReadyCallbacks[i].callback.apply(
							parent.onSettingsReadyCallbacks[i].thisElement,
							parent.onSettingsReadyCallbacks[i].params);
					}
					parent.updateEditorZoom();
					parent.updateCrmRepresentation(items.crm);
					if (parent.settings.latestId) {
						parent._latestId = items.latestId as CRM.GenericNodeId;
					} else {
						parent._latestId = 0 as CRM.GenericNodeId;
					}
					window.doc.editCRMInRM.setCheckboxDisabledValue(!storageLocal
						.CRMOnPage);
					if (parent._isDemo()) {
						window.doc.CRMOnPage.toggled = true;
						window.app.setLocal('CRMOnPage', true);
						window.doc.CRMOnPage.setCheckboxDisabledValue(true);
						parent.pageDemo.create()
					} else {
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
						} else {
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
				} else {
					browserAPI.storage.local.set({
						selectedCrmType: [true, true, true, true, true, true]
					});
					parent.crmTypes = [true, true, true, true, true, true];
					parent._setup.switchToIcons([true, true, true, true, true, true]);
				}
				if (storageLocal.jsLintGlobals) {
					parent.jsLintGlobals = storageLocal.jsLintGlobals;
				} else {
					parent.jsLintGlobals = ['window', '$', 'jQuery', 'crmapi'];
					browserAPI.storage.local.set({
						jsLintGlobals: parent.jsLintGlobals
					});
				}
				if (storageLocal.globalExcludes && storageLocal.globalExcludes.length > 1) {
					parent.globalExcludes = storageLocal.globalExcludes;
				} else {
					parent.globalExcludes = [''];
					browserAPI.storage.local.set({
						globalExcludes: parent.globalExcludes
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
						} else {
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
					parent.$.scriptUpdatesToast.text = parent._getUpdatedScriptString(
						storageLocal.updatedNodes[0]);
					parent.$.scriptUpdatesToast.scripts = storageLocal.updatedNodes;
					parent.$.scriptUpdatesToast.index = 0;
					parent.$.scriptUpdatesToast.show();

					if (storageLocal.updatedNodes.length > 1) {
						parent.$.nextScriptUpdateButton.style.display = 'inline';
					} else {
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
					toast.text = this.parent().___(I18NKeys.crmApp.code.settingsUpdated,
						new Date(versionData.latest.date).toLocaleDateString());
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
							[key: string]: string
						} & {
							indexes: number|string[];
						};
						let indexes = sync.indexes;
						if (indexes == null || indexes === -1 || indexes === undefined) {
							browserAPI.storage.local.set({
								useStorageSync: false
							});
							callback(storageLocal.settings);
						} else {
							const settingsJsonArray: string[] = [];
							const indexesLength = typeof indexes === 'number' ? 
								indexes : (Array.isArray(indexes) ? 
									indexes.length : 0);
							window.app.util.createArray(indexesLength).forEach((_, index) => {
								settingsJsonArray.push(sync[`section${index}`]);
							});
							const jsonString = settingsJsonArray.join('');
							parent.settingsJsonLength = jsonString.length;
							const settings = JSON.parse(jsonString);

							if (parent.settingsJsonLength >= 102400) {
								window.app.$.useStorageSync.setCheckboxDisabledValue(true);
							}
							callback(settings);
						}
					});
				} else {
					//Send the "settings" object on the storage.local to the callback
					parent.settingsJsonLength = JSON.stringify(storageLocal.settings || {}).length;
					if (!storageLocal.settings) {
						browserAPI.storage.local.set({
							useStorageSync: true
						});
						browserAPI.storage.sync.get().then((storageSync: any) => {
							const sync = storageSync as {
								[key: string]: string
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
							parent.settingsJsonLength = jsonString.length;
							const settings = JSON.parse(jsonString);
							callback(settings);
						});
					} else {
						callback(storageLocal.settings);
					}

					if (!parent._supportsStorageSync() || parent.settingsJsonLength >= 102400) {
						window.app.$.useStorageSync.setCheckboxDisabledValue(true);
					}
				}
			};

			static setupLoadingBar(): Promise<void> {
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
									console.log(this.parent().___(I18NKeys.crmApp.code.hiMessage));
								} else {
									console.log(`%c${this.parent().___(I18NKeys.crmApp.code.hiMessage)}`, 'font-size:120%;font-weight:bold;');
								}
								console.log(this.parent().___(I18NKeys.crmApp.code.consoleInfo));
							}, 200);

							window.CRMLoaded = window.CRMLoaded || {
								listener: null,
								register(fn) {
									fn();
								}
							}
							window.CRMLoaded.listener && window.CRMLoaded.listener();
							resolve(null);
						}, 25);
					});
				});
			};

			static initCheckboxes(defaultLocalStorage: CRM.StorageLocal) {
				Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('paper-toggle-option')).forEach(function (setting: PaperToggleOption) {
					setting.init && setting.init(defaultLocalStorage);
				});
			};

			static orderNodesById(tree: CRM.Tree, root: boolean = true) {
				if (root) {
					this.parent().nodesById.clear();
				}

				for (let i = 0; i < tree.length; i++) {
					const node = tree[i];
					this.parent().nodesById.set(node.id, node);
					node.children && this.orderNodesById(node.children, false);
				}
			};

			static switchToIcons(indexes: boolean[]) {
				if (typeof indexes === 'number') {
					const arr = [false, false, false, false, false, false];
					arr[indexes] = true;
					indexes = arr;
				}

				let i;
				let element;
				const crmTypes = this.parent().shadowRoot.querySelectorAll('.crmType');
				for (i = 0; i < 6; i++) {
					if (indexes[i]) {
						element = <unknown>crmTypes[i] as HTMLElement;
						element.classList.add('toggled');
					}
				}
				this.parent().crmTypes = [...indexes];
				this.parent().fire('crmTypeChanged', {});
			};

			static parent() {
				return window.app;
			}
		}

		/**
		 * Functions related to uploading the data to the backgroundpage
		 */
		static uploading = class CRMAppUploading {
			private static _areValuesDifferent(val1: any[] | Object, val2: any[] | Object): boolean {
				//Array or object
				const obj1ValIsArray = Array.isArray(val1);
				let obj2ValIsArray = Array.isArray(val2);
				const obj1ValIsObjOrArray = typeof val1 === 'object';
				let obj2ValIsObjOrArray = typeof val2 === 'object';

				if (obj1ValIsObjOrArray) {
					//Array or object
					if (!obj2ValIsObjOrArray) {
						return true;
					} else {
						//Both objects or arrays

						//1 is an array
						if (obj1ValIsArray) {
							//2 is not an array
							if (!obj2ValIsArray) {
								return true;
							} else {
								//Both are arrays, compare them
								if (!this._parent().util.compareArray(val1 as any[], val2 as any[])) {
									//Changes have been found, also say the container arrays have changed
									return true;
								}
							}
						} else {
							//1 is not an array, check if 2 is
							if (obj2ValIsArray) {
								//2 is an array, changes
								return true;
							} else {
								//2 is also not an array, they are both objects
								if (!this._parent().util.compareObj(val1, val2)) {
									//Changes have been found, also say the container arrays have changed
									return true;
								}
							}
						}
					}
				} else if (val1 !== val2) {
					//They are both normal string//bool values, do a normal comparison
					return true;
				}
				return false;
			};

			private static _getObjDifferences<T, S>(obj1: {
				[key: string]: T
				[key: number]: T
			}, obj2: {
				[key: string]: S
				[key: number]: S
			}, changes: {
				oldValue: S;
				newValue: T;
				key: any;
			}[]): boolean {
				for (let key in obj1) {
					if (obj1.hasOwnProperty(key)) {
						if (this._areValuesDifferent(obj1[key], obj2[key])) {
							changes.push({
								oldValue: obj2[key],
								newValue: obj1[key],
								key: key
							});
						}
					}
				}
				return changes.length > 0;
			};

			static getChanges(force: boolean, {
				local = this._parent().storageLocal,
				localCopy = this._parent()._storageLocalCopy,
				sync = this._parent().settings,
				syncCopy = this._parent()._settingsCopy,
			}: {
				local?: CRM.StorageLocal;
				localCopy?: CRM.StorageLocal;
				sync?: CRM.SettingsStorage;
				syncCopy?: CRM.SettingsStorage;
			} = {
				local: this._parent().storageLocal,
				localCopy: this._parent()._storageLocalCopy,
				sync: this._parent().settings,
				syncCopy: this._parent()._settingsCopy,
			}): {
				hasLocalChanged: boolean;
				haveSettingsChanged: boolean;
				localChanges: any;
				settingsChanges: any;
			} {
				const localChanges: {
					oldValue: any;
					newValue: any;
					key: any;
				}[] = [];

				const settingsChanges: {
					oldValue: any;
					newValue: any;
					key: any;
				}[] = [];
				const hasLocalChanged = this._getObjDifferences(local, force ? {} : localCopy, localChanges);
				const haveSettingsChanged = this._getObjDifferences(sync, force ? {} : syncCopy, settingsChanges);
				return {
					hasLocalChanged,
					haveSettingsChanged,
					localChanges, 
					settingsChanges
				}
			}

			private static _updateCopies() {
				this._parent()._storageLocalCopy = 
					JSON.parse(JSON.stringify(this._parent().storageLocal));
				this._parent()._settingsCopy = 
					JSON.parse(JSON.stringify(this._parent().settings));
			}

			private static _uploadChanges({
				hasLocalChanged, 
				haveSettingsChanged, 
				localChanges,
				settingsChanges
			}: {
				hasLocalChanged: boolean;
				haveSettingsChanged: boolean;
				localChanges: any;
				settingsChanges: any;
			}) {
				if (hasLocalChanged || haveSettingsChanged) {
					//Changes occured
					browserAPI.runtime.sendMessage({
						type: 'updateStorage',
						data: {
							type: 'optionsPage',
							localChanges: hasLocalChanged && localChanges,
							settingsChanges: haveSettingsChanged && settingsChanges
						}
					});
				}

				this._parent().pageDemo.create();
				this._updateCopies();
			}

			static upload(force: boolean) {
				//Send changes to background-page, background-page uploads everything
				//Compare storageLocal objects
				this._uploadChanges(this.getChanges(force));
			};

			private static _lastRevertPoint: {
				local: CRM.StorageLocal;
				sync: CRM.SettingsStorage;
			} = null;
			static createRevertPoint(showToast: boolean = true, toastTime: number = 10000) {
				if (showToast) {
					window.app.util.showToast('Undo');
					window.app.$.undoToast.duration = toastTime;
					window.app.$.undoToast.show();
				}

				const revertPoint = {
					local: JSON.parse(JSON.stringify(window.app.storageLocal)),
					sync: JSON.parse(JSON.stringify(window.app.settings))
				};
				this._lastRevertPoint = revertPoint;
				return revertPoint;
			}

			static showRevertPointToast(revertPoint: {
				local: CRM.StorageLocal;
				sync: CRM.SettingsStorage;
			}, toastTime: number = 10000) {
				window.app.util.showToast('Undo');
				window.app.$.undoToast.duration = toastTime;
				window.app.$.undoToast.show();

				this._lastRevertPoint = revertPoint;
			}

			static revert(revertPoint: {
				local: CRM.StorageLocal;
				sync: CRM.SettingsStorage;
			} = this._lastRevertPoint) {
				// Hide the toast if it isn't hidden already
				window.app.$.undoToast.hide();

				if (!this._lastRevertPoint) return;

				this._uploadChanges(this.getChanges(false, {
					local: revertPoint.local,
					localCopy: this._parent().storageLocal,
					sync: revertPoint.sync,
					syncCopy: this._parent().settings
				}));

				window.app.settings = revertPoint.sync;
				window.app.updateCrmRepresentation(window.app.settings.crm);
				window.app.editCRM.build();
			}

			private static _parent() {
				return window.app;
			}
		}

		/**
		 * Functions for transferring an old version of a script to a new version
		 */
		static legacyScriptReplace = class LegacyScriptReplace {
			static localStorageReplace = class LogalStorageReplace {
				static findExpression(expression: Tern.Expression, data: PersistentData,
					strToFind: string, onFind: (data: PersistentData, expression: Tern.Expression) => void): boolean {
					if (!expression) {
						return false;
					}
					switch (expression.type) {
						case 'Identifier':
							if (expression.name === strToFind) {
								onFind(data, expression);
								return true;
							}
							break;
						case 'VariableDeclaration':
							for (let i = 0; i < expression.declarations.length; i++) {
								//Check if it's an actual chrome assignment
								const declaration = expression.declarations[i];
								if (declaration.init) {
									if (this.findExpression(declaration.init, data, strToFind, onFind)) {
										return true;
									}
								}
							}
							break;
						case 'MemberExpression':
							data.isObj = true;
							if (this.findExpression(expression.object, data, strToFind, onFind)) {
								return true;
							}
							data.siblingExpr = expression.object;
							data.isObj = false;
							return this.findExpression(expression.property as Tern.Identifier, data, strToFind, onFind);
						case 'CallExpression':
							if (expression.arguments && expression.arguments.length > 0) {
								for (let i = 0; i < expression.arguments.length; i++) {
									if (this.findExpression(expression.arguments[i], data, strToFind, onFind)) {
										return true;
									}
								}
							}
							if (expression.callee) {
								return this.findExpression(expression.callee, data, strToFind, onFind);
							}
							break;
						case 'AssignmentExpression':
							return this.findExpression(expression.right, data, strToFind, onFind);
						case 'FunctionExpression':
						case 'FunctionDeclaration':
							for (let i = 0; i < expression.body.body.length; i++) {
								if (this.findExpression(expression.body.body[i], data, strToFind, onFind)) {
									return true;
								}
							}
							break;
						case 'ExpressionStatement':
							return this.findExpression(expression.expression, data, strToFind, onFind);
						case 'SequenceExpression':
							for (let i = 0; i < expression.expressions.length; i++) {
								if (this.findExpression(expression.expressions[i], data, strToFind, onFind)) {
									return true;
								}
							}
							break;
						case 'UnaryExpression':
						case 'ConditionalExpression':
							if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
								return true;
							}
							return this.findExpression(expression.alternate, data, strToFind, onFind);
						case 'IfStatement':
							if (this.findExpression(expression.consequent, data, strToFind, onFind)) {
								return true;
							}
							if (expression.alternate) {
								return this.findExpression(expression.alternate, data, strToFind, onFind);
							}
							break;
						case 'LogicalExpression':
						case 'BinaryExpression':
							if (this.findExpression(expression.left, data, strToFind, onFind)) {
								return true;
							}
							return this.findExpression(expression.right, data, strToFind, onFind);
						case 'BlockStatement':
							for (let i = 0; i < expression.body.length; i++) {
								if (this.findExpression(expression.body[i], data, strToFind, onFind)) {
									return true;
								}
							}
							break;
						case 'ReturnStatement':
							return this.findExpression(expression.argument, data, strToFind, onFind);
						case 'ObjectExpressions':
							for (let i = 0; i < expression.properties.length; i++) {
								if (this.findExpression(expression.properties[i].value, data, strToFind, onFind)) {
									return true;
								}
							}
							break;
					}
					return false;
				}
				static getLineSeperators(lines: string[]): {
					start: number;
					end: number;
				}[] {
					let index = 0;
					const lineSeperators = [];
					for (let i = 0; i < lines.length; i++) {
						lineSeperators.push({
							start: index,
							end: index += lines[i].length + 1
						});
					}
					return lineSeperators;
				}
				static replaceCalls(lines: string[]): string {
					//Analyze the file
					const file = new window.app._TernFile('[doc]');
					file.text = lines.join('\n');
					const srv = new window.CodeMirror.TernServer({
						defs: []
					});
					window.tern.withContext(srv.cx, () => {
						file.ast = window.tern.parse(file.text, srv.passes, {
							directSourceFile: file,
							allowReturnOutsideFunction: true,
							allowImportExportEverywhere: true,
							ecmaVersion: srv.ecmaVersion
						});
					});

					const scriptExpressions = file.ast.body;

					let script = file.text;

					//Check all expressions for chrome calls
					const persistentData: PersistentData = {
						lines: lines,
						lineSeperators: this.getLineSeperators(lines),
						script: script
					};

					for (let i = 0; i < scriptExpressions.length; i++) {
						const expression = scriptExpressions[i];
						if (this.findExpression(expression, persistentData, 'localStorage', (data, expression) => {
							data.script =
								data.script.slice(0, expression.start) +
								'localStorageProxy' +
								data.script.slice(expression.end);
							data.lines = data.script.split('\n');
						})) {
							//Margins may have changed, redo tern stuff
							return this.replaceCalls(persistentData.lines);
						}
					}

					return persistentData.script;
				}
			}
			static chromeCallsReplace = class ChromeCallsReplace {
				private static _isProperty(toCheck: string, prop: string): boolean {
					if (toCheck === prop) {
						return true;
					}
					return toCheck.replace(/['|"|`]/g, '') === prop;
				}
				private static _getCallLines(lineSeperators: {
					start: number;
					end: number;
				}[], start: number, end: number): {
						from: {
							index: number;
							line: number;
						};
						to: {
							index: number;
							line: number;
						}
					} {
					const line: {
						from: {
							index: number,
							line: number;
						},
						to: {
							index: number,
							line: number;
						};
					} = {} as any;
					for (let i = 0; i < lineSeperators.length; i++) {
						const sep = lineSeperators[i];
						if (sep.start <= start) {
							line.from = {
								index: sep.start,
								line: i
							};
						}
						if (sep.end >= end) {
							line.to = {
								index: sep.end,
								line: i
							};
							break;
						}
					}

					return line;
				}
				private static _getFunctionCallExpressions(data: ChromePersistentData): Tern.Expression {
					//Keep looking through the parent expressions untill a CallExpression or MemberExpression is found
					let index = data.parentExpressions.length - 1;
					let expr = data.parentExpressions[index];
					while (expr && expr.type !== 'CallExpression') {
						expr = data.parentExpressions[--index];
					}
					return data.parentExpressions[index];
				}
				private static _getChromeAPI(expr: Tern.Expression, data: ChromePersistentData): {
					call: string;
					args: string;
				} {
					data.functionCall = data.functionCall.map((prop) => {
						return prop.replace(/['|"|`]/g, '');
					});
					let functionCall = data.functionCall;
					functionCall = functionCall.reverse();
					if (functionCall[0] === 'chrome') {
						functionCall.splice(0, 1);
					}

					const argsStart = expr.callee.end;
					const argsEnd = expr.end;
					const args = data.persistent.script.slice(argsStart, argsEnd);

					return {
						call: functionCall.join('.'),
						args: args
					};
				}
				private static _getLineIndexFromTotalIndex(lines: string[], line: number, index:
					number): number {
						for (let i = 0; i < line; i++) {
							index -= lines[i].length + 1;
						}
						return index;
					}
				private static _replaceChromeFunction(data: ChromePersistentData, expr: Tern.Expression, callLine:
					{
						from: {
							line: number;
						}
						to: {
							line: number;
						}
					}) {
					if (data.isReturn && !data.isValidReturn) {
						return;
					}

					var lines = data.persistent.lines;

					//Get chrome API
					let i;
					var chromeAPI = this._getChromeAPI(expr, data);
					var firstLine = data.persistent.lines[callLine.from.line];
					var lineExprStart = this._getLineIndexFromTotalIndex(data.persistent.lines,
						callLine.from.line, ((data.returnExpr && data.returnExpr.start) ||
							expr.callee.start));
					var lineExprEnd = this._getLineIndexFromTotalIndex(data.persistent.lines,
						callLine.from.line, expr.callee.end);

					var newLine = firstLine.slice(0, lineExprStart) +
						`window.crmAPI.chrome('${chromeAPI.call}')`;

					var lastChar = null;
					while (newLine[(lastChar = newLine.length - 1)] === ' ') {
						newLine = newLine.slice(0, lastChar);
					}
					if (newLine[(lastChar = newLine.length - 1)] === ';') {
						newLine = newLine.slice(0, lastChar);
					}

					if (chromeAPI.args !== '()') {
						var argsLines = chromeAPI.args.split('\n');
						newLine += argsLines[0];
						for (i = 1; i < argsLines.length; i++) {
							lines[callLine.from.line + i] = argsLines[i];
						}
					}

					if (data.isReturn) {
						var lineRest = firstLine.slice(lineExprEnd + chromeAPI.args.split('\n')[0].length);
						while (lineRest.indexOf(';') === 0) {
							lineRest = lineRest.slice(1);
						}
						newLine += `.return(function(${data.returnName}) {` + lineRest;
						var usesTabs = true;
						var spacesAmount = 0;
						//Find out if the writer uses tabs or spaces
						for (let i = 0; i < data.persistent.lines.length; i++) {
							if (data.persistent.lines[i].indexOf('	') === 0) {
								usesTabs = true;
								break;
							} else if (data.persistent.lines[i].indexOf('  ') === 0) {
								var split = data.persistent.lines[i].split(' ');
								for (var j = 0; j < split.length; j++) {
									if (split[j] === ' ') {
										spacesAmount++;
									} else {
										break;
									}
								}
								usesTabs = false;
								break;
							}
						}

						var indent;
						if (usesTabs) {
							indent = '	';
						} else {
							indent = [];
							indent[spacesAmount] = ' ';
							indent = indent.join(' ');
						}

						//Only do this for the current scope
						var scopeLength = null;
						var idx = null;
						for (i = data.parentExpressions.length - 1; scopeLength === null && i !== 0; i--) {
							if (data.parentExpressions[i].type === 'BlockStatement' ||
								(data.parentExpressions[i].type === 'FunctionExpression' &&
									(data.parentExpressions[i].body as Tern.BlockStatement).type === 'BlockStatement')) {
								scopeLength = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line, data.parentExpressions[i].end);
								idx = 0;

								//Get the lowest possible scopeLength as to stay on the last line of the scope
								while (scopeLength > 0) {
									scopeLength = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (++idx), data.parentExpressions[i].end);
								}
								scopeLength = this._getLineIndexFromTotalIndex(data.persistent.lines, callLine.from.line + (idx - 1), data.parentExpressions[i].end);
							}
						}
						if (idx === null) {
							idx = (lines.length - callLine.from.line) + 1;
						}

						var indents = 0;
						var newLineData = lines[callLine.from.line];
						while (newLineData.indexOf(indent) === 0) {
							newLineData = newLineData.replace(indent, '');
							indents++;
						}

						//Push in one extra line at the end of the expression
						var prevLine;
						var indentArr = [];
						indentArr[indents] = '';
						var prevLine2 = indentArr.join(indent) + '}).send();';
						var max = data.persistent.lines.length + 1;
						for (i = callLine.from.line; i < callLine.from.line + (idx - 1); i++) {
							lines[i] = indent + lines[i];
						}

						//If it's going to add a new line, indent the last line as well
						// if (idx === (lines.length - callLines.from.line) + 1) {
						// 	lines[i] = indent + lines[i];
						// }
						for (i = callLine.from.line + (idx - 1); i < max; i++) {
							prevLine = lines[i];
							lines[i] = prevLine2;
							prevLine2 = prevLine;
						}

					} else {
						lines[callLine.from.line + (i - 1)] = lines[callLine.from.line + (i - 1)] + '.send();';
						if (i === 1) {
							newLine += '.send();';
						}
					}
					lines[callLine.from.line] = newLine;
					return;
				}
				private static _callsChromeFunction(callee: Tern.FunctionCallExpression, data: ChromePersistentData, onError:
					TransferOnError): boolean {
					data.parentExpressions.push(callee);

					//Check if the function has any arguments and check those first
					if (callee.arguments && callee.arguments.length > 0) {
						for (let i = 0; i < callee.arguments.length; i++) {
							if (this._findChromeExpression(callee.arguments[i], this
								._removeObjLink(data), onError)) {
								return true;
							}
						}
					}

					if (callee.type !== 'MemberExpression') {
						//This is a call upon something (like a call in crmAPI.chrome), check the previous expression first
						return this._findChromeExpression(callee, this._removeObjLink(data),
							onError);
					}

					//Continue checking the call itself
					if (callee.property) {
						data.functionCall = data.functionCall || [];
						data.functionCall.push(callee.property.name || (callee.property as any).raw);
					}
					if (callee.object && callee.object.name) {
						//First object
						const isWindowCall = (this._isProperty(callee.object.name, 'window') &&
							this._isProperty(callee.property.name || (callee.property as any).raw, 'chrome'));
						if (isWindowCall || this._isProperty(callee.object.name, 'chrome')) {
							data.expression = callee;
							const expr = this._getFunctionCallExpressions(data);
							const callLines = this._getCallLines(data
								.persistent
								.lineSeperators, expr.start, expr.end);
							if (data.isReturn && !data.isValidReturn) {
								callLines.from.index = this._getLineIndexFromTotalIndex(data.persistent
									.lines, callLines.from.line, callLines.from.index);
								callLines.to.index = this._getLineIndexFromTotalIndex(data.persistent
									.lines, callLines.to.line, callLines.to.index);
								onError(callLines, data.persistent.passes);
								return false;
							}
							if (!data.persistent.diagnostic) {
								this._replaceChromeFunction(data, expr, callLines);
							}
							return true;
						}
					} else if (callee.object) {
						return this._callsChromeFunction(callee.object as any, data, onError);
					}
					return false;
				}
				private static _removeObjLink(data: ChromePersistentData): ChromePersistentData {
					const parentExpressions = data.parentExpressions || [];
					const newObj: ChromePersistentData = {} as any;
					for (let key in data) {
						if (data.hasOwnProperty(key) &&
							key !== 'parentExpressions' &&
							key !== 'persistent') {
							(newObj as any)[key] = (data as any)[key];
						}
					}

					const newParentExpressions = [];
					for (let i = 0; i < parentExpressions.length; i++) {
						newParentExpressions.push(parentExpressions[i]);
					}
					newObj.persistent = data.persistent;
					newObj.parentExpressions = newParentExpressions;
					return newObj;
				}
				private static _findChromeExpression(expression: Tern.Expression, data: ChromePersistentData,
					onError: TransferOnError): boolean {
					data.parentExpressions = data.parentExpressions || [];
					data.parentExpressions.push(expression);

					switch (expression.type) {
						case 'VariableDeclaration':
							data.isValidReturn = expression.declarations.length === 1;
							for (let i = 0; i < expression.declarations.length; i++) {
								//Check if it's an actual chrome assignment
								var declaration = expression.declarations[i];
								if (declaration.init) {
									var decData = this._removeObjLink(data);

									var returnName = declaration.id.name;
									decData.isReturn = true;
									decData.returnExpr = expression;
									decData.returnName = returnName;

									if (this._findChromeExpression(declaration.init, decData, onError)) {
										return true;
									}
								}
							}
							break;
						case 'CallExpression':
						case 'MemberExpression':
							const argsTocheck: Tern.Expression[] = [];
							if (expression.arguments && expression.arguments.length > 0) {
								for (let i = 0; i < expression.arguments.length; i++) {
									if (expression.arguments[i].type !== 'MemberExpression' && expression.arguments[i].type !== 'CallExpression') {
										//It's not a direct call to chrome, just handle this later after the function has been checked
										argsTocheck.push(expression.arguments[i]);
									} else {
										if (this._findChromeExpression(expression.arguments[i], this._removeObjLink(data), onError)) {
											return true;
										}
									}
								}
							}
							data.functionCall = [];
							if (expression.callee) {
								if (this._callsChromeFunction(expression.callee, data, onError)) {
									return true;
								}
							}
							for (let i = 0; i < argsTocheck.length; i++) {
								if (this._findChromeExpression(argsTocheck[i], this._removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'AssignmentExpression':
							data.isReturn = true;
							data.returnExpr = expression;
							data.returnName = expression.left.name;

							return this._findChromeExpression(expression.right, data, onError);
						case 'FunctionExpression':
						case 'FunctionDeclaration':
							data.isReturn = false;
							for (let i = 0; i < expression.body.body.length; i++) {
								if (this._findChromeExpression(expression.body.body[i], this
									._removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'ExpressionStatement':
							return this._findChromeExpression(expression.expression, data, onError);
						case 'SequenceExpression':
							data.isReturn = false;
							var lastExpression = expression.expressions.length - 1;
							for (let i = 0; i < expression.expressions.length; i++) {
								if (i === lastExpression) {
									data.isReturn = true;
								}
								if (this._findChromeExpression(expression.expressions[i], this
									._removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'UnaryExpression':
						case 'ConditionalExpression':
							data.isValidReturn = false;
							data.isReturn = true;
							if (this._findChromeExpression(expression.consequent, this
								._removeObjLink(data), onError)) {
								return true;
							}
							if (this._findChromeExpression(expression.alternate, this
								._removeObjLink(data), onError)) {
								return true;
							}
							break;
						case 'IfStatement':
							data.isReturn = false;
							if (this._findChromeExpression(expression.consequent, this
								._removeObjLink(data), onError)) {
								return true;
							}
							if (expression.alternate &&
								this._findChromeExpression(expression.alternate, this
									._removeObjLink(data),
									onError)) {
								return true;
							}
							break;
						case 'LogicalExpression':
						case 'BinaryExpression':
							data.isReturn = true;
							data.isValidReturn = false;
							if (this._findChromeExpression(expression.left, this._removeObjLink(data),
								onError)) {
								return true;
							}
							if (this._findChromeExpression(expression.right, this
								._removeObjLink(data),
								onError)) {
								return true;
							}
							break;
						case 'BlockStatement':
							data.isReturn = false;
							for (let i = 0; i < expression.body.length; i++) {
								if (this._findChromeExpression(expression.body[i], this
									._removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
						case 'ReturnStatement':
							data.isReturn = true;
							data.returnExpr = expression;
							data.isValidReturn = false;
							return this._findChromeExpression(expression.argument, data, onError);
						case 'ObjectExpressions':
							data.isReturn = true;
							data.isValidReturn = false;
							for (let i = 0; i < expression.properties.length; i++) {
								if (this._findChromeExpression(expression.properties[i].value, this
									._removeObjLink(data), onError)) {
									return true;
								}
							}
							break;
					}
					return false;
				}
				private static _generateOnError(container: TransferOnErrorError[][]): (
					position: TransferOnErrorError, passes: number) => void {
						return (position: TransferOnErrorError, passes: number) => {
							if (!container[passes]) {
								container[passes] = [position];
							} else {
								container[passes].push(position);
							}
						};
					}
				private static _replaceChromeCalls(lines: string[], passes: number,
					onError: TransferOnError): string {
					//Analyze the file
					var file = new window.app._TernFile('[doc]');
					file.text = lines.join('\n');
					var srv = new window.CodeMirror.TernServer({
						defs: []
					});
					window.tern.withContext(srv.cx, () => {
						file.ast = window.tern.parse(file.text, srv.passes, {
							directSourceFile: file,
							allowReturnOutsideFunction: true,
							allowImportExportEverywhere: true,
							ecmaVersion: srv.ecmaVersion
						});
					});

					const scriptExpressions = file.ast.body;

					let index = 0;
					const lineSeperators = [];
					for (let i = 0; i < lines.length; i++) {
						lineSeperators.push({
							start: index,
							end: index += lines[i].length + 1
						});
					}

					let script = file.text;

					//Check all expressions for chrome calls
					const persistentData: {
						lines: any[],
						lineSeperators: any[],
						script: string,
						passes: number,
						diagnostic?: boolean;
					} = {
						lines: lines,
						lineSeperators: lineSeperators,
						script: script,
						passes: passes
					};

					let expression;
					if (passes === 0) {
						//Do one check, not replacing anything, to find any possible errors already
						persistentData.diagnostic = true;
						for (let i = 0; i < scriptExpressions.length; i++) {
							expression = scriptExpressions[i];
							this._findChromeExpression(expression, {
								persistent: persistentData
							} as ChromePersistentData, onError);
						}
						persistentData.diagnostic = false;
					}

					for (let i = 0; i < scriptExpressions.length; i++) {
						expression = scriptExpressions[i];
						if (this._findChromeExpression(expression, {
							persistent: persistentData
						} as ChromePersistentData, onError)) {
							script = this._replaceChromeCalls(persistentData.lines.join('\n')
								.split('\n'), passes + 1, onError);
							break;
						}
					}

					return script;
				}
				private static _removePositionDuplicates(arr: TransferOnErrorError[]):
					TransferOnErrorError[] {
					var jsonArr: EncodedString<TransferOnErrorError>[] = [];
					arr.forEach((item, index) => {
						jsonArr[index] = JSON.stringify(item);
					});
					jsonArr = jsonArr.filter((item, pos) => {
						return jsonArr.indexOf(item) === pos;
					});
					return jsonArr.map((item) => {
						return JSON.parse(item);
					});
				}
				static replace(script: string, onError: (
					oldScriptErrors: TransferOnErrorError[],
					newScriptErrors: TransferOnErrorError[],
					parseError?: boolean
				) => void): string {
					//Remove execute locally
					const lineIndex = script.indexOf('/*execute locally*/');
					if (lineIndex !== -1) {
						script = script.replace('/*execute locally*/\n', '');
						if (lineIndex === script.indexOf('/*execute locally*/')) {
							script = script.replace('/*execute locally*/', '');
						}
					}

					const errors: TransferOnErrorError[][] = [];
					try {
						script = this._replaceChromeCalls(script.split('\n'), 0,
							this._generateOnError(errors));
					} catch (e) {
						onError(null, null, true);
						return script;
					}

					const firstPassErrors = errors[0];
					const finalPassErrors = errors[errors.length - 1];
					if (finalPassErrors) {
						onError(this._removePositionDuplicates(firstPassErrors),
							this._removePositionDuplicates(finalPassErrors));
					}

					return script;
				}
			}
			static generateScriptUpgradeErrorHandler(id: CRM.GenericNodeId): ScriptUpgradeErrorHandler {
				return function (oldScriptErrors, newScriptErrors, parseError) {
					browserAPI.storage.local.get<CRM.StorageLocal>().then((keys) => {
						if (!keys.upgradeErrors) {
							var val: {
								[key: number]: {
									oldScript: CursorPosition[];
									newScript: CursorPosition[];
									generalError: boolean;
								}
							} = {};
							val[id] = {
								oldScript: oldScriptErrors,
								newScript: newScriptErrors,
								generalError: parseError
							};

							keys.upgradeErrors = val;
							window.app.storageLocal.upgradeErrors = val;
						}
						keys.upgradeErrors[id] = window.app.storageLocal.upgradeErrors[id] = {
							oldScript: oldScriptErrors,
							newScript: newScriptErrors,
							generalError: parseError
						};
						browserAPI.storage.local.set({ upgradeErrors: keys.upgradeErrors } as any);
					});
				};
			};
			static convertScriptFromLegacy(script: string, id: CRM.GenericNodeId, method: SCRIPT_CONVERSION_TYPE): string {
				//Remove execute locally
				let usedExecuteLocally = false;
				const lineIndex = script.indexOf('/*execute locally*/');
				if (lineIndex !== -1) {
					script = script.replace('/*execute locally*/\n', '');
					if (lineIndex === script.indexOf('/*execute locally*/')) {
						script = script.replace('/*execute locally*/', '');
					}
					usedExecuteLocally = true;
				}

				try {
					switch (method) {
						case SCRIPT_CONVERSION_TYPE.CHROME:
							script = this.chromeCallsReplace.replace(script,
								this.generateScriptUpgradeErrorHandler(id));
							break;
						case SCRIPT_CONVERSION_TYPE.LOCAL_STORAGE:
							script = usedExecuteLocally ?
								this.localStorageReplace.replaceCalls(script.split('\n')) : script;
							break;
						case SCRIPT_CONVERSION_TYPE.BOTH:
							const localStorageConverted = usedExecuteLocally ?
								this.localStorageReplace.replaceCalls(script.split('\n')) : script;
							script = this.chromeCallsReplace.replace(localStorageConverted,
								this.generateScriptUpgradeErrorHandler(id)
							);
							break;
					}
				} catch (e) {
					return script;
				}

				return script;
			}
		};

		/**
		 * Dom listeners for this node
		 */
		static listeners = class CRMAppListeners {
			static undo() {
				window.app.uploading.revert();
			}

			static _toggleBugReportingTool() {
				window.errorReportingTool.toggleVisibility();
			};

			static toggleTypescript() {
				window.scriptEdit.toggleTypescript();
				window.app.$.editorTypescript.classList.toggle('active');
			}

			static toggleToolsRibbon() {
				const horizontalCenterer = window.crmEditPage.$.horizontalCenterer;
				const bcr = horizontalCenterer.getBoundingClientRect();
				const viewportWidth = bcr.width + 20;

				$(window.doc.editorToolsRibbonContainer).animate({
					marginLeft: window.app.storageLocal.hideToolsRibbon ? '0' : 
						'-200px'
				}, {
					duration: 250,
					easing: ($ as JQueryContextMenu).bez([0.215, 0.610, 0.355, 1.000]),
					step: (now: number) => {
						window.doc.fullscreenEditorEditor.style.width = 
							`${viewportWidth - 200 - now}px`;
						window.doc.fullscreenEditorEditor.style.marginLeft = 
							`${now + 200}px`;
						(window.scriptEdit || window.scriptEdit).getEditorInstance().editor.layout();
					}
				});
				window.app.storageLocal.hideToolsRibbon = !window.app.storageLocal.hideToolsRibbon;
				window.app.upload();
			};

			static launchSearchWebsiteToolScript() {
				if (this.parent().item && this.parent().item.type === 'script' && window.scriptEdit) {
					const paperSearchWebsiteDialog = this.parent().$.paperSearchWebsiteDialog;
					paperSearchWebsiteDialog.init();
					paperSearchWebsiteDialog.setOutputType('script');
					paperSearchWebsiteDialog.show();
				}
			};

			static launchSearchWebsiteToolLink() {
				const paperSearchWebsiteDialog = this.parent().$.paperSearchWebsiteDialog;
				paperSearchWebsiteDialog.init();
				paperSearchWebsiteDialog.setOutputType('link');
				paperSearchWebsiteDialog.show();
			};

			static launchExternalEditorDialog() {
				if (!(window.doc.externalEditorDialogTrigger as HTMLElement & {
					disabled: boolean;
				}).disabled) {
					window.externalEditor.init();
					window.externalEditor.editingCRMItem = window.codeEditBehavior.getActive().item as any;
					window.externalEditor.setupExternalEditing();
				}
			};

			static runLint() {
				window.app.util.getDialog().getEditorInstance().runLinter();
			};

			static showCssTips() {
				window.doc.cssEditorInfoDialog.open();
			};

			static async showManagePermissions() {
				if (browserAPI.permissions) {
					await this.parent()._requestPermissions([], true);
				} else {
					window.app.util.showToast(this.parent().___(I18NKeys.crmApp.code.permissionsNotSupported));
				}
			};

			static iconSwitch(e: Polymer.ClickEvent, types: {
				x?: any;
			}|boolean[]) {
				let parentCrmTypes = this.parent().crmTypes;
				if (typeof parentCrmTypes === 'number') {
					const arr = [false, false, false, false, false, false];
					arr[parentCrmTypes] = true;
					parentCrmTypes = arr;
				} else {
					parentCrmTypes = [...parentCrmTypes];
				}
				let selectedTypes = parentCrmTypes;
				if (Array.isArray(types)) {
					for (let i = 0; i < 6; i++) {
						let crmEl = <unknown>this.parent().shadowRoot.querySelectorAll('.crmType')[i] as HTMLElement;
						if (types[i]) {
							crmEl.classList.add('toggled');
						} else {
							crmEl.classList.remove('toggled');
						}
					}
					selectedTypes = [...types];
				} else {
					const element = this.parent().util.findElementWithClassName(e, 'crmType');
					const crmTypes = this.parent().shadowRoot.querySelectorAll('.crmType');
					for (let i = 0; i < 6; i++) {
						let crmEl = <unknown>crmTypes[i] as HTMLElement;
						if (crmEl === element) {
							//Toggle this element
							if (!selectedTypes[i]) {
								//Toggle it on
								crmEl.classList.add('toggled');
							} else {
								//Toggle it off
								crmEl.classList.remove('toggled');
							}
							selectedTypes[i] = !selectedTypes[i];
						}
					}
				}
				browserAPI.storage.local.set({
					selectedCrmType: selectedTypes
				});
				for (let i = 0; i < 6; i++) {
					if (this.parent().crmTypes[i] !== selectedTypes[i]) {
						this.parent().fire('crmTypeChanged', {});
						break;
					}
				}
				this.parent().crmTypes = selectedTypes;
			};

			private static _getDownloadPermission(callback: (allowed: boolean) => void) {
				if (BrowserAPI.getSrc().downloads && BrowserAPI.getSrc().downloads.download) {
					callback(true);
					return;
				}

				if (!(BrowserAPI.getSrc().permissions)) {
					window.app.util.showToast(this.parent().___(I18NKeys.crmApp.code.downloadNotSupported));
					callback(false);
					return;
				}

				browserAPI.permissions.contains({
					permissions: ['downloads']
				}).then(async (granted) => {
					if (granted) {
						callback(true);
					} else {
						browserAPI.permissions.request({
							permissions: ['downloads']
						}).then((granted) => {
							//Refresh browserAPI object
							browserAPI.downloads = browserAPI.downloads || BrowserAPI.getDownloadAPI();
							callback(granted);
						});
					}
				});
			}

			static async _generateRegexFile() {
				const filePath = this.parent().$.URISchemeFilePath.$$('input').value.replace(/\\/g, '\\\\');
				const schemeName = this.parent().$.URISchemeSchemeName.$$('input').value;

				const regFile = [
					'Windows Registry Editor Version 5.00',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + ']',
					'@="URL:' + schemeName + ' Protocol"',
					'"URL Protocol"=""',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell]',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open]',
					'',
					'[HKEY_CLASSES_ROOT\\' + schemeName + '\\shell\\open\\command]',
					'@="\\"' + filePath + '\\""'
				].join('\n');
				this._getDownloadPermission((allowed) => {
					if (allowed) {
						if (browserAPI.downloads) {
							browserAPI.downloads.download({
								url: 'data:text/plain;charset=utf-8;base64,' + window.btoa(regFile),
								filename: schemeName + '.reg'
							});
						} else {
							window.app.util.showToast(this.parent().___(I18NKeys.crmApp.code.downloadNotSupported));
						}
					}
				});
			};

			static globalExcludeChange(e: Polymer.ClickEvent) {
				const input = this.parent().util.findElementWithTagname(e, 'paper-input');

				let excludeIndex = null;
				const allExcludes = document.getElementsByClassName('globalExcludeContainer');
				for (let i = 0; i < allExcludes.length; i++) {
					if (allExcludes[i] === input.parentNode) {
						excludeIndex = i;
						break;
					}
				}
				if (excludeIndex === null) {
					return;
				}

				const value = input.$$('input').value;
				this.parent().globalExcludes[excludeIndex] = value;
				this.parent().set('globalExcludes', this.parent().globalExcludes);
				browserAPI.storage.local.set({
					globalExcludes: this.parent().globalExcludes
				} as any);
			};


			static removeGlobalExclude(e: Polymer.ClickEvent) {
				const node = this.parent().util.findElementWithTagname(e, 'paper-icon-button');

				let excludeIndex = null;
				const allExcludes = document.getElementsByClassName('globalExcludeContainer');
				for (let i = 0; i < allExcludes.length; i++) {
					if (allExcludes[i] === node.parentNode) {
						excludeIndex = i;
						break;
					}
				}
				if (excludeIndex === null) {
					return;
				}

				this.parent().splice('globalExcludes', excludeIndex, 1);
			};

			static async importData() {
				const dataString = this.parent().$.importSettingsInput.value as EncodedString<{
					local?: CRM.StorageLocal;
					storageLocal?: CRM.StorageLocal;
					settings: CRM.SettingsStorage;
				}>;
				if (!this.parent().$.oldCRMImport.checked) {
					let data: {
						crm?: CRM.Tree;
						local?: CRM.StorageLocal;
						nonLocal?: CRM.SettingsStorage;
						storageLocal?: CRM.StorageLocal;
					};
					try {
						data = JSON.parse(dataString);
						this.parent().$.importSettingsError.style.display = 'none';
					} catch (e) {
						this.parent().$.importSettingsError.style.display = 'block';
						return;
					}

					window.app.uploading.createRevertPoint();
					const overWriteImport = this.parent().$.overWriteImport;
					if (overWriteImport.checked && (data.local || data.storageLocal)) {
						this.parent().settings = data.nonLocal || this.parent().settings;
						this.parent().storageLocal = data.local || this.parent().storageLocal;
					}
					if (data.crm) {
						if (overWriteImport.checked) {
							this.parent().settings.crm = this.parent().util.crmForEach(data.crm, (node) => {
								node.id = this.parent().generateItemId();
							});
						} else {
							this.parent()._addImportedNodes(data.crm);
						}
						this.parent().editCRM.build();
					}
					//Apply settings
					this.parent()._setup.initCheckboxes(this.parent().storageLocal);
					this.parent().upload();
				} else {
					try {
						const settingsArr: any[] = dataString.split('%146%');
						if (settingsArr[0] === 'all') {
							this.parent().storageLocal.showOptions = settingsArr[2];

							const rows = settingsArr.slice(6);
							class LocalStorageWrapper {
								getItem(index: 'numberofrows' | number): string {
									if (index === 'numberofrows') {
										return '' + (rows.length - 1);
									}
									return rows[index];
								}
							}

							window.app.uploading.createRevertPoint();

							const crm = await this.parent()._transferCRMFromOld(settingsArr[4], new LocalStorageWrapper());
							this.parent().settings.crm = crm;
							this.parent().editCRM.build();
							this.parent()._setup.initCheckboxes(this.parent().storageLocal);
							this.parent().upload();
						} else {
							alert('This method of importing no longer works, please export all your settings instead');
						}
					} catch (e) {
						this.parent().$.importSettingsError.style.display = 'block';
						return;
					}
				}
				this.parent().util.showToast(this.parent().___(I18NKeys.crmApp.code.importSuccess));
			};

			static exportData() {
				const toExport: {
					crm?: CRM.SafeTree;
					local?: CRM.StorageLocal;
					nonLocal?: CRM.SettingsStorage;
				} = {} as any;
				if (this.parent().$.exportCRM.checked) {
					toExport.crm = JSON.parse(JSON.stringify(this.parent().settings.crm));
					for (let i = 0; i < toExport.crm.length; i++) {
						toExport.crm[i] = this.parent().editCRM.makeNodeSafe(toExport.crm[i] as CRM.Node);
					}
				}
				if (this.parent().$.exportSettings.checked) {
					toExport.local = this.parent().storageLocal;
					toExport.nonLocal = JSON.parse(JSON.stringify(this.parent().settings));
					delete toExport.nonLocal.crm;
				}
				window.doc.exportSettingsSpinner.hide = false;
				window.setTimeout(() => {
					this.parent().$.exportSettingsOutput.value = JSON.stringify(toExport);
					window.requestAnimationFrame(() => {
						window.doc.exportSettingsSpinner.hide = true;
					});
				}, 100);
			};


			static addGlobalExcludeField() {
				this.parent().push('globalExcludes', '');
			};


			static _openLogging() {
				window.open(browserAPI.runtime.getURL('html/logging.html'), '_blank');
			};

			static hideGenericToast() {
				this.parent().$.messageToast.hide();
			};

			static nextUpdatedScript() {
				let index = this.parent().$.scriptUpdatesToast.index;
				this.parent().$.scriptUpdatesToast.text = this.parent()._getUpdatedScriptString(
					this.parent().$.scriptUpdatesToast.scripts[++index]);
				this.parent().$.scriptUpdatesToast.index = index;

				if (this.parent().$.scriptUpdatesToast.scripts.length - index > 1) {
					this.parent().$.nextScriptUpdateButton.style.display = 'inline';
				} else {
					this.parent().$.nextScriptUpdateButton.style.display = 'none';
				}
			};

			static hideScriptUpdatesToast() {
				this.parent().$.scriptUpdatesToast.hide();
			};

			private static _copyFromElement(target: HTMLTextAreaElement, button: HTMLPaperIconButtonElement) {
				const snipRange = document.createRange();
				snipRange.selectNode(target);
				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(snipRange);

				try {
					document.execCommand('copy');
					button.icon = 'done';
				} catch (err) {
					// Copy command is not available
					console.error(err);
					button.icon = 'error';
				}
				// Return to the copy button after a second.
				this.parent().async(function () {
					button.icon = 'content-copy';
				}, 1000);
				selection.removeAllRanges();
			}

			static copyExportDialogToClipboard() {
				this._copyFromElement(this.parent().$.exportJSONData,
					this.parent().$.dialogCopyButton);
			};

			static copyExportToClipboard() {
				this._copyFromElement(this.parent().$.exportSettingsOutput,
					this.parent().$.exportCopyButton);
			}

			static goNextVersionUpdateTab() {
				if (this.parent().versionUpdateTab === 4) {
					this.parent().$.versionUpdateDialog.close();
				} else {
					const nextTabIndex = this.parent().versionUpdateTab + 1;
					const tabs = (document.getElementsByClassName('versionUpdateTab') as any) as HTMLElement[];
					const selector = tabs[nextTabIndex];
					selector.style.height = 'auto';

					let i;
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'none';
					}
					const newHeight = $(selector).innerHeight();
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'block';
					}
					selector.style.height = '0';

					const newHeightPx = newHeight + 'px';
					const tabCont = this.parent().$.versionUpdateTabSlider;

					const currentHeight = tabCont.getBoundingClientRect().height;
					if (newHeight > currentHeight) {
						tabCont.animate([
							{
								height: currentHeight + 'px'
							}, {
								height: newHeightPx
							}
						], {
							duration: 500,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}).onfinish = () => {
							tabCont.style.height = newHeightPx;
							selector.style.height = 'auto';
							this.parent().versionUpdateTab = nextTabIndex;
						};
					} else {
						selector.style.height = 'auto';
						this.parent().versionUpdateTab = nextTabIndex;
						setTimeout(function () {
							tabCont.animate([
								{
									height: currentHeight + 'px'
								}, {
									height: newHeightPx
								}
							], {
								duration: 500,
								easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
							}).onfinish = function () {
								tabCont.style.height = newHeightPx;
							};
						}, 500);
					}
				}
			}

			static goPrevVersionUpdateTab() {
				if (this.parent().versionUpdateTab !== 0) {
					const prevTabIndex = this.parent().versionUpdateTab - 1;
					const tabs = (document.getElementsByClassName('versionUpdateTab') as any) as HTMLElement[];
					const selector = tabs[prevTabIndex];
					selector.style.height = 'auto';

					let i;
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'none';
					}
					const newHeight = $(selector).innerHeight();
					for (i = 0; i < tabs.length; i++) {
						tabs[i].style.display = 'block';
					}
					selector.style.height = '0';

					const newHeightPx = newHeight + 'px';
					const tabCont = this.parent().$.versionUpdateTabSlider;

					const currentHeight = tabCont.getBoundingClientRect().height;
					if (newHeight > currentHeight) {
						tabCont.animate([{
							height: currentHeight + 'px'
						}, {
							height: newHeightPx
						}], {
							duration: 500,
							easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
						}).onfinish = () => {
							tabCont.style.height = newHeightPx;
							selector.style.height = 'auto';
							this.parent().versionUpdateTab = prevTabIndex;
						};
					} else {
						selector.style.height = 'auto';
						this.parent().versionUpdateTab = prevTabIndex;
						setTimeout(function () {
							tabCont.animate([{
								height: currentHeight + 'px'
							}, {
								height: newHeightPx
							}], {
								duration: 500,
								easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
							}).onfinish = function () {
								tabCont.style.height = newHeightPx;
							};
						}, 500);
					}
				}
			};

			private static _applyAddedPermissions() {
				const panels = Array.prototype.slice.apply(
					window.doc.addedPermissionsTabContainer
						.querySelectorAll('.nodeAddedPermissionsCont'));
				panels.forEach((panel: HTMLElement) => { 
					const node = this.parent().nodesById
						.get(~~(panel.getAttribute('data-id') as any) as CRM.GenericNodeId) as CRM.ScriptNode;
					const permissions = Array.prototype.slice.apply(panel.querySelectorAll('paper-checkbox'))
						.map(function (checkbox: HTMLPaperCheckboxElement) {
							if (checkbox.checked) {
								return checkbox.getAttribute('data-permission');
							}
							return null;
						}).filter(function (permission: string) {
							return !!permission;
						});
					if (!Array.isArray(node.permissions)) {
						node.permissions = [];
					}
					permissions.forEach(function (addedPermission: CRM.Permission) {
						if (node.permissions.indexOf(addedPermission) === -1) {
							node.permissions.push(addedPermission);
						}
					});
				});
				this.parent().upload();
			};

			static addedPermissionNext() {
				const cont = window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer;
				if (cont.tab === cont.maxTabs - 1) {
					window.doc.addedPermissionsDialog.close();
					this._applyAddedPermissions();
					return;
				}

				if (cont.tab + 2 !== cont.maxTabs) {
					(window.doc.addedPermissionNextButton.querySelector('.close') as HTMLElement).style.display = 'none';
					(window.doc.addedPermissionNextButton.querySelector('.next') as HTMLElement).style.display = 'block';
				} else {
					(window.doc.addedPermissionNextButton.querySelector('.close') as HTMLElement).style.display = 'block';
					(window.doc.addedPermissionNextButton.querySelector('.next') as HTMLElement).style.display = 'none';
				}
				cont.style.marginLeft = (++cont.tab * -800) + 'px';
				window.doc.addedPermissionPrevButton.style.display = 'block';
			};

			static addedPermissionPrev() {
				const cont = window.doc.addedPermissionsTabContainer as AddedPermissionsTabContainer;
				cont.style.marginLeft = (--cont.tab * -800) + 'px';

				window.doc.addedPermissionPrevButton.style.display = (cont.tab === 0 ? 'none' : 'block');
			};

			private static _getCodeSettingsFromDialog(): CRM.Options {
				const obj: CRM.Options = {};
				Array.prototype.slice.apply(this.parent().shadowRoot.querySelectorAll('.codeSettingSetting'))
					.forEach((element: HTMLElement) => {
						let value: CRM.OptionsValue;
						const key = element.getAttribute('data-key');
						const type = element.getAttribute('data-type') as CRM.OptionsValue['type'];
						const currentVal = (this.parent().$.codeSettingsDialog.item.value.options as CRM.Options)[key];
						switch (type) {
							case 'number':
								value = this.parent().templates.mergeObjects(currentVal, {
									value: ~~element.querySelector('paper-input').value
								});
								break;
							case 'string':
								value = this.parent().templates.mergeObjects(currentVal, {
									value: element.querySelector('paper-input').value
								});
								break;
							case 'color':
								value = this.parent().templates.mergeObjects(currentVal, {
									value: element.querySelector('input').value
								});
								break;
							case 'boolean':
								value = this.parent().templates.mergeObjects(currentVal, {
									value: element.querySelector('paper-checkbox').checked
								});
								break;
							case 'choice':
								value = this.parent().templates.mergeObjects(currentVal, {
									selected: element.querySelector('paper-dropdown-menu').selected
								});
								break;
							case 'array':
								const arrayInput = element.querySelector('paper-array-input');
								arrayInput.saveSettings();
								let values = arrayInput.values;
								if ((currentVal as CRM.OptionArray).items === 'string') {
									//Strings
									values = values.map(value => value + '');
								} else {
									//Numbers
									values = values.map(value => ~~value);
								}
								value = this.parent().templates.mergeObjects(currentVal, {
									value: values
								});
								break;
						}
						obj[key] = value;
					});
				return obj;
			}

			static confirmCodeSettings() {
				this.parent().$.codeSettingsDialog.item.value.options = this._getCodeSettingsFromDialog();

				this.parent().upload();
			}

			static exitFullscreen() {
				window.app.util.getDialog().exitFullScreen();
			}

			static toggleFullscreenOptions() {
				const dialog = window.app.util.getDialog();
				dialog.toggleOptions();
			}

			static setThemeWhite() {
				window.app.util.getDialog().setThemeWhite();
			}

			static setThemeDark() {
				window.app.util.getDialog().setThemeDark();
			}

			static fontSizeChange() {
				window.app.async(() => {
					window.app.util.getDialog().fontSizeChange();
				}, 0);
			}

			static jsLintGlobalsChange() {
				window.app.async(() => {
					window.scriptEdit.jsLintGlobalsChange();
				}, 0);
			}

			static onKeyBindingKeyDown(e: Polymer.PolymerKeyDownEvent) {
				if (this.parent().item.type === 'script') {
					window.scriptEdit.onKeyBindingKeyDown(e);
				}
			}

			static parent() {
				return window.app;
			}
		}

		/**
		 * Any templates
		 */
		static templates = class CRMAppTemplates {
			/**
			 * Merges two arrays
			 */
			static mergeArrays<T extends T[] | U[], U>(mainArray: T, additionArray: T): T {
				for (let i = 0; i < additionArray.length; i++) {
					if (mainArray[i] && typeof additionArray[i] === 'object' &&
						mainArray[i] !== undefined && mainArray[i] !== null) {
						if (Array.isArray(additionArray[i])) {
							mainArray[i] = this.mergeArrays<T, U>(mainArray[i] as T,
								additionArray[i] as T);
						} else {
							mainArray[i] = this.mergeObjects(mainArray[i], additionArray[i]);
						}
					} else {
						mainArray[i] = additionArray[i];
					}
				}
				return mainArray;
			};

			/**
			 * Merges two objects
			 */
			static mergeObjects<T extends {
				[key: string]: any;
				[key: number]: any;
			}, Y extends Partial<T>>(mainObject: T, additions: Y): T & Y {
				for (let key in additions) {
					if (additions.hasOwnProperty(key)) {
						if (typeof additions[key] === 'object' &&
							typeof mainObject[key] === 'object' &&
							mainObject[key] !== undefined &&
							mainObject[key] !== null) {
							if (Array.isArray(additions[key])) {
								mainObject[key] = this.mergeArrays(mainObject[key], additions[key]);
							} else {
								mainObject[key] = this.mergeObjects(mainObject[key], additions[key]);
							}
						} else {
							mainObject[key] = (additions[key] as any) as T[keyof T];
						}
					}
				}
				return mainObject as T & Y;
			};

			static mergeArraysWithoutAssignment<T extends T[] | U[], U>(mainArray: T, additionArray: T) {
				for (let i = 0; i < additionArray.length; i++) {
					if (mainArray[i] && typeof additionArray[i] === 'object' &&
						mainArray[i] !== undefined && mainArray[i] !== null) {
						if (Array.isArray(additionArray[i])) {
							this.mergeArraysWithoutAssignment<T, U>(mainArray[i] as T,
								additionArray[i] as T);
						} else {
							this.mergeObjectsWithoutAssignment(mainArray[i], additionArray[i]);
						}
					} else {
						mainArray[i] = additionArray[i];
					}
				}
			}

			static mergeObjectsWithoutAssignment<T extends {
				[key: string]: any;
				[key: number]: any;
			}, Y extends Partial<T>>(mainObject: T, additions: Y) {
				for (let key in additions) {
					if (additions.hasOwnProperty(key)) {
						if (typeof additions[key] === 'object' &&
							mainObject[key] !== undefined &&
							mainObject[key] !== null) {
							if (Array.isArray(additions[key])) {
								this.mergeArraysWithoutAssignment(mainObject[key], additions[key]);
							} else {
								this.mergeObjectsWithoutAssignment(mainObject[key], additions[key]);
							}
						} else {
							mainObject[key] = additions[key];
						}
					}
				}
			}

			static getDefaultNodeInfo(options: Partial<CRM.NodeInfo> = {}): CRM.NodeInfo {
				const defaultNodeInfo: Partial<CRM.NodeInfo> = {
					permissions: [],
					installDate: new Date().toLocaleDateString(),
					lastUpdatedAt: Date.now(),
					version: '1.0',
					isRoot: false,
					source: 'local'
				};

				return this.mergeObjects(defaultNodeInfo, options) as CRM.NodeInfo;
			};

			/**
			 * Gets the default link node object with given options applied
			 */
			static getDefaultLinkNode(options: Partial<CRM.LinkNode> = {}): CRM.LinkNode {
				const defaultNode: Partial<CRM.LinkNode> = {
					name: this.parent().___(I18NKeys.crm.exampleLinkName),
					onContentTypes: [true, true, true, false, false, false],
					type: 'link',
					showOnSpecified: false,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [{
						url: '*://*.example.com/*',
						not: false
					}],
					isLocal: true,
					value: [
						{
							newTab: true,
							url: 'https://www.example.com'
						}
					]
				};

				return this.mergeObjects(defaultNode, options) as CRM.LinkNode;
			};

			/**
			 * Gets the default stylesheet value object with given options applied
			 */
			static getDefaultStylesheetValue(options: Partial<CRM.StylesheetVal> = {}): CRM.StylesheetVal {
				const value: CRM.StylesheetVal = {
					stylesheet: [].join('\n'),
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					toggle: false,
					defaultOn: false,
					options: {},
					convertedStylesheet: null
				};

				return this.mergeObjects(value, options) as CRM.StylesheetVal;
			};

			/**
			 * Gets the default script value object with given options applied
			 */
			static getDefaultScriptValue(options: Partial<CRM.ScriptVal> = {}): CRM.ScriptVal {
				const value: CRM.ScriptVal = {
					launchMode: CRMLaunchModes.RUN_ON_CLICKING,
					backgroundLibraries: [],
					libraries: [],
					script: [].join('\n'),
					backgroundScript: '',
					metaTags: {},
					options: {},
					ts: {
						enabled: false,
						backgroundScript: {},
						script: {}
					}
				};

				return this.mergeObjects(value, options) as CRM.ScriptVal;
			};

			/**
			 * Gets the default script node object with given options applied
			 */
			static getDefaultScriptNode(options: CRM.PartialScriptNode = {}): CRM.ScriptNode {
				const defaultNode: CRM.PartialScriptNode = {
					name: this.parent().___(I18NKeys.crm.exampleScriptName),
					onContentTypes: [true, true, true, false, false, false],
					type: 'script',
					isLocal: true,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [
						{
							url: '*://*.example.com/*',
							not: false
						}
					],
					value: this.getDefaultScriptValue(options.value)
				};

				return this.mergeObjects(defaultNode, options) as CRM.ScriptNode;
			};

			/**
			 * Gets the default stylesheet node object with given options applied
			 */
			static getDefaultStylesheetNode(options: CRM.PartialStylesheetNode = {}): CRM.StylesheetNode {
				const defaultNode: CRM.PartialStylesheetNode = {
					name: this.parent().___(I18NKeys.crm.exampleStylesheetName),
					onContentTypes: [true, true, true, false, false, false],
					type: 'stylesheet',
					isLocal: true,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					triggers: [
						{
							url: '*://*.example.com/*',
							not: false
						}
					],
					value: this.getDefaultStylesheetValue(options.value)
				};

				return this.mergeObjects(defaultNode, options) as CRM.StylesheetNode;
			};

			/**
			 * Gets the default divider or menu node object with given options applied
			 */
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'divider' | 'menu'):
				CRM.DividerNode | CRM.MenuNode;
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'divider'): CRM.DividerNode;
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode>, type: 'menu'): CRM.MenuNode;
			static getDefaultDividerOrMenuNode(options: Partial<CRM.PassiveNode> = {}, type: 'divider' | 'menu'):
				CRM.DividerNode | CRM.MenuNode {
				const defaultNode: Partial<CRM.PassiveNode> = {
					name: type === 'menu' ? 
						this.parent().___(I18NKeys.crm.exampleMenuName) : 
						this.parent().___(I18NKeys.crm.exampleDividerName),
					type: type,
					nodeInfo: this.getDefaultNodeInfo(options.nodeInfo),
					onContentTypes: [true, true, true, false, false, false],
					isLocal: true,
					value: null,
					children: type === 'menu' ? [] : undefined
				};

				return this.mergeObjects(defaultNode, options) as CRM.DividerNode | CRM.MenuNode;
			};

			/**
			 * Gets the default divider node object with given options applied
			 */
			static getDefaultDividerNode(options: Partial<CRM.DividerNode> = {}): CRM.DividerNode {
				return this.getDefaultDividerOrMenuNode(options, 'divider');
			};

			/**
			 * Gets the default menu node object with given options applied
			 */
			static getDefaultMenuNode(options: Partial<CRM.MenuNode> = {}): CRM.MenuNode {
				return this.getDefaultDividerOrMenuNode(options, 'menu');
			};

			/**
			 * Gets the default node of given type
			 */
			static getDefaultNodeOfType(type: CRM.NodeType, options: Partial<CRM.Node> = {}): CRM.Node {
				switch (type) {
					case 'link':
						return this.getDefaultLinkNode(options as Partial<CRM.LinkNode>);
					case 'script':
						return this.getDefaultScriptNode(options as Partial<CRM.ScriptNode>);
					case 'divider':
						return this.getDefaultDividerNode(options as Partial<CRM.DividerNode>);
					case 'menu':
						return this.getDefaultMenuNode(options as Partial<CRM.MenuNode>);
					case 'stylesheet':
						return this.getDefaultStylesheetNode(options as Partial<CRM.StylesheetNode>);
				}
			}

			/**
			 * Gets all permissions that can be requested by this extension
			 */
			static getPermissions(): CRM.Permission[] {
				return [
					'alarms',
					'activeTab',
					'background',
					'bookmarks',
					'browsingData',
					'clipboardRead',
					'clipboardWrite',
					'contentSettings',
					'cookies',
					'contentSettings',
					'contextMenus',
					'declarativeContent',
					'desktopCapture',
					'downloads',
					'history',
					'identity',
					'idle',
					'management',
					'pageCapture',
					'power',
					'privacy',
					'printerProvider',
					'sessions',
					'system.cpu',
					'system.memory',
					'system.storage',
					'topSites',
					'tabs',
					'tabCapture',
					'tts',
					'webNavigation',
					'webRequest',
					'webRequestBlocking'
				];
			};

			/**
			 * Gets all permissions that can be requested by this extension including those specific to scripts
			 */
			static getScriptPermissions(): CRM.Permission[] {
				return [
					'alarms',
					'activeTab',
					'background',
					'bookmarks',
					'browsingData',
					'clipboardRead',
					'clipboardWrite',
					'contentSettings',
					'cookies',
					'contentSettings',
					'contextMenus',
					'declarativeContent',
					'desktopCapture',
					'downloads',
					'history',
					'identity',
					'idle',
					'management',
					'pageCapture',
					'power',
					'privacy',
					'printerProvider',
					'sessions',
					'system.cpu',
					'system.memory',
					'system.storage',
					'topSites',
					'tabs',
					'tabCapture',
					'tts',
					'webNavigation',
					'webRequest',
					'webRequestBlocking',

					//Script-specific permissions
					'crmGet',
					'crmWrite',
					'crmRun',
					'crmContextmenu',
					'chrome',
					'browser',

					//GM_Permissions
					'GM_info',
					'GM_deleteValue',
					'GM_getValue',
					'GM_listValues',
					'GM_setValue',
					'GM_getResourceText',
					'GM_getResourceURL',
					'GM_addStyle',
					'GM_log',
					'GM_openInTab',
					'GM_registerMenuCommand',
					'GM_setClipboard',
					'GM_xmlhttpRequest',
					'unsafeWindow'
				];
			};

			/**
			 * Gets the description for given permission
			 */
			static getPermissionDescription(permission: CRM.Permission): string {
				const descriptions = {
					alarms: this.parent().___(I18NKeys.permissions.alarms),
					activeTab: this.parent().___(I18NKeys.permissions.activeTab),
					background: this.parent().___(I18NKeys.permissions.background),
					bookmarks: this.parent().___(I18NKeys.permissions.bookmarks),
					browsingData: this.parent().___(I18NKeys.permissions.browsingData),
					clipboardRead: this.parent().___(I18NKeys.permissions.clipboardRead),
					clipboardWrite: this.parent().___(I18NKeys.permissions.clipboardWrite),
					cookies: this.parent().___(I18NKeys.permissions.cookies),
					contentSettings: this.parent().___(I18NKeys.permissions.contentSettings),
					contextMenus: this.parent().___(I18NKeys.permissions.contextMenus),
					declarativeContent: this.parent().___(I18NKeys.permissions.declarativeContent),
					desktopCapture: this.parent().___(I18NKeys.permissions.desktopCapture),
					downloads: this.parent().___(I18NKeys.permissions.downloads),
					history: this.parent().___(I18NKeys.permissions.history),
					identity: this.parent().___(I18NKeys.permissions.identity),
					idle: this.parent().___(I18NKeys.permissions.idle),
					management: this.parent().___(I18NKeys.permissions.management),
					notifications: this.parent().___(I18NKeys.permissions.notifications),
					pageCapture: this.parent().___(I18NKeys.permissions.pageCapture),
					power: this.parent().___(I18NKeys.permissions.power),
					privacy: this.parent().___(I18NKeys.permissions.privacy),
					printerProvider: this.parent().___(I18NKeys.permissions.printerProvider),
					sessions: this.parent().___(I18NKeys.permissions.sessions),
					"system.cpu": this.parent().___(I18NKeys.permissions.systemcpu),
					"system.memory": this.parent().___(I18NKeys.permissions.systemmemory),
					"system.storage": this.parent().___(I18NKeys.permissions.systemstorage),
					topSites: this.parent().___(I18NKeys.permissions.topSites),
					tabCapture: this.parent().___(I18NKeys.permissions.tabCapture),
					tabs: this.parent().___(I18NKeys.permissions.tabs),
					tts: this.parent().___(I18NKeys.permissions.tts),
					webNavigation: this.parent().___(I18NKeys.permissions.webNavigation) +
					' (https://developer.chrome.com/extensions/webNavigation)',
					webRequest: this.parent().___(I18NKeys.permissions.webRequest),
					webRequestBlocking: this.parent().___(I18NKeys.permissions.webRequestBlocking),

					//Script-specific descriptions
					crmGet: this.parent().___(I18NKeys.permissions.crmGet),
					crmWrite: this.parent().___(I18NKeys.permissions.crmWrite),
					crmRun: this.parent().___(I18NKeys.permissions.crmRun),
					crmContextmenu: this.parent().___(I18NKeys.permissions.crmContextmenu),
					chrome: this.parent().___(I18NKeys.permissions.chrome),
					browser: this.parent().___(I18NKeys.permissions.browser),

					//Tampermonkey APIs
					GM_addStyle: this.parent().___(I18NKeys.permissions.GMAddStyle),
					GM_deleteValue: this.parent().___(I18NKeys.permissions.GMDeleteValue),
					GM_listValues: this.parent().___(I18NKeys.permissions.GMListValues),
					GM_addValueChangeListener: this.parent().___(I18NKeys.permissions.GMAddValueChangeListener),
					GM_removeValueChangeListener: this.parent().___(I18NKeys.permissions.GMRemoveValueChangeListener),
					GM_setValue: this.parent().___(I18NKeys.permissions.GMSetValue),
					GM_getValue: this.parent().___(I18NKeys.permissions.GMGetValue),
					GM_log: this.parent().___(I18NKeys.permissions.GMLog),
					GM_getResourceText: this.parent().___(I18NKeys.permissions.GMGetResourceText),
					GM_getResourceURL: this.parent().___(I18NKeys.permissions.GMGetResourceURL),
					GM_registerMenuCommand: this.parent().___(I18NKeys.permissions.GMRegisterMenuCommand),
					GM_unregisterMenuCommand: this.parent().___(I18NKeys.permissions.GMUnregisterMenuCommand),
					GM_openInTab: this.parent().___(I18NKeys.permissions.GMOpenInTab),
					GM_xmlhttpRequest: this.parent().___(I18NKeys.permissions.GMXmlhttpRequest),
					GM_download: this.parent().___(I18NKeys.permissions.GMDownload),
					GM_getTab: this.parent().___(I18NKeys.permissions.GMGetTab),
					GM_saveTab: this.parent().___(I18NKeys.permissions.GMSaveTab),
					GM_getTabs: this.parent().___(I18NKeys.permissions.GMGetTabs),
					GM_notification: this.parent().___(I18NKeys.permissions.GMNotification),
					GM_setClipboard: this.parent().___(I18NKeys.permissions.GMSetClipboard),
					GM_info: this.parent().___(I18NKeys.permissions.GMInfo),
					unsafeWindow: this.parent().___(I18NKeys.permissions.unsafeWindow)
				};

				return descriptions[permission as keyof typeof descriptions];
			};

			static parent(): CrmApp {
				return window.app;
			}
		};

		/**
		 * CRM functions.
		 */
		static crm = class CRMAppCRMFunctions {
			static getI18NNodeType(nodeType: CRM.NodeType) {
				switch (nodeType) {
					case 'link':
						return this._parent().___(I18NKeys.crm.link);
					case 'script':
						return this._parent().___(I18NKeys.crm.script);
					case 'stylesheet':
						return this._parent().___(I18NKeys.crm.stylesheet);
					case 'menu':
						return this._parent().___(I18NKeys.crm.menu);
					case 'divider':
						return this._parent().___(I18NKeys.crm.divider);
				}
			}

			static lookup(path: number[], returnArray?: boolean): CRM.Node | CRM.Node[];
			static lookup(path: number[], returnArray: false): CRM.Node;
			static lookup(path: number[], returnArray: true): CRM.Node[];
			static lookup(path: number[]): CRM.Node;
			static lookup(path: number[], returnArray: boolean = false): CRM.Node | CRM.Node[] {
				const pathCopy = JSON.parse(JSON.stringify(path));
				if (returnArray) {
					pathCopy.splice(pathCopy.length - 1, 1);
				}
				if (path.length === 0) {
					return window.app.settings.crm;
				}

				if (path.length === 1) {
					return (returnArray ? window.app.settings.crm : window.app.settings.crm[path[0]]);
				}

				let currentTree = window.app.settings.crm;
				let currentItem: CRM.Node = null;
				let parent: CRM.Node[] = null;
				for (let i = 0; i < path.length; i++) {
					parent = currentTree;
					if (i !== path.length - 1) {
						currentTree = currentTree[path[i]].children as CRM.Node[];
					} else {
						currentItem = currentTree[path[i]];
					}
				}
				return (returnArray ? parent : currentItem);
			};

			private static _lookupId(id: CRM.GenericNodeId, returnArray: boolean, node: CRM.Node): CRM.Node[] | CRM.Node | void;
			private static _lookupId(id: CRM.GenericNodeId, returnArray: false, node: CRM.Node): CRM.Node;
			private static _lookupId(id: CRM.GenericNodeId, returnArray: true, node: CRM.Node): CRM.Node[];
			private static _lookupId(id: CRM.GenericNodeId, returnArray: boolean, node: CRM.Node): CRM.Node[] | CRM.Node | void {
				const nodeChildren = node.children;
				if (nodeChildren) {
					let el;
					for (let i = 0; i < nodeChildren.length; i++) {
						if (nodeChildren[i].id === id) {
							return (returnArray ? nodeChildren : node);
						}
						el = this._lookupId(id, returnArray, nodeChildren[i]);
						if (el) {
							return el;
						}
					}
				}
				return null;
			};

			static lookupId(id: CRM.GenericNodeId, returnArray: boolean): CRM.Node[] | CRM.Node;
			static lookupId(id: CRM.GenericNodeId, returnArray: true): CRM.Node[];
			static lookupId(id: CRM.GenericNodeId, returnArray: false): CRM.Node;
			static lookupId(id: CRM.GenericNodeId, returnArray: boolean): CRM.Node[] | CRM.Node {
				if (!returnArray) {
					return window.app.nodesById.get(id);
				}

				let el;
				for (let i = 0; i < window.app.settings.crm.length; i++) {
					if (window.app.settings.crm[i].id === id) {
						return window.app.settings.crm;
					}
					el = this._lookupId(id, returnArray, window.app.settings.crm[i]);
					if (el) {
						return el;
					}
				}
				return null;
			};

			/**
			 * Adds value to the CRM
			 */
			static add<T extends CRM.Node>(value: T, position: string = 'last') {
				if (position === 'first') {
					this._parent().settings.crm = this._parent().util.insertInto(value, this._parent().settings.crm, 0);
				} else if (position === 'last' || position === undefined) {
					this._parent().settings.crm[this._parent().settings.crm.length] = value;
				} else {
					this._parent().settings.crm = this._parent().util.insertInto(value, this._parent().settings.crm);
				}
				window.app.upload();
				window.app.editCRM.build({
					setItems: window.app.editCRM.setMenus
				});
			};

			/**
			 * Moves a value in the CRM from one place to another
			 */
			static move(toMove: number[], target: number[]) {
				const toMoveContainer = this.lookup(toMove, true);
				let toMoveIndex = toMove[toMove.length - 1];
				const toMoveItem = toMoveContainer[toMoveIndex];

				const newTarget = this.lookup(target, true);
				const targetIndex = target[target.length - 1];

				const sameColumn = toMoveContainer === newTarget;

				if (sameColumn && toMoveIndex > targetIndex) {
					this._parent().util.insertInto(toMoveItem, newTarget, targetIndex);
					toMoveContainer.splice((~~toMoveIndex) + 1, 1);
				} else {
					this._parent().util.insertInto(toMoveItem, newTarget, 
						sameColumn ? targetIndex + 1 : targetIndex);
					toMoveContainer.splice(toMoveIndex, 1);
				}
				window.app.upload();

				//Check if setMenus are still valid
				for (let i = 1; i <= window.app.editCRM.setMenus.length - 1; i++) {
					const lookedup = this.lookup(window.app.editCRM.setMenus.slice(0, i), false);
					if (!lookedup || lookedup.type !== 'menu') {
						window.app.editCRM.setMenus = [-1];
						break;
					}
				}
				window.app.editCRM.build({
					setItems: window.app.editCRM.setMenus,
					quick: true
				});
			};

			static buildNodePaths(tree: CRM.Tree, currentPath: number[] = []) {
				for (let i = 0; i < tree.length; i++) {
					const childPath = currentPath.concat([i]);
					const node = tree[i];
					node.path = childPath;
					if (node.children) {
						this.buildNodePaths(node.children, childPath);
					}
				}
			};

			private static _parent(): CrmApp {
				return window.app;
			}
		};

		/**
		 * Various util functions
		 */
		static util = class CRMAppUtil {
			static iteratePath<T>(e: {
				path: HTMLElement[];
			}|{
				Aa: HTMLElement[];
			}|Polymer.CustomEvent, 
				condition: (element: Polymer.PolymerElement|DocumentFragment|HTMLElement) => T): T {
					let index = 0;
					const path = this.getPath(e);
					let result: T = condition(path[index]);

					while (path[index + 1] && result === null) {
						result = condition(path[++index]);
					}

					return result;
				}

			static arraysOverlap<T>(arr1: T[], arr2: T[]): boolean {
				for (let i = 0; i < arr1.length; i++) {
					if (arr1[i] && arr2[i]) {
						return true;
					}
				}
				return false;
			}

			static wait(time: number) {
				return new Promise<void>((resolve) => {
					window.setTimeout(() => {
						resolve(null);
					}, time);
				});
			}

			static createArray(length: number): void[] {
				const arr = [];
				for (let i = 0; i < length; i++) {
					arr[i] = undefined;
				}
				return arr;
			}

			static getChromeVersion() {
				return this.parent().getChromeVersion();
			}

			static xhr(path: string, local: boolean): Promise<string> {
				return new Promise<string>((resolve, reject) => {
					const xhr: XMLHttpRequest = new window.XMLHttpRequest();
					xhr.open('GET', local ? 
						browserAPI.runtime.getURL(path) : path);
					xhr.onreadystatechange = () => {
						if (xhr.readyState === XMLHttpRequest.DONE) {
							if (xhr.status === 200) {
								resolve(xhr.responseText);
							} else {
								reject(xhr.status);
							}
						}
					}
					xhr.send();
				});
			}

			static showToast(text: string) {
				const toast = window.app.$.messageToast;
				toast.text = text;
				toast.show();
			}

			static createElement<K extends keyof ElementTagNameMaps, T extends ElementTagNameMaps[K]>(tagName: K, options: {
				id?: string;
				classes?: string[];
				props?: {
					[key: string]: string|number;
				}
				onclick?: (el: T, event: Event) => void;
				onhover?: (el: T, event: Event) => void;
				onblur?: (el: T, event: Event) => void;
				ref?: (el: T) => void;
			}, children: (any|string)[] = []): T {
				const el = document.createElement(tagName) as T;
				options.id && (el.id = options.id);
				options.classes && el.classList.add.apply(el.classList, options.classes);
				for (const key in options.props || {}) {
					el.setAttribute(key, options.props[key] + '');
				}
				options.onclick && el.addEventListener('click', (e) => {
					options.onclick(el, e);
				});
				options.onhover && el.addEventListener('mouseenter', (e) => {
					options.onhover(el, e);
				});
				options.onblur && el.addEventListener('mouseleave', (e) => {
					options.onblur(el, e);
				});
				options.ref && options.ref(el);
				for (const child of children) {
					if (typeof child === 'string') {
						(el as HTMLSpanElement).innerText = child;
					} else {
						el.appendChild(child);
					}
				}
				return el;
			}

			static createSVG<K extends keyof SVGElementTagNameMap, T extends SVGElementTagNameMap[K]>(tag: K, options: {
				id?: string;
				classes?: string[];
				props?: {
					[key: string]: string;
				}
			}, children: any[] = []): T {
				const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
				options.id && (el.id = options.id);
				options.classes && el.classList.add.apply(el.classList, options.classes);
				for (const key in options.props || {}) {
					el.setAttributeNS(null, key, options.props[key] + '');
				}
				for (const child of children) {
					el.appendChild(child);
				}
				return el as T;
			}

			private static _toArray<T>(iterable: ArrayLike<T>): T[] {
				const arr = [];
				for (let i = 0; i < iterable.length; i++) {
					arr.push(iterable[i]);
				}
				return arr;
			}

			private static _generatePathFrom(element: HTMLElement): HTMLElement[] {
				const path = [];
				while (element) {
					path.push(element);
					element = element.parentElement;
				}
				path.push(document.documentElement, window);
				return path as HTMLElement[];
			}

			static getPath(e: {
				path: HTMLElement[];
			}|{
				Aa: HTMLElement[];
			}|{
				target: HTMLElement;	
			}|Polymer.CustomEvent) {
				if ('path' in e && e.path) {
					return this._toArray(e.path);
				} else if ('Aa' in e && e.Aa) {
					return this._toArray(e.Aa);
				}
				return this._generatePathFrom((e as {
					target: HTMLElement;
				}).target);
			}

			private static _dummy: HTMLElement = null;
			static getDummy(): HTMLElement {
				if (this._dummy) {
					return this._dummy;
				}
				this._dummy = document.createElement('div');
				this.parent().appendChild(this._dummy);
				return this._dummy;
			}

			static findElementWithTagname<T extends keyof ElementTagNameMaps>(event: {
				path: HTMLElement[];
			}|{
				Aa: HTMLElement[];
			}|Polymer.CustomEvent, tagName: T): ElementTagNameMaps[T] {
				return this.iteratePath(event, (node) => {
					if (node && 'tagName' in node && 
						(node as Polymer.PolymerElement).tagName.toLowerCase() === tagName) {
							return node;
						}
					return null;
				}) as ElementTagNameMaps[T];
			}

			static findElementWithClassName(event: {
				path: HTMLElement[];
			}|{
				Aa: HTMLElement[];
			}|Polymer.CustomEvent, className: string): Polymer.PolymerElement {
				return this.iteratePath(event, (node) => {
					if (node && 'classList' in node && 
						(node as Polymer.PolymerElement).classList.contains(className)) {
							return node;
						}
					return null;
				}) as Polymer.PolymerElement
			};

			static findElementWithId(event: {
				path: HTMLElement[];
			}|{
				Aa: HTMLElement[];
			}|Polymer.CustomEvent, id: string): Polymer.PolymerElement {
				return this.iteratePath(event, (node) => {
					if (node && 'id' in node && 
						(node as Polymer.PolymerElement).id === id) {
							return node;
						}
					return null;
				}) as Polymer.PolymerElement;
			}

			/**
			 * Inserts the value into given array
			 */
			static insertInto<T>(toAdd: T, target: T[], position: number = null): T[] {
				if (position !== null) {
					let temp1, i;
					let temp2 = toAdd;
					for (i = position; i < target.length; i++) {
						temp1 = target[i];
						target[i] = temp2;
						temp2 = temp1;
					}
					target[i] = temp2;
				} else {
					target.push(toAdd);
				}
				return target;
			};

			static compareObj(firstObj: {
				[key: string]: any;
			}, secondObj: {
				[key: string]: any;
			}): boolean {
				if (!secondObj) {
					return !firstObj;

				}
				if (!firstObj) {
					return false;
				}

				for (let key in firstObj) {
					if (firstObj.hasOwnProperty(key)) {
						if (typeof firstObj[key] === 'object') {
							if (typeof secondObj[key] !== 'object') {
								return false;
							}
							if (Array.isArray(firstObj[key])) {
								if (!Array.isArray(secondObj[key])) {
									return false;
								}
								// ReSharper disable once FunctionsUsedBeforeDeclared
								if (!this.compareArray(firstObj[key], secondObj[key])) {
									return false;
								}
							} else if (Array.isArray(secondObj[key])) {
								return false;
							} else {
								if (!this.compareObj(firstObj[key], secondObj[key])) {
									return false;
								}
							}
						} else if (firstObj[key] !== secondObj[key]) {
							return false;
						}
					}
				}
				return true;
			};

			static compareArray(firstArray: any[], secondArray: any[]): boolean {
				if (!firstArray !== !secondArray) {
					return false;
				} else if (!firstArray || !secondArray) {
					return false;
				}
				const firstLength = firstArray.length;
				if (firstLength !== secondArray.length) {
					return false;
				}
				let i;
				for (i = 0; i < firstLength; i++) {
					if (typeof firstArray[i] === 'object') {
						if (typeof secondArray[i] !== 'object') {
							return false;
						}
						if (Array.isArray(firstArray[i])) {
							if (!Array.isArray(secondArray[i])) {
								return false;
							}
							if (!this.compareArray(firstArray[i], secondArray[i])) {
								return false;
							}
						} else if (Array.isArray(secondArray[i])) {
							return false;
						} else {
							if (!this.compareObj(firstArray[i], secondArray[i])) {
								return false;
							}
						}
					} else if (firstArray[i] !== secondArray[i]) {
						return false;
					}
				}
				return true;
			}

			static treeForEach(node: CRM.Node, fn: (node: CRM.Node) => any) {
				fn(node);
				if (node.children) {
					for (let i = 0; i < node.children.length; i++) {
						this.treeForEach(node.children[i], fn);
					}
				}
			}

			static crmForEach(tree: CRM.Node[], fn: (node: CRM.Node) => void): CRM.Tree {
				for (let i = 0; i < tree.length; i++) {
					const node = tree[i];
					if (node.type === 'menu' && node.children) {
						this.crmForEach(node.children, fn);
					}

					fn(node);
				}
				return tree;
			};

			static getQuerySlot() {
				return window.Polymer.PaperDropdownBehavior.querySlot;
			}

			static getDialog(): CodeEditBehaviorInstance {
				return this.parent().item.type === 'script' ?
					window.scriptEdit : window.stylesheetEdit;
			}

			static parent(): CrmApp {
				return window.app;
			}
		}

		static pageDemo = class CRMAppPageDemo {
			private static _active: boolean = false;

			private static _root: HTMLElement = null;

			private static _listeners: {
				event: string;
				handler: EventListener;
			}[] = [];

			private static _setContentTypeClasses(el: HTMLElement, node: CRM.Node) {
				const contentTypes = node.onContentTypes;
				for (let i = 0; i < contentTypes.length; i++) {
					contentTypes[i] && el.classList.add(`contentType${i}`);
				}
			}

			private static _editNodeFromClick(node: CRM.Node) {
				if (window.app.item) {
					window.app.$.messageToast.text = this.parent().___(I18NKeys.crmApp.code.alreadyEditingNode);
					window.app.$.messageToast.show();
				} else {
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

			private static _genDividerNode(node: CRM.DividerNode) {
				return this.parent().util.createElement('div', {
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

			private static _genLinkNode(node: CRM.LinkNode) {
				return this.parent().util.createElement('div', {
					classes: ['contextMenuLink'],
					onclick: () => {
						if (window.app.storageLocal.editCRMInRM) {
							this._editNodeFromClick(node);
						} else {
							node.value.forEach((link) => {
								window.open(link.url, '_blank');
							});
						}
					},
					props: {
						title: `Link node ${node.name}`
					}
				}, [
					this.parent().util.createElement('div', {
						classes: ['contextMenuLinkText']
					}, [node.name])
				]);
			}

			private static _genScriptNode(node: CRM.ScriptNode) {
				return this.parent().util.createElement('div', {
					classes: ['contextMenuScript'],
					onclick: () => {
						if (window.app.storageLocal.editCRMInRM) {
							this._editNodeFromClick(node);
						} else {
							window.app.$.messageToast.text = this.parent().___(I18NKeys.crmApp.code.wouldExecuteScript);
							window.app.$.messageToast.show();
						}
					},
					props: {
						title: `Script node ${node.name}`
					}
				}, [
					this.parent().util.createElement('div', {
						classes: ['contextMenuScriptText']
					}, [node.name])
				]);
			}

			private static _genStylesheetNode(node: CRM.StylesheetNode) {
				return this.parent().util.createElement('div', {
					classes: ['contextMenuStylesheet'],
					onclick: () => {
						if (window.app.storageLocal.editCRMInRM) {
							this._editNodeFromClick(node);
						} else {
							window.app.$.messageToast.text = this.parent().___(I18NKeys.crmApp.code.wouldExecuteStylesheet);
							window.app.$.messageToast.show();
						}
					},
					props: {
						title: `Stylesheet node ${node.name}`
					}
				}, [
					this.parent().util.createElement('div', {
						classes: ['contextMenuStylesheetText']
					}, [node.name])
				]);
			}

			private static _genMenuNode(node: CRM.MenuNode) {
				let timer: number = null;
				let thisEl: HTMLElement = null;
				let container: HTMLElement = null;
				let childrenContainer: HTMLElement = null;
				return this.parent().util.createElement('div', {
					classes: ['contextMenuMenu'],
					ref(el) {
						thisEl = el;
					},
					onclick: () => {
						if (window.app.storageLocal.editCRMInRM) {
							this._editNodeFromClick(node);
						} else {
							window.app.$.messageToast.text = this.parent().___(I18NKeys.crmApp.code.wouldExecuteStylesheet);
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
					this.parent().util.createElement('div', {
						classes: ['contextMenuMenuContainer'],
						ref(_container) {
							container = _container;
						}
					}, [
						this.parent().util.createElement('div', {
							classes: ['contextMenuMenuText']
						}, [node.name]),
						this.parent().util.createElement('div', {
							classes: ['contextMenuMenuArrow']
						}, [
							this.parent().util.createSVG('svg', {
								classes: ['contextMenuMenuArrowImage'],
								props: {
									width: '48',
									height: '48',
									viewBox: '0 0 48 48'
								}
							}, [
								this.parent().util.createSVG('path', {
									props: {
										d: 'M16 10v28l22-14z'
									}
								})
							])
						])
					]),
					this.parent().util.createElement('div', {
						classes: ['contextMenuMenuSubmenu', 
							'contextMenuMenuChildren', 'hidden'],
						ref(el) {
							childrenContainer = el;
						}
					}, (node.children || []).map(childNode => this._genNode(childNode)))
				]);
			}

			private static _genNodeElement(node: CRM.Node) {
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

			private static _genNode(node: CRM.Node): HTMLElement {
				const el = this._genNodeElement(node);
				el.classList.add('contextMenuNode');
				if (window.app.storageLocal.editCRMInRM) {
					el.classList.add('clickable');
				}
				this._setContentTypeClasses(el, node);
				return el;
			}

			private static _genMenu(): HTMLElement {
				const root = document.createElement('div');
				root.classList.add('contextMenuRoot', 
					'contextMenuMenuSubmenu', 'rootHidden');
				const crm = window.app.settings.crm;
				for (const node of crm) {
					root.appendChild(this._genNode(node));
				}
				return root;
			}

			private static _setAllContentTypeClasses(el: HTMLElement, op: 'add'|'remove') {
				const arr: [undefined, undefined, undefined, undefined, undefined, undefined] = [
					undefined, undefined, undefined, undefined, undefined, undefined
				];
				el.classList[op](...arr.map((_item: any, i: number) => `hidden${i}`));
				el.classList[op]('rootHidden');
			}

			private static _setMenuPosition(menu: HTMLElement, e: Polymer.ClickEvent) {
				menu.style.left = `${e.clientX}px`;

				menu.classList.remove('rootHidden');
				const bcr = menu.getBoundingClientRect();
				menu.classList.add('rootHidden');

				if (window.innerHeight > bcr.height + e.clientY) {
					menu.style.top = `${e.clientY}px`;
				} else {
					menu.style.top = `${e.clientY - bcr.height}px`;
				}
			}

			private static _showMenu(menu: HTMLElement, e: Polymer.ClickEvent) {
				this._setMenuPosition(menu, e);
				if (window.app.util.findElementWithId(e, 'mainCont')) {
					//Get the current content type
					for (let i = 0; i < 6; i++) {
						if (window.app.crmTypes[i]) {
							menu.classList.remove(`hidden${i}`);
						}
					}
					menu.classList.remove('rootHidden');
				} else {
					this._setAllContentTypeClasses(menu, 'remove');
				}
			}

			private static _listen(event: string, handler: EventListener) {
				window.addEventListener(event, handler);
				this._listeners.push({
					event, handler
				});
			}

			private static _setListeners(menu: HTMLElement) {
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

			private static _unsetListeners() {
				this._listeners.forEach(({ event, handler }) => {
					window.removeEventListener(event, handler);
				});
			}

			private static _enable() {
				this._root = this._genMenu();
				this._setListeners(this._root);
				this._setAllContentTypeClasses(this._root, 'add');
				document.body.appendChild(this._root);
			}

			private static _disable() {
				this._root.remove();
				this._unsetListeners();
				this._active = false;
			}

			static async create() {
				if (this._active) {
					this._disable();
				}

				if (!window.app.storageLocal.CRMOnPage) {
					return;
				}

				await window.onExistsChain(window, 'app', 'settings', 'crm');

				this._active = true;
				this._enable();
			}

			static parent(): CrmApp {
				return window.app;
			}
		}
	};

	export type CrmApp = Polymer.El<'crm-app', typeof CA & typeof crmAppProperties & {
		editCRM: EditCrm;
	}>;

	if (window.objectify) {
		window.register(CA);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(CA);
		});
	}
}

export type CrmApp = CRMAppElement.CrmApp;