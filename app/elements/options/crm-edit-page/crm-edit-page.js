var CrmEditPageElement;
(function (CrmEditPageElement) {
    CrmEditPageElement.crmEditPageProperties = {
        item: {
            type: Object,
            value: null,
            notify: true
        },
        nodeInfo: {
            type: Object,
            value: {},
            notify: true
        },
        hideUpdateMessage: {
            type: Boolean,
            value: true,
            notify: true
        }
    };
    var CEP = (function () {
        function CEP() {
        }
        CEP.getCreatedBy = function () {
            return this.___("options_crmEditPage_createdByYou", "<b id=\"nodeInfoByYou\" title=\"" + this.___("options_crmEditPage_hasAllPermissions") + "\">You</b>");
        };
        CEP.nodeInfoSource = function () {
            return this.___(this.isLocal(this.nodeInfo.source) ?
                "options_crmEditPage_createdOn" :
                "options_crmEditPage_installedOn", "<b title=\"" + this.getInstallDate() + "\">" + this.nodeInfo.installDate + "</b>");
        };
        CEP.isLocal = function (source) {
            if (!source) {
                return true;
            }
            return source === 'local' || this.item.isLocal;
        };
        ;
        CEP._nodeInfoExists = function (nodeInfo) {
            return !!nodeInfo;
        };
        ;
        CEP.hideNodeInfo = function (nodeInfo) {
            return !this._nodeInfoExists(nodeInfo) ||
                (this.isLocal(nodeInfo.source) && !this.hasInstallDate(nodeInfo));
        };
        ;
        CEP.hasInstallDate = function (nodeInfo) {
            return this._nodeInfoExists(nodeInfo) && !!nodeInfo.installDate;
        };
        ;
        CEP._onAnimationDone = function () {
            this._backdropEl.classList.remove('visible');
            this._backdropEl.classList.remove('clickthrough');
            this.$.overlayCont.style.display = 'none';
            document.body.style.overflow = 'auto';
            document.body.style.marginRight = '0';
            window.app.show = false;
            window.app.item = null;
            this._unassignItems();
        };
        ;
        CEP._unassignItems = function () {
            this.isLink = this.isScript = this.isStylesheet = this.isMenu = this.isDivider = false;
            this.linkItem = this.scriptItem = this.stylesheetItem = this.menuItem = this.dividerItem = {};
        };
        ;
        CEP._animateIn = function () {
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
        ;
        CEP.animateOut = function () {
            var _this = this;
            this._backdropEl.classList.remove('animateIn');
            this._backdropEl.classList.add('clickthrough');
            var animation = window.animateTransform(this.$.overlayCont, {
                propName: 'scale',
                postfix: '',
                from: 1,
                to: 0
            }, {
                duration: 500,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                fill: 'both'
            });
            animation.onfinish = function () {
                _this._onAnimationDone();
            };
            document.body.parentElement.style.overflow = 'auto';
        };
        ;
        CEP.updateName = function (value) {
            this.notifyPath('item.name', value);
        };
        ;
        CEP.showUpgradeNotice = function (hideUpdateMessage, node) {
            return !hideUpdateMessage && (node && node.type === 'script' && node.value && node.value.updateNotice);
        };
        ;
        CEP.getScriptUpdateStatus = function (node) {
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
        ;
        CEP.hideUpdateMergeDialog = function () {
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
                }).onfinish = function () {
                    _this.$.scriptUpdateNotice.style.marginBottom = marginBot;
                    _this.hideUpdateMessage = true;
                };
            }
            window.scriptEdit.newSettings.value.updateNotice = false;
        };
        ;
        CEP.showScriptUpdateDiff = function () {
            var _this = this;
            var oldScript = this.item.value.oldScript;
            var newScript = this.item.value.script;
            var chooseDialog = window.doc.externalEditorChooseFile;
            chooseDialog.init(oldScript, newScript, function (chosenScript) {
                if (window.app.storageLocal.upgradeErrors) {
                    delete window.app.storageLocal.upgradeErrors[_this.item.id];
                }
                var editor = window.scriptEdit.editorManager.editor;
                if (!window.scriptEdit.editorManager.isDiff(editor)) {
                    editor.setValue(chosenScript);
                }
                setTimeout(function () {
                    _this.hideUpdateMergeDialog();
                }, 250);
                browserAPI.storage.local.set({
                    upgradeErrors: window.app.storageLocal.upgradeErrors || {}
                });
            }, true, window.app.storageLocal.upgradeErrors && window.app.storageLocal.upgradeErrors[this.item.id]);
            window.externalEditor.showMergeDialog(oldScript, newScript);
            chooseDialog.open();
        };
        ;
        CEP.getInstallDate = function () {
            if (window.Intl && typeof window.Intl === 'object' && this.nodeInfo &&
                this.nodeInfo.installDate) {
                var format = (new Date(2016, 1, 13).toLocaleDateString() === '13-2-2016' ? 'eu' : 'na');
                var date = void 0;
                if (format === 'eu') {
                    date = this.nodeInfo.installDate.split('-');
                    date = date[1] + '-' + date[0] + '-' + date[2];
                }
                else {
                    date = this.nodeInfo.installDate;
                }
                date = new Date(date);
                return Math.floor(new Date(Date.now() - date.getMilliseconds()).getMilliseconds() / (1000 * 60 * 60 * 24)) + ' days ago';
            }
            return null;
        };
        ;
        CEP.ready = function () {
            var _this = this;
            $(this.$$('.popupCont')).click(function (e) {
                e.stopPropagation();
            });
            window.onExists('app').then(function () {
                _this._backdropEl = window.app.$$('.backdropCont');
                window.crmEditPage = _this;
                _this.isLink = _this.isMenu = _this.isScript = _this.isDivider = false;
                _this.$.nodeInfoVersion.addEventListener('input', function () {
                    _this.item.nodeInfo.version = _this.$.nodeInfoVersion.innerText.length > 0 ?
                        _this.$.nodeInfoVersion.innerText : '1.0';
                });
            });
        };
        ;
        CEP.init = function () {
            var _this = this;
            var valueStorer = {
                isScript: false,
                isLink: false,
                isDivider: false,
                isMenu: false,
                isStylesheet: false
            };
            this.hideUpdateMessage = false;
            this.scriptItem = this.linkItem = this.dividerItem = this.menuItem = this.stylesheetItem = {};
            var node = this.item;
            if ((valueStorer.isScript = node.type === 'script')) {
                this.scriptItem = node;
                valueStorer.isLink = valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
            }
            else if ((valueStorer.isLink = node.type === 'link')) {
                this.linkItem = node;
                valueStorer.isMenu = valueStorer.isDivider = valueStorer.isStylesheet = false;
            }
            else if ((valueStorer.isStylesheet = node.type === 'stylesheet')) {
                this.stylesheetItem = node;
                valueStorer.isMenu = valueStorer.isDivider = false;
            }
            else if ((valueStorer.isMenu = node.type === 'menu')) {
                this.menuItem = node;
                valueStorer.isDivider = false;
            }
            else {
                valueStorer.isDivider = true;
                this.dividerItem = node;
            }
            setTimeout(function () {
                window.app.show = true;
                _this.isScript = valueStorer.isScript;
                _this.isLink = valueStorer.isLink;
                _this.isMenu = valueStorer.isMenu;
                _this.isDivider = valueStorer.isDivider;
                _this.isStylesheet = valueStorer.isStylesheet;
                var page = _this.shadowRoot.querySelector('#editPageCont > :not([hidden])');
                page.init.apply(page);
                _this._animateIn();
            }, 300);
        };
        CEP.is = 'crm-edit-page';
        CEP.isLink = false;
        CEP.isScript = false;
        CEP.isDivider = false;
        CEP.isMenu = false;
        CEP.isStylesheet = false;
        CEP.linkItem = {};
        CEP.scriptItem = {};
        CEP.dividerItem = {};
        CEP.menuItem = {};
        CEP.stylesheetItem = {};
        CEP.properties = CrmEditPageElement.crmEditPageProperties;
        CEP.listeners = {
            "neon-animation-finish": '_onNeonAnimationFinish'
        };
        return CEP;
    }());
    CrmEditPageElement.CEP = CEP;
    if (window.objectify) {
        window.register(CEP);
    }
    else {
        window.addEventListener('RegisterReady', function () {
            window.register(CEP);
        });
    }
})(CrmEditPageElement || (CrmEditPageElement = {}));
