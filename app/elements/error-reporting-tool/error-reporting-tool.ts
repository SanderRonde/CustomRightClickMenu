/// <reference path="../elements.d.ts" />

const errorReportingTool: {
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

interface ErrorReportingToolSquare extends HTMLElement {
	xPos: string;
	yPos: string;
}

interface ThennableLike {
	then: (cb: () => void|ThennableLike) => void
}

class ERT {
	static is: any = 'error-reporting-tool';

	/**
	 * The startposition of the selected area
	 */
	private static dragStart: {
		X: number;
		Y: number;
	};

	/**
	 * The last size of the selected area
	 */
	private static lastSize: {
		X: number;
		Y: number;
	};

	/**
	 * The last positions of the cursor
	 */
	private static lastPos: {
		X: number;
		Y: number;
	};
	
	/**
	 * The last error that occurred in the console
	 */
	private static lastError: {
		message: string;
		source: any;
		lineno: number;
		colno: number;
		error: Error;
	};

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

	private static scaleScreenshot(this: ErrorReportingTool, canvas: HTMLCanvasElement,
			newImg: HTMLImageElement, callback: () => void) {
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
		callback && callback();
	};

	private static cropScreenshot(this: ErrorReportingTool, dataURI: string, cropData: {
			width: number;
			height: number;
			left: number;
			top: number;
		}, callback: () => void) {
		const _this = this;
		const img = new Image();
		const canvas = _this.$.cropCanvas;
		const context = canvas.getContext('2d');
		img.onload = function () {
			//Crop the image
			context.clearRect(0, 0, canvas.width, canvas.height);
			canvas.setAttribute('height', cropData.height + '');
			canvas.setAttribute('width', cropData.width + '');
			canvas.style.display = 'none';
			_this.appendChild(canvas);
			context.drawImage(img, cropData.left, cropData.top, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);

			//Scale the image to fit the canvas
			const base64 = canvas.toDataURL();
			const newImg = new Image();
			newImg.onload = function() {
				_this.scaleScreenshot(canvas, newImg, callback);
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
	};

	private static screenshot(this: ErrorReportingTool, cropData: {
			width: number;
			height: number;
			left: number;
			top: number;
		}, callback: () => void) {
		const _this = this;
		//Make sure the overlay is gone for a while
		this.$.overlay.style.display = 'none';
		chrome.tabs.captureVisibleTab({
			format: 'png'
		}, function (dataURI) {
			//Turn it on again
			_this.$.overlay.style.display = 'block';
			_this.cropScreenshot(dataURI, cropData, callback);
		});
	};

	private static px(this: ErrorReportingTool, num: number): string {
		return num + 'px';
	};

	private static translateX(this: ErrorReportingTool, el: ErrorReportingToolSquare, x: string) {
		el.xPos = x;
		el.style.transform = 'translate(' + x + ',' + (el.yPos || '0px') + ')';
	};

	private static translateY(this: ErrorReportingTool, el: ErrorReportingToolSquare, y: string) {
		el.yPos = y;
		el.style.transform = 'translate(' + (el.xPos || '0px') + ',' + y + ')';
	};

	private static getDivs(this: ErrorReportingTool, direction: 'x'|'y'): [ErrorReportingToolSquare, ErrorReportingToolSquare];
	private static getDivs(this: ErrorReportingTool, direction: 'xy'): 
		[ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare, ErrorReportingToolSquare];
	private static getDivs(this: ErrorReportingTool, direction: 'x'|'y'|'xy'): [ErrorReportingToolSquare, ErrorReportingToolSquare]|
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

	private static setDivsXValues(this: ErrorReportingTool, left: string, marginLeftPx: string, rightDivTranslate: string) {
		const [ leftDiv, rightDiv ] = this.getDivs('x');
		leftDiv.style.width = left;
		rightDiv.style.width = 'calc(100vw - (' + marginLeftPx + '))';
		this.translateX(rightDiv, rightDivTranslate);
	}

	private static setSelectionX(this: ErrorReportingTool, startX: number, width: number, posX: number) {
		if (this.lastPos.X !== posX) {
			if (width < 0) {
				const left = startX + width;
				this.setDivsXValues(this.px(left), this.px(startX), this.px(left - width));
			} else {
				const marginLeftPx = this.px(startX + width);
				this.setDivsXValues(this.px(startX), marginLeftPx, marginLeftPx);
			}
		}
	}

	private static setDivsYValues(this: ErrorReportingTool, {
		topHeight,
		botTranslate,
		heights, 
		botHeight, 
		divsOffsetY
	}: {
		topHeight: string;
		botTranslate: string;
		heights: string;
		botHeight: string;
		divsOffsetY: string;
	}) {
			const [ leftDiv, rightDiv, topDiv, botDiv ] = this.getDivs('xy');

			topDiv.style.height = topHeight;
			leftDiv.style.height = rightDiv.style.height = heights + 'px';
			botDiv.style.height = 'calc(100vh - (' + botHeight + '))';

			this.translateY(botDiv, botTranslate);
			this.translateY(leftDiv, divsOffsetY);
			this.translateY(rightDiv, divsOffsetY);
		}

	private static setSelectionY(this: ErrorReportingTool, startY: number, height: number, posY: number) {
		if (this.lastPos.Y !== posY) {
			if (height < 0) {
				const top = this.px(startY + height);
				this.setDivsYValues({
					topHeight: top,
					botTranslate: this.px(startY), 
					heights: this.px(-height), 
					botHeight: this.px(startY), 
					divsOffsetY: top
				});
			} else {
				const marginTopPx = (startY + height) + 'px';

				this.setDivsYValues({
					topHeight: this.px(startY),
					botTranslate: marginTopPx,
					heights: this.px(height), 
					botHeight: marginTopPx, 
					divsOffsetY: this.px(startY)
				});
			}
		}
	}

	static handleSelection(this: ErrorReportingTool, e: Polymer.DragEvent) {
		switch (e.detail.state) {
			case 'start':
				this.$.highlightButtons.classList.add('hidden');

				const startYPx = e.detail.y + 'px';
				this.lastSize.X = this.lastSize.Y = 0;
				this.dragStart.X = this.lastPos.X = e.detail.x;
				this.dragStart.Y = this.lastPos.Y = e.detail.y;

				this.$.highlightingTopSquare.style.width = '100vw';
				this.$.highlightingTopSquare.style.height = startYPx;
				this.$.highlightingLeftSquare.style.width = startYPx;

				this.translateY(this.$.highlightingBotSquare, startYPx);
				this.translateY(this.$.highlightingLeftSquare, startYPx);
				this.translateY(this.$.highlightingRightSquare, startYPx);
				break;
			case 'end':
				this.$.highlightButtons.classList.remove('hidden');
				break;
			case 'track':
				if (e.detail.x !== this.lastPos.X || e.detail.y !== this.lastPos.Y) {
					const width = (e.detail.x - this.dragStart.X);
					const height = (e.detail.y - this.dragStart.Y);
					this.setSelectionX(this.dragStart.X, width, e.detail.x);
					this.setSelectionY(this.dragStart.Y, height, e.detail.y);
					this.lastSize.X = width;
					this.lastSize.Y = height;
					this.lastPos.X = e.detail.x;
					this.lastPos.Y = e.detail.y;
				}
				break;
		}
	};

	private static resetSelection(this: ErrorReportingTool) {
		this.setSelectionX(0, 0, 0);
		this.setSelectionY(0, 0, 0);
	}

	private static toggleScreenCapArea(this: ErrorReportingTool, visible: boolean) {
		this.$.highlightingTopSquare.style.height = '100vh';
		this.$.highlightingTopSquare.style.width = '100vw';
		this.resetSelection();
		this.$.overlay.classList[visible ? 'add' : 'remove']('toggled');
		this.$.overlay.style.pointerEvents = visible ? 'initial' : 'none';
	}

	static cancelScreencap(this: ErrorReportingTool) {
		this.toggleScreenCapArea(false);
		this.$.errorReportingDialog.open();
	};

	static finishScreencap(this: ErrorReportingTool) {
		const _this = this;
		this.toggleScreenCapArea(false);
		this.screenshot({
			top: this.dragStart.Y,
			left: this.dragStart.X,
			height: this.lastSize.Y,
			width: this.lastSize.X
		}, function() {
			_this.$.errorReportingDialog.open();
		});
	};

	static addCapture(this: ErrorReportingTool) {
		const _this = this;
		_this.$.errorReportingDialog.close();
		this.toggleScreenCapArea(true);
	};

	static reportBug(this: ErrorReportingTool) {
		this.reportType = 'bug';
		this.image = '';
		this.$.errorReportingDialog.open();
	};

	private static getStorages(callback: (local: CRM.StorageLocal, sync: CRM.SettingsStorage) => void) {
		chrome.storage.local.get((local) => {
			chrome.storage.sync.get((sync) => {
				callback(local as any, sync as any);
			});
		});
	}

	private static downloadFiles(this: ErrorReportingTool, callback: () => void) {
		const _this = this;
		chrome.downloads.download({
			url: this.image,
			filename: 'screencap.png'
		}, function() {
			if (_this.reportType === 'bug') {
				_this.getStorages((localKeys, syncKeys) => {
					const dataCont = {
						local: localKeys,
						sync: syncKeys,
						lastError: _this.lastError
					};
					chrome.downloads.download({
						url: 'data:text/plain;base64,' + window.btoa(JSON.stringify(dataCont)),
						filename: 'settings.txt' //Downloads as text because github doesn't allow JSON uploads
					}, callback);
				});
			} else {
				callback();
			}
		});
	};

	private static hideCheckmark(this: ErrorReportingTool) {
		this.$.bugCheckmarkCont.classList.remove('checkmark');
		this.async(() => {
			this.$.reportingButtonElevation.classList.remove('checkmark');
			this.$.bugButton.classList.remove('checkmark');
			this.$.bugCheckmark.classList.remove('checked');
		}, 350);
	}

	private static checkCheckmark(this: ErrorReportingTool) {
		this.$.bugButton.classList.add('checkmark');
		this.async(() => {
			this.$.reportingButtonElevation.classList.add('checkmark');
			this.$.bugCheckmarkCont.classList.add('checkmark');
			this.async(() => {
				this.$.bugCheckmark.classList.add('checked');
				this.async(this.hideCheckmark, 5000);
			}, 350);
		}, 350);
	};

	private static getDownloadPermission(this: ErrorReportingTool, callback: () => void) {
		const _this = this;

		//Download the files
		chrome.permissions.request({
			permissions: [
				'downloads'
			]
		}, function (granted) {
			if (granted) {
				callback();
				window.errorReportingTool.$.errorReportingDialog.close();

				//Do a nice checkmark animation on the report button
				const listener = function () {
					_this.checkCheckmark();
					window.removeEventListener('focus', listener);
				};
				window.addEventListener('focus', listener);
			} else {
				window.doc.acceptDownloadToast.show();
			}
		});
	};

	static submitErrorReport(this: ErrorReportingTool) {
		const _this = this;

		this.getDownloadPermission(function () {
			_this.downloadFiles(function() {
				//Take the user to the github page
				const messageBody = 'WRITE MESSAGE HERE\n';
				const title = (_this.reportType === 'bug' ? 'Bug: ' : 'Feature: ') + 'TITLE HERE';
				window.open('https://github.com/SanderRonde/CustomRightClickMenu/issues/new?title=' + title + '&body=' + messageBody, '_blank');
			});
		});
	};

	private static onError(this: ErrorReportingTool, message: string, source: any, lineno: number, colno: number, error: Error) {
		this.lastError = {
			message: message,
			source: source,
			lineno: lineno,
			colno: colno,
			error: error
		};
	};

	static ready(this: ErrorReportingTool) {
		window.errorReportingTool = this;
		window.onerror = this.onError;
	}
}

type ErrorReportingTool = Polymer.El<'error-reporting-tool', typeof ERT & typeof errorReportingTool>;

if (window.objectify) {
	Polymer(window.objectify(ERT));
} else {
	window.addEventListener('ObjectifyReady', () => {
		Polymer(window.objectify(ERT));
	});
}