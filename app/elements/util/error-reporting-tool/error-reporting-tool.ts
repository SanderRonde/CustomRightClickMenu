/// <reference path="../../elements.d.ts" />

interface ErrorReportingToolSquare extends HTMLElement {
	xPos: string;
	yPos: string;
}

namespace ErrorReportingToolElement {
	export const errorReportingTool: {
		reportType: string;
		image: string;
		hide: boolean;
	} = {
		/**
		 * The type of the report
		 */
		reportType: {
			type: String,
			value: 'bug',
			notify: true
		},
		/**
		 * The screencap's dataURI
		 */
		image: {
			type: String,
			value: '',
			notify: true
		},
		/**
		 * Whether this overlay needs to be hidden
		 */
		hide: {
			type: Boolean,
			value: true,
			notify: true
		}
	} as any;

	export class ERT {
		static is: any = 'error-reporting-tool';

		/**
		 * The startposition of the selected area
		 */
		private static _dragStart: {
			X: number;
			Y: number;
		};

		/**
		 * The last size of the selected area
		 */
		private static _lastSize: {
			X: number;
			Y: number;
		};

		/**
		 * The last positions of the cursor
		 */
		private static _lastPos: {
			X: number;
			Y: number;
		};
		
		/**
		 * The last error that occurred in the console
		 */
		static lastErrors: {
			message: string;
			source: any;
			lineno: number;
			colno: number;
			error: Error;
			handled: boolean;
		}[] = [];

		static properties = errorReportingTool;

		static toggleVisibility(this: ErrorReportingTool) {
			this.hide = !this.hide;
		};

		static isBugType(this: ErrorReportingTool, reportType: string): boolean {
			return reportType === 'bug';
		};

		static isEmptyImage(this: ErrorReportingTool, img: string): boolean {
			return img === '';
		};

		private static _scaleScreenshot(this: ErrorReportingTool, canvas: HTMLCanvasElement,
			newImg: HTMLImageElement) {
				this.image = canvas.toDataURL();
				let maxViewportHeight = window.innerHeight - 450;
				if (maxViewportHeight > 750) {
					maxViewportHeight = 750;
				}
				if ((750 / newImg.width) * newImg.height > maxViewportHeight) {
					const captureConts = Array.prototype.slice.apply(this.shadowRoot.querySelectorAll('.captureCont'));
					captureConts.forEach((captureCont: HTMLElement) => {
						captureCont.style.width = ((maxViewportHeight / newImg.height) * newImg.width) + 'px';
					});
				}
			};

		private static _cropScreenshot(this: ErrorReportingTool, dataURI: string, cropData: {
			width: number;
			height: number;
			left: number;
			top: number;
		}) {
			return new Promise<void>((resolve) => {
				const img = new Image();
				const canvas = this.$.cropCanvas;
				const context = canvas.getContext('2d');
				img.onload = () => {
					//Crop the image
					context.clearRect(0, 0, canvas.width, canvas.height);
					canvas.setAttribute('height', cropData.height + '');
					canvas.setAttribute('width', cropData.width + '');
					canvas.style.display = 'none';
					this.appendChild(canvas);
					context.drawImage(img, cropData.left, cropData.top, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);

					//Scale the image to fit the canvas
					const base64 = canvas.toDataURL();
					const newImg = new Image();
					newImg.onload = () => {
						this._scaleScreenshot(canvas, newImg);
						resolve(null);
					};
					newImg.src = base64;

					const imgTag = document.createElement('img');
					imgTag.src = base64;
					document.body.appendChild(imgTag);
				};
				img.src = dataURI;

				const imgTag2 = document.createElement('img');
				imgTag2.src = dataURI;
				document.body.appendChild(imgTag2);
			});
		};

		private static async _screenshot(this: ErrorReportingTool, cropData: {
			width: number;
			height: number;
			left: number;
			top: number;
		}) {
			//Make sure the overlay is gone for a while
			this.$.overlay.style.display = 'none';
			const { windowId } = await browserAPI.tabs.getCurrent();
			const dataURI = await browserAPI.tabs.captureVisibleTab(windowId, {
				format: 'png',
				quality: 100
			});
			//Turn it on again
			this.$.overlay.style.display = 'block';
			await this._cropScreenshot(dataURI, cropData);
		};

