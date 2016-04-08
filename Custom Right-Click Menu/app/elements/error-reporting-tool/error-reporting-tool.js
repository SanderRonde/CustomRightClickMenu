Polymer({
	is: 'error-reporting-tool',

	/*
	 * The startposition of the selected area
	 * 
	 * @attribute dragStart
	 * @type Object
	 * @default {}
	 */
	dragStart: {},

	properties: {
		/*
		 * The type of the report (bug or feature)
		 * 
		 * @attribute reportType
		 * @type String
		 * @default 'bug'
		 */
		reportType: 'bug',
		/*
		 * The screencap's dataURI
		 * 
		 * @attribute image
		 * @type String
		 * @default null
		 */
		image: ''
	},

	isBugType: function(reportType) {
		return reportType === 'bug';
	},

	isEmptyImage: function (img) {
		return img === '';
	},

	cropScreenshot: function(dataURI, cropData, callback) {
		var _this = this;
		var img = new Image();
		var canvas = _this.$.cropCanvas;
		var context = canvas.getContext('2d');
		img.onload = function () {
			//Crop the image
			context.clearRect(0, 0, canvas.width, canvas.height);
			canvas.setAttribute('height', img.height - (cropData.top + cropData.bot));
			canvas.setAttribute('width', img.width - (cropData.left + cropData.right));
			canvas.style.display = 'none';
			_this.appendChild(canvas);
			context.drawImage(img, cropData.top, cropData.left, cropData.bot, cropData.right, 0, 0, img.width, img.height);

			//Scale the image to fit the canvas
			var base64 = canvas.toDataURL();
			var newImg = new Image();
			newImg.onload = function() {
				canvas.setAttribute('width', '500px');
				var imgHeight = (img.width / 500) * img.height;
				canvas.setAttribute('height', imgHeight);
				context.drawImage(img, 0, 0, 500, imgHeight);
				callback();
			}
			newImg.src = base64;
		}
		img.src = dataURI;
	},

	showCropDialog: function() {
		this.cropScreenshot(function() {

		});
	},

	screenshot: function(cropData, callback) {
		chrome.tabs.captureVisibleTab({
			format: 'png'
		}, function(dataURI) {

		});
	},

	handleSelection: function(e) {
		console.log(e);
		switch (e.detail.state) {
			case 'start':
				this.dragStart.X = e.x;
				this.dragStart.Y = e.y;
				break;
			case 'track':

				break;
			case 'end':

				break;
		}
	},

	selectScreenshotArea: function(callback) {
		this.$.overlay.classList.add('toggled');
		this.$.overlay.style.pointerEvents = 'initial';
	},

	addCapture: function() {
		var _this = this;
		var isReportDialog = (this.$.errorReportingDialog.opened);
		_this.$[isReportDialog ? 'errorReportingDialog' : 'onErrorDialog'].close();
		this.selectScreenshotArea(function() {
			_this.$[isReportDialog ? 'errorReportingDialog' : 'onErrorDialog'].open();
		});
	},

	reportBug: function () {
		this.reportType = 'bug';
		this.image = '';
		this.$.errorReportingDialog.open();
	},
	
	onWindowError: function(message, source, lineNo, colNo, error) {
		
	},

	ready: function () {
		window.onerror = this.onWindowError;
		window.errorReportingTool = this;
	}
})
