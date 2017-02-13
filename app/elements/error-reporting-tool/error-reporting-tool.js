/// <reference path="../elements.d.ts" />
var errorReportingTool = {
    /**
     * The type of the report
     */
    reportType: 'bug',
    /**
     * The screencap's dataURI
     */
    image: '',
    /**
     * Whether this overlay needs to be hidden
     */
    hide: {
        type: Boolean,
        value: true,
        notify: true
    }
};
var ERT = (function () {
    function ERT() {
    }
    ERT.toggleVisibility = function () {
        this.hide = !this.hide;
    };
    ;
    ERT.isBugType = function (reportType) {
        return reportType === 'bug';
    };
    ;
    ERT.isEmptyImage = function (img) {
        return img === '';
    };
    ;
    ERT.scaleScreenshot = function (canvas, context, newImg, callback) {
        this.image = canvas.toDataURL();
        var maxViewportHeight = window.innerHeight - 450;
        if (maxViewportHeight > 750) {
            maxViewportHeight = 750;
        }
        if ((750 / newImg.width) * newImg.height > maxViewportHeight) {
            $('.captureCont').css('width', ((maxViewportHeight / newImg.height) * newImg.width));
        }
        callback && callback();
    };
    ;
    ERT.cropScreenshot = function (dataURI, cropData, callback) {
        var _this = this;
        var img = new Image();
        var canvas = _this.$.cropCanvas;
        var context = canvas.getContext('2d');
        img.onload = function () {
            //Crop the image
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvas.setAttribute('height', cropData.height + '');
            canvas.setAttribute('width', cropData.width + '');
            canvas.style.display = 'none';
            _this.appendChild(canvas);
            context.drawImage(img, cropData.left, cropData.top, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);
            //Scale the image to fit the canvas
            var base64 = canvas.toDataURL();
            var newImg = new Image();
            newImg.onload = function () {
                _this.scaleScreenshot(canvas, context, newImg, callback);
            };
            newImg.src = base64;
            var imgTag = document.createElement('img');
            imgTag.src = base64;
            document.body.appendChild(imgTag);
        };
        img.src = dataURI;
        var imgTag2 = document.createElement('img');
        imgTag2.src = dataURI;
        document.body.appendChild(imgTag2);
    };
    ;
    ERT.screenshot = function (cropData, callback) {
        var _this = this;
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
    ;
    //#region Selection Square
    ERT.px = function (num) {
        return num + 'px';
    };
    ;
    ERT.translate = function (x, y) {
        return 'translate(' + x + ', ' + y + ')';
    };
    ;
    ERT.translateX = function (el, x) {
        el.xPos = x;
        el.style.transform = 'translate(' + x + ',' + (el.yPos || '0px') + ')';
    };
    ;
    ERT.translateY = function (el, y) {
        el.yPos = y;
        el.style.transform = 'translate(' + (el.xPos || '0px') + ',' + y + ')';
    };
    ;
    ERT.setSelection = function (startX, startY, width, height, posX, posY) {
        var rightDiv = this.$.highlightingRightSquare;
        var leftDiv = this.$.highlightingLeftSquare;
        if (this.lastPos.X !== posX) {
            if (width < 0) {
                var left = startX + width;
                leftDiv.style.width = left + 'px';
                rightDiv.style.width = 'calc(100vw - (' + this.px(startX) + '))';
                this.translateX(rightDiv, this.px(left - width));
            }
            else {
                var marginLeftPx = (startX + width) + 'px';
                leftDiv.style.width = this.px(startX);
                rightDiv.style.width = 'calc(100vw - (' + marginLeftPx + '))';
                this.translateX(rightDiv, marginLeftPx);
            }
        }
        if (this.lastPos.Y !== posY) {
            var topDiv = this.$.highlightingTopSquare;
            var botDiv = this.$.highlightingBotSquare;
            if (height < 0) {
                var top = (startY + height);
                var topPx = top + 'px';
                topDiv.style.height = topPx;
                this.translateY(botDiv, this.px(startY));
                leftDiv.style.height = rightDiv.style.height = -height + 'px';
                botDiv.style.height = 'calc(100vh - (' + this.px(startY) + '))';
                this.translateY(leftDiv, topPx);
                this.translateY(rightDiv, topPx);
            }
            else {
                var heightPx = height + 'px';
                var marginTopPx = (startY + height) + 'px';
                topDiv.style.height = this.px(startY);
                leftDiv.style.height = rightDiv.style.height = heightPx;
                botDiv.style.height = 'calc(100vh - (' + marginTopPx + ' ))';
                this.translateY(botDiv, marginTopPx);
                this.translateY(leftDiv, this.px(startY));
                this.translateY(rightDiv, this.px(startY));
            }
        }
    };
    ;
    ERT.handleSelection = function (e) {
        switch (e.detail.state) {
            case 'start':
                this.$.highlightButtons.classList.add('hidden');
                var startYPx = e.detail.y + 'px';
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
            case 'track':
                if (e.detail.x !== this.lastPos.X || e.detail.y !== this.lastPos.Y) {
                    var width = (e.detail.x - this.dragStart.X);
                    var height = (e.detail.y - this.dragStart.Y);
                    this.setSelection(this.dragStart.X, this.dragStart.Y, width, height, e.detail.x, e.detail.y);
                    this.lastSize.X = width;
                    this.lastSize.Y = height;
                    this.lastPos.X = e.detail.x;
                    this.lastPos.Y = e.detail.y;
                }
                break;
        }
    };
    ;
    //#endregion
    ERT.hideScreencapArea = function () {
        this.$.highlightingTopSquare.style.height = '100vh';
        this.$.highlightingTopSquare.style.width = '100vw';
        this.setSelection(0, 0, 0, 0, 0, 0);
        this.$.overlay.classList.remove('toggled');
        this.$.overlay.style.pointerEvents = 'none';
    };
    ;
    ERT.cancelScreencap = function () {
        this.hideScreencapArea();
        this.$.errorReportingDialog.open();
    };
    ;
    ERT.finishScreencap = function () {
        var _this = this;
        this.hideScreencapArea();
        this.screenshot({
            top: this.dragStart.Y,
            left: this.dragStart.X,
            height: this.lastSize.Y,
            width: this.lastSize.X
        }, function () {
            _this.$.errorReportingDialog.open();
        });
    };
    ;
    ERT.selectScreenshotArea = function () {
        this.$.highlightingTopSquare.style.height = '100vh';
        this.$.highlightingTopSquare.style.width = '100vw';
        this.setSelection(0, 0, 0, 0, 0, 0);
        this.$.overlay.classList.add('toggled');
        this.$.overlay.style.pointerEvents = 'initial';
    };
    ;
    ERT.addCapture = function () {
        var _this = this;
        _this.$.errorReportingDialog.close();
        this.selectScreenshotArea();
    };
    ;
    ERT.reportBug = function () {
        this.reportType = 'bug';
        this.image = '';
        this.$.errorReportingDialog.open();
    };
    ;
    ERT.convertImageToBlob = function (dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = window.unescape(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], { type: mimeString });
    };
    ;
    ERT.downloadFiles = function (callback) {
        var _this = this;
        chrome.downloads.download({
            url: this.image,
            filename: 'screencap.png'
        }, function () {
            if (_this.reportType === 'bug') {
                chrome.storage.local.get(function (localKeys) {
                    chrome.storage.local.get(function (syncKeys) {
                        var dataCont = {
                            local: localKeys,
                            sync: syncKeys,
                            lastError: _this.lastError
                        };
                        chrome.downloads.download({
                            url: 'data:text/plain;base64,' + window.btoa(JSON.stringify(dataCont)),
                            filename: 'settings.txt' //Downloads as text because github doesn't allow JSON uploads
                        }, callback);
                    });
                });
            }
            else {
                callback();
            }
        });
    };
    ;
    ERT.checkCheckmark = function () {
        var _this = this;
        this.$.bugButton.classList.add('checkmark');
        this.async(function () {
            _this.$.reportingButtonElevation.classList.add('checkmark');
            _this.$.bugCheckmarkCont.classList.add('checkmark');
            _this.async(function () {
                _this.$.bugCheckmark.classList.add('checked');
                _this.async(function () {
                    _this.$.bugCheckmarkCont.classList.remove('checkmark');
                    _this.async(function () {
                        _this.$.reportingButtonElevation.classList.remove('checkmark');
                        _this.$.bugButton.classList.remove('checkmark');
                        _this.$.bugCheckmark.classList.remove('checked');
                    }, 350);
                }, 5000);
            }, 350);
        }, 350);
    };
    ;
    ERT.getDownloadPermission = function (callback) {
        var _this = this;
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
                var listener = function () {
                    _this.checkCheckmark();
                    window.removeEventListener('focus', listener);
                };
                window.addEventListener('focus', listener);
            }
            else {
                window.doc['acceptDownloadToast'].show();
            }
        });
    };
    ;
    ERT.submitErrorReport = function () {
        var _this = this;
        this.getDownloadPermission(function () {
            _this.downloadFiles(function () {
                //Take the user to the github page
                var messageBody = 'WRITE MESSAGE HERE\n';
                var title = (_this.reportType === 'bug' ? 'Bug: ' : 'Feature: ') + 'TITLE HERE';
                window.open('https://github.com/SanderRonde/CustomRightClickMenu/issues/new?title=' + title + '&body=' + messageBody, '_blank');
            });
        });
    };
    ;
    ERT.onError = function (message, source, lineno, colno, error) {
        this.lastError = {
            message: message,
            source: source,
            lineno: lineno,
            colno: colno,
            error: error
        };
    };
    ;
    ERT.ready = function () {
        window.errorReportingTool = this;
        window.onerror = this.onError;
    };
    return ERT;
}());
ERT.is = 'error-reporting-tool';
ERT.properties = errorReportingTool;
Polymer(ERT);