		private static _px(this: ErrorReportingTool, num: number): string {
			return num + 'px';
		};

		private static _translateX(this: ErrorReportingTool, el: ErrorReportingToolSquare, x: string) {
			el.xPos = x;
			window.setTransform(el, `translate(${x},${el.yPos || '0px'})`);
		};

		private static _translateY(this: ErrorReportingTool, el: ErrorReportingToolSquare, y: string) {
			el.yPos = y;
			window.setTransform(el, `translate(${el.xPos || '0px'}, ${y})`);
		};

		private static _unLink<T extends {
			[key: string]: any;
		}>(this: ErrorReportingTool, obj: T): T {
			return JSON.parse(JSON.stringify(obj));
		}

		private static _getDivs(this: ErrorReportingTool, direction: 'x'|'y'): [ErrorReportingToolSquare, ErrorReportingToolSquare];
		private static _getDivs(this: ErrorReportingTool, direction: 'xy'): 
			[ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare];
		private static _getDivs(this: ErrorReportingTool, direction: 'x'|'y'|'xy'): [ErrorReportingToolSquare, ErrorReportingToolSquare]|
			[ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare] {
			const x: [ErrorReportingToolSquare, ErrorReportingToolSquare] = [this.$.highlightingLeftSquare, this.$.highlightingRightSquare];
			const y: [ErrorReportingToolSquare, ErrorReportingToolSquare] = [this.$.highlightingTopSquare, this.$.highlightingBotSquare];
			switch (direction) {
				case 'x':
					return x;
				case 'y':
					return y;
				case 'xy':
					return x.concat(y) as [ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare];
			}
		}

		private static _setDivsXValues(this: ErrorReportingTool, left: string, marginLeftPx: string, 
			rightDivTranslate: string, [topHeight, botHeight]: [number, number]) {
				const [ leftDiv, rightDiv ] = this._getDivs('x');
				leftDiv.style.width = left;
				window.addCalcFn(rightDiv, 'width', `100vw - ${marginLeftPx}`);

				leftDiv.style.height = rightDiv.style.height = this._px(window.innerHeight - topHeight - (window.innerHeight - botHeight));
				this._translateX(rightDiv, rightDivTranslate);
			}

		private static _setSelectionX(this: ErrorReportingTool, startX: number, width: number, xHeights: [number, number]) {
			const left = startX + width;
			if (width < 0) {
				this._setDivsXValues(this._px(left), this._px(startX), this._px(left - width), xHeights);
			} else {
				this._setDivsXValues(this._px(startX), this._px(left), this._px(left), xHeights);
			}
		}

		private static _setDivsYValues(this: ErrorReportingTool, {
			topHeight,
			heights, 
			botHeight
		}: {
			topHeight: string;
			heights: string;
			botHeight: number;
		}) {
			const [ leftDiv, rightDiv, topDiv, botDiv ] = this._getDivs('xy');

			topDiv.style.height = topHeight;
			leftDiv.style.height = rightDiv.style.height = heights + 'px';
			botDiv.style.height = this._px(window.innerHeight - botHeight);

			this._translateY(botDiv, this._px(botHeight));
			this._translateY(leftDiv, topHeight);
			this._translateY(rightDiv, topHeight);
		}

		private static _setSelectionY(this: ErrorReportingTool, startY: number, height: number, startPlusHeightPx: number) {
			if (height < 0) {
				this._setDivsYValues({
					topHeight: this._px(startPlusHeightPx),
					heights: this._px(-height), 
					botHeight: startY
				});
			} else {
				this._setDivsYValues({
					topHeight: this._px(startY),
					heights: this._px(height), 
					botHeight: startPlusHeightPx
				});
			}
		}

		private static _changed(this: ErrorReportingTool, width: number, height: number) {
			return this._lastSize.X !== width || this._lastSize.Y !== height;
		}

		private static _setSelection(this: ErrorReportingTool, { 
			startX, 
			width
		}: {
			startX: number;
			width: number;
		}, {
			startY,
			height
		}: {
			startY: number;
			height: number;
		}) {
			if (!this._changed(width, height)) {
				return;
			}
			const topHeight = height < 0 ? startY + height : startY;
			const botHeight = height < 0 ? startY : startY + height;
			this._setSelectionX(startX, width, [topHeight, botHeight]);
			this._setSelectionY(startY, height, startY + height);
		}

		static handleSelection(this: ErrorReportingTool, e: Polymer.PolymerDragEvent) {
			switch (e.detail.state) {
				case 'start':
					this.$.highlightButtons.classList.add('hidden');

					const startYPx = e.detail.y + 'px';
					this._lastSize.X = this._lastSize.Y = 0;
					this._dragStart = this._unLink(this._lastPos = {
						X: e.detail.x,
						Y: e.detail.y
					});

					this.$.highlightingTopSquare.style.width = '100vw';
					this.$.highlightingTopSquare.style.height = startYPx;
					this.$.highlightingLeftSquare.style.width = startYPx;

					this._translateY(this.$.highlightingBotSquare, startYPx);
					this._translateY(this.$.highlightingLeftSquare, startYPx);
					this._translateY(this.$.highlightingRightSquare, startYPx);
					break;
				case 'end':
					this.$.highlightButtons.classList.remove('hidden');
					break;
				case 'track':
					if (e.detail.x !== this._lastPos.X || e.detail.y !== this._lastPos.Y) {
						const width = e.detail.dx;
						const height = e.detail.dy;
						const startX = e.detail.x - width;
						const startY = e.detail.y - height;
						this._setSelection({ startX, width }, { startY, height });
						this._lastSize = {
							X: width,
							Y: height
						};
						this._lastPos = {
							X: e.detail.x,
							Y: e.detail.y
						}
					}
					break;
			}
		};

		private static _resetSelection(this: ErrorReportingTool) {
			this._setSelectionX(0, 0, [0, 0]);
			this._setSelectionY(0, 0, 0);
		}

		private static _toggleScreenCapArea(this: ErrorReportingTool, visible: boolean) {
			this.$.highlightingTopSquare.style.height = '100vh';
			this.$.highlightingTopSquare.style.width = '100vw';
			this._resetSelection();
			this.$.overlay.classList[visible ? 'add' : 'remove']('toggled');
			this.$.overlay.style.pointerEvents = visible ? 'initial' : 'none';
		}

		static cancelScreencap(this: ErrorReportingTool) {
			this._toggleScreenCapArea(false);
			this.$.errorReportingDialog.open();
		};

		static async finishScreencap(this: ErrorReportingTool) {
			this._toggleScreenCapArea(false);
			await this._screenshot({
				top: this._dragStart.Y,
				left: this._dragStart.X,
				height: this._lastSize.Y,
				width: this._lastSize.X
			});
			this.$.errorReportingDialog.open();
		};

		private static _resetVars(this: ErrorReportingTool) {
			this._dragStart = this._unLink(this._lastSize = this._unLink(this._lastPos = {
				X: 0,
				Y: 0
			}));
		}

		static addCapture(this: ErrorReportingTool) {
			this.$.errorReportingDialog.close();
			this._resetVars();
			this._toggleScreenCapArea(true);
		};

		static reportBug(this: ErrorReportingTool) {
			this.reportType = 'bug';
			this.image = '';
			this.$.errorReportingDialog.open();
		};

		private static async _getStorages() {
			return {
				local: await browserAPI.storage.local.get<CRM.StorageLocal>(),
				sync: await browserAPI.storage.local.get<CRM.SettingsStorage>(),
			}
		}

		private static async _downloadFiles(this: ErrorReportingTool) {
			if (!(browserAPI.downloads)) {
				return false;
			}
			await browserAPI.downloads.download({
				url: this.image,
				filename: 'screencap.png'
			});
			if (this.reportType === 'bug') {
				const { local, sync } = await this._getStorages();
				const dataCont = {
					local, sync,
					lastErrors: this.lastErrors
				};
				await browserAPI.downloads.download({
					url: 'data:text/plain;base64,' + window.btoa(JSON.stringify(dataCont)),
					filename: 'settings.txt' //Downloads as text because github doesn't allow JSON uploads
				});
			}
			return true;
		};

		private static _hideCheckmark(this: ErrorReportingTool) {
			this.$.bugCheckmarkCont.classList.remove('checkmark');
			this.async(() => {
				this.$.reportingButtonElevation.classList.remove('checkmark');
				this.$.bugButton.classList.remove('checkmark');
				this.$.bugCheckmark.classList.remove('checked');
			}, 350);
		}

		private static _checkCheckmark(this: ErrorReportingTool) {
			this.$.bugButton.classList.add('checkmark');
			this.async(() => {
				this.$.reportingButtonElevation.classList.add('checkmark');
				this.$.bugCheckmarkCont.classList.add('checkmark');
				this.async(() => {
					this.$.bugCheckmark.classList.add('checked');
					this.async(this._hideCheckmark, 5000);
				}, 350);
			}, 350);
		};

		private static _getDownloadPermission(this: ErrorReportingTool) {
			//Download the files
			return new Promise<boolean>(async (resolve) => {
				if (browserAPI.downloads && browserAPI.downloads.download) {
					return resolve(true);
				}

				if (!(browserAPI.permissions)) {
					window.app.util.showToast('Your browser does not support asking for the download permission');
					return resolve(false);
				}

				const granted = await browserAPI.permissions.request({
					permissions: ['downloads']
				});
				if (granted && browserAPI.downloads) {
					window.errorReportingTool.$.errorReportingDialog.close();
					resolve(granted);

					//Do a nice checkmark animation on the report button
					const listener = () => {
						this._checkCheckmark();
						window.removeEventListener('focus', listener);
					};
					window.addEventListener('focus', listener);
				} else {
					window.doc.acceptDownloadToast.show();
					resolve(granted);
				}
			});
		};

		static async submitErrorReport(this: ErrorReportingTool) {
			const granted = await this._getDownloadPermission();
			if (!granted) {
				return;
			}
			if (!await this._downloadFiles()) {
				window.app.util.showToast('Your browser does not support the downloads API');
				return;
			}
			//Take the user to the github page
			const messageBody = 'WRITE MESSAGE HERE\n';
			const title = (this.reportType === 'bug' ? 'Bug: ' : 'Feature: ') + 'TITLE HERE';
			window.open('https://github.com/SanderRonde/CustomRightClickMenu/issues/new?title=' + title + '&body=' + messageBody, '_blank');
		};

		private static _onError(this: ErrorReportingTool, message: string, 
			source: any, lineno: number, colno: number, error: 
			Error, handled: boolean) {
				this.lastErrors.push({
					message, source, lineno, colno, error, handled
				});
			};

		private static _registerOnError(this: ErrorReportingTool) {
			const handlers: ErrorEventHandler[] = [];
			if (window.onerror) {
				handlers.push(window.onerror);
			}
			window.onerror = (message: string, source: any, lineno: number, colno: number, error: Error) => {
				let handled: boolean = false;
				handlers.forEach((handler) => {
					if (handler(message, source, lineno, colno, error)) {
						handled = true;
					}
				});
				this._onError(message, source, lineno, colno, error, handled);
				if (handled) {
					return true;
				}
				return undefined;
			}

			Object.defineProperty(window, 'onerror', {
				set(handler: ErrorEventHandler) {
					handlers.push(handler);
				}
			});
		}

		static ready(this: ErrorReportingTool) {
			window.errorReportingTool = this;
			this._registerOnError();
		}
	}

	if (window.objectify) {
		window.register(ERT);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(ERT);
		});
	}
}

type ErrorReportingTool = Polymer.El<'error-reporting-tool', typeof ErrorReportingToolElement.ERT & 
	typeof ErrorReportingToolElement.errorReportingTool>;